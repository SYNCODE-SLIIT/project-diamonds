import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import { Send, ArrowDown, ArrowLeft } from 'lucide-react';

const DirectChatRoom = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [otherUser, setOtherUser] = useState({ fullName: 'Chat' });
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef(null);
  const lastCountRef = useRef(0);
  const token = localStorage.getItem('token');

  // Fetch thread info to get other user's name
  useEffect(() => {
    if (threadId && user?._id) {
      const token = localStorage.getItem('token');
      fetch(`http://localhost:4000/api/direct-chats/user/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        const thisThread = (data.threads || []).find(t => t._id === threadId);
        if (thisThread && thisThread.participants) {
          const other = thisThread.participants.find(p => p._id !== user._id);
          if (other) setOtherUser(other);
        }
      })
      .catch(err => console.error("Error fetching thread info:", err));
    }
  }, [threadId, user]);

  // Mark all messages as read on thread open
  useEffect(() => {
    if (threadId && token) {
      fetch(`http://localhost:4000/api/direct-chats/${threadId}/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
  }, [threadId, token]);

  // Extract fetch logic for messages
  const fetchMessages = async () => {
    if (!threadId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/direct-chats/${threadId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const fetched = data.messages || [];
      setMessages(fetched);
      lastCountRef.current = fetched.length;
      
      // Mark as read on each fetch (handles new messages arriving)
      if (token) {
        fetch(`http://localhost:4000/api/direct-chats/${threadId}/read-all`, {
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

  // Initial load and polling for new messages
  useEffect(() => {
    if (threadId) {
      fetchMessages();
      
      // Poll for new messages
      const pollNew = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(
            `http://localhost:4000/api/direct-chats/${threadId}/messages`,
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          const data = await res.json();
          if ((data.messages || []).length > lastCountRef.current) {
            fetchMessages();
          }
        } catch {}
      };
      
      const interval = setInterval(pollNew, 3000);
      return () => clearInterval(interval);
    }
  }, [threadId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Send a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await fetch(`http://localhost:4000/api/direct-chats/${threadId}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: newMessage.trim() })
      });
      
      const data = await res.json();
      if (res.ok && data.savedMessage) {
        const savedMsg = data.savedMessage;
        if (!savedMsg.sender.fullName) {
          savedMsg.sender = { _id: user._id, fullName: user.fullName };
        }
        setMessages(prev => [...prev, savedMsg]);
        setNewMessage('');
      } else {
        setErrorMsg(data.message || 'Error sending message');
      }
    } catch (err) {
      setErrorMsg("Error: " + err.message);
    }
  };

  const isCurrentUser = (msg) => {
    if (typeof msg.sender === 'object' && msg.sender._id) {
      return msg.sender._id === user._id;
    }
    return msg.sender === user._id;
  };

  const getSenderName = (msg) => {
    if (typeof msg.sender === 'object' && msg.sender.fullName) {
      return msg.sender.fullName;
    }
    return isCurrentUser(msg) ? user.fullName : otherUser.fullName;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-green-600 p-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="text-white hover:bg-green-700 p-2 rounded-md transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-xl font-semibold text-white flex-1 text-center">
            Chat with {otherUser.fullName}
          </h1>
          <button 
            onClick={scrollToBottom}
            className="p-2 rounded-md bg-green-700 hover:bg-green-800 text-white transition-colors"
            title="Scroll to latest messages"
          >
            <ArrowDown size={18} />
          </button>
        </div>
        
        {/* Status messages */}
        {loading && (
          <div className="text-center py-2 px-4 bg-blue-50 border-b border-blue-100">
            <p className="text-blue-600 text-sm">Loading messages...</p>
          </div>
        )}
        
        {errorMsg && (
          <div className="bg-red-50 border-b border-red-100 p-2 px-4">
            <p className="text-red-600 text-sm">{errorMsg}</p>
          </div>
        )}
        
        {/* Messages container */}
        <div className="h-[500px] overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg._id} 
                className={`flex flex-col ${isCurrentUser(msg) ? 'items-end' : 'items-start'}`}
              >
                <div className="flex flex-col max-w-[75%]">
                  <span className="text-xs text-gray-500 mb-1 px-2">
                    {getSenderName(msg)}
                  </span>
                  <div 
                    className={`p-3 rounded-lg ${
                      isCurrentUser(msg) 
                        ? 'bg-green-600 text-white rounded-tr-none' 
                        : 'bg-gray-200 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 self-end px-2">
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
        
        {/* Message input */}
        <form 
          onSubmit={handleSendMessage} 
          className="bg-white p-3 border-t border-gray-200 flex items-center space-x-2"
        >
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            disabled={!newMessage.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default DirectChatRoom;