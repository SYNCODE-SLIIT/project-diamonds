import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const GroupMembers = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState([]);

  // Fetch current group members
  useEffect(() => {
    fetch(`http://localhost:4000/api/chat-groups/${groupId}/members`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setMembers(data.members || []);
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg("Error fetching group members: " + err.message);
        setLoading(false);
      });
  }, [groupId]);

  // Fetch all members (from users) to know who can be added
  const fetchAvailableMembers = () => {
    fetch('http://localhost:4000/api/users')
      .then(res => res.json())
      .then(data => {
        // Filter for users with role 'member'
        const allMembers = data.filter(u => u.role === 'member');
        // Exclude those already in the group
        const available = allMembers.filter(u => !members.some(m => m._id === u._id));
        setAvailableMembers(available);
      })
      .catch(err => {
        console.error("Error fetching available members:", err);
      });
  };

  // Remove a member from the group
  const handleRemove = async (memberId) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this member from the group?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:4000/api/chat-groups/${groupId}/members/remove/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        // Update the members state by filtering out the removed member
        setMembers(prev => prev.filter(m => m._id !== memberId));
      } else {
        alert(data.message || 'Error removing member.');
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Toggle the "Add Members" section and fetch available members if needed
  const toggleAddMembers = () => {
    if (!showAddMembers) {
      fetchAvailableMembers();
    }
    setShowAddMembers(!showAddMembers);
  };

  // Handle checkbox change for available members
  const handleCheckboxChange = (e) => {
    const memberId = e.target.value;
    if (e.target.checked) {
      setSelectedToAdd(prev => [...prev, memberId]);
    } else {
      setSelectedToAdd(prev => prev.filter(id => id !== memberId));
    }
  };

  // Add selected members to the group
  const handleAddSelectedMembers = async () => {
    if (selectedToAdd.length === 0) {
      alert("Please select at least one member to add.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:4000/api/chat-groups/${groupId}/members/add`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberIds: selectedToAdd })
      });
      const data = await res.json();
      if (res.ok) {
        // Update the group members state with the newly added members.
        setMembers(data.group.members);
        // Clear selections and hide add members section
        setSelectedToAdd([]);
        setShowAddMembers(false);
      } else {
        alert(data.message || "Error adding members.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gray-100 p-6 border-b">
          <h2 className="text-3xl font-bold text-center text-gray-800">Group Members</h2>
        </div>
        {errorMsg && <div className="text-center text-red-500 py-4">{errorMsg}</div>}
        {members.length === 0 ? (
          <div className="text-center text-gray-500 py-4">No members found for this group.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map(member => (
                  <tr key={member._id} className="hover:bg-gray-50 transition duration-300 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => handleRemove(member._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Add Members Section */}
        <div className="p-6">
          <button 
            onClick={toggleAddMembers}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            {showAddMembers ? "Hide Add Members" : "Add Members"}
          </button>
          {showAddMembers && (
            <div className="mt-4 border border-gray-300 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Available Members</h3>
              {availableMembers.length === 0 ? (
                <p className="text-gray-500">No available members found.</p>
              ) : (
                <div className="space-y-2">
                  {availableMembers.map(member => (
                    <div key={member._id} className="flex items-center">
                      <input
                        type="checkbox"
                        value={member._id}
                        onChange={handleCheckboxChange}
                        className="mr-3 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <span className="text-gray-700">{member.fullName} ({member.email})</span>
                    </div>
                  ))}
                </div>
              )}
              <button 
                onClick={handleAddSelectedMembers}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300"
              >
                Add Selected Members
              </button>
            </div>
          )}
        </div>
        <div className="p-6 flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupMembers;