from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from bson import ObjectId
import pandas as pd
from datetime import datetime
import json
from functools import wraps
import os
from dotenv import load_dotenv

from app import CSVManager

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

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
        'final_schedule': db['final_schedule']
    }
    
    # Create indexes for better performance
    collections['courses'].create_index('course_code', unique=True)
    collections['students'].create_index([('student_id', 1), ('course_code', 1)], unique=True)
    collections['rooms'].create_index('room_id', unique=True)
    collections['final_schedule'].create_index('created_at')
    
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
    
    enrollment_id = collections['students'].insert_one(data).inserted_id
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
    class SchedulingCSVManager(CSVManager):
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
    
    # Generate schedule
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
    
    # Save schedule to MongoDB
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
    # Connect to auth db
    auth_client = MongoClient(os.getenv('MONGODB_URI'))
    auth_db = auth_client['auth']
    if role == 'student':
        collection = auth_db['studentauth']
        user = collection.find_one({'USN': usn, 'Password': password})
        if user:
            user['student_id'] = user['USN']
            user.pop('password', None)
            return jsonify({'message': 'Login successful', 'user': make_json_serializable(user)})
        else:
            return jsonify({'error': 'Invalid USN/UserID or password'}), 401
    elif role == 'teacher':
        collection = auth_db['teacher_auth']
        user = collection.find_one({'USN': usn, 'Password': password})
        if user:
            user.pop('password', None)
            return jsonify({'message': 'Login successful', 'user': make_json_serializable(user)})
        else:
            return jsonify({'error': 'Invalid USN/UserID or password'}), 401
    elif role == 'admin':
        collection = auth_db['adminauth']
        user = collection.find_one({'UserID': usn, 'Password': password})
        if user:
            user.pop('password', None)
            return jsonify({'message': 'Login successful', 'user': make_json_serializable(user)})
        else:
            return jsonify({'error': 'Invalid USN/UserID or password'}), 401
    else:
        return jsonify({'error': 'Invalid role'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000) 