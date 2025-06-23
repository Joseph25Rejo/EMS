'use client';

import { useState, useEffect } from 'react';
import { Loader2, Calendar, Clock, MapPin, AlertCircle, Download, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

export interface ExamSchedule {
  _id: string;
  course_code: string;
  course_name: string;
  date: string;
  start_time: string;
  end_time: string;
  room_id: string;
  room_name: string;
  capacity: number;
  enrolled_students: number;
  conflicts?: string[];
}

const ScheduleTable = () => {
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState({
    date: '',
    room: '',
    course: ''
  });
  const [showConflicts, setShowConflicts] = useState<boolean>(false);

  // Fetch schedules
  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/schedules');
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Filter schedules based on filters
  const filteredSchedules = schedules.filter(schedule => {
    const matchesDate = !filters.date || schedule.date === filters.date;
    const matchesRoom = !filters.room || schedule.room_id === filters.room;
    const matchesCourse = !filters.course || 
      schedule.course_code.toLowerCase().includes(filters.course.toLowerCase()) ||
      schedule.course_name.toLowerCase().includes(filters.course.toLowerCase());
    
    return matchesDate && matchesRoom && matchesCourse;
  });

  // Get unique dates, rooms, and courses for filters
  const uniqueDates = [...new Set(schedules.map(s => s.date))].sort();
  const uniqueRooms = [...new Set(schedules.map(s => ({
    id: s.room_id,
    name: s.room_name
  })))];

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Course Code', 'Course Name', 'Date', 'Time', 'Room', 'Enrolled', 'Capacity'];
    const csvContent = [
      headers.join(','),
      ...filteredSchedules.map(schedule => [
        `"${schedule.course_code}"`,
        `"${schedule.course_name}"`,
        `"${formatDate(schedule.date)}"`,
        `"${schedule.start_time} - ${schedule.end_time}"`,
        `"${schedule.room_name}"`,
        schedule.enrolled_students,
        schedule.capacity
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `exam-schedule-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
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
          <h3 className="text-lg leading-6 font-medium text-gray-900">Exam Schedule</h3>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all scheduled exams
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowConflicts(!showConflicts)}
            className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
              showConflicts 
                ? 'bg-red-100 text-red-700 border-red-300' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            {showConflicts ? 'Hide Conflicts' : 'Show Conflicts'}
          </button>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="date" className="block text-xs font-medium text-gray-700 mb-1">
              Date
            </label>
            <select
              id="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Dates</option>
              {uniqueDates.map(date => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="room" className="block text-xs font-medium text-gray-700 mb-1">
              Room
            </label>
            <select
              id="room"
              name="room"
              value={filters.room}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Rooms</option>
              {uniqueRooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="course" className="block text-xs font-medium text-gray-700 mb-1">
              Course
            </label>
            <input
              type="text"
              name="course"
              id="course"
              value={filters.course}
              onChange={handleFilterChange}
              placeholder="Search by course code/name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacity
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSchedules.length > 0 ? (
              filteredSchedules.map((schedule) => (
                <tr 
                  key={`${schedule.course_code}-${schedule.room_id}-${schedule.date}`}
                  className={`${schedule.conflicts && schedule.conflicts.length > 0 ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {schedule.course_code}
                        </div>
                        <div className="text-sm text-gray-500">
                          {schedule.course_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Calendar className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm text-gray-900">
                          {formatDate(schedule.date)}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {schedule.start_time} - {schedule.end_time}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <MapPin className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm text-gray-900">
                          {schedule.room_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {schedule.room_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {schedule.enrolled_students} / {schedule.capacity}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div 
                        className={`h-2.5 rounded-full ${
                          schedule.enrolled_students / schedule.capacity > 0.9 
                            ? 'bg-red-500' 
                            : schedule.enrolled_students / schedule.capacity > 0.7 
                              ? 'bg-yellow-500' 
                              : 'bg-green-500'
                        }`}
                        style={{ 
                          width: `${Math.min(100, (schedule.enrolled_students / schedule.capacity) * 100)}%` 
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No schedules found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Conflicts Section */}
      {showConflicts && (
        <div className="border-t border-gray-200 px-6 py-4 bg-red-50">
          <h4 className="text-sm font-medium text-red-800 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Scheduling Conflicts
          </h4>
          <div className="mt-2 text-sm text-red-700">
            {schedules.some(s => s.conflicts && s.conflicts.length > 0) ? (
              <ul className="list-disc pl-5 space-y-1">
                {schedules.flatMap(schedule => 
                  (schedule.conflicts || []).map((conflict, idx) => (
                    <li key={`${schedule._id}-${idx}`}>
                      {conflict}
                    </li>
                  ))
                )}
              </ul>
            ) : (
              <p>No scheduling conflicts detected.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleTable;