import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, AlertCircle, Loader2, Award, Calendar, Mail, Phone, Clock, User, Star, CheckCircle2, ArrowLeft, Shield, MapPin, Briefcase, File, ExternalLink, Download } from 'lucide-react';

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
    if (!window.confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
      return;
    }
    
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
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg">
          <Loader2 className="animate-spin text-blue-600 mx-auto" size={48} />
          <p className="mt-4 text-gray-600 font-medium text-center">Loading application details...</p>
        </div>
      </div>
    );

  if (errorMsg)
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-red-600">{errorMsg}</p>
          <button 
            onClick={() => navigate('/admin/applications/combined')}
            className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );

  const getStatusBadge = () => {
    const statusColors = {
      'Accepted': {
        bg: 'bg-green-500',
        icon: <CheckCircle2 className="mr-1.5" size={14} />
      },
      'Rejected': {
        bg: 'bg-red-500',
        icon: <AlertCircle className="mr-1.5" size={14} />
      },
      'Pending': {
        bg: 'bg-blue-500',
        icon: <Clock className="mr-1.5" size={14} />
      }
    };
    
    const status = application.applicationStatus || 'Pending';
    const statusStyle = statusColors[status] || statusColors['Pending'];
    
    return (
      <span className={`${statusStyle.bg} px-3 py-1.5 rounded-full text-sm font-medium text-white flex items-center`}>
        {statusStyle.icon}
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {statusMsg && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center text-green-700">
            <CheckCircle2 className="mr-3 flex-shrink-0" size={20} />
            <p className="font-medium">{statusMsg}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#0d253f]">Applicant Details</h1>
          <button
            onClick={() => navigate('/admin/applications/combined')}
            className="px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-700 rounded-lg transition-colors duration-300 flex items-center font-medium border border-gray-200 shadow-sm"
          >
            <ArrowLeft className="mr-1.5" size={18} />
            Back to Applications
          </button>
        </div>

        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200 mb-8">
          {/* Header with application overview */}
          <div className="bg-gradient-to-r from-[#0d253f] to-[#1c4b82] p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <User className="text-white" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{application.fullName}</h2>
                  <div className="flex flex-wrap items-center mt-1.5">
                    <span className="text-blue-200 flex items-center text-sm mr-4">
                      <Shield className="mr-1.5" size={14} />
                      ID: {application._id.substring(0, 10)}...
                    </span>
                    {application.danceStyle && (
                      <span className="text-blue-200 flex items-center text-sm">
                        <Award className="mr-1.5" size={14} />
                        {application.danceStyle}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col items-end">
                {getStatusBadge()}
                <p className="text-blue-200 text-sm mt-2">
                  Applied on {formatDate(application.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Application summary bar */}
          <div className="bg-gray-50 py-4 px-6 border-b border-gray-200">
            <div className="flex flex-wrap justify-between gap-y-3">
              <div className="flex items-center mr-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Mail className="text-blue-600" size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Email</p>
                  <p className="text-sm font-medium text-gray-800">{application.email}</p>
                </div>
              </div>
              
              <div className="flex items-center mr-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Phone className="text-blue-600" size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Contact</p>
                  <p className="text-sm font-medium text-gray-800">{application.contactNumber}</p>
                </div>
              </div>
              
              <div className="flex items-center mr-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Calendar className="text-blue-600" size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Age</p>
                  <p className="text-sm font-medium text-gray-800">{application.age} years</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Briefcase className="text-blue-600" size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Experience</p>
                  <p className="text-sm font-medium text-gray-800">{application.yearsOfExperience} years</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-6 p-6">
            {/* Left Column - Personal Information */}
            <div className="md:col-span-5 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 px-5 py-4 border-b border-blue-100">
                  <h3 className="text-lg font-semibold text-[#0d253f] flex items-center">
                    <User className="mr-2" size={18} />
                    Personal Information
                  </h3>
                </div>
                
                <div className="p-5 space-y-4">
                  <div className="border-b border-gray-100 pb-4">
                    <label className="block text-xs uppercase font-semibold text-gray-500 mb-1">Full Name</label>
                    <p className="text-gray-800 font-medium">{application.fullName}</p>
                  </div>

                  <div className="border-b border-gray-100 pb-4">
                    <label className="block text-xs uppercase font-semibold text-gray-500 mb-1">Email Address</label>
                    <div className="flex items-center">
                      <Mail className="text-blue-500 mr-2" size={16} />
                      <p className="text-gray-800 font-medium">{application.email}</p>
                    </div>
                  </div>

                  <div className="border-b border-gray-100 pb-4">
                    <label className="block text-xs uppercase font-semibold text-gray-500 mb-1">Phone Number</label>
                    <div className="flex items-center">
                      <Phone className="text-blue-500 mr-2" size={16} />
                      <p className="text-gray-800 font-medium">{application.contactNumber}</p>
                    </div>
                  </div>

                  <div className="border-b border-gray-100 pb-4">
                    <label className="block text-xs uppercase font-semibold text-gray-500 mb-1">Birth Date</label>
                    <div className="flex items-center">
                      <Calendar className="text-blue-500 mr-2" size={16} />
                      <p className="text-gray-800 font-medium">{formatDate(application.birthDate)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-gray-500 mb-1">Location</label>
                    <div className="flex items-center">
                      <MapPin className="text-blue-500 mr-2" size={16} />
                      <p className="text-gray-800 font-medium">{application.location || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 px-5 py-4 border-b border-cyan-100">
                  <h3 className="text-lg font-semibold text-[#0d253f] flex items-center">
                    <Clock className="mr-2" size={18} />
                    Availability Schedule
                  </h3>
                </div>
                
                <div className="p-5">
                  {application.availability && application.availability.length > 0 ? (
                    <div className="space-y-3">
                      {application.availability.map((avail, index) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-lg flex items-center justify-center mr-3">
                            <Calendar className="text-blue-600" size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{avail.day}</p>
                            <p className="text-sm text-gray-600">{avail.start} to {avail.end}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                      <p className="text-gray-500 italic">No availabilities provided</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Professional Information */}
            <div className="md:col-span-7 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 px-5 py-4 border-b border-blue-100">
                  <h3 className="text-lg font-semibold text-[#0d253f] flex items-center">
                    <Award className="mr-2" size={18} />
                    Dance Qualifications
                  </h3>
                </div>
                
                <div className="p-5">
                  <div className="grid md:grid-cols-2 gap-4 mb-5">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <label className="block text-xs uppercase font-semibold text-gray-500 mb-1">Dance Style</label>
                      <p className="text-gray-800 font-medium">{application.danceStyle || 'Not specified'}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <label className="block text-xs uppercase font-semibold text-gray-500 mb-1">Experience Level</label>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(application.yearsOfExperience * 10, 100)}%` }}></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{application.yearsOfExperience} years</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-gray-500 mb-2">Professional Biography</label>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="text-gray-700 whitespace-pre-line">{application.biography || 'No biography provided.'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {application.achievements && application.achievements.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 px-5 py-4 border-b border-cyan-100">
                    <h3 className="text-lg font-semibold text-[#0d253f] flex items-center">
                      <Star className="mr-2" size={18} />
                      Achievements & Certifications
                    </h3>
                  </div>
                  
                  <div className="p-5">
                    <div className="space-y-3">
                      {application.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                            <span className="text-blue-700 font-semibold">{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-gray-700">{achievement}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {application.applicationStatus === 'Rejected' && (
                <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 px-5 py-4 border-b border-red-100">
                    <h3 className="text-lg font-semibold text-red-700 flex items-center">
                      <AlertCircle className="mr-2" size={18} />
                      Application Rejected
                    </h3>
                  </div>
                  
                  <div className="p-5">
                    <p className="text-gray-700 mb-4">This application has been rejected and can be deleted from the system.</p>
                    
                    <button
                      onClick={handleDelete}
                      className="flex items-center bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-300"
                    >
                      <Trash2 className="mr-2" size={18} />
                      Delete Application
                    </button>
                  </div>
                </div>
              )}
              
              {application.applicationStatus === 'Accepted' && (
                <div className="bg-white rounded-xl border border-green-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 px-5 py-4 border-b border-green-100">
                    <h3 className="text-lg font-semibold text-green-700 flex items-center">
                      <CheckCircle2 className="mr-2" size={18} />
                      Application Accepted
                    </h3>
                  </div>
                  
                  <div className="p-5">
                    <p className="text-gray-700 mb-4">This applicant has been approved to join your organization.</p>
                    
                    <div className="flex flex-wrap gap-3">
                      <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-300">
                        <Mail className="mr-2" size={18} />
                        Send Welcome Email
                      </button>
                      
                      <button className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors duration-300 border border-gray-200">
                        <File className="mr-2" size={18} />
                        Generate Certificate
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer with actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center flex-wrap gap-3">
            <p className="text-sm text-gray-500">
              Last updated: {formatDate(application.updatedAt || application.createdAt)}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin/applications/combined')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-300 flex items-center font-medium border border-gray-200"
              >
                <ArrowLeft className="mr-1.5" size={16} />
                Back
              </button>
              
              {application.applicationStatus === 'Pending' && (
                <>
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-300 flex items-center font-medium">
                    <CheckCircle2 className="mr-1.5" size={16} />
                    Accept
                  </button>
                  
                  <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300 flex items-center font-medium">
                    <AlertCircle className="mr-1.5" size={16} />
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalizedDetails;