'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  BookOpen, 
  Building, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  Plus,
  Eye,
  RefreshCw
} from 'lucide-react';
import { API_ENDPOINTS } from '../../lib/config';

interface Statistics {
  courses: number;
  students: number;
  rooms: number;
  enrollments: number;
  schedules: number;
  most_popular_course: {
    _id: string;
    count: number;
  } | null;
}

interface Conflict {
  type: string;
  message: string;
  details?: any;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch statistics with error handling
      try {
        const statsResponse = await fetch(API_ENDPOINTS.STATISTICS, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!statsResponse.ok) {
          throw new Error(`HTTP error! status: ${statsResponse.status}`);
        }
        
        // Try to parse JSON, but handle non-JSON responses
        try {
          const statsData = await statsResponse.json();
          setStats(statsData);
        } catch (jsonError) {
          console.error('Error parsing JSON:', jsonError);
          // If JSON parsing fails, create a default stats object
          setStats({
            courses: 0,
            students: 0,
            rooms: 0,
            enrollments: 0,
            schedules: 0,
            most_popular_course: null
          });
        }
      } catch (statsError) {
        console.error('Error fetching statistics:', statsError);
        // Set default values if stats fetch fails
        setStats({
          courses: 0,
          students: 0,
          rooms: 0,
          enrollments: 0,
          schedules: 0,
          most_popular_course: null
        });
      }

      // Fetch conflicts (non-blocking)
      try {
        const conflictsResponse = await fetch(API_ENDPOINTS.CONFLICTS, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (conflictsResponse.ok) {
          try {
            const conflictsData = await conflictsResponse.json();
            setConflicts(Array.isArray(conflictsData?.conflicts) ? conflictsData.conflicts : []);
          } catch (e) {
            console.warn('Failed to parse conflicts:', e);
            setConflicts([]);
          }
        }
      } catch (conflictError) {
        console.warn('Failed to fetch conflicts:', conflictError);
        setConflicts([]);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    href 
  }: { 
    title: string
    value: number | string
    icon: any
    color: string
    href?: string
  }) => {
    const cardContent = (
      <div className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${href ? 'cursor-pointer' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    )

    return href ? <Link href={href}>{cardContent}</Link> : cardContent
  }

  const QuickActionCard = ({ 
    title, 
    description, 
    icon: Icon, 
    href, 
    color 
  }: {
    title: string
    description: string
    icon: any
    href: string
    color: string
  }) => (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start space-x-4">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchData();
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Error loading dashboard</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of your exam scheduling system
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Courses"
          value={stats?.courses || 0}
          icon={BookOpen}
          color="bg-blue-500"
          href="/admin/courses"
        />
        <StatCard
          title="Total Students"
          value={stats?.students || 0}
          icon={Users}
          color="bg-green-500"
          href="/admin/students"
        />
        <StatCard
          title="Available Rooms"
          value={stats?.rooms || 0}
          icon={Building}
          color="bg-purple-500"
          href="/admin/rooms"
        />
        <StatCard
          title="Total Enrollments"
          value={stats?.enrollments || 0}
          icon={TrendingUp}
          color="bg-orange-500"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">Generated Schedules</span>
              <span className="text-sm font-medium text-gray-900">{stats?.schedules || 0}</span>
            </div>
            {stats?.most_popular_course && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Most Popular Course</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.most_popular_course._id} ({stats.most_popular_course.count} students)
                </span>
              </div>
            )}
          </div>
          <Link 
            href="/admin/schedules" 
            className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
          >
            <Eye className="h-4 w-4 mr-1" />
            View all schedules
          </Link>
        </div>

        {/* Conflicts Panel */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Schedule Conflicts</h3>
            {conflicts.length > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {conflicts.length} conflicts
              </span>
            )}
          </div>
          
          {conflicts.length === 0 ? (
            <div className="text-center py-4">
              <AlertTriangle className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No scheduling conflicts detected</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {conflicts.slice(0, 3).map((conflict, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 bg-red-50 rounded">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700">{conflict.message}</p>
                </div>
              ))}
              {conflicts.length > 3 && (
                <p className="text-xs text-gray-500 text-center">
                  And {conflicts.length - 3} more conflicts...
                </p>
              )}
            </div>
          )}
          
          <Link 
            href="/admin/schedules/conflicts" 
            className="mt-4 inline-flex items-center text-sm text-red-600 hover:text-red-500"
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            View all conflicts
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            title="Add New Course"
            description="Create a new course and set up its details"
            icon={Plus}
            href="/admin/courses/create"
            color="bg-blue-500"
          />
          <QuickActionCard
            title="Add Room"
            description="Register a new examination room"
            icon={Building}
            href="/admin/rooms/create"
            color="bg-green-500"
          />
          <QuickActionCard
            title="Generate Schedule"
            description="Create exam schedule using AI algorithms"
            icon={Calendar}
            href="/admin/schedule"
            color="bg-purple-500"
          />
          <QuickActionCard
            title="Enroll Students"
            description="Add students to courses"
            icon={Users}
            href="/admin/students/enroll"
            color="bg-orange-500"
          />
          <QuickActionCard
            title="View Schedules"
            description="Browse and filter exam schedules"
            icon={Eye}
            href="/admin/schedules"
            color="bg-indigo-500"
          />
          <QuickActionCard
            title="Check Conflicts"
            description="Review scheduling conflicts and issues"
            icon={AlertTriangle}
            href="/admin/schedules/conflicts"
            color="bg-red-500"
          />
        </div>
      </div>
    </div>
  )
}