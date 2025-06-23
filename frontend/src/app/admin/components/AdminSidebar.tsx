'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Users, Calendar, FileText, BarChart, Settings, LogOut } from 'lucide-react';

const AdminSidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { 
      name: 'Dashboard', 
      href: '/admin/dashboard', 
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: pathname === '/admin/dashboard'
    },
    { 
      name: 'Courses', 
      href: '/admin/courses', 
      icon: <BookOpen className="h-5 w-5" />,
      active: pathname.startsWith('/admin/courses')
    },
    { 
      name: 'Students', 
      href: '/admin/students', 
      icon: <Users className="h-5 w-5" />,
      active: pathname.startsWith('/admin/students')
    },
    { 
      name: 'Rooms', 
      href: '/admin/rooms', 
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: pathname.startsWith('/admin/rooms')
    },
    { 
      name: 'Schedule', 
      href: '/admin/schedule', 
      icon: <Calendar className="h-5 w-5" />,
      active: pathname.startsWith('/admin/schedule')
    },
    { 
      name: 'Hall Tickets', 
      href: '/admin/hall-tickets', 
      icon: <FileText className="h-5 w-5" />,
      active: pathname.startsWith('/admin/hall-tickets')
    },
    { 
      name: 'Reports', 
      href: '/admin/reports', 
      icon: <BarChart className="h-5 w-5" />,
      active: pathname.startsWith('/admin/reports')
    },
    { 
      name: 'Settings', 
      href: '/admin/settings', 
      icon: <Settings className="h-5 w-5" />,
      active: pathname.startsWith('/admin/settings')
    },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 h-screen bg-gray-900 text-white">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 bg-gray-800">
          <h1 className="text-xl font-bold">Exam Scheduler</h1>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  item.active
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">A</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Admin User</p>
              <button className="text-xs text-gray-400 hover:text-white flex items-center">
                <LogOut className="h-3.5 w-3.5 mr-1" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;