'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Edit, Loader2, User, Users, LayoutGrid } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface Bench {
  id: string;
  name: string;
  capacity: number;
  occupied: number;
  position: { x: number; y: number; rotation: number };
}

interface Course {
  code: string;
  name: string;
  department: string;
}

export default function CourseBenchesPage() {
  const params = useParams();
  const router = useRouter();
  const courseCode = Array.isArray(params.courseCode) ? params.courseCode[0] : params.courseCode;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [benches, setBenches] = useState<Bench[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBench, setSelectedBench] = useState<Bench | null>(null);
  const [showAddBench, setShowAddBench] = useState(false);
  const [newBench, setNewBench] = useState<Omit<Bench, 'id'>>({ 
    name: '', 
    capacity: 4, 
    occupied: 0,
    position: { x: 50, y: 50, rotation: 0 }
  });

  // Fetch course and benches data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch course details
        const courseRes = await fetch(`/api/courses/${courseCode}`);
        if (!courseRes.ok) throw new Error('Failed to fetch course');
        const courseData = await courseRes.json();
        setCourse(courseData);

        // Fetch benches for this course
        const benchesRes = await fetch(`/api/courses/${courseCode}/benches`);
        if (!benchesRes.ok) throw new Error('Failed to fetch benches');
        const benchesData = await benchesRes.json();
        setBenches(benchesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseCode]);

  const handleAddBench = () => {
    setShowAddBench(true);
    setSelectedBench(null);
    setNewBench({
      name: `Bench ${benches.length + 1}`,
      capacity: 4,
      occupied: 0,
      position: { x: 50, y: 50, rotation: 0 }
    });
  };

  const handleSaveBench = async () => {
    if (!newBench.name.trim()) {
      toast.error('Please enter a bench name');
      return;
    }

    setIsSaving(true);
    try {
      const url = selectedBench 
        ? `/api/courses/${courseCode}/benches/${selectedBench.id}`
        : `/api/courses/${courseCode}/benches`;
      
      const method = selectedBench ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBench)
      });

      if (!response.ok) throw new Error('Failed to save bench');

      const savedBench = await response.json();
      
      if (selectedBench) {
        setBenches(benches.map(b => b.id === selectedBench.id ? savedBench : b));
      } else {
        setBenches([...benches, savedBench]);
      }
      
      toast.success(`Bench ${selectedBench ? 'updated' : 'added'} successfully`);
      setShowAddBench(false);
    } catch (error) {
      console.error('Error saving bench:', error);
      toast.error('Failed to save bench');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBench = async (benchId: string) => {
    if (!confirm('Are you sure you want to delete this bench? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseCode}/benches/${benchId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete bench');

      setBenches(benches.filter(b => b.id !== benchId));
      toast.success('Bench deleted successfully');
    } catch (error) {
      console.error('Error deleting bench:', error);
      toast.error('Failed to delete bench');
    }
  };

  const handleBenchClick = (bench: Bench) => {
    if (isEditing) {
      setSelectedBench(bench);
      setNewBench({
        name: bench.name,
        capacity: bench.capacity,
        occupied: bench.occupied,
        position: { ...bench.position }
      });
      setShowAddBench(true);
    }
    // In non-edit mode, you could show bench details
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Course not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <div className="flex items-center">
              <Link 
                href={`/admin/courses/${courseCode}`} 
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
                  {course.code} - {course.name}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage seating arrangement and bench assignments
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex space-x-3 md:mt-0">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isEditing 
                  ? 'bg-blue-600 text-white border-transparent hover:bg-blue-700' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Edit className="-ml-1 mr-2 h-4 w-4" />
              {isEditing ? 'Done Editing' : 'Edit Layout'}
            </button>
            <button
              type="button"
              onClick={handleAddBench}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="-ml-1 mr-2 h-4 w-4" />
              Add Bench
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Layout Editor / Viewer */}
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg h-[600px] bg-gray-50 overflow-hidden">
            {benches.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <LayoutGrid className="h-12 w-12 mb-4" />
                <p>No benches added yet. Click 'Add Bench' to get started.</p>
              </div>
            ) : (
              <>
                {benches.map((bench) => (
                  <div
                    key={bench.id}
                    onClick={() => handleBenchClick(bench)}
                    className={`absolute cursor-${isEditing ? 'move' : 'pointer'} p-3 rounded-md ${
                      isEditing ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white border border-gray-200 hover:border-blue-300'
                    }`}
                    style={{
                      left: `${bench.position.x}%`,
                      top: `${bench.position.y}%`,
                      transform: `rotate(${bench.position.rotation}deg)`
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <LayoutGrid className={`h-8 w-8 ${isEditing ? 'text-blue-600' : 'text-gray-600'}`} />
                        <span className="absolute -top-2 -right-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                          {bench.capacity}
                        </span>
                      </div>
                      <span className="mt-1 text-xs font-medium text-center">{bench.name}</span>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <User className="h-3 w-3 mr-1" />
                        {bench.occupied}/{bench.capacity}
                      </div>
                    </div>
                    {isEditing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBench(bench.id);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Bench List */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bench List</h3>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {benches.length === 0 ? (
                  <li className="px-6 py-4 text-center text-gray-500">
                    No benches have been added yet.
                  </li>
                ) : (
                  benches.map((bench) => (
                    <li key={bench.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-md">
                            <LayoutGrid className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{bench.name}</div>
                            <div className="text-sm text-gray-500">
                              Capacity: {bench.capacity} seats • Position: ({Math.round(bench.position.x)}%, {Math.round(bench.position.y)}%)
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="flex items-center text-sm text-gray-500 mr-4">
                            <Users className="h-4 w-4 mr-1" />
                            {bench.occupied}/{bench.capacity} occupied
                          </div>
                          <button
                            onClick={() => handleBenchClick(bench)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            {isEditing ? 'Edit' : 'View'}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Bench Modal */}
      {showAddBench && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedBench ? 'Edit Bench' : 'Add New Bench'}
              </h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label htmlFor="bench-name" className="block text-sm font-medium text-gray-700">
                  Bench Name
                </label>
                <input
                  type="text"
                  id="bench-name"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={newBench.name}
                  onChange={(e) => setNewBench({...newBench, name: e.target.value})}
                  placeholder="e.g., Front Left Bench"
                />
              </div>
              <div>
                <label htmlFor="bench-capacity" className="block text-sm font-medium text-gray-700">
                  Capacity (seats)
                </label>
                <input
                  type="number"
                  id="bench-capacity"
                  min="1"
                  max="10"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={newBench.capacity}
                  onChange={(e) => setNewBench({...newBench, capacity: parseInt(e.target.value) || 1})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Position X: {Math.round(newBench.position.x)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    className="mt-1 w-full"
                    value={newBench.position.x}
                    onChange={(e) => setNewBench({
                      ...newBench, 
                      position: { ...newBench.position, x: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Position Y: {Math.round(newBench.position.y)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    className="mt-1 w-full"
                    value={newBench.position.y}
                    onChange={(e) => setNewBench({
                      ...newBench, 
                      position: { ...newBench.position, y: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rotation: {newBench.position.rotation}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  className="mt-1 w-full"
                  value={newBench.position.rotation}
                  onChange={(e) => setNewBench({
                    ...newBench, 
                    position: { ...newBench.position, rotation: parseInt(e.target.value) }
                  })}
                />
              </div>
              <div className="mt-2 p-4 border border-gray-200 rounded-md bg-gray-50 text-center">
                <div className="inline-block relative">
                  <div 
                    className="transform"
                    style={{
                      transform: `rotate(${newBench.position.rotation}deg)`
                    }}
                  >
                    <LayoutGrid className="h-16 w-16 mx-auto text-blue-600" />
                  </div>
                  <div className="mt-1 text-xs font-medium">{newBench.name || 'New Bench'}</div>
                  <div className="text-xs text-gray-500">{newBench.capacity} seats</div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 text-right space-x-3">
              <button
                type="button"
                onClick={() => setShowAddBench(false)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBench}
                disabled={isSaving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  'Save Bench'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
