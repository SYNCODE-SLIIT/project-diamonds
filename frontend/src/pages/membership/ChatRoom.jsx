import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../../context/userContext';

const ChatRoom = () => {
  const { groupId } = useParams();
  const { user } = useContext(UserContext);
  const [groupName, setGroupName] = useState('Chat Room');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch chat group details to get the group name
  useEffect(() => {
    if (groupId) {
      fetch(`http://localhost:4000/api/chat-groups/${groupId}`)
        .then((res) => {
          if (!res.ok) throw new Error(`Error: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (data.group && data.group.groupName) {
            setGroupName(data.group.groupName);
          }
        })
        .catch((err) => {
          console.error("Error fetching group details:", err);
        });
    }
  }, [groupId]);

  // Fetch messages for the group
  useEffect(() => {
    if (groupId) {
      setLoading(true);
      fetch(`http://localhost:4000/api/messages/${groupId}`)
        .then((res) => {
          if (!res.ok) throw new Error(`Error: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          setMessages(data.messages || []);
          setLoading(false);
        })
        .catch((err) => {
          setErrorMsg("Error fetching messages: " + err.message);
          setLoading(false);
        });
    }
  }, [groupId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const payload = {
      chatGroup: groupId,
      sender: user._id,
      text: newMessage.trim()
    };

    try {
      const res = await fetch('http://localhost:4000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        const savedMessage = data.savedMessage;
        if (!savedMessage.sender.fullName) {
          savedMessage.sender = { _id: user._id, fullName: user.fullName };
        }
        setMessages((prev) => [...prev, savedMessage]);
        setNewMessage('');
      } else {
        setErrorMsg(data.message || 'Error sending message');
      }
    } catch (err) {
      setErrorMsg("Error: " + err.message);
    }
  };

  const getSenderName = (msg) => {
    if (typeof msg.sender === 'object' && msg.sender.fullName) {
      return msg.sender.fullName;
    }
    if (msg.sender === user._id) {
      return user.fullName;
    }
    return msg.sender;
  };

  const isCurrentUser = (msg) => {
    if (typeof msg.sender === 'object' && msg.sender._id) {
      return msg.sender._id === user._id;
    }
    return msg.sender === user._id;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Increased container size: max-w-4xl instead of max-w-xl */}
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
          {/* Display groupName instead of static text */}
          <h1 className="text-2xl font-bold text-white text-center">{groupName}</h1>
        </div>
        
        {loading && (
          <div className="text-center py-4 bg-gray-50">
            <p className="text-gray-600 animate-pulse">Loading messages...</p>
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{errorMsg}</p>
          </div>
        )}
        
        {/* Increased height of chat messages container */}
        <div className="h-[600px] overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500">No messages yet.</p>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg._id} 
                className={`flex flex-col ${isCurrentUser(msg) ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-xl ${
                    isCurrentUser(msg) 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p className="font-semibold text-sm mb-1">{getSenderName(msg)}</p>
                  <p>{msg.text}</p>
                  <span className="text-xs opacity-70 block text-right mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        
        <form 
          onSubmit={handleSendMessage} 
          className="bg-white p-4 border-t border-gray-200 flex items-center space-x-2"
        >
          <input
            type="text"
            className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;