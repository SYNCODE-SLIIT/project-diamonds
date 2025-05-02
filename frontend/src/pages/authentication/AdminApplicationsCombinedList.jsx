import React from 'react';
import AdminApplicationsList from './AdminApplicationsList'; // Pending Applications
import AdminInvitedApplicationsList from './AdminInvitedApplicationsList'; // Invited Applications
import AdminFinalizedApplicationsList from './AdminFinalizedApplicationsList'; // Approved/Rejected Applications

const AdminApplicationsCombinedList = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Pending Applications */}
      <AdminApplicationsList />

      {/* Invited Applications */}
      <AdminInvitedApplicationsList />

      {/* Finalized Applications */}
      <AdminFinalizedApplicationsList />
    </div>
  );
};

export default AdminApplicationsCombinedList;