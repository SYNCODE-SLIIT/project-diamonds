import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../context/userContext';

const MemberDashboardInbox = () => {
  const { user } = useContext(UserContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user && user._id) {
      setLoading(true);
      fetch(`http://localhost:4000/api/chat-groups/user/${user._id}`)
        .then((res) => {
          if (!res.ok) throw new Error(`Error: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          // Assume API returns { groups: [ ... ] } where each group has an unreadCount property.
          setGroups(data.groups || []);
          setLoading(false);
        })
        .catch((err) => {
          setErrorMsg("Error fetching groups: " + err.message);
          setLoading(false);
        });
    }
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Inbox</h1>
      {loading && <p className="text-center">Loading chat groups...</p>}
      {errorMsg && <p className="text-center text-red-600">{errorMsg}</p>}
      {groups.length === 0 ? (
        <p>No chat groups found.</p>
      ) : (
        <ul className="space-y-2">
          {groups.map((group) => (
            <li key={group._id} className="border p-4 rounded hover:bg-gray-100 flex justify-between items-center">
              <Link to={`/member-dashboard/messaging/chat/${group._id}`} className="flex-1">
                <span className="font-semibold">{group.groupName}</span>
              </Link>
              <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
                {group.unreadCount || 0}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MemberDashboardInbox;