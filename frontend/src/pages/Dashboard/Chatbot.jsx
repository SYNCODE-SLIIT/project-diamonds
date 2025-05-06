import React, { useState, useRef, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const BOT_AVATAR = '🤖';
const USER_AVATAR = '🧑';

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: 'Hi! Ask me anything about your expenses, refunds, or financial data.',
      type: 'text',
      avatar: BOT_AVATAR
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch user name from the last bot message if available
  useEffect(() => {
    // If the last message from bot contains a user object, set the name
    const lastBotMsg = messages.find(m => m.sender === 'bot' && m.user?.fullName);
    if (lastBotMsg) setUserName(lastBotMsg.user.fullName);
  }, [messages]);

  const formatMessage = (text, type) => {
    if (type === 'formatted') {
      // Convert markdown-style tables to HTML
      const formattedText = text
        .replace(/\|([^|]+)\|/g, (match, content) => {
          return `<div class=\"border border-gray-200 rounded p-2 my-1 bg-blue-50\">${content.trim()}</div>`;
        })
        .replace(/\n/g, '<br>')
        .replace(/```([^`]+)```/g, (match, code) => {
          return `<pre class=\"bg-gray-100 p-2 rounded my-2 overflow-x-auto\">${code}</pre>`;
        });
      return { __html: formattedText };
    }
    return { __html: text };
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = { sender: 'user', text: input, type: 'text', avatar: USER_AVATAR };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.post(
        '/api/chatbot/ask',
        { question: userMessage.text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.error) {
        throw new Error(res.data.error);
      }

      setMessages((prev) => [...prev, { 
        sender: 'bot', 
        text: res.data.answer,
        type: res.data.type || 'text',
        avatar: BOT_AVATAR,
        user: res.data.user
      }]);
      if (res.data.user?.fullName) setUserName(res.data.user.fullName);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages((prev) => [...prev, { 
        sender: 'bot', 
        text: err.response?.data?.error || 'Sorry, there was an error. Please try again.',
        type: 'text',
        avatar: BOT_AVATAR
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fadein">
      <div className="bg-gradient-to-br from-blue-100 via-white to-purple-100 rounded-2xl shadow-2xl w-[380px] max-h-[75vh] flex flex-col border border-blue-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-blue-200 bg-blue-600 rounded-t-2xl">
          <span className="text-white font-bold flex items-center gap-2 text-lg">
            💬 Finance Chatbot
          </span>
          <button 
            onClick={onClose} 
            className="text-white hover:text-gray-200 text-2xl transition-colors font-bold"
            title="Close"
          >
            ×
          </button>
        </div>
        <div className="px-4 pt-2 pb-1 bg-blue-50 text-blue-900 text-sm rounded-b-xl font-semibold flex items-center gap-2">
          {userName ? (
            <span>👋 Hello, <span className="font-bold text-blue-700">{userName}</span>!</span>
          ) : (
            <span>👋 Hello! Ask me anything about your finances.</span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex items-end ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'bot' && (
                <span className="mr-2 text-2xl select-none animate-bounce-slow">{msg.avatar}</span>
              )}
              <div 
                className={`px-4 py-2 rounded-2xl max-w-[80%] text-base shadow-md transition-all duration-200 ${
                  msg.sender === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none animate-slidein-right' 
                    : 'bg-white text-gray-900 rounded-bl-none border border-blue-100 animate-slidein-left'
                }`}
              >
                <div 
                  dangerouslySetInnerHTML={formatMessage(msg.text, msg.type)}
                  className="prose prose-sm max-w-none"
                />
              </div>
              {msg.sender === 'user' && (
                <span className="ml-2 text-2xl select-none animate-bounce-slow">{msg.avatar}</span>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-end justify-start">
              <span className="mr-2 text-2xl select-none animate-bounce-slow">{BOT_AVATAR}</span>
              <div className="px-4 py-2 rounded-2xl bg-white text-gray-900 shadow-md border border-blue-100 animate-pulse">
                <span>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={sendMessage} className="flex items-center border-t border-blue-200 p-2 bg-white rounded-b-2xl">
          <input
            type="text"
            className="flex-1 px-3 py-2 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-gray-900"
            placeholder="Type your question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1 text-lg"
            disabled={loading || !input.trim()}
            title="Send"
          >
            <span role="img" aria-label="send">📤</span>
          </button>
        </form>
      </div>
      <style>{`
        .animate-fadein { animation: fadein 0.5s; }
        @keyframes fadein { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
        .animate-slidein-right { animation: slideinright 0.3s; }
        @keyframes slideinright { from { opacity: 0; transform: translateX(40px);} to { opacity: 1; transform: none; } }
        .animate-slidein-left { animation: slideinleft 0.3s; }
        @keyframes slideinleft { from { opacity: 0; transform: translateX(-40px);} to { opacity: 1; transform: none; } }
        .animate-bounce-slow { animation: bounce 1.5s infinite alternate; }
        @keyframes bounce { 0% { transform: translateY(0); } 100% { transform: translateY(-6px); } }
      `}</style>
    </div>
  );
};

export default Chatbot;

// Add this function to extract suggested questions from the bot response
const extractSuggestedQuestions = (message) => {
  // Look for questions at the end of the message that start with numbers or bullet points
  const lines = message.split('\n');
  const questions = [];
  
  // Check the last few lines for suggested questions
  for (let i = lines.length - 1; i >= Math.max(0, lines.length - 10); i--) {
    const line = lines[i].trim();
    // Match patterns like "1. Question" or "• Question" or "- Question"
    const match = line.match(/^(?:\d+\.|\•|\-)\s*["'](.+?)["']$/);
    if (match) {
      questions.unshift(match[1]); // Add to beginning of array to maintain order
    }
  }
  
  return questions;
};

// In your render function, add this after displaying the bot message
const renderSuggestedQuestions = (message) => {
  const questions = extractSuggestedQuestions(message);
  
  if (questions.length === 0) return null;
  
  return (
    <div className="suggested-questions">
      <p>Suggested questions:</p>
      <div className="question-buttons">
        {questions.map((question, index) => (
          <button 
            key={index}
            className="question-button"
            onClick={() => handleSendMessage(question)}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

// Add this to your CSS
/*
.suggested-questions {
  margin-top: 15px;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.question-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.question-button {
  background-color: #f0f7ff;
  border: 1px solid #cce5ff;
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.question-button:hover {
  background-color: #cce5ff;
}
*/

// Then in your message display component:
{message.role === 'assistant' && (
  <>
    <div className="message-content">
      <ReactMarkdown>{message.content}</ReactMarkdown>
    </div>
    {renderSuggestedQuestions(message.content)}
  </>
)}