import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const GroupCreation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    groupName: '',
    description: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [allMembers, setAllMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/users');
        const data = await res.json();
        const members = data.filter((u) => u.role === 'member');
        setAllMembers(members);
      } catch (err) {
        console.error('Error fetching members:', err);
      }
    };
    fetchMembers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const memberId = e.target.value;
    if (e.target.checked) {
      setSelectedMembers((prev) => [...prev, memberId]);
    } else {
      setSelectedMembers((prev) => prev.filter((id) => id !== memberId));
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const adminId = "67e0f270314253356851facb";

    let groupMembers = [...selectedMembers];
    if (!groupMembers.includes(adminId)) {
      groupMembers.unshift(adminId);
    }

    const payload = {
      groupName: formData.groupName,
      description: formData.description,
      createdBy: adminId,
      members: groupMembers
    };

    try {
      const res = await fetch('http://localhost:4000/api/chat-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Chat group created successfully!');
        setFormData({ groupName: '', description: '' });
        setSelectedMembers([]);
        navigate(`/admin/inbox`);
      } else {
        setErrorMsg(data.message || 'Error creating chat group');
      }
    } catch (err) {
      setErrorMsg("Error: " + err.message);
      console.error("Error creating chat group:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      {/* Header Section */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <Link to="/admin/inbox" className="text-[#1c4b82] hover:underline mr-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Inbox
          </Link>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-gray-600">Create New Group</span>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">Create New Chat Group</h2>
        <p className="text-gray-500 mt-1">Set up a new group conversation</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0d253f] to-[#1c4b82] p-4">
          <h3 className="text-lg font-medium text-white">Group Details</h3>
        </div>

        <form onSubmit={handleCreateGroup} className="p-6 space-y-6">
          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 text-sm">{errorMsg}</p>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-700 text-sm">{successMsg}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Group Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Name<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="groupName"
                value={formData.groupName}
                onChange={handleChange}
                required
                placeholder="Enter group name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c4b82] focus:border-[#1c4b82] text-sm"
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description<span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe the purpose of this group"
                rows="4"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c4b82] focus:border-[#1c4b82] text-sm"
              ></textarea>
            </div>

            {/* Members Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Members
              </label>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Selected: <span className="font-medium text-[#1c4b82]">{selectedMembers.length}</span> members
                    </span>
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                  {allMembers.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="w-12 h-12 bg-blue-50 rounded-full mx-auto flex items-center justify-center mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1c4b82]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">No members found</p>
                    </div>
                  ) : (
                    allMembers.map((member) => (
                      <div 
                        key={member._id} 
                        className={`
                          p-3 border rounded-lg flex items-center space-x-3 cursor-pointer
                          ${selectedMembers.includes(member._id) 
                            ? 'border-[#1c4b82] bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'}
                          transition-colors
                        `}
                        onClick={() => {
                          if (selectedMembers.includes(member._id)) {
                            setSelectedMembers(prev => prev.filter(id => id !== member._id));
                          } else {
                            setSelectedMembers(prev => [...prev, member._id]);
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          value={member._id}
                          checked={selectedMembers.includes(member._id)}
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
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100">
            <Link
              to="/admin/inbox"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="bg-gradient-to-r from-[#0d253f] to-[#1c4b82] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#1c4b82] focus:ring-opacity-50 text-sm font-medium"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupCreation;