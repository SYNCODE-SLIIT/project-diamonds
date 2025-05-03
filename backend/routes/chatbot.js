import express from 'express';
import axios from 'axios';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/chatbot/ask
router.post('/ask', protect, async (req, res) => {
  const { question } = req.body;
  const user = req.user; // contains fullName, email, _id
  const userId = user?._id;

  if (!question || !userId) return res.status(400).json({ answer: 'No question or user ID provided.' });

  try {
    // Fetch only this user's transactions (limit to 5 most recent)
    const transactions = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    // Format transactions for better context
    const formattedTransactions = transactions.map(t => ({
      id: t._id,
      type: t.transactionType,
      amount: t.totalAmount,
      date: new Date(t.date).toLocaleDateString(),
      details: t.details?.note || '',
      status: t.status || '',
      invoiceId: t.invoiceId || '',
    }));

    // Calculate summary stats
    const totalPayments = formattedTransactions.filter(t => t.type === 'payment').reduce((acc, t) => acc + (t.amount || 0), 0);
    const totalRefunds = formattedTransactions.filter(t => t.type === 'refund').reduce((acc, t) => acc + (t.amount || 0), 0);
    const paymentCount = formattedTransactions.filter(t => t.type === 'payment').length;
    const refundCount = formattedTransactions.filter(t => t.type === 'refund').length;

    // Compose a richer context for the LLM
    const context = `Current user: ${user.fullName} (${user.email})\nRecent transactions: ${JSON.stringify(formattedTransactions)}\nSummary: Total Payments: ${totalPayments}, Total Refunds: ${totalRefunds}, Payment Count: ${paymentCount}, Refund Count: ${refundCount}`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: `You are a financial assistant. Always address the user by their name (${user.fullName}).\nFormat your responses in a user-friendly way.\nWhen showing transactions, use tables or lists with clear formatting.\nAlways include relevant emojis and make the information easy to read.\nIf possible, provide summary statistics and highlight any unusual activity.\n${context}`
          },
          { role: 'user', content: question }
        ],
        max_tokens: 700,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Financial Dashboard Chatbot'
        }
      }
    );

    const answer = response.data.choices[0].message.content.trim();
    
    // Return both the formatted answer and the raw transactions data
    res.json({ 
      answer,
      transactions: formattedTransactions,
      type: 'formatted',
      user: { fullName: user.fullName, email: user.email }
    });
  } catch (err) {
    console.error('Chatbot error:', err.response?.data || err.message);
    res.status(500).json({ 
      answer: 'Sorry, there was an error with the AI service.',
      error: err.response?.data || err.message 
    });
  }
});

export default router; 