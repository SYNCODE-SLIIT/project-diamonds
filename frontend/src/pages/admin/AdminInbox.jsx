import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';

const AdminInbox = () => {
  const { user } = useContext(UserContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const lastCountsRef = useRef([]);

  // Fetch initial groups and store unread counts
  const fetchGroupsInit = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/chat-groups/user/${user._id}`);
      const data = await res.json();
      const gs = data.groups || [];
      setGroups(gs);
      lastCountsRef.current = gs.map(g => `${g._id}:${g.unreadCount}`);
    } catch (err) {
      setErrorMsg("Error fetching groups: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Poll only when unread counts change
  const pollGroups = async () => {
    if (!user?._id) return;
    try {
      const res = await fetch(`http://localhost:4000/api/chat-groups/user/${user._id}`);
      const data = await res.json();
      const newGroups = data.groups || [];
      const newCounts = newGroups.map(g => `${g._id}:${g.unreadCount}`);
      if (JSON.stringify(newCounts) !== JSON.stringify(lastCountsRef.current)) {
        setGroups(newGroups);
        lastCountsRef.current = newCounts;
      }
    } catch {
      // ignore errors
    }
  };

  useEffect(() => {
    fetchGroupsInit();
    const interval = setInterval(pollGroups, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const handleDeleteGroup = async (groupId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this group?");
    if (!confirmDelete) return;
    try {
      const res = await fetch(`http://localhost:4000/api/chat-groups/${groupId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        // Remove the group from the state so the list updates
        setGroups(prev => prev.filter(g => g._id !== groupId));
      } else {
        alert(data.message || "Error deleting group.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

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
                  Unread
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {group.unreadCount > 0 ? (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                        {group.unreadCount}
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <Link 
                      to={`/admin/chat/${group._id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                    >
                      View Group
                    </Link>
                    <Link 
                      to={`/admin/groups/${group._id}/members`}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300"
                    >
                      View Members
                    </Link>
                    <button 
                      onClick={() => handleDeleteGroup(group._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
                    >
                      Delete Group
                    </button>
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