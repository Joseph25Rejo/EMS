'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, X, Clock, Calendar, Users, BookOpen, Download, FileText, FileDown, FileSpreadsheet, Loader2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [maxExamsPerDay, setMaxExamsPerDay] = useState<number>(2);
  const [professorAbsences, setProfessorAbsences] = useState<Record<string, string | string[]>>({});
  const [instructors, setInstructors] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Helper function to handle NaN values in JSON responses
      const parseJSONSafely = async (response: Response) => {
        const text = await response.text();
        // Replace NaN with null in the response text
        const safeText = text.replace(/:\s*NaN/g, ':null');
        try {
          return JSON.parse(safeText);
        } catch (e) {
          console.error('JSON Parse Error:', e);
          console.error('Response text:', text);
          throw new Error('Invalid response format from server');
        }
      };

      // Fetch courses
      const coursesResponse = await fetch(`${API_BASE_URL}/api/courses`);
      if (!coursesResponse.ok) {
        throw new Error(`Failed to fetch courses: ${coursesResponse.status}`);
      }
      
      const coursesData = await parseJSONSafely(coursesResponse);

      setCourses(coursesData);
      // Extract unique instructors for absence input
      const uniqueInstructors = Array.from(new Set((coursesData || []).map((c: Course) => c.instructor).filter(Boolean)));
      setInstructors(uniqueInstructors as string[]);

      // Fetch enrollment counts for each course
      const enrollmentPromises = coursesData.map(async (course: Course) => {
        try {
          const studentsResponse = await fetch(`${API_BASE_URL}/api/students`);
          if (studentsResponse.ok) {
            const studentsData = await parseJSONSafely(studentsResponse);
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
        const scheduleData = await parseJSONSafely(scheduleResponse);
        if (Array.isArray(scheduleData) && scheduleData.length > 0) {
          const latestSchedule = scheduleData[scheduleData.length - 1]; // Get the most recent
          setGeneratedSchedule(latestSchedule);
        }
      }

      // Fetch past schedule
      try {
        const pastScheduleResponse = await fetch(`${API_BASE_URL}/api/schedules/past`);
        if (pastScheduleResponse.ok) {
          const pastScheduleData = await parseJSONSafely(pastScheduleResponse);
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
      toast.error('Please select at least one course');
      return;
    }

    setIsGenerating(true);
    setError(null);

    // Prepare professor absences as { instructor: [date, ...] }
    const absences: Record<string, string[]> = {};
    for (const [instructor, datesStr] of Object.entries(professorAbsences)) {
      const dates = (typeof datesStr === 'string'
        ? datesStr.split(',')
        : Array.isArray(datesStr)
        ? datesStr
        : []
      )
        .map((d) => d.trim())
        .filter((d) => d.length > 0);
      if (dates.length > 0) absences[instructor] = dates;
    }

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
            start_date: new Date().toISOString().split('T')[0],
            max_exams_per_day: maxExamsPerDay,
            professor_absences: absences
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
      toast.success('Schedule generated successfully!');

    } catch (err) {
      console.error('Error generating schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate schedule');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportScheduleToPDF = async () => {
    if (!generatedSchedule || !generatedSchedule.schedule) {
      toast.error('No schedule available to export');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // Initialize PDF
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const startY = 20;
      let currentY = startY;
      let logoData: string | null = null;

      // Load RVCE logo
      try {
        const response = await fetch('/images/RVCE_logo.png');
        const blob = await response.blob();
        const reader = new FileReader();
        
        await new Promise((resolve, reject) => {
          reader.onloadend = () => {
            try {
              logoData = reader.result as string;
              // Add logo to first page
              doc.addImage(logoData, 'PNG', margin, currentY, 30, 30);
              resolve(null);
            } catch (error) {
              console.error('Error adding logo:', error);
              resolve(null); // Continue without logo if there's an error
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error('Error loading logo:', error);
        // Continue without logo if there's an error
      }

      // Helper function to add page
      const addPage = () => {
        doc.addPage();
        currentY = startY;
        // Add logo to new page
        if (logoData) {
          try {
            doc.addImage(logoData, 'PNG', margin, currentY, 30, 30);
          } catch (error) {
            console.error('Error adding logo to new page:', error);
          }
        }
        currentY += 35;
      };

      currentY += 35; // Move down after logo on first page

      // Add header
      doc.setFontSize(24);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('EXAM SCHEDULE', pageWidth / 2, currentY, { align: 'center' });
      currentY += 10;
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('RV College of Engineering', pageWidth / 2, currentY, { align: 'center' });
      currentY += 8;
      
      doc.setFontSize(14);
      doc.text('Academic Year 2023-24', pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      // Add schedule details
      doc.setFontSize(12);
      doc.text(`Algorithm: ${generatedSchedule.algorithm.replace('_', ' ').toUpperCase()}`, margin, currentY);
      currentY += 8;
      doc.text(`Generated on: ${new Date(generatedSchedule.created_at).toLocaleDateString()}`, margin, currentY);
      currentY += 8;
      doc.text(`Total Exams: ${generatedSchedule.schedule.length}`, margin, currentY);
      currentY += 15;

      // Table configuration
      const colWidths = [30, 50, 30, 25, 25, 40, 20];
      const rowHeight = 12;
      const headers = ['Course Code', 'Course Name', 'Date', 'Session', 'Room', 'Instructor', 'Students'];
      
      // Draw table header
      const drawTableHeader = () => {
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, currentY, pageWidth - (margin * 2), rowHeight, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        let xPos = margin;
        headers.forEach((header, i) => {
          doc.text(header, xPos + 2, currentY + 8);
          xPos += colWidths[i];
        });
        currentY += rowHeight;
      };

      drawTableHeader();

      // Draw table rows
      doc.setFont('helvetica', 'normal');
      generatedSchedule.schedule.forEach((exam, index) => {
        // Check if we need a new page
        if (currentY > pageHeight - margin - rowHeight) {
          addPage();
        }

        // Alternate row background
        if (index % 2 === 0) {
          doc.setFillColor(249, 249, 249);
          doc.rect(margin, currentY, pageWidth - (margin * 2), rowHeight, 'F');
        }

        let xPos = margin;
        
        // Course code
        doc.setFillColor(240, 247, 254);
        doc.rect(xPos + 1, currentY + 2, colWidths[0] - 2, rowHeight - 4, 'F');
        doc.text(exam.course_code || 'N/A', xPos + 2, currentY + 8);
        xPos += colWidths[0];
        
        // Course name
        doc.text(exam.course_name || 'N/A', xPos + 2, currentY + 8);
        xPos += colWidths[1];
        
        // Date
        doc.text(exam.date || 'TBD', xPos + 2, currentY + 8);
        xPos += colWidths[2];
        
        // Session
        doc.text(exam.session || 'TBD', xPos + 2, currentY + 8);
        xPos += colWidths[3];
        
        // Room
        doc.text(exam.room || 'TBD', xPos + 2, currentY + 8);
        xPos += colWidths[4];
        
        // Instructor
        doc.text(exam.instructor || 'Not assigned', xPos + 2, currentY + 8);
        xPos += colWidths[5];
        
        // Students
        doc.text(String(enrollmentCounts[exam.course_code] || 0), xPos + 2, currentY + 8);

        // Draw horizontal line
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        
        currentY += rowHeight;
      });

      // Draw final horizontal line
      doc.line(margin, currentY, pageWidth - margin, currentY);

      // Draw vertical lines
      let x = margin;
      doc.setDrawColor(220, 220, 220);
      colWidths.forEach(width => {
        doc.line(x, startY + 40, x, currentY);
        x += width;
      });
      doc.line(x, startY + 40, x, currentY);

      // Add note in a yellow box
      if (currentY > pageHeight - margin - 40) {
        addPage();
      }
      
      currentY += 15;
      doc.setFillColor(255, 250, 230);
      doc.setDrawColor(255, 243, 205);
      doc.roundedRect(margin, currentY, 160, 20, 2, 2, 'FD');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Important Note:', margin + 5, currentY + 8);
      doc.setFont('helvetica', 'normal');
      doc.text('This is the official exam schedule. Please check room assignments and timings carefully.', 
               margin + 5, currentY + 15);

      // Add signature line
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(pageWidth - margin - 50, currentY + 15, pageWidth - margin, currentY + 15);
      doc.setFont('helvetica', 'bold');
      doc.text('Principal', pageWidth - margin - 35, currentY + 20);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('RV College of Engineering', pageWidth - margin - 45, currentY + 25);

      // Add page numbers
      // Replace getNumberOfPages() with doc.internal.pages.length
      const pageCount = doc.internal.pages.length - 1; // -1 because pages array is 0-indexed with an empty first page
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 25, pageHeight - margin);
      }

      // Save PDF
      doc.save(`exam_schedule_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF');
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
    <div className="min-h-screen bg-gray-100">
      <ToastContainer aria-label="Notification" />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/admin" className="text-blue-600 hover:text-blue-800 mr-4">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">Exam Schedule Generator</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg border">
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
                      <div key={course._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course.course_code)}
                          onChange={() => handleCourseSelection(course.course_code)}
                          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="ml-3">
                          <h3 className="font-medium text-gray-900">{course.course_name}</h3>
                          <p className="text-sm text-gray-600">{course.course_code}</p>
                          <div className="flex items-center mt-1">
                            <Users className="h-4 w-4 text-gray-400 mr-1" />
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
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Scheduling Algorithm
                  </label>
                  <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 text-gray-900"
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

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Max Exams Per Day
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={maxExamsPerDay}
                      onChange={e => setMaxExamsPerDay(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 text-gray-900"
                    />
                  </div>

                  {instructors.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">
                        Professor Absences <span className="text-xs text-gray-400">(comma-separated dates YYYY-MM-DD)</span>
                      </label>
                      <div className="space-y-2">
                        {instructors.map((instructor) => (
                          <div key={instructor} className="flex items-center gap-2">
                            <span className="w-32 text-sm text-gray-800">{instructor}</span>
                            <input
                              type="text"
                              placeholder="e.g. 2025-07-10, 2025-07-12"
                              value={professorAbsences[instructor] || ''}
                              onChange={e => setProfessorAbsences(prev => ({ ...prev, [instructor]: e.target.value }))}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 text-gray-900"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                      <X className="h-5 w-5 mr-2" />
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
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-5 w-5 mr-2" />
                      Generate Schedule
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Export Options */}
            {generatedSchedule && generatedSchedule.schedule.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg border">
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
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <FileText className="h-5 w-5 mr-2" />
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
              <div className="bg-white rounded-lg shadow-lg border">
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
          <div className="mt-6 bg-white rounded-lg shadow-lg border">
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
                        <tr key={`${exam.course_code}-${index}`} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{exam.course_code}</div>
                            <div className="text-sm text-gray-500">{exam.course_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {exam.date || 'TBD'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
          <div className="mt-6 bg-yellow-50 rounded-lg shadow-lg border border-yellow-200">
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
