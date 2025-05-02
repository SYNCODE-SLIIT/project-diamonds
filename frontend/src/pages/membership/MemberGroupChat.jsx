import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../../context/userContext';

const MemberGroupChat = () => {
  const { groupId } = useParams();
  const { user } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch group messages
  useEffect(() => {
    if (groupId) {
      setLoading(true);
      fetch(`http://localhost:4000/api/messages/${groupId}`)
        .then((res) => res.json())
        .then((data) => {
          setMessages(data.messages || []);
          setLoading(false);
        })
        .catch((err) => {
          setError("Error fetching messages: " + err.message);
          setLoading(false);
        });
    }
  }, [groupId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const payload = {
      chatGroup: groupId,
      sender: user._id,
      text: newMessage.trim()
    };

    fetch('http://localhost:4000/api/messages', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.savedMessage) {
          setMessages(prev => [...prev, data.savedMessage]);
          setNewMessage('');
        }
      })
      .catch(err => console.error("Error sending message:", err));
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Group Chat</h2>
      <div className="h-64 border p-4 overflow-y-auto mb-4">
        {loading && <p>Loading messages...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {messages.length === 0 && !loading && <p>No messages yet.</p>}
        {messages.map((msg) => (
          <div key={msg._id} className="mb-2">
            <span className="font-semibold">
              {msg.sender.fullName || msg.sender}:
            </span> {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <input 
          type="text" 
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded p-2"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Send
        </button>
      </form>
    </div>
  );
};

export default MemberGroupChat;