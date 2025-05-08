import React from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Clock, Star, Tag, Calendar, Sparkles, FileText, Info, Users, Shield, Globe, Camera, Music, User, CheckCircle, AlertTriangle } from 'lucide-react';

const ServiceDetailsModal = ({ service, onClose }) => {
  if (!service) return null;

  // Log service object to debug
  console.log("Service details:", service);

  // Handle both direct service objects and nested ones
  // In some cases, service is passed directly, and in others, it's service.serviceID
  const serviceData = service.serviceID ? service.serviceID : service;
  
  // Helper function to check if the service has a certain property
  const hasProperty = (prop) => {
    if (!serviceData) return false;
    return serviceData[prop] !== undefined && serviceData[prop] !== null;
  };

  // Get appropriate style for category
  const getCategoryStyle = (category) => {
    const styles = {
      "Choreography": "bg-purple-100 text-purple-800",
      "Styling": "bg-pink-100 text-pink-800",
      "Stage Effects": "bg-amber-100 text-amber-800",
      "Photography": "bg-blue-100 text-blue-800",
      "Workshops": "bg-green-100 text-green-800",
      "Other": "bg-gray-100 text-gray-800"
    };
    return styles[category] || "bg-gray-100 text-gray-800";
  };

  // Get service property safely
  const getServiceProp = (propName, defaultValue = '') => {
    return serviceData[propName] !== undefined ? serviceData[propName] : defaultValue;
  };

  const serviceName = getServiceProp('serviceName');
  const serviceID = getServiceProp('serviceID');
  const description = getServiceProp('description');
  const price = getServiceProp('price');
  const category = getServiceProp('category');
  const createdBy = getServiceProp('createdBy');
  const status = getServiceProp('status', 'available');

  return (
    <AnimatePresence>
      <Dialog open={!!service} onClose={onClose} className="relative z-50">
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
            className="bg-white/90 backdrop-blur-sm p-0 rounded-2xl max-w-2xl w-full relative shadow-2xl overflow-hidden my-6 max-h-[90vh] overflow-y-auto"
          >
            {/* Hero banner section with service name */}
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-8 relative"
              style={{
                backgroundImage: serviceData.image ? `linear-gradient(to right, rgba(37, 99, 235, 0.9), rgba(124, 58, 237, 0.8)), url(${serviceData.image})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <Dialog.Title className="text-3xl font-bold mb-2">
                {serviceName || 'Service Details'}
              </Dialog.Title>
              <div className="flex items-center space-x-2 text-white/80">
                <Sparkles className="w-5 h-5" />
                <span>{category || 'Additional Service'}</span>
                {serviceID && (
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs ml-2">
                    ID: {serviceID}
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
              {/* Service description */}
              <div className="text-gray-700 mb-6 text-lg">
                {description || 'No description available for this service.'}
              </div>
              
              {/* Status badge */}
              <div className="mb-6 flex flex-wrap gap-2">
                {/* Service Category Tag */}
                {category && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryStyle(category)}`}>
                    <Tag className="w-4 h-4 mr-1" />
                    {category}
                  </span>
                )}
                
                {/* Status Badge */}
                {status && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {status === 'available' ? (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 mr-1" />
                    )}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                )}
              </div>
              
              {/* Stats overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Price Card */}
                <div className="bg-green-50 rounded-xl p-4 flex items-start space-x-3">
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Price</h4>
                    <p className="text-green-700 text-lg font-semibold">
                      {typeof price === 'number' ? `Rs. ${price.toLocaleString()}` : 'Price not set'}
                    </p>
                  </div>
                </div>
                
                {/* Creator Card */}
                {createdBy && (
                  <div className="bg-blue-50 rounded-xl p-4 flex items-start space-x-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <User className="w-6 h-6 text-blue-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Created By</h4>
                      <p className="text-blue-700 text-lg font-semibold">{createdBy}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Additional details if available */}
              {hasProperty('duration') && (
                <div className="bg-purple-50 rounded-xl p-4 flex items-start space-x-3 mb-8">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-purple-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Duration</h4>
                    <p className="text-purple-700 text-lg font-semibold">{serviceData.duration}</p>
                  </div>
                </div>
              )}
              
              {/* Service fields summary */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-gray-600" /> 
                  Service Details
                </h3>
                
                <div className="space-y-3">
                  {/* Service ID */}
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Service ID</span>
                    <span className="font-medium text-gray-800">{serviceID || serviceData._id || 'Not specified'}</span>
                  </div>
                  
                  {/* Category */}
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium text-gray-800">{category || 'Not categorized'}</span>
                  </div>
                  
                  {/* Creation Date if available */}
                  {hasProperty('createdAt') && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Created On</span>
                      <span className="font-medium text-gray-800">
                        {new Date(serviceData.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {/* Last Updated if available */}
                  {hasProperty('updatedAt') && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="font-medium text-gray-800">
                        {new Date(serviceData.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Detailed sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Service requirements section */}
                {(hasProperty('requirements') || hasProperty('details')) && (
                  <div className="bg-white shadow-sm rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-blue-600" /> 
                      Requirements
                    </h3>
                    
                    {hasProperty('requirements') && serviceData.requirements ? (
                      <div className="space-y-3">
                        {typeof serviceData.requirements === 'string' ? (
                          <p className="text-gray-700">{serviceData.requirements}</p>
                        ) : Array.isArray(serviceData.requirements) ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {serviceData.requirements.map((req, idx) => (
                              <li key={idx} className="text-gray-700">{req}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 italic">Requirements information not available</p>
                        )}
                      </div>
                    ) : hasProperty('details') ? (
                      <div className="space-y-2">
                        {typeof serviceData.details === 'object' ? (
                          Object.entries(serviceData.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                              <span className="font-medium text-gray-800">{value}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-700">{serviceData.details}</p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-6 rounded-lg text-center">
                        <p className="text-gray-500 italic">No specific requirements</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Service features section */}
                {hasProperty('features') && (
                  <div className="bg-white shadow-sm rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-purple-600" /> 
                      Features
                    </h3>
                    
                    {serviceData.features ? (
                      <div className="space-y-2">
                        {Array.isArray(serviceData.features) ? (
                          <div className="flex flex-wrap gap-2">
                            {serviceData.features.map((feature, idx) => (
                              <span 
                                key={idx}
                                className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center"
                              >
                                <Star className="w-3.5 h-3.5 mr-1" />
                                {feature}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-700">{serviceData.features}</p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-6 rounded-lg text-center">
                        <p className="text-gray-500 italic">No specific features listed</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Notes/Terms if available */}
              {(hasProperty('terms') || hasProperty('notes')) && (
                <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                    {hasProperty('terms') ? 'Terms & Conditions' : 'Notes'}
                  </h3>
                  <p className="text-gray-700">{serviceData.terms || serviceData.notes}</p>
                </div>
              )}
              
              {/* Footer Actions */}
              <div className="flex justify-end items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </AnimatePresence>
  );
};

export default ServiceDetailsModal; 