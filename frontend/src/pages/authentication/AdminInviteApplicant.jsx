import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, X, ArrowRight, ArrowLeft } from 'lucide-react';

const AdminInviteApplicant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [step, setStep] = useState(1);
  
  const getDefaultAuditionDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };
  const [auditionDetails, setAuditionDetails] = useState({
    auditionDate: getDefaultAuditionDate(),
    auditionTime: '13:00',
    location: 'SLIIT New Building 14th floor'
  });
  const [auditionErrors, setAuditionErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');

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
        setTimeout(() => navigate('/admin/applications/combined'), 1500);
      } else {
        setSubmitError(data.message || "Error updating status.");
      }
    } catch (err) {
      setSubmitError("Error: " + err.message);
    }
  };

  const handleProceed = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const validateAuditionField = (name, value) => {
    let errMsg = '';
    if(name === 'auditionDate') {
      const chosenDate = new Date(value);
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 7);
      if(chosenDate < minDate) {
        errMsg = "Invitation date must be at least 7 days from today.";
      }
    }
    setAuditionErrors(prev => ({ ...prev, [name]: errMsg }));
  };

  const handleAuditionDetailChange = (e) => {
    const { name, value } = e.target;
    setAuditionDetails(prev => ({ ...prev, [name]: value }));
    validateAuditionField(name, value);
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitMsg('');
    
    const { auditionDate, auditionTime, location } = auditionDetails;
    if(auditionErrors.auditionDate) {
      setSubmitError("Please fix the errors before sending invitation.");
      return;
    }
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
        setTimeout(() => navigate('/admin/applications/combined'), 1500);
      } else {
        setSubmitError(data.message || "Error sending invitation.");
      }
    } catch (err) {
      setSubmitError("Error: " + err.message);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500"></div>
    </div>
  );
  
  if (errorMsg) return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
        <div className="text-xl text-gray-800 mb-4">{errorMsg}</div>
        <button 
          onClick={() => navigate('/admin/applications/combined')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Return to Applications
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className={`w-12 h-1 mx-2 ${step === 1 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          <div className={`w-12 h-1 mx-2 ${step === 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
        </div>

        {/* Step 1: Applicant Review with all details */}
        {step === 1 && application && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Applicant Review</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Full Name', value: application.fullName },
                { label: 'Email', value: application.email },
                { label: 'Contact Number', value: application.contactNumber },
                { 
                  label: 'Birth Date', 
                  value: application.birthDate 
                    ? new Date(application.birthDate).toLocaleDateString() 
                    : 'N/A' 
                },
                { label: 'Dance Style', value: application.danceStyle },
                { label: 'Years of Experience', value: application.yearsOfExperience }
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-500 block">{label}</span>
                  <span className="text-gray-800 font-medium">{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="bg-gray-50 p-4 rounded mb-4">
                <span className="text-sm text-gray-500 block mb-2">Biography:</span>
                <p className="text-gray-800">{application.biography}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded mb-4">
                <span className="text-sm text-gray-500 block mb-2">Achievements:</span>
                <p className="text-gray-800">
                  {application.achievements && application.achievements.join(', ')}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <span className="text-sm text-gray-500 block mb-2">Availabilities:</span>
                {application.availability && application.availability.length > 0 ? (
                  <ul className="space-y-1">
                    {application.availability.map((avail, index) => (
                      <li key={index} className="text-gray-800">
                        {avail.day} — {avail.start} to {avail.end}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No availabilities provided.</p>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => updateStatus("Rejected")}
                className="flex items-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                <X className="mr-2" /> Reject
              </button>
              <button
                onClick={handleProceed}
                className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Proceed to Invitation <ArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Audition Details */}
        {step === 2 && (
          <form onSubmit={handleSendInvitation} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Audition Invitation</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {auditionErrors.auditionDate && (
                  <p className="text-red-500 text-sm mt-1">{auditionErrors.auditionDate}</p>
                )}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded relative flex items-center">
                <AlertCircle className="mr-3 text-red-500" size={24} />
                {submitError}
              </div>
            )}
            {submitMsg && (
              <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded relative flex items-center">
                <CheckCircle2 className="mr-3 text-green-500" size={24} />
                {submitMsg}
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
              >
                <ArrowLeft className="mr-2" /> Back
              </button>
              <button 
                type="submit"
                className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Send Invitation <ArrowRight className="ml-2" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminInviteApplicant;