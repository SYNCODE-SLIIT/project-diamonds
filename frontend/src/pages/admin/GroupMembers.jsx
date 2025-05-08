import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../../context/userContext';

const GroupMembers = () => {
  const { user } = useContext(UserContext);
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [groupDetails, setGroupDetails] = useState(null);
  const [members, setMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch group details and members
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const detailsRes = await fetch(`http://localhost:4000/api/chat-groups/${groupId}`);
        if (!detailsRes.ok) {
          throw new Error(`Error: ${detailsRes.status}`);
        }
        const detailsData = await detailsRes.json();
        setGroupDetails(detailsData.group);
      } catch (err) {
        console.error("Error fetching group details:", err);
      }
    };

    const fetchGroupMembers = async () => {
      try {
        const membersRes = await fetch(`http://localhost:4000/api/chat-groups/${groupId}/members`);
        if (!membersRes.ok) {
          throw new Error(`Error: ${membersRes.status}`);
        }
        const membersData = await membersRes.json();
        setMembers(membersData.members || []);
      } catch (err) {
        setErrorMsg("Error fetching group members: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
    fetchGroupMembers();
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

  // Filter available members based on search term
  const filteredAvailableMembers = availableMembers.filter(member => 
    member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c4b82]"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Link to="/admin/inbox" className="text-[#1c4b82] hover:underline mr-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Inbox
          </Link>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-gray-600">{groupDetails?.groupName || 'Group'} Members</span>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">{groupDetails?.groupName || 'Group'} Members</h2>
        <p className="text-gray-500 mt-1">Manage the members in this group conversation</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Group Members ({members.length})</h3>
          <button
            onClick={toggleAddMembers}
            className="bg-gradient-to-r from-[#0d253f] to-[#1c4b82] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm font-medium"
          >
            {showAddMembers ? "Cancel Adding" : "Add Members"}
          </button>
        </div>
        
        {errorMsg ? (
          <div className="py-8 text-center">
            <p className="text-red-500">{errorMsg}</p>
          </div>
        ) : members.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#1c4b82]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-500">No members found in this group</p>
            <button
              onClick={toggleAddMembers}
              className="mt-4 text-[#1c4b82] hover:underline font-medium text-sm"
            >
              Add your first member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map(member => (
                  <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#0d253f] to-[#1c4b82] rounded-full flex items-center justify-center text-white flex-shrink-0">
                          <span className="text-sm font-medium">
                            {member.fullName?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-800">{member.fullName}</div>
                          {member._id === user._id && (
                            <div className="text-xs text-blue-500">You</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{member.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-[#1c4b82]">
                        {member.role || "Member"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member._id !== user._id ? (
                        <button 
                          onClick={() => handleRemove(member._id)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          Remove
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">Cannot remove yourself</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Members Panel */}
      {showAddMembers && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0d253f] to-[#1c4b82] px-5 py-4">
            <h3 className="text-lg font-medium text-white">Add Members to Group</h3>
          </div>
          
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {availableMembers.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#1c4b82]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <p className="text-gray-500">No available members to add</p>
            </div>
          ) : filteredAvailableMembers.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500">No matching members found</p>
            </div>
          ) : (
            <div className="p-4 max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredAvailableMembers.map(member => (
                  <div 
                    key={member._id} 
                    className={`
                      border rounded-lg p-3 flex items-center space-x-3 cursor-pointer
                      ${selectedToAdd.includes(member._id) 
                        ? 'border-[#1c4b82] bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'}
                      transition-colors
                    `}
                    onClick={() => {
                      if (selectedToAdd.includes(member._id)) {
                        setSelectedToAdd(prev => prev.filter(id => id !== member._id));
                      } else {
                        setSelectedToAdd(prev => [...prev, member._id]);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      value={member._id}
                      checked={selectedToAdd.includes(member._id)}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-[#1c4b82] focus:ring-[#1c4b82] border-gray-300 rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#0d253f] to-[#1c4b82] rounded-full flex items-center justify-center text-white flex-shrink-0">
                        <span className="text-sm font-medium">
                          {member.fullName?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{member.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{member.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-t border-gray-100">
            <div className="text-sm text-gray-600">
              {selectedToAdd.length} {selectedToAdd.length === 1 ? 'member' : 'members'} selected
            </div>
            <button 
              onClick={handleAddSelectedMembers}
              disabled={selectedToAdd.length === 0}
              className={`
                px-4 py-2 rounded-md text-sm font-medium
                ${selectedToAdd.length > 0 
                  ? 'bg-gradient-to-r from-[#0d253f] to-[#1c4b82] text-white hover:opacity-90' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                transition-colors
              `}
            >
              Add to Group
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Return to Group
        </button>
      </div>
    </div>
  );
};

export default GroupMembers;