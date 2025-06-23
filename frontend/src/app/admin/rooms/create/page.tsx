'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building, ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { API_ENDPOINTS } from '../../../../lib/config';

interface FormData {
  room_id: string;
  room_name: string;
  capacity?: number;
  building?: string;
  floor?: number;
  description?: string;
}

export default function CreateRoomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    room_id: '',
    room_name: '',
    capacity: undefined,
    building: '',
    floor: undefined,
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'capacity' || name === 'floor') ? (value === '' ? undefined : Number(value)) : value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.room_id.trim()) {
      setError('Room ID is required');
      return false;
    }
    if (!formData.room_name.trim()) {
      setError('Room name is required');
      return false;
    }
    if (formData.capacity === undefined || formData.capacity === null || formData.capacity <= 0) {
      setError('Please enter a valid capacity (must be a positive number)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepare the room data according to API requirements
      const roomData: {
        room_id: string;
        room_name: string;
        capacity: number;
        building?: string;
        floor?: number;
        description?: string;
      } = {
        room_id: formData.room_id.trim(),
        room_name: formData.room_name.trim(),
        capacity: formData.capacity || 0, // Default to 0 if undefined (validation will catch invalid values)
      };

      // Add optional fields if they have values
      if (formData.building?.trim()) roomData.building = formData.building.trim();
      if (formData.floor) roomData.floor = formData.floor;
      if (formData.description?.trim()) roomData.description = formData.description.trim();

      const response = await fetch(API_ENDPOINTS.ROOMS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create room');
      }
      
      // Redirect to rooms list on success
      router.push('/admin/rooms');
      
    } catch (err) {
      console.error('Error creating room:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link 
          href="/admin/rooms" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Rooms
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Room</h1>
        <p className="mt-1 text-sm text-gray-600">
          Add a new examination room to the system
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Room ID */}
              <div className="sm:col-span-2">
                <label htmlFor="room_id" className="block text-sm font-medium text-gray-700">
                  Room ID *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="room_id"
                    id="room_id"
                    value={formData.room_id}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 placeholder-gray-900"
                    placeholder="e.g., R101"
                    required
                  />
                </div>
              </div>

              {/* Room Name */}
              <div className="sm:col-span-4">
                <label htmlFor="room_name" className="block text-sm font-medium text-gray-700">
                  Room Name *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="room_name"
                    id="room_name"
                    value={formData.room_name}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 placeholder-gray-900"
                    placeholder="e.g., Main Hall"
                    required
                  />
                </div>
              </div>

              {/* Building */}
              <div className="sm:col-span-3">
                <label htmlFor="building" className="block text-sm font-medium text-gray-700">
                  Building
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="building"
                    id="building"
                    value={formData.building}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 placeholder-gray-900"
                    placeholder="e.g., Engineering Block"
                  />
                </div>
              </div>

              {/* Floor */}
              <div className="sm:col-span-1">
                <label htmlFor="floor" className="block text-sm font-medium text-gray-700">
                  Floor
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="floor"
                    id="floor"
                    min="0"
                    value={formData.floor ?? ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 placeholder-gray-900"
                    placeholder="e.g., 1"
                  />
                </div>
              </div>

              {/* Capacity */}
              <div className="sm:col-span-2">
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                  Capacity *
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="capacity"
                    id="capacity"
                    min="1"
                    value={formData.capacity ?? ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 placeholder-gray-900"
                    placeholder="e.g., 50"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 placeholder-gray-900"
                    placeholder="Any additional details about the room..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <div className="flex items-center">
                <Link
                  href="/admin/rooms"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="-ml-1 mr-2 h-4 w-4" />
                      Save Room
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}