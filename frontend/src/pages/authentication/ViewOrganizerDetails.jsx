import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Import icons - assuming you're using a common icon library like heroicons or react-icons
// If you need to install it first, you can use: npm install react-icons
import { 
  FiUser, 
  FiMail, 
  FiBriefcase, 
  FiPhone, 
  FiMapPin, 
  FiGlobe, 
  FiArrowLeft,
  FiInfo
} from 'react-icons/fi';

const ViewOrganizerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch(`http://localhost:4000/api/organizers/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setOrganizer(data);
        } else {
          setErrorMsg("Organizer not found.");
        }
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg("Error fetching organizer: " + err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1c4b82]"></div>
      </div>
    );

  if (errorMsg)
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden p-8">
          <div className="flex items-center justify-center text-red-600 gap-2">
            <FiInfo className="h-6 w-6" />
            <p className="text-lg font-medium">{errorMsg}</p>
          </div>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-300"
            >
              <FiArrowLeft className="mr-2" /> Go Back
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-12 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d253f] to-[#1c4b82] p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center">
              <FiBriefcase className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-white">Organizer Details</h2>
          {organizer.organizationName && (
            <p className="text-center text-white/80 mt-2 text-lg font-medium">{organizer.organizationName}</p>
          )}
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Personal Information section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-xl font-semibold text-[#0d253f] mb-4">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-y-6 gap-x-8">
              <div className="flex items-start">
                <FiUser className="w-5 h-5 text-[#1c4b82] mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Full Name</p>
                  <p className="font-medium text-gray-800">{organizer.fullName}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FiMail className="w-5 h-5 text-[#1c4b82] mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-gray-800">{organizer.email}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FiPhone className="w-5 h-5 text-[#1c4b82] mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Contact Number</p>
                  <p className="font-medium text-gray-800">{organizer.contactNumber || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Organization Information section */}
          <div>
            <h3 className="text-xl font-semibold text-[#0d253f] mb-4">Organization Information</h3>
            <div className="grid gap-y-6">
              <div className="flex items-start">
                <FiBriefcase className="w-5 h-5 text-[#1c4b82] mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Organization Name</p>
                  <p className="font-medium text-gray-800">{organizer.organizationName || "Not provided"}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FiMapPin className="w-5 h-5 text-[#1c4b82] mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Business Address</p>
                  <p className="font-medium text-gray-800">{organizer.businessAddress || "Not provided"}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FiGlobe className="w-5 h-5 text-[#1c4b82] mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Website</p>
                  {organizer.website ? (
                    <a 
                      href={organizer.website.startsWith('http') ? organizer.website : `https://${organizer.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {organizer.website}
                    </a>
                  ) : (
                    <p className="font-medium text-gray-800">Not provided</p>
                  )}
                </div>
              </div>
              
              {organizer.organizationDescription && (
                <div className="flex items-start">
                  <FiInfo className="w-5 h-5 text-[#1c4b82] mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Organization Description</p>
                    <p className="font-medium text-gray-800">{organizer.organizationDescription}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer with Action Buttons */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-300"
          >
            <FiArrowLeft className="mr-2" /> Back
          </button>
          
          {organizer.email && (
            <a
              href={`mailto:${organizer.email}`}
              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-[#0d253f] to-[#1c4b82] text-white rounded-lg hover:opacity-90 transition duration-300"
            >
              <FiMail className="mr-2" /> Contact
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewOrganizerDetails;