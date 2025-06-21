'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import Image from 'next/image';
import {
  User,
  BookOpen,
  Calendar,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Clock,
  MapPin,
  Download
} from 'lucide-react';
import type { GState } from 'jspdf';

interface UserData {
  USN: string;
  Name: string;
  student_id: string;
  _id: string;
}

interface Course {
  course_code: string;
  course_name: string;
  instructor: string;
  expected_students: number;
}

interface ExamSchedule {
  course_code: string;
  course_name: string;
  date: string;
  room: string;
  session: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [examSchedule, setExamSchedule] = useState<ExamSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [sectionLoading, setSectionLoading] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string>('');

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      // Ensure student_id is set to USN
      user.student_id = user.USN;
      setUserData(user);
      fetchInitialData(user.USN);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Load and convert logo to base64 on component mount
    const loadLogo = async () => {
      try {
        const response = await fetch('/RVCE_logo.png');
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setLogoBase64(base64data);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error loading logo:', error);
      }
    };
    loadLogo();
  }, []);

  const fetchInitialData = async (usn: string) => {
    try {
      // Fetch courses
      const coursesResponse = await fetch(`/api/students/${usn}/courses`);
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData);
      }

      // Fetch hall ticket (which includes exam schedule)
      const hallTicketResponse = await fetch(`/api/students/${usn}/hallticket`);
      if (hallTicketResponse.ok) {
        const scheduleData = await hallTicketResponse.json();
        setExamSchedule(scheduleData);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'exams', label: 'Exam Schedule', icon: Calendar },
    { id: 'hallticket', label: 'Hall Ticket', icon: FileText },
  ];

  const LoadingSpinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
    />
  );

  const exportHallTicket = () => {
    if (!userData) return;

    try {
      // Initialize PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add watermark if logo is loaded
      if (logoBase64) {
        const opacity = 0.1;
        pdf.saveGraphicsState();
        pdf.setGState(new (pdf as any).GState({ opacity }));
        try {
          pdf.addImage(logoBase64, 'PNG', 70, 40, 160, 160);
        } catch (error) {
          console.error('Error adding watermark:', error);
        }
        pdf.restoreGraphicsState();
      }

      // Add header
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EXAMINATION HALL TICKET', 148, 30, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text('RV College of Engineering', 148, 40, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text('Academic Year 2023-24', 148, 48, { align: 'center' });

      // Add student details
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Student Details:', 20, 65);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Name: ${userData.Name}`, 20, 73);
      pdf.text(`USN: ${userData.USN}`, 20, 81);

      // Add table headers
      const headers = ['Course', 'Course Code', 'Date', 'Session', 'Room', 'Signature'];
      let y = 95;
      
      // Style for table
      pdf.setLineWidth(0.2);
      pdf.setDrawColor(0);
      
      // Draw table header background
      pdf.setFillColor(240, 240, 240);
      pdf.rect(20, y-5, 257, 10, 'F');
      
      // Draw outer table border
      pdf.rect(20, y-5, 257, (examSchedule.length * 12) + 15);

      // Draw headers
      pdf.setFont('helvetica', 'bold');
      const colWidths = [60, 30, 40, 40, 40, 47];
      let x = 20;
      headers.forEach((header, index) => {
        pdf.text(header, x + 3, y);
        x += colWidths[index];
        // Draw vertical lines
        pdf.line(x, y-5, x, y + 10 + (examSchedule.length * 12));
      });
      
      // Draw horizontal line after headers
      y += 5;
      pdf.line(20, y, 277, y);

      // Add exam data
      y += 8;
      pdf.setFont('helvetica', 'normal');
      examSchedule.forEach((exam) => {
        x = 20;
        // Course name
        pdf.text(exam.course_name, x + 3, y);
        x += colWidths[0];
        
        // Course code
        pdf.text(exam.course_code, x + 3, y);
        x += colWidths[1];
        
        // Date
        pdf.text(exam.date, x + 3, y);
        x += colWidths[2];
        
        // Session
        pdf.text(exam.session, x + 3, y);
        x += colWidths[3];
        
        // Room
        pdf.text(exam.room, x + 3, y);
        
        y += 12;
        pdf.line(20, y-4, 277, y-4);
      });

      // Add note
      y += 10;
      pdf.setFontSize(10);
      pdf.text('Note: This hall ticket must be presented at the examination center along with a valid ID.', 20, y);

      // Add signature lines
      y += 20;
      pdf.line(20, y, 80, y);
      pdf.text('Student Signature', 35, y + 5);
      
      pdf.line(220, y, 270, y);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Principal', 235, y + 5);

      // Save PDF
      pdf.save(`hall_ticket_${userData.USN}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (isLoading || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  const renderCourses = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-6">Enrolled Courses</h2>
      {courses.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No courses enrolled yet.</p>
      ) : (
        courses.map((course) => (
          <div
            key={course.course_code}
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{course.course_name}</h3>
                <p className="text-sm text-gray-500 mt-1">Course Code: {course.course_code}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Instructor:</p>
                <p className="text-sm font-medium text-gray-900">{course.instructor}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderExamSchedule = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-6">Upcoming Examinations</h2>
      {examSchedule.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No upcoming exams scheduled.</p>
      ) : (
        examSchedule.map((exam) => (
          <div
            key={exam.course_code}
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{exam.course_name}</h3>
                <p className="text-sm text-gray-500 mt-1">Course Code: {exam.course_code}</p>
              </div>
              <div className="text-right space-y-2">
                <div className="flex items-center justify-end text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">{exam.date}</span>
                </div>
                <div className="flex items-center justify-end text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">{exam.session}</span>
                </div>
                <div className="flex items-center justify-end text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm">{exam.room}</span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderHallTicket = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Hall Ticket</h2>
        <button
          onClick={exportHallTicket}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Download Hall Ticket</span>
        </button>
      </div>
      
      <div id="hallTicket" className="border-2 border-gray-200 rounded-lg p-6 print:border-black relative">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-60 z-0">
          <Image
            src="/images/RVCE_logo.png"
            alt="RVCE Logo"
            layout="fill"
            objectFit="contain"
            className="opacity-60"
          />
        </div>
        
        <div className="relative z-10">
          <div className="text-center border-b-2 border-gray-200 pb-4 mb-6 print:border-black">
            <h1 className="text-2xl font-bold">EXAMINATION HALL TICKET</h1>
            <p className="text-gray-600 mt-2">Academic Year 2023-24</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-gray-600">Student Name:</p>
              <p className="font-medium">{userData.Name}</p>
            </div>
            <div>
              <p className="text-gray-600">USN:</p>
              <p className="font-medium">{userData.USN}</p>
            </div>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2 text-left">Course</th>
                <th className="border p-2 text-left">Date</th>
                <th className="border p-2 text-left">Time</th>
                <th className="border p-2 text-left">Room</th>
                <th className="border p-2 text-left">Signature</th>
              </tr>
            </thead>
            <tbody>
              {examSchedule.map((exam) => (
                <tr key={exam.course_code}>
                  <td className="border p-2">
                    <div className="font-medium">{exam.course_name}</div>
                    <div className="text-sm text-gray-500">{exam.course_code}</div>
                  </td>
                  <td className="border p-2">{exam.date}</td>
                  <td className="border p-2">{exam.session}</td>
                  <td className="border p-2">{exam.room}</td>
                  <td className="border p-2 h-12"></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 pt-4 border-t-2 border-gray-200 print:border-black">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Note: This hall ticket must be presented at the examination center along with a valid ID.
              </p>
              <div className="text-center">
                <div className="mt-8 border-t border-black w-32">
                  <p className="text-sm text-gray-600">Principal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-white shadow-md"
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-800">{userData.Name}</h2>
            <p className="text-sm text-gray-500 mt-1">{userData.USN}</p>
          </div>
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {activeSection === item.id && (
                  <ChevronRight className="w-5 h-5 ml-auto" />
                )}
              </button>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Content Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                {navigationItems.find(item => item.id === activeSection)?.label}
              </h1>
              <p className="text-gray-500 mt-1">
                Welcome back, {userData.Name}
              </p>
            </div>

            {/* Dynamic Content Based on Active Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {sectionLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  {activeSection === 'overview' && (
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Student Information</h2>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <User className="w-6 h-6 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium">{userData.Name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <FileText className="w-6 h-6 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">USN</p>
                            <p className="font-medium">{userData.USN}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeSection === 'courses' && renderCourses()}
                  {activeSection === 'exams' && renderExamSchedule()}
                  {activeSection === 'hallticket' && renderHallTicket()}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 