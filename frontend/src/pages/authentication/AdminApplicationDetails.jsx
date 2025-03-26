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
          // Optional: Navigate back to applications list after a short delay
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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (errorMsg) 
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
          {errorMsg}
        </div>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gray-100 p-6 border-b border-gray-200">
          <h2 className="text-3xl font-bold text-center text-gray-800">Application Details</h2>
          {statusMsg && (
            <p className="text-center text-green-600 mt-2 font-semibold">
              {statusMsg}
            </p>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <p className="mt-1 text-sm text-gray-900">{application.fullName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{application.email}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Number</label>
              <p className="mt-1 text-sm text-gray-900">{application.contactNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Birth Date</label>
              <p className="mt-1 text-sm text-gray-900">
                {application.birthDate 
                  ? new Date(application.birthDate).toLocaleDateString() 
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <p className="mt-1 text-sm text-gray-900">{application.age}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dance Style</label>
              <p className="mt-1 text-sm text-gray-900">{application.danceStyle}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
            <p className="mt-1 text-sm text-gray-900">{application.yearsOfExperience}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Biography</label>
            <p className="mt-1 text-sm text-gray-900">{application.biography}</p>
          </div>

          {application.achievements && application.achievements.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Achievements</label>
              <ul className="mt-1 text-sm text-gray-900 list-disc list-inside">
                {application.achievements.map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Availabilities</label>
            {application.availability && application.availability.length > 0 ? (
              <ul className="mt-1 text-sm text-gray-900 space-y-1">
                {application.availability.map((avail, index) => (
                  <li 
                    key={index} 
                    className="bg-gray-100 p-2 rounded-md"
                  >
                    {avail.day} — {avail.start} to {avail.end}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-gray-500">No availabilities provided.</p>
            )}
          </div>

          <div className="flex justify-center space-x-4 mt-6">
            <button 
              onClick={() => updateStatus("Approved")}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Accept
            </button>
            <button 
              onClick={() => updateStatus("Rejected")}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminApplicationDetails;