'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Calendar, Users, MapPin, Clock } from 'lucide-react';

interface Conflict {
  type: string;
  description: string;
  courses?: string[];
  students?: string[];
  rooms?: string[];
  dates?: string[];
  severity?: 'high' | 'medium' | 'low';
}

interface ConflictResponse {
  conflicts: Conflict[];
}

export default function ConflictsPage() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchConflicts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://127.0.0.1:5000/api/schedules/conflicts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ConflictResponse = await response.json();
      
      // If conflicts is not an array, make it an empty array
      const conflictsArray = Array.isArray(data.conflicts) ? data.conflicts : [];
      
      setConflicts(conflictsArray);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching conflicts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch conflicts');
      setConflicts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConflicts();
  }, []);

  const getSeverityColor = (severity: string = 'medium') => {
    switch (severity) {
      case 'high': return 'bg-red-100 border-red-300 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string = 'medium') => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'low': return <AlertTriangle className="w-5 h-5 text-blue-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getConflictTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'student': return <Users className="w-4 h-4" />;
      case 'room': return <MapPin className="w-4 h-4" />;
      case 'time': return <Clock className="w-4 h-4" />;
      case 'schedule': return <Calendar className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Schedule Conflicts</h1>
          <p className="text-gray-600">Detecting conflicts in the current schedule...</p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading conflicts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Schedule Conflicts</h1>
            <p className="text-gray-600">
              Review and resolve scheduling conflicts to ensure smooth exam operations
            </p>
          </div>
          <button
            onClick={fetchConflicts}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {lastUpdated && (
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <h3 className="font-medium text-red-800">Error Loading Conflicts</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && conflicts.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 max-w-md mx-auto">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-green-800 mb-2">No Conflicts Found</h3>
            <p className="text-green-700">
              Great! Your current schedule has no detected conflicts. All exams are properly scheduled.
            </p>
          </div>
        </div>
      )}

      {conflicts.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Conflict Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="font-medium text-red-800">
                    High Priority: {conflicts.filter(c => c.severity === 'high').length}
                  </span>
                </div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="font-medium text-yellow-800">
                    Medium Priority: {conflicts.filter(c => c.severity === 'medium').length}
                  </span>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-800">
                    Low Priority: {conflicts.filter(c => c.severity === 'low').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {conflicts.map((conflict, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getSeverityColor(conflict.severity)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getSeverityIcon(conflict.severity)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getConflictTypeIcon(conflict.type)}
                    <h3 className="font-medium text-gray-900">
                      {conflict.type.charAt(0).toUpperCase() + conflict.type.slice(1)} Conflict
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      conflict.severity === 'high' ? 'bg-red-200 text-red-800' :
                      conflict.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {conflict.severity?.toUpperCase() || 'MEDIUM'}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{conflict.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {conflict.courses && conflict.courses.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Affected Courses:</h4>
                        <div className="flex flex-wrap gap-1">
                          {conflict.courses.map((course, idx) => (
                            <span key={idx} className="px-2 py-1 bg-white bg-opacity-50 rounded text-sm">
                              {course}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {conflict.students && conflict.students.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Affected Students:</h4>
                        <div className="flex flex-wrap gap-1">
                          {conflict.students.slice(0, 5).map((student, idx) => (
                            <span key={idx} className="px-2 py-1 bg-white bg-opacity-50 rounded text-sm">
                              {student}
                            </span>
                          ))}
                          {conflict.students.length > 5 && (
                            <span className="px-2 py-1 bg-white bg-opacity-50 rounded text-sm">
                              +{conflict.students.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {conflict.rooms && conflict.rooms.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Affected Rooms:</h4>
                        <div className="flex flex-wrap gap-1">
                          {conflict.rooms.map((room, idx) => (
                            <span key={idx} className="px-2 py-1 bg-white bg-opacity-50 rounded text-sm">
                              {room}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {conflict.dates && conflict.dates.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Affected Dates:</h4>
                        <div className="flex flex-wrap gap-1">
                          {conflict.dates.map((date, idx) => (
                            <span key={idx} className="px-2 py-1 bg-white bg-opacity-50 rounded text-sm">
                              {date}
                            </span>
                          ))}
                        </div>
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