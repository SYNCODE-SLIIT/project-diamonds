import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const ContentCreatorList = () => {
  const [contentCreators, setContentCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContentCreators = async () => {
      try {
        const response = await axiosInstance.get('/api/content-creators/get');
        setContentCreators(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch content creators');
        setLoading(false);
      }
    };

    fetchContentCreators();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this content creator?')) {
      try {
        await axiosInstance.delete(`/api/content-creators/${id}`);
        setContentCreators(contentCreators.filter(creator => creator._id !== id));
      } catch (err) {
        alert('Failed to delete content creator');
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Content Creators</h1>
        <Link 
          to="/content-creators/new" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Content Creator
        </Link>
      </div>

      {/* Creator Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentCreators.map((creator) => (
          <div key={creator._id} className="bg-white shadow-lg rounded-lg p-6 flex flex-col">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-500">
                {creator.personalInfo.fullName.charAt(0)}
              </div>
              <h3 className="ml-4 text-lg font-semibold">{creator.personalInfo.fullName}</h3>
            </div>
            <p className="text-gray-600">{creator.personalInfo.email}</p>
            <p className="text-gray-600 mt-1">Specialization: {creator.creatorDetails.specialization}</p>
            <span className={`mt-4 inline-block px-2 py-1 text-xs font-medium rounded-full ${
              creator.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
              creator.status === 'Active' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>{creator.status}</span>
            <div className="mt-auto pt-4 flex space-x-2">
              <Link to={`/content-creators/view/${creator._id}`} className="flex-1 text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition">
                View
              </Link>
              <Link to={`/content-creators/edit/${creator._id}`} className="flex-1 text-center bg-green-500 text-white py-2 rounded hover:bg-green-600 transition">
                Edit
              </Link>
              <button onClick={() => handleDelete(creator._id)} className="flex-1 text-center bg-red-500 text-white py-2 rounded hover:bg-red-600 transition">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentCreatorList;