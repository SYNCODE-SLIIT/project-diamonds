// src/components/event/EditEventRequestModal.jsx

import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { updateRequest } from '../../services/eventRequestService';

const EditEventRequestModal = ({ request, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    eventName: '',
    eventLocation: '',
    guestCount: '',
    eventDate: '',
    remarks: ''
  });

  useEffect(() => {
    if (request) {
      setFormData({
        eventName: request.eventName,
        eventLocation: request.eventLocation,
        guestCount: request.guestCount,
        eventDate: request.eventDate?.slice(0, 10),
        remarks: request.remarks || ''
      });
    }
  }, [request]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await updateRequest(request._id, {
        ...request,
        ...formData,
        guestCount: Number(formData.guestCount)
      });
      onUpdated(); // Refresh data in parent
      onClose();
    } catch (err) {
      alert('Failed to update request');
      console.error(err);
    }
  };

  return (
    <AnimatePresence>
      <Dialog open={!!request} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel
            as={motion.div}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="bg-white p-6 rounded-lg max-w-lg w-full relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <Dialog.Title className="text-xl font-bold mb-4">Edit Event Request</Dialog.Title>

            <div className="space-y-3">
              <input
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleChange}
                placeholder="Event Name"
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                name="eventLocation"
                value={formData.eventLocation}
                onChange={handleChange}
                placeholder="Location"
                className="w-full border p-2 rounded"
              />
              <input
                type="number"
                name="guestCount"
                value={formData.guestCount}
                onChange={handleChange}
                placeholder="Guest Count"
                className="w-full border p-2 rounded"
              />
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Remarks (optional)"
                rows="3"
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </AnimatePresence>
  );
};

export default EditEventRequestModal;