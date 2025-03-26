import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import assets from '../assets/assets.js';

const EventOrganizerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4000/api/organizers/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to fetch profile data.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Cover Photo Section */}
      <div 
        className="h-100 bg-cover bg-center relative"
        style={{ backgroundImage:  `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${assets.profileCover})`  }}
      >
        {/* Profile Picture */}
        <div className="absolute -bottom-16 left-10 flex items-center">
          <img 
            src={profile.profilePicture || assets.defaultProfile} 
            alt="Profile" 
            className="w-50 h-50 rounded-full border-4 border-white object-cover"
          />
          <div className="ml-6">
            <h2 className="text-4xl font-bold text-white mb-1.5">{profile.fullName}</h2>
            <p className="text-white">{profile.organizationName}</p>
          </div>
        </div>

        {/* Social Media Icons Positioned at the Bottom Right */}
        <div className="absolute bottom-4 right-10 flex space-x-4">
  {profile.socialMediaLinks?.instagram && (
    <a href={profile.socialMediaLinks.instagram} target="_blank" rel="noopener noreferrer">
      <Instagram className="w-10 h-10 text-white hover:text-pink-600 transition-colors" />
    </a>
  )}
  {profile.socialMediaLinks?.twitter && (
    <a href={profile.socialMediaLinks.twitter} target="_blank" rel="noopener noreferrer">
      <Twitter className="w-10 h-10 text-white hover:text-blue-400 transition-colors" />
    </a>
  )}
  {profile.socialMediaLinks?.facebook && (
    <a href={profile.socialMediaLinks.facebook} target="_blank" rel="noopener noreferrer">
      <Facebook className="w-10 h-10 text-white hover:text-blue-800 transition-colors" />
    </a>
  )}
</div>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 mt-20 space-y-6">
        {/* User Details Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">User Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Contact Number</p>
              <p className="font-medium">{profile.contactNumber}</p>
            </div>
            <div>
              <p className="text-gray-600">Account Created</p>
              <p className="font-medium">
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Organization Details Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Organization Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Organization Name</p>
              <p className="font-medium">{profile.organizationName}</p>
            </div>
            <div>
              <p className="text-gray-600">Description</p>
              <p>{profile.organizationDescription}</p>
            </div>
            <div>
              <p className="text-gray-600">Website</p>
              {profile.website ? (
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline"
                >
                  {profile.website}
                </a>
              ) : (
                <p>Not provided</p>
              )}
            </div>
            <div>
              <p className="text-gray-600">Business Address</p>
              <p>{profile.businessAddress}</p>
            </div>
          </div>
        </div>

        {/* Logout Button Positioned as Part of the Page Content */}
        <div className="flex justify-end">
          <button 
            onClick={handleLogout}
            className="bg-[#D1001F] text-white px-6 py-2 rounded-md hover:bg-[#9E122C] transition-colors mb-3.5"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventOrganizerProfile;
