import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your-db-name';

async function addTestPayment() {
  await mongoose.connect(MONGO_URI);

  const payment = new Payment({
    // Replace with a valid invoiceId from your invoices collection if you have one
    invoiceId: null,
    user: new mongoose.Types.ObjectId(), // Replace with a valid user ID if you want
    amount: 1000,
    paymentMethod: 'Test Method',
    bankSlipFile: '',
    status: 'Pending',
    paymentFor: 'other'
  });

  await payment.save();
  console.log('Test payment added:', payment);
  await mongoose.disconnect();
}

addTestPayment().catch(err => {
  console.error(err);
  process.exit(1);
}); 