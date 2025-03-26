import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Users, 
  Clock, 
  ChevronRight 
} from 'lucide-react';

import EventAssignment from './EventAssignment';
import PracticeSessionManagement from './PracticeSessionManagement';
import CalendarView from './CalendarView';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('events');

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
    }
  ];

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
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            {tabs.find(tab => tab.key === activeTab)?.component}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;