import pandas as pd
import networkx as nx
import random
import os
import json
from collections import defaultdict
from typing import Dict, List, Set, Optional
from datetime import datetime
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
        
        # Initialize CSV files if they don't exist
        self.init_csv_files()
    
    def init_csv_files(self):
        """Initialize CSV files with headers if they don't exist"""
        csv_files = {
            'courses.csv': ['course_code', 'course_name', 'instructor', 'expected_students'],
            'students.csv': ['student_id', 'name', 'course_code'],
            'rooms.csv': ['room_id', 'room_name', 'capacity'],
            'final_schedule.csv': ['course_code', 'course_name', 'instructor', 'time_slot', 'room', 'enrolled_students']
        }
        
        for filename, columns in csv_files.items():
            filepath = os.path.join(self.data_dir, filename)
            if not os.path.exists(filepath):
                pd.DataFrame(columns=columns).to_csv(filepath, index=False)
                print(f"📄 Created {filename}")
    
    def load_csv(self, filename):
        """Load CSV file and return DataFrame"""
        try:
            filepath = os.path.join(self.data_dir, filename)
            return pd.read_csv(filepath)
        except Exception as e:
            print(f"❌ Error loading {filename}: {e}")
            return pd.DataFrame()
    
    def save_csv(self, df, filename):
        """Save DataFrame to CSV file"""
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
        """Main student menu"""
        print("\n🎓 STUDENT SECTION")
        print("=" * 40)
        
        while True:
            print("\n📚 Student Options:")
            print("1. View Available Courses")
            print("2. Enroll in Courses")
            print("3. View My Enrollments")
            print("4. Back to Main Menu")
            
            choice = input("\nEnter your choice (1-4): ").strip()
            
            if choice == '1':
                self.view_available_courses()
            elif choice == '2':
                self.enroll_in_courses()
            elif choice == '3':
                self.view_my_enrollments()
            elif choice == '4':
                break
            else:
                print("❌ Invalid choice. Please try again.")
    
    def view_available_courses(self):
        """Display all available courses"""
        courses_df = self.csv_manager.load_csv('courses.csv')
        
        if courses_df.empty:
            print("📋 No courses available yet.")
            return
        
        print("\n📋 AVAILABLE COURSES:")
        print("-" * 80)
        print(f"{'Code':<10} {'Course Name':<30} {'Instructor':<20} {'Expected Students':<15}")
        print("-" * 80)
        
        for _, course in courses_df.iterrows():
            instructor = course['instructor'] if pd.notna(course['instructor']) else "TBA"
            expected = course['expected_students'] if pd.notna(course['expected_students']) else "TBA"
            print(f"{course['course_code']:<10} {course['course_name']:<30} {instructor:<20} {expected:<15}")
        
        print("-" * 80)
        print(f"Total courses: {len(courses_df)}")
    
    def enroll_in_courses(self):
        """Handle student enrollment"""
        courses_df = self.csv_manager.load_csv('courses.csv')
        students_df = self.csv_manager.load_csv('students.csv')
        
        if courses_df.empty:
            print("❌ No courses available for enrollment.")
            return
        
        # Get student information
        student_id = input("\n🆔 Enter your Student ID: ").strip()
        student_name = input("📝 Enter your Full Name: ").strip()
        
        if not student_id or not student_name:
            print("❌ Student ID and Name are required.")
            return
        
        # Show available courses
        self.view_available_courses()
        
        print(f"\n🎯 Hi {student_name}! Enter course codes you want to enroll in.")
        print("💡 Enter codes separated by commas (e.g., CS101,MATH201,PHYS301)")
        print("📋 Or enter them one by one (press Enter with empty input to finish)")
        
        course_codes = set()
        
        # Option 1: All at once
        bulk_input = input("\nEnter course codes (comma-separated) or press Enter for one-by-one: ").strip()
        
        if bulk_input:
            course_codes.update([code.strip().upper() for code in bulk_input.split(',')])
        else:
            # Option 2: One by one
            print("\nEnter course codes one by one:")
            while True:
                code = input("Course code (or press Enter to finish): ").strip().upper()
                if not code:
                    break
                course_codes.add(code)
        
        if not course_codes:
            print("❌ No course codes entered.")
            return
        
        # Validate course codes
        valid_codes = set(courses_df['course_code'].str.upper())
        invalid_codes = course_codes - valid_codes
        valid_enrollments = course_codes & valid_codes
        
        if invalid_codes:
            print(f"⚠️  Invalid course codes: {', '.join(invalid_codes)}")
        
        if not valid_enrollments:
            print("❌ No valid course codes to enroll in.")
            return
        
        # Check for existing enrollments
        existing_enrollments = students_df[
            (students_df['student_id'] == student_id) & 
            (students_df['course_code'].isin(valid_enrollments))
        ]['course_code'].tolist()
        
        new_enrollments = valid_enrollments - set(existing_enrollments)
        
        if existing_enrollments:
            print(f"⚠️  Already enrolled in: {', '.join(existing_enrollments)}")
        
        if not new_enrollments:
            print("❌ No new courses to enroll in.")
            return
        
        # Add new enrollments
        new_records = []
        for course_code in new_enrollments:
            new_records.append({
                'student_id': student_id,
                'name': student_name,
                'course_code': course_code
            })
        
        # Append to existing students data
        updated_students_df = pd.concat([students_df, pd.DataFrame(new_records)], ignore_index=True)
        
        if self.csv_manager.save_csv(updated_students_df, 'students.csv'):
            print(f"✅ Successfully enrolled in: {', '.join(new_enrollments)}")
            print(f"📊 Total enrollments for {student_name}: {len(updated_students_df[updated_students_df['student_id'] == student_id])}")
        else:
            print("❌ Failed to save enrollment data.")
    
    def view_my_enrollments(self):
        """View student's current enrollments"""
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
                instructor = course['instructor'] if pd.notna(course['instructor']) else "TBA"
                print(f"{enrollment['course_code']:<12} {course['course_name']:<30} {instructor:<20}")
            else:
                print(f"{enrollment['course_code']:<12} {'Course not found':<30} {'N/A':<20}")
        
        print("-" * 60)
        print(f"Total enrolled courses: {len(my_enrollments)}")

class TeacherSection:
    """Handles teacher-related operations"""
    
    def __init__(self, csv_manager: CSVManager):
        self.csv_manager = csv_manager
    
    def teacher_menu(self):
        """Main teacher menu"""
        print("\n👨‍🏫 TEACHER SECTION")
        print("=" * 40)
        
        while True:
            print("\n📖 Teacher Options:")
            print("1. View All Courses")
            print("2. Assign Myself to Existing Course")
            print("3. Create New Course")
            print("4. View My Assigned Courses")
            print("5. Update Course Information")
            print("6. Back to Main Menu")
            
            choice = input("\nEnter your choice (1-6): ").strip()
            
            if choice == '1':
                self.view_all_courses()
            elif choice == '2':
                self.assign_to_existing_course()
            elif choice == '3':
                self.create_new_course()
            elif choice == '4':
                self.view_my_courses()
            elif choice == '5':
                self.update_course_info()
            elif choice == '6':
                break
            else:
                print("❌ Invalid choice. Please try again.")
    
    def view_all_courses(self):
        """Display all courses with instructor information"""
        courses_df = self.csv_manager.load_csv('courses.csv')
        
        if courses_df.empty:
            print("📋 No courses available.")
            return
        
        print("\n📋 ALL COURSES:")
        print("-" * 90)
        print(f"{'Course Code':<12} {'Course Name':<35} {'Instructor':<25} {'Expected Students':<15}")
        print("-" * 90)
        
        for _, course in courses_df.iterrows():
            instructor = course['instructor'] if pd.notna(course['instructor']) else "⚠️ UNASSIGNED"
            expected = course['expected_students'] if pd.notna(course['expected_students']) else "TBA"
            print(f"{course['course_code']:<12} {course['course_name']:<35} {instructor:<25} {expected:<15}")
        
        print("-" * 90)
        
        # Count unassigned courses
        unassigned = courses_df[courses_df['instructor'].isna() | (courses_df['instructor'] == "")]
        print(f"Total courses: {len(courses_df)} | ⚠️ Unassigned: {len(unassigned)}")
    
    def assign_to_existing_course(self):
        """Assign teacher to an existing course"""
        courses_df = self.csv_manager.load_csv('courses.csv')
        
        if courses_df.empty:
            print("❌ No courses available.")
            return
        
        teacher_name = input("\n👨‍🏫 Enter your full name: ").strip()
        if not teacher_name:
            print("❌ Teacher name is required.")
            return
        
        # Show unassigned courses
        unassigned_courses = courses_df[courses_df['instructor'].isna() | (courses_df['instructor'] == "")]
        
        if unassigned_courses.empty:
            print("📋 All courses are already assigned to instructors.")
            print("\nWould you like to view all courses? (y/n)")
            if input().strip().lower() == 'y':
                self.view_all_courses()
            return
        
        print(f"\n📋 UNASSIGNED COURSES (Available for {teacher_name}):")
        print("-" * 70)
        print(f"{'Course Code':<12} {'Course Name':<35} {'Expected Students':<15}")
        print("-" * 70)
        
        for _, course in unassigned_courses.iterrows():
            expected = course['expected_students'] if pd.notna(course['expected_students']) else "TBA"
            print(f"{course['course_code']:<12} {course['course_name']:<35} {expected:<15}")
        
        print("-" * 70)
        
        # Get course codes to assign
        print(f"\n🎯 Enter course codes you want to teach (comma-separated):")
        course_input = input("Course codes: ").strip().upper()
        
        if not course_input:
            print("❌ No course codes entered.")
            return
        
        course_codes = [code.strip() for code in course_input.split(',')]
        
        # Validate and assign courses
        valid_assignments = []
        invalid_codes = []
        already_assigned = []
        
        for code in course_codes:
            if code in unassigned_courses['course_code'].values:
                valid_assignments.append(code)
            elif code in courses_df['course_code'].values:
                already_assigned.append(code)
            else:
                invalid_codes.append(code)
        
        # Show results
        if invalid_codes:
            print(f"❌ Invalid course codes: {', '.join(invalid_codes)}")
        
        if already_assigned:
            print(f"⚠️  Already assigned courses: {', '.join(already_assigned)}")
        
        if not valid_assignments:
            print("❌ No valid unassigned courses to assign.")
            return
        
        # Update course assignments
        courses_df.loc[courses_df['course_code'].isin(valid_assignments), 'instructor'] = teacher_name
        
        if self.csv_manager.save_csv(courses_df, 'courses.csv'):
            print(f"✅ Successfully assigned {teacher_name} to: {', '.join(valid_assignments)}")
        else:
            print("❌ Failed to save course assignments.")
    
    def create_new_course(self):
        """Create a new course"""
        courses_df = self.csv_manager.load_csv('courses.csv')
        
        teacher_name = input("\n👨‍🏫 Enter your full name: ").strip()
        if not teacher_name:
            print("❌ Teacher name is required.")
            return
        
        print(f"\n📝 Creating new course for {teacher_name}:")
        
        course_code = input("Course Code (e.g., CS101): ").strip().upper()
        course_name = input("Course Name: ").strip()
        expected_students = input("Expected number of students (optional): ").strip()
        
        if not course_code or not course_name:
            print("❌ Course code and name are required.")
            return
        
        # Check if course code already exists
        if course_code in courses_df['course_code'].values:
            print(f"❌ Course code {course_code} already exists.")
            return
        
        # Validate expected students
        if expected_students and not expected_students.isdigit():
            print("⚠️  Expected students must be a number. Setting to blank.")
            expected_students = ""
        
        # Create new course record
        new_course = {
            'course_code': course_code,
            'course_name': course_name,
            'instructor': teacher_name,
            'expected_students': int(expected_students) if expected_students else ""
        }
        
        # Add to courses DataFrame
        updated_courses_df = pd.concat([courses_df, pd.DataFrame([new_course])], ignore_index=True)
        
        if self.csv_manager.save_csv(updated_courses_df, 'courses.csv'):
            print(f"✅ Successfully created course: {course_code} - {course_name}")
            print(f"👨‍🏫 Assigned to: {teacher_name}")
        else:
            print("❌ Failed to save new course.")
    
    def view_my_courses(self):
        """View courses assigned to the teacher"""
        courses_df = self.csv_manager.load_csv('courses.csv')
        
        if courses_df.empty:
            print("📋 No courses available.")
            return
        
        teacher_name = input("\n👨‍🏫 Enter your full name: ").strip()
        
        my_courses = courses_df[courses_df['instructor'] == teacher_name]
        
        if my_courses.empty:
            print(f"📋 No courses assigned to {teacher_name}")
            return
        
        print(f"\n📚 COURSES ASSIGNED TO {teacher_name}:")
        print("-" * 70)
        print(f"{'Course Code':<12} {'Course Name':<35} {'Expected Students':<15}")
        print("-" * 70)
        
        for _, course in my_courses.iterrows():
            expected = course['expected_students'] if pd.notna(course['expected_students']) else "TBA"
            print(f"{course['course_code']:<12} {course['course_name']:<35} {expected:<15}")
        
        print("-" * 70)
        print(f"Total courses: {len(my_courses)}")
    
    def update_course_info(self):
        """Update course information"""
        courses_df = self.csv_manager.load_csv('courses.csv')
        
        if courses_df.empty:
            print("❌ No courses available.")
            return
        
        teacher_name = input("\n👨‍🏫 Enter your full name: ").strip()
        my_courses = courses_df[courses_df['instructor'] == teacher_name]
        
        if my_courses.empty:
            print(f"❌ No courses assigned to {teacher_name}")
            return
        
        # Show teacher's courses
        print(f"\n📚 YOUR COURSES:")
        for _, course in my_courses.iterrows():
            print(f"• {course['course_code']}: {course['course_name']}")
        
        course_code = input("\nEnter course code to update: ").strip().upper()
        
        if course_code not in my_courses['course_code'].values:
            print(f"❌ Course {course_code} not found in your assignments.")
            return
        
        course_idx = courses_df[courses_df['course_code'] == course_code].index[0]
        current_course = courses_df.loc[course_idx]
        
        print(f"\n📝 Updating {course_code}:")
        print(f"Current name: {current_course['course_name']}")
        print(f"Current expected students: {current_course['expected_students']}")
        
        # Get updates
        new_name = input("New course name (press Enter to keep current): ").strip()
        new_expected = input("New expected students (press Enter to keep current): ").strip()
        
        # Apply updates
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

class AdminSection:
    """Handles admin operations and scheduling"""
    
    def __init__(self, csv_manager: CSVManager):
        self.csv_manager = csv_manager
    
    def admin_menu(self):
        """Main admin menu"""
        print("\n🔐 ADMIN SECTION")
        print("=" * 40)
        
        while True:
            print("\n⚙️  Admin Options:")
            print("1. View All Data")
            print("2. Detect Course Conflicts")
            print("3. Schedule Exams")
            print("4. View Current Schedule")
            print("5. System Statistics")
            print("6. Initialize Sample Data")
            print("7. Back to Main Menu")
            
            choice = input("\nEnter your choice (1-7): ").strip()
            
            if choice == '1':
                self.view_all_data()
            elif choice == '2':
                self.detect_conflicts()
            elif choice == '3':
                self.schedule_exams()
            elif choice == '4':
                self.view_current_schedule()
            elif choice == '5':
                self.system_statistics()
            elif choice == '6':
                self.initialize_sample_data()
            elif choice == '7':
                break
            else:
                print("❌ Invalid choice. Please try again.")
    
    def view_all_data(self):
        """Display all CSV data"""
        csv_files = ['courses.csv', 'students.csv', 'rooms.csv']
        
        for filename in csv_files:
            df = self.csv_manager.load_csv(filename)
            print(f"\n📊 {filename.upper()}")
            print("=" * 60)
            
            if df.empty:
                print(f"📋 No data in {filename}")
            else:
                print(df.to_string(index=False))
                print(f"\nTotal records: {len(df)}")
            
            print("\n")
    
    def detect_conflicts(self):
        """Detect and display course conflicts"""
        students_df = self.csv_manager.load_csv('students.csv')
        courses_df = self.csv_manager.load_csv('courses.csv')
        
        if students_df.empty or courses_df.empty:
            print("❌ Insufficient data to detect conflicts.")
            return
        
        print("\n🔍 DETECTING COURSE CONFLICTS...")
        print("=" * 50)
        
        # Group students by student_id and get their courses
        student_courses = students_df.groupby('student_id')['course_code'].apply(list).to_dict()
        
        # Find conflicts (students enrolled in multiple courses)
        conflicts = defaultdict(set)
        conflict_count = 0
        
        for student_id, courses in student_courses.items():
            if len(courses) > 1:
                # This student has multiple courses - all pairs conflict
                for i in range(len(courses)):
                    for j in range(i + 1, len(courses)):
                        course1, course2 = courses[i], courses[j]
                        conflicts[course1].add(course2)
                        conflicts[course2].add(course1)
                        conflict_count += 1
        
        if not conflicts:
            print("✅ No course conflicts detected!")
            print("All students are enrolled in at most one course.")
            return
        
        print(f"⚠️  Found conflicts between {len(conflicts)} courses:")
        print("-" * 50)
        
        # Display conflicts
        displayed_pairs = set()
        for course1, conflicting_courses in conflicts.items():
            course1_name = courses_df[courses_df['course_code'] == course1]['course_name'].iloc[0] if not courses_df[courses_df['course_code'] == course1].empty else "Unknown"
            
            for course2 in conflicting_courses:
                pair = tuple(sorted([course1, course2]))
                if pair not in displayed_pairs:
                    course2_name = courses_df[courses_df['course_code'] == course2]['course_name'].iloc[0] if not courses_df[courses_df['course_code'] == course2].empty else "Unknown"
                    
                    # Count students causing this conflict
                    conflict_students = [
                        sid for sid, scourses in student_courses.items()
                        if course1 in scourses and course2 in scourses
                    ]
                    
                    print(f"🔗 {course1} ({course1_name}) ↔ {course2} ({course2_name})")
                    print(f"   Students: {len(conflict_students)} ({', '.join(conflict_students)})")
                    displayed_pairs.add(pair)
        
        print("-" * 50)
        print(f"📊 Summary: {len(displayed_pairs)} conflict pairs detected")
        
        return conflicts
    
    def schedule_exams(self):
        """Main scheduling interface"""
        print("\n📅 EXAM SCHEDULING")
        print("=" * 40)
        
        # Check data availability
        courses_df = self.csv_manager.load_csv('courses.csv')
        students_df = self.csv_manager.load_csv('students.csv')
        rooms_df = self.csv_manager.load_csv('rooms.csv')
        
        if courses_df.empty:
            print("❌ No courses available for scheduling.")
            return
        
        if rooms_df.empty:
            print("⚠️  No rooms data available. Using default rooms.")
            self._create_default_rooms()
            rooms_df = self.csv_manager.load_csv('rooms.csv')
        
        print(f"📊 Data Summary:")
        print(f"   Courses: {len(courses_df)}")
        print(f"   Students: {len(students_df)}")
        print(f"   Rooms: {len(rooms_df)}")
        
        # Show available algorithms
        print(f"\n🎯 Available Scheduling Algorithms:")
        print("1. Graph Coloring (Fast, Basic)")
        print("2. OR-Tools Constraint Solver (Optimal)")
        print("3. Simulated Annealing (Flexible)")
        print("4. Genetic Algorithm (Evolutionary)")
        
        algo_choice = input("\nChoose algorithm (1-4): ").strip()
        
        if algo_choice == '1':
            self._schedule_graph_coloring(courses_df, students_df, rooms_df)
        elif algo_choice == '2':
            if ORTOOLS_AVAILABLE:
                self._schedule_ortools(courses_df, students_df, rooms_df)
            else:
                print("❌ OR-Tools not available. Please install: pip install ortools")
        elif algo_choice == '3':
            self._schedule_simulated_annealing(courses_df, students_df, rooms_df)
        elif algo_choice == '4':
            self._schedule_genetic_algorithm(courses_df, students_df, rooms_df)
        else:
            print("❌ Invalid algorithm choice.")
    
    def _create_default_rooms(self):
        """Create default rooms if none exist"""
        default_rooms = [
            {'room_id': 'HALL-A', 'room_name': 'Main Hall A', 'capacity': 200},
            {'room_id': 'HALL-B', 'room_name': 'Main Hall B', 'capacity': 150},
            {'room_id': 'ROOM-101', 'room_name': 'Classroom 101', 'capacity': 50},
            {'room_id': 'ROOM-102', 'room_name': 'Classroom 102', 'capacity': 50},
            {'room_id': 'ROOM-201', 'room_name': 'Classroom 201', 'capacity': 40},
            {'room_id': 'LAB-A', 'room_name': 'Computer Lab A', 'capacity': 30},
        ]
        
        rooms_df = pd.DataFrame(default_rooms)
        self.csv_manager.save_csv(rooms_df, 'rooms.csv')
        print("✅ Created default rooms.")
    
    def _schedule_graph_coloring(self, courses_df, students_df, rooms_df):
        """Schedule using graph coloring algorithm"""
        print("\n🎨 Using Graph Coloring Algorithm...")
        
        # Build conflict graph
        conflicts = self._build_conflict_graph(students_df)
        
        # Create NetworkX graph
        G = nx.Graph()
        G.add_nodes_from(courses_df['course_code'])
        
        # Add edges for conflicts
        for course1, conflicting_courses in conflicts.items():
            for course2 in conflicting_courses:
                G.add_edge(course1, course2)
        
        # Apply graph coloring
        coloring = nx.greedy_color(G, strategy='largest_first')
        
        # Generate schedule
        schedules = self._create_schedule_from_coloring(coloring, courses_df, students_df, rooms_df)
        
        print(f"✅ Scheduling completed using {max(coloring.values()) + 1} time slots")
        
        if self._save_final_schedule(schedule):
            print("📄 Schedule saved to final_schedule.csv")
            return schedules
         
    
    def _schedule_ortools(self, courses_df, students_df, rooms_df):
        """Schedule using OR-Tools constraint solver"""
        print("\n🔧 Using OR-Tools Constraint Solver...")
        
        model = cp_model.CpModel()
        
        courses = courses_df['course_code'].tolist()
        rooms = rooms_df['room_id'].tolist()
        max_time_slots = 10
        
        # Decision variables
        # x[c][t][r] = 1 if course c is scheduled at time t in room r
        x = {}
        for c in courses:
            for t in range(max_time_slots):
                for r in rooms:
                    x[(c, t, r)] = model.NewBoolVar(f'x_{c}_{t}_{r}')
        
        # Constraints
        # 1. Each course must be scheduled exactly once
        for c in courses:
            model.Add(sum(x[(c, t, r)] for t in range(max_time_slots) for r in rooms) == 1)
        
        # 2. No room conflicts (one course per room per time slot)
        for t in range(max_time_slots):
            for r in rooms:
                model.Add(sum(x[(c, t, r)] for c in courses) <= 1)
        
        # 3. No student conflicts (conflicting courses in different time slots)
        conflicts = self._build_conflict_graph(students_df)
        for course1, conflicting_courses in conflicts.items():
            for course2 in conflicting_courses:
                if course1 in courses and course2 in courses:
                    for t in range(max_time_slots):
                        model.Add(
                            sum(x[(course1, t, r)] for r in rooms) + 
                            sum(x[(course2, t, r)] for r in rooms) <= 1
                        )
        
        # 4. Room capacity constraints
        student_counts = students_df.groupby('course_code').size().to_dict()
        for c in courses:
            enrolled = student_counts.get(c, 0)
            for t in range(max_time_slots):
                for r in rooms:
                    room_capacity = rooms_df[rooms_df['room_id'] == r]['capacity'].iloc[0]
                    if enrolled > room_capacity:
                        model.Add(x[(c, t, r)] == 0)  # Can't use this room
        
        # Solve
        solver = cp_model.CpSolver()
        status = solver.Solve(model)
        
        if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
            schedule = []
            for c in courses:
                for t in range(max_time_slots):
                    for r in rooms:
                        if solver.Value(x[(c, t, r)]) == 1:
                            course_info = courses_df[courses_df['course_code'] == c].iloc[0]
                            room_info = rooms_df[rooms_df['room_id'] == r].iloc[0]
                            enrolled = student_counts.get(c, 0)
                            
                            schedule.append({
                                'course_code': c,
                                'course_name': course_info['course_name'],
                                'instructor': course_info['instructor'],
                                'time_slot': f'Slot-{t+1}',
                                'room': room_info['room_name'],
                                'enrolled_students': enrolled
                            })
            
            print(f"✅ Optimal schedule found using OR-Tools")
            if self._save_final_schedule(schedule):
                print("📄 Schedule saved to final_schedule.csv")
        else:
            print("❌ No feasible solution found with OR-Tools")
    
    def _schedule_simulated_annealing(self, courses_df, students_df, rooms_df):
        """Schedule using simulated annealing algorithm"""
        print("\n🌡️  Using Simulated Annealing Algorithm...")
        
        courses = courses_df['course_code'].tolist()
        rooms = rooms_df['room_id'].tolist()
        max_time_slots = 10
        
        conflicts = self._build_conflict_graph(students_df)
        student_counts = students_df.groupby('course_code').size().to_dict()
        
        # Initial random solution
        current_solution = {}
        for course in courses:
            time_slot = random.randint(0, max_time_slots - 1)
            room = random.choice(rooms)
            current_solution[course] = (time_slot, room)
        
        def calculate_cost(solution):
            cost = 0
            
            # Penalty for conflicts (same time slot for conflicting courses)
            for course1, conflicting_courses in conflicts.items():
                if course1 in solution:
                    t1, r1 = solution[course1]
                    for course2 in conflicting_courses:
                        if course2 in solution:
                            t2, r2 = solution[course2]
                            if t1 == t2:  # Same time slot
                                cost += 100
            
            # Penalty for room conflicts (same room, same time)
            time_room_usage = defaultdict(list)
            for course, (time_slot, room) in solution.items():
                time_room_usage[(time_slot, room)].append(course)
            
            for (time_slot, room), course_list in time_room_usage.items():
                if len(course_list) > 1:
                    cost += 50 * (len(course_list) - 1)
            
            # Penalty for capacity violations
            for course, (time_slot, room) in solution.items():
                enrolled = student_counts.get(course, 0)
                room_capacity = rooms_df[rooms_df['room_id'] == room]['capacity'].iloc[0]
                if enrolled > room_capacity:
                    cost += 25 * (enrolled - room_capacity)
            
            return cost
        
        current_cost = calculate_cost(current_solution)
        best_solution = current_solution.copy()
        best_cost = current_cost
        
        # Simulated annealing parameters
        temperature = 1000
        cooling_rate = 0.95
        min_temperature = 1
        
        iterations = 0
        max_iterations = 5000
        
        print("🔄 Running simulated annealing...")
        
        while temperature > min_temperature and iterations < max_iterations:
            # Generate neighbor solution
            new_solution = current_solution.copy()
            course_to_change = random.choice(courses)
            new_time = random.randint(0, max_time_slots - 1)
            new_room = random.choice(rooms)
            new_solution[course_to_change] = (new_time, new_room)
            
            new_cost = calculate_cost(new_solution)
            
            # Accept or reject the new solution
            if new_cost < current_cost or random.random() < math.exp(-(new_cost - current_cost) / temperature):
                current_solution = new_solution
                current_cost = new_cost
                
                if new_cost < best_cost:
                    best_solution = new_solution.copy()
                    best_cost = new_cost
            
            temperature *= cooling_rate
            iterations += 1
            
            if iterations % 1000 == 0:
                print(f"   Iteration {iterations}, Best cost: {best_cost}")
        
        # Convert best solution to schedule format
        schedule = []
        for course, (time_slot, room) in best_solution.items():
            course_info = courses_df[courses_df['course_code'] == course].iloc[0]
            room_info = rooms_df[rooms_df['room_id'] == room].iloc[0]
            enrolled = student_counts.get(course, 0)
            
            schedule.append({
                'course_code': course,
                'course_name': course_info['course_name'],
                'instructor': course_info['instructor'],
                'time_slot': f'Slot-{time_slot+1}',
                'room': room_info['room_name'],
                'enrolled_students': enrolled
            })
        
        print(f"✅ Simulated annealing completed. Final cost: {best_cost}")
        if self._save_final_schedule(schedule):
            print("📄 Schedule saved to final_schedule.csv")
    
    def _schedule_genetic_algorithm(self, courses_df, students_df, rooms_df):
        """Schedule using genetic algorithm"""
        print("\n🧬 Using Genetic Algorithm...")
        
        courses = courses_df['course_code'].tolist()
        rooms = rooms_df['room_id'].tolist()
        max_time_slots = 10
        
        conflicts = self._build_conflict_graph(students_df)
        student_counts = students_df.groupby('course_code').size().to_dict()
        
        # Genetic algorithm parameters
        population_size = 50
        mutation_rate = 0.1
        crossover_rate = 0.8
        generations = 200
        
        def create_individual():
            """Create a random schedule (individual)"""
            individual = {}
            for course in courses:
                time_slot = random.randint(0, max_time_slots - 1)
                room = random.choice(rooms)
                individual[course] = (time_slot, room)
            return individual
        
        def fitness(individual):
            """Calculate fitness (lower is better, so we'll return negative cost)"""
            cost = 0
            
            # Conflict penalties
            for course1, conflicting_courses in conflicts.items():
                if course1 in individual:
                    t1, r1 = individual[course1]
                    for course2 in conflicting_courses:
                        if course2 in individual:
                            t2, r2 = individual[course2]
                            if t1 == t2:
                                cost += 100
            
            # Room conflict penalties
            time_room_usage = defaultdict(list)
            for course, (time_slot, room) in individual.items():
                time_room_usage[(time_slot, room)].append(course)
            
            for (time_slot, room), course_list in time_room_usage.items():
                if len(course_list) > 1:
                    cost += 50 * (len(course_list) - 1)
            
            return -cost  # Return negative for maximization
        
        def crossover(parent1, parent2):
            """Create offspring by combining two parents"""
            child = {}
            for course in courses:
                if random.random() < 0.5:
                    child[course] = parent1[course]
                else:
                    child[course] = parent2[course]
            return child
        
        def mutate(individual):
            """Mutate an individual"""
            if random.random() < mutation_rate:
                course_to_mutate = random.choice(courses)
                new_time = random.randint(0, max_time_slots - 1)
                new_room = random.choice(rooms)
                individual[course_to_mutate] = (new_time, new_room)
            return individual
        
        # Initialize population
        population = [create_individual() for _ in range(population_size)]
        
        print("🔄 Running genetic algorithm...")
        
        for generation in range(generations):
            # Evaluate fitness
            fitness_scores = [(individual, fitness(individual)) for individual in population]
            fitness_scores.sort(key=lambda x: x[1], reverse=True)  # Sort by fitness (highest first)
            
            if generation % 50 == 0:
                best_fitness = fitness_scores[0][1]
                print(f"   Generation {generation}, Best fitness: {best_fitness}")
            
            # Select parents (top 50%)
            parents = [individual for individual, _ in fitness_scores[:population_size // 2]]
            
            # Create new population
            new_population = parents.copy()  # Keep best individuals
            
            while len(new_population) < population_size:
                parent1 = random.choice(parents)
                parent2 = random.choice(parents)
                
                if random.random() < crossover_rate:
                    child = crossover(parent1, parent2)
                else:
                    child = parent1.copy()
                
                child = mutate(child)
                new_population.append(child)
            
            population = new_population
        
        # Get best solution
        final_fitness_scores = [(individual, fitness(individual)) for individual in population]
        best_individual = max(final_fitness_scores, key=lambda x: x[1])[0]
        
        # Convert to schedule format
        schedule = []
        for course, (time_slot, room) in best_individual.items():
            course_info = courses_df[courses_df['course_code'] == course].iloc[0]
            room_info = rooms_df[rooms_df['room_id'] == room].iloc[0]
            enrolled = student_counts.get(course, 0)
            
            schedule.append({
                'course_code': course,
                'course_name': course_info['course_name'],
                'instructor': course_info['instructor'],
                'time_slot': f'Slot-{time_slot+1}',
                'room': room_info['room_name'],
                'enrolled_students': enrolled
            })
        
        print(f"✅ Genetic algorithm completed")
        if self._save_final_schedule(schedule):
            print("📄 Schedule saved to final_schedule.csv")
    
    def _build_conflict_graph(self, students_df):
        """Build conflict graph from student enrollments"""
        conflicts = defaultdict(set)
        
        if students_df.empty:
            return conflicts
        
        # Group students by student_id
        student_courses = students_df.groupby('student_id')['course_code'].apply(list).to_dict()
        
        # Find conflicts
        for student_id, courses in student_courses.items():
            if len(courses) > 1:
                for i in range(len(courses)):
                    for j in range(i + 1, len(courses)):
                        course1, course2 = courses[i], courses[j]
                        conflicts[course1].add(course2)
                        conflicts[course2].add(course1)
        
        return conflicts
    
    def _create_schedule_from_coloring(self, coloring, courses_df, students_df, rooms_df):
        """Create schedule from graph coloring result"""
        schedule = []
        student_counts = students_df.groupby('course_code').size().to_dict()
        
        # Sort rooms by capacity (largest first)
        sorted_rooms = rooms_df.sort_values('capacity', ascending=False)
        
        for course_code, color in coloring.items():
            course_info = courses_df[courses_df['course_code'] == course_code].iloc[0]
            enrolled = student_counts.get(course_code, 0)
            
            # Find suitable room
            suitable_room = sorted_rooms.iloc[0]  # Default to largest room
            for _, room in sorted_rooms.iterrows():
                if room['capacity'] >= enrolled:
                    suitable_room = room
                    break
            
            schedule.append({
                'course_code': course_code,
                'course_name': course_info['course_name'],
                'instructor': course_info['instructor'],
                'time_slot': f'Slot-{color + 1}',
                'room': suitable_room['room_name'],
                'enrolled_students': enrolled
            })
        
        return schedule
    
    def _save_final_schedule(self, schedule):
        """Save final schedule to CSV"""
        try:
            schedule_df = pd.DataFrame(schedule)
            schedule_df = schedule_df.sort_values('time_slot')
            return self.csv_manager.save_csv(schedule_df, 'final_schedule.csv')
        except Exception as e:
            print(f"❌ Error saving schedule: {e}")
            return False
    
    def view_current_schedule(self):
        """Display the current exam schedule"""
        schedule_df = self.csv_manager.load_csv('final_schedule.csv')
        
        if schedule_df.empty:
            print("📋 No exam schedule available. Please run scheduling first.")
            return
        
        print("\n📅 CURRENT EXAM SCHEDULE")
        print("=" * 100)
        print(f"{'Course':<10} {'Course Name':<25} {'Instructor':<20} {'Time Slot':<12} {'Room':<15} {'Students':<8}")
        print("-" * 100)
        
        for _, exam in schedule_df.iterrows():
            instructor = exam['instructor'] if pd.notna(exam['instructor']) else "TBA"
            students = exam['enrolled_students'] if pd.notna(exam['enrolled_students']) else "0"
            
            print(f"{exam['course_code']:<10} {exam['course_name'][:24]:<25} "
                  f"{instructor[:19]:<20} {exam['time_slot']:<12} "
                  f"{exam['room'][:14]:<15} {students:<8}")
        
        print("-" * 100)
        print(f"Total scheduled exams: {len(schedule_df)}")
        
        # Show time slot summary
        print(f"\n⏰ Time Slot Summary:")
        slot_summary = schedule_df.groupby('time_slot').size().sort_index()
        for slot, count in slot_summary.items():
            print(f"   {slot}: {count} exams")
    
    def system_statistics(self):
        """Display comprehensive system statistics"""
        courses_df = self.csv_manager.load_csv('courses.csv')
        students_df = self.csv_manager.load_csv('students.csv')
        rooms_df = self.csv_manager.load_csv('rooms.csv')
        schedule_df = self.csv_manager.load_csv('final_schedule.csv')
        
        print("\n📊 SYSTEM STATISTICS")
        print("=" * 50)
        
        # Basic counts
        print(f"📚 Courses: {len(courses_df)}")
        print(f"👥 Students: {len(students_df['student_id'].unique()) if not students_df.empty else 0}")
        print(f"🏫 Rooms: {len(rooms_df)}")
        print(f"📝 Total Enrollments: {len(students_df)}")
        print(f"📅 Scheduled Exams: {len(schedule_df)}")
        
        if not courses_df.empty:
            # Course statistics
            print(f"\n📖 Course Details:")
            assigned_courses = courses_df[courses_df['instructor'].notna() & (courses_df['instructor'] != "")]
            print(f"   Assigned Instructors: {len(assigned_courses)}/{len(courses_df)}")
            
            if not students_df.empty:
                enrollment_stats = students_df.groupby('course_code').size()
                print(f"   Most Popular Course: {enrollment_stats.idxmax()} ({enrollment_stats.max()} students)")
                print(f"   Average Enrollment: {enrollment_stats.mean():.1f} students per course")
        
        if not students_df.empty:
            # Student statistics
            student_course_counts = students_df.groupby('student_id').size()
            print(f"\n👥 Student Details:")
            print(f"   Max Courses per Student: {student_course_counts.max()}")
            print(f"   Average Courses per Student: {student_course_counts.mean():.1f}")
            
            # Potential conflicts
            conflicts_count = len(student_course_counts[student_course_counts > 1])
            print(f"   Students with Multiple Courses: {conflicts_count}")
        
        if not rooms_df.empty:
            # Room statistics
            print(f"\n🏫 Room Details:")
            print(f"   Total Capacity: {rooms_df['capacity'].sum()} seats")
            print(f"   Largest Room: {rooms_df.loc[rooms_df['capacity'].idxmax(), 'room_name']} ({rooms_df['capacity'].max()} seats)")
            print(f"   Average Room Size: {rooms_df['capacity'].mean():.1f} seats")
        
        if not schedule_df.empty:
            # Schedule statistics
            print(f"\n📅 Schedule Details:")
            time_slots_used = schedule_df['time_slot'].nunique()
            rooms_used = schedule_df['room'].nunique()
            print(f"   Time Slots Used: {time_slots_used}")
            print(f"   Rooms Used: {rooms_used}")
            
            if 'enrolled_students' in schedule_df.columns:
                total_exam_seats = schedule_df['enrolled_students'].sum()
                print(f"   Total Exam Seats Needed: {total_exam_seats}")
    
    def initialize_sample_data(self):
        """Initialize the system with sample data for testing"""
        print("\n🎲 INITIALIZING SAMPLE DATA")
        print("=" * 40)
        
        # Sample courses
        sample_courses = [
            {'course_code': 'CS101', 'course_name': 'Introduction to Programming', 'instructor': 'Dr. Smith', 'expected_students': 45},
            {'course_code': 'MATH201', 'course_name': 'Calculus II', 'instructor': 'Prof. Johnson', 'expected_students': 60},
            {'course_code': 'PHYS301', 'course_name': 'Quantum Physics', 'instructor': 'Dr. Williams', 'expected_students': 25},
            {'course_code': 'ENG102', 'course_name': 'English Literature', 'instructor': 'Ms. Brown', 'expected_students': 35},
            {'course_code': 'CHEM201', 'course_name': 'Organic Chemistry', 'instructor': 'Dr. Davis', 'expected_students': 40},
            {'course_code': 'CS202', 'course_name': 'Data Structures', 'instructor': 'Dr. Smith', 'expected_students': 38},
        ]
        
        # Sample students with enrollments
        sample_students = [
            {'student_id': 'STU001', 'name': 'John Doe', 'course_code': 'CS101'},
            {'student_id': 'STU001', 'name': 'John Doe', 'course_code': 'MATH201'},
            {'student_id': 'STU002', 'name': 'Jane Smith', 'course_code': 'CS101'},
            {'student_id': 'STU002', 'name': 'Jane Smith', 'course_code': 'PHYS301'},
            {'student_id': 'STU003', 'name': 'Bob Johnson', 'course_code': 'MATH201'},
            {'student_id': 'STU003', 'name': 'Bob Johnson', 'course_code': 'CHEM201'},
            {'student_id': 'STU004', 'name': 'Alice Brown', 'course_code': 'ENG102'},
            {'student_id': 'STU005', 'name': 'Charlie Wilson', 'course_code': 'CS202'},
            {'student_id': 'STU005', 'name': 'Charlie Wilson', 'course_code': 'CS101'},
        ]
        
        # Sample rooms
        sample_rooms = [
            {'room_id': 'HALL-A', 'room_name': 'Main Auditorium', 'capacity': 200},
            {'room_id': 'HALL-B', 'room_name': 'Secondary Hall', 'capacity': 150},
            {'room_id': 'ROOM-101', 'room_name': 'Classroom 101', 'capacity': 50},
            {'room_id': 'ROOM-102', 'room_name': 'Classroom 102', 'capacity': 50},
            {'room_id': 'ROOM-201', 'room_name': 'Classroom 201', 'capacity': 40},
            {'room_id': 'LAB-A', 'room_name': 'Computer Lab', 'capacity': 30},
        ]
        
        # Save sample data
        try:
            courses_df = pd.DataFrame(sample_courses)
            students_df = pd.DataFrame(sample_students)
            rooms_df = pd.DataFrame(sample_rooms)
            
            success = True
            success &= self.csv_manager.save_csv(courses_df, 'courses.csv')
            success &= self.csv_manager.save_csv(students_df, 'students.csv')
            success &= self.csv_manager.save_csv(rooms_df, 'rooms.csv')
            
            if success:
                print("✅ Sample data initialized successfully!")
                print(f"   📚 {len(sample_courses)} courses")
                print(f"   👥 {len(sample_students)} student enrollments")
                print(f"   🏫 {len(sample_rooms)} rooms")
                print("\n💡 You can now test the scheduling algorithms!")
            else:
                print("❌ Failed to initialize some sample data")
                
        except Exception as e:
            print(f"❌ Error initializing sample data: {e}")

def main():
    """Main application entry point"""
    print("🎓 UNIVERSITY EXAM SCHEDULING SYSTEM")
    print("=" * 60)
    print("Welcome to the Role-Based Exam Scheduling System")
    print("Choose your role to access the appropriate features")
    
    # Initialize CSV manager
    csv_manager = CSVManager()
    
    # Initialize sections
    student_section = StudentSection(csv_manager)
    teacher_section = TeacherSection(csv_manager)
    admin_section = AdminSection(csv_manager)
    
    while True:
        print("\n🏠 MAIN MENU - SELECT YOUR ROLE:")
        print("=" * 40)
        print("1. 🎓 Student Section")
        print("2. 👨‍🏫 Teacher Section")
        print("3. 🔐 Admin Section")
        print("4. ℹ️  System Info")
        print("5. 🚪 Exit")
        
        try:
            choice = input("\nSelect your role (1-5): ").strip()
            
            if choice == '1':
                student_section.student_menu()
            elif choice == '2':
                teacher_section.teacher_menu()
            elif choice == '3':
                admin_section.admin_menu()
            elif choice == '4':
                print("\n📋 SYSTEM INFORMATION:")
                print("=" * 40)
                print("🎓 Student Section:")
                print("   • View available courses")
                print("   • Enroll in courses")
                print("   • View personal enrollments")
                print("\n👨‍🏫 Teacher Section:")
                print("   • View and manage courses")
                print("   • Assign to existing courses")
                print("   • Create new courses")
                print("\n🔐 Admin Section:")
                print("   • View all system data")
                print("   • Detect course conflicts")
                print("   • Schedule exams using various algorithms")
                print("   • Export schedules and statistics")
                print("\n📄 Data Files:")
                print("   • courses.csv - Course information")
                print("   • students.csv - Student enrollments")
                print("   • rooms.csv - Room information")
                print("   • final_schedule.csv - Generated exam schedule")
            elif choice == '5':
                print("\n👋 Thank you for using the Exam Scheduling System!")
                print("All data has been saved to CSV files in the data/ directory.")
                break
            else:
                print("❌ Invalid choice. Please select 1-5.")
                
        except KeyboardInterrupt:
            print("\n\n👋 System interrupted. Goodbye!")
            break
        except Exception as e:
            print(f"❌ An error occurred: {e}")
            print("Please try again or contact system administrator.")

if __name__ == "__main__":
    main()