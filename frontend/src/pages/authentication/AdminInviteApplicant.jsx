import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AdminInviteApplicant = () => {
  const { id } = useParams(); // Application ID
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Multi-step form state
  const [step, setStep] = useState(1);
  const [auditionDetails, setAuditionDetails] = useState({
    auditionDate: '',
    auditionTime: '',
    location: ''
  });
  const [submitError, setSubmitError] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');

  // Fetch applicant details
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

  // Function to update status (for reject action)
  const updateStatus = async (newStatus) => {
    try {
      const res = await fetch(`http://localhost:4000/api/admin/applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setApplication(data.application);
        setSubmitMsg(`Application ${newStatus.toLowerCase()} successfully!`);
        setTimeout(() => navigate('/admin/pending-applicationsList'), 1500);
      } else {
        setSubmitError(data.message || "Error updating status.");
      }
    } catch (err) {
      setSubmitError("Error: " + err.message);
    }
  };

  // Step 1: Proceed to audition invitation step
  const handleProceed = (e) => {
    e.preventDefault();
    setStep(2);
  };

  // Handle changes in audition details inputs
  const handleAuditionDetailChange = (e) => {
    const { name, value } = e.target;
    setAuditionDetails(prev => ({ ...prev, [name]: value }));
  };

  // Final submission: send invitation email and update status to "Invited"
  const handleSendInvitation = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitMsg('');
    
    const { auditionDate, auditionTime, location } = auditionDetails;
    if (!auditionDate || !auditionTime || !location) {
      setSubmitError("Please complete all audition details.");
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:4000/api/member-applications/${id}/invite`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditionDetails)
      });
      
      const data = await res.json();
      if (res.ok) {
        setSubmitMsg("Invitation sent successfully!");
        setTimeout(() => navigate('/admin/pending-applicationsList'), 1500);
      } else {
        setSubmitError(data.message || "Error sending invitation.");
      }
    } catch (err) {
      setSubmitError("Error: " + err.message);
    }
  };

  // Loading and error states
  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (errorMsg) return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <div className="text-red-500 text-xl mb-4">{errorMsg}</div>
        <button 
          onClick={() => navigate('/admin/pending-applicationsList')}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Return to Applications
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Progress Indicator */}
        <div className="flex w-full bg-gray-100">
          <div 
            className={`w-1/2 h-2 ${step === 1 ? 'bg-blue-500' : 'bg-gray-300'} transition-all duration-300`}
          ></div>
          <div 
            className={`w-1/2 h-2 ${step === 2 ? 'bg-blue-500' : 'bg-gray-300'} transition-all duration-300`}
          ></div>
        </div>

        {/* Step 1: Applicant Review with Proceed and Reject options */}
        {step === 1 && application && (
          <div className="p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center">Applicant Review</h2>
            <div className="space-y-4 text-gray-700">
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Full Name</span>
                <span>{application.fullName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Email</span>
                <span>{application.email}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Contact Number</span>
                <span>{application.contactNumber}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Birth Date</span>
                <span>
                  {application.birthDate 
                    ? new Date(application.birthDate).toLocaleDateString() 
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="font-medium">Dance Style</span>
                <span>{application.danceStyle}</span>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => updateStatus("Rejected")}
                className="w-1/2 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
              >
                Reject
              </button>
              <button
                onClick={handleProceed}
                className="w-1/2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Proceed to Invitation
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Audition Details */}
        {step === 2 && (
          <form onSubmit={handleSendInvitation} className="p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center">Audition Invitation</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audition Date
                </label>
                <input 
                  type="date" 
                  name="auditionDate" 
                  value={auditionDetails.auditionDate} 
                  onChange={handleAuditionDetailChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audition Time
                </label>
                <input 
                  type="time" 
                  name="auditionTime" 
                  value={auditionDetails.auditionTime} 
                  onChange={handleAuditionDetailChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input 
                  type="text" 
                  name="location" 
                  placeholder="Enter audition venue" 
                  value={auditionDetails.location} 
                  onChange={handleAuditionDetailChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {submitError && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
                {submitError}
              </div>
            )}
            {submitMsg && (
              <div className="text-green-500 text-sm text-center bg-green-50 p-2 rounded-lg">
                {submitMsg}
              </div>
            )}

            <div className="flex space-x-4">
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="w-1/2 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-300"
              >
                Back
              </button>
              <button 
                type="submit"
                className="w-1/2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Send Invitation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminInviteApplicant;