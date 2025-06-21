'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Course {
  course_code: string;
  course_name: string;
  instructor: string;
  expected_students: number;
  enrolled_students?: number;
  exam_schedule?: {
    exam_date: string;
    time_slot: string;
    room: string;
  };
}

interface InvigilationSchedule {
  course_code: string;
  course_name: string;
  instructor: string;
  date: string;
  room: string;
  session: string;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacherName, setTeacherName] = useState<string>('');
  const [teacherId, setTeacherId] = useState<string>('');
  const [invigilationSchedule, setInvigilationSchedule] = useState<InvigilationSchedule[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [editForm, setEditForm] = useState({
    course_code: '',
    course_name: '',
    instructor: '',
    expected_students: 0
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check authentication and role
    console.log('Checking authentication...');
    const userData = localStorage.getItem('user');
    console.log('userData from localStorage:', userData);
    
    if (!userData) {
      console.log('No userData found in localStorage, redirecting to login...');
      router.push('/login');
      return;
    }

    try {
      console.log('Attempting to parse userData...');
      const parsedData = JSON.parse(userData);
      console.log('Parsed userData:', parsedData);
      
      // The login response includes a user object
      const user = parsedData.user || parsedData;
      console.log('User object:', user);
      
      if (!user || !user.role || user.role !== 'teacher') {
        console.log('Invalid user data:', {
          hasUser: !!user,
          hasRole: user?.role,
          isTeacher: user?.role === 'teacher'
        });
        router.push('/login');
        return;
      }

      const name = user.name || user.USN;
      console.log('Setting teacher data:', {
        name: name,
        id: user.USN
      });
      setTeacherName(name);
      setTeacherId(user.USN);
      fetchTeacherData(name);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchTeacherData = async (name: string) => {
    try {
      console.log('Fetching data for teacher:', name);
      // Fetch teacher's courses using teacher's name
      const coursesResponse = await fetch(`/api/teachers/${encodeURIComponent(name)}/courses`);
      if (!coursesResponse.ok) {
        console.error('Failed to fetch courses:', await coursesResponse.text());
        throw new Error('Failed to fetch courses');
      }
      const coursesData = await coursesResponse.json();
      console.log('Courses response:', coursesData);
      setMyCourses(coursesData);

      // Fetch upcoming invigilations using teacher's name
      const invigilationsResponse = await fetch(`/api/teachers/${encodeURIComponent(name)}/invigilations/upcoming`);
      if (!invigilationsResponse.ok) {
        console.error('Failed to fetch invigilations:', await invigilationsResponse.text());
        throw new Error('Failed to fetch invigilations');
      }
      const invigilationsData = await invigilationsResponse.json();
      console.log('Invigilations response:', invigilationsData);
      setInvigilationSchedule(invigilationsData);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      setError('Failed to load teacher data');
    }
  };

  const fetchCourseDetails = async (courseCode: string) => {
    try {
      const response = await fetch(`/api/teachers/courses/${courseCode}`);
      if (!response.ok) throw new Error('Failed to fetch course details');
      const data = await response.json();
      setSelectedCourse(data);
      setEditForm({
        course_code: data.course_code,
        course_name: data.course_name,
        instructor: data.instructor,
        expected_students: Number(data.expected_students) || 0
      });
      setError('');
    } catch (error) {
      console.error('Error fetching course details:', error);
      setError('Failed to load course details');
    }
  };

  const handleUpdateCourse = async (courseCode: string) => {
    try {
      const formData = {
        course_name: editForm.course_name,
        instructor: teacherName,
        expected_students: Number(editForm.expected_students)
      };

      const response = await fetch(`/api/teachers/courses/${courseCode}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error('Failed to update course');
      
      const { course } = await response.json();
      setSelectedCourse(course);
      setIsEditingCourse(false);
      
      // Refresh teacher's courses using teacher's name
      fetchTeacherData(teacherName);
      setError('');
    } catch (error) {
      console.error('Error updating course:', error);
      setError('Failed to update course');
    }
  };

  const handleCreateCourse = async () => {
    try {
      const response = await fetch('/api/teachers/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          instructor: teacherName,
          expected_students: Number(editForm.expected_students)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create course');
      }

      const { course } = await response.json();
      setMyCourses([...myCourses, course]);
      setIsCreatingCourse(false);
      setEditForm({
        course_code: '',
        course_name: '',
        instructor: teacherName,
        expected_students: 0
      });
      setError('');
    } catch (error) {
      console.error('Error creating course:', error);
      setError(error instanceof Error ? error.message : 'Failed to create course');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <Image
            src="/images/RVCE_logo.png"
            alt="RVCE Logo"
            width={150}
            height={150}
            className="mx-auto mb-6"
          />
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Navigation</h2>
        </div>
        <nav className="space-y-1">
          <Link href="/teacher_dashboard" className="flex items-center px-6 py-3 text-gray-600 bg-gray-100 border-l-4 border-indigo-500">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            My Courses
          </Link>
          <Link href="/teacher_dashboard/invigilations" className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Invigilations
          </Link>
          <Link href="/teacher_dashboard/schedules" className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            All Schedules
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {teacherName}</h1>
              <p className="text-gray-600">Manage your courses and invigilation duties</p>
            </div>
            <button
              onClick={() => {
                setIsCreatingCourse(true);
                setSelectedCourse(null);
                setIsEditingCourse(false);
                setEditForm({
                  course_code: '',
                  course_name: '',
                  instructor: teacherName,
                  expected_students: 0
                });
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create New Course
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* My Courses Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 text-indigo-600">My Courses</h2>
              <div className="space-y-4">
                {myCourses.map((course) => (
                  <div
                    key={course.course_code}
                    className="border-l-4 border-indigo-500 pl-4 py-3 bg-gray-50 rounded-r-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      fetchCourseDetails(course.course_code);
                      setIsCreatingCourse(false);
                    }}
                  >
                    <p className="text-lg font-semibold text-gray-800">{course.course_name}</p>
                    <p className="text-sm text-gray-600">{course.course_code}</p>
                    {course.enrolled_students !== undefined && (
                      <p className="text-sm text-gray-600 mt-1">
                        Students: {course.enrolled_students} / {course.expected_students}
                      </p>
                    )}
                  </div>
                ))}
                {myCourses.length === 0 && (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p className="mt-2 text-gray-500">No courses assigned yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Course Management Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 text-indigo-600">
                {isCreatingCourse ? 'Create New Course' : 'Course Management'}
              </h2>

              {(isCreatingCourse || isEditingCourse) ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (isCreatingCourse) {
                    handleCreateCourse();
                  } else if (selectedCourse) {
                    handleUpdateCourse(selectedCourse.course_code);
                  }
                }} className="space-y-4">
                  {isCreatingCourse && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                      <input
                        type="text"
                        value={editForm.course_code}
                        onChange={(e) => setEditForm({...editForm, course_code: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                    <input
                      type="text"
                      value={editForm.course_name}
                      onChange={(e) => setEditForm({...editForm, course_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Students</label>
                    <input
                      type="number"
                      value={editForm.expected_students}
                      onChange={(e) => setEditForm({...editForm, expected_students: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                      min="1"
                    />
                  </div>
                  <div className="flex space-x-3 mt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      {isCreatingCourse ? 'Create Course' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingCourse(false);
                        setIsEditingCourse(false);
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : selectedCourse ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Course Code</p>
                      <p className="text-gray-800 font-medium">{selectedCourse.course_code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Course Name</p>
                      <p className="text-gray-800 font-medium">{selectedCourse.course_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Instructor</p>
                      <p className="text-gray-800 font-medium">{selectedCourse.instructor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Expected Students</p>
                      <p className="text-gray-800 font-medium">{selectedCourse.expected_students}</p>
                    </div>
                    {selectedCourse.enrolled_students !== undefined && (
                      <div>
                        <p className="text-sm text-gray-500">Enrolled Students</p>
                        <p className="text-gray-800 font-medium">{selectedCourse.enrolled_students}</p>
                      </div>
                    )}
                    {selectedCourse.exam_schedule && (
                      <div className="col-span-2 mt-4">
                        <p className="text-sm text-gray-500 mb-2">Exam Schedule</p>
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <p className="text-gray-800">Date: {selectedCourse.exam_schedule.exam_date}</p>
                          <p className="text-gray-800">Time: {selectedCourse.exam_schedule.time_slot}</p>
                          <p className="text-gray-800">Room: {selectedCourse.exam_schedule.room}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={() => setIsEditingCourse(true)}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Edit Course Details
                    </button>
                    <Link
                      href={`/teacher_dashboard/courses/${selectedCourse.course_code}`}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-center"
                    >
                      View Full Details
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Select a course from the list or create a new one
                </div>
              )}
            </div>

            {/* Upcoming Invigilations Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-indigo-600">Upcoming Invigilations</h2>
                <Link
                  href="/teacher_dashboard/invigilations"
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {invigilationSchedule.map((schedule, index) => (
                  <div key={index} className="border-l-4 border-indigo-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-semibold text-gray-800">{schedule.course_code}</p>
                      <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        {schedule.session}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{schedule.course_name}</p>
                    <div className="mt-2 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="text-gray-800">{new Date(schedule.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="text-gray-800">{schedule.session}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Room</p>
                        <p className="text-gray-800">{schedule.room}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {invigilationSchedule.length === 0 && (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-gray-500">No upcoming invigilation duties</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
