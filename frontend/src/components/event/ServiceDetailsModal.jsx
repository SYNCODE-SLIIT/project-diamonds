import React from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, DollarSign, Clock, Star, Info } from 'lucide-react';

const ServiceDetailsModal = ({ service, onClose }) => {
  if (!service) return null;

  return (
    <AnimatePresence>
      <Dialog open={true} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel
            as={motion.div}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-white rounded-full p-1 hover:bg-gray-100 transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <div className="px-6 py-8">
              <Dialog.Title className="text-2xl font-bold text-gray-800 mb-4">
                {service.serviceName}
              </Dialog.Title>

              <div className="space-y-4 mb-6">
                <div className="flex items-start bg-gray-50 p-4 rounded-lg">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700">{service.description}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-bold text-gray-800">Rs. {service.price.toLocaleString()}</p>
                  </div>
                </div>

                {service.duration && (
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-purple-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-medium text-gray-800">{service.duration}</p>
                    </div>
                  </div>
                )}

                {service.rating && (
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-amber-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Rating</p>
                      <div className="flex items-center">
                        <p className="font-medium text-gray-800 mr-2">{service.rating}/5</p>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(service.rating)
                                  ? 'text-amber-400 fill-amber-400'
                                  : i < service.rating
                                  ? 'text-amber-400 fill-amber-400 opacity-50'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {service.category && (
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {service.category}
                  </span>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
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