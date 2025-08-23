"use client";
import { useState, useEffect, useCallback } from "react";
import { User, Edit2, Save, X, Phone, Mail, MapPin } from "lucide-react";
import Image from "next/image";

const API_BASE_URL = "https://thecodeworks.in/kalarasa";

// Define proper interfaces
interface UserProfile {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  age: string;
  state: string;
  address: string;
}

interface ApiResponse {
  user: UserProfile;
  error?: string;
}

function ProfilePage() {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<UserProfile>({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    age: '',
    state: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Get logged-in user email from localStorage
  const getUserEmail = (): string | null => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;
      const user = JSON.parse(userStr) as { email?: string };
      return user.email || null;
    } catch {
      return null;
    }
  };

  // Fetch profile data - wrapped in useCallback to fix dependency warning
  const fetchProfileData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    const email = getUserEmail();
    if (!email) {
      setError("User not logged in");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/get_profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json() as ApiResponse;

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to fetch profile");
      }

      setProfileData(data.user);
      setEditedData(data.user);
    } catch (err: unknown) {
      console.error("Error fetching profile:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load profile data";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array since getUserEmail is defined inside and doesn't depend on external state

  // Update profile data
  const updateProfileData = async () => {
    setIsLoading(true);
    setError("");
    setSaveSuccess(false);

    const email = getUserEmail();
    if (!email) {
      setError("User not logged in");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/update_profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          first_name: editedData.first_name,
          last_name: editedData.last_name,
          phone: editedData.phone,
          age: editedData.age,
          state: editedData.state,
          address: editedData.address,
        }),
      });

      const data = await response.json() as { error?: string };

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfileData(editedData);
      setIsEditing(false);
      setSaveSuccess(true);

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      console.error("Error updating profile:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditedData((prev: UserProfile) => ({ ...prev, [field]: value }));
  };

  const handleCancelEdit = () => {
    if (profileData) {
      setEditedData(profileData);
    }
    setIsEditing(false);
    setError("");
  };

  const handleSaveChanges = () => {
    if (!editedData.first_name?.trim() || !editedData.last_name?.trim()) {
      setError("First name and last name are required");
      return;
    }
    if (
      editedData.phone &&
      !/^\+?\d{10,15}$/.test(editedData.phone.replace(/\s/g, ""))
    ) {
      setError("Please enter a valid phone number");
      return;
    }
    updateProfileData();
  };

  if (isLoading && !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-yellow-100 to-green-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="text-gray-700">Loading profile...</span>
        </div>
      </div>
    );
  }
  
  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        No profile data found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-yellow-100 to-green-100" style={{ backgroundColor: "#ECFF72" }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="w-full px-6 py-4">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Image
                src="/logo.svg"
                alt="Kalarasa logo"
                width={48}
                height={48}
                className="w-48 h-10"
                />
            </div>
            <button
                onClick={() => {
                // Clear localStorage and redirect to login
                localStorage.removeItem('user_id');
                localStorage.removeItem('user_email');
                localStorage.removeItem('is_logged_in');
                localStorage.removeItem('google_user');
                window.location.href = '/login'; // or use router.push('/') if you have useRouter
                }}
                className="flex items-center gap-2 text-gray-700 hover:text-red-600 text-sm font-medium transition-colors cursor-pointer mr-8"
            >
                Sign Out
                <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
            </button>
            </div>
        </div>
        </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-yellow-300 to-green-300 px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-red-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">
                    {profileData.first_name} {profileData.last_name}
                  </h2>
                  <p className="text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {profileData.email}
                  </p>
                </div>
              </div>
              
              {!isEditing ? (
                <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-gray-700 hover:text-red-600 text-lg font-medium transition-colors cursor-pointer mr-4"
                >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Success Message */}
          {saveSuccess && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mx-8 mt-6">
              <p className="text-green-700 text-sm">✅ Profile updated successfully!</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-8 mt-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Profile Details */}
          <div className="p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter first name"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.first_name || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter last name"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.last_name || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.phone || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter age"
                    min="1"
                    max="120"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.age || 'Not provided'}
                  </div>
                )}
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter state"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.state || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    value={editedData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    placeholder="Enter full address"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 min-h-[80px]">
                    {profileData.address || 'Not provided'}
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Account Information</h4>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Email:</strong> {profileData.email}
                </p>
                <p className="text-xs text-gray-500">
                  Email address cannot be changed. Contact support if you need to update your email.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;