// src/components/event/EventDetailsModal.jsx

import React from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EventDetailsModal = ({ event, onClose }) => {
  const navigate = useNavigate();
  if (!event) return null;

  return (
    <AnimatePresence>
      <Dialog open={!!event} onClose={onClose} className="relative z-50">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

        {/* Modal content */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative bg-white p-6 rounded-lg max-w-2xl w-full shadow-xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <Dialog.Title className="text-2xl font-bold mb-4 text-red-800">
              {event.eventName}
            </Dialog.Title>

            <div className="space-y-3 text-gray-700 text-sm">
              <p><strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}</p>
              <p><strong>Location:</strong> {event.eventLocation}</p>
              <p><strong>Guests:</strong> {event.guestCount}</p>
              <p><strong>Status:</strong> <span className="capitalize">{event.status}</span></p>

              {event.additionalRequests && (
                <p><strong>Additional Requests:</strong> {event.additionalRequests}</p>
              )}

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800">Package</h4>
                <p>{event.packageID?.packageName || 'Custom Package'}</p>
              </div>

              {event.additionalServices?.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800">Additional Services</h4>
                  <ul className="list-disc list-inside">
                    {event.additionalServices.map((s, idx) => (
                      <li key={idx}>{s.serviceID?.serviceName}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Request Budget Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => navigate(`/bform`)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Request Budget
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </AnimatePresence>
  );
};

export default EventDetailsModal;