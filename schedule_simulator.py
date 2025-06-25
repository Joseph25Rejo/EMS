import pandas as pd
from datetime import datetime, timedelta
import json

def load_data():
    """Load the sample data from CSV files"""
    students_df = pd.read_csv('sample_students.csv')
    courses_df = pd.read_csv('sample_courses.csv')
    rooms_df = pd.read_csv('sample_rooms.csv')
    return students_df, courses_df, rooms_df

def get_course_conflicts(students_df):
    """Find which courses have common students"""
    conflicts = {}
    for course in students_df['course_code'].unique():
        conflicts[course] = []
        course_students = set(students_df[students_df['course_code'] == course]['student_id'])
        for other_course in students_df['course_code'].unique():
            if course != other_course:
                other_students = set(students_df[students_df['course_code'] == other_course]['student_id'])
                if course_students.intersection(other_students):
                    conflicts[course].append(other_course)
    return conflicts

def create_schedule(students_df, courses_df, rooms_df):
    """Create an exam schedule based on constraints"""
    dates = ['2025-07-10', '2025-07-11']
    sessions = ['Morning', 'Evening']
    
    # Initialize schedule
    schedule = {}
    for date in dates:
        schedule[date] = {'Morning': {'Room A': None}, 'Evening': {'Room A': None}}
    
    # Get course conflicts
    conflicts = get_course_conflicts(students_df)
    
    # Simple scheduling algorithm
    scheduled_courses = []
    courses = list(courses_df['course_code'])
    
    for course in courses:
        # Find first available slot
        for date in dates:
            for session in sessions:
                # Check if slot is empty and no conflicts
                if schedule[date][session]['Room A'] is None:
                    # Check if any conflicting course is scheduled in same day
                    conflict_found = False
                    for conflict_course in conflicts[course]:
                        for s in sessions:
                            if schedule[date][s]['Room A'] == conflict_course:
                                conflict_found = True
                                break
                    
                    if not conflict_found:
                        schedule[date][session]['Room A'] = course
                        scheduled_courses.append(course)
                        break
            if course in scheduled_courses:
                break
    
    return schedule

def print_schedule(schedule, courses_df, students_df):
    """Print the schedule in a readable format"""
    print("\n=== EXAM SCHEDULE SIMULATION ===\n")
    
    for date, sessions in schedule.items():
        print(f"\nDate: {date}")
        for session, rooms in sessions.items():
            for room, course in rooms.items():
                if course:
                    course_info = courses_df[courses_df['course_code'] == course].iloc[0]
                    students = students_df[students_df['course_code'] == course]['student_id'].unique()
                    print(f"\n{session} - {room}")
                    print(f"Course: {course} - {course_info['course_name']}")
                    print(f"Instructor: {course_info['instructor']}")
                    print(f"Students: {len(students)}")
                    print("Student IDs:", ", ".join(students))

def main():
    # Load data
    students_df, courses_df, rooms_df = load_data()
    
    # Create schedule
    schedule = create_schedule(students_df, courses_df, rooms_df)
    
    # Print schedule
    print_schedule(schedule, courses_df, students_df)
    
    # Save schedule to file
    with open('sample_schedule.json', 'w') as f:
        json.dump(schedule, f, indent=2)

if __name__ == "__main__":
    main() 