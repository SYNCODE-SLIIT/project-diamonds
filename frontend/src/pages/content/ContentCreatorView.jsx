import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const ContentCreatorView = () => {
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContentCreator = async () => {
      try {
        const response = await axiosInstance.get(`/api/content-creators/${id}`);
        setCreator(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch content creator details');
        setLoading(false);
      }
    };

    fetchContentCreator();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this content creator?')) {
      try {
        await axiosInstance.delete(`/api/content-creators/${id}`);
        navigate('/content-creators');
      } catch (err) {
        alert('Failed to delete content creator');
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!creator) return <div>No content creator found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
          <h1 className="text-2xl font-bold">{creator.personalInfo.fullName}</h1>
          <div className="space-x-2">
            <Link 
              to={`/content-creators/edit/${id}`} 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Edit
            </Link>
            <button 
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Personal Information */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <strong>Full Name:</strong>
              <p>{creator.personalInfo.fullName}</p>
            </div>
            <div>
              <strong>Email:</strong>
              <p>{creator.personalInfo.email}</p>
            </div>
            <div>
              <strong>Phone Number:</strong>
              <p>{creator.personalInfo.phoneNumber}</p>
            </div>
          </div>
        </div>

        {/* Creator Details */}
        <div className="p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Creator Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <strong>Specialization:</strong>
              <p>{creator.creatorDetails.specialization}</p>
            </div>
            <div>
              <strong>Skills:</strong>
              <p>{creator.creatorDetails.skills.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Project Proposal */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Project Proposal</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <strong>Content Type:</strong>
              <p>{creator.projectProposal.contentType}</p>
            </div>
            <div>
              <strong>Project Title:</strong>
              <p>{creator.projectProposal.title}</p>
            </div>
          </div>
          <div className="mt-4">
            <strong>Project Description:</strong>
            <p>{creator.projectProposal.description}</p>
          </div>
        </div>

        {/* Agreement & Terms */}
        <div className="p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Agreement & Terms</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <strong>Payment Terms:</strong>
              <p>{creator.agreement.paymentTerms || 'Not specified'}</p>
            </div>
            <div>
              <strong>Delivery Timeline:</strong>
              <p>{creator.agreement.deliveryTimeline || 'Not specified'}</p>
            </div>
            <div>
              <strong>Terms Accepted:</strong>
              <p>{creator.agreement.termsAccepted ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCreatorView;