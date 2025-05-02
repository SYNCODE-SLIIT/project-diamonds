import Payment from '../models/Payment.js';
import Refund from '../models/Refund.js';
import Budget from '../models/Budget.js';
import Invoice from '../models/Invoice.js';
import Transaction from '../models/Transaction.js';
import FinanceNotification from '../models/FinanceNotification.js';

export const deleteUserFinancialData = async (userId) => {
  await Promise.all([
    Payment.deleteMany({ user: userId }),
    Refund.deleteMany({ user: userId }),
    Budget.deleteMany({ user: userId }),
    Invoice.deleteMany({ user: userId }),
    Transaction.deleteMany({ user: userId }),
    FinanceNotification.deleteMany({ user: userId }),
  ]);
}; 