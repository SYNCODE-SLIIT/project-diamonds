import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';

const AdminInbox = () => {
  const { user } = useContext(UserContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user._id) {
      fetch(`http://localhost:4000/api/chat-groups/user/${user._id}`)
        .then((res) => {
          if (!res.ok) throw new Error(`Error: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          setGroups(data.groups || []);
          setLoading(false);
        })
        .catch((err) => {
          setErrorMsg("Error fetching groups: " + err.message);
          setLoading(false);
        });
    }
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Top Section: Create Group Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Admin Inbox</h2>
        <button 
          onClick={() => navigate('/admin/messaging/create-group')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Create Group
        </button>
      </div>

      {/* Groups List */}
      {loading && <div className="text-center py-8">Loading groups...</div>}
      {errorMsg && <div className="text-center text-red-500">{errorMsg}</div>}
      {!loading && groups.length === 0 && (
        <div className="text-center text-gray-500">No groups found.</div>
      )}
      {!loading && groups.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groups.map(group => (
                <tr key={group._id} className="hover:bg-gray-50 transition duration-300 ease-in-out">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {group.groupName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {group.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link 
  to={`/admin/chat/${group._id}`}
  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
>
  View Group
</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminInbox;