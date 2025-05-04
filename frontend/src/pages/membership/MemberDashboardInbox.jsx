import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../context/userContext';

const MemberDashboardInbox = () => {
  const { user } = useContext(UserContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const intervalRef = useRef(null);
  const lastCountsRef = useRef([]);

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

  useEffect(() => {
    fetchGroupsInit();
    intervalRef.current = setInterval(pollGroups, 1000);
    return () => clearInterval(intervalRef.current);
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800">Inbox</h1>
        <div className="text-gray-500 text-sm">
          {groups.length} chat groups
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {errorMsg}
        </div>
      )}

      {groups.length === 0 && !loading ? (
        <div className="text-center py-8 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p className="text-xl">No chat groups found</p>
          <p className="text-sm">Start a new conversation or join a group</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <Link 
              key={group._id} 
              to={`/member-dashboard/messaging/chat/${group._id}`} 
              className="block"
            >
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {group.groupName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {group.lastMessage || 'No recent messages'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {group.unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {group.unreadCount}
                    </span>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberDashboardInbox;