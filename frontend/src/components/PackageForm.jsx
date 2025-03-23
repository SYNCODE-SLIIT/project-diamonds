// src/components/PackageForm.jsx - Form for creating and updating packages
import React, { useState, useEffect } from 'react';
import { createPackage, updatePackage } from '../services/packageService.js';

const PackageForm = ({ package: initialPackage, onSuccess, onCancel }) => {
  const defaultFormData = {
    packageID: '',
    packageName: '',
    description: '',
    performances: [{ type: '', duration: '' }],
    danceStyle: [''],
    customizationOptions: [''],
    teamInvolvement: {
      dancers: 1,
      choreographer: 1,
      MC: 0
    },
    additionalServices: [{ service: '', price: 0 }],
    travelFees: 0,
    bookingTerms: '',
    price: '',
    image: 'https://i.pinimg.com/736x/b8/32/ff/b832ff90757e0cc6075e752976bdfe3c.jpg',
    type: 'custom',
    status: 'pending'
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Initialize form with existing package data when editing
  useEffect(() => {
    if (initialPackage) {
      // For fields like price that might be null
      const packageData = { ...initialPackage };
      if (packageData.price === null) {
        packageData.price = '';
      }
      setFormData(packageData);
    }
  }, [initialPackage]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle nested object changes (teamInvolvement)
  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  // Handle array field changes
  const handleArrayChange = (field, index, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  // Handle performance array objects
  const handlePerformanceChange = (index, field, value) => {
    setFormData(prev => {
      const newPerformances = [...prev.performances];
      newPerformances[index] = {
        ...newPerformances[index],
        [field]: value
      };
      return {
        ...prev,
        performances: newPerformances
      };
    });
  };

  // Handle additional service array objects
  const handleServiceChange = (index, field, value) => {
    setFormData(prev => {
      const newServices = [...prev.additionalServices];
      newServices[index] = {
        ...newServices[index],
        [field]: field === 'price' ? Number(value) : value
      };
      return {
        ...prev,
        additionalServices: newServices
      };
    });
  };

  // Add new item to an array
  const addArrayItem = (field, defaultValue) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }));
  };

  // Remove item from an array
  const removeArrayItem = (field, index) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray.splice(index, 1);
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  // Validate the form
  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!formData.packageID) newErrors.packageID = 'Package ID is required';
    if (!formData.packageName) newErrors.packageName = 'Package name is required';
    if (formData.packageName && (formData.packageName.length < 3 || formData.packageName.length > 100)) 
      newErrors.packageName = 'Package name must be between 3 and 100 characters';
    
    if (!formData.description) newErrors.description = 'Description is required';
    if (formData.description && (formData.description.length < 10 || formData.description.length > 500))
      newErrors.description = 'Description must be between 10 and 500 characters';
    
    // Validate performances
    if (!formData.performances.length) newErrors.performances = 'At least one performance is required';
    formData.performances.forEach((perf, index) => {
      if (!perf.type) {
        newErrors[`performance_${index}_type`] = 'Performance type is required';
      }
      if (!perf.duration) {
        newErrors[`performance_${index}_duration`] = 'Duration is required';
      } else if (!/^[0-9]+ (minutes|hours)$/.test(perf.duration)) {
        newErrors[`performance_${index}_duration`] = 'Duration must be in format "X minutes" or "X hours"';
      }
    });
    
    // Validate dance styles
    const validDanceStyles = formData.danceStyle.filter(style => style.trim() !== '');
    if (!validDanceStyles.length) newErrors.danceStyle = 'At least one dance style is required';
    
    // Validate team involvement
    if (formData.teamInvolvement.dancers < 1) 
      newErrors.dancers = 'At least one dancer is required';
    if (formData.teamInvolvement.choreographer < 1) 
      newErrors.choreographer = 'At least one choreographer is required';
    if (formData.teamInvolvement.MC < 0) 
      newErrors.mc = 'MC count cannot be negative';
    
    // Validate additional services
    formData.additionalServices.forEach((service, index) => {
      if (!service.service) {
        newErrors[`service_${index}_name`] = 'Service name is required';
      }
      if (service.price < 0) {
        newErrors[`service_${index}_price`] = 'Price cannot be negative';
      }
    });
    
    // Validate other fields
    if (formData.travelFees < 0) newErrors.travelFees = 'Travel fees cannot be negative';
    if (!formData.bookingTerms) newErrors.bookingTerms = 'Booking terms are required';
    if (formData.bookingTerms && formData.bookingTerms.length < 10) 
      newErrors.bookingTerms = 'Booking terms must be at least 10 characters';
    if (formData.price !== '' && formData.price < 0) 
      newErrors.price = 'Price cannot be negative';
    if (!formData.type) newErrors.type = 'Package type is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setApiError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare form data for submission
      const packageData = { ...formData };
      
      // Convert price to number or null
      packageData.price = packageData.price === '' ? null : Number(packageData.price);
      
      // Remove any empty strings from arrays
      packageData.danceStyle = packageData.danceStyle.filter(style => style.trim() !== '');
      packageData.customizationOptions = packageData.customizationOptions.filter(option => option.trim() !== '');
      
      // Submit the data
      if (initialPackage) {
        await updatePackage(initialPackage._id, packageData);
      } else {
        await createPackage(packageData);
      }
      
      onSuccess();
    } catch (error) {
      setApiError(error.message || 'An error occurred while saving the package');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {apiError}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Package ID */}
        <div>
          <label className="block mb-1 font-medium">
            Package ID*
          </label>
          <input
            type="text"
            name="packageID"
            value={formData.packageID}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.packageID ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.packageID && <p className="text-red-500 text-sm mt-1">{errors.packageID}</p>}
        </div>
        
        {/* Package Name */}
        <div>
          <label className="block mb-1 font-medium">
            Package Name*
          </label>
          <input
            type="text"
            name="packageName"
            value={formData.packageName}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.packageName ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.packageName && <p className="text-red-500 text-sm mt-1">{errors.packageName}</p>}
        </div>
      </div>
      
      {/* Description */}
      <div>
        <label className="block mb-1 font-medium">
          Description*
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className={`w-full p-2 border rounded ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
        ></textarea>
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>
      
      {/* Performances */}
      <div>
        <label className="block mb-2 font-medium">
          Performances*
        </label>
        {formData.performances.map((performance, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-2 mb-2 p-2 border rounded">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Performance Type"
                value={performance.type}
                onChange={(e) => handlePerformanceChange(index, 'type', e.target.value)}
                className={`w-full p-2 border rounded ${errors[`performance_${index}_type`] ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors[`performance_${index}_type`] && 
                <p className="text-red-500 text-sm mt-1">{errors[`performance_${index}_type`]}</p>}
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Duration (e.g., 30 minutes)"
                value={performance.duration}
                onChange={(e) => handlePerformanceChange(index, 'duration', e.target.value)}
                className={`w-full p-2 border rounded ${errors[`performance_${index}_duration`] ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors[`performance_${index}_duration`] && 
                <p className="text-red-500 text-sm mt-1">{errors[`performance_${index}_duration`]}</p>}
                </div>
                {formData.performances.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('performances', index)}
                    className="text-red-500 p-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('performances', { type: '', duration: '' })}
              className="text-blue-500 mt-2"
            >
              + Add Performance
            </button>
            {errors.performances && <p className="text-red-500 text-sm mt-1">{errors.performances}</p>}
          </div>
          
          {/* Dance Styles */}
          <div>
            <label className="block mb-2 font-medium">
              Dance Styles*
            </label>
            {formData.danceStyle.map((style, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={style}
                  onChange={(e) => handleArrayChange('danceStyle', index, e.target.value)}
                  className={`flex-1 p-2 border rounded ${errors.danceStyle && index === 0 ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formData.danceStyle.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('danceStyle', index)}
                    className="text-red-500 p-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('danceStyle', '')}
              className="text-blue-500 mt-2"
            >
              + Add Dance Style
            </button>
            {errors.danceStyle && <p className="text-red-500 text-sm mt-1">{errors.danceStyle}</p>}
          </div>
          
          {/* Customization Options */}
          <div>
            <label className="block mb-2 font-medium">
              Customization Options
            </label>
            {formData.customizationOptions.map((option, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleArrayChange('customizationOptions', index, e.target.value)}
                  className="flex-1 p-2 border rounded border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('customizationOptions', index)}
                  className="text-red-500 p-2"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('customizationOptions', '')}
              className="text-blue-500 mt-2"
            >
              + Add Customization Option
            </button>
          </div>
          
          {/* Team Involvement */}
          <div>
            <label className="block mb-2 font-medium">
              Team Involvement*
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm">Dancers*</label>
                <input
                  type="number"
                  min="1"
                  value={formData.teamInvolvement.dancers}
                  onChange={(e) => handleNestedChange('teamInvolvement', 'dancers', parseInt(e.target.value))}
                  className={`w-full p-2 border rounded ${errors.dancers ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.dancers && <p className="text-red-500 text-sm mt-1">{errors.dancers}</p>}
              </div>
              <div>
                <label className="block text-sm">Choreographers*</label>
                <input
                  type="number"
                  min="1"
                  value={formData.teamInvolvement.choreographer}
                  onChange={(e) => handleNestedChange('teamInvolvement', 'choreographer', parseInt(e.target.value))}
                  className={`w-full p-2 border rounded ${errors.choreographer ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.choreographer && <p className="text-red-500 text-sm mt-1">{errors.choreographer}</p>}
              </div>
              <div>
                <label className="block text-sm">MCs</label>
                <input
                  type="number"
                  min="0"
                  value={formData.teamInvolvement.MC}
                  onChange={(e) => handleNestedChange('teamInvolvement', 'MC', parseInt(e.target.value))}
                  className={`w-full p-2 border rounded ${errors.mc ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.mc && <p className="text-red-500 text-sm mt-1">{errors.mc}</p>}
              </div>
            </div>
          </div>
          
          {/* Additional Services */}
          <div>
            <label className="block mb-2 font-medium">
              Additional Services
            </label>
            {formData.additionalServices.map((service, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-2 mb-2 p-2 border rounded">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Service Name"
                    value={service.service}
                    onChange={(e) => handleServiceChange(index, 'service', e.target.value)}
                    className={`w-full p-2 border rounded ${errors[`service_${index}_name`] ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors[`service_${index}_name`] && 
                    <p className="text-red-500 text-sm mt-1">{errors[`service_${index}_name`]}</p>}
                </div>
                <div className="md:w-1/3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    value={service.price}
                    onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                    className={`w-full p-2 border rounded ${errors[`service_${index}_price`] ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors[`service_${index}_price`] && 
                    <p className="text-red-500 text-sm mt-1">{errors[`service_${index}_price`]}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => removeArrayItem('additionalServices', index)}
                  className="text-red-500 p-2"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('additionalServices', { service: '', price: 0 })}
              className="text-blue-500 mt-2"
            >
              + Add Service
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Travel Fees */}
            <div>
              <label className="block mb-1 font-medium">
                Travel Fees ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="travelFees"
                value={formData.travelFees}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.travelFees ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.travelFees && <p className="text-red-500 text-sm mt-1">{errors.travelFees}</p>}
            </div>
            
            {/* Price */}
            <div>
              <label className="block mb-1 font-medium">
                Price ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Leave empty for custom quotes"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>
          </div>
          
          {/* Booking Terms */}
          <div>
            <label className="block mb-1 font-medium">
              Booking Terms*
            </label>
            <textarea
              name="bookingTerms"
              value={formData.bookingTerms}
              onChange={handleChange}
              rows="3"
              className={`w-full p-2 border rounded ${errors.bookingTerms ? 'border-red-500' : 'border-gray-300'}`}
            ></textarea>
            {errors.bookingTerms && <p className="text-red-500 text-sm mt-1">{errors.bookingTerms}</p>}
          </div>
          
          {/* Image URL */}
          <div>
            <label className="block mb-1 font-medium">
              Image URL
            </label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full p-2 border rounded border-gray-300"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Package Type */}
            <div>
              <label className="block mb-1 font-medium">
                Package Type*
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="system">System</option>
                <option value="custom">Custom</option>
              </select>
              {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
            </div>
            
            {/* Status */}
            <div>
              <label className="block mb-1 font-medium">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border rounded border-gray-300"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (initialPackage ? 'Update Package' : 'Create Package')}
            </button>
          </div>
        </form>
      );
    };
    
    export default PackageForm;