import pandas as pd
import networkx as nx
import random
import os
import json
from collections import defaultdict
from typing import Dict, List, Set, Optional
from datetime import datetime, timedelta
import math
try:
    from ortools.sat.python import cp_model
    ORTOOLS_AVAILABLE = True
except ImportError:
    ORTOOLS_AVAILABLE = False

class CSVManager:
    """Handles all CSV file operations"""
    def __init__(self, data_dir="data/"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
        self.init_csv_files()
    def init_csv_files(self):
        csv_files = {
            'courses.csv': ['course_code', 'course_name', 'instructor', 'expected_students'],
            'students.csv': ['student_id', 'name', 'course_code'],
            'rooms.csv': ['room_id', 'room_name', 'capacity'],
            'final_schedule.csv': ['course_code', 'course_name', 'instructor', 'date', 'room', 'enrolled_students']
        }
        for filename, columns in csv_files.items():
            filepath = os.path.join(self.data_dir, filename)
            if not os.path.exists(filepath):
                df = pd.DataFrame(columns=pd.Index(columns))
                df.to_csv(filepath, index=False)
                print(f"📄 Created {filename}")
    def load_csv(self, filename):
        try:
            filepath = os.path.join(self.data_dir, filename)
            return pd.read_csv(filepath)
        except Exception as e:
            print(f"❌ Error loading {filename}: {e}")
            return pd.DataFrame()
    def save_csv(self, df, filename):
        try:
            filepath = os.path.join(self.data_dir, filename)
            df.to_csv(filepath, index=False)
            return True
        except Exception as e:
            print(f"❌ Error saving {filename}: {e}")
            return False

class StudentSection:
    """Handles student-related operations"""
    def __init__(self, csv_manager: CSVManager):
        self.csv_manager = csv_manager

    def student_menu(self):
        print("\n🎓 STUDENT SECTION")
        print("=" * 40)
        while True:
            print("\n📚 Student Options:")
            print("1. View Available Courses")
            print("2. Enroll in Courses")
            print("3. View My Enrollments")
            print("4. View My Hallticket")
            print("5. Back to Main Menu")
            choice = input("\nEnter your choice (1-5): ").strip()
            if choice == '1':
                self.view_available_courses()
            elif choice == '2':
                self.enroll_in_courses()
            elif choice == '3':
                self.view_my_enrollments()
            elif choice == '4':
                self.view_my_hallticket()
            elif choice == '5':
                break
            else:
                print("❌ Invalid choice. Please try again.")

    def view_available_courses(self):
        courses_df = self.csv_manager.load_csv('courses.csv')
        if courses_df.empty:
            print("📋 No courses available yet.")
            return
        print("\n📋 AVAILABLE COURSES:")
        print("-" * 80)
        print(f"{'Code':<10} {'Course Name':<30} {'Instructor':<20} {'Expected Students':<15}")
        print("-" * 80)
        for _, course in courses_df.iterrows():
            instructor = course['instructor']
            if isinstance(instructor, pd.Series):
                instructor = instructor.iloc[0]
            elif isinstance(instructor, (list, tuple, set)):
                instructor = list(instructor)[0]
            if pd.isna(instructor) or instructor == "":
                instructor = "TBA"
            expected = course['expected_students']
            if isinstance(expected, pd.Series):
                expected = expected.iloc[0]
            elif isinstance(expected, (list, tuple, set)):
                expected = list(expected)[0]
            if pd.isna(expected) or expected == "":
                expected = "TBA"
            print(f"{course['course_code']:<10} {course['course_name']:<30} {instructor:<20} {expected:<15}")
        print("-" * 80)
        print(f"Total courses: {len(courses_df)}")

    def enroll_in_courses(self):
        courses_df = self.csv_manager.load_csv('courses.csv')
        students_df = self.csv_manager.load_csv('students.csv')
        if courses_df.empty:
            print("❌ No courses available for enrollment.")
            return
        student_id = input("\n🆔 Enter your Student ID: ").strip()
        student_name = input("📝 Enter your Full Name: ").strip()
        if not student_id or not student_name:
            print("❌ Student ID and Name are required.")
            return
        self.view_available_courses()
        print(f"\n🎯 Hi {student_name}! Enter course codes you want to enroll in.")
        print("💡 Enter codes separated by commas (e.g., CS101,MATH201,PHYS301)")
        print("📋 Or enter them one by one (press Enter with empty input to finish)")
        course_codes = set()
        bulk_input = input("\nEnter course codes (comma-separated) or press Enter for one-by-one: ").strip()
        if bulk_input:
            course_codes.update([code.strip().upper() for code in bulk_input.split(',')])
        else:
            print("\nEnter course codes one by one:")
            while True:
                code = input("Course code (or press Enter to finish): ").strip().upper()
                if not code:
                    break
                course_codes.add(code)
        if not course_codes:
            print("❌ No course codes entered.")
            return
        valid_codes = set(courses_df['course_code'].str.upper().tolist())
        invalid_codes = course_codes - valid_codes
        valid_enrollments = course_codes & valid_codes
        if invalid_codes:
            print(f"⚠️  Invalid course codes: {', '.join(invalid_codes)}")
        if not valid_enrollments:
            print("❌ No valid course codes to enroll in.")
            return
        existing_enrollments = students_df[
            (students_df['student_id'] == student_id) &
            (students_df['course_code'].isin(list(valid_enrollments)))
        ]['course_code'].tolist()
        new_enrollments = valid_enrollments - set(existing_enrollments)
        if existing_enrollments:
            print(f"⚠️  Already enrolled in: {', '.join(existing_enrollments)}")
        if not new_enrollments:
            print("❌ No new courses to enroll in.")
            return
        new_records = []
        for course_code in new_enrollments:
            new_records.append({
                'student_id': student_id,
                'name': student_name,
                'course_code': course_code
            })
        updated_students_df = pd.concat([students_df, pd.DataFrame(new_records)], ignore_index=True)
        if self.csv_manager.save_csv(updated_students_df, 'students.csv'):
            print(f"✅ Successfully enrolled in: {', '.join(new_enrollments)}")
            print(f"📊 Total enrollments for {student_name}: {len(updated_students_df[updated_students_df['student_id'] == student_id])}")
        else:
            print("❌ Failed to save enrollment data.")

    def view_my_enrollments(self):
        students_df = self.csv_manager.load_csv('students.csv')
        courses_df = self.csv_manager.load_csv('courses.csv')
        if students_df.empty:
            print("📋 No enrollment records found.")
            return
        student_id = input("\n🆔 Enter your Student ID: ").strip()
        my_enrollments = students_df[students_df['student_id'] == student_id]
        if my_enrollments.empty:
            print(f"📋 No enrollments found for Student ID: {student_id}")
            return
        print(f"\n📚 ENROLLMENTS FOR {my_enrollments.iloc[0]['name']} ({student_id}):")
        print("-" * 60)
        print(f"{'Course Code':<12} {'Course Name':<30} {'Instructor':<20}")
        print("-" * 60)
        for _, enrollment in my_enrollments.iterrows():
            course_info = courses_df[courses_df['course_code'] == enrollment['course_code']]
            if not course_info.empty:
                course = course_info.iloc[0]
                instructor = course['instructor']
                if isinstance(instructor, pd.Series):
                    instructor = instructor.iloc[0]
                elif isinstance(instructor, (list, tuple, set)):
                    instructor = list(instructor)[0]
                if pd.isna(instructor) or instructor == "":
                    instructor = "TBA"
                print(f"{enrollment['course_code']:<12} {course['course_name']:<30} {instructor:<20}")
            else:
                print(f"{enrollment['course_code']:<12} {'Course not found':<30} {'N/A':<20}")
        print("-" * 60)
        print(f"Total enrolled courses: {len(my_enrollments)}")

    def view_my_hallticket(self):
        students_df = self.csv_manager.load_csv('students.csv')
        schedule_df = self.csv_manager.load_csv('final_schedule.csv')
        courses_df = self.csv_manager.load_csv('courses.csv')
        if students_df.empty:
            print("📋 No enrollment records found.")
            return
        if schedule_df.empty:
            print("📋 No exam schedule available. Please ask admin to schedule exams.")
            return
        if 'date' not in schedule_df.columns:
            print("❌ The current schedule file does not have a 'date' column. Please re-run the scheduler to generate a new schedule.")
            return
        student_id = input("\n🆔 Enter your Student ID: ").strip()
        my_enrollments = students_df[students_df['student_id'] == student_id]
        if my_enrollments.empty:
            print(f"📋 No enrollments found for Student ID: {student_id}")
            return
        enrolled_courses = list(my_enrollments['course_code'])
        my_schedule = schedule_df[schedule_df['course_code'].isin(enrolled_courses)]
        if my_schedule.empty:
            print("📋 No scheduled exams found for your courses.")
            return
        student_name = my_enrollments.iloc[0]['name']
        print(f"\n🎫 HALLTICKET FOR {student_name} ({student_id}):")
        print("-" * 100)
        print(f"{'Course Code':<12} {'Course Name':<30} {'Date':<15} {'Room':<20}")
        print("-" * 100)
        for _, exam in my_schedule.iterrows():
            course_name = exam['course_name'] if 'course_name' in exam else list(courses_df[courses_df['course_code'] == exam['course_code']]['course_name'])[0]
            print(f"{exam['course_code']:<12} {course_name:<30} {exam['date']:<15} {exam['room']:<20}")
        print("-" * 100)
        print(f"Total exams: {len(my_schedule)}")

class AdminSection:
    """Handles admin operations and scheduling"""
    def __init__(self, csv_manager: CSVManager):
        self.csv_manager = csv_manager

    def admin_menu(self):
        print("\n👨‍🏫 ADMIN SECTION")
        print("=" * 40)
        while True:
            print("\n📚 Admin Options:")
            print("1. View All Courses")
            print("2. Update Course Information")
            print("3. Back to Main Menu")
            choice = input("\nEnter your choice (1-3): ").strip()
            if choice == '1':
                self.view_all_courses()
            elif choice == '2':
                self.update_course_info()
            elif choice == '3':
                break
            else:
                print("❌ Invalid choice. Please try again.")

    def view_all_courses(self):
        courses_df = self.csv_manager.load_csv('courses.csv')
        if courses_df.empty:
            print("📋 No courses available.")
            return
        print("\n📋 ALL COURSES:")
        print("-" * 70)
        print(f"{'Code':<10} {'Course Name':<35} {'Expected Students':<15}")
        print("-" * 70)
        for _, course in courses_df.iterrows():
            expected = course['expected_students']
            if isinstance(expected, pd.Series):
                expected = expected.iloc[0]
            elif isinstance(expected, (list, tuple, set)):
                expected = list(expected)[0]
            if pd.isna(expected) or expected == "":
                expected = "TBA"
            print(f"{course['course_code']:<10} {course['course_name']:<35} {expected:<15}")
        print("-" * 70)
        print(f"Total courses: {len(courses_df)}")

    def update_course_info(self):
        courses_df = self.csv_manager.load_csv('courses.csv')
        if courses_df.empty:
            print("❌ No courses available.")
            return
        teacher_name = input("\n👨‍🏫 Enter your full name: ").strip()
        my_courses = courses_df[courses_df['instructor'] == teacher_name]
        if my_courses.empty:
            print(f"❌ No courses assigned to {teacher_name}")
            return
        print(f"\n📚 YOUR COURSES:")
        for _, course in my_courses.iterrows():
            print(f"• {course['course_code']}: {course['course_name']}")
        course_code = input("\nEnter course code to update: ").strip().upper()
        if course_code not in my_courses['course_code'].tolist():
            print(f"❌ Course {course_code} not found in your assignments.")
            return
        course_idx = courses_df[courses_df['course_code'] == course_code].index[0]
        current_course = courses_df.loc[course_idx]
        print(f"\n📝 Updating {course_code}:")
        print(f"Current name: {current_course['course_name']}")
        print(f"Current expected students: {current_course['expected_students']}")
        new_name = input("New course name (press Enter to keep current): ").strip()
        new_expected = input("New expected students (press Enter to keep current): ").strip()
        if new_name:
            courses_df.loc[course_idx, 'course_name'] = new_name
        if new_expected and new_expected.isdigit():
            courses_df.loc[course_idx, 'expected_students'] = int(new_expected)
        elif new_expected and not new_expected.isdigit():
            print("⚠️  Expected students must be a number. Keeping current value.")
        if self.csv_manager.save_csv(courses_df, 'courses.csv'):
            print(f"✅ Successfully updated course {course_code}")
        else:
            print("❌ Failed to save course updates.") 