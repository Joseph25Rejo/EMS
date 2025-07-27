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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="flex h-screen relative z-10">
        {/* Enhanced Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-20' : 'w-72'} transition-all duration-300 ease-in-out`}>
          <div className="h-full bg-white/80 backdrop-blur-xl shadow-2xl border-r border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                {!sidebarCollapsed && (
                  <div className="animate-fade-in">
                    <Image
                      src="/images/RVCE_logo.png"
                      alt="RVCE Logo"
                      width={120}
                      height={120}
                      className="mx-auto mb-4 drop-shadow-lg"
                    />
                    <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-center">
                      RVCE Portal
                    </h2>
                    <div className="text-center mb-8">
                      <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome</h2>
                      <p className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">{teacherName}</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className={`w-5 h-5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <nav className="space-y-2 px-4">
              <Link href="/teacher_dashboard" className="group flex items-center px-4 py-3 text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200">
                <div className="p-2 bg-white/20 rounded-lg mr-3 group-hover:bg-white/30 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                {!sidebarCollapsed && <span className="font-medium">My Courses</span>}
              </Link>
              
              <Link href="/teacher_dashboard/invigilations" className="group flex items-center px-4 py-3 text-gray-600 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-xl transition-all duration-200 hover:shadow-md">
                <div className="p-2 bg-gray-100 group-hover:bg-indigo-100 rounded-lg mr-3 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                {!sidebarCollapsed && <span className="font-medium">Invigilations</span>}
              </Link>
              
              <Link href="/teacher_dashboard/schedules" className="group flex items-center px-4 py-3 text-gray-600 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-xl transition-all duration-200 hover:shadow-md">
                <div className="p-2 bg-gray-100 group-hover:bg-indigo-100 rounded-lg mr-3 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                {!sidebarCollapsed && <span className="font-medium">All Schedules</span>}
              </Link>
            </nav>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
              <div className="animate-fade-in">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-2">
                  Welcome back, {teacherName || 'Professor'}
                </h1>
                <p className="text-gray-600 text-lg">Manage your courses and invigilation duties with ease</p>
              </div>
              <div className="flex gap-4">
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
                  className="group relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create New Course
                  </div>
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('user');
                    router.push('/login');
                  }}
                  className="group relative px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                  title="Logout"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                    </svg>
                    Logout
                  </div>
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-4 rounded-xl shadow-lg animate-fade-in">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Enhanced My Courses Card */}
              <div className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl mr-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    My Courses
                  </h2>
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {myCourses.map((course, index) => (
                    <div
                      key={course.course_code}
                      className="group/item relative bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 cursor-pointer hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                      onClick={() => {
                        fetchCourseDetails(course.course_code);
                        setIsCreatingCourse(false);
                      }}
                      style={{animationDelay: `${index * 100}ms`}}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-purple-500/0 group-hover/item:from-indigo-500/5 group-hover/item:to-purple-500/5 rounded-xl transition-all duration-200"></div>
                      <div className="relative">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-gray-800 group-hover/item:text-indigo-700 transition-colors">
                            {course.course_name}
                          </h3>
                          <span className="px-3 py-1 bg-indigo-500 text-white text-sm rounded-full font-medium shadow-sm">
                            {course.course_code}
                          </span>
                        </div>
                        {course.enrolled_students !== undefined && (
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-gray-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm text-gray-600">
                                {course.enrolled_students}/{course.expected_students} students
                              </span>
                            </div>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                                style={{width: `${(course.enrolled_students / course.expected_students) * 100}%`}}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {myCourses.length === 0 && (
                    <div className="text-center py-12 animate-fade-in">
                      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">No courses assigned yet</p>
                      <p className="text-gray-400 text-sm mt-1">Create your first course to get started</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Course Management Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl mr-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {isCreatingCourse ? 'Create New Course' : 'Course Management'}
                  </h2>
                </div>

                {(isCreatingCourse || isEditingCourse) ? (
                  <div className="animate-fade-in">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (isCreatingCourse) {
                        handleCreateCourse();
                      } else if (selectedCourse) {
                        handleUpdateCourse(selectedCourse.course_code);
                      }
                    }} className="space-y-6">
                      {isCreatingCourse && (
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">Course Code</label>
                          <input
                            type="text"
                            value={editForm.course_code}
                            onChange={(e) => setEditForm({...editForm, course_code: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-indigo-300"
                            placeholder="e.g., CS301"
                            required
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Course Name</label>
                        <input
                          type="text"
                          value={editForm.course_name}
                          onChange={(e) => setEditForm({...editForm, course_name: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-indigo-300"
                          placeholder="e.g., Data Structures and Algorithms"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Expected Students</label>
                        <input
                          type="number"
                          value={editForm.expected_students}
                          onChange={(e) => setEditForm({...editForm, expected_students: parseInt(e.target.value) || 0})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-indigo-300"
                          placeholder="e.g., 120"
                          required
                          min="1"
                        />
                      </div>
                      <div className="flex space-x-4 mt-8">
                        <button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                        >
                          {isCreatingCourse ? 'Create Course' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingCourse(false);
                            setIsEditingCourse(false);
                          }}
                          className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                ) : selectedCourse ? (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 animate-fade-in">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 font-medium">Course Code</p>
                        <p className="text-gray-800 font-bold text-lg">{selectedCourse.course_code}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 font-medium">Course Name</p>
                        <p className="text-gray-800 font-semibold">{selectedCourse.course_name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 font-medium">Instructor</p>
                        <p className="text-gray-800 font-semibold">{selectedCourse.instructor}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 font-medium">Expected Students</p>
                        <p className="text-gray-800 font-semibold">{selectedCourse.expected_students}</p>
                      </div>
                      {selectedCourse.enrolled_students !== undefined && (
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500 font-medium">Enrolled Students</p>
                          <p className="text-gray-800 font-semibold">{selectedCourse.enrolled_students}</p>
                        </div>
                      )}
                      {selectedCourse.exam_schedule && (
                        <div className="col-span-2 mt-4">
                          <p className="text-sm text-gray-500 font-medium mb-3">Exam Schedule</p>
                          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Date</p>
                                <p className="text-gray-800 font-semibold">{selectedCourse.exam_schedule.exam_date}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Time</p>
                                <p className="text-gray-800 font-semibold">{selectedCourse.exam_schedule.time_slot}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Room</p>
                                <p className="text-gray-800 font-semibold">{selectedCourse.exam_schedule.room}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-4 mt-8">
                      <button
                        onClick={() => setIsEditingCourse(true)}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                      >
                        Edit Course Details
                      </button>
                      <Link
                        href={`/teacher_dashboard/courses/${selectedCourse.course_code}`}
                        className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 text-center font-medium"
                      >
                        View Full Details
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 animate-fade-in">
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">Select a course from the list</p>
                    <p className="text-gray-400 text-sm mt-1">or create a new one to get started</p>
                  </div>
                )}
              </div>

              {/* Enhanced Upcoming Invigilations Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 lg:col-span-2 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl mr-4 shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      Upcoming Invigilations
                    </h2>
                  </div>
                  <Link
                    href="/teacher_dashboard/invigilations"
                    className="group flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                  >
                    <span className="mr-2">View All</span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {invigilationSchedule.map((schedule, index) => (
                    <div 
                      key={index} 
                      className="group/invigilation relative bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-6 hover:from-emerald-100 hover:to-teal-100 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                      style={{animationDelay: `${index * 150}ms`}}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-teal-500/0 group-hover/invigilation:from-emerald-500/5 group-hover/invigilation:to-teal-500/5 rounded-xl transition-all duration-200"></div>
                      <div className="relative">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 group-hover/invigilation:text-emerald-700 transition-colors">
                              {schedule.course_code}
                            </h3>
                            <p className="text-gray-600 font-medium">{schedule.course_name}</p>
                          </div>
                          <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm rounded-full font-medium shadow-sm">
                            {schedule.session}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div className="flex items-center">
                            <div className="p-2 bg-white rounded-lg mr-3 shadow-sm">
                              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Date</p>
                              <p className="text-gray-800 font-semibold">{new Date(schedule.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="p-2 bg-white rounded-lg mr-3 shadow-sm">
                              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Time</p>
                              <p className="text-gray-800 font-semibold">{schedule.session}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="p-2 bg-white rounded-lg mr-3 shadow-sm">
                              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Room</p>
                              <p className="text-gray-800 font-semibold">{schedule.room}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {invigilationSchedule.length === 0 && (
                    <div className="text-center py-12 animate-fade-in">
                      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">No upcoming invigilation duties</p>
                      <p className="text-gray-400 text-sm mt-1">You're all caught up for now!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}