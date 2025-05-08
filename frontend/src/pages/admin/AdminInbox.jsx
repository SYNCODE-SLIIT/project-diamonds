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

  const fetchMembers = async () => {
    if (!user?._id) return;
    setMemberLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const memberUsers = data.filter(u => u.role === 'member');
      setMembers(memberUsers);
    } catch (err) {
      console.error("Error fetching members:", err);
    } finally {
      setMemberLoading(false);
    }
  };

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
      const newCounts = threads.map(t => `${t._id}:${t.unreadCount}`);
      if (JSON.stringify(newCounts) !== JSON.stringify(lastDirectCountsRef.current)) {
        setDirectChats(threads);
        lastDirectCountsRef.current = newCounts;
      }
    } catch (err) {
      console.error("Error fetching direct chats:", err);
    }
  };

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
        setGroups(prev => prev.filter(g => g._id !== groupId));
      } else {
        alert(data.message || "Error deleting group.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Messaging & Communication</h2>
        <p className="text-gray-500 mt-1">Manage group conversations and direct messages</p>
      </div>
      
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('groups')}
          className={`py-3 px-5 font-medium text-sm focus:outline-none ${
            activeTab === 'groups'
              ? 'text-[#1c4b82] border-b-2 border-[#1c4b82]'
              : 'text-gray-500 hover:text-[#1c4b82]'
          }`}
        >
          Group Conversations
        </button>
        <button
          onClick={() => setActiveTab('direct')}
          className={`py-3 px-5 font-medium text-sm focus:outline-none ${
            activeTab === 'direct'
              ? 'text-[#1c4b82] border-b-2 border-[#1c4b82]'
              : 'text-gray-500 hover:text-[#1c4b82]'
          }`}
        >
          Direct Messages
        </button>
      </div>

      {activeTab === 'groups' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-800">Group Conversations</h3>
            <button
              onClick={() => navigate('/admin/messaging/create-group')}
              className="bg-gradient-to-r from-[#0d253f] to-[#1c4b82] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm font-medium"
            >
              Create New Group
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1c4b82]"></div>
            </div>
          ) : errorMsg ? (
            <div className="py-8 text-center">
              <p className="text-red-500">{errorMsg}</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#1c4b82]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-500">No group conversations found</p>
              <button
                onClick={() => navigate('/admin/messaging/create-group')}
                className="mt-4 text-[#1c4b82] hover:underline font-medium text-sm"
              >
                Create your first group
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left w-full text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Group Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unread
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {groups.map(group => (
                    <tr key={group._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap w-full">
                        <div className="font-medium text-gray-800">{group.groupName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {group.unreadCount > 0 ? (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-[#1c4b82]">
                            {group.unreadCount}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2 text-right">
                        <Link
                          to={`/admin/chat/${group._id}`}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-[#1c4b82] hover:bg-[#0d253f] transition-colors"
                        >
                          View Chat
                        </Link>
                        <Link
                          to={`/admin/groups/${group._id}/members`}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-[#1c4b82] bg-blue-50 hover:bg-blue-100 transition-colors"
                        >
                          Members
                        </Link>
                        <button
                          onClick={() => handleDeleteGroup(group._id)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
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
      )}

      {activeTab === 'direct' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-full">
              <div className="bg-gradient-to-r from-[#0d253f] to-[#1c4b82] px-5 py-4 rounded-t-lg">
                <h3 className="text-lg font-medium text-white">Recent Conversations</h3>
              </div>
              
              {directChats.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {directChats.map(thread => {
                    const otherUser = getOtherParticipant(thread);
                    return (
                      <Link
                        key={thread._id}
                        to={`/admin/direct-chat/${thread._id}`}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-[#0d253f] to-[#1c4b82] rounded-full flex items-center justify-center text-white">
                            <span className="text-sm font-medium">
                              {otherUser.fullName?.charAt(0) || "?"}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{otherUser.fullName}</h4>
                            <p className="text-xs text-gray-500 truncate max-w-xs mt-1">
                              {thread.lastMessage || 'No messages yet'}
                            </p>
                          </div>
                        </div>
                        {thread.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-blue-100 text-[#1c4b82]">
                            {thread.unreadCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#1c4b82]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <p className="text-gray-800 font-medium">No conversations yet</p>
                  <p className="text-gray-500 text-sm mt-1">Start chatting with a member from the list</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-full">
              <div className="bg-gradient-to-r from-[#0d253f] to-[#1c4b82] px-5 py-4 rounded-t-lg">
                <h3 className="text-lg font-medium text-white">Members</h3>
              </div>
              
              {memberLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1c4b82]"></div>
                </div>
              ) : members.length === 0 ? (
                <div className="py-12 text-center px-4">
                  <p className="text-gray-500">No members found</p>
                </div>
              ) : (
                <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                  {members.map(member => (
                    <div key={member._id} className="p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-[#0d253f] to-[#1c4b82] rounded-full flex items-center justify-center text-white">
                            <span className="text-sm font-medium">
                              {member.fullName?.charAt(0) || "?"}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800 text-sm">{member.fullName}</h4>
                            <p className="text-xs text-gray-500 truncate max-w-[150px]">{member.email || "No email"}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => startChat(member._id)}
                          className="text-[#1c4b82] hover:bg-blue-50 p-2 rounded-md transition-colors"
                          title="Start chat"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInbox;