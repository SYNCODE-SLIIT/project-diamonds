import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import { Send, ArrowDown, ArrowLeft } from 'lucide-react';

const HeadmanChatRoom = () => {
  const { groupId } = useParams();
  const { user } = useContext(UserContext);
  const [groupName, setGroupName] = useState('Headman Chat Room');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef(null);
  const lastCountRef = useRef(0);
  const token = localStorage.getItem('token');

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

  useEffect(() => {
    if (groupId && token) {
      fetch(`http://localhost:4000/api/messages/${groupId}/readAll`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
  }, [groupId, token]);

  const fetchMessages = async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/messages/${groupId}`);
      const data = await res.json();
      const fetched = data.messages || [];
      setMessages(fetched);
      lastCountRef.current = fetched.length;
      if (token) {
        fetch(`http://localhost:4000/api/messages/${groupId}/readAll`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (err) {
      setErrorMsg("Error fetching messages: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchMessages();
      const pollNew = async () => {
        try {
          const res = await fetch(
            `http://localhost:4000/api/messages/${groupId}/check/${lastCountRef.current}`
          );
          const json = await res.json();
          if (json.hasNew) fetchMessages();
        } catch {}
      };
      const interval = setInterval(pollNew, 1000);
      return () => clearInterval(interval);
    }
  }, [groupId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <Link to="/admin/inbox" className="text-[#1c4b82] hover:underline mr-2 flex items-center">
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Inbox
          </Link>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-gray-600">Group Chat</span>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">{groupName}</h2>
        <p className="text-gray-500 mt-1">Group conversation</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0d253f] to-[#1c4b82] p-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Messages</h3>
          <button 
            onClick={scrollToBottom}
            className="p-2 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Scroll to latest messages"
          >
            <ArrowDown className="h-5 w-5" />
          </button>
        </div>
        
        {loading && (
          <div className="text-center py-2 px-4 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1c4b82] mr-2"></div>
              <p className="text-[#1c4b82] text-sm">Loading messages...</p>
            </div>
          </div>
        )}
        
        {errorMsg && (
          <div className="bg-red-50 border-b border-red-100 p-3 px-4">
            <p className="text-red-600 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errorMsg}
            </p>
          </div>
        )}
        
        <div className="h-[600px] overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#1c4b82]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-800 font-medium">No messages yet</p>
              <p className="text-sm text-gray-500">Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg._id} 
                className={`flex flex-col ${isCurrentUser(msg) ? 'items-end' : 'items-start'}`}
              >
                <div className="flex flex-col max-w-[75%]">
                  <div className="flex items-center space-x-2 mb-1 px-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-[#0d253f] to-[#1c4b82] rounded-full flex items-center justify-center text-white text-xs">
                      {getSenderName(msg).charAt(0)}
                    </div>
                    <span className="text-xs text-gray-500">{getSenderName(msg)}</span>
                  </div>
                  <div 
                    className={`p-3 rounded-lg ${
                      isCurrentUser(msg) 
                        ? 'bg-gradient-to-r from-[#0d253f] to-[#1c4b82] text-white rounded-tr-none' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 px-2">
                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form 
          onSubmit={handleSendMessage} 
          className="bg-white p-4 border-t border-gray-100 flex items-center space-x-3"
        >
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c4b82] focus:border-[#1c4b82] text-sm"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-[#0d253f] to-[#1c4b82] text-white p-2 rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#1c4b82] focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default HeadmanChatRoom;