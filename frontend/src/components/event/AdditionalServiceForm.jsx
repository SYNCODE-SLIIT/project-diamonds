import React, { useState, useEffect } from 'react';

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const formattedData = { ...formData, price: Number(formData.price) };
        await onSubmit(formattedData);
      } catch (error) {
        console.error('Error submitting form data:', error);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded px-8 py-6 mt-4 border">
      <h3 className="text-lg font-medium mb-4">
        {service ? 'Edit Additional Service' : 'Add Additional Service'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Service ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Service ID:</label>
          <input
            type="text"
            name="serviceID"
            value={formData.serviceID}
            onChange={handleChange}
            disabled={!!service}
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.serviceID && (
            <p className="text-sm text-red-500 mt-1">{errors.serviceID}</p>
          )}
        </div>

        {/* Service Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Service Name:</label>
          <input
            type="text"
            name="serviceName"
            value={formData.serviceName}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.serviceName && (
            <p className="text-sm text-red-500 mt-1">{errors.serviceName}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">{errors.description}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Price:</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.price && (
            <p className="text-sm text-red-500 mt-1">{errors.price}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
        <div>
          <label className="block text-sm font-medium text-gray-700">Availability:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="available">available</option>
            <option value="unavailable">unavailable</option>
          </select>
          {errors.status && (
            <p className="text-sm text-red-500 mt-1">{errors.status}</p>
          )}
        </div>

        {/* Created By */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Created By:</label>
          <input
            type="text"
            name="createdBy"
            value={formData.createdBy}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.createdBy && (
            <p className="text-sm text-red-500 mt-1">{errors.createdBy}</p>
          )}
        </div>

        {/* Form Buttons */}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            {service ? 'Update Service' : 'Add Service'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdditionalServiceForm;
