import React from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from 'lucide-react';

const PackageDetailsModal = ({ pkg, onClose, onCreateCustom }) => {
  if (!pkg) return null;

  return (
    <AnimatePresence>
      <Dialog open={!!pkg} onClose={onClose} className="relative z-50">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

        {/* Modal panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel
            as={motion.div}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-6 rounded-lg max-w-2xl w-full relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <Dialog.Title className="text-xl font-bold text-gray-800 mb-2">
              {pkg.packageName}
            </Dialog.Title>
            <p className="text-gray-600 mb-4">{pkg.description}</p>

            <div className="mb-3">
              <h4 className="font-semibold">Performances:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {pkg.performances.map((perf, index) => (
                  <li key={index}>{perf.type} – {perf.duration}</li>
                ))}
              </ul>
            </div>

            <div className="mb-3">
              <h4 className="font-semibold">Dance Styles:</h4>
              <p className="text-sm text-gray-700">{pkg.danceStyles.join(', ')}</p>
            </div>

            <div className="mb-3">
              <h4 className="font-semibold">Team Involvement:</h4>
              <ul className="text-sm text-gray-700">
                <li>Male Dancers: {pkg.teamInvolvement.maleDancers}</li>
                <li>Female Dancers: {pkg.teamInvolvement.femaleDancers}</li>
                <li>Choreographers: {pkg.teamInvolvement.choreographers}</li>
                <li>MCs: {pkg.teamInvolvement.MC}</li>
              </ul>
            </div>

            <div className="mb-3">
              <h4 className="font-semibold">Booking Terms:</h4>
              <p className="text-sm text-gray-700">{pkg.bookingTerms}</p>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={onCreateCustom}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Custom Package
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </AnimatePresence>
  );
};

export default PackageDetailsModal;