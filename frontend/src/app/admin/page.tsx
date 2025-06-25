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
  RefreshCw,
  ArrowUpRight,
  Activity,
  Clock,
  CheckCircle
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
        
        try {
          const statsData = await statsResponse.json();
          setStats(statsData);
        } catch (jsonError) {
          console.error('Error parsing JSON:', jsonError);
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

  const EnhancedStatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    gradient, 
    href,
    change,
    changeType = 'positive'
  }: { 
    title: string
    value: number | string
    icon: any
    gradient: string
    href?: string
    change?: string
    changeType?: 'positive' | 'negative'
  }) => {
    const cardContent = (
      <div className={`group relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${href ? 'cursor-pointer' : ''}`}>
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${gradient}`} />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${gradient} shadow-lg`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            {href && (
              <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
            {change && (
              <div className={`flex items-center text-sm ${
                changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`h-4 w-4 mr-1 ${
                  changeType === 'negative' ? 'rotate-180' : ''
                }`} />
                {change}
              </div>
            )}
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
    gradient 
  }: {
    title: string
    description: string
    icon: any
    href: string
    gradient: string
  }) => (
    <Link href={href}>
      <div className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-xl ${gradient} shadow-lg group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </div>
    </Link>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
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
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Error loading dashboard</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
            <p className="text-blue-100 text-lg">
              Here's what's happening with your exam scheduling system today.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Activity className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnhancedStatCard
          title="Total Courses"
          value={stats?.courses || 0}
          icon={BookOpen}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          href="/admin/courses"
          change="+12% from last month"
        />
        <EnhancedStatCard
          title="Total Students"
          value={stats?.students || 0}
          icon={Users}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          href="/admin/students"
          change="+8% from last month"
        />
        <EnhancedStatCard
          title="Available Rooms"
          value={stats?.rooms || 0}
          icon={Building}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          href="/admin/rooms"
          change="+2 new rooms"
        />
        <EnhancedStatCard
          title="Total Enrollments"
          value={stats?.enrollments || 0}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
          change="+15% from last month"
        />
      </div>

      {/* Enhanced Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900">Schedule Overview</h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="font-medium text-slate-900">Generated Schedules</span>
              </div>
              <span className="text-xl font-bold text-slate-900">{stats?.schedules || 0}</span>
            </div>
            {stats?.most_popular_course && (
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span className="font-medium text-slate-900">Most Popular Course</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">{stats.most_popular_course._id}</div>
                  <div className="text-sm text-slate-600">{stats.most_popular_course.count} students</div>
                </div>
              </div>
            )}
          </div>
          <Link 
            href="/admin/schedules" 
            className="mt-6 inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <Eye className="h-4 w-4 mr-2" />
            View all schedules
          </Link>
        </div>

        {/* Enhanced Conflicts Panel */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900">Schedule Conflicts</h3>
            <div className="flex items-center space-x-2">
              {conflicts.length > 0 ? (
                <span className="bg-red-100 text-red-700 text-sm font-medium px-3 py-1 rounded-full">
                  {conflicts.length} conflicts
                </span>
              ) : (
                <span className="bg-emerald-100 text-emerald-700 text-sm font-medium px-3 py-1 rounded-full">
                  All clear
                </span>
              )}
            </div>
          </div>
          
          {conflicts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
              <p className="text-slate-600 font-medium">No scheduling conflicts detected</p>
              <p className="text-sm text-slate-500 mt-1">Your schedule is running smoothly!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {conflicts.slice(0, 3).map((conflict, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-red-50 rounded-xl border border-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-900">{conflict.type}</p>
                    <p className="text-sm text-red-700 mt-1">{conflict.message}</p>
                  </div>
                </div>
              ))}
              {conflicts.length > 3 && (
                <div className="text-center py-2">
                  <p className="text-sm text-slate-500">
                    And {conflicts.length - 3} more conflicts...
                  </p>
                </div>
              )}
            </div>
          )}
          
          <Link 
            href="/admin/schedules/conflicts" 
            className="mt-6 inline-flex items-center text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {conflicts.length > 0 ? 'Resolve conflicts' : 'View conflict history'}
          </Link>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Quick Actions</h2>
          <p className="text-slate-600">Streamline your workflow with these shortcuts</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard
            title="Add New Course"
            description="Create a new course and set up its details"
            icon={Plus}
            href="/admin/courses/create"
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <QuickActionCard
            title="Add Room"
            description="Register a new examination room"
            icon={Building}
            href="/admin/rooms/create"
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <QuickActionCard
            title="Generate Schedule"
            description="Create exam schedule using AI algorithms"
            icon={Calendar}
            href="/admin/schedule"
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <QuickActionCard
            title="Enroll Students"
            description="Add students to courses"
            icon={Users}
            href="/admin/students/enroll"
            gradient="bg-gradient-to-br from-orange-500 to-orange-600"
          />S
          <QuickActionCard
            title="View Schedules"
            description="Browse and filter exam schedules"
            icon={Eye}
            href="/admin/schedules"
            gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
          />
          <QuickActionCard
            title="System Health"
            description="Monitor system performance and logs"
            icon={Activity}
            href="/admin/system"
            gradient="bg-gradient-to-br from-teal-500 to-teal-600"
          />
        </div>
      </div>
    </div>
  )
}