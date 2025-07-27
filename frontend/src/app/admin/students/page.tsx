'use client';

import { useState, useEffect } from 'react';
import { Users, GraduationCap, BookOpen, Clock, Loader2, UserPlus } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000https://ems-oty3.onrender.com/api';
import { toast } from 'react-hot-toast';
import StudentTable from '../components/StudentTable';
import { StatCard } from '../components/StatsCard';

interface Statistics {
  students: number;
  enrollments: number;
  courses: number;
  rooms: number;
  schedules: number;
  most_popular_course?: {
    _id: string;
    count: number;
  };
}

export default function StudentsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'enrollments' | 'reports'>('all');

  // Fetch statistics
  const fetchStatistics = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching statistics from:', `${API_BASE_URL}/statistics`);
      const response = await fetch(`${API_BASE_URL}/statistics`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch statistics: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Statistics data:', data);
      setStats({
        students: data.students || 0,
        enrollments: data.enrollments || 0,
        courses: data.courses || 0,
        rooms: data.rooms || 0,
        schedules: data.schedules || 0,
        most_popular_course: data.most_popular_course
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Handle tab change
  const handleTabChange = (tab: 'all' | 'enrollments' | 'reports') => {
    setActiveTab(tab);
  };

  // Handle card click to filter by category
  const handleCardClick = (key: string) => {
    // You can implement filtering logic based on the clicked card
    console.log('Card clicked:', key);
    // For example, you might want to filter the student table
    // setActiveFilter(key);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
              Student Management
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage student enrollments, view statistics, and generate reports
            </p>
          </div>
          <div className="mt-4 flex md:mt-0">
            <button
              type="button"
              className="ml-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <UserPlus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Add Student
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { name: 'All Students', value: 'all' },
                { name: 'Enrollments', value: 'enrollments' },
                { name: 'Reports', value: 'reports' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value as any)}
                  className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                    activeTab === tab.value
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Students"
            value={stats.students?.toLocaleString() || '0'}
            icon={<Users className="h-6 w-6 text-blue-600" />}
            change={0}
            onClick={() => handleCardClick('students')}
          />
          <StatCard
            title="Active Enrollments"
            value={stats.enrollments?.toLocaleString() || '0'}
            icon={<BookOpen className="h-6 w-6 text-green-600" />}
            change={0}
            onClick={() => handleCardClick('enrollments')}
          />
          <StatCard
            title="Courses Offered"
            value={stats.courses?.toLocaleString() || '0'}
            icon={<GraduationCap className="h-6 w-6 text-purple-600" />}
            change={0}
            onClick={() => handleCardClick('courses')}
          />
          {stats.most_popular_course && (
            <StatCard
              title="Most Popular Course"
              value={stats.most_popular_course._id}
              subtitle={`${stats.most_popular_course.count} enrollments`}
              icon={<Clock className="h-6 w-6 text-purple-600" />}
              change={0}
              onClick={() => handleCardClick('popular')}
            />
          )}
        </div>
      ) : (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">No data available</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Failed to load student statistics. Please try again later.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mt-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h2 className="text-lg font-medium leading-6 text-gray-900">
              {activeTab === 'all' && 'All Students'}
              {activeTab === 'enrollments' && 'Course Enrollments'}
              {activeTab === 'reports' && 'Student Reports'}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {activeTab === 'all' && 'View and manage all student records'}
              {activeTab === 'enrollments' && 'Manage course enrollments and assignments'}
              {activeTab === 'reports' && 'Generate and view student reports'}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              {activeTab === 'reports' ? 'Generate Report' : 'Add New'}
            </button>
          </div>
        </div>

        {/* Student Table */}
        <div className="mt-8">
          <StudentTable />
        </div>
      </div>
    </div>
  );
}