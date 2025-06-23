'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  BookOpen, 
  Building, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  Plus,
  Eye
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  department: string;
  enrolledCourses: string[];
  enrolledAt: string;
  status: 'active' | 'inactive';
}

interface Course {
  courseCode: string;
  name: string;
  department: string;
  capacity: number;
  enrolledStudents: number;
  status: 'active' | 'inactive';
}

export default function StudentDetails({ params }: { params: { studentId: string } }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchStudentDetails();
  }, [params.studentId]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const [studentRes, coursesRes] = await Promise.all([
        fetch(`/api/students/${params.studentId}`),
        fetch('/api/courses')
      ]);

      if (!studentRes.ok || !coursesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const studentData = await studentRes.json();
      const coursesData = await coursesRes.json();

      setStudent(studentData.student);
      setCourses(coursesData.courses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (courseCode: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/students/${params.studentId}/unenroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseCode
        })
      });

      if (!response.ok) {
        throw new Error('Unenrollment failed');
      }

      // Refresh the data
      await fetchStudentDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unenrollment failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Not Found</h3>
            <p className="text-sm text-red-700 mt-1">Student not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
        <p className="mt-1 text-sm text-gray-600">
          {student.name} - {student.email}
        </p>
      </div>

      {/* Student Info */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="text-lg font-medium text-gray-900">{student.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-lg font-medium text-gray-900">{student.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Department</p>
            <p className="text-lg font-medium text-gray-900">{student.department}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-lg font-medium text-gray-900">
              <span className={`px-2 py-1 rounded-full text-sm ${
                student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {student.status}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Enrolled At</p>
            <p className="text-lg font-medium text-gray-900">
              {new Date(student.enrolledAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrolled Courses</h3>
        <div className="space-y-3">
          {student.enrolledCourses.map((courseCode) => {
            const course = courses.find(c => c.courseCode === courseCode);
            if (!course) return null;

            return (
              <div key={courseCode} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium">{course.name}</p>
                  <p className="text-sm text-gray-600">{course.courseCode}</p>
                  <p className="text-sm text-gray-500">
                    Capacity: {course.capacity} | Enrolled: {course.enrolledStudents}
                  </p>
                </div>
                <button
                  onClick={() => handleUnenroll(courseCode)}
                  className="text-red-600 hover:text-red-500"
                >
                  Unenroll
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Courses */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Courses</h3>
        <div className="space-y-3">
          {courses
            .filter(c => !student.enrolledCourses.includes(c.courseCode) && c.status === 'active')
            .map((course) => (
              <div key={course.courseCode} className="p-3 rounded-md hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{course.name}</p>
                    <p className="text-sm text-gray-600">{course.courseCode}</p>
                    <p className="text-sm text-gray-500">
                      Capacity: {course.capacity} | Enrolled: {course.enrolledStudents}
                    </p>
                  </div>
                  <Link
                    href={`/admin/students/enroll?studentId=${params.studentId}&courseCode=${course.courseCode}`}
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Enroll
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}