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

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Specialization</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contentCreators.map((creator) => (
              <tr key={creator._id} className="border-b">
                <td className="p-3">{creator.personalInfo.fullName}</td>
                <td className="p-3">{creator.personalInfo.email}</td>
                <td className="p-3">{creator.creatorDetails.specialization}</td>
                <td className="p-3">
                  <span className={`
                    px-2 py-1 rounded 
                    ${creator.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' : 
                      creator.status === 'Active' ? 'bg-green-200 text-green-800' : 
                      'bg-red-200 text-red-800'}
                  `}>
                    {creator.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <Link 
                      to={`/content-creators/view/${creator._id}`} 
                      className="text-blue-500 hover:text-blue-700"
                    >
                      View
                    </Link>
                    <Link 
                      to={`/content-creators/edit/${creator._id}`} 
                      className="text-green-500 hover:text-green-700"
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(creator._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContentCreatorList;