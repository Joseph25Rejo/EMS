'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, X, Clock, Calendar, Users, BookOpen, Download, FileText, FileDown, FileSpreadsheet, Loader2 } from 'lucide-react';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type Course = {
  _id: string;
  course_code: string;
  course_name: string;
  instructor?: string;
  expected_students?: number;
};

type Exam = {
  course_code: string;
  course_name: string;
  date: string;
  session: string;
  room: string;
  instructor?: string;
  duration?: number;
  students?: any[];
};

type Schedule = {
  _id: string;
  algorithm: string;
  schedule: Exam[];
  created_at: string;
  archived_at?: string;
};

export default function ScheduleGenerator() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedSchedule, setGeneratedSchedule] = useState<Schedule | null>(null);
  const [algorithm, setAlgorithm] = useState('graph_coloring');
  const [pastSchedule, setPastSchedule] = useState<Schedule | null>(null);
  const [showPastSchedule, setShowPastSchedule] = useState(false);
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<string, number>>({});

  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch courses
      const coursesResponse = await fetch(`${API_BASE_URL}/api/courses`);
      if (!coursesResponse.ok) {
        throw new Error(`Failed to fetch courses: ${coursesResponse.status}`);
      }
      
      const coursesData = await coursesResponse.json();
      setCourses(coursesData);

      // Fetch enrollment counts for each course
      const enrollmentPromises = coursesData.map(async (course: Course) => {
        try {
          const studentsResponse = await fetch(`${API_BASE_URL}/api/students`);
          if (studentsResponse.ok) {
            const studentsData = await studentsResponse.json();
            const courseEnrollments = studentsData.filter((student: any) => 
              student.course_code === course.course_code
            ).length;
            return { courseCode: course.course_code, count: courseEnrollments };
          }
        } catch (e) {
          console.error(`Error fetching enrollments for ${course.course_code}:`, e);
        }
        return { courseCode: course.course_code, count: 0 };
      });

      const enrollmentResults = await Promise.all(enrollmentPromises);
      const enrollmentMap = enrollmentResults.reduce((acc, { courseCode, count }) => {
        acc[courseCode] = count;
        return acc;
      }, {} as Record<string, number>);
      
      setEnrollmentCounts(enrollmentMap);

      // Fetch current schedule
      const scheduleResponse = await fetch(`${API_BASE_URL}/api/schedules`);
      if (scheduleResponse.ok) {
        const scheduleData = await scheduleResponse.json();
        if (Array.isArray(scheduleData) && scheduleData.length > 0) {
          const latestSchedule = scheduleData[scheduleData.length - 1]; // Get the most recent
          setGeneratedSchedule(latestSchedule);
        }
      }

      // Fetch past schedule
      try {
        const pastScheduleResponse = await fetch(`${API_BASE_URL}/api/schedules/past`);
        if (pastScheduleResponse.ok) {
          const pastScheduleData = await pastScheduleResponse.json();
          setPastSchedule(pastScheduleData);
        }
      } catch (e) {
        console.log('No past schedule available');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error in fetchData:', errorMessage);
      setError(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseSelection = (courseCode: string) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseCode)) {
        return prev.filter(code => code !== courseCode);
      } else {
        return [...prev, courseCode];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === courses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(courses.map(course => course.course_code));
    }
  };

  const generateSchedule = async () => {
    if (selectedCourses.length === 0) {
      setError('Please select at least one course');
      return;
    }
  
    setIsGenerating(true);
    setError(null);
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/schedules/generate/selected`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_codes: selectedCourses,
          algorithm: algorithm,
          constraints: {
            start_date: new Date().toISOString().split('T')[0]
          }
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate schedule');
      }
  
      // Get response text first to handle potential JSON parsing issues
      const responseText = await response.text();
      
      // Clean the response text by replacing NaN with null
      const cleanedResponseText = responseText.replace(/:\s*NaN/g, ': null');
      
      let responseData;
      try {
        responseData = JSON.parse(cleanedResponseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response text:', responseText);
        throw new Error('Invalid response format from server');
      }
      
      // Create schedule object with cleaned data
      const newSchedule: Schedule = {
        _id: responseData.id,
        algorithm: algorithm,
        schedule: responseData.schedule || [],
        created_at: new Date().toISOString()
      };
  
      setGeneratedSchedule(newSchedule);
      
      // Clear selections after successful generation
      setSelectedCourses([]);
      
      // Show success message
      alert('Schedule generated successfully!');
  
    } catch (err) {
      console.error('Error generating schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate schedule');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportScheduleToPDF = async () => {
    if (!generatedSchedule || !generatedSchedule.schedule) {
      setError('No schedule available to export');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // Dynamic imports to reduce bundle size
      const [jsPDFModule, autoTableModule] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);
        
      const { default: jsPDF } = jsPDFModule;  // Access the default export
      const doc = new jsPDF();
      
      // Add title and metadata
      doc.setProperties({
        title: 'Exam Schedule',
        subject: 'Generated Exam Schedule',
        author: 'Exam Management System',
        keywords: 'exam, schedule, pdf',
        creator: 'Exam Management System'
      });
      
      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('Exam Schedule', 14, 20);
      
      // Subtitle with algorithm and date
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`Algorithm: ${generatedSchedule.algorithm.replace('_', ' ').toUpperCase()}`, 14, 30);
      doc.text(`Generated on: ${new Date(generatedSchedule.created_at).toLocaleDateString()}`, 14, 36);
      doc.text(`Total Exams: ${generatedSchedule.schedule.length}`, 14, 42);
      
      // Prepare table data with proper null/undefined checks
      const tableData = generatedSchedule.schedule.map((exam, index) => {
        // Ensure all values are strings and handle potential undefined/null values
        const courseCode = exam.course_code ? String(exam.course_code) : 'N/A';
        const courseName = exam.course_name ? String(exam.course_name) : 'N/A';
        const date = exam.date ? String(exam.date) : 'TBD';
        const session = exam.session ? String(exam.session) : 'TBD';
        const room = exam.room ? String(exam.room) : 'TBD';
        const instructor = exam.instructor ? String(exam.instructor) : 'Not assigned';
        const studentCount = enrollmentCounts[exam.course_code] || 0;
        
        return [
          String(index + 1),
          courseCode,
          courseName,
          date,
          session,
          room,
          instructor,
          String(studentCount)
        ];
      });

      // Add table using TypeScript type assertion for autoTable
      (doc as any).autoTable({
        head: [['#', 'Course Code', 'Course Name', 'Date', 'Session', 'Room', 'Instructor', 'Students']],
        body: tableData,
        startY: 50,
        margin: { top: 50 },
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
          cellWidth: 'wrap',
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold',
          lineWidth: 0.1,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
          textColor: 0,
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' }, // #
          1: { cellWidth: 25 }, // Course Code
          2: { cellWidth: 45 }, // Course Name
          3: { cellWidth: 25 }, // Date
          4: { cellWidth: 25 }, // Session
          5: { cellWidth: 25 }, // Room
          6: { cellWidth: 30 }, // Instructor
          7: { cellWidth: 15, halign: 'center' }  // Students
        },
        didDrawPage: function(data: { settings: { margin: { left: number } } }) {
          // Footer
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          doc.setFontSize(10);
          doc.setTextColor(150);
          doc.text(
            'Page ' + doc.internal.getNumberOfPages(),
            data.settings.margin.left,
            pageHeight - 10
          );
        }
      });

      // Add summary at the bottom
      const finalY = (doc as any).lastAutoTable?.finalY || 50;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary:', 14, finalY + 15);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Total courses scheduled: ${generatedSchedule.schedule.length}`, 14, finalY + 22);
      doc.text(`• Total students: ${Object.values(enrollmentCounts).reduce((sum, count) => sum + count, 0)}`, 14, finalY + 28);
      doc.text(`• Scheduling algorithm: ${generatedSchedule.algorithm.replace('_', ' ')}`, 14, finalY + 34);
      
      // Add watermark
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(50);
        doc.setTextColor(230, 230, 230);
        doc.text('CONFIDENTIAL', 40, 150, { angle: 45 });
      }
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Save the PDF
      const fileName = `exam-schedule-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (err) {
      console.error('Error exporting schedule:', err);
      let errorMessage = 'Failed to generate PDF. ';
      if (err instanceof Error) {
        console.error('Error details:', err.message, err.stack);
        errorMessage += err.message;
      }
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/admin" className="text-blue-600 hover:text-blue-800 mr-4">
              ← Back to Dashboard
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Exam Schedule Generator</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Select Courses</h2>
                    <p className="text-sm text-gray-600">Choose courses to include in the exam schedule</p>
                  </div>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {selectedCourses.length === courses.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>
              <div className="p-6">
                {courses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No courses available</p>
                    <p className="text-sm text-gray-400">Add courses first to generate schedules</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {courses.map((course) => (
                      <div key={course._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedCourses.includes(course.course_code)}
                            onChange={() => handleCourseSelection(course.course_code)}
                            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{course.course_name}</h3>
                            <p className="text-sm text-gray-600">{course.course_code}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-500">
                                {enrollmentCounts[course.course_code] || 0} students
                              </span>
                              {course.instructor && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-sm text-gray-500">{course.instructor}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduling Algorithm
                  </label>
                  <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="graph_coloring">Graph Coloring</option>
                    <option value="simulated_annealing">Simulated Annealing</option>
                    <option value="genetic">Genetic Algorithm</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {algorithm === 'graph_coloring' && 'Fast and efficient for most cases'}
                    {algorithm === 'simulated_annealing' && 'Good for complex optimization'}
                    {algorithm === 'genetic' && 'Best for large datasets with many constraints'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Selected Courses</h4>
                  <p className="text-2xl font-bold text-blue-600">{selectedCourses.length}</p>
                  <p className="text-sm text-gray-600">out of {courses.length} total courses</p>
                  {selectedCourses.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">Selected:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedCourses.slice(0, 3).map(code => (
                          <span key={code} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {code}
                          </span>
                        ))}
                        {selectedCourses.length > 3 && (
                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                            +{selectedCourses.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    <div className="flex items-center">
                      <X className="h-4 w-4 mr-2" />
                      {error}
                    </div>
                  </div>
                )}

                <button
                  onClick={generateSchedule}
                  disabled={isGenerating || selectedCourses.length === 0}
                  className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors flex items-center justify-center ${
                    isGenerating || selectedCourses.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Generate Schedule
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Export Options */}
            {generatedSchedule && generatedSchedule.schedule.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Export Options</h2>
                </div>
                <div className="p-6 space-y-3">
                  <button
                    onClick={exportScheduleToPDF}
                    disabled={isGenerating}
                    className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center disabled:bg-gray-400"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    Export as PDF
                  </button>
                  
                  <div className="text-xs text-gray-500 text-center">
                    Downloads a detailed schedule with all exam information
                  </div>
                </div>
              </div>
            )}

            {/* Past Schedule Toggle */}
            {pastSchedule && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <button
                    onClick={() => setShowPastSchedule(!showPastSchedule)}
                    className="w-full text-left text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showPastSchedule ? 'Hide' : 'View'} Previous Schedule
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generated Schedule Display */}
        {generatedSchedule && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Current Exam Schedule</h2>
                  <p className="text-sm text-gray-600">
                    Generated using {generatedSchedule.algorithm.replace('_', ' ')} • 
                    {new Date(generatedSchedule.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{generatedSchedule.schedule.length}</div>
                  <div className="text-sm text-gray-500">exams scheduled</div>
                </div>
              </div>
            </div>
            <div className="p-6">
              {generatedSchedule.schedule.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No exams were scheduled</p>
                  <p className="text-sm text-gray-400">Please check your course data and try again</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Session
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Room
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Instructor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Students
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {generatedSchedule.schedule.map((exam, index) => (
                        <tr key={`${exam.course_code}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{exam.course_code}</div>
                            <div className="text-sm text-gray-500">{exam.course_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {exam.date || 'TBD'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {exam.session || 'TBD'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {exam.room || 'TBD'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {exam.instructor || 'Not assigned'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 text-gray-400 mr-1" />
                              {enrollmentCounts[exam.course_code] || 0}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Past Schedule Display */}
        {showPastSchedule && pastSchedule && (
          <div className="mt-6 bg-yellow-50 rounded-lg shadow-sm border border-yellow-200">
            <div className="p-6 border-b border-yellow-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Previous Schedule</h2>
                  <p className="text-sm text-gray-600">
                    {pastSchedule.algorithm?.replace('_', ' ')} • 
                    Archived on {new Date(pastSchedule.archived_at || '').toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setShowPastSchedule(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-yellow-200">
                  <thead className="bg-yellow-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Session
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-yellow-50 divide-y divide-yellow-200">
                    {pastSchedule.schedule?.map((exam, index) => (
                      <tr key={`past-${exam.course_code}-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{exam.course_code}</div>
                          <div className="text-sm text-gray-500">{exam.course_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {exam.date || 'TBD'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {exam.session || 'TBD'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {exam.room || 'TBD'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}