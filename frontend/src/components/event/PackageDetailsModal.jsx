import React from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Music, Users, Clock, Calendar, DollarSign, Check, Info, Package2, Star, Tag, Image, Award, FileText } from 'lucide-react';

const PackageDetailsModal = ({ pkg, onClose, onCreateCustom }) => {
  if (!pkg) return null;
  
  // Function to safely calculate total dancers
  const getTotalDancers = () => {
    if (!pkg.teamInvolvement) return 0;
    
    const male = parseInt(pkg.teamInvolvement.maleDancers) || 0;
    const female = parseInt(pkg.teamInvolvement.femaleDancers) || 0;
    return male + female;
  };
  
  // Check if data is available
  const hasPerformances = pkg.performances && Array.isArray(pkg.performances) && pkg.performances.length > 0;
  const hasDanceStyles = pkg.danceStyles && Array.isArray(pkg.danceStyles) && pkg.danceStyles.length > 0;
  const hasTeamDetails = pkg.teamInvolvement && typeof pkg.teamInvolvement === 'object';
  const hasBookingTerms = pkg.bookingTerms && pkg.bookingTerms.trim().length > 0;
  
  return (
    <AnimatePresence>
      <Dialog open={!!pkg} onClose={onClose} className="relative z-50">
        {/* Backdrop with blur */}
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md transition-all duration-300" aria-hidden="true" />

        {/* Modal panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <Dialog.Panel
            as={motion.div}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
            className="bg-white/90 backdrop-blur-sm p-0 rounded-2xl max-w-3xl w-full relative shadow-2xl overflow-hidden my-6 max-h-[90vh] overflow-y-auto"
          >
            {/* Hero banner section with package name */}
            <div 
              className="bg-gradient-to-r from-red-600 to-red-800 text-white p-8 relative"
              style={{
                backgroundImage: pkg.image ? `linear-gradient(to right, rgba(220, 38, 38, 0.9), rgba(153, 27, 27, 0.8)), url(${pkg.image})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <Dialog.Title className="text-3xl font-bold mb-2">
                {pkg.packageName || 'Package Details'}
              </Dialog.Title>
              <div className="flex items-center space-x-2 text-white/80">
                <Package2 className="w-5 h-5" />
                <span>{pkg.type === 'custom' ? 'Custom Package' : 'Premium Package'}</span>
                {pkg.packageID && (
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs ml-2">
                    ID: {pkg.packageID}
                  </span>
                )}
              </div>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content section */}
            <div className="p-8">
              {/* Package description */}
              <div className="text-gray-700 mb-6 text-lg">
                {pkg.description || 'No description available for this package.'}
              </div>
              
              {/* Status badge if available */}
              {pkg.status && (
                <div className="mb-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    pkg.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <Star className="w-4 h-4 mr-1" />
                    Status: {pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1)}
                  </span>
                </div>
              )}
              
              {/* Stats overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-red-50 rounded-xl p-4 flex items-start space-x-3">
                  <div className="bg-red-100 p-3 rounded-full">
                    <Music className="w-6 h-6 text-red-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Performances</h4>
                    <p className="text-red-700 text-lg font-semibold">{hasPerformances ? pkg.performances.length : 0}</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-4 flex items-start space-x-3">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Dancers</h4>
                    <p className="text-blue-700 text-lg font-semibold">{getTotalDancers()}</p>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-xl p-4 flex items-start space-x-3">
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Package Price</h4>
                    <p className="text-green-700 text-lg font-semibold">
                      {typeof pkg.price === 'number' ? `Rs. ${pkg.price.toLocaleString()}` : 'Price not set'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* If package has travel fees */}
              {typeof pkg.travelFees === 'number' && pkg.travelFees > 0 && (
                <div className="mb-6 bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Tag className="w-5 h-5 text-yellow-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">Travel Fees</h4>
                  </div>
                  <p className="text-gray-700 mt-1">Rs. {pkg.travelFees.toLocaleString()}</p>
                </div>
              )}
              
              {/* Detailed sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Performances section */}
                <div className="bg-white shadow-sm rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <Music className="w-5 h-5 mr-2 text-red-600" /> 
                    Performances
                  </h3>
                  
                  {hasPerformances ? (
                    <div className="space-y-3">
                      {pkg.performances.map((perf, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3 flex items-start">
                          <div className="p-2 bg-red-100 rounded-md mr-3">
                            <Music className="w-4 h-4 text-red-700" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{perf.name || perf.type || 'Performance'}</h4>
                            <div className="flex flex-wrap gap-3 mt-1 text-sm">
                              {perf.duration && (
                                <span className="flex items-center text-gray-600">
                                  <Clock className="w-3 h-3 mr-1" /> {perf.duration}
                                </span>
                              )}
                              {perf.performers && (
                                <span className="flex items-center text-gray-600">
                                  <Users className="w-3 h-3 mr-1" /> {perf.performers} performers
                                </span>
                              )}
                            </div>
                            {perf.description && (
                              <p className="text-gray-600 text-sm mt-2">{perf.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                      <p className="text-gray-500 italic">No performance details available</p>
                    </div>
                  )}
                </div>
                
                {/* Team & Details section */}
                <div className="space-y-6">
                  {/* Dance Styles */}
                  <div className="bg-white shadow-sm rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Dance Styles</h3>
                    <div className="flex flex-wrap gap-2">
                      {hasDanceStyles ? (
                        pkg.danceStyles.map((style, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm flex items-center"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            {style}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">No dance styles specified</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Team Involvement */}
                  {hasTeamDetails && (
                    <div className="bg-white shadow-sm rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-3">Team</h3>
                      <ul className="space-y-2">
                        {typeof pkg.teamInvolvement.maleDancers === 'number' && (
                          <li className="flex justify-between">
                            <span className="text-gray-600">Male Dancers</span>
                            <span className="font-semibold">{pkg.teamInvolvement.maleDancers}</span>
                          </li>
                        )}
                        {typeof pkg.teamInvolvement.femaleDancers === 'number' && (
                          <li className="flex justify-between">
                            <span className="text-gray-600">Female Dancers</span>
                            <span className="font-semibold">{pkg.teamInvolvement.femaleDancers}</span>
                          </li>
                        )}
                        {typeof pkg.teamInvolvement.choreographers === 'number' && (
                          <li className="flex justify-between">
                            <span className="text-gray-600">Choreographers</span>
                            <span className="font-semibold">{pkg.teamInvolvement.choreographers}</span>
                          </li>
                        )}
                        {typeof pkg.teamInvolvement.MC === 'number' && pkg.teamInvolvement.MC > 0 && (
                          <li className="flex justify-between">
                            <span className="text-gray-600">MCs</span>
                            <span className="font-semibold">{pkg.teamInvolvement.MC}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Package Type and Created Info */}
              {(pkg.type || pkg.createdBy || pkg.createdAt) && (
                <div className="mt-6 bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-gray-600" />
                    Package Information
                  </h3>
                  <ul className="space-y-2">
                    {pkg.type && (
                      <li className="flex justify-between">
                        <span className="text-gray-600">Package Type</span>
                        <span className="font-semibold capitalize">{pkg.type}</span>
                      </li>
                    )}
                    {pkg.createdBy && (
                      <li className="flex justify-between">
                        <span className="text-gray-600">Created By</span>
                        <span className="font-semibold">{pkg.createdBy}</span>
                      </li>
                    )}
                    {pkg.createdAt && (
                      <li className="flex justify-between">
                        <span className="text-gray-600">Created On</span>
                        <span className="font-semibold">{new Date(pkg.createdAt).toLocaleDateString()}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
              
              {/* Booking Terms */}
              {hasBookingTerms && (
                <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                    Booking Terms
                  </h3>
                  <p className="text-gray-700">{pkg.bookingTerms}</p>
                </div>
              )}
              
              {/* Footer Actions */}
              <div className="flex justify-end items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium mr-3"
                >
                  Close
                </button>
                
                {onCreateCustom && (
                  <button
                    onClick={onCreateCustom}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 transition-colors text-white rounded-lg font-medium"
                  >
                    Create Custom Package
                  </button>
                )}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </AnimatePresence>
  );
};

export default PackageDetailsModal;