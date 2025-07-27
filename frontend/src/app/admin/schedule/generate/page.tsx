'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Clock, Calendar, AlertCircle, Loader2, CheckCircle, XCircle, BarChart2, Cpu, Dna } from 'lucide-react';

const API_URL = 'http://localhost:5000';

type Algorithm = 'graph_coloring' | 'simulated_annealing' | 'genetic';
type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface TimeSlot {
  start: string;
  end: string;
}

interface ScheduleConstraints {
  start_date: string;
  end_date: string;
  exam_duration_minutes: number;
  max_exams_per_day: number;
  time_slots: TimeSlot[];
  excluded_days: DayOfWeek[];
  min_gap_between_exams: number;
}

const algorithmInfo = {
  graph_coloring: {
    name: 'Graph Coloring',
    description: 'Uses graph theory to minimize conflicts by assigning different colors to adjacent nodes',
    icon: BarChart2,
  },
  simulated_annealing: {
    name: 'Simulated Annealing',
    description: 'A probabilistic technique for approximating the global optimum of a given function',
    icon: Cpu,
  },
  genetic: {
    name: 'Genetic Algorithm',
    description: 'Uses evolutionary algorithms to find optimal or near-optimal solutions',
    icon: Dna,
  },
};

export default function GenerateSchedulePage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [algorithm, setAlgorithm] = useState<Algorithm>('graph_coloring');
  
  const [constraints, setConstraints] = useState<ScheduleConstraints>({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    exam_duration_minutes: 180,
    max_exams_per_day: 2,
    min_gap_between_exams: 24, // in hours
    time_slots: [
      { start: '09:00', end: '12:00' },
      { start: '14:00', end: '17:00' }
    ],
    excluded_days: ['saturday', 'sunday']
  });

  const handleGenerateSchedule = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setSuccess(null);

      // Prepare the request body
      const requestBody = {
        algorithm: algorithm,
        constraints: {
          ...constraints,
          // Ensure dates are in YYYY-MM-DD format
          start_date: new Date(constraints.start_date).toISOString().split('T')[0],
          end_date: new Date(constraints.end_date).toISOString().split('T')[0]
        }
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}https://ems-oty3.onrender.com/api/schedules/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate schedule');
      }

      setSuccess('Schedule generated successfully!');
      // Optionally redirect to view the generated schedule
      // router.push('/admin/schedule/view');
    } catch (err) {
      console.error('Error generating schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate schedule');
    } finally {
      setIsGenerating(false);
    }
  };

  const addTimeSlot = () => {
    setConstraints(prev => ({
      ...prev,
      time_slots: [...prev.time_slots, { start: '09:00', end: '12:00' }]
    }));
  };

  const removeTimeSlot = (index: number) => {
    setConstraints(prev => ({
      ...prev,
      time_slots: prev.time_slots.filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (index: number, field: 'start' | 'end', value: string) => {
    setConstraints(prev => ({
      ...prev,
      time_slots: prev.time_slots.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const toggleExcludedDay = (day: DayOfWeek) => {
    setConstraints(prev => ({
      ...prev,
      excluded_days: prev.excluded_days.includes(day)
        ? prev.excluded_days.filter(d => d !== day)
        : [...prev.excluded_days, day]
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Generate Exam Schedule</h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure the parameters and generate an optimal exam schedule
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
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
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Algorithm Selection */}
        <div className="lg:col-span-1">
          <div className="rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900">Scheduling Algorithm</h2>
              <p className="mt-1 text-sm text-gray-500">
                Select the algorithm to use for generating the schedule.
              </p>
              
              <div className="mt-6 space-y-4">
                {Object.entries(algorithmInfo).map(([key, info]) => {
                  const Icon = info.icon;
                  return (
                    <div 
                      key={key}
                      onClick={() => setAlgorithm(key as Algorithm)}
                      className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                        algorithm === key 
                          ? 'border-blue-500 bg-blue-50 text-gray-900' 
                          : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">{info.name}</p>
                          <p className="text-xs text-gray-500">{info.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Constraints */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg bg-white shadow overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900">Schedule Constraints</h2>
              <p className="mt-1 text-sm text-gray-500">
                Configure the parameters for the exam schedule
              </p>

              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      id="start_date"
                      value={constraints.start_date}
                      onChange={(e) => setConstraints(prev => ({ ...prev, start_date: e.target.value }))}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      id="end_date"
                      value={constraints.end_date}
                      onChange={(e) => setConstraints(prev => ({ ...prev, end_date: e.target.value }))}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="exam_duration" className="block text-sm font-medium text-gray-700">
                    Exam Duration (minutes)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="exam_duration"
                      min="30"
                      step="30"
                      value={constraints.exam_duration_minutes}
                      onChange={(e) => setConstraints(prev => ({ ...prev, exam_duration_minutes: parseInt(e.target.value) }))}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="max_exams_per_day" className="block text-sm font-medium text-gray-700">
                    Max Exams Per Day
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="max_exams_per_day"
                      min="1"
                      max="4"
                      value={constraints.max_exams_per_day}
                      onChange={(e) => setConstraints(prev => ({ ...prev, max_exams_per_day: parseInt(e.target.value) }))}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Slots
                  </label>
                  <div className="space-y-2">
                    {constraints.time_slots.map((slot, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) => updateTimeSlot(index, 'start', e.target.value)}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                        />
                        <span className="flex items-center">to</span>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) => updateTimeSlot(index, 'end', e.target.value)}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                        />
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(index)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addTimeSlot}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add Time Slot
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excluded Days
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <div key={day} className="flex items-center">
                        <input
                          id={day}
                          name="excluded_days"
                          type="checkbox"
                          checked={constraints.excluded_days.includes(day as DayOfWeek)}
                          onChange={() => toggleExcludedDay(day as DayOfWeek)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded text-gray-900"
                        />
                        <label htmlFor={day} className="ml-2 block text-sm text-gray-900 capitalize">
                          {day}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGenerateSchedule}
              disabled={isGenerating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="-ml-1 mr-2 h-4 w-4" />
                  Generate Schedule
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
