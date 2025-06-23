'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Users, LayoutGrid, Calendar, Settings, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Course {
  _id: string;
  course_code: string;
  course_name: string;
  department: string;
  credits: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CourseDetailsPage() {
  const { courseCode } = useParams<{ courseCode: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${courseCode}`);
        if (!response.ok) {
          throw new Error('Failed to fetch course');
        }
        const data = await response.json();
        setCourse(data);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseCode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'Course not found'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      name: 'Benches',
      href: `/admin/courses/${courseCode}/benches`,
      icon: <LayoutGrid className="h-5 w-5" />,
      description: 'Manage course benches and seating arrangements'
    },
    {
      name: 'Students',
      href: `/admin/courses/${courseCode}/students`,
      icon: <Users className="h-5 w-5" />,
      description: 'View and manage enrolled students'
    },
    {
      name: 'Schedule',
      href: `/admin/courses/${courseCode}/schedule`,
      icon: <Calendar className="h-5 w-5" />,
      description: 'View and manage course schedule'
    },
    {
      name: 'Settings',
      href: `/admin/courses/${courseCode}/settings`,
      icon: <Settings className="h-5 w-5" />,
      description: 'Course settings and configurations'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link 
          href="/admin/courses" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Courses
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.course_code} - {course.course_name}</h1>
            <p className="text-gray-600 mt-1">{course.department} • {course.credits} Credits</p>
          </div>
        </div>

        {course.description && (
          <p className="mt-4 text-gray-700">{course.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors duration-200">
                {item.icon}
              </div>
              <h3 className="ml-4 text-lg font-medium text-gray-900 group-hover:text-blue-600">
                {item.name}
              </h3>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {item.description}
            </p>
            <div className="mt-4 flex items-center text-sm text-blue-600 group-hover:underline">
              View {item.name.toLowerCase()}
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
