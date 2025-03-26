import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const AdminMembersList = () => {
  const [members, setMembers] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:4000/api/users')
      .then(res => res.json())
      .then(data => {
        // Assuming data is an array of users
        if (Array.isArray(data)) {
          // Filter only those with role "member"
          const filtered = data.filter(user => user.role === 'member');
          setMembers(filtered);
        } else {
          setErrorMsg("Unexpected data format");
        }
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg("Error fetching members: " + err.message);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this member? This will also remove their associated application."
    );
    if (!confirmDelete) return;
  
    try {
      const res = await fetch(`http://localhost:4000/api/users/members/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        // Remove deleted member from the list
        setMembers(prev => prev.filter(member => member._id !== id));
      } else {
        alert(data.message || 'Error deleting member.');
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gray-100 p-6 border-b border-gray-200">
          <h2 className="text-3xl font-bold text-center text-gray-800">Members</h2>
        </div>
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-center">
            {errorMsg}
          </div>
        )}
        {!loading && members.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-xl">No members found.</p>
          </div>
        )}
        {!loading && members.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  {/* New "View Details" column */}
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    View Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map(member => (
                  <tr key={member._id} className="hover:bg-gray-50 transition duration-300 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {member.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.email}
                    </td>
                    {/* New View Details Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
  <Link
    to={`/admin/finalized/${member.profileId}`}
    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
  >
    View Details
  </Link>
</td>
<td className="px-6 py-4 whitespace-nowrap text-sm">
  <button 
    onClick={() => handleDelete(member._id)}
    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
  >
    Delete
  </button>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMembersList;