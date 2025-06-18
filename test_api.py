import requests
import json

# Base URL for the API
BASE_URL = 'http://localhost:5000/api'

def test_courses():
    # Create multiple courses
    courses = [
        {
            'course_code': 'CS241AT',
            'course_name': 'Discrete Mathematics',
            'instructor': 'Dr. Suma M',
            'expected_students': 45
        },
        {
            'course_code': 'CS241BT',
            'course_name': 'Data Structures',
            'instructor': 'Prof. Rajesh ',
            'expected_students': 40
        },
        {
            'course_code': 'CS241CT',
            'course_name': 'Computer Networks',
            'instructor': 'Dr. Vishwavardhan Reddy',
            'expected_students': 35
        }
    ]
    
    for course in courses:
        response = requests.post(f'{BASE_URL}/courses', json=course)
        print(f'Create Course {course["course_code"]} Response:', response.json())
    
    # Get all courses
    response = requests.get(f'{BASE_URL}/courses')
    print('Get Courses Response:', response.json())

def test_rooms():
    # Create multiple rooms
    rooms = [
        {
            'room_id': 'AIML403',
            'room_name': 'Exam-Room-1',
            'capacity': 60
        },
        {
            'room_id': 'AIML404',
            'room_name': 'Exam-Room-2',
            'capacity': 45
        },
        {
            'room_id': 'AIML405',
            'room_name': 'Exam-Room-3',
            'capacity': 60
        }
    ]
    
    for room in rooms:
        response = requests.post(f'{BASE_URL}/rooms', json=room)
        print(f'Create Room {room["room_id"]} Response:', response.json())
    
    # Get all rooms
    response = requests.get(f'{BASE_URL}/rooms')
    print('Get Rooms Response:', response.json())

def test_students():
    # Enroll multiple students
    enrollments = [
        {
            'student_id': '1RV23AI040',
            'name': 'Joseph Rejo Mathew',
            'course_code': 'CS241AT'
        },
        {
            'student_id': '1RV23AI040',
            'name': 'Joseph Rejo Mathew',
            'course_code': 'CS241BT'
        },
        {
            'student_id': '1RV23AI058',
            'name': 'Monil Palak Mehta',
            'course_code': 'CS241AT'
        },
        {
            'student_id': '1RV23AI059',
            'name': 'Mowin S',
            'course_code': 'CS241CT'
        }
    ]
    
    for enrollment in enrollments:
        response = requests.post(f'{BASE_URL}/students/enroll', json=enrollment)
        print(f'Enroll Student {enrollment["student_id"]} in {enrollment["course_code"]} Response:', response.json())
    
    # Get student's courses
    response = requests.get(f'{BASE_URL}/students/1RV23AI040/courses')
    print('Get Student Courses Response:', response.json())

def test_scheduling():
    # Generate a schedule
    schedule_data = {
        'algorithm': 'graph_coloring'
    }
    
    response = requests.post(f'{BASE_URL}/schedules/generate', json=schedule_data)
    print('Generate Schedule Response:', response.json())
    
    # Get all schedules
    response = requests.get(f'{BASE_URL}/schedules')
    print('Get Schedules Response:', response.json())

def test_statistics():
    # Get statistics
    response = requests.get(f'{BASE_URL}/statistics')
    print('Get Statistics Response:', response.json())

def main():
    print("\n=== Testing Courses ===")
    test_courses()
    
    print("\n=== Testing Rooms ===")
    test_rooms()
    
    print("\n=== Testing Students ===")
    test_students()
    
    print("\n=== Testing Scheduling ===")
    test_scheduling()
    
    print("\n=== Testing Statistics ===")
    test_statistics()

if __name__ == '__main__':
    main()