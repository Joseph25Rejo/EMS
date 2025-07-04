from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from pymongo import MongoClient, ASCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError, DuplicateKeyError
from bson import ObjectId
import pandas as pd
from datetime import datetime, timedelta
import json
from functools import wraps
import os
from dotenv import load_dotenv

from app import AdminSection, CSVManager

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# URL normalization to handle double slashes
@app.before_request
def normalize_url():
    """Remove multiple slashes from URL path"""
    if '//' in request.path:
        path = '/'.join(filter(None, request.path.split('/')))
        return redirect(f"{request.scheme}://{request.host}/{path}")

# MongoDB Atlas connection
try:
    # Get MongoDB Atlas connection string from environment variable
    MONGODB_URI = os.getenv('MONGODB_URI')
    if not MONGODB_URI:
        raise ValueError("MONGODB_URI environment variable is not set")

    # Configure MongoDB client with proper timeout and retry settings
    client = MongoClient(
        MONGODB_URI,
        serverSelectionTimeoutMS=5000,  # 5 second timeout
        connectTimeoutMS=10000,         # 10 second connection timeout
        socketTimeoutMS=45000,          # 45 second socket timeout
        maxPoolSize=50,                 # Maximum number of connections in the pool
        retryWrites=True,               # Enable retryable writes
        w='majority'                    # Write concern
    )
    
    # Test the connection
    client.admin.command('ping')
    print("✅ Successfully connected to MongoDB Atlas!")
    
    # Initialize database and collections
    db = client['exam-scheduling']
    collections = {
        'courses': db['courses'],
        'students': db['students'],
        'rooms': db['rooms'],
        'final_schedule': db['final_schedule'],
        'past_schedule': db['past_schedule']
    }
    
    # Create indexes for better performance
    collections['courses'].create_index('course_code', unique=True)
    collections['students'].create_index([('student_id', 1), ('course_code', 1)], unique=True)
    collections['rooms'].create_index('room_id', unique=True)
    collections['final_schedule'].create_index('created_at')
    collections['past_schedule'].create_index('created_at')
    
except (ConnectionFailure, ServerSelectionTimeoutError) as e:
    print(f"❌ Failed to connect to MongoDB Atlas: {e}")
    raise
except Exception as e:
    print(f"❌ Error initializing MongoDB connection: {e}")
    raise

# Error handling decorator
def handle_errors(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ConnectionFailure:
            return jsonify({'error': 'Database connection error'}), 503
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    return wrapper

# Helper functions
def convert_to_json_serializable(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj

def make_json_serializable(obj):
    if isinstance(obj, dict):
        return {k: make_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [make_json_serializable(v) for v in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, datetime):
        return obj.isoformat()
    elif obj != obj:  # Python's way of checking for NaN
        return None
    else:
        return obj

# Course endpoints
@app.route('/api/courses', methods=['GET'])
@handle_errors
def get_courses():
    courses = list(collections['courses'].find())
    return jsonify([{k: convert_to_json_serializable(v) for k, v in course.items()} for course in courses])

@app.route('/api/courses', methods=['POST'])
@handle_errors
def create_course():
    data = request.json
    required_fields = ['course_code', 'course_name']
    
    if not isinstance(data, dict) or not all(field in data and data[field] is not None for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if course code already exists
    if collections['courses'].find_one({'course_code': data['course_code']}):
        return jsonify({'error': 'Course code already exists'}), 409
    
    course_id = collections['courses'].insert_one(data).inserted_id
    return jsonify({'message': 'Course created successfully', 'id': str(course_id)}), 201

@app.route('/api/courses/<course_code>', methods=['PUT'])
@handle_errors
def update_course(course_code):
    data = request.json
    result = collections['courses'].update_one(
        {'course_code': course_code},
        {'$set': data}
    )
    
    if result.modified_count == 0:
        return jsonify({'error': 'Course not found'}), 404
    
    return jsonify({'message': 'Course updated successfully'})

# Student endpoints
@app.route('/api/students', methods=['GET'])
@handle_errors
def get_students():
    students = list(collections['students'].find())
    return jsonify([{k: convert_to_json_serializable(v) for k, v in student.items()} for student in students])

@app.route('/api/students/enroll', methods=['POST'])
@handle_errors
def enroll_student():
    data = request.json
    required_fields = ['student_id', 'name', 'course_code']
    
    if not isinstance(data, dict) or not all(field in data and data[field] is not None for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if course exists
    course = collections['courses'].find_one({'course_code': data['course_code']})
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    # Check if already enrolled
    if collections['students'].find_one({
        'student_id': data['student_id'],
        'course_code': data['course_code']
    }):
        return jsonify({'error': 'Student already enrolled in this course'}), 409
    
    # Ensure consistent name field
    enrollment_data = data.copy()
    enrollment_data['Name'] = data['name']  # Store as 'Name' for consistency
    del enrollment_data['name']  # Remove lowercase version
    
    enrollment_id = collections['students'].insert_one(enrollment_data).inserted_id
    return jsonify({'message': 'Enrollment successful', 'id': str(enrollment_id)}), 201

@app.route('/api/students/<student_id>/courses', methods=['GET'])
@handle_errors
def get_student_courses(student_id):
    enrollments = list(collections['students'].find({'student_id': student_id}))
    if not enrollments:
        return jsonify({'error': 'Student not found'}), 404
    
    courses = []
    for enrollment in enrollments:
        course = collections['courses'].find_one({'course_code': enrollment['course_code']})
        if course:
            courses.append({k: convert_to_json_serializable(v) for k, v in course.items()})
    
    return jsonify(courses)

@app.route('/api/students/<student_id>/courses/<course_code>', methods=['DELETE'])
@handle_errors
def delete_student_from_course(student_id, course_code):
    """Delete a student from a specific course"""
    # Check if the student is enrolled in the course
    enrollment = collections['students'].find_one({
        'student_id': student_id,
        'course_code': course_code
    })
    
    if not enrollment:
        return jsonify({'error': 'Student not enrolled in this course'}), 404
    
    # Delete the enrollment
    result = collections['students'].delete_one({
        'student_id': student_id,
        'course_code': course_code
    })
    
    if result.deleted_count == 0:
        return jsonify({'error': 'Failed to delete enrollment'}), 500
        
    return jsonify({'message': 'Student removed from course successfully'}), 200

# Room endpoints
@app.route('/api/rooms', methods=['GET'])
@handle_errors
def get_rooms():
    rooms = list(collections['rooms'].find())
    return jsonify([{k: convert_to_json_serializable(v) for k, v in room.items()} for room in rooms])

@app.route('/api/rooms', methods=['POST'])
@handle_errors
def create_room():
    data = request.json
    required_fields = ['room_id', 'room_name', 'capacity']
    
    if not isinstance(data, dict) or not all(field in data and data[field] is not None for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if collections['rooms'].find_one({'room_id': data['room_id']}):
        return jsonify({'error': 'Room ID already exists'}), 409
    
    room_id = collections['rooms'].insert_one(data).inserted_id
    return jsonify({'message': 'Room created successfully', 'id': str(room_id)}), 201

@app.route('/api/rooms/<room_id>', methods=['DELETE'])
@handle_errors
def delete_room(room_id):
    """Delete a room if it's not being used in any current schedules"""
    # Check if room exists
    room = collections['rooms'].find_one({'room_id': room_id})
    if not room:
        return jsonify({'error': 'Room not found'}), 404
    
    # Check if room is being used in current schedule
    latest_schedule = collections['final_schedule'].find_one(
        sort=[('created_at', -1)]
    )
    
    if latest_schedule and 'schedule' in latest_schedule:
        schedule = latest_schedule['schedule']
        if any(exam.get('room') == room['room_name'] for exam in schedule):
            return jsonify({
                'error': 'Cannot delete room as it is being used in the current exam schedule'
            }), 409
    
    # Delete the room
    result = collections['rooms'].delete_one({'room_id': room_id})
    
    if result.deleted_count == 0:
        return jsonify({'error': 'Failed to delete room'}), 500
        
    return jsonify({'message': 'Room deleted successfully'}), 200

# Schedule endpoints
@app.route('/api/schedules', methods=['GET'])
@handle_errors
def get_schedules():
    schedules = list(collections['final_schedule'].find())
    return jsonify([{k: convert_to_json_serializable(v) for k, v in schedule.items()} for schedule in schedules])

@app.route('/api/schedules/generate', methods=['POST'])
@handle_errors
def generate_schedule():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    algorithm = data.get('algorithm', 'graph_coloring')
    
    # Get all required data
    courses = list(collections['courses'].find())
    students = list(collections['students'].find())
    rooms = list(collections['rooms'].find())
    
    if not courses or not rooms:
        return jsonify({'error': 'Insufficient data for scheduling'}), 400
    
    # Convert MongoDB data to pandas DataFrames
    courses_df = pd.DataFrame(courses)
    students_df = pd.DataFrame(students)
    rooms_df = pd.DataFrame(rooms)
    
    # Import scheduling algorithms from the original system
    from app import AdminSection
    
    # Create a temporary CSV manager for the scheduling algorithms
    class TempCSVManager(CSVManager):
        def __init__(self):
            self.data = {
                'courses.csv': courses_df,
                'students.csv': students_df,
                'rooms.csv': rooms_df
            }
        
        def load_csv(self, filename):
            return self.data.get(filename, pd.DataFrame())
        
        def save_csv(self, df, filename):
            self.data[filename] = df
            return True
            
    admin = AdminSection(csv_manager=TempCSVManager())
    
    constraints = data.get('constraints', {})
    if 'start_date' in constraints and isinstance(constraints['start_date'], str):
        constraints['start_date'] = datetime.strptime(constraints['start_date'], "%Y-%m-%d").date()
    
    if algorithm == 'graph_coloring':
        schedule = admin._schedule_graph_coloring(courses_df, students_df, rooms_df, constraints)
    elif algorithm == 'simulated_annealing':
        schedule = admin._schedule_simulated_annealing(courses_df, students_df, rooms_df, constraints)
    elif algorithm == 'genetic':
        schedule = admin._schedule_genetic_algorithm(courses_df, students_df, rooms_df, constraints)
    else:
        return jsonify({'error': 'Invalid algorithm specified'}), 400
    
    # Move current schedule to past_schedule if it exists
    latest_schedule = collections['final_schedule'].find_one(
        sort=[('created_at', -1)]
    )
    
    if latest_schedule:
        # Append to past_schedule instead of clearing it
        collections['past_schedule'].insert_one({
            'algorithm': latest_schedule.get('algorithm'),
            'schedule': latest_schedule.get('schedule'),
            'created_at': latest_schedule.get('created_at'),
            'archived_at': datetime.utcnow()
        })
    
    # Save new schedule
    schedule_id = collections['final_schedule'].insert_one({
        'algorithm': algorithm,
        'schedule': schedule,
        'created_at': datetime.utcnow()
    }).inserted_id
    
    return jsonify({
        'message': 'Schedule generated successfully',
        'id': str(schedule_id),
        'schedule': schedule
    }), 201

@app.route('/api/schedules/conflicts', methods=['GET'])
@handle_errors
def get_conflicts():
    students = list(collections['students'].find())
    if not students:
        return jsonify({'conflicts': []})
    
    # Convert to DataFrame for conflict detection
    students_df = pd.DataFrame(students)
    
    # Import conflict detection from original system
    from app import AdminSection
    
    # Create temporary CSV manager
    class ConflictCSVManager:
        def __init__(self):
            self.data = {'students.csv': students_df}
            
        def load_csv(self, filename):
            return self.data.get(filename, pd.DataFrame())
            return self.data.get(filename, pd.DataFrame())
    
    # Detect conflicts
    class TempCSVManager(CSVManager):
        def load_csv(self, filename):
            if filename == 'students.csv':
                return students_df
            return pd.DataFrame()
            
    admin = AdminSection(csv_manager=TempCSVManager())
    conflicts = admin.detect_conflicts()
    
    return jsonify({'conflicts': conflicts})

# Statistics endpoint
@app.route('/api/statistics', methods=['GET'])
@handle_errors
def get_statistics():
    courses_count = collections['courses'].count_documents({})
    students_count = len(collections['students'].distinct('student_id'))
    rooms_count = collections['rooms'].count_documents({})
    enrollments_count = collections['students'].count_documents({})
    schedules_count = collections['final_schedule'].count_documents({})
    
    # Get most popular course
    pipeline = [
        {'$group': {'_id': '$course_code', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}},
        {'$limit': 1}
    ]
    popular_course = list(collections['students'].aggregate(pipeline))
    
    stats = {
        'courses': courses_count,
        'students': students_count,
        'rooms': rooms_count,
        'enrollments': enrollments_count,
        'schedules': schedules_count,
        'most_popular_course': popular_course[0] if popular_course else None
    }
    
    return jsonify(stats)

@app.route('/api/students/<student_id>/hallticket', methods=['GET'])
@handle_errors
def get_student_hallticket(student_id):
    # First get the student's enrolled courses
    students = list(collections['students'].find({'student_id': student_id}))
    if not students:
        return jsonify([])

    # Get enrolled course codes
    enrolled_courses = [s['course_code'] for s in students]
    
    # Get the latest schedule
    latest_schedule = collections['final_schedule'].find_one(
        sort=[('created_at', -1)]  # Get the most recent schedule
    )
    
    if not latest_schedule or 'schedule' not in latest_schedule:
        return jsonify([])
    
    # Extract exam schedule for enrolled courses
    schedule = latest_schedule['schedule']
    if not isinstance(schedule, list):
        return jsonify([])
        
    hallticket = []
    for exam in schedule:
        if isinstance(exam, dict) and exam.get('course_code') in enrolled_courses:
            hallticket.append({
                'course_code': exam.get('course_code', ''),
                'course_name': exam.get('course_name', ''),
                'date': exam.get('date', ''),
                'room': exam.get('room', ''),
                'session': exam.get('session', '')
            })
    
    return jsonify(hallticket)

@app.route('/api/teachers/<teacher_name>/invigilations', methods=['GET'])
@handle_errors
def get_teacher_invigilations(teacher_name):
    exams = list(collections['final_schedule'].find())
    # Case-insensitive match for instructor
    invigilations = [
        exam for exam in exams
        if str(exam.get('instructor', '')).strip().lower() == teacher_name.strip().lower()
    ]
    
    # For each invigilation, find partner teachers (teachers with same date, session, and room)
    for invigilation in invigilations:
        # Find all exams on the same date, session and room
        partner_exams = list(collections['final_schedule'].find({
            'date': invigilation['date'],
            'session': invigilation['session'],
            'room': invigilation['room'],
            'instructor': {'$ne': teacher_name}  # Exclude the current teacher
        }))
        
        # Get partner teachers and their students
        partners = []
        for exam in partner_exams:
            # Get students for this exam
            students = list(collections['students'].find({'course_code': exam['course_code']}))
            partners.append({
                'instructor': exam['instructor'],
                'course_code': exam['course_code'],
                'course_name': exam['course_name'],
                'students': [student['student_id'] for student in students]
            })
        
        invigilation['partner_teachers'] = partners
    
    return jsonify(make_json_serializable(invigilations))

@app.route('/api/schedules', methods=['GET'])
@handle_errors
def get_exam_schedule():
    course_code = request.args.get('course_code')
    room = request.args.get('room')
    date = request.args.get('date')
    schedules = list(collections['final_schedule'].find().sort('created_at', -1))
    if not schedules:
        return jsonify({'error': 'No exam schedule available'}), 404
    schedule = schedules[0]['schedule']
    # Apply filters if present
    if course_code:
        schedule = [exam for exam in schedule if exam['course_code'] == course_code]
    if room:
        schedule = [exam for exam in schedule if exam['room'] == room]
    if date:
        schedule = [exam for exam in schedule if exam['date'] == date]
    return jsonify(schedule)

@app.route('/api/schedules/<course_code>/benches', methods=['GET'])
@handle_errors
def get_bench_assignments(course_code):
    exams = list(collections['final_schedule'].find({'course_code': course_code}))
    if not exams:
        return jsonify({'error': 'Course not found in schedule'}), 404
    # There should be only one exam per course_code
    exam = exams[0]
    benches = exam.get('benches', [])
    # If benches is not JSON serializable, convert it
    from bson import ObjectId
    def make_json_serializable(obj):
        if isinstance(obj, dict):
            return {k: make_json_serializable(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [make_json_serializable(v) for v in obj]
        elif isinstance(obj, ObjectId):
            return str(obj)
        else:
            return obj
    return jsonify({'benches': make_json_serializable(benches)})

@app.route('/api/login', methods=['POST'])
@handle_errors
def login():
    data = request.json
    if not data:
        return jsonify({'error': 'Missing JSON body'}), 400
    role = data.get('role')
    usn = data.get('USN') or data.get('UserID')
    password = data.get('Password')
    if not role or not usn or not password:
        return jsonify({'error': 'Missing role, USN/UserID, or password'}), 400
    
    try:
        # Use existing db connection
        auth_db = client['auth']
        
        if role == 'student':
            collection = auth_db['studentauth']
            user = collection.find_one({'USN': usn, 'Password': password})
            if user:
                user_data = {
                    'USN': user['USN'],
                    'name': user.get('Name') or user.get('name') or user['USN'],
                    'role': 'student'
                }
                return jsonify({'message': 'Login successful', 'user': make_json_serializable(user_data)})
            else:
                return jsonify({'error': 'Invalid USN/UserID or password'}), 401
                
        elif role == 'teacher':
            collection = auth_db['teacher_auth']
            user = collection.find_one({'USN': usn, 'Password': password})
            if user:
                user_data = {
                    'USN': user['USN'],
                    'name': user.get('Name', user['USN']),
                    'role': 'teacher'
                }
                return jsonify({'message': 'Login successful', 'user': make_json_serializable(user_data)})
            else:
                return jsonify({'error': 'Invalid USN/UserID or password'}), 401
                
        elif role == 'admin':
            collection = auth_db['adminauth']
            user = collection.find_one({'UserID': usn, 'Password': password})
            if user:
                user_data = {
                    'USN': user['UserID'],
                    'name': user.get('name', user['UserID']),
                    'role': 'admin'
                }
                return jsonify({'message': 'Login successful', 'user': make_json_serializable(user_data)})
            else:
                return jsonify({'error': 'Invalid USN/UserID or password'}), 401
        else:
            return jsonify({'error': 'Invalid role'}), 400
    except Exception as e:
        print(f"Login error: {str(e)}")  # Log the error
        return jsonify({'error': 'Authentication service unavailable'}), 500

# Teacher endpoints
@app.route('/api/teachers/<teacher_id>/courses', methods=['GET'])
@handle_errors
def get_teacher_courses(teacher_id):
    """Get all courses taught by a specific teacher"""
    # Try to find courses by either USN or full name
    courses = list(collections['courses'].find({
        '$or': [
            {'instructor': teacher_id},  # Match by USN
            {'instructor': {'$regex': f'^{teacher_id}$', '$options': 'i'}}  # Case-insensitive match by name
        ]
    }))
    if not courses:
        return jsonify([])
    return jsonify([make_json_serializable(course) for course in courses])

@app.route('/api/teachers/courses/<course_code>/assign', methods=['POST'])
@handle_errors
def assign_teacher_to_course(course_code):
    """Assign a teacher to an existing course"""
    data = request.json
    if not data or 'teacher_id' not in data:
        return jsonify({'error': 'Teacher ID is required'}), 400

    # Check if course exists
    course = collections['courses'].find_one({'course_code': course_code})
    if not course:
        return jsonify({'error': 'Course not found'}), 404

    # Update course with new teacher
    result = collections['courses'].update_one(
        {'course_code': course_code},
        {'$set': {'instructor': data['teacher_id']}}
    )

    if result.modified_count == 0:
        return jsonify({'error': 'Failed to assign teacher to course'}), 500

    return jsonify({'message': 'Teacher assigned successfully'})

@app.route('/api/teachers/courses', methods=['POST'])
@handle_errors
def create_teacher_course():
    """Create a new course with teacher assignment"""
    data = request.json
    required_fields = ['course_code', 'course_name', 'instructor', 'expected_students']
    
    if not isinstance(data, dict) or not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Validate data types
    try:
        data['expected_students'] = int(data['expected_students'])
        if data['expected_students'] <= 0:
            raise ValueError("Expected students must be positive")
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

    # Check if course code already exists
    if collections['courses'].find_one({'course_code': data['course_code']}):
        return jsonify({'error': 'Course code already exists'}), 409
    
    # Insert the new course
    course_id = collections['courses'].insert_one(data).inserted_id
    return jsonify({
        'message': 'Course created successfully',
        'id': str(course_id),
        'course': make_json_serializable(data)
    }), 201

@app.route('/api/teachers/<teacher_id>/invigilations/upcoming', methods=['GET'])
@handle_errors
def get_teacher_upcoming_invigilations(teacher_id):
    """Get upcoming invigilation duties for a teacher from final_schedule"""
    print(f"\nDEBUG: Searching for upcoming invigilations for {teacher_id}")
    
    current_date = datetime.now().strftime('%Y-%m-%d')
    print(f"\nDEBUG: Current date: {current_date}")
    
    # Get all documents from final_schedule
    all_final_schedule = list(collections['final_schedule'].find())
    print(f"\nDEBUG: All documents in final_schedule:")
    for doc in all_final_schedule:
        print(f"Document created at: {doc.get('created_at')}")
        schedule = doc.get('schedule', [])
        if isinstance(schedule, list):
            for exam in schedule:
                if isinstance(exam, dict):
                    print(f"Exam: {exam.get('date')} - {exam.get('instructor')} - {exam.get('course_code')}")
    
    # Get invigilations from final_schedule only
    invigilations = []
    for doc in all_final_schedule:
        schedule = doc.get('schedule', [])
        if isinstance(schedule, list):
            for exam in schedule:
                if isinstance(exam, dict):
                    instructor = str(exam.get('instructor', '')).strip()
                    exam_date = exam.get('date')
                    if instructor.lower() == teacher_id.strip().lower():
                        # Only include exams with valid dates that are in the future
                        if exam_date and exam_date >= current_date:
                            invigilations.append(exam)

    print(f"\nDEBUG: Found {len(invigilations)} upcoming invigilations in final_schedule")
    
    # Add partner teachers
    for invigilation in invigilations:
        # Find partner teachers from final_schedule only
        partner_exams = []
        for doc in all_final_schedule:
            schedule = doc.get('schedule', [])
            if isinstance(schedule, list):
                for exam in schedule:
                    if (isinstance(exam, dict) and
                        exam.get('date') == invigilation['date'] and
                        exam.get('session') == invigilation['session'] and
                        exam.get('room') == invigilation['room'] and
                        str(exam.get('instructor', '')).strip().lower() != teacher_id.strip().lower()):
                        partner_exams.append(exam)
        
        # Get partner teachers and their students
        partners = []
        for exam in partner_exams:
            # Get students for this exam
            students = list(collections['students'].find({'course_code': exam['course_code']}))
            partners.append({
                'instructor': exam['instructor'],
                'course_code': exam['course_code'],
                'course_name': exam['course_name'],
                'students': [student['student_id'] for student in students]
            })
        
        invigilation['partner_teachers'] = partners

    # Sort by date
    invigilations.sort(key=lambda x: x.get('date', ''))
    return jsonify([make_json_serializable(duty) for duty in invigilations])

@app.route('/api/teachers/<teacher_id>/invigilations/history', methods=['GET'])
@handle_errors
def get_teacher_invigilation_history(teacher_id):
    """Get past invigilation duties for a teacher from both collections"""
    print(f"\nDEBUG: Searching for past invigilations for {teacher_id}")
    
    current_date = datetime.now().strftime('%Y-%m-%d')
    print(f"\nDEBUG: Current date: {current_date}")
    
    past_invigilations = []
    
    # First get past invigilations from final_schedule (older than current date)
    all_final_schedule = list(collections['final_schedule'].find())
    print(f"\nDEBUG: Checking final_schedule for past invigilations")
    for doc in all_final_schedule:
        schedule = doc.get('schedule', [])
        if isinstance(schedule, list):
            for exam in schedule:
                if isinstance(exam, dict):
                    instructor = str(exam.get('instructor', '')).strip()
                    exam_date = exam.get('date')
                    if instructor.lower() == teacher_id.strip().lower():
                        # Include exams with valid dates that are in the past
                        if exam_date and exam_date < current_date:
                            exam_copy = exam.copy()
                            exam_copy['source'] = 'final_schedule'
                            exam_copy['created_at'] = doc.get('created_at')
                            past_invigilations.append(exam_copy)
    
    # Then get all invigilations from past_schedule
    all_past_schedule = list(collections['past_schedule'].find())
    print(f"\nDEBUG: Checking past_schedule")
    for doc in all_past_schedule:
        schedule = doc.get('schedule', [])
        if isinstance(schedule, list):
            for exam in schedule:
                if isinstance(exam, dict):
                    instructor = str(exam.get('instructor', '')).strip()
                    exam_date = exam.get('date')
                    if instructor.lower() == teacher_id.strip().lower():
                        # Include all exams with valid dates from past_schedule
                        if exam_date:
                            exam_copy = exam.copy()
                            exam_copy['source'] = 'past_schedule'
                            exam_copy['archived_at'] = doc.get('archived_at')
                            exam_copy['original_created_at'] = doc.get('created_at')
                            past_invigilations.append(exam_copy)

    print(f"\nDEBUG: Found total {len(past_invigilations)} past invigilations")
    
    # Add partner teachers
    for invigilation in past_invigilations:
        partner_exams = []
        # Check both collections for partner teachers
        all_docs = all_final_schedule + all_past_schedule
        for doc in all_docs:
            schedule = doc.get('schedule', [])
            if isinstance(schedule, list):
                for exam in schedule:
                    if (isinstance(exam, dict) and
                        exam.get('date') == invigilation['date'] and
                        exam.get('session') == invigilation['session'] and
                        exam.get('room') == invigilation['room'] and
                        str(exam.get('instructor', '')).strip().lower() != teacher_id.strip().lower()):
                        partner_exams.append(exam)
        
        # Get partner teachers and their students
        partners = []
        for exam in partner_exams:
            # Get students for this exam
            students = list(collections['students'].find({'course_code': exam['course_code']}))
            partners.append({
                'instructor': exam['instructor'],
                'course_code': exam['course_code'],
                'course_name': exam['course_name'],
                'students': [student['student_id'] for student in students]
            })
        
        invigilation['partner_teachers'] = partners

    # Sort by date descending (most recent first)
    past_invigilations.sort(key=lambda x: x.get('date', ''), reverse=True)
    return jsonify([make_json_serializable(duty) for duty in past_invigilations])

@app.route('/api/teachers/courses/<course_code>', methods=['GET'])
@handle_errors
def get_course_details(course_code):
    """Get detailed information about a specific course"""
    course = collections['courses'].find_one({'course_code': course_code})
    if not course:
        return jsonify({'error': 'Course not found'}), 404

    # Get additional statistics
    enrolled_students = collections['students'].count_documents({'course_code': course_code})
    
    # Get exam schedule if exists
    exam_schedule = collections['final_schedule'].find_one({'course_code': course_code})
    
    # Convert MongoDB document to dictionary and add additional fields
    base_details = make_json_serializable(course)
    if not isinstance(base_details, dict):
        base_details = {}
    base_details.update({
        'enrolled_students': enrolled_students,
        'exam_schedule': make_json_serializable(exam_schedule) if exam_schedule else None
    })

    return jsonify(base_details)

@app.route('/api/teachers/courses/<course_code>', methods=['PUT'])
@handle_errors
def update_course_details(course_code):
    """Update course information"""
    data = request.json
    if not data:
        return jsonify({'error': 'No update data provided'}), 400

    # Validate expected_students if provided
    if 'expected_students' in data:
        try:
            data['expected_students'] = int(data['expected_students'])
            if data['expected_students'] <= 0:
                raise ValueError
        except ValueError:
            return jsonify({'error': 'Expected students must be a positive number'}), 400

    # Update the course
    result = collections['courses'].update_one(
        {'course_code': course_code},
        {'$set': data}
    )

    if result.matched_count == 0:
        return jsonify({'error': 'Course not found'}), 404

    if result.modified_count == 0:
        return jsonify({'message': 'No changes made to the course'})

    # Get updated course details
    updated_course = collections['courses'].find_one({'course_code': course_code})
    return jsonify({
        'message': 'Course updated successfully',
        'course': make_json_serializable(updated_course)
    })

@app.route('/api/schedules/generate/selected', methods=['POST'])
@handle_errors
def generate_selected_schedule():
    """Generate a schedule for manually selected courses"""
    data = request.json
    if not data or 'course_codes' not in data:
        return jsonify({'error': 'No course codes provided'}), 400
    
    course_codes = data.get('course_codes', [])
    algorithm = data.get('algorithm', 'graph_coloring')
    
    # Get selected courses
    courses = list(collections['courses'].find({'course_code': {'$in': course_codes}}))
    if not courses:
        return jsonify({'error': 'No valid courses found'}), 400
    
    # Get students enrolled in selected courses
    students = list(collections['students'].find({'course_code': {'$in': course_codes}}))
    
    # Get all rooms
    rooms = list(collections['rooms'].find())
    if not rooms:
        return jsonify({'error': 'No rooms available for scheduling'}), 400
    
    # Convert to DataFrames
    courses_df = pd.DataFrame(courses)
    students_df = pd.DataFrame(students)
    rooms_df = pd.DataFrame(rooms)
    
    # Create temporary CSV manager
    class TempCSVManager(CSVManager):
        def __init__(self):
            self.data = {
                'courses.csv': courses_df,
                'students.csv': students_df,
                'rooms.csv': rooms_df
            }
        
        def load_csv(self, filename):
            return self.data.get(filename, pd.DataFrame())
        
        def save_csv(self, df, filename):
            self.data[filename] = df
            return True
    
    admin = AdminSection(csv_manager=TempCSVManager())
    
    constraints = data.get('constraints', {})
    if 'start_date' in constraints and isinstance(constraints['start_date'], str):
        constraints['start_date'] = datetime.strptime(constraints['start_date'], "%Y-%m-%d").date()
    
    # Generate schedule using selected algorithm
    if algorithm == 'graph_coloring':
        schedule = admin._schedule_graph_coloring(courses_df, students_df, rooms_df, constraints)
    elif algorithm == 'simulated_annealing':
        schedule = admin._schedule_simulated_annealing(courses_df, students_df, rooms_df, constraints)
    elif algorithm == 'genetic':
        schedule = admin._schedule_genetic_algorithm(courses_df, students_df, rooms_df, constraints)
    else:
        return jsonify({'error': 'Invalid algorithm specified'}), 400
    
    # Move current schedule to past_schedule if it exists
    latest_schedule = collections['final_schedule'].find_one(
        sort=[('created_at', -1)]
    )
    
    if latest_schedule:
        # Append to past_schedule instead of clearing it
        collections['past_schedule'].insert_one({
            'algorithm': latest_schedule.get('algorithm'),
            'schedule': latest_schedule.get('schedule'),
            'created_at': latest_schedule.get('created_at'),
            'archived_at': datetime.utcnow()
        })
    
    # Save new schedule
    schedule_id = collections['final_schedule'].insert_one({
        'algorithm': algorithm,
        'schedule': schedule,
        'created_at': datetime.utcnow(),
        'selected_courses': course_codes
    }).inserted_id
    
    return jsonify({
        'message': 'Schedule generated successfully',
        'id': str(schedule_id),
        'schedule': schedule
    }), 201

@app.route('/api/schedules/past', methods=['GET'])
@handle_errors
def get_past_schedule():
    """Get the previous exam schedule that was archived"""
    past_schedule = collections['past_schedule'].find_one(
        sort=[('archived_at', -1)]
    )
    
    if not past_schedule:
        return jsonify({'error': 'No past schedule available'}), 404
    
    return jsonify({
        'algorithm': past_schedule.get('algorithm'),
        'schedule': past_schedule.get('schedule'),
        'created_at': past_schedule.get('created_at'),
        'archived_at': past_schedule.get('archived_at')
    })

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.getenv('PORT', 5000))
    
    # Get environment mode
    env = os.getenv('FLASK_ENV', 'production')
    
    # Configure host and debug based on environment
    if env == 'development':
        app.run(host='0.0.0.0', port=port, debug=True)
    else:
        # Production settings
        app.run(host='0.0.0.0', port=port, debug=False) 