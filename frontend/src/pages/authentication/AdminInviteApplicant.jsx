import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, X, ArrowRight, ArrowLeft, Calendar, Clock, MapPin, User, Mail, Phone, Calendar as CalendarIcon, Music, Clock as ClockIcon, Award, FileText, Loader2 } from 'lucide-react';
import { differenceInYears } from 'date-fns';

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
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    setSubmitError('');
    setSubmitMsg('');
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
    } finally {
      setSubmitting(false);
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
    setSubmitting(true);
    setSubmitError('');
    setSubmitMsg('');
    
    const { auditionDate, auditionTime, location } = auditionDetails;
    if(auditionErrors.auditionDate) {
      setSubmitError("Please fix the errors before sending invitation.");
      setSubmitting(false);
      return;
    }
    if (!auditionDate || !auditionTime || !location) {
      setSubmitError("Please complete all audition details.");
      setSubmitting(false);
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
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-lg">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#1c4b82]" size={42} />
          </div>
          <div className="w-20 h-20 rounded-full bg-blue-50"></div>
        </div>
        <p className="mt-4 text-[#1c4b82] font-medium text-lg">Loading applicant details</p>
        <div className="mt-2 flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-[#1c4b82] animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-[#1c4b82] animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-[#1c4b82] animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
  
  if (errorMsg) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg w-full bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="bg-red-600 p-6">
          <h2 className="text-2xl font-bold text-white text-center">Error</h2>
        </div>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center flex items-center justify-center">
            <AlertCircle className="mr-2" />
            {errorMsg}
          </div>
          <div className="mt-6 text-center">
            <button 
              onClick={() => navigate('/admin/applications/combined')}
              className="px-4 py-2 bg-[#1c4b82] text-white rounded-lg hover:bg-cyan-600 transition duration-300"
            >
              Return to Applications
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/admin/applications/combined')}
            className="flex items-center text-gray-700 bg-white px-4 py-2 rounded-lg shadow-sm hover:bg-[#1c4b82] hover:text-white transition duration-300"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Applications
          </button>
        </div>

        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          {/* Header with gradient and steps indicator */}
          <div className="bg-gradient-to-r from-[#0d253f] to-[#1c4b82] p-6">
            <h2 className="text-2xl font-bold text-center text-white mb-4">
              {step === 1 ? 'Applicant Review' : 'Audition Invitation'}
            </h2>
            
            {/* Progress Indicator */}
            <div className="flex justify-center items-center max-w-xs mx-auto">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 1 ? 'bg-white text-[#1c4b82]' : 'bg-blue-300/40 text-white'} mb-1`}>
                  <User size={20} />
                </div>
                <span className="text-xs text-white">Review</span>
              </div>
              
              <div className={`h-1 flex-1 mx-2 ${step === 1 ? 'bg-blue-300/40' : 'bg-white'}`}></div>
              
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 2 ? 'bg-white text-[#1c4b82]' : 'bg-blue-300/40 text-white'} mb-1`}>
                  <Calendar size={20} />
                </div>
                <span className="text-xs text-white">Invitation</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Step 1: Applicant Review with all details */}
            {step === 1 && application && (
              <div className="space-y-8">
                {/* Applicant Summary Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-xl font-bold text-gray-800">{application.fullName}</h3>
                      <div className="flex items-center text-gray-600 mt-1">
                        <Mail size={16} className="mr-2 text-[#1c4b82]" />
                        <span>{application.email}</span>
                      </div>
                      <div className="flex items-center text-gray-600 mt-1">
                        <Phone size={16} className="mr-2 text-[#1c4b82]" />
                        <span>{application.contactNumber}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <span className="bg-blue-100 text-[#1c4b82] text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                        <Music size={14} className="mr-1" />
                        {application.danceStyle}
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                        <ClockIcon size={14} className="mr-1" />
                        {application.yearsOfExperience} years exp.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Application Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <h4 className="text-lg font-semibold text-[#1c4b82] flex items-center border-b pb-2 mb-3">
                      <User className="mr-2 text-[#1c4b82]" size={18} />
                      Personal Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500 block">Birth Date:</span>
                        <span className="text-gray-800">
                          {application.birthDate 
                            ? new Date(application.birthDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'Not provided'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 block">Age:</span>
                        <span className="text-gray-800">
                          {application.birthDate 
                            ? `${differenceInYears(new Date(), new Date(application.birthDate))} years` 
                            : 'Not provided'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <h4 className="text-lg font-semibold text-[#1c4b82] flex items-center border-b pb-2 mb-3">
                      <Award className="mr-2 text-[#1c4b82]" size={18} />
                      Achievements
                    </h4>
                    {application.achievements && application.achievements.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {application.achievements.map((achievement, index) => (
                          <li key={index} className="text-gray-800">{achievement}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 italic">No achievements listed</p>
                    )}
                  </div>
                </div>
                
                {/* Biography */}
                <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                  <h4 className="text-lg font-semibold text-[#1c4b82] flex items-center border-b pb-2 mb-3">
                    <FileText className="mr-2 text-[#1c4b82]" size={18} />
                    Biography
                  </h4>
                  <p className="text-gray-800 whitespace-pre-line">{application.biography || 'No biography provided.'}</p>
                </div>

                {/* Availabilities */}
                <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                  <h4 className="text-lg font-semibold text-[#1c4b82] flex items-center border-b pb-2 mb-3">
                    <CalendarIcon className="mr-2 text-[#1c4b82]" size={18} />
                    Availabilities
                  </h4>
                  {application.availability && application.availability.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {application.availability.map((avail, index) => (
                        <div key={index} className="bg-white p-3 rounded-md border border-gray-200">
                          <div className="font-medium text-[#1c4b82]">{avail.day}</div>
                          <div className="text-sm text-gray-600 flex items-center">
                            <Clock size={14} className="mr-1 text-[#1c4b82]" />
                            {avail.start} - {avail.end}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 italic">No availabilities provided</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                  <button
                    onClick={() => updateStatus("Rejected")}
                    disabled={submitting}
                    className={`flex items-center justify-center bg-red-600 text-white px-6 py-3 rounded-lg transition duration-300 shadow-md ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'}`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={18} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <X className="mr-2" size={18} />
                        Reject Application
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleProceed}
                    className="flex items-center justify-center bg-[#1c4b82] text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition duration-300 shadow-md"
                  >
                    Proceed to Invitation <ArrowRight className="ml-2" size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Audition Details */}
            {step === 2 && (
              <form onSubmit={handleSendInvitation} className="space-y-6 relative">
                {/* blur overlay during submission */}
                {submitting && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-10">
                    <div className="bg-white/90 p-4 rounded-xl shadow-lg flex flex-col items-center">
                      <Loader2 className="animate-spin text-[#1c4b82]" size={36} />
                      <p className="mt-3 text-[#1c4b82] font-medium">Processing invitation...</p>
                    </div>
                  </div>
                )}
                <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
                  <p className="text-[#1c4b82] text-sm">
                    Setting up an audition for <span className="font-semibold">{application?.fullName}</span>. Please select a date, time, and location for the audition.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Date Field */}
                  <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <label className="text-gray-700 font-medium mb-2 flex items-center">
                      <Calendar className="mr-2 text-[#1c4b82]" size={18} />
                      Audition Date
                    </label>
                    <input 
                      type="date" 
                      name="auditionDate" 
                      value={auditionDetails.auditionDate} 
                      onChange={handleAuditionDetailChange} 
                      required 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c4b82] transition duration-300"
                    />
                    {auditionErrors.auditionDate && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {auditionErrors.auditionDate}
                      </p>
                    )}
                  </div>
                  
                  {/* Time Field */}
                  <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <label className="text-gray-700 font-medium mb-2 flex items-center">
                      <Clock className="mr-2 text-[#1c4b82]" size={18} />
                      Audition Time
                    </label>
                    <input 
                      type="time" 
                      name="auditionTime" 
                      value={auditionDetails.auditionTime} 
                      onChange={handleAuditionDetailChange} 
                      required 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c4b82] transition duration-300"
                    />
                  </div>
                  
                  {/* Location Field */}
                  <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <label className="text-gray-700 font-medium mb-2 flex items-center">
                      <MapPin className="mr-2 text-[#1c4b82]" size={18} />
                      Location
                    </label>
                    <input 
                      type="text" 
                      name="location" 
                      placeholder="Enter audition venue" 
                      value={auditionDetails.location} 
                      onChange={handleAuditionDetailChange} 
                      required 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c4b82] transition duration-300"
                    />
                  </div>
                </div>

                {/* Error and success messages */}
                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                    <AlertCircle className="mr-3 text-red-500 flex-shrink-0" size={24} />
                    <span>{submitError}</span>
                  </div>
                )}
                {submitMsg && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
                    <CheckCircle2 className="mr-3 text-green-500 flex-shrink-0" size={24} />
                    <span>{submitMsg}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center justify-center bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition duration-300 shadow-sm"
                    disabled={submitting}
                  >
                    <ArrowLeft className="mr-2" size={18} /> Back to Review
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className={`flex items-center justify-center bg-[#1c4b82] text-white px-6 py-3 rounded-lg transition duration-300 shadow-md ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-cyan-600'}`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={18} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <span>Send Invitation</span>
                        <ArrowRight className="ml-2" size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInviteApplicant;