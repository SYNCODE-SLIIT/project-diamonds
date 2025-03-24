import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';

const GroupCreation = () => {
  const { user } = useContext(UserContext);
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
        // Filter only members (assuming role is stored as 'member')
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

      // Check if user exists
  if (!user) {
    setErrorMsg("User not found. Please log in.");
    return;
  }

    const payload = {
      groupName: formData.groupName,
      description: formData.description,
      createdBy: user._id,
      members: selectedMembers
    };

    console.log('Creating group with payload:', payload); // Debug log

    try {
      const res = await fetch('http://localhost:4000/api/chat-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log('Response from create group:', data); // Debug log
      if (res.ok) {
        setSuccessMsg('Chat group created successfully!');
        setFormData({ groupName: '', description: '' });
        setSelectedMembers([]);
        navigate(`/messaging/chat/${data.group._id}`);
      } else {
        setErrorMsg(data.message || 'Error creating chat group');
      }
    } catch (err) {
      setErrorMsg("Error: " + err.message);
      console.error("Error creating chat group:", err);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Chat Group</h1>
      {errorMsg && <div className="text-red-600 mb-4">{errorMsg}</div>}
      {successMsg && <div className="text-green-600 mb-4">{successMsg}</div>}
      <form onSubmit={handleCreateGroup} className="space-y-4">
        <div>
          <label className="block font-medium">Group Name:</label>
          <input
            type="text"
            name="groupName"
            value={formData.groupName}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium">Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
            rows="3"
          ></textarea>
        </div>
        <div>
          <label className="block font-medium mb-2">Select Members:</label>
          <div className="border rounded p-2 max-h-60 overflow-y-auto">
            {allMembers.length === 0 ? (
              <p>No members found.</p>
            ) : (
              allMembers.map((member) => (
                <div key={member._id} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    value={member._id}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                    checked={selectedMembers.includes(member._id)}
                  />
                  <span>{member.fullName} ({member.email})</span>
                </div>
              ))
            )}
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Create Group
        </button>
      </form>
    </div>
  );
};

export default GroupCreation;