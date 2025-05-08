// src/components/event/PackageForm.jsx
import React, { useState, useEffect } from 'react';
import { createPackage, updatePackage } from '../../services/packageService.js';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Package2, DollarSign, FileText, User, Music, Tag, Users, Clock, Upload, PlusCircle, XCircle, Image, MessageSquare } from 'lucide-react';

const PackageForm = ({ package: initialPackage, onSuccess, onCancel }) => {
  const DEFAULT_IMAGE =
    'https://res.cloudinary.com/du5c9fw6s/image/upload/v1742922785/default_zojwtj.avif'; // Replace with your Cloudinary default image URL

  const defaultFormData = {
    // For new packages, we leave packageID empty so that the backend default is applied.
    packageID: '',
    packageName: '',
    description: '',
    performances: [{ type: '', duration: '' }],
    danceStyles: [''],
    teamInvolvement: {
      maleDancers: 0,
      femaleDancers: 0,
      choreographers: 1,
      MC: 0
    },
    travelFees: 0,
    bookingTerms: '',
    price: '',
    image: null, // Will store a File object if user uploads one.
    // Default values updated for admin interface:
    type: 'system',
    status: 'approved'
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [imagePreview, setImagePreview] = useState(DEFAULT_IMAGE);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Initialize form with existing package data when editing
  useEffect(() => {
    if (initialPackage) {
      const packageData = { ...initialPackage };
      if (packageData.price === null) {
        packageData.price = '';
      }
      setFormData(packageData);
      // Use the existing image URL as preview if available
      if (packageData.image) {
        setImagePreview(packageData.image);
      }
    }
  }, [initialPackage]);

  // Determine if fields should be editable based on package type
  const isCustomPackage = formData.type === 'custom';
  const isEditMode = !!initialPackage;
  
  // Function to check if a field should be editable
  const isFieldEditable = (fieldName) => {
    if (!isEditMode) return true; // All fields editable for new packages
    
    // For custom packages, only certain fields are editable
    if (isCustomPackage) {
      return ['price', 'travelFees', 'bookingTerms'].includes(fieldName) || 
             fieldName.startsWith('teamInvolvement');
    }
    
    return true; // All fields editable for system packages
  };

  // Handle changes for simple input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  // Handle changes for nested objects (e.g., teamInvolvement)
  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
    
    // Mark field as touched
    const fieldKey = `${parent}.${field}`;
    if (!touched[fieldKey]) {
      setTouched((prev) => ({
        ...prev,
        [fieldKey]: true
      }));
    }
    
    // Validate on change
    if (touched[fieldKey]) {
      validateNestedField(parent, field, value);
    }
  };

  // Handle changes for array fields (e.g., danceStyles)
  const handleArrayChange = (field, index, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray
      };
    });
    
    // Mark field as touched
    const fieldKey = `${field}.${index}`;
    if (!touched[fieldKey]) {
      setTouched((prev) => ({
        ...prev,
        [fieldKey]: true
      }));
    }
    
    // Validate array field
    if (touched[fieldKey]) {
      validateArrayField(field, index, value);
    }
  };

  // Handle changes for performance objects
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
    
    // Mark field as touched
    const fieldKey = `performances.${index}.${field}`;
    if (!touched[fieldKey]) {
      setTouched((prev) => ({
        ...prev,
        [fieldKey]: true
      }));
    }
    
    // Validate on change
    if (touched[fieldKey]) {
      validatePerformanceField(index, field, value);
    }
  };

  // Add blur handler for better validation UX
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));
    validateField(name, value);
  };
  
  // Handle blur for nested fields
  const handleNestedBlur = (parent, field, value) => {
    const fieldKey = `${parent}.${field}`;
    setTouched((prev) => ({
      ...prev,
      [fieldKey]: true
    }));
    validateNestedField(parent, field, value);
  };
  
  // Handle blur for array fields
  const handleArrayBlur = (field, index, value) => {
    const fieldKey = `${field}.${index}`;
    setTouched((prev) => ({
      ...prev,
      [fieldKey]: true
    }));
    validateArrayField(field, index, value);
  };
  
  // Handle blur for performance fields
  const handlePerformanceBlur = (index, field, value) => {
    const fieldKey = `performances.${index}.${field}`;
    setTouched((prev) => ({
      ...prev,
      [fieldKey]: true
    }));
    validatePerformanceField(index, field, value);
  };

  // Add new item to an array field
  const addArrayItem = (field, defaultValue) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }));
  };

  // Remove item from an array field
  const removeArrayItem = (field, index) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray.splice(index, 1);
      return {
        ...prev,
        [field]: newArray
      };
    });
    
    // Clean up any touched or error state for the removed item
    const updatedTouched = { ...touched };
    const updatedErrors = { ...errors };
    
    Object.keys(updatedTouched).forEach(key => {
      if (key.startsWith(`${field}.${index}`)) {
        delete updatedTouched[key];
      }
    });
    
    Object.keys(updatedErrors).forEach(key => {
      if (key.startsWith(`${field}.${index}`)) {
        delete updatedErrors[key];
      }
    });
    
    setTouched(updatedTouched);
    setErrors(updatedErrors);
  };

  // Handle file input change for image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Save the file object in formData
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      // Update preview to show the selected image
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  // Validate a single field
  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'packageID':
        // Only validate packageID in edit mode
        if (initialPackage && !value) error = 'Package ID is required';
        break;
      case 'packageName':
        if (!value) error = 'Package name is required';
        else if (value.length < 3 || value.length > 100) 
          error = 'Package name must be between 3 and 100 characters';
        break;
      case 'description':
        if (!value) error = 'Description is required';
        else if (value.length < 10 || value.length > 500) 
          error = 'Description must be between 10 and 500 characters';
        break;
      case 'bookingTerms':
        if (!value) error = 'Booking terms are required';
        else if (value.length < 10) 
          error = 'Booking terms must be at least 10 characters';
        break;
      case 'price':
        if (value !== '' && Number(value) < 0) error = 'Price cannot be negative';
        break;
      case 'travelFees':
        if (Number(value) < 0) error = 'Travel fees cannot be negative';
        break;
      case 'type':
        if (!value) error = 'Package type is required';
        break;
      default:
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    return error === '';
  };
  
  // Validate a nested field
  const validateNestedField = (parent, field, value) => {
    let error = '';
    const fieldKey = `${parent}.${field}`;
    
    if (parent === 'teamInvolvement') {
      switch(field) {
        case 'maleDancers':
          if (value < 0) error = 'Male dancers count cannot be negative';
          break;
        case 'femaleDancers':
          if (value < 0) error = 'Female dancers count cannot be negative';
          break;
        case 'choreographers':
          if (value < 1) error = 'At least one choreographer is required';
          break;
        case 'MC':
          if (value < 0) error = 'MC count cannot be negative';
          break;
        default:
          break;
      }
    }
    
    setErrors(prev => ({
      ...prev,
      [fieldKey]: error
    }));
    
    return error === '';
  };
  
  // Validate an array field
  const validateArrayField = (field, index, value) => {
    let error = '';
    const fieldKey = `${field}.${index}`;
    
    if (field === 'danceStyles') {
      // Only validate if it's the first item and it's empty
      if (index === 0 && !value.trim()) {
        error = 'At least one dance style is required';
      }
    }
    
    setErrors(prev => ({
      ...prev,
      [fieldKey]: error
    }));
    
    return error === '';
  };
  
  // Validate a performance field
  const validatePerformanceField = (index, field, value) => {
    let error = '';
    const fieldKey = `performances.${index}.${field}`;
    
    switch(field) {
      case 'type':
        if (!value) error = 'Performance type is required';
        break;
      case 'duration':
        if (!value) {
          error = 'Duration is required';
        } else if (!/^[1-9]\d*\s?(minutes|minute|hours|hour)$/.test(value)) {
          error = 'Duration must be in format "X minutes" or "X hours"';
        }
        break;
      default:
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [fieldKey]: error
    }));
    
    return error === '';
  };

  // Validate the entire form at once
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    // Validate simple fields
    ['packageName', 'description', 'bookingTerms', 'price', 'travelFees', 'type'].forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });
    
    // Validate packageID in edit mode
    if (initialPackage && !validateField('packageID', formData.packageID)) {
      isValid = false;
    }
    
    // Validate team involvement
    Object.keys(formData.teamInvolvement).forEach(field => {
      if (!validateNestedField('teamInvolvement', field, formData.teamInvolvement[field])) {
        isValid = false;
      }
    });
    
    // Validate dance styles (at least one is required)
    const validDanceStyles = formData.danceStyles.filter(style => style.trim() !== '');
    if (validDanceStyles.length === 0) {
      newErrors['danceStyles.0'] = 'At least one dance style is required';
      isValid = false;
    }
    
    // Validate performances
    if (formData.performances.length === 0) {
      newErrors.performances = 'At least one performance is required';
      isValid = false;
    } else {
      formData.performances.forEach((perf, index) => {
        if (!validatePerformanceField(index, 'type', perf.type)) {
          isValid = false;
        }
        if (!validatePerformanceField(index, 'duration', perf.duration)) {
          isValid = false;
        }
      });
    }
    
    // Mark all fields as touched
    const allTouched = {};
    
    // Simple fields
    ['packageID', 'packageName', 'description', 'bookingTerms', 'price', 'travelFees', 'type'].forEach(field => {
      allTouched[field] = true;
    });
    
    // Team involvement fields
    Object.keys(formData.teamInvolvement).forEach(field => {
      allTouched[`teamInvolvement.${field}`] = true;
    });
    
    // Dance styles
    formData.danceStyles.forEach((_, index) => {
      allTouched[`danceStyles.${index}`] = true;
    });
    
    // Performances
    formData.performances.forEach((_, index) => {
      allTouched[`performances.${index}.type`] = true;
      allTouched[`performances.${index}.duration`] = true;
    });
    
    setTouched(allTouched);
    setErrors(prev => ({ ...prev, ...newErrors }));
    
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const packageData = { ...formData };
      // Remove packageID in create mode so backend auto-generates it
      if (!initialPackage) {
        delete packageData.packageID;
      }
      // If no new image file is chosen (or if image is not a File), remove the key
      if (!packageData.image || typeof packageData.image !== 'object') {
        delete packageData.image;
      }
      packageData.price = packageData.price === '' ? null : Number(packageData.price);
      packageData.danceStyles = packageData.danceStyles.filter(style => style.trim() !== '');
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
    <motion.form 
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {apiError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6 flex items-start">
          <div className="text-red-500 mr-3 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="text-red-700">{apiError}</p>
          </div>
        </div>
      )}

      {/* Show Package ID only in edit mode */}
      {initialPackage && (
        <div className="mb-4">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
            <Package2 className="w-4 h-4 mr-1.5 text-red-500" />
            Package ID
          </label>
          <div className="relative">
            <input
              type="text"
              name="packageID"
              value={formData.packageID}
              readOnly
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 bg-gray-50 rounded-lg text-gray-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          {errors.packageID && <p className="mt-1.5 text-sm text-red-600">{errors.packageID}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Package Name */}
        <div className="col-span-1">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
            <Package2 className="w-4 h-4 mr-1.5 text-red-500" />
            Package Name*
          </label>
          <div className="relative">
            <input
              type="text"
              name="packageName"
              value={formData.packageName}
              onChange={handleChange}
              onBlur={handleBlur}
              readOnly={isEditMode && isCustomPackage}
              className={`block w-full rounded-lg border ${
                isEditMode && isCustomPackage ? 'bg-gray-50 text-gray-500' : 
                errors.packageName ? 'border-red-300 bg-red-50' : 
                touched.packageName && !errors.packageName ? 'border-green-300 bg-green-50' : 
                'border-gray-300'
              }
                py-2.5 px-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200`}
              placeholder="Enter package name"
            />
            {touched.packageName && !isCustomPackage && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {errors.packageName ? 
                  <AlertCircle className="h-5 w-5 text-red-500" /> : 
                  <CheckCircle className="h-5 w-5 text-green-500" />
                }
              </div>
            )}
          </div>
          {errors.packageName && <p className="mt-1.5 text-sm text-red-600">{errors.packageName}</p>}
        </div>

        {/* Price */}
        <div className="col-span-1">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
            <DollarSign className="w-4 h-4 mr-1.5 text-red-500" />
            Price (Rs.)
          </label>
          <div className="relative">
            <input
              type="number"
              name="price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full rounded-lg border ${errors.price ? 'border-red-300 bg-red-50' : touched.price && !errors.price ? 'border-green-300 bg-green-50' : 'border-gray-300'}
                py-2.5 px-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200`}
              placeholder="Leave empty for custom quotes"
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
          {errors.price && <p className="mt-1.5 text-sm text-red-600">{errors.price}</p>}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
          <FileText className="w-4 h-4 mr-1.5 text-red-500" />
          Description*
        </label>
        <div className="relative">
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            readOnly={isEditMode && isCustomPackage}
            rows={4}
            className={`block w-full rounded-lg border ${
              isEditMode && isCustomPackage ? 'bg-gray-50 text-gray-500' : 
              errors.description ? 'border-red-300 bg-red-50' : 
              touched.description && !errors.description ? 'border-green-300 bg-green-50' : 
              'border-gray-300'
            }
              py-2.5 px-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200`}
            placeholder="Provide a detailed description of the package..."
          />
          {touched.description && !isCustomPackage && (
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

      {/* Image Upload Section */}
      <div className="bg-gray-50 rounded-xl p-5">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
          <Image className="w-4 h-4 mr-1.5 text-red-500" />
          Upload Image
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="w-32 h-32 border rounded-lg overflow-hidden bg-white shadow-sm">
            <img src={imagePreview} alt="Preview" className="object-cover w-full h-full transition-all duration-300 hover:scale-110" />
          </div>
          <div className="flex-1">
            <label className="cursor-pointer inline-flex items-center px-4 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-sm transition-all duration-200">
              <Upload className="w-4 h-4 mr-2" />
              Choose File
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
            <p className="text-xs text-gray-500 mt-2">Recommended size: 800x600px, max 2MB</p>
          </div>
        </div>
      </div>

      {/* Performances */}
      <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-200">
        <h3 className="flex items-center text-base font-semibold text-gray-800">
          <Music className="w-5 h-5 mr-2 text-red-500" />
          Performances
        </h3>
        
        {formData.performances.map((performance, index) => (
          <div 
            key={index} 
            className="relative p-4 bg-white rounded-lg border border-gray-100 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Performance Type*</label>
                <div className="relative">
                  <input
                    type="text"
                    value={performance.type}
                    onChange={(e) => handlePerformanceChange(index, 'type', e.target.value)}
                    onBlur={(e) => handlePerformanceBlur(index, 'type', e.target.value)}
                    className={`block w-full rounded-lg border ${
                      isEditMode && isCustomPackage ? 'bg-gray-50 text-gray-500' : 
                      errors[`performances.${index}.type`] ? 'border-red-300 bg-red-50' : 
                      touched[`performances.${index}.type`] && !errors[`performances.${index}.type`] ? 'border-green-300 bg-green-50' : 
                      'border-gray-300'
                    }
                      py-2 px-3 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200`}
                    placeholder="e.g., Traditional Dance"
                    readOnly={isEditMode && isCustomPackage}
                  />
                  {touched[`performances.${index}.type`] && !isCustomPackage && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {errors[`performances.${index}.type`] ? 
                        <AlertCircle className="h-4 w-4 text-red-500" /> : 
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      }
                    </div>
                  )}
                </div>
                {errors[`performances.${index}.type`] && <p className="text-red-500 text-xs mt-1">{errors[`performances.${index}.type`]}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Duration*</label>
                <div className="relative">
                  <input
                    type="text"
                    value={performance.duration}
                    onChange={(e) => handlePerformanceChange(index, 'duration', e.target.value)}
                    onBlur={(e) => handlePerformanceBlur(index, 'duration', e.target.value)}
                    className={`block w-full rounded-lg border ${
                      isEditMode && isCustomPackage ? 'bg-gray-50 text-gray-500' : 
                      errors[`performances.${index}.duration`] ? 'border-red-300 bg-red-50' : 
                      touched[`performances.${index}.duration`] && !errors[`performances.${index}.duration`] ? 'border-green-300 bg-green-50' : 
                      'border-gray-300'
                    }
                      py-2 px-3 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200`}
                    placeholder="e.g., 30 minutes"
                    readOnly={isEditMode && isCustomPackage}
                  />
                  {touched[`performances.${index}.duration`] && !isCustomPackage && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {errors[`performances.${index}.duration`] ? 
                        <AlertCircle className="h-4 w-4 text-red-500" /> : 
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      }
                    </div>
                  )}
                </div>
                {errors[`performances.${index}.duration`] && <p className="text-red-500 text-xs mt-1">{errors[`performances.${index}.duration`]}</p>}
              </div>
            </div>
            
            {!isCustomPackage && formData.performances.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('performances', index)}
                className="absolute -top-3 -right-3 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
        
        {!isCustomPackage && (
          <div className="flex justify-center">
            <motion.button
              type="button"
              onClick={() => addArrayItem('performances', { type: '', duration: '' })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors text-sm font-medium"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Add Performance
            </motion.button>
          </div>
        )}
      </div>

      {/* Dance Styles */}
      <div className="space-y-3 bg-white p-5 rounded-xl border border-gray-200">
        <h3 className="flex items-center text-base font-semibold text-gray-800">
          <Tag className="w-5 h-5 mr-2 text-red-500" />
          Dance Styles
        </h3>
        <div className="space-y-2">
          {formData.danceStyles.map((style, index) => (
            <div key={index} className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={style}
                  onChange={(e) => handleArrayChange('danceStyles', index, e.target.value)}
                  onBlur={(e) => handleArrayBlur('danceStyles', index, e.target.value)}
                  className={`block w-full rounded-lg border ${
                    isEditMode && isCustomPackage ? 'bg-gray-50 text-gray-500' : 
                    errors[`danceStyles.${index}`] ? 'border-red-300 bg-red-50' : 
                    touched[`danceStyles.${index}`] && !errors[`danceStyles.${index}`] ? 'border-green-300 bg-green-50' : 
                    'border-gray-300'
                  }
                    py-2 px-3 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200`}
                  placeholder="e.g., Kandyan Dance"
                  readOnly={isEditMode && isCustomPackage}
                />
                {touched[`danceStyles.${index}`] && !isCustomPackage && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {errors[`danceStyles.${index}`] ? 
                      <AlertCircle className="h-4 w-4 text-red-500" /> : 
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    }
                  </div>
                )}
              </div>
              {errors[`danceStyles.${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`danceStyles.${index}`]}</p>}
              
              {!isCustomPackage && formData.danceStyles.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('danceStyles', index)}
                  className="absolute top-1/2 -translate-y-1/2 -right-7 text-red-400 hover:text-red-600 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        
        {!isCustomPackage && (
          <div className="flex justify-center mt-3">
            <motion.button
              type="button"
              onClick={() => addArrayItem('danceStyles', '')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors text-sm font-medium"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Add Dance Style
            </motion.button>
          </div>
        )}
      </div>

      {/* Team Involvement */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
          <Users className="w-4 h-4 mr-1.5 text-red-500" />
          Team Involvement*
        </label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Male Dancers</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={formData.teamInvolvement.maleDancers}
                onChange={(e) => handleNestedChange('teamInvolvement', 'maleDancers', parseInt(e.target.value))}
                onBlur={(e) => handleNestedBlur('teamInvolvement', 'maleDancers', parseInt(e.target.value))}
                className={`block w-full rounded-lg border ${errors['teamInvolvement.maleDancers'] ? 'border-red-300 bg-red-50' : touched['teamInvolvement.maleDancers'] && !errors['teamInvolvement.maleDancers'] ? 'border-green-300 bg-green-50' : 'border-gray-300'}
                  py-2 px-3 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200`}
              />
              {touched['teamInvolvement.maleDancers'] && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {errors['teamInvolvement.maleDancers'] ? 
                    <AlertCircle className="h-4 w-4 text-red-500" /> : 
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  }
                </div>
              )}
            </div>
            {errors['teamInvolvement.maleDancers'] && <p className="text-red-500 text-xs mt-1">{errors['teamInvolvement.maleDancers']}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Female Dancers</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={formData.teamInvolvement.femaleDancers}
                onChange={(e) => handleNestedChange('teamInvolvement', 'femaleDancers', parseInt(e.target.value))}
                onBlur={(e) => handleNestedBlur('teamInvolvement', 'femaleDancers', parseInt(e.target.value))}
                className={`block w-full rounded-lg border ${errors['teamInvolvement.femaleDancers'] ? 'border-red-300 bg-red-50' : touched['teamInvolvement.femaleDancers'] && !errors['teamInvolvement.femaleDancers'] ? 'border-green-300 bg-green-50' : 'border-gray-300'}
                  py-2 px-3 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200`}
              />
              {touched['teamInvolvement.femaleDancers'] && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {errors['teamInvolvement.femaleDancers'] ? 
                    <AlertCircle className="h-4 w-4 text-red-500" /> : 
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  }
                </div>
              )}
            </div>
            {errors['teamInvolvement.femaleDancers'] && <p className="text-red-500 text-xs mt-1">{errors['teamInvolvement.femaleDancers']}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Choreographers*</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={formData.teamInvolvement.choreographers}
                onChange={(e) => handleNestedChange('teamInvolvement', 'choreographers', parseInt(e.target.value))}
                onBlur={(e) => handleNestedBlur('teamInvolvement', 'choreographers', parseInt(e.target.value))}
                className={`block w-full rounded-lg border ${errors['teamInvolvement.choreographers'] ? 'border-red-300 bg-red-50' : touched['teamInvolvement.choreographers'] && !errors['teamInvolvement.choreographers'] ? 'border-green-300 bg-green-50' : 'border-gray-300'}
                  py-2 px-3 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200`}
              />
              {touched['teamInvolvement.choreographers'] && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {errors['teamInvolvement.choreographers'] ? 
                    <AlertCircle className="h-4 w-4 text-red-500" /> : 
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  }
                </div>
              )}
            </div>
            {errors['teamInvolvement.choreographers'] && <p className="text-red-500 text-xs mt-1">{errors['teamInvolvement.choreographers']}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">MCs</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={formData.teamInvolvement.MC}
                onChange={(e) => handleNestedChange('teamInvolvement', 'MC', parseInt(e.target.value))}
                onBlur={(e) => handleNestedBlur('teamInvolvement', 'MC', parseInt(e.target.value))}
                className={`block w-full rounded-lg border ${errors['teamInvolvement.MC'] ? 'border-red-300 bg-red-50' : touched['teamInvolvement.MC'] && !errors['teamInvolvement.MC'] ? 'border-green-300 bg-green-50' : 'border-gray-300'}
                  py-2 px-3 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200`}
              />
              {touched['teamInvolvement.MC'] && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {errors['teamInvolvement.MC'] ? 
                    <AlertCircle className="h-4 w-4 text-red-500" /> : 
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  }
                </div>
              )}
            </div>
            {errors['teamInvolvement.MC'] && <p className="text-red-500 text-xs mt-1">{errors['teamInvolvement.MC']}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Travel Fees */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
            <DollarSign className="w-4 h-4 mr-1.5 text-red-500" />
            Travel Fees (Rs.)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.01"
              name="travelFees"
              value={formData.travelFees}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full rounded-lg border ${errors.travelFees ? 'border-red-300 bg-red-50' : touched.travelFees && !errors.travelFees ? 'border-green-300 bg-green-50' : 'border-gray-300'}
                py-2.5 px-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200`}
              placeholder="0.00"
            />
            {touched.travelFees && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {errors.travelFees ? 
                  <AlertCircle className="h-5 w-5 text-red-500" /> : 
                  <CheckCircle className="h-5 w-5 text-green-500" />
                }
              </div>
            )}
          </div>
          {errors.travelFees && <p className="mt-1.5 text-sm text-red-600">{errors.travelFees}</p>}
        </div>

        {/* Package Type */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
            <Package2 className="w-4 h-4 mr-1.5 text-red-500" />
            Package Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isEditMode} // Only editable when creating a new package
            className={`w-full p-2.5 border rounded-lg ${
              isEditMode ? 'bg-gray-50 text-gray-500 border-gray-300' : 
              'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
            }`}
          >
            <option value="system">System</option>
            <option value="custom">Custom</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {isEditMode ? "Package type cannot be changed after creation" : "Select 'Custom' for client-specific packages"}
          </p>
        </div>
      </div>

      {/* Booking Terms */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
          <MessageSquare className="w-4 h-4 mr-1.5 text-red-500" />
          Booking Terms*
        </label>
        <div className="relative">
          <textarea
            name="bookingTerms"
            value={formData.bookingTerms}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={3}
            className={`block w-full rounded-lg border ${errors.bookingTerms ? 'border-red-300 bg-red-50' : touched.bookingTerms && !errors.bookingTerms ? 'border-green-300 bg-green-50' : 'border-gray-300'}
              py-2.5 px-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200`}
            placeholder="Enter the terms and conditions for booking this package..."
          />
          {touched.bookingTerms && (
            <div className="absolute top-3 right-3 pointer-events-none">
              {errors.bookingTerms ? 
                <AlertCircle className="h-5 w-5 text-red-500" /> : 
                <CheckCircle className="h-5 w-5 text-green-500" />
              }
            </div>
          )}
        </div>
        {errors.bookingTerms ? (
          <p className="mt-1.5 text-sm text-red-600">{errors.bookingTerms}</p>
        ) : (
          <p className="mt-1.5 text-xs text-gray-500">Minimum 10 characters required</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
        <motion.button
          type="button"
          onClick={onCancel}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </motion.button>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow-md hover:shadow-lg transition-all ${isSubmitting ? 'opacity-70' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (initialPackage ? 'Update Package' : 'Create Package')}
        </motion.button>
      </div>
    </motion.form>
  );
};

export default PackageForm;
