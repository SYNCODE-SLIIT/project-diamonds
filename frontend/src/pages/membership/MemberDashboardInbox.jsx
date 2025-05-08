import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import { MessageSquare, ChevronRight, Users, Clock, Search, AlertCircle, Bell } from 'lucide-react';

const MemberDashboardInbox = () => {
  const { user } = useContext(UserContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [managerThread, setManagerThread] = useState(null);
  const [managerUnread, setManagerUnread] = useState(0);
  const [loadingManager, setLoadingManager] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const intervalRef = useRef(null);
  const lastCountsRef = useRef([]);
  const lastManagerUnreadRef = useRef(0);
  const startedRef = useRef(false);
  const token = localStorage.getItem('token');

  // Fetch and initialize groups and counts
  const fetchGroupsInit = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/chat-groups/user/${user._id}`);
      const data = await res.json();
      const gs = data.groups || [];
      setGroups(gs);
      // store counts keyed by groupId
      lastCountsRef.current = gs.map(g => `${g._id}:${g.unreadCount}`);
    } catch (err) {
      setErrorMsg('Error fetching groups: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Poll only if counts changed
  const pollGroups = async () => {
    if (!user?._id) return;
    try {
      const res = await fetch(`http://localhost:4000/api/chat-groups/user/${user._id}`);
      const data = await res.json();
      const newGroups = data.groups || [];
      const newCounts = newGroups.map(g => `${g._id}:${g.unreadCount}`);
      // if any count changed, update groups
      if (JSON.stringify(newCounts) !== JSON.stringify(lastCountsRef.current)) {
        setGroups(newGroups);
        lastCountsRef.current = newCounts;
      }
    } catch {
      // ignore polling errors
    }
  };

  // Refined findOrCreateManagerChat
  const findOrCreateManagerChat = async () => {
    setLoadingManager(true);
    try {
      // fetch all users and pick the manager
      const usersRes = await fetch(`http://localhost:4000/api/users`, { headers: { 'Authorization': `Bearer ${token}` }});
      const users = await usersRes.json();
      const manager = users.find(u => u.role === 'teamManager');
      if (!manager) return;

      const managerId = manager._id;
      // fetch existing direct chats for this member
      const threadsRes = await fetch(`http://localhost:4000/api/direct-chats/user/${user._id}`, { headers: { 'Authorization': `Bearer ${token}` }});
      const { threads } = await threadsRes.json();
      // look for thread with this manager
      let thread = threads.find(t => t.participants.some(p => p._id === managerId));
      if (!thread) {
        // create new thread
        const startRes = await fetch(`http://localhost:4000/api/direct-chats/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ otherUserId: managerId })
        });
        const data = await startRes.json();
        thread = data.thread;
      }
      setManagerThread(thread);
      setManagerUnread(thread.unreadCount || 0);
    } catch (err) {
      console.error('Error finding/creating manager chat:', err);
    } finally {
      setLoadingManager(false);
    }
  };

  // Check for unread messages in the manager thread
  const checkManagerUnread = async (threadId) => {
    if (!threadId || !user?._id) return;
    
    try {
      // Get all threads for the user
      const res = await fetch(`http://localhost:4000/api/direct-chats/user/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      // Find the manager thread
      const thread = (data.threads || []).find(t => t._id === threadId);
      if (thread && thread.unreadCount !== lastManagerUnreadRef.current) {
        setManagerUnread(thread.unreadCount || 0);
        lastManagerUnreadRef.current = thread.unreadCount || 0;
      }
    } catch (err) {
      console.error("Error checking unread messages:", err);
    }
  };

  // Filter groups based on search query and unread filter
  const filteredGroups = groups.filter(group => {
    const matchesSearch = searchQuery === '' || 
      group.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.lastMessage && group.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesUnreadFilter = !showUnreadOnly || group.unreadCount > 0;
    
    return matchesSearch && matchesUnreadFilter;
  });

  useEffect(() => {
    fetchGroupsInit();
    if (!startedRef.current && user?._id) {
      findOrCreateManagerChat();
      startedRef.current = true;
    }
    // Combined polling for groups and manager unread
    // Initial checks
    pollGroups();
    if (managerThread?._id) {
      checkManagerUnread(managerThread._id);
    }
    intervalRef.current = setInterval(() => {
      pollGroups();
      if (managerThread?._id) {
        checkManagerUnread(managerThread._id);
      }
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [user, managerThread]);

  // Get total unread count
  const totalUnreadCount = groups.reduce((total, group) => total + (group.unreadCount || 0), 0) + managerUnread;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E0B32] to-[#25105A] text-white rounded-xl shadow-xl mb-6">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <MessageSquare className="mr-3 h-8 w-8" /> 
                Inbox
                {totalUnreadCount > 0 && (
                  <span className="ml-3 bg-pink-500 text-white text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {totalUnreadCount}
                  </span>
                )}
              </h1>
              <p className="text-purple-200 mt-1">Stay connected with your team and management</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-purple-300" />
                </div>
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-3 py-2 bg-[#2A1A44]/50 border border-purple-400/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              
              <button 
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={`p-2 rounded-lg transition-colors ${showUnreadOnly ? 'bg-pink-500 text-white' : 'bg-[#2A1A44]/50 text-purple-300 border border-purple-400/30'}`}
                title={showUnreadOnly ? "Show all conversations" : "Show unread only"}
              >
                <Bell size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {/* Manager Chat Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Users className="mr-2 h-5 w-5 text-[#25105A]" /> 
            Team Management
          </h2>
          
          {loadingManager ? (
            <div className="bg-white rounded-xl border border-purple-100 shadow-sm p-6 flex justify-center items-center">
              <div className="animate-pulse flex space-x-3">
                <div className="rounded-full bg-purple-100 h-10 w-10"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-purple-100 rounded w-3/4"></div>
                  <div className="h-3 bg-purple-100 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ) : managerThread ? (
            <Link 
              to={`/member-dashboard/direct-chat/${managerThread._id}`} 
              className="block"
            >
              <div className="bg-white border border-purple-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-hidden">
                <div className="border-l-4 border-[#25105A] p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-[#1E0B32] to-[#25105A] text-white p-3 rounded-full">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Team Manager
                      </h3>
                      <p className="text-sm text-gray-500">
                        Direct communication with administration
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {managerUnread > 0 && (
                      <span className="bg-pink-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                        {managerUnread}
                      </span>
                    )}
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="bg-white rounded-xl border border-purple-100 shadow-sm p-6 text-center">
              <AlertCircle className="h-12 w-12 text-purple-300 mx-auto mb-2" />
              <p className="text-gray-500">No team manager is currently available.</p>
            </div>
          )}
        </div>

        {/* Group Chats Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Users className="mr-2 h-5 w-5 text-[#25105A]" /> 
            Group Conversations
            {groups.length > 0 && (
              <span className="ml-2 text-sm text-gray-500 font-normal">
                ({filteredGroups.length} {filteredGroups.length === 1 ? 'chat' : 'chats'})
              </span>
            )}
          </h2>

          {loading && (
            <div className="bg-white rounded-xl border border-purple-100 shadow-sm p-6 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#25105A]"></div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {!loading && filteredGroups.length === 0 && (
            <div className="bg-white rounded-xl border border-purple-100 shadow-sm p-12 text-center">
              {searchQuery || showUnreadOnly ? (
                <>
                  <Search className="h-12 w-12 text-purple-200 mx-auto mb-3" />
                  <p className="text-xl text-gray-700">No matching conversations found</p>
                  <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
                </>
              ) : (
                <>
                  <MessageSquare className="h-12 w-12 text-purple-200 mx-auto mb-3" />
                  <p className="text-xl text-gray-700">No conversations yet</p>
                  <p className="text-gray-500 mt-1">Join or start a new group chat</p>
                </>
              )}
            </div>
          )}

          {!loading && filteredGroups.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGroups.map((group) => (
                <Link 
                  key={group._id} 
                  to={`/member-dashboard/messaging/chat/${group._id}`} 
                  className="block"
                >
                  <div className={`
                    bg-white border ${group.unreadCount > 0 ? 'border-purple-200' : 'border-gray-100'} 
                    rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out 
                    transform hover:-translate-y-1 overflow-hidden
                  `}>
                    <div className={`
                      ${group.unreadCount > 0 ? 'border-l-4 border-[#25105A]' : ''} 
                      p-5 flex items-center justify-between
                    `}>
                      <div className="flex items-center space-x-4">
                        <div className={`
                          ${group.unreadCount > 0 
                            ? 'bg-gradient-to-br from-[#1E0B32] to-[#25105A] text-white' 
                            : 'bg-purple-50 text-purple-600'} 
                          p-3 rounded-full
                        `}>
                          <Users size={20} />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${group.unreadCount > 0 ? 'text-gray-800' : 'text-gray-700'}`}>
                            {group.groupName}
                          </h3>
                          <p className={`text-sm truncate max-w-xs ${group.unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                            {group.lastMessage || 'No recent messages'}
                          </p>
                          {group.lastMessageTimestamp && (
                            <p className="text-xs text-gray-400 mt-1">
                              <Clock className="inline-block w-3 h-3 mr-1" />
                              {new Date(group.lastMessageTimestamp).toLocaleString(undefined, { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit', 
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {group.unreadCount > 0 && (
                          <span className="bg-pink-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                            {group.unreadCount}
                          </span>
                        )}
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDashboardInbox;