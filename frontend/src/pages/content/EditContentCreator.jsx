import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const EditContentCreator = () => {
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phoneNumber: ''
    },
    creatorDetails: {
      specialization: '',
      skills: []
    },
    projectProposal: {
      contentType: '',
      title: '',
      description: ''
    },
    agreement: {
      termsAccepted: false,
      paymentTerms: '',
      deliveryTimeline: ''
    },
    status: 'Pending'
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch content creator details when component mounts
  useEffect(() => {
    const fetchContentCreator = async () => {
      try {
        const response = await axiosInstance.get(`/api/content-creators/${id}`);
        setFormData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch content creator details');
        setLoading(false);
      }
    };

    fetchContentCreator();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const [section, field] = name.split('.');

    if (section === 'personalInfo' || section === 'creatorDetails' || section === 'projectProposal') {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else if (section === 'agreement') {
      setFormData(prev => ({
        ...prev,
        agreement: {
          ...prev.agreement,
          [name.split('.')[1]]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle skills input (comma-separated)
  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim());
    setFormData(prev => ({
      ...prev,
      creatorDetails: {
        ...prev.creatorDetails,
        skills
      }
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/api/content-creators/${id}`, formData);
      
      // Show success message
      alert('Content creator updated successfully');
      
      // Redirect to content creator list or details page
      navigate(`/content-creators/view/${id}`);
    } catch (err) {
      // Handle error
      setError('Failed to update content creator');
      alert('Failed to update content creator');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/content-creators/view/${id}`);
  };

  // Loading state
  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  // Error state
  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Content Creator</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        {/* Personal Information Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="personalInfo.fullName"
              value={formData.personalInfo.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              className="border rounded w-full py-2 px-3"
              required
            />
            <input
              type="email"
              name="personalInfo.email"
              value={formData.personalInfo.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="border rounded w-full py-2 px-3"
              required
            />
            <input
              type="tel"
              name="personalInfo.phoneNumber"
              value={formData.personalInfo.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
              className="border rounded w-full py-2 px-3"
              required
            />
          </div>
        </div>

        {/* Creator Details Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Creator Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="creatorDetails.specialization"
              value={formData.creatorDetails.specialization}
              onChange={handleChange}
              placeholder="Specialization"
              className="border rounded w-full py-2 px-3"
              required
            />
            <input
              type="text"
              placeholder="Skills (comma-separated)"
              value={formData.creatorDetails.skills.join(', ')}
              onChange={handleSkillsChange}
              className="border rounded w-full py-2 px-3"
            />
          </div>
        </div>

        {/* Project Proposal Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Project Proposal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="projectProposal.contentType"
              value={formData.projectProposal.contentType}
              onChange={handleChange}
              className="border rounded w-full py-2 px-3"
              required
            >
              <option value="">Select Content Type</option>
              <option value="Blog">Blog</option>
              <option value="Video">Video</option>
              <option value="Podcast">Podcast</option>
              <option value="Infographic">Infographic</option>
              <option value="Social Media">Social Media</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="text"
              name="projectProposal.title"
              value={formData.projectProposal.title}
              onChange={handleChange}
              placeholder="Project Title"
              className="border rounded w-full py-2 px-3"
              required
            />
          </div>
          <textarea
            name="projectProposal.description"
            value={formData.projectProposal.description}
            onChange={handleChange}
            placeholder="Project Description"
            className="border rounded w-full py-2 px-3 mt-4"
            rows="4"
            required
          />
        </div>

        {/* Status Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="border rounded w-full py-2 px-3"
          >
            <option value="Pending">Pending</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Agreement Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Agreement & Terms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="agreement.paymentTerms"
              value={formData.agreement.paymentTerms}
              onChange={handleChange}
              placeholder="Payment Terms"
              className="border rounded w-full py-2 px-3"
            />
            <input
              type="text"
              name="agreement.deliveryTimeline"
              value={formData.agreement.deliveryTimeline}
              onChange={handleChange}
              placeholder="Delivery Timeline"
              className="border rounded w-full py-2 px-3"
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                name="agreement.termsAccepted"
                checked={formData.agreement.termsAccepted}
                onChange={handleChange}
                className="mr-2"
              />
              <label>I accept the terms and conditions</label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Update Content Creator
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditContentCreator;