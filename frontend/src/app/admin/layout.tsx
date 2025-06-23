'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Calendar, 
  Users, 
  BookOpen, 
  Building, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  BarChart3,
  AlertTriangle,
  Plus
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  
  const handleLogout = () => {
    // Clear any admin-specific data from localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Redirect to login page
    router.push('/login')
  }
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Courses', href: '/admin/courses', icon: BookOpen },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Rooms', href: '/admin/rooms', icon: Building },
    { name: 'Schedules', href: '/admin/schedules', icon: Calendar },
    { name: 'Conflicts', href: '/admin/schedules/conflicts', icon: AlertTriangle },
  ]

  const quickActions = [
    { name: 'Add Course', href: '/admin/courses/create', icon: Plus },
    { name: 'Add Room', href: '/admin/rooms/create', icon: Plus },
    { name: 'Generate Schedule', href: '/admin/schedules/generate', icon: Calendar },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <h1 className="text-xl font-bold text-gray-900">Exam Scheduler</h1>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-gray-900 border-r-2 border-blue-700 font-semibold'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-gray-900' : 'text-gray-500'
                    }`} />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            <div className="pt-6 mt-6 border-t">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick Actions
              </h3>
              <div className="mt-2 space-y-1">
                {quickActions.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <item.icon className="mr-3 h-4 w-4 text-gray-500" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-700">A</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Admin User</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="mt-3 flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              {/* Search box removed as it's not currently in use */}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}