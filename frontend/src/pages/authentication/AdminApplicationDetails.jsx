import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Phone, Calendar, Clock, Award, FileText, 
  ArrowLeft, Check, X, Briefcase, Mail, Loader2
} from 'lucide-react';

const AdminApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(true);
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

  const updateStatus = (newStatus) => {
    setSubmitting(true);
    setErrorMsg('');
    setStatusMsg('');
    
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
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  if (loading) 
    return (
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

  if (errorMsg) 
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
        <div className="max-w-lg w-full bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="bg-red-600 p-6">
            <h2 className="text-2xl font-bold text-white text-center">Error</h2>
          </div>
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
              {errorMsg}
            </div>
            <div className="mt-6 text-center">
              <button 
                onClick={() => navigate('/admin/applications/combined')}
                className="px-5 py-2.5 bg-[#1c4b82] text-white rounded-lg hover:bg-cyan-600 transition duration-300 shadow-md"
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
      <div className="max-w-5xl mx-auto">
        {/* Back Button Section */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/admin/applications/combined')}
            className="flex items-center text-gray-700 bg-white px-4 py-2 rounded-lg shadow-sm hover:bg-[#1c4b82] hover:text-white transition duration-300"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Applications
          </button>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header Section - Updated to match admin sidebar gradient */}
          <div className="bg-gradient-to-r from-[#0d253f] to-[#1c4b82] p-6">
            <h2 className="text-3xl font-bold text-center text-white mb-2">Application Details</h2>
            <p className="text-blue-100 text-center opacity-90">Review candidate information and make a decision</p>
            {statusMsg && (
              <div className="mt-4 py-2 px-4 bg-green-50 border border-green-100 text-green-700 rounded-lg text-center shadow-sm">
                {statusMsg}
              </div>
            )}
          </div>

          {/* Profile Summary Card */}
          <div className="p-6 bg-white">
            <div className="flex flex-col md:flex-row items-center justify-between border-b border-gray-200 pb-6">
              <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
                <div className="flex items-center mb-2">
                  <div className="w-12 h-12 rounded-full bg-[#1c4b82] flex items-center justify-center text-white mr-3">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{application.fullName}</h3>
                    <p className="text-[#1c4b82] font-medium">{application.email}</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-[#1c4b82] text-xs font-semibold px-3 py-1 rounded-full">
                    {application.danceStyle}
                  </span>
                  <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {application.yearsOfExperience} {application.yearsOfExperience === 1 ? 'year' : 'years'} experience
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-700 block mb-2">Application Status</span>
                  <span 
                    className={`px-4 py-1.5 inline-flex text-sm font-medium rounded-full ${
                      application.applicationStatus === 'Pending' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : application.applicationStatus === 'Approved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {application.applicationStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Application Details Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Personal Details Card */}
              <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                <h4 className="text-lg font-semibold text-[#1c4b82] mb-4 flex items-center border-b pb-2">
                  <User className="w-5 h-5 mr-2 text-[#1c4b82]" />
                  Personal Information
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Phone className="text-[#1c4b82] w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Contact Number</label>
                      <p className="text-gray-800 font-medium">{application.contactNumber || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="text-[#1c4b82] w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Birth Date</label>
                      <p className="text-gray-800 font-medium">
                        {application.birthDate 
                          ? new Date(application.birthDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Not provided'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <User className="text-[#1c4b82] w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Age</label>
                      <p className="text-gray-800 font-medium">{application.age || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dance Experience Card */}
              <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                <h4 className="text-lg font-semibold text-[#1c4b82] mb-4 flex items-center border-b pb-2">
                  <Briefcase className="w-5 h-5 mr-2 text-[#1c4b82]" />
                  Dance Experience
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Award className="text-[#1c4b82] w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Primary Style</label>
                      <p className="text-gray-800 font-medium">{application.danceStyle || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="text-[#1c4b82] w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Experience Level</label>
                      <p className="text-gray-800 font-medium">{application.yearsOfExperience} years</p>
                    </div>
                  </div>
                </div>

                {/* Achievements Section (conditionally rendered) */}
                {application.achievements && application.achievements.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h5 className="text-base font-semibold text-[#1c4b82] mb-3 flex items-center">
                      <Award className="w-5 h-5 mr-2 text-[#1c4b82]" />
                      Achievements
                    </h5>
                    <ul className="space-y-2">
                      {application.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#1c4b82] mt-2 mr-2 flex-shrink-0"></div>
                          <p className="text-gray-800">{achievement}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Availability Card */}
              <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                <h4 className="text-lg font-semibold text-[#1c4b82] mb-4 flex items-center border-b pb-2">
                  <Clock className="w-5 h-5 mr-2 text-[#1c4b82]" />
                  Availability
                </h4>
                
                {application.availability && application.availability.length > 0 ? (
                  <div className="grid gap-3">
                    {application.availability.map((avail, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="font-medium text-[#1c4b82]">{avail.day}</div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-[#1c4b82]" />
                          {avail.start} - {avail.end}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 italic">No availabilities provided</p>
                  </div>
                )}
              </div>
            </div>

            {/* Biography Section */}
            <div className="mt-6 bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
              <h4 className="text-lg font-semibold text-[#1c4b82] mb-4 flex items-center border-b pb-2">
                <FileText className="w-5 h-5 mr-2 text-[#1c4b82]" />
                Biography
              </h4>
              <div className="bg-gray-50 p-5 rounded-lg">
                <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                  {application.biography || 'No biography provided.'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 mt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => updateStatus("Approved")}
                disabled={submitting}
                className={`px-6 py-3 bg-[#1c4b82] text-white rounded-lg transition duration-300 flex items-center justify-center shadow-md font-medium ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-cyan-600'}`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Accept Application
                  </>
                )}
              </button>
              <button 
                onClick={() => updateStatus("Rejected")}
                disabled={submitting}
                className={`px-6 py-3 bg-red-600 text-white rounded-lg transition duration-300 flex items-center justify-center shadow-md font-medium ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'}`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Processing...
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 mr-2" />
                    Reject Application
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminApplicationDetails;