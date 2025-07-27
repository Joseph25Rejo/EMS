'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, BookOpen, BookType, Clock, Users, Calendar, BookText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface FormData {
  course_code: string;
  course_name: string;
  credits: number;
  department: string;
  semester: number;
  max_students: number;
  description: string;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    course_code: '',
    course_name: '',
    credits: 3,
    department: 'CSE',
    semester: 1,
    max_students: 60,
    description: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const departments = [
    { value: 'CSE', label: 'Computer Science & Engineering' },
    { value: 'ECE', label: 'Electronics & Communication' },
    { value: 'EEE', label: 'Electrical & Electronics' },
    { value: 'MECH', label: 'Mechanical Engineering' },
    { value: 'CIVIL', label: 'Civil Engineering' },
    { value: 'IT', label: 'Information Technology' },
  ];

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const credits = [1, 2, 3, 4, 5];

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.course_code.trim()) {
      newErrors.course_code = 'Course code is required';
    } else if (!/^[A-Z0-9]{2,10}$/i.test(formData.course_code)) {
      newErrors.course_code = 'Invalid course code format';
    }
    
    if (!formData.course_name.trim()) {
      newErrors.course_name = 'Course name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' 
        ? parseInt(value, 10) || 0 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const headers = new Headers({
        'Content-Type': 'application/json',
      });
      
      if (token) {
        headers.append('Authorization', `Bearer ${token}`);
      }

      const response = await fetch('https://ems-oty3.onrender.comhttps://ems-oty3.onrender.com/api/courses', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create course');
      }

      toast.success('Course created successfully!');
      router.push('/admin/courses');
      router.refresh(); // Refresh the page to show the new course
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to create course. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <div className="flex items-center">
              <Link 
                href="/admin/courses" 
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
                Create New Course
              </h1>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Add a new course to the system. All fields are required unless marked optional.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Course Code */}
              <div className="sm:col-span-2">
                <label htmlFor="course_code" className="block text-sm font-medium text-gray-700">
                  Course Code <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookType className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    name="course_code"
                    id="course_code"
                    value={formData.course_code}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${errors.course_code ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="e.g., CS101"
                  />
                </div>
                {errors.course_code && (
                  <p className="mt-1 text-sm text-red-600">{errors.course_code}</p>
                )}
              </div>

              {/* Course Name */}
              <div className="sm:col-span-4">
                <label htmlFor="course_name" className="block text-sm font-medium text-gray-700">
                  Course Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    name="course_name"
                    id="course_name"
                    value={formData.course_name}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${errors.course_name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="e.g., Introduction to Computer Science"
                  />
                </div>
                {errors.course_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.course_name}</p>
                )}
              </div>

              {/* Department */}
              <div className="sm:col-span-3">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {departments.map((dept) => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Semester */}
              <div className="sm:col-span-1">
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                  Semester <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {semesters.map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Credits */}
              <div className="sm:col-span-1">
                <label htmlFor="credits" className="block text-sm font-medium text-gray-700">
                  Credits <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="credits"
                    name="credits"
                    value={formData.credits}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {credits.map((credit) => (
                      <option key={credit} value={credit}>
                        {credit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Max Students */}
              <div className="sm:col-span-1">
                <label htmlFor="max_students" className="block text-sm font-medium text-gray-700">
                  Max Students <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="number"
                    name="max_students"
                    id="max_students"
                    min="1"
                    value={formData.max_students || ''}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    inputMode="numeric"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder="Enter course description (optional)"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <div className="flex justify-end space-x-3">
              <Link
                href="/admin/courses"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="-ml-1 mr-2 h-4 w-4" />
                    Create Course
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
