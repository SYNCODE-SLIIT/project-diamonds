import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Users, 
  Clock, 
  ChevronRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

import EventAssignment from './EventAssignment';
import PracticeSessionManagement from './PracticeSessionManagement';
import CalendarView from './CalendarView';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState('');

  // Tab configuration for dynamic rendering
  const tabs = [
    { 
      key: 'events', 
      label: 'Event Assignment', 
      icon: Users,
      component: <EventAssignment />
    },
    { 
      key: 'practice', 
      label: 'Practice Sessions', 
      icon: Clock,
      component: <PracticeSessionManagement />
    },
    { 
      key: 'calendar', 
      label: 'Calendar', 
      icon: CalendarIcon,
      component: <CalendarView />
    },
    { 
      key: 'refund', 
      label: 'Refund Request', 
      icon: Clock,  
      component: (
        <Link to="/rform">
          <button 
            className="flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white shadow-lg transition-all duration-300 font-semibold"
          >
            Refund Budget
          </button>
        </Link>
      )
    }
  ];

  // Fetch members (only those with role "member")
  useEffect(() => {
    fetch('/api/users')
      .then(res => {
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Support both cases: if data is an array or an object with a 'users' property.
        const allUsers = Array.isArray(data) ? data : data.users || [];
        const teamMembers = allUsers.filter(user => user.role === 'member');
        setMembers(teamMembers);
        setMembersLoading(false);
      })
      .catch(err => {
        setMembersError("Error fetching members: " + err.message);
        setMembersLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <ChevronRight className="mr-2 text-blue-600" size={36} />
            Admin Dashboard
          </h2>
          <div className="text-sm text-gray-500">
            Welcome, Admin
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-6 flex space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center px-4 py-2 rounded-lg transition-all duration-300
                ${activeTab === tab.key 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'}
                space-x-2 font-semibold
              `}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            {tabs.find(tab => tab.key === activeTab)?.component}
          </div>
        </div>

        {/* Team Members Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-4">Team Members</h3>
            {membersLoading ? (
              <p>Loading members...</p>
            ) : membersError ? (
              <p className="text-red-500">{membersError}</p>
            ) : members.length === 0 ? (
              <p className="text-gray-500">No members found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Full Name
                      </th>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Number
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map(member => (
                      <tr key={member._id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 text-sm">{member.fullName}</td>
                        <td className="py-2 px-4 text-sm">{member.email}</td>
                        <td className="py-2 px-4 text-sm">{member.contactNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;