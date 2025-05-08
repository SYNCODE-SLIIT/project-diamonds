import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import { Send, ArrowDown, X, Users, Info, ArrowLeft, Clock, Search, MessageSquare, UserPlus, AlertCircle } from 'lucide-react';

const ChatRoom = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [groupName, setGroupName] = useState('Chat Room');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [groupDescription, setGroupDescription] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const messagesEndRef = useRef(null);
  const lastCountRef = useRef(0);
  const token = localStorage.getItem('token');

  // Fetch chat group details to get the group name and description
  useEffect(() => {
    if (groupId) {
      fetch(`http://localhost:4000/api/chat-groups/${groupId}`)
        .then((res) => {
          if (!res.ok) throw new Error(`Error: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (data.group) {
            setGroupName(data.group.groupName);
            setGroupDescription(data.group.description || '');
          }
        })
        .catch((err) => {
          console.error("Error fetching group details:", err);
        });
    }
  }, [groupId]);

  // Fetch group members
  useEffect(() => {
    if (groupId) {
      fetch(`http://localhost:4000/api/chat-groups/${groupId}/members`)
        .then((res) => {
          if (!res.ok) throw new Error(`Error: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          setGroupMembers(data.members || []);
        })
        .catch((err) => {
          console.error("Error fetching group members:", err);
        });
    }
  }, [groupId]);

  // Extract fetch logic
  const fetchMessages = async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/messages/${groupId}`);
      const data = await res.json();
      const all = data.messages || [];
      setMessages(all);
      lastCountRef.current = all.length;
      // mark as read
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
          const { hasNew } = await res.json();
          if (hasNew) fetchMessages();
        } catch (e) {}
      };
      const interval = setInterval(pollNew, 1000);
      return () => clearInterval(interval);
    }
  }, [groupId]);

  // Scroll to bottom on new messages
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
    <div className="container mx-auto max-w-6xl p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E0B32] to-[#25105A] p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => navigate('/member-dashboard/inbox')} 
              className="text-white hover:bg-white/10 p-2 rounded-md transition-colors flex items-center gap-1"
              title="Back to Inbox"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline font-medium">Back</span>
            </button>
          </div>
          
          <h1 className="text-xl font-semibold text-white text-center flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" /> 
            {groupName}
          </h1>
          
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setShowDetails(!showDetails)} 
              className={`text-white ${showDetails ? 'bg-white/20' : 'hover:bg-white/10'} p-2 rounded-md transition-colors flex items-center gap-1`}
              title={showDetails ? "Close details" : "View group details"}
            >
              {showDetails ? <X size={18} /> : <Info size={18} />}
              <span className="hidden sm:inline font-medium">{showDetails ? "Close" : "Details"}</span>
            </button>
            
            {!showDetails && (
              <button 
                onClick={scrollToBottom}
                className="p-2 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Scroll to latest messages"
              >
                <ArrowDown size={18} />
              </button>
            )}
          </div>
        </div>
        
        {/* Main Content - Either Details Pane or Messages */}
        {showDetails ? (
          <div className="p-6 bg-white h-[650px] overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              {/* Group Information */}
              <div className="mb-8 pb-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <Info className="mr-2 h-6 w-6 text-[#25105A]" />
                  Group Information
                </h2>
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-xl border border-purple-100 shadow-sm">
                  <h3 className="text-xl font-semibold text-[#25105A]">{groupName}</h3>
                  <p className="text-gray-600 mt-3 whitespace-pre-line">
                    {groupDescription || 'No description available for this group.'}
                  </p>
                </div>
              </div>
              
              {/* Members List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Users className="mr-2 h-5 w-5 text-[#25105A]" />
                    Members ({groupMembers.length})
                  </h3>
                </div>
                
                {groupMembers.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No members found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {groupMembers.map((member) => (
                      <div 
                        key={member._id} 
                        className="flex items-center p-4 bg-gradient-to-br from-white to-purple-50 rounded-xl border border-purple-100 hover:shadow-md transition-shadow"
                      >
                        <div className="bg-gradient-to-br from-[#1E0B32] to-[#25105A] text-white w-10 h-10 rounded-full flex items-center justify-center mr-3 font-semibold">
                          {member.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{member.fullName}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Status messages */}
            {loading && (
              <div className="text-center py-2 px-4 bg-purple-50 border-b border-purple-100">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#25105A] mr-2"></div>
                  <p className="text-[#25105A] text-sm">Loading messages...</p>
                </div>
              </div>
            )}
            
            {errorMsg && (
              <div className="bg-red-50 border-b border-red-100 p-2 px-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-600 text-sm">{errorMsg}</p>
                </div>
              </div>
            )}
            
            {/* Messages container */}
            <div className="h-[650px] overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-gray-50 to-purple-50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 text-center max-w-md">
                    <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-[#25105A]" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No messages yet</h3>
                    <p className="text-gray-500">Start the conversation by sending the first message!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg._id} 
                    className={`flex flex-col ${isCurrentUser(msg) ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex flex-col max-w-[80%]">
                      <div className="flex items-center space-x-2 mb-1 px-2">
                        <div className={`w-6 h-6 ${
                          isCurrentUser(msg) 
                            ? 'bg-gradient-to-br from-[#1E0B32] to-[#25105A]' 
                            : 'bg-gradient-to-br from-purple-400 to-indigo-400'
                        } rounded-full flex items-center justify-center text-white text-xs`}>
                          {getSenderName(msg).charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-500">{getSenderName(msg)}</span>
                      </div>
                      
                      <div 
                        className={`p-3 rounded-xl shadow-sm ${
                          isCurrentUser(msg) 
                            ? 'bg-gradient-to-r from-[#1E0B32] to-[#25105A] text-white rounded-tr-none' 
                            : 'bg-white border border-purple-100 text-gray-800 rounded-tl-none'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{msg.text}</p>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-400 mt-1 px-2 self-end">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(msg.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message input */}
            <form 
              onSubmit={handleSendMessage} 
              className="bg-white p-4 border-t border-gray-200 flex items-center space-x-3"
            >
              <input
                type="text"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#25105A] focus:border-[#25105A]"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                type="submit"
                className="p-3 rounded-full bg-gradient-to-r from-[#1E0B32] to-[#25105A] text-white hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25105A] disabled:opacity-50 shadow-md"
                disabled={!newMessage.trim()}
                title="Send message"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;