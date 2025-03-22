import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';
import authRoutes from "./routes/authRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import financialRoutes from './routes/financialRoutes.js';
import transactionRoutes from "./routes/transactionRoutes.js";
import packageRoutes from './routes/packageRoutes.js';
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App Config
const app = express();
const port = process.env.PORT || 4000;

// Middlewares
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Member Application Routes
import memberApplicationRoutes from '../backend/routes/memberApplicationRoutes.js';
app.use('/api/member-applications', memberApplicationRoutes);

// Admin Application Routes
import adminApplicationRoutes from './routes/adminApplicationRoutes.js';
app.use('/api/admin/applications', adminApplicationRoutes);

// User Routes
import userRoutes from './routes/userRoutes.js';
app.use('/api/users', userRoutes);

// Organizer Routes
import organizerRoutes from './routes/organizerRoutes.js';
app.use('/api/organizers', organizerRoutes);

// Financial Management Routes
app.use('/api/finance', financialRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/transaction", transactionRoutes);

// Package Routes from the 'dev' branch
app.use('/api/packages', packageRoutes);

// API Endpoints
app.get('/register/member/application', (req, res) => {
    res.send('API Working');
});

// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));