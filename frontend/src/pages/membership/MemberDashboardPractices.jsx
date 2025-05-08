import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { UserContext } from '../../context/userContext';

const MemberDashboardPractices = () => {
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      fetchPractices();
    }
  }, [user]);

  const fetchPractices = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/practices/assignments');
      // Filter practices for this member
      const memberPractices = response.data.filter(practice => 
        practice.assignedMembers?.some(member => 
          String(member.member?._id) === String(user.profileId)
        )
      );
      setPractices(memberPractices);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching practices:', error);
      toast.error('Failed to load practices.');
      setPractices([]);
      setLoading(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
    } catch (err) {
      return dateString || 'Date not specified';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Practices</h1>
      
      {practices.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-4">
            <Calendar className="w-12 h-12 mx-auto text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Practices Scheduled</h2>
          <p className="text-gray-500">You don't have any practice sessions scheduled at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {practices.map((practice) => (
            <div
              key={practice._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-blue-500"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {practice.practiceName || 'Practice Session'}
              </h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                  <span>
                    {formatDate(practice.practiceDate)}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2 text-blue-600" />
                  <span>
                    {practice.practiceTime || 'Time not specified'}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                  <span>
                    {practice.practiceLocation || 'Location not specified'}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-blue-600" />
                  <span>
                    Duration: {practice.duration || 'Not specified'} minutes
                  </span>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-100">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {practice.assignedMembers?.find(member => 
                    String(member.member?._id) === String(user.profileId)
                  )?.status || 'pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberDashboardPractices; 