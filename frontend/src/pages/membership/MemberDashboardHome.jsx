import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../context/userContext';
import { UserCircle2, Calendar, Trophy, Sparkles, Mail, Phone, Cake, Hourglass } from 'lucide-react';

const MemberDashboardHome = () => {
  const { user } = useContext(UserContext);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.profileId) {
      fetch(`http://localhost:4000/api/member-applications/${user.profileId}`)
        .then((res) => {
          if (!res.ok) throw new Error(`Error: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          setApplication(data.application);
          setLoading(false);
        })
        .catch((err) => {
          setError("Failed to load application details: " + err.message);
          setLoading(false);
        });
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center mb-8 bg-white shadow-md rounded-xl p-4 border-l-4 border-blue-500">
          <UserCircle2 className="w-12 h-12 text-blue-600 mr-4" />
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">Member Dashboard</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-md">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">Loading application details...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        ) : application ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center border-b pb-4">
                <UserCircle2 className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-800">Personal Information</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-600">Full Name:</span>
                  </div>
                  <span className="text-gray-800 font-semibold">{application.fullName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-600">Email:</span>
                  </div>
                  <span className="text-gray-800">{application.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-600">Contact Number:</span>
                  </div>
                  <span className="text-gray-800">{application.contactNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Cake className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-600">Birth Date:</span>
                  </div>
                  <span className="text-gray-800">
                    {new Date(application.birthDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Hourglass className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-600">Age:</span>
                  </div>
                  <span className="text-gray-800">{application.age}</span>
                </div>
              </div>
            </div>

            {/* Dance Profile Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center border-b pb-4">
                <Trophy className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-800">Dance Profile</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-600">Dance Style:</span>
                  </div>
                  <span className="text-gray-800 font-semibold">{application.danceStyle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-600">Years of Experience:</span>
                  </div>
                  <span className="text-gray-800">{application.yearsOfExperience}</span>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Sparkles className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="font-medium text-gray-600">Biography:</span>
                  </div>
                  <p className="text-gray-700 italic">{application.biography || 'No biography provided'}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Trophy className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="font-medium text-gray-600">Achievements:</span>
                  </div>
                  {application.achievements && application.achievements.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-700">
                      {application.achievements.map((achievement, idx) => (
                        <li key={idx}>{achievement}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No achievements recorded</p>
                  )}
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="font-medium text-gray-600">Availabilities:</span>
                  </div>
                  {application.availability && application.availability.length > 0 ? (
                    <div>
                      {application.availability.map((a, idx) => (
                        <div key={idx} className="flex justify-between text-gray-700">
                          <span>{a.day}</span>
                          <span>{a.start} - {a.end}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No availabilities provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-xl text-gray-600">No application details found.</p>
            <p className="text-gray-500 mt-2">Please complete your profile.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDashboardHome;