'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  BookOpen, 
  Building, 
  Calendar,
  AlertTriangle,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface Student {
  _id: string;
  student_id: string;
  name: string;
  department: string;
  course_code?: string;
}

interface Course {
  _id: string;
  course_code: string;
  course_name: string;
  department: string;
  capacity: number;
  enrolled_students?: number;
}

const API_URL = 'http://localhost:5000';

export default function StudentEnrollment() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchStudentsAndCourses();
  }, []);

  const fetchStudentsAndCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [studentsRes, coursesRes] = await Promise.all([
        fetch(`${API_URL}https://ems-oty3.onrender.com/api/students`),
        fetch(`${API_URL}https://ems-oty3.onrender.com/api/courses`)
      ]);

      if (!studentsRes.ok || !coursesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const studentsData = await studentsRes.json();
      const coursesData = await coursesRes.json();

      setStudents(studentsData);
      setCourses(coursesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedCourse) {
      setError('Please select both student and course');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`${API_URL}https://ems-oty3.onrender.com/api/students/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: selectedStudent,
          name: students.find(s => s.student_id === selectedStudent)?.name,
          course_code: selectedCourse
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Enrollment failed');
      }

      setSuccess('Student enrolled successfully!');
      setSelectedStudent('');
      setSelectedCourse('');
      fetchStudentsAndCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !success) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enroll Students</h1>
        <p className="mt-1 text-sm text-gray-600">
          Select a student and course to enroll them in
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Selection */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Student</h3>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            disabled={loading}
          >
            <option value="" className="text-gray-900">Select a student</option>
            {students.map((student) => (
              <option key={student._id} value={student.student_id}>
                {student.name} ({student.department})
              </option>
            ))}
          </select>
        </div>

        {/* Course Selection */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Course</h3>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            disabled={loading}
          >
            <option value="" className="text-gray-900">Select a course</option>
            {courses.map((course) => (
              <option key={course._id} value={course.course_code}>
                {course.course_code} - {course.course_name} ({course.department})
              </option>
            ))}
          </select>
          
          {selectedCourse && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Capacity:</span> {courses.find(c => c.course_code === selectedCourse)?.capacity}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Enrolled:</span> {courses.find(c => c.course_code === selectedCourse)?.enrolled_students || 0}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleEnroll}
          disabled={!selectedStudent || !selectedCourse || loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enrolling...
            </>
          ) : (
            'Enroll Student'
          )}
        </button>
      </div>
    </div>
  );
}