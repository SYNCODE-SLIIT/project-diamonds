import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';

const AdminInbox = () => {
  const { user } = useContext(UserContext);
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('groups');
  const [loading, setLoading] = useState(true);
  const [memberLoading, setMemberLoading] = useState(false);
  const [directChats, setDirectChats] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const lastCountsRef = useRef([]);
  const lastDirectCountsRef = useRef([]);

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

  // Fetch all members for direct messaging
  const fetchMembers = async () => {
    if (!user?._id) return;
    setMemberLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      // Filter for users with role 'member'
      const memberUsers = data.filter(u => u.role === 'member');
      setMembers(memberUsers);
    } catch (err) {
      console.error("Error fetching members:", err);
    } finally {
      setMemberLoading(false);
    }
  };

  // Fetch direct chats (threads) for the current user
  const fetchDirectChats = async () => {
    if (!user?._id) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `http://localhost:4000/api/direct-chats/user/${user._id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      const threads = data.threads || [];
      
      // Only update state if unread counts changed
      const newCounts = threads.map(t => `${t._id}:${t.unreadCount}`);
      if (JSON.stringify(newCounts) !== JSON.stringify(lastDirectCountsRef.current)) {
        setDirectChats(threads);
        lastDirectCountsRef.current = newCounts;
      }
    } catch (err) {
      console.error("Error fetching direct chats:", err);
    }
  };

  // Start a direct chat with a member
  const startChat = async (memberId) => {
    console.log('Attempting to start chat with memberId:', memberId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in to start a chat");
        return;
      }
      const res = await fetch('http://localhost:4000/api/direct-chats/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otherUserId: memberId })
      });
      const data = await res.json();
      console.log('startChat response status:', res.status, 'data:', data);
      if (!res.ok) {
        throw new Error(`${data.message || 'Could not create chat thread'} (HTTP ${res.status})`);
      }
      navigate(`/admin/direct-chat/${data.thread._id}`);
    } catch (err) {
      console.error('Error starting chat:', err);
      alert('Error starting chat: ' + err.message);
    }
  };

  useEffect(() => {
    fetchGroupsInit();
    const interval = setInterval(pollGroups, 3000);
    return () => clearInterval(interval);
  }, [user]);
  
  useEffect(() => {
    if (activeTab === 'direct') {
      fetchMembers();
      fetchDirectChats();
      const interval = setInterval(fetchDirectChats, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab, user]);

  // Find the other participant in a thread (not the current user)
  const getOtherParticipant = (thread) => {
    if (!thread.participants) return { fullName: "Unknown" };
    return thread.participants.find(p => p._id !== user._id) || { fullName: "Unknown" };
  };

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
      {/* Top Section: Tabs + Create Group Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Admin Inbox</h2>
          <div className="mt-4 flex space-x-2">
            <button 
              onClick={() => setActiveTab('groups')}
              className={`px-4 py-2 rounded-t-lg ${activeTab === 'groups' 
                ? 'bg-blue-600 text-white font-medium' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Group Chats
            </button>
            <button 
              onClick={() => setActiveTab('direct')}
              className={`px-4 py-2 rounded-t-lg ${activeTab === 'direct' 
                ? 'bg-blue-600 text-white font-medium' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Direct Messages
            </button>
          </div>
        </div>
        {activeTab === 'groups' && (
          <button 
            onClick={() => navigate('/admin/messaging/create-group')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Create Group
          </button>
        )}
      </div>

      {/* Group Chats Tab */}
      {activeTab === 'groups' && (
        <>
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
        </>
      )}

      {/* Direct Messages Tab */}
      {activeTab === 'direct' && (
        <div className="space-y-8">
          {/* Recent Conversations Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">Recent Conversations</h3>
              <p className="text-blue-100 text-sm">Continue your recent message threads</p>
            </div>
            
            {directChats.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {directChats.map(thread => {
                  const otherUser = getOtherParticipant(thread);
                  return (
                    <Link 
                      key={thread._id} 
                      to={`/admin/direct-chat/${thread._id}`}
                      className="flex items-center justify-between p-5 hover:bg-blue-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white shadow-sm">
                          <span className="text-lg font-semibold">
                            {otherUser.fullName?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{otherUser.fullName}</h4>
                          <p className="text-sm text-gray-500 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 inline-block"></span>
                            {thread.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {thread.unreadCount > 0 && (
                          <span className="bg-red-500 text-white font-medium text-xs px-3 py-1 rounded-full shadow-sm">
                            {thread.unreadCount}
                          </span>
                        )}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                          <path d="M9 18l6-6-6-6"></path>
                        </svg>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-10 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <p className="text-gray-600 mb-1">No recent direct messages</p>
                <p className="text-sm text-gray-500">Start a conversation with a member below</p>
              </div>
            )}
          </div>
          
          {/* All Members Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-white">All Members</h3>
                <p className="text-indigo-100 text-sm">Start a new conversation</p>
              </div>
              {/* Search removed as per request */}
            </div>
            
            {memberLoading ? (
              <div className="flex items-center justify-center p-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Loading members...</span>
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <p className="text-gray-600">No members found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {members.map(member => (
                  <div key={member._id} className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <div className="p-5">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white shadow">
                          <span className="text-xl font-semibold">
                            {member.fullName?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-medium text-gray-800 truncate">{member.fullName}</h4>
                          <p className="text-sm text-gray-500 truncate">{member.email || "No email"}</p>
                        </div>
                      </div>
                      <div className="mt-5">
                        <button
                          onClick={() => startChat(member._id)}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                          <span>Start Chat</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInbox;