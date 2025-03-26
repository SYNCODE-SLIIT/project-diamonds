// src/pages/content/ViewContentApplication.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const ViewContentApplication = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await axiosInstance.get(`/api/content-application/${id}`);
        setApplication(response.data);
      } catch (error) {
        console.error('Error fetching application:', error);
      }
    };
    fetchApplication();
  }, [id]);

  if (!application) return <div className="text-center p-6">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Application Details</h2>
      <p><strong>Full Name:</strong> {application.fullName}</p>
      <p><strong>Email:</strong> {application.email}</p>
      <p><strong>Phone Number:</strong> {application.phoneNumber}</p>
      <p><strong>Social Media:</strong> {application.socialMedia}</p>
      <p><strong>Experience:</strong> {application.experience}</p>
      <p><strong>Portfolio Link:</strong> {application.portfolioLink}</p>
      <p><strong>Specialization:</strong> {application.specialization}</p>
      <p><strong>Skills:</strong> {application.skills}</p>
      <p><strong>Content Type:</strong> {application.contentType}</p>
      <p><strong>Content Title:</strong> {application.contentTitle}</p>
      <p><strong>Description:</strong> {application.contentDescription}</p>
      <p><strong>Target Audience:</strong> {application.targetAudience}</p>
      <p><strong>Deadline:</strong> {new Date(application.proposedDeadline).toLocaleDateString()}</p>
      <p><strong>Budget:</strong> {application.budget}</p>
      <p><strong>Collaboration Mode:</strong> {application.collaborationMode}</p>
      <p><strong>Work Hours:</strong> {application.workHours}</p>
      <p><strong>Reason for Applying:</strong> {application.reasonForApplying}</p>
      {/* Add other fields as necessary */}
    </div>
  );
};

export default ViewContentApplication;
