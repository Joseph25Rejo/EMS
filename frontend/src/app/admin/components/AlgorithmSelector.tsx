'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AlgorithmSelectorProps {
  onScheduleGenerated?: (schedule: any) => void;
  className?: string;
}

const algorithms = [
  {
    id: 'graph_coloring',
    name: 'Graph Coloring',
    description: 'Uses graph coloring algorithm to schedule exams with minimal conflicts'
  },
  {
    id: 'simulated_annealing',
    name: 'Simulated Annealing',
    description: 'Uses probabilistic technique for approximating the global optimum'
  },
  {
    id: 'genetic',
    name: 'Genetic Algorithm',
    description: 'Uses evolutionary algorithm inspired by natural selection'
  }
];

const AlgorithmSelector = ({ onScheduleGenerated, className = '' }: AlgorithmSelectorProps) => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('graph_coloring');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [constraints, setConstraints] = useState({
    start_date: new Date().toISOString().split('T')[0],
    max_duration: 120,
    min_gap: 1
  });

  const handleGenerateSchedule = async () => {
    if (!selectedAlgorithm) {
      toast.error('Please select an algorithm');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/schedules/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          algorithm: selectedAlgorithm,
          constraints: {
            ...constraints,
            start_date: constraints.start_date
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate schedule');
      }

      const data = await response.json();
      
      if (data.schedule) {
        toast.success('Schedule generated successfully!');
        if (onScheduleGenerated) {
          onScheduleGenerated(data.schedule);
        }
      } else {
        throw new Error('No schedule data returned');
      }
    } catch (error) {
      console.error('Error generating schedule:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConstraintChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setConstraints(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value
    }));
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Generate Schedule</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Algorithm
          </label>
          <div className="space-y-2">
            {algorithms.map((algo) => (
              <div 
                key={algo.id}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedAlgorithm === algo.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedAlgorithm(algo.id)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    id={algo.id}
                    name="algorithm"
                    checked={selectedAlgorithm === algo.id}
                    onChange={() => {}}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={algo.id} className="ml-2 block">
                    <span className="font-medium">{algo.name}</span>
                    <p className="text-sm text-gray-500">{algo.description}</p>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Constraints</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={constraints.start_date}
                onChange={handleConstraintChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="max_duration" className="block text-sm font-medium text-gray-700">
                Max Duration (minutes)
              </label>
              <input
                type="number"
                id="max_duration"
                name="max_duration"
                min="30"
                max="240"
                step="15"
                value={constraints.max_duration}
                onChange={handleConstraintChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="min_gap" className="block text-sm font-medium text-gray-700">
                Minimum Gap (days)
              </label>
              <input
                type="number"
                id="min_gap"
                name="min_gap"
                min="0"
                max="7"
                value={constraints.min_gap}
                onChange={handleConstraintChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={handleGenerateSchedule}
            disabled={isLoading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Generating...
              </>
            ) : (
              'Generate Schedule'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmSelector;