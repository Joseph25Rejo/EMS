'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Users, Calendar, Clock, BookOpen, Loader2 } from 'lucide-react';

type Conflict = {
  type: string;
  student_id?: string;
  student_name?: string;
  course1?: string;
  course2?: string;
  date?: string;
  time_slot?: string;
  details?: string;
};

export default function ConflictsPage() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchConflicts = async () => {
      try {
        const response = await fetch('/api/schedules/conflicts');
        if (!response.ok) {
          throw new Error('Failed to fetch conflicts');
        }
        const data = await response.json();
        setConflicts(data.conflicts || []);
      } catch (err) {
        console.error('Error fetching conflicts:', err);
        setError('Failed to load conflicts');
      } finally {
        setLoading(false);
      }
    };

    fetchConflicts();
  }, []);

  const filteredConflicts = conflicts.filter(conflict => {
    if (activeFilter === 'all') return true;
    return conflict.type === activeFilter;
  });

  const conflictTypes = [
    { id: 'all', name: 'All Conflicts', count: conflicts.length },
    { 
      id: 'time', 
      name: 'Time Conflicts', 
      count: conflicts.filter(c => c.type === 'time').length 
    },
    { 
      id: 'student', 
      name: 'Student Conflicts', 
      count: conflicts.filter(c => c.type === 'student').length 
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Scheduling Conflicts</h1>
        <p className="text-gray-600 mt-1">
          {conflicts.length} conflicts found
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {conflictTypes.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-center ${
                activeFilter === filter.id
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.name}
              <span className="ml-1.5 bg-white/50 rounded-full px-2 py-0.5 text-xs">
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Conflicts List */}
      {filteredConflicts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No conflicts found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeFilter === 'all' 
              ? 'No scheduling conflicts detected.' 
              : `No ${activeFilter} conflicts found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConflicts.map((conflict, index) => (
            <div 
              key={index} 
              className="bg-white shadow-sm rounded-lg border border-red-100 overflow-hidden"
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 capitalize">
                        {conflict.type} Conflict
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {conflict.type}
                      </span>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-700 space-y-2">
                      {conflict.student_name && (
                        <p className="flex items-center">
                          <Users className="h-4 w-4 text-gray-500 mr-2" />
                          <span>Student: {conflict.student_name} ({conflict.student_id})</span>
                        </p>
                      )}
                      
                      {conflict.course1 && conflict.course2 && (
                        <p className="flex items-center">
                          <BookOpen className="h-4 w-4 text-gray-500 mr-2" />
                          <span>Courses: {conflict.course1} and {conflict.course2}</span>
                        </p>
                      )}
                      
                      {conflict.date && (
                        <p className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                          <span>Date: {new Date(conflict.date).toLocaleDateString()}</span>
                        </p>
                      )}
                      
                      {conflict.time_slot && (
                        <p className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 mr-2" />
                          <span>Time: {conflict.time_slot}</span>
                        </p>
                      )}
                    </div>
                    
                    {conflict.details && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">{conflict.details}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
