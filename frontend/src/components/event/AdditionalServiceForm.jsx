import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Briefcase, DollarSign, FileText, User, ToggleLeft } from 'lucide-react';

const AdditionalServiceForm = ({ service, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    serviceID: '',
    serviceName: '',
    description: '',
    price: '',
    category: 'Choreography',
    createdBy: '',
    status: 'available', 
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (service) {
      setFormData({
        serviceID: service.serviceID || '',
        serviceName: service.serviceName || '',
        description: service.description || '',
        price: service.price || '',
        category: service.category || 'Choreography',
        createdBy: service.createdBy || '',
        status: service.status || 'available',
      });
    }
  }, [service]);

  const validate = () => {
    const newErrors = {};
    if (!formData.serviceID) newErrors.serviceID = 'Service ID is required';
    if (!formData.serviceName) newErrors.serviceName = 'Service Name is required';
    if (!formData.description || formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    if (formData.price === '' || isNaN(formData.price) || Number(formData.price) < 0) {
      newErrors.price = 'Price must be a non‑negative number';
    }
    if (!formData.createdBy) newErrors.createdBy = 'Created By is required';
    if (!formData.status) newErrors.status = 'Availability selection is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Mark field as touched
    if (!touched[name]) {
      setTouched((prev) => ({
        ...prev,
        [name]: true
      }));
    }
    
    // Validate on change for better UX
    if (touched[name]) {
      validateField(name, value);
    }
  };
  
  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'serviceID':
        if (!value) error = 'Service ID is required';
        break;
      case 'serviceName':
        if (!value) error = 'Service Name is required';
        break;
      case 'description':
        if (!value || value.length < 10) error = 'Description must be at least 10 characters';
        break;
      case 'price':
        if (value === '' || isNaN(value) || Number(value) < 0) error = 'Price must be a non‑negative number';
        break;
      case 'createdBy':
        if (!value) error = 'Created By is required';
        break;
      case 'status':
        if (!value) error = 'Availability selection is required';
        break;
      default:
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    if (validate()) {
      try {
        const formattedData = { ...formData, price: Number(formData.price) };
        await onSubmit(formattedData);
      } catch (error) {
        console.error('Error submitting form data:', error);
      }
    }
  };

  // Get category icon
  const getCategoryIcon = () => {
    switch(formData.category) {
      case 'Choreography':
        return '💃';
      case 'Styling':
        return '👔';
      case 'Stage Effects':
        return '✨';
      case 'Photography':
        return '📸';
      case 'Workshops':
        return '🎓';
      default:
        return '🔧';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-xl px-8 py-6 border border-blue-100"
    >
      <div className="mb-6 pb-4 border-b border-gray-100">
        <h3 className="text-2xl font-bold text-gray-800">
          {service ? 'Edit Additional Service' : 'Add Additional Service'}
        </h3>
        <p className="text-gray-500 mt-1">
          Fill in the details below to {service ? 'update' : 'create'} an additional service.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service ID */}
          <div className="col-span-1">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
              <Briefcase className="w-4 h-4 mr-1.5 text-blue-500" />
              Service ID
            </label>
            <div className="relative">
              <input
                type="text"
                name="serviceID"
                value={formData.serviceID}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!!service}
                className={`block w-full rounded-lg border ${errors.serviceID ? 'border-red-300 bg-red-50' : touched.serviceID && !errors.serviceID ? 'border-green-300 bg-green-50' : 'border-gray-300'}
                  py-2.5 px-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                placeholder="Enter service ID"
              />
              {touched.serviceID && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {errors.serviceID ? 
                    <AlertCircle className="h-5 w-5 text-red-500" /> : 
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  }
                </div>
              )}
            </div>
            {errors.serviceID && (
              <p className="mt-1.5 text-sm text-red-600">{errors.serviceID}</p>
            )}
          </div>

          {/* Service Name */}
          <div className="col-span-1">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
              <FileText className="w-4 h-4 mr-1.5 text-blue-500" />
              Service Name
            </label>
            <div className="relative">
              <input
                type="text"
                name="serviceName"
                value={formData.serviceName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`block w-full rounded-lg border ${errors.serviceName ? 'border-red-300 bg-red-50' : touched.serviceName && !errors.serviceName ? 'border-green-300 bg-green-50' : 'border-gray-300'}
                  py-2.5 px-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                placeholder="Enter service name"
              />
              {touched.serviceName && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {errors.serviceName ? 
                    <AlertCircle className="h-5 w-5 text-red-500" /> : 
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  }
                </div>
              )}
            </div>
            {errors.serviceName && (
              <p className="mt-1.5 text-sm text-red-600">{errors.serviceName}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
            <FileText className="w-4 h-4 mr-1.5 text-blue-500" />
            Description
          </label>
          <div className="relative">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={4}
              className={`block w-full rounded-lg border ${errors.description ? 'border-red-300 bg-red-50' : touched.description && !errors.description ? 'border-green-300 bg-green-50' : 'border-gray-300'}
                py-2.5 px-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
              placeholder="Provide a detailed description of the service..."
            />
            {touched.description && (
              <div className="absolute top-3 right-3 pointer-events-none">
                {errors.description ? 
                  <AlertCircle className="h-5 w-5 text-red-500" /> : 
                  <CheckCircle className="h-5 w-5 text-green-500" />
                }
              </div>
            )}
          </div>
          {errors.description ? (
            <p className="mt-1.5 text-sm text-red-600">{errors.description}</p>
          ) : (
            <p className="mt-1.5 text-xs text-gray-500">Minimum 10 characters required</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Price */}
          <div className="col-span-1">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
              <DollarSign className="w-4 h-4 mr-1.5 text-blue-500" />
              Price (Rs.)
            </label>
            <div className="relative">
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                onBlur={handleBlur}
                min="0"
                step="0.01"
                className={`block w-full rounded-lg border ${errors.price ? 'border-red-300 bg-red-50' : touched.price && !errors.price ? 'border-green-300 bg-green-50' : 'border-gray-300'}
                  py-2.5 px-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                placeholder="0.00"
              />
              {touched.price && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {errors.price ? 
                    <AlertCircle className="h-5 w-5 text-red-500" /> : 
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  }
                </div>
              )}
            </div>
            {errors.price && (
              <p className="mt-1.5 text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          {/* Category */}
          <div className="col-span-1">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
              <span className="mr-1.5">{getCategoryIcon()}</span>
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 py-2.5 px-4 text-gray-900 bg-white 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="Choreography">Choreography</option>
              <option value="Styling">Styling</option>
              <option value="Stage Effects">Stage Effects</option>
              <option value="Photography">Photography</option>
              <option value="Workshops">Workshops</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Availability Field */}
          <div className="col-span-1">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
              <ToggleLeft className="w-4 h-4 mr-1.5 text-blue-500" />
              Availability
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full rounded-lg border ${errors.status ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                py-2.5 px-4 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
            {errors.status && (
              <p className="mt-1.5 text-sm text-red-600">{errors.status}</p>
            )}
          </div>
        </div>

        {/* Created By */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
            <User className="w-4 h-4 mr-1.5 text-blue-500" />
            Created By
          </label>
          <div className="relative">
            <input
              type="text"
              name="createdBy"
              value={formData.createdBy}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full rounded-lg border ${errors.createdBy ? 'border-red-300 bg-red-50' : touched.createdBy && !errors.createdBy ? 'border-green-300 bg-green-50' : 'border-gray-300'}
                py-2.5 px-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
              placeholder="Enter your name or team"
            />
            {touched.createdBy && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {errors.createdBy ? 
                  <AlertCircle className="h-5 w-5 text-red-500" /> : 
                  <CheckCircle className="h-5 w-5 text-green-500" />
                }
              </div>
            )}
          </div>
          {errors.createdBy && (
            <p className="mt-1.5 text-sm text-red-600">{errors.createdBy}</p>
          )}
        </div>

        {/* Form Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-md hover:shadow-lg transition-all`}
          >
            {service ? 'Update Service' : 'Add Service'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default AdditionalServiceForm;
