import React from 'react';
import EventCalendar from '../admin/EventCalender'; // Adjust the relative path if needed

const MemberDashboardCalender = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Calendar</h1>
      <EventCalendar />
    </div>
  );
};

export default MemberDashboardCalender;