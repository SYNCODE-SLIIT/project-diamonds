import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const ContentCreatorForm = () => {
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
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      // Fetch content creator details for editing using a GET request
      const fetchContentCreator = async () => {
        try {
          const response = await axiosInstance.post(`/api/content-creators/c`);
          setFormData(response.data);
          setIsEditing(true);
        } catch (err) {
          alert('Failed to fetch content creator details');
        }
      };
      fetchContentCreator();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const [section, field] = name.split('.');

    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: type === 'checkbox' ? checked : value
      }
    }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axiosInstance.put(`/api/content-creators/${id}`, formData);
        alert('Content creator updated successfully');
      } else {
        await axiosInstance.post('/api/content-creators', formData);
        alert('Content creator created successfully');
      }
      navigate('/admin/content-creators');
    } catch (err) {
      alert('Failed to save content creator');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-extrabold text-center text-indigo-600 mb-8">
          {isEditing ? 'Edit Content Creator' : 'Create Content Creator'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
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
                className="border-2 border-gray-200 rounded-lg w-full py-3 px-4 focus:ring-2 focus:ring-indigo-200 transition"
                required
              />
              <input
                type="email"
                name="personalInfo.email"
                value={formData.personalInfo.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="border-2 border-gray-200 rounded-lg w-full py-3 px-4 focus:ring-2 focus:ring-indigo-200 transition"
                required
              />
              <input
                type="tel"
                name="personalInfo.phoneNumber"
                value={formData.personalInfo.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number"
                className="border-2 border-gray-200 rounded-lg w-full py-3 px-4 focus:ring-2 focus:ring-indigo-200 transition"
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
                className="border-2 border-gray-200 rounded-lg w-full py-3 px-4 focus:ring-2 focus:ring-indigo-200 transition"
                required
              />
              <input
                type="text"
                placeholder="Skills (comma-separated)"
                value={formData.creatorDetails.skills.join(', ')}
                onChange={handleSkillsChange}
                className="border-2 border-gray-200 rounded-lg w-full py-3 px-4 focus:ring-2 focus:ring-indigo-200 transition"
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
                className="border-2 border-gray-200 rounded-lg w-full py-3 px-4 focus:ring-2 focus:ring-indigo-200 transition"
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
                className="border-2 border-gray-200 rounded-lg w-full py-3 px-4 focus:ring-2 focus:ring-indigo-200 transition"
                required
              />
            </div>
            <textarea
              name="projectProposal.description"
              value={formData.projectProposal.description}
              onChange={handleChange}
              placeholder="Project Description"
              className="border-2 border-gray-200 rounded-lg w-full py-3 px-4 focus:ring-2 focus:ring-indigo-200 transition"
              rows="4"
              required
            />
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
                className="border-2 border-gray-200 rounded-lg w-full py-3 px-4 focus:ring-2 focus:ring-indigo-200 transition"
              />
              <input
                type="text"
                name="agreement.deliveryTimeline"
                value={formData.agreement.deliveryTimeline}
                onChange={handleChange}
                placeholder="Delivery Timeline"
                className="border-2 border-gray-200 rounded-lg w-full py-3 px-4 focus:ring-2 focus:ring-indigo-200 transition"
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

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold rounded-lg shadow-md transition"
            >
              {isEditing ? 'Update Content Creator' : 'Create Content Creator'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/content-creators')}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentCreatorForm;
