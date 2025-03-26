import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ViewOrganizerDetails = () => {
  const { id } = useParams(); // Organizer ID (this should match the organizer document _id)
  const navigate = useNavigate();
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch(`http://localhost:4000/api/organizers/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setOrganizer(data);
        } else {
          setErrorMsg("Organizer not found.");
        }
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg("Error fetching organizer: " + err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (errorMsg)
    return (
      <div className="container mx-auto px-4 py-8 text-red-600">
        {errorMsg}
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gray-100 p-6 border-b border-gray-200">
          <h2 className="text-3xl font-bold text-center text-gray-800">Organizer Details</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <p className="mt-1 text-sm text-gray-900">{organizer.fullName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{organizer.email}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Organization Name</label>
              <p className="mt-1 text-sm text-gray-900">{organizer.organizationName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Number</label>
              <p className="mt-1 text-sm text-gray-900">{organizer.contactNumber}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Business Address</label>
            <p className="mt-1 text-sm text-gray-900">{organizer.businessAddress}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <p className="mt-1 text-sm text-gray-900">{organizer.website}</p>
          </div>
        </div>
        <div className="p-6 flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewOrganizerDetails;