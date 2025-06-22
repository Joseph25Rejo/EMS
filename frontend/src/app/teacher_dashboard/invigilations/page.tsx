'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface InvigilationDuty {
  course_code: string;
  course_name: string;
  date: string;
  session: string;
  room: string;
  enrolled_students: number;
  room_usns: string[];
  instructor: string;
}

export default function TeacherInvigilations() {
  const router = useRouter();
  const [teacherName, setTeacherName] = useState<string>('');
  const [upcomingInvigilations, setUpcomingInvigilations] = useState<InvigilationDuty[]>([]);
  const [pastInvigilations, setPastInvigilations] = useState<InvigilationDuty[]>([]);
  const [error, setError] = useState<string>('');
  const [selectedDuty, setSelectedDuty] = useState<InvigilationDuty | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
      fetchInvigilations(name);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchInvigilations = async (name: string) => {
    setLoading(true);
    try {
      console.log('Fetching invigilations for teacher:', name);
      // Fetch upcoming invigilations
      const upcomingResponse = await fetch(`/api/teachers/${encodeURIComponent(name)}/invigilations/upcoming`);
      if (!upcomingResponse.ok) {
        console.error('Failed to fetch upcoming invigilations:', await upcomingResponse.text());
        throw new Error('Failed to fetch upcoming invigilations');
      }
      const upcomingData = await upcomingResponse.json();
      console.log('Upcoming invigilations response:', upcomingData);
      setUpcomingInvigilations(upcomingData);

      // Fetch past invigilations
      const pastResponse = await fetch(`/api/teachers/${encodeURIComponent(name)}/invigilations/history`);
      if (!pastResponse.ok) {
        console.error('Failed to fetch past invigilations:', await pastResponse.text());
        throw new Error('Failed to fetch past invigilations');
      }
      const pastData = await pastResponse.json();
      console.log('Past invigilations response:', pastData);
      setPastInvigilations(pastData);
    } catch (error) {
      console.error('Error fetching invigilations:', error);
      setError('Failed to load invigilation data');
    } finally {
      setLoading(false);
    }
  };

  const formatUSNList = (usns: string[] | string): string[] => {
    if (typeof usns === 'string') {
      try {
        // Remove single quotes and parse as JSON array
        const cleanedStr = usns.replace(/'/g, '"');
        return JSON.parse(cleanedStr);
      } catch (e) {
        console.error('Error parsing USNs:', e);
        return [];
      }
    }
    return usns || [];
  };

  const getDaysUntilExam = (date: string) => {
    const examDate = new Date(date);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (daysUntil: number) => {
    if (daysUntil <= 1) return 'bg-red-50 border-red-200 text-red-700';
    if (daysUntil <= 3) return 'bg-orange-50 border-orange-200 text-orange-700';
    if (daysUntil <= 7) return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    return 'bg-green-50 border-green-200 text-green-700';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Enhanced Sidebar */}
      <div className="w-72 bg-white shadow-xl border-r border-gray-200">
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
          <Link href="/teacher_dashboard" className="group flex items-center px-4 py-3 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-indigo-100 mr-3 transition-colors">
              <svg className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-medium">My Courses</span>
          </Link>
          
          <div className="flex items-center px-4 py-3 text-white rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-medium">Invigilations</span>
          </div>
          
          <Link href="/teacher_dashboard/schedules" className="group flex items-center px-4 py-3 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-indigo-100 mr-3 transition-colors">
              <svg className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-medium">All Schedules</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
          <div className="max-w-7xl mx-auto py-8 px-6 lg:px-8">
            {/* Enhanced Header Section */}
            <div className="mb-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-6 lg:mb-0">
                  <div className="flex items-center mb-4">
                    <div className="w-2 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full mr-4"></div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                      Invigilation Duties
                    </h1>
                  </div>
                  <p className="text-lg text-gray-600 max-w-2xl">
                    Manage your upcoming and past examination duties with comprehensive details and student information
                  </p>
                </div>
                <Link
                  href="/teacher_dashboard"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </Link>
              </div>
            </div>

            {/* Enhanced Error Display */}
            {error && (
              <div className="mb-8 rounded-2xl bg-red-50 border border-red-200 p-6 shadow-sm">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-red-800 font-medium">Error Loading Data</h3>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
                <p className="text-gray-600 font-medium">Loading invigilation duties...</p>
              </div>
            )}

            {!loading && (
              <>
                {/* Enhanced Upcoming Invigilations */}
                <div className="mb-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">Upcoming Invigilations</h2>
                        <p className="text-indigo-100 mt-1">Your scheduled examination duties</p>
                      </div>
                      <div className="bg-white/20 rounded-full px-4 py-2">
                        <span className="text-white font-semibold">{upcomingInvigilations.length} duties</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    {upcomingInvigilations.length > 0 ? (
                      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {upcomingInvigilations.map((duty, index) => {
                          const daysUntil = getDaysUntilExam(duty.date);
                          return (
                            <div 
                              key={index} 
                              onClick={() => setSelectedDuty(duty)}
                              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border-2 border-gray-100 hover:border-indigo-200 transform hover:-translate-y-1"
                            >
                              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                              <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1 line-clamp-2">
                                      {duty.course_name}
                                    </h3>
                                    <p className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full inline-block">
                                      {duty.course_code}
                                    </p>
                                  </div>
                                  <div className="ml-4">
                                    <span className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium border ${getUrgencyColor(daysUntil)}`}>
                                      {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="space-y-3 mb-6">
                                  <div className="flex items-center text-gray-700">
                                    <svg className="w-4 h-4 mr-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="font-medium">{new Date(duty.date).toLocaleDateString('en-US', { 
                                      weekday: 'short',
                                      month: 'short', 
                                      day: 'numeric'
                                    })}</span>
                                    <span className="ml-2 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium">
                                      {duty.session}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center text-gray-700">
                                    <svg className="w-4 h-4 mr-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span className="font-medium">Room {duty.room}</span>
                                  </div>
                                  
                                  <div className="flex items-center text-gray-700">
                                    <svg className="w-4 h-4 mr-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                    <span className="font-medium">{duty.enrolled_students || 0} students</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                  <div className="text-sm text-gray-500">
                                    <span className="font-medium">Instructor:</span> {duty.instructor}
                                  </div>
                                  <div className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium">
                                    <span className="mr-1">View Details</span>
                                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 mb-6">
                          <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No upcoming duties</h3>
                        <p className="text-gray-600 max-w-sm mx-auto">You don't have any upcoming invigilation duties scheduled at the moment.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Past Invigilations */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="px-8 py-6 bg-gradient-to-r from-gray-600 to-gray-700 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">Past Invigilations</h2>
                        <p className="text-gray-200 mt-1">Your completed examination duties</p>
                      </div>
                      <div className="bg-white/20 rounded-full px-4 py-2">
                        <span className="text-white font-semibold">{pastInvigilations.length} completed</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    {pastInvigilations.length > 0 ? (
                      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {pastInvigilations.map((duty, index) => (
                          <div 
                            key={index} 
                            onClick={() => setSelectedDuty(duty)}
                            className="group relative bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border-2 border-gray-100 hover:border-gray-300"
                          >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-400 to-gray-500"></div>
                            <div className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors mb-1 line-clamp-2">
                                    {duty.course_name}
                                  </h3>
                                  <p className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full inline-block">
                                    {duty.course_code}
                                  </p>
                                </div>
                                <span className="inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                  Completed
                                </span>
                              </div>
                              
                              <div className="space-y-3 mb-6">
                                <div className="flex items-center text-gray-600">
                                  <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="font-medium">{new Date(duty.date).toLocaleDateString('en-US', { 
                                    weekday: 'short',
                                    month: 'short', 
                                    day: 'numeric'
                                  })}</span>
                                  <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-sm font-medium">
                                    {duty.session}
                                  </span>
                                </div>
                                
                                <div className="flex items-center text-gray-600">
                                  <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <span className="font-medium">Room {duty.room}</span>
                                </div>
                                
                                <div className="flex items-center text-gray-600">
                                  <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                  </svg>
                                  <span className="font-medium">{duty.enrolled_students || 0} students</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="text-sm text-gray-500">
                                  <span className="font-medium">Instructor:</span> {duty.instructor}
                                </div>
                                <div className="flex items-center text-gray-600 hover:text-gray-700 font-medium">
                                  <span className="mr-1">View Details</span>
                                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 mb-6">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No past duties</h3>
                        <p className="text-gray-600 max-w-sm mx-auto">You haven't completed any invigilation duties yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Enhanced Modal */}
            {selectedDuty && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div 
                  className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header - Fixed */}
                  <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-3xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-2xl font-bold">{selectedDuty.course_name}</h3>
                        <p className="text-indigo-100 mt-1">{selectedDuty.course_code}</p>
                      </div>
                      <button
                        onClick={() => setSelectedDuty(null)}
                        className="rounded-full p-2 hover:bg-white/20 transition-colors"
                      >
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Modal Content - Scrollable */}
                  <div className="flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900">Exam Details</h4>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-sm font-medium text-gray-500 mb-1">Date & Time</p>
                            <p className="text-gray-900 font-semibold">
                              {new Date(selectedDuty.date).toLocaleDateString('en-US', { 
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long', 
                                day: 'numeric'
                              })}
                            </p>
                            <span className="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                              {selectedDuty.session}
                            </span>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-sm font-medium text-gray-500 mb-1">Location</p>
                            <p className="text-gray-900 font-semibold text-lg">Room {selectedDuty.room}</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Students</p>
                            <div className="flex items-center">
                              <p className="text-gray-900 font-semibold text-2xl mr-2">{selectedDuty.enrolled_students || 0}</p>
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900">Course Information</h4>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-sm font-medium text-gray-500 mb-1">Course Name</p>
                            <p className="text-gray-900 font-semibold">{selectedDuty.course_name}</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-sm font-medium text-gray-500 mb-1">Course Code</p>
                            <p className="text-gray-900 font-semibold text-lg">{selectedDuty.course_code}</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-sm font-medium text-gray-500 mb-1">Course Instructor</p>
                            <p className="text-gray-900 font-semibold">{selectedDuty.instructor}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900">Student List</h4>
                        </div>
                        <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          {formatUSNList(selectedDuty.room_usns).length} students
                        </div>
                      </div>
                      
                      {formatUSNList(selectedDuty.room_usns).length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
                          {formatUSNList(selectedDuty.room_usns).map((usn, index) => (
                            <div 
                              key={index} 
                              className="bg-white rounded-xl px-4 py-3 text-sm text-gray-700 shadow-sm hover:shadow-md transition-shadow border border-gray-100 font-mono"
                            >
                              {usn}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                          <p className="text-gray-500">No student list available</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Modal Footer */}
                  <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setSelectedDuty(null)}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
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