import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AdminApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:4000/api/admin/applications/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.application) {
          setApplication(data.application);
        } else {
          setErrorMsg("Application not found.");
        }
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg("Error fetching application: " + err.message);
        setLoading(false);
      });
  }, [id]);

  const updateStatus = (newStatus) => {
    fetch(`http://localhost:4000/api/admin/applications/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(data => {
        if (data.application) {
          setApplication(data.application);
          setStatusMsg(`Application ${newStatus.toLowerCase()} successfully!`);
          setTimeout(() => navigate('/admin/applications/combined'), 1500);
        } else {
          setErrorMsg(data.message || 'Error updating status');
        }
      })
      .catch(err => {
        setErrorMsg("Error updating status: " + err.message);
      });
  };

  if (loading) 
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );

  if (errorMsg) 
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
        <div className="max-w-lg w-full bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="bg-red-500 p-6">
            <h2 className="text-2xl font-bold text-white text-center">Error</h2>
          </div>
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
              {errorMsg}
            </div>
            <div className="mt-6 text-center">
              <button 
                onClick={() => navigate('/admin/applications/combined')}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
              >
                Return to Applications
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 p-4 py-8">
      <div className="max-w-3xl w-full">
        {/* Back Button Section */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/admin/applications/combined')}
            className="flex items-center text-gray-700 hover:text-blue-600 transition duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Applications
          </button>
        </div>
        
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          {/* Header Section with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-500 p-6">
            <h2 className="text-3xl font-bold text-center text-white">Application Details</h2>
            {statusMsg && (
              <div className="mt-3 py-2 px-4 bg-green-50 border border-green-100 text-green-700 rounded-lg text-center shadow-sm">
                {statusMsg}
              </div>
            )}
          </div>

          {/* Profile Summary Card */}
          <div className="p-6 bg-white border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
                <h3 className="text-2xl font-bold text-gray-800">{application.fullName}</h3>
                <p className="text-blue-600">{application.email}</p>
                <div className="mt-2 flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">
                    {application.danceStyle}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {application.yearsOfExperience} {application.yearsOfExperience === 1 ? 'year' : 'years'} experience
                  </span>
                </div>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-700 block mb-1">Application Status</span>
                  <span 
                    className={`px-3 py-1 inline-flex text-sm font-medium rounded-full
                    ${application.applicationStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                      application.applicationStatus === 'Approved' ? 'bg-green-100 text-green-800' : 
                      'bg-red-100 text-red-800'}`}
                  >
                    {application.applicationStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Application Details Section */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Personal Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Contact Number</label>
                    <p className="text-gray-900">{application.contactNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Birth Date</label>
                    <p className="text-gray-900">
                      {application.birthDate 
                        ? new Date(application.birthDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Age</label>
                    <p className="text-gray-900">{application.age || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Dance Experience</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Primary Style</label>
                    <p className="text-gray-900">{application.danceStyle || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Experience Level</label>
                    <p className="text-gray-900">{application.yearsOfExperience} years</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Biography</h4>
              <p className="text-gray-900 whitespace-pre-line">{application.biography || 'No biography provided.'}</p>
            </div>

            {application.achievements && application.achievements.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Achievements</h4>
                <ul className="list-disc list-inside space-y-1">
                  {application.achievements.map((achievement, index) => (
                    <li key={index} className="text-gray-900">{achievement}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Availability</h4>
              {application.availability && application.availability.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {application.availability.map((avail, index) => (
                    <div key={index} className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                      <div className="font-medium text-gray-800">{avail.day}</div>
                      <div className="text-sm text-gray-500">{avail.start} - {avail.end}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No availabilities provided.</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={() => updateStatus("Approved")}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Accept Application
              </button>
              <button 
                onClick={() => updateStatus("Rejected")}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Reject Application
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminApplicationDetails;