import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';

// Load environment variables
dotenv.config();

// App Config
const app = express();
const port = process.env.PORT || 4000;

// Middlewares
app.use(express.json());
app.use(cors());
// Connect to MongoDB
connectDB();
// import authRoutes from '../backend/routes/authRoutes.js'
// app.use('/api/auth', authRoutes)

import memberApplicationRoutes from '../backend/routes/memberApplicationRoutes.js';
app.use('/api/member-applications', memberApplicationRoutes);


// API Endpoints
app.get('/register/member/application', (req, res) => {
    res.send('API Working');
});

// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));