import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlusIcon, 
  InformationCircleIcon, 
  UsersIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

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
        // Filter for members only
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
  
    // Default admin ID to be included in the members list.
    const adminId = "67e0f270314253356851facb";
  
    // Ensure the admin is included in the group members by default.
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl bg-white shadow-2xl rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 flex items-center text-white">
          <UserPlusIcon className="w-10 h-10 mr-4" />
          <h1 className="text-2xl font-bold">Create Chat Group</h1>
        </div>

        <form onSubmit={handleCreateGroup} className="p-6 space-y-6">
          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-3" />
              <p className="text-red-700">{errorMsg}</p>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 flex items-center">
              <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />
              <p className="text-green-700">{successMsg}</p>
            </div>
          )}

          {/* Group Name Input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Group Name<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="groupName"
                value={formData.groupName}
                onChange={handleChange}
                required
                placeholder="Enter group name"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
              />
              <InformationCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Description<span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe your group"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
            ></textarea>
          </div>

          {/* Members Selection */}
          <div>
            <label className=" text-gray-700 font-semibold mb-2 flex items-center">
              <UsersIcon className="w-5 h-5 mr-2" />
              Select Members
            </label>
            <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto p-3 bg-gray-50">
              {allMembers.length === 0 ? (
                <p className="text-gray-500 text-center">No members found.</p>
              ) : (
                allMembers.map((member) => (
                  <div 
                    key={member._id} 
                    className="flex items-center hover:bg-blue-50 p-2 rounded transition duration-200"
                  >
                    <input
                      type="checkbox"
                      value={member._id}
                      onChange={handleCheckboxChange}
                      className="mr-3 text-blue-600 focus:ring-blue-500 rounded"
                      checked={selectedMembers.includes(member._id)}
                    />
                    <span className="text-gray-700">
                      {member.fullName} 
                      <span className="text-gray-500 text-sm ml-2">({member.email})</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 rounded-lg 
            hover:from-blue-700 hover:to-blue-500 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
            transition duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroupCreation;