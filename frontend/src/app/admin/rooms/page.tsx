'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building, Search, Plus, Trash2, Edit, Loader2, AlertCircle } from 'lucide-react';
import { API_ENDPOINTS } from '../../../lib/config';

interface Room {
  _id: string;
  room_id: string;
  room_name: string;
  capacity: number;
  description?: string;
  floor?: number;
  building?: string;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  // Filter rooms based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRooms(rooms);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = rooms.filter(
        (room) =>
          room.room_id.toLowerCase().includes(term) ||
          room.room_name.toLowerCase().includes(term) ||
          (room.building && room.building.toLowerCase().includes(term)) ||
          (room.description && room.description.toLowerCase().includes(term))
      );
      setFilteredRooms(filtered);
    }
  }, [searchTerm, rooms]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(API_ENDPOINTS.ROOMS, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Ensure we have an array of rooms
      const roomsList = Array.isArray(data) ? data : [];
      setRooms(roomsList);
      setFilteredRooms(roomsList);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err instanceof Error ? err.message : 'Failed to load rooms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return;
    }

    try {
      // First get the room to ensure it exists and get its room_id
      const room = rooms.find(r => r._id === roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      const response = await fetch(`${API_ENDPOINTS.ROOMS}/${room.room_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete room');
      }

      // Show success message and refresh the rooms list
      alert('Room deleted successfully');
      fetchRooms();
    } catch (err) {
      console.error('Error deleting room:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete room. Please try again.';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    }
  };

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
              <button
                onClick={fetchRooms}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage examination rooms and their capacities
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/rooms/create')}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Room
        </button>
      </div>

      {/* Search and filter */}
      <div className="mb-6">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 placeholder-gray-900"
            placeholder="Search rooms by ID, name, or building..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Rooms list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredRooms.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              {searchTerm ? 'No rooms match your search' : 'No rooms found'}
            </li>
          ) : (
            filteredRooms.map((room) => (
              <li key={room._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {room.room_name} ({room.room_id})
                        </div>
                        <div className="text-sm text-gray-500">
                          Capacity: {room.capacity} students
                          {room.building && ` • Building: ${room.building}`}
                          {room.floor && ` • Floor: ${room.floor}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/admin/rooms/edit/${room._id}`)}
                        className="text-gray-400 hover:text-blue-600"
                        title="Edit room"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(room._id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete room"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  {room.description && (
                    <div className="mt-2 text-sm text-gray-500">
                      {room.description}
                    </div>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}