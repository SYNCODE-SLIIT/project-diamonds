import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();
const mongoUri = process.env.MONGO_URI;

async function run() {
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const users = await User.find({});
  for (const user of users) {
    const pw = user.passwordHashed || '';
    if (!pw.startsWith('$2a$') && !pw.startsWith('$2b$') && !pw.startsWith('$2y$')) {
      const hashed = await bcrypt.hash(pw, 12);
      user.passwordHashed = hashed;
      await user.save();
      console.log(`Re-hashed user ${user._id}`);
    }
  }

  console.log('Password migration complete');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});