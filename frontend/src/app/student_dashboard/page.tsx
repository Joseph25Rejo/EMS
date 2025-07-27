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
  Download,
  GraduationCap,
  Users as UsersIcon,
  Award,
  Book,
  Home,
  Settings,
  Bell,
  HelpCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Plus,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  RotateCw,
  BarChart2,
  PieChart,
  LineChart,
  BarChart,
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Wallet,
  File as FileIcon,
  FileText as FileTextIcon,
  FilePlus,
  FileCheck,
  FileSearch,
  FileImage,
  FileType2
} from 'lucide-react';
import type { GState } from 'jspdf';

interface UserData {
  USN: string;
  name: string;
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
  const [cornerLogoBase64, setCornerLogoBase64] = useState<string>('');

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
    // Load and convert logos to base64 on component mount
    const loadLogos = async () => {
      try {
        // Load main logo for watermark
        const response = await fetch('/images/RVCE_logo.png');
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setLogoBase64(base64data);
        };
        reader.readAsDataURL(blob);

        // Load corner logo (using the same logo)
        const cornerResponse = await fetch('/images/RVCE_logo.png');
        const cornerBlob = await cornerResponse.blob();
        const cornerReader = new FileReader();
        cornerReader.onloadend = () => {
          const cornerBase64data = cornerReader.result as string;
          setCornerLogoBase64(cornerBase64data);
        };
        cornerReader.readAsDataURL(cornerBlob);
      } catch (error) {
        console.error('Error loading logos:', error);
      }
    };
    loadLogos();
  }, []);

  const fetchInitialData = async (usn: string) => {
    try {
      // Fetch courses
      const coursesResponse = await fetch(`https://ems-oty3.onrender.com/api/students/${usn}/courses`);
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData);
      }

      // Fetch hall ticket (which includes exam schedule)
      const hallTicketResponse = await fetch(`https://ems-oty3.onrender.com/api/students/${usn}/hallticket`);
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
    { id: 'overview', label: 'Overview', icon: User, color: 'from-blue-500 to-blue-600' },
    { id: 'courses', label: 'My Courses', icon: BookOpen, color: 'from-green-500 to-green-600' },
    { id: 'exams', label: 'Exam Schedule', icon: Calendar, color: 'from-purple-500 to-purple-600' },
    { id: 'hallticket', label: 'Hall Ticket', icon: FileText, color: 'from-orange-500 to-orange-600' }
  ];

  const LoadingSpinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-10 h-10 border-4 border-gradient-to-r from-blue-500 to-purple-500 border-t-transparent rounded-full"
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

      // Add RVCE logo in top left corner
      if (cornerLogoBase64) {
        try {
          pdf.addImage(cornerLogoBase64, 'PNG', 20, 20, 25, 25);
        } catch (error) {
          console.error('Error adding corner logo:', error);
        }
      }

      // Add watermark if logo is loaded
      // Add watermark if logo is loaded
      if (logoBase64) {
        const opacity = 0.05;
        
        // Type assertion to access graphics state methods
        const pdfWithGraphics = pdf as any;
        
        pdfWithGraphics.saveGraphicsState();
        pdfWithGraphics.setGState(new pdfWithGraphics.GState({ opacity }));
        
        try {
          pdf.addImage(logoBase64, 'PNG', 70, 40, 160, 160);
        } catch (error) {
          console.error('Error adding watermark:', error);
        }
        
        pdfWithGraphics.restoreGraphicsState();
      }

      // Add "RVCE" watermark text
      pdf.setFontSize(60);
      pdf.setTextColor(200, 200, 200);
      pdf.setFont('helvetica', 'bold');

      // Add header
      pdf.setFontSize(28);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EXAMINATION HALL TICKET', 148, 30, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text('RV College of Engineering', 148, 40, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.text('Academic Year 2023-24', 148, 48, { align: 'center' });

      // Add student details in styled boxes
      // Blue box for student name
      pdf.setFillColor(239, 246, 255); // bg-blue-50
      pdf.setDrawColor(219, 234, 254); // border-blue-100
      pdf.roundedRect(20, 65, 120, 25, 3, 3, 'FD');
      
      pdf.setFontSize(12);
      pdf.setTextColor(71, 85, 105); // text-gray-600
      pdf.text('Student Name:', 25, 75);
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(userData.name, 25, 85);

      // Purple box for USN
      pdf.setFillColor(245, 243, 255); // bg-purple-50
      pdf.setDrawColor(237, 233, 254); // border-purple-100
      pdf.roundedRect(150, 65, 120, 25, 3, 3, 'FD');
      
      pdf.setFontSize(12);
      pdf.setTextColor(71, 85, 105); // text-gray-600
      pdf.text('USN:', 155, 75);
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text(userData.USN, 155, 85);

      // Add table
      let y = 105;
      
      // Style for table
      pdf.setLineWidth(0.2);
      pdf.setDrawColor(229, 231, 235); // border-gray-200
      
      // Draw table header background
      pdf.setFillColor(249, 250, 251); // bg-gray-50
      pdf.rect(20, y-5, 257, 12, 'F');
      
      // Draw outer table border with rounded corners
      pdf.setDrawColor(229, 231, 235);
      pdf.roundedRect(20, y-5, 257, (examSchedule.length * 12) + 17, 2, 2, 'S');

      // Add table headers
      const headers = ['Course', 'Course Code', 'Date', 'Session', 'Room', 'Signature'];
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(17, 24, 39); // text-gray-900
      
      const colWidths = [60, 35, 40, 40, 35, 47];
      let x = 20;
      headers.forEach((header, index) => {
        pdf.text(header, x + 5, y);
        x += colWidths[index];
        // Draw vertical lines
        pdf.line(x, y-5, x, y + (examSchedule.length * 12) + 12);
      });
      
      // Draw horizontal line after headers
      y += 7;
      pdf.line(20, y, 277, y);

      // Add exam data
      pdf.setFont('helvetica', 'normal');
      examSchedule.forEach((exam, index) => {
        y += 10;
        x = 20;
        
        // Alternate row background
        if (index % 2 === 0) {
          pdf.setFillColor(249, 250, 251); // bg-gray-50
          pdf.rect(x, y-5, 257, 10, 'F');
        }

        // Course name
        pdf.setTextColor(17, 24, 39); // text-gray-900
        pdf.setFont('helvetica', 'bold');
        pdf.text(exam.course_name, x + 5, y);
        x += colWidths[0];
        
        // Course code with badge style
        pdf.setFillColor(239, 246, 255); // bg-blue-50
        pdf.setTextColor(30, 64, 175); // text-blue-800
        pdf.roundedRect(x + 2, y-4, 30, 6, 1, 1, 'F');
        pdf.setFontSize(9);
        pdf.text(exam.course_code, x + 4, y);
        pdf.setFontSize(11);
        x += colWidths[1];
        
        // Other details
        pdf.setTextColor(17, 24, 39);
        pdf.setFont('helvetica', 'normal');
        pdf.text(exam.date, x + 5, y);
        x += colWidths[2];
        
        pdf.text(exam.session, x + 5, y);
        x += colWidths[3];
        
        pdf.text(exam.room, x + 5, y);
        
        // Draw horizontal line after each row
        pdf.setDrawColor(229, 231, 235);
        y += 5;
        pdf.line(20, y, 277, y);
      });

      // Add note in a yellow box
      y += 15;
      pdf.setFillColor(254, 252, 232); // bg-yellow-50
      pdf.setDrawColor(254, 249, 195); // border-yellow-200
      pdf.roundedRect(20, y, 180, 20, 2, 2, 'FD');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(17, 24, 39);
      pdf.text('Important Note:', 25, y + 7);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      pdf.text('This hall ticket must be presented at the examination center along with a valid photo ID card.', 25, y + 15);

      // Add signature line
      pdf.setDrawColor(17, 24, 39);
      pdf.setLineWidth(0.5);
      pdf.line(220, y + 15, 270, y + 15);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(17, 24, 39);
      pdf.text('Principal', 235, y + 20);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      pdf.text('RV College of Engineering', 227, y + 25);

      // Save PDF
      pdf.save(`hall_ticket_${userData.USN}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (isLoading || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-800 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome back, {userData.name}!</h2>
            <p className="text-blue-100 text-lg">Ready to excel in your academic journey?</p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{courses.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Upcoming Exams</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{examSchedule.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Academic Year</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">2023-24</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Student Information */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <User className="w-6 h-6 mr-3 text-blue-600" />
          Student Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Full Name</p>
                <p className="text-xl font-bold text-gray-900">{userData.name}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">University Seat Number</p>
                <p className="text-xl font-bold text-gray-900">{userData.USN}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <BookOpen className="w-7 h-7 mr-3 text-green-600" />
          Enrolled Courses
        </h2>
        <div className="bg-green-100 px-4 py-2 rounded-full">
          <span className="text-green-800 font-semibold">{courses.length} Courses</span>
        </div>
      </div>
      
      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
          <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No courses enrolled yet.</p>
          <p className="text-gray-500 mt-2">Your enrolled courses will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.course_code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{course.course_name}</h3>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                      {course.course_code}
                    </span>
                    <span className="flex items-center text-gray-600">
                      <UsersIcon className="w-4 h-4 mr-1" />
                      {course.expected_students} students
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center text-gray-700">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="font-medium">Instructor:</span>
                  <span className="ml-2 text-gray-900 font-semibold">{course.instructor}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderExamSchedule = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Calendar className="w-7 h-7 mr-3 text-purple-600" />
          Upcoming Examinations
        </h2>
        <div className="bg-purple-100 px-4 py-2 rounded-full">
          <span className="text-purple-800 font-semibold">{examSchedule.length} Exams</span>
        </div>
      </div>
      
      {examSchedule.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No upcoming exams scheduled.</p>
          <p className="text-gray-500 mt-2">Your exam schedule will appear here when available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {examSchedule.map((exam, index) => (
            <motion.div
              key={exam.course_code}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{exam.course_name}</h3>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {exam.course_code}
                  </span>
                </div>
                <div className="flex flex-col space-y-3 text-right">
                  <div className="flex items-center justify-end text-gray-700">
                    <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                    <span className="font-semibold text-gray-900">{exam.date}</span>
                  </div>
                  <div className="flex items-center justify-end text-gray-700">
                    <Clock className="w-5 h-5 mr-2 text-green-500" />
                    <span className="font-semibold text-gray-900">{exam.session}</span>
                  </div>
                  <div className="flex items-center justify-end text-gray-700">
                    <MapPin className="w-5 h-5 mr-2 text-orange-500" />
                    <span className="font-semibold text-gray-900">{exam.room}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderHallTicket = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FileText className="w-7 h-7 mr-3 text-orange-600" />
          Hall Ticket
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportHallTicket}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
        >
          <Download className="w-5 h-5" />
          <span className="font-semibold">Download Hall Ticket</span>
        </motion.button>
      </div>
      
      <div id="hallTicket" className="bg-white border-2 border-gray-200 rounded-xl p-8 print:border-black relative shadow-lg">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5 z-0">
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl font-bold text-gray-300 opacity-50">RVCE</div>
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="text-center border-b-2 border-gray-200 pb-6 mb-8 print:border-black">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">EXAMINATION HALL TICKET</h1>
            <p className="text-lg text-gray-700 font-medium">RV College of Engineering</p>
            <p className="text-gray-600 mt-2">Academic Year 2023-24</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <p className="text-gray-600 font-medium mb-1">Student Name:</p>
              <p className="text-xl font-bold text-gray-900">{userData.name}</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
              <p className="text-gray-600 font-medium mb-1">USN:</p>
              <p className="text-xl font-bold text-gray-900">{userData.USN}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="border border-gray-200 p-4 text-left font-bold text-gray-900">Course</th>
                  <th className="border border-gray-200 p-4 text-left font-bold text-gray-900">Date</th>
                  <th className="border border-gray-200 p-4 text-left font-bold text-gray-900">Time</th>
                  <th className="border border-gray-200 p-4 text-left font-bold text-gray-900">Room</th>
                  <th className="border border-gray-200 p-4 text-left font-bold text-gray-900">Signature</th>
                </tr>
              </thead>
              <tbody>
                {examSchedule.map((exam, index) => (
                  <tr key={exam.course_code} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-200 p-4">
                      <div className="font-bold text-gray-900">{exam.course_name}</div>
                      <div className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                        {exam.course_code}
                      </div>
                    </td>
                    <td className="border border-gray-200 p-4 font-semibold text-gray-900">{exam.date}</td>
                    <td className="border border-gray-200 p-4 font-semibold text-gray-900">{exam.session}</td>
                    <td className="border border-gray-200 p-4 font-semibold text-gray-900">{exam.room}</td>
                    <td className="border border-gray-200 p-4 h-16"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 pt-6 border-t-2 border-gray-200 print:border-black">
            <div className="flex justify-between items-end">
              <div className="flex-1">
                <p className="text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <strong className="text-gray-900">Important Note:</strong> This hall ticket must be presented at the examination center along with a valid photo ID card.
                </p>
              </div>
              <div className="text-center ml-8">
                <div className="mt-12 border-t-2 border-gray-900 w-40 pt-2">
                  <p className="font-bold text-gray-900">Principal</p>
                  <p className="text-sm text-gray-600">RV College of Engineering</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-6 left-6 z-50">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-3 rounded-xl shadow-lg border border-gray-200"
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </motion.button>
      </div>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        className={`fixed top-0 left-0 h-full w-72 bg-white/95 backdrop-blur-xl shadow-2xl z-40 transition-transform duration-300 ease-in-out border-r border-gray-200 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-8">
          {/* Profile Section */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{userData.name}</h2>
            <p className="text-sm text-gray-600 mt-1 bg-gray-100 px-3 py-1 rounded-full inline-block">
              {userData.USN}
            </p>
          </div>

          {/* Navigation */}
          <nav className="space-y-3">
            {navigationItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-4 px-5 py-4 rounded-xl transition-all duration-200 ${
                  activeSection === item.id
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : 'hover:bg-gray-100/50 text-gray-700'
                }`}
              >
                <item.icon className={`w-6 h-6 ${activeSection === item.id ? 'text-white' : 'text-gray-500'}`} />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="mt-auto pt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center space-x-4 px-5 py-4 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 border border-red-200"
            >
              <LogOut className="w-6 h-6" />
              <span className="font-medium">Logout</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        <div className="p-6 lg:p-8 pt-20 lg:pt-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {navigationItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h1>
              <p className="text-gray-600 mt-1">
                {activeSection === 'overview' && 'Welcome to your student portal'}
                {activeSection === 'courses' && 'Manage your enrolled courses'}
                {activeSection === 'exams' && 'View your examination schedule'}
                {activeSection === 'hallticket' && 'Download your hall ticket'}
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-xl bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all"
              >
                <Bell className="w-5 h-5 text-gray-600" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-xl bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
          </div>

          {/* Content Area */}
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {sectionLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading...</p>
                </div>
              </div>
            ) : (
              <>
                {activeSection === 'overview' && renderOverview()}
                {activeSection === 'courses' && renderCourses()}
                {activeSection === 'exams' && renderExamSchedule()}
                {activeSection === 'hallticket' && renderHallTicket()}
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
        />
      )}
    </div>
  );
} 