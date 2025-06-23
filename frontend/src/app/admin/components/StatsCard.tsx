'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Home, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  change?: number;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  change,
  loading = false,
  onClick,
  className = ''
}: StatCardProps) => {
  const isPositive = change !== undefined ? change >= 0 : null;
  
  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
      className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="mt-1">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {loading && (
            <div className="h-8 flex items-center">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}
        </div>
        <div className="p-2 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
      
      {change !== undefined && !loading && (
        <div className={`mt-4 flex items-center text-sm ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {isPositive ? (
            <ArrowUpRight className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 mr-1" />
          )}
          <span>{Math.abs(change)}% from last period</span>
        </div>
      )}
    </motion.div>
  );
};

interface StatsOverviewProps {
  stats?: {
    totalStudents?: number;
    totalCourses?: number;
    totalRooms?: number;
    upcomingExams?: number;
    conflicts?: number;
  };
  loading?: boolean;
  onCardClick?: (card: string) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

const StatsCard = ({ stats, loading = false, onCardClick, searchTerm = '', onSearchChange }: StatsOverviewProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search statistics..."
          value={searchTerm}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange?.('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents?.toLocaleString() ?? '0'}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          change={5.2}
          onClick={() => onCardClick?.('students')}
        />
        <StatCard
          title="Total Courses"
          value={stats?.totalCourses?.toLocaleString() ?? '0'}
          icon={<BookOpen className="h-6 w-6 text-emerald-600" />}
          change={12.5}
          onClick={() => onCardClick?.('courses')}
        />
        <StatCard
          title="Total Rooms"
          value={stats?.totalRooms?.toLocaleString() ?? '0'}
          icon={<Home className="h-6 w-6 text-amber-600" />}
          change={2.1}
          onClick={() => onCardClick?.('rooms')}
        />
        <StatCard
          title="Upcoming Exams"
          value={stats?.upcomingExams?.toLocaleString() ?? '0'}
          icon={<Calendar className="h-6 w-6 text-purple-600" />}
          change={-1.8}
          onClick={() => onCardClick?.('exams')}
        />
      </div>
    </div>
  );
}

export default StatsCard;