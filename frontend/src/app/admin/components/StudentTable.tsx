'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  BookOpen, 
  Search, 
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE_URL = 'https://ems-oty3.onrender.comhttps://ems-oty3.onrender.com/api';

interface StudentEnrollment {
  _id: string;
  student_id: string;
  name: string;
  course_code: string;
  course_name?: string;
  semester?: string;
  department?: string;
}

interface Course {
  course_code: string;
  course_name: string;
  credits: number;
  semester: number;
  department: string;
}

const StudentTable = () => {
  // State management
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<{
    student_id: string;
    name: string;
    course_code: string;
  }>({
    student_id: '',
    name: '',
    course_code: ''
  });

  // Helper function to get unique enrollments
  const getUniqueEnrollments = (enrollments: StudentEnrollment[]): StudentEnrollment[] => {
    const uniqueMap = new Map<string, StudentEnrollment>();
    
    enrollments.forEach(enrollment => {
      const key = `${enrollment.student_id}-${enrollment.course_code}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, enrollment);
      } else {
        console.warn('Duplicate enrollment found:', enrollment);
      }
    });
    
    return Array.from(uniqueMap.values());
  };

  // Fetch all courses
  const fetchCourses = useCallback(async (): Promise<Course[]> => {
    setIsLoadingCourses(true);
    try {
      console.log(`Fetching courses from ${API_BASE_URL}/courses`);
      const response = await fetch(`${API_BASE_URL}/courses`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch courses:', response.status, errorText);
        throw new Error(`Failed to fetch courses: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Courses loaded:', data);
      
      // Ensure we have an array of courses with required fields
      const validCourses: Course[] = Array.isArray(data) 
        ? data.filter(course => 
            course && 
            course.course_code && 
            course.course_name
          ).map(course => ({
            course_code: String(course.course_code || ''),
            course_name: String(course.course_name || ''),
            credits: Number(course.credits) || 0,
            semester: Number(course.semester) || 1,
            department: String(course.department || '')
          }))
        : [];
      
      setCourses(validCourses);
      return validCourses;
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
      return [];
    } finally {
      setIsLoadingCourses(false);
    }
  }, []);

  // Fetch all enrollments
  const fetchEnrollments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/students`);
      if (!response.ok) {
        throw new Error('Failed to fetch enrollments');
      }
      const data = await response.json();
      setEnrollments(data);
      return data;
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to load enrollments');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchCourses(),
        fetchEnrollments()
      ]);
    };
    loadData();
  }, [fetchCourses, fetchEnrollments]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Basic validation
      if (!formData.student_id?.trim() || !formData.name?.trim() || !formData.course_code) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Check if course exists in our local cache
      const selectedCourse = courses.find(c => c.course_code === formData.course_code);
      if (!selectedCourse) {
        toast.error('Selected course not found');
        return;
      }
  
      // Check if student is already enrolled in this course
      const isAlreadyEnrolled = enrollments.some(
        e => e.student_id === formData.student_id.trim() && 
             e.course_code === formData.course_code &&
             (!isEditing || e._id !== isEditing)
      );

      if (isAlreadyEnrolled) {
        toast.error('This student is already enrolled in the selected course');
        return;
      }

      const url = isEditing 
        ? `${API_BASE_URL}/students/${isEditing}`
        : `${API_BASE_URL}/students/enroll`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          student_id: formData.student_id.trim(),
          name: formData.name.trim(),
          course_name: selectedCourse.course_name,
          semester: selectedCourse.semester,
          department: selectedCourse.department
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save enrollment');
      }

      toast.success(`Enrollment ${isEditing ? 'updated' : 'created'} successfully`);
      await fetchEnrollments();
      resetForm();
    } catch (error) {
      console.error('Error saving enrollment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save enrollment');
    }
  };

  // Handle delete enrollment
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this enrollment?')) return;
    
    try {
      // Find the enrollment to get student_id and course_code
      const enrollment = enrollments.find(e => e._id === id);
      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      // Use the correct endpoint with student_id and course_code
      const response = await fetch(
        `${API_BASE_URL}/students/${enrollment.student_id}/courses/${enrollment.course_code}`, 
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete enrollment');
      }

      toast.success('Enrollment deleted successfully');
      await fetchEnrollments();
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while deleting';
      toast.error(errorMessage);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      student_id: '',
      name: '',
      course_code: ''
    });
    setIsEditing(null);
    setIsAdding(false);
  };

  // Filter enrollments based on search term
  const filteredEnrollments = enrollments.filter(enrollment => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (enrollment.student_id?.toLowerCase() || '').includes(searchLower) ||
      (enrollment.name?.toLowerCase() || '').includes(searchLower) ||
      (enrollment.course_code?.toLowerCase() || '').includes(searchLower) ||
      (enrollment.course_name?.toLowerCase() || '').includes(searchLower)
    );
  });

  // Get course name by code
  const getCourseName = (courseCode: string) => {
    const course = courses.find(c => c.course_code === courseCode);
    return course ? course.course_name : 'Course not found';
  };

  // Start editing an enrollment
  const startEditing = (enrollment: StudentEnrollment) => {
    setFormData({
      student_id: enrollment.student_id,
      name: enrollment.name,
      course_code: enrollment.course_code
    });
    setIsEditing(enrollment._id);
  };

  if (isLoading && !isAdding) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Student Enrollments</h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage student course enrollments
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students or courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Enrollment
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || isEditing) && (
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label htmlFor="student_id" className="block text-sm font-medium text-gray-700">
                  Student ID *
                </label>
                <input
                  type="text"
                  name="student_id"
                  id="student_id"
                  value={formData.student_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  required
                  disabled={!!isEditing}
                />
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Student Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  required
                />
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="course_code" className="block text-sm font-medium text-gray-700">
                  Course *
                </label>
                <select
                  id="course_code"
                  name="course_code"
                  value={formData.course_code}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-900"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.course_code} value={course.course_code}>
                      {course.course_code} - {course.course_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isEditing ? 'Update' : 'Enroll'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Enrollments Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Semester
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEnrollments.length > 0 ? (
              filteredEnrollments.map((enrollment) => (
                <tr key={enrollment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <User className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2" />
                      {enrollment.student_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {enrollment.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <BookOpen className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2" />
                      {enrollment.course_name || getCourseName(enrollment.course_code)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {enrollment.department || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {enrollment.semester || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => startEditing(enrollment)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(enrollment._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  {searchTerm ? (
                    'No matching enrollments found.'
                  ) : (
                    'No student enrollments found.'
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;
