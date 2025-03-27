// src/components/event/PackageForm.jsx
import React, { useState, useEffect } from 'react';
import { createPackage, updatePackage } from '../../services/packageService.js';

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

  // Handle changes for simple input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  // Validate the form inputs
  const validateForm = () => {
    const newErrors = {};

    // Only validate packageID in edit mode (when initialPackage exists)
    if (initialPackage && !formData.packageID) {
      newErrors.packageID = 'Package ID is required';
    }
    if (!formData.packageName) newErrors.packageName = 'Package name is required';
    if (formData.packageName && (formData.packageName.length < 3 || formData.packageName.length > 100)) {
      newErrors.packageName = 'Package name must be between 3 and 100 characters';
    }
    if (!formData.description) newErrors.description = 'Description is required';
    if (formData.description && (formData.description.length < 10 || formData.description.length > 500)) {
      newErrors.description = 'Description must be between 10 and 500 characters';
    }
    if (!formData.performances.length) {
      newErrors.performances = 'At least one performance is required';
    } else {
      formData.performances.forEach((perf, index) => {
        if (!perf.type) {
          newErrors[`performance_${index}_type`] = 'Performance type is required';
        }
        if (!perf.duration) {
          newErrors[`performance_${index}_duration`] = 'Duration is required';
        } else if (!/^[1-9]\d*\s?(minutes|minute|hours|hour)$/.test(perf.duration)) {
          newErrors[`performance_${index}_duration`] = 'Duration must be in format "X minutes" or "X hours"';
        }
      });
    }
    const validDanceStyles = formData.danceStyles.filter(style => style.trim() !== '');
    if (!validDanceStyles.length) {
      newErrors.danceStyles = 'At least one dance style is required';
    }
    if (formData.teamInvolvement.maleDancers < 0) {
      newErrors.maleDancers = 'Male dancers count cannot be negative';
    }
    if (formData.teamInvolvement.femaleDancers < 0) {
      newErrors.femaleDancers = 'Female dancers count cannot be negative';
    }
    if (formData.teamInvolvement.choreographers < 1) {
      newErrors.choreographers = 'At least one choreographer is required';
    }
    if (formData.teamInvolvement.MC < 0) {
      newErrors.mc = 'MC count cannot be negative';
    }
    if (formData.travelFees < 0) {
      newErrors.travelFees = 'Travel fees cannot be negative';
    }
    if (!formData.bookingTerms) {
      newErrors.bookingTerms = 'Booking terms are required';
    }
    if (formData.bookingTerms && formData.bookingTerms.length < 10) {
      newErrors.bookingTerms = 'Booking terms must be at least 10 characters';
    }
    if (formData.price !== '' && formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }
    if (!formData.type) {
      newErrors.type = 'Package type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {apiError}
        </div>
      )}

      {/* Show Package ID only in edit mode */}
      {initialPackage && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">Package ID*</label>
          <input
            type="text"
            name="packageID"
            value={formData.packageID}
            readOnly
            className="w-full p-2 border rounded bg-gray-100"
          />
          {errors.packageID && <p className="text-red-500 text-sm mt-1">{errors.packageID}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Package Name */}
        <div>
          <label className="block mb-1 font-medium">Package Name*</label>
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
        <label className="block mb-1 font-medium">Description*</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className={`w-full p-2 border rounded ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
        ></textarea>
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      {/* Image Upload Section */}
      <div>
        <label className="block mb-1 font-medium">Upload Image</label>
        <div className="flex items-center gap-4">
          <div className="w-32 h-32 border rounded overflow-hidden">
            <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
          </div>
          <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Choose File
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>
      </div>

      {/* Performances */}
      <div>
        <label className="block mb-2 font-medium">Performances*</label>
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
              {errors[`performance_${index}_type`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`performance_${index}_type`]}</p>
              )}
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Duration (e.g., 30 minutes)"
                value={performance.duration}
                onChange={(e) => handlePerformanceChange(index, 'duration', e.target.value)}
                className={`w-full p-2 border rounded ${errors[`performance_${index}_duration`] ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors[`performance_${index}_duration`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`performance_${index}_duration`]}</p>
              )}
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
        <label className="block mb-2 font-medium">Dance Styles*</label>
        {formData.danceStyles.map((style, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={style}
              onChange={(e) => handleArrayChange('danceStyles', index, e.target.value)}
              className={`flex-1 p-2 border rounded ${errors.danceStyles && index === 0 ? 'border-red-500' : 'border-gray-300'}`}
            />
            {formData.danceStyles.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('danceStyles', index)}
                className="text-red-500 p-2"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('danceStyles', '')}
          className="text-blue-500 mt-2"
        >
          + Add Dance Style
        </button>
        {errors.danceStyles && <p className="text-red-500 text-sm mt-1">{errors.danceStyles}</p>}
      </div>

      {/* Team Involvement */}
      <div>
        <label className="block mb-2 font-medium">Team Involvement*</label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm">Male Dancers</label>
            <input
              type="number"
              min="0"
              value={formData.teamInvolvement.maleDancers}
              onChange={(e) =>
                handleNestedChange('teamInvolvement', 'maleDancers', parseInt(e.target.value))
              }
              className={`w-full p-2 border rounded ${errors.maleDancers ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.maleDancers && <p className="text-red-500 text-sm mt-1">{errors.maleDancers}</p>}
          </div>
          <div>
            <label className="block text-sm">Female Dancers</label>
            <input
              type="number"
              min="0"
              value={formData.teamInvolvement.femaleDancers}
              onChange={(e) =>
                handleNestedChange('teamInvolvement', 'femaleDancers', parseInt(e.target.value))
              }
              className={`w-full p-2 border rounded ${errors.femaleDancers ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.femaleDancers && <p className="text-red-500 text-sm mt-1">{errors.femaleDancers}</p>}
          </div>
          <div>
            <label className="block text-sm">Choreographers*</label>
            <input
              type="number"
              min="1"
              value={formData.teamInvolvement.choreographers}
              onChange={(e) =>
                handleNestedChange('teamInvolvement', 'choreographers', parseInt(e.target.value))
              }
              className={`w-full p-2 border rounded ${errors.choreographers ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.choreographers && <p className="text-red-500 text-sm mt-1">{errors.choreographers}</p>}
          </div>
          <div>
            <label className="block text-sm">MCs</label>
            <input
              type="number"
              min="0"
              value={formData.teamInvolvement.MC}
              onChange={(e) =>
                handleNestedChange('teamInvolvement', 'MC', parseInt(e.target.value))
              }
              className={`w-full p-2 border rounded ${errors.mc ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.mc && <p className="text-red-500 text-sm mt-1">{errors.mc}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Travel Fees */}
        <div>
          <label className="block mb-1 font-medium">Travel Fees (Rs.)</label>
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
          <label className="block mb-1 font-medium">Price (Rs.)</label>
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
        <label className="block mb-1 font-medium">Booking Terms*</label>
        <textarea
          name="bookingTerms"
          value={formData.bookingTerms}
          onChange={handleChange}
          rows="3"
          className={`w-full p-2 border rounded ${errors.bookingTerms ? 'border-red-500' : 'border-gray-300'}`}
        ></textarea>
        {errors.bookingTerms && <p className="text-red-500 text-sm mt-1">{errors.bookingTerms}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Package Type (read-only for admin) */}
        <div>
          <label className="block mb-1 font-medium">Package Type*</label>
          <select
            name="type"
            value={formData.type}
            disabled
            className="w-full p-2 border rounded bg-gray-100"
          >
            <option value="system">System</option>
          </select>
        </div>
        {/* Status (read-only for admin) */}
        <div>
          <label className="block mb-1 font-medium">Status</label>
          <select
            name="status"
            value={formData.status}
            disabled
            className="w-full p-2 border rounded bg-gray-100"
          >
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
