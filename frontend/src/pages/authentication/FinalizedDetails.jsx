import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, AlertCircle, Loader2 } from 'lucide-react';

const FinalizedDetails = () => {
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

  const handleDelete = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/member-applications/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg(data.message);
        setTimeout(() => navigate('/admin/applications/combined'), 1500);
      } else {
        setErrorMsg(data.message || "Error deleting application.");
      }
    } catch (err) {
      setErrorMsg("Error: " + err.message);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );

  if (errorMsg)
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <p className="text-red-600 font-semibold">{errorMsg}</p>
        </div>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gray-100 p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Application Details</h2>
          {statusMsg && (
            <p className="text-green-600 mt-2 font-semibold">
              {statusMsg}
            </p>
          )}
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <p className="text-lg font-semibold text-gray-900">{application.fullName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <p className="text-lg font-semibold text-gray-900">{application.email}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
              <p className="text-lg font-semibold text-gray-900">{application.contactNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
              <p className="text-lg font-semibold text-gray-900">
                {application.birthDate 
                  ? new Date(application.birthDate).toLocaleDateString() 
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <p className="text-lg font-semibold text-gray-900">{application.age}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dance Style</label>
              <p className="text-lg font-semibold text-gray-900">{application.danceStyle}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
            <p className="text-lg font-semibold text-gray-900">{application.yearsOfExperience}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Biography</label>
            <p className="text-base text-gray-700 bg-gray-50 p-4 rounded-lg">{application.biography}</p>
          </div>

          {application.achievements && application.achievements.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Achievements</label>
              <ul className="list-disc list-inside bg-gray-50 p-4 rounded-lg space-y-2">
                {application.achievements.map((achievement, index) => (
                  <li key={index} className="text-gray-700">{achievement}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Availabilities</label>
            {application.availability && application.availability.length > 0 ? (
              <ul className="bg-gray-50 p-4 rounded-lg space-y-2">
                {application.availability.map((avail, index) => (
                  <li key={index} className="text-gray-700">
                    {avail.day} — {avail.start} to {avail.end}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No availabilities provided.</p>
            )}
          </div>

          {application.applicationStatus === 'Rejected' && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleDelete}
                className="flex items-center bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
              >
                <Trash2 className="mr-2" size={20} />
                Delete Application
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinalizedDetails;