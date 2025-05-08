import express from 'express';
import axios from 'axios';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/authMiddleware.js';
import Invoice from '../models/Invoice.js';
import Refund from '../models/Refund.js';
import Payment from '../models/Payment.js';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Salary from '../models/Salary.js';

const router = express.Router();

// POST /api/chatbot/ask
router.post('/ask', protect, async (req, res) => {
  const { question } = req.body;
  const user = req.user;
  const userId = user?._id;

  if (!question || !userId) return res.status(400).json({ answer: 'No question or user ID provided.' });

  try {
    // Fetch all finance-related data for this user
    const [
      transactions,
      invoices,
      refunds,
      payments,
      expenses,
      incomes,
      salaries
    ] = await Promise.all([
      Transaction.find({ user: userId }).sort({ date: -1 }).limit(10).lean(),
      Invoice?.find?.({ user: userId }).sort({ date: -1 }).limit(10).lean() || [],
      Refund?.find?.({ user: userId }).sort({ date: -1 }).limit(10).lean() || [],
      Payment?.find?.({ user: userId }).sort({ date: -1 }).limit(10).lean() || [],
      Expense?.find?.({ user: userId }).sort({ date: -1 }).limit(10).lean() || [],
      Income?.find?.({ user: userId }).sort({ date: -1 }).limit(10).lean() || [],
      Salary?.find?.({ user: userId }).sort({ date: -1 }).limit(10).lean() || []
    ]);

    // Format and summarize data - with improved filtering
    const formattedTransactions = transactions
      .filter(t => t.totalAmount)  // Filter out zero amounts
      .map(t => ({
        id: t._id,
        type: t.transactionType,
        amount: t.totalAmount,
        date: new Date(t.date).toLocaleDateString(),
        details: t.details?.note || '',
        status: t.status || '',
        invoiceId: t.invoiceId || '',
      }));

    const formattedPayments = payments
      .filter(p => p.amount)  // Filter out zero amounts
      .map(p => ({
        id: p._id,
        amount: p.amount,
        method: p.method,
        date: new Date(p.date).toLocaleDateString(),
        status: p.status || '',
      }));

    const formattedExpenses = expenses
      .filter(e => e.amount)  // Filter out zero amounts
      .map(e => ({
        id: e._id,
        category: e.category,
        amount: e.amount,
        date: new Date(e.date).toLocaleDateString(),
        note: e.note || '',
      }));

    const formattedIncomes = incomes
      .filter(i => i.amount)  // Filter out zero amounts
      .map(i => ({
        id: i._id,
        source: i.source,
        amount: i.amount,
        date: new Date(i.date).toLocaleDateString(),
        note: i.note || '',
      }));

    const formattedSalaries = salaries
      .filter(s => s.amount)  // Filter out zero amounts
      .map(s => ({
        id: s._id,
        amount: s.amount,
        month: s.month,
        year: s.year,
        date: new Date(s.date).toLocaleDateString(),
        status: s.status || '',
      }));

    const formattedRefunds = refunds
      .filter(r => r.refundAmount)  // Filter out zero amounts
      .map(r => ({
        id: r._id,
        amount: r.refundAmount,
        reason: r.reason,
        date: new Date(r.processedAt || r.createdAt).toLocaleDateString(),
        status: r.status || '',
        invoiceNumber: r.invoiceNumber || '',
      }));

    // Calculate summary stats
    const totalPayments = formattedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalExpenses = formattedExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const totalIncomes = formattedIncomes.reduce((acc, i) => acc + (i.amount || 0), 0);
    const totalSalaries = formattedSalaries.reduce((acc, s) => acc + (s.amount || 0), 0);
    const totalRefunds = formattedRefunds.reduce((acc, r) => acc + (r.amount || 0), 0);

    // Only include non-zero/non-empty collections in the context
    const financialData = {
      user: { fullName: user.fullName, email: user.email },
      summary: {
        payments: totalPayments > 0 ? { total: totalPayments, count: formattedPayments.length } : null,
        expenses: totalExpenses > 0 ? { total: totalExpenses, count: formattedExpenses.length } : null,
        incomes: totalIncomes > 0 ? { total: totalIncomes, count: formattedIncomes.length } : null,
        salaries: totalSalaries > 0 ? { total: totalSalaries, count: formattedSalaries.length } : null,
        refunds: totalRefunds > 0 ? { total: totalRefunds, count: formattedRefunds.length } : null,
      },
      transactions: formattedTransactions.length > 0 ? formattedTransactions : null,
      payments: formattedPayments.length > 0 ? formattedPayments : null,
      expenses: formattedExpenses.length > 0 ? formattedExpenses : null,
      incomes: formattedIncomes.length > 0 ? formattedIncomes : null,
      salaries: formattedSalaries.length > 0 ? formattedSalaries : null,
      refunds: formattedRefunds.length > 0 ? formattedRefunds : null,
      invoices: invoices.length > 0 ? invoices : null,
    };

    // Remove null values from summary
    Object.keys(financialData.summary).forEach(key => {
      if (financialData.summary[key] === null) {
        delete financialData.summary[key];
      }
    });

    // Suggested questions
    const suggestedQuestions = [
      "Show me my recent transactions",
      "What is my payment summary?",
      "How many refunds do I have?",
      "Show my recent expenses",
      "What is my salary history?",
      "How much income did I receive last month?",
      "What is my financial status?",
      "Show me my biggest transactions",
      "What are my upcoming salary payments?",
      "List my recent invoices"
    ];

    // Compose a richer context for the LLM
    const context = `
Current user: ${user.fullName} (${user.email})
Financial data: ${JSON.stringify(financialData)}
Suggested questions: ${JSON.stringify(suggestedQuestions)}
    `;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: `You are a financial assistant. Always address the user by their name (${user.fullName}).

IMPORTANT FORMATTING RULES:
1. Always use properly formatted markdown tables with clear alignment
2. Tables MUST have this exact format:
   | Category | Amount | Count |
   |----------|--------|-------|
   | Payments | $1,000 | 5     |
3. Use emojis to make the information more engaging (💰 for payments, 💸 for expenses, etc.)
4. Break down complex information into bullet points
5. Highlight important numbers and statistics with **bold text**
6. Keep responses concise but informative
7. NEVER show categories with zero values or empty data
8. Format currency values consistently with dollar signs and commas ($1,000 not 1000)
9. Always end your response with 3-5 suggested questions the user can ask next

Example of GOOD table format:
| Category 💼 | Amount 💰 | Count 🔢 |
|-------------|-----------|---------|
| Payments    | $1,000    | 5       |
| Refunds     | $200      | 2       |

Example of BAD table format (DO NOT USE):
Category 
Amount 
Count 
------------ 
------------ 
------- 
Payments 
$49,565 
10

COMMON QUESTIONS AND ANSWERS:
${suggestedQuestions.map((q, i) => `${i + 1}. "${q}"`).join('\n   - ')}

Remember to:
- Always use the user's name
- Format all numerical data in properly aligned tables
- Use appropriate emojis
- Keep responses clear and concise
- Highlight important information
- NEVER show zero values or empty categories
- If all financial data is empty, suggest the user to add some transactions
- ALWAYS end with 3-5 clickable suggested questions

${context}`
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
    
    // Return both the formatted answer and the filtered financial data
    res.json({ 
      answer,
      financialData,
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