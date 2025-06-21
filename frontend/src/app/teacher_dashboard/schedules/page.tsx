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
          <Link href="/teacher_dashboard" className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50">
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
          <Link href="/teacher_dashboard/schedules" className="flex items-center px-6 py-3 text-gray-600 bg-gray-100 border-l-4 border-indigo-500">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            All Schedules
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="mb-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                    All Exam Schedules
                  </h1>
                  <p className="mt-2 text-lg text-gray-600">
                    View and manage your teaching and invigilation schedules
                  </p>
                </div>
                <Link
                  href="/teacher_dashboard"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  ← Back to Dashboard
                </Link>
              </div>
            </div>

            {error && (
              <div className="mb-8 rounded-xl bg-red-50 border-l-4 border-red-500 p-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
              <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                    <input
                      type="text"
                      value={filterRoom}
                      onChange={(e) => setFilterRoom(e.target.value)}
                      placeholder="Search by room"
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                    <input
                      type="text"
                      value={filterCourse}
                      onChange={(e) => setFilterCourse(e.target.value)}
                      placeholder="Search by code or name"
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value as 'all' | 'instructor' | 'invigilator')}
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                    >
                      <option value="all">All Roles</option>
                      <option value="instructor">Teaching</option>
                      <option value="invigilator">Invigilation</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedules List */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white">
                <h2 className="text-2xl font-bold text-gray-900">Exam Schedules</h2>
              </div>
              <div className="p-8">
                {filteredSchedules.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSchedules.map((schedule, index) => (
                      <div 
                        key={index} 
                        onClick={() => setSelectedSchedule(schedule)}
                        className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${
                          schedule.role === 'instructor'
                            ? 'from-green-500 to-emerald-500'
                            : 'from-indigo-500 to-purple-500'
                        } opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                        <div className="px-6 py-5">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {schedule.course_name}
                              </h3>
                              <p className="text-sm text-gray-500">{schedule.course_code}</p>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                schedule.role === 'instructor'
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-indigo-50 text-indigo-700'
                              }`}>
                                {schedule.role === 'instructor' ? 'Teaching' : 'Invigilation'}
                              </span>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                                {schedule.session}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Date</p>
                              <p className="mt-1 text-gray-900">{new Date(schedule.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Room</p>
                              <p className="mt-1 text-gray-900">{schedule.room}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Students</p>
                              <p className="mt-1 text-gray-900">{schedule.enrolled_students || 0}</p>
                            </div>
                            <div className="flex items-center justify-end">
                              <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                                View Details →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No schedules found</h3>
                    <p className="mt-1 text-gray-500">Try adjusting your filters to find what you're looking for.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule Details Modal */}
        {selectedSchedule && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div 
              className="bg-white rounded-2xl max-w-3xl w-full h-[90vh] flex flex-col shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header - Fixed */}
              <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedSchedule.course_name}</h3>
                  <p className="text-sm text-gray-600">{selectedSchedule.course_code}</p>
                </div>
                <button
                  onClick={() => setSelectedSchedule(null)}
                  className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                >
                  <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Exam Details</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date & Time</p>
                        <p className="mt-1 text-gray-900">
                          {new Date(selectedSchedule.date).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long', 
                            day: 'numeric'
                          })}
                          <span className="ml-2 text-indigo-600">{selectedSchedule.session}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Room</p>
                        <p className="mt-1 text-gray-900">{selectedSchedule.room}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Students</p>
                        <p className="mt-1 text-gray-900">{selectedSchedule.enrolled_students || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Course Name</p>
                        <p className="mt-1 text-gray-900">{selectedSchedule.course_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Course Code</p>
                        <p className="mt-1 text-gray-900">{selectedSchedule.course_code}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Role</p>
                        <p className={`mt-1 font-medium ${
                          selectedSchedule.role === 'instructor'
                            ? 'text-green-700'
                            : 'text-indigo-700'
                        }`}>
                          {selectedSchedule.role === 'instructor' ? 'Teaching' : 'Invigilation'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Instructor</p>
                        <p className="mt-1 text-gray-900">{selectedSchedule.instructor}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Student List</h4>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {formatUSNList(selectedSchedule.room_usns).map((usn, index) => (
                        <div 
                          key={index} 
                          className="bg-white rounded-lg px-4 py-2 text-sm text-gray-700 shadow-sm hover:shadow transition-shadow"
                        >
                          {usn}
                        </div>
                      ))}
                    </div>
                  </div>
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