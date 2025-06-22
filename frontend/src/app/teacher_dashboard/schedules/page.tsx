'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface ExamSchedule {
  course_code: string;
  course_name: string;
  date: string;
  session: string;
  room: string;
  instructor: string;
  enrolled_students: number;
  room_usns: string[];
  role: 'instructor' | 'invigilator';
}

export default function TeacherSchedules() {
  const router = useRouter();
  const [teacherName, setTeacherName] = useState<string>('');
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [error, setError] = useState<string>('');
  const [selectedSchedule, setSelectedSchedule] = useState<ExamSchedule | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filters
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterRoom, setFilterRoom] = useState<string>('');
  const [filterCourse, setFilterCourse] = useState<string>('');
  const [filterRole, setFilterRole] = useState<'all' | 'instructor' | 'invigilator'>('all');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedData = JSON.parse(userData);
      const user = parsedData.user || parsedData;
      
      if (!user || !user.role || user.role !== 'teacher') {
        router.push('/login');
        return;
      }

      const name = user.name || user.USN;
      setTeacherName(name);
      fetchSchedules(name);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchSchedules = async (name: string) => {
    setLoading(true);
    try {
      // Fetch courses where teacher is instructor
      const coursesResponse = await fetch(`/api/teachers/${encodeURIComponent(name)}/courses`);
      if (!coursesResponse.ok) throw new Error('Failed to fetch courses');
      const coursesData = await coursesResponse.json();
      
      // Fetch invigilation duties
      const invigilationsResponse = await fetch(`/api/teachers/${encodeURIComponent(name)}/invigilations/upcoming`);
      if (!invigilationsResponse.ok) throw new Error('Failed to fetch invigilations');
      const invigilationsData = await invigilationsResponse.json();

      // Combine and mark the role
      const combinedSchedules = [
        ...coursesData.map((course: any) => ({ ...course, role: 'instructor' as const })),
        ...invigilationsData.map((duty: any) => ({ ...duty, role: 'invigilator' as const }))
      ];

      // Sort by date
      combinedSchedules.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setSchedules(combinedSchedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  const formatUSNList = (usns: string[] | string): string[] => {
    if (typeof usns === 'string') {
      try {
        const cleanedStr = usns.replace(/'/g, '"');
        return JSON.parse(cleanedStr);
      } catch (e) {
        console.error('Error parsing USNs:', e);
        return [];
      }
    }
    return usns || [];
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesDate = !filterDate || schedule.date === filterDate;
    const matchesRoom = !filterRoom || schedule.room.toLowerCase().includes(filterRoom.toLowerCase());
    const matchesCourse = !filterCourse || 
      schedule.course_code.toLowerCase().includes(filterCourse.toLowerCase()) ||
      schedule.course_name.toLowerCase().includes(filterCourse.toLowerCase());
    const matchesRole = filterRole === 'all' || schedule.role === filterRole;
    
    return matchesDate && matchesRoom && matchesCourse && matchesRole;
  });

  const clearFilters = () => {
    setFilterDate('');
    setFilterRoom('');
    setFilterCourse('');
    setFilterRole('all');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Sidebar */}
      <div className="w-72 bg-white shadow-2xl border-r border-gray-200/50 backdrop-blur-sm">
        <div className="p-8">
        <div className="text-center mb-8">
            <Image
              src="/images/RVCE_logo.png"
              alt="RVCE Logo"
              width={120}
              height={120}
              className="mx-auto mb-4 rounded-lg"
            />
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              <h2 className="text-xl font-bold">RVCE Portal</h2>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Welcome back,</p>
            <p className="font-semibold text-gray-900 truncate">{teacherName}</p>
          </div>
        </div>
        
        <nav className="px-4 space-y-2">
          <Link href="/teacher_dashboard" className="group flex items-center px-4 py-3 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
            <div className="p-2 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-medium">My Courses</span>
          </Link>
          
          <Link href="/teacher_dashboard/invigilations" className="group flex items-center px-4 py-3 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200">
            <div className="p-2 bg-purple-100 rounded-lg mr-3 group-hover:bg-purple-200 transition-colors">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-medium">Invigilations</span>
          </Link>
          
          <Link href="/teacher_dashboard/schedules" className="group flex items-center px-4 py-3 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg transform">
            <div className="p-2 bg-white/20 rounded-lg mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-medium">All Schedules</span>
            <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
          </Link>
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white text-center">
            <p className="text-sm font-medium">Academic Year 2024-25</p>
            <p className="text-xs opacity-90">Exam Schedule Portal</p>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-screen">
          <div className="max-w-7xl mx-auto py-8 px-6 lg:px-8">
            {/* Enhanced Header Section */}
            <div className="mb-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-6 lg:mb-0">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        All Exam Schedules
                      </h1>
                      <p className="mt-2 text-lg text-gray-600">
                        Comprehensive view of your teaching and invigilation duties
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Teaching</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                      <span>Invigilation</span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/teacher_dashboard"
                  className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-2xl shadow-lg hover:shadow-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </Link>
              </div>
            </div>

            {error && (
              <div className="mb-8 rounded-2xl bg-red-50 border border-red-200 p-6 shadow-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-red-800">Error Loading Schedules</h3>
                    <p className="mt-1 text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-8">
              <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Filter Schedules</h2>
                  </div>
                  {(filterDate || filterRoom || filterCourse || filterRole !== 'all') && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Room</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={filterRoom}
                        onChange={(e) => setFilterRoom(e.target.value)}
                        placeholder="Search by room"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Course</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={filterCourse}
                        onChange={(e) => setFilterCourse(e.target.value)}
                        placeholder="Search by code or name"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Role</label>
                    <div className="relative">
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value as 'all' | 'instructor' | 'invigilator')}
                        className="w-full pl-10 pr-8 py-3 rounded-2xl border border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none bg-white"
                      >
                        <option value="all">All Roles</option>
                        <option value="instructor">Teaching</option>
                        <option value="invigilator">Invigilation</option>
                      </select>
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Schedules List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-xl">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Exam Schedules</h2>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Showing {filteredSchedules.length} of {schedules.length} schedules</span>
                  </div>
                </div>
              </div>
              <div className="p-8">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" style={{animationDelay: '0.15s'}}></div>
                    </div>
                  </div>
                ) : filteredSchedules.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSchedules.map((schedule, index) => (
                      <div 
                        key={index} 
                        onClick={() => setSelectedSchedule(schedule)}
                        className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-1"
                      >
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                          schedule.role === 'instructor'
                            ? 'from-green-500 to-emerald-500'
                            : 'from-indigo-500 to-purple-500'
                        }`}></div>
                        
                        <div className="px-6 py-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                {schedule.course_name}
                              </h3>
                              <p className="text-sm font-medium text-gray-500 mt-1">{schedule.course_code}</p>
                            </div>
                            <div className="flex flex-col items-end space-y-2 ml-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                schedule.role === 'instructor'
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              }`}>
                                {schedule.role === 'instructor' ? 'Teaching' : 'Invigilation'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="p-1 bg-blue-100 rounded-lg">
                                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {new Date(schedule.date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </p>
                                  <p className="text-xs text-gray-500">{schedule.session}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="p-1 bg-purple-100 rounded-lg">
                                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                </div>
                                <p className="text-sm font-medium text-gray-900">{schedule.room}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <div className="flex items-center space-x-2">
                                <div className="p-1 bg-orange-100 rounded-lg">
                                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                  </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {schedule.enrolled_students || 0} students
                                </span>
                              </div>
                              <button className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 text-sm font-medium group-hover:translate-x-1 transition-all">
                                <span>View Details</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="relative inline-block">
                      <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mb-6">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-yellow-800" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No schedules found</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {schedules.length === 0 
                        ? "You don't have any exam schedules at the moment. Check back later for updates."
                        : "Try adjusting your filters to find what you're looking for."
                      }
                    </p>
                    {(filterDate || filterRoom || filterCourse || filterRole !== 'all') && (
                      <button
                        onClick={clearFilters}
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-2xl hover:bg-indigo-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reset Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Schedule Details Modal */}
            {selectedSchedule && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                <div 
                  className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative transform animate-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Enhanced Modal Header */}
                  <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-3xl">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-2xl ${
                          selectedSchedule.role === 'instructor'
                            ? 'bg-green-100'
                            : 'bg-indigo-100'
                        }`}>
                          <svg className={`w-6 h-6 ${
                            selectedSchedule.role === 'instructor'
                              ? 'text-green-600'
                              : 'text-indigo-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedSchedule.course_name}</h3>
                          <div className="flex items-center space-x-4">
                            <p className="text-sm font-medium text-gray-600">{selectedSchedule.course_code}</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                              selectedSchedule.role === 'instructor'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              {selectedSchedule.role === 'instructor' ? 'Teaching' : 'Invigilation'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedSchedule(null)}
                        className="p-2 hover:bg-white/50 rounded-2xl transition-colors group"
                      >
                        <svg className="h-6 w-6 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Modal Content */}
                  <div className="flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      {/* Exam Details Card */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="p-2 bg-blue-100 rounded-xl">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900">Exam Details</h4>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <div className="p-1 bg-blue-100 rounded-lg mt-1">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Date & Time</p>
                              <p className="text-gray-900 font-medium">
                                {new Date(selectedSchedule.date).toLocaleDateString('en-US', { 
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long', 
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-indigo-600 font-semibold">{selectedSchedule.session}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="p-1 bg-purple-100 rounded-lg mt-1">
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Room</p>
                              <p className="text-gray-900 font-medium">{selectedSchedule.room}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="p-1 bg-orange-100 rounded-lg mt-1">
                              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Total Students</p>
                              <p className="text-gray-900 font-medium">{selectedSchedule.enrolled_students || 0}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Course Information Card */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="p-2 bg-green-100 rounded-xl">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900">Course Information</h4>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Course Name</p>
                            <p className="text-gray-900 font-medium">{selectedSchedule.course_name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Course Code</p>
                            <p className="text-gray-900 font-medium">{selectedSchedule.course_code}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Your Role</p>
                            <p className={`font-bold ${
                              selectedSchedule.role === 'instructor'
                                ? 'text-green-700'
                                : 'text-indigo-700'
                            }`}>
                              {selectedSchedule.role === 'instructor' ? 'Course Instructor' : 'Exam Invigilator'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Primary Instructor</p>
                            <p className="text-gray-900 font-medium">{selectedSchedule.instructor}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Student List */}
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-xl">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900">Student List</h4>
                        </div>
                        <div className="bg-white px-3 py-1 rounded-full border border-gray-200">
                          <span className="text-sm font-medium text-gray-600">
                            {formatUSNList(selectedSchedule.room_usns).length} students
                          </span>
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {formatUSNList(selectedSchedule.room_usns).length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {formatUSNList(selectedSchedule.room_usns).map((usn, index) => (
                              <div 
                                key={index} 
                                className="bg-white rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow border border-gray-100 group hover:border-indigo-200"
                              >
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-indigo-400 rounded-full group-hover:bg-indigo-600 transition-colors"></div>
                                  <span className="text-sm font-medium text-gray-700">{usn}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-12 h-12 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                              </svg>
                            </div>
                            <p className="text-gray-500">No students assigned yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setSelectedSchedule(null)}
                        className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}