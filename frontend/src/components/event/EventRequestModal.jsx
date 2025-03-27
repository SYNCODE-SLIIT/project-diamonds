import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateStatus } from '../../services/eventRequestService';
import { XIcon } from 'lucide-react';

const EventRequestModal = ({ request, onClose }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      await updateStatus(request._id, 'approved', 'admin123'); // Replace with real admin ID
      onClose();
    } catch (err) {
      console.error('Approval Error:', err);
      alert('Failed to approve request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return alert('Please provide a reason.');
    try {
      setSubmitting(true);
      await updateStatus(request._id, 'rejected', 'admin123', rejectReason);
      onClose();
    } catch (err) {
      console.error('Rejection Error:', err);
      alert('Failed to reject request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <Dialog open={true} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel
            as={motion.div}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="bg-white p-6 rounded-lg max-w-xl w-full relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500">
              <XIcon className="w-5 h-5" />
            </button>

            <Dialog.Title className="text-xl font-bold mb-4">{request.eventName}</Dialog.Title>
            <div className="space-y-2 text-sm">
              <p><strong>Date:</strong> {new Date(request.eventDate).toLocaleDateString()}</p>
              <p><strong>Location:</strong> {request.eventLocation}</p>
              <p><strong>Guests:</strong> {request.guestCount}</p>
              <p><strong>Status:</strong> {request.status}</p>
              <p><strong>Remarks:</strong> {request.remarks || 'None'}</p>
            </div>

            {request.status === 'pending' && (
              <div className="mt-6 space-y-4">
                <textarea
                  placeholder="Rejection reason (if rejecting)"
                  className="w-full border p-2 rounded"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button onClick={handleReject} disabled={submitting} className="px-4 py-2 bg-red-600 text-white rounded">
                    Reject
                  </button>
                  <button onClick={handleApprove} disabled={submitting} className="px-4 py-2 bg-green-600 text-white rounded">
                    Approve
                  </button>
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </AnimatePresence>
  );
};

export default EventRequestModal;