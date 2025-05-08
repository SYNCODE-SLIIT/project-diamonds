import React from 'react';
import { ChevronRight } from 'lucide-react';
import PracticeAssign from './PracticeAssign';

const PracticeAssignments = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1 p-6">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <ChevronRight className="mr-2 text-blue-600" size={36} />
              Practice Sessions
            </h2>
            <div className="text-sm text-gray-500">
              Welcome, Admin
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <PracticeAssign />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeAssignments; 