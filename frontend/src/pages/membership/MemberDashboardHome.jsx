import React from 'react';
import MemberProfileOverview from './MemberProfileOverview';
import MemberGroupChat from './MemberGroupChat';

const MemberDashboardHome = () => {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <MemberProfileOverview />
      <MemberGroupChat />
    </div>
  );
};

export default MemberDashboardHome;