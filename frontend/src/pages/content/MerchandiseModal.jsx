import React from 'react';

const MerchandiseModal = ({ children, isOpen, onClose, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="relative w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-visible my-4" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 sticky top-0 z-10">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight m-0">{title}</h2>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-700 rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 bg-white overflow-y-auto" style={{ maxHeight: 'calc(100vh - 7rem)' }}>{children}</div>
      </div>
    </div>
  );
};

export default MerchandiseModal; 