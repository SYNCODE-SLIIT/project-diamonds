
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

import userRoutes from "./routes/userRoutes.js";

import blogPostRoutes from "./routes/blogPostRoutes.js";
import managePostRoutes from "./routes/managePostRoutes.js";
import calendarRoutes from './routes/calendarRoutes.js'; 

import path from "path";
import { fileURLToPath } from "url";
import additionalServiceRoutes from './routes/additionalServiceRoutes.js';
import eventRequestRoutes from './routes/eventRequestRoutes.js';



// Load environment variables
dotenv.config();

// Resolve __dirname for ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App Config
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));
// Connect to MongoDB
connectDB();


// Memebr Application Routes
import memberApplicationRoutes from '../backend/routes/memberApplicationRoutes.js';
app.use('/api/member-applications', memberApplicationRoutes);

// Admin Application Routes
import adminApplicationRoutes from './routes/adminApplicationRoutes.js';
app.use('/api/admin/applications', adminApplicationRoutes);

// User Routes

app.use('/api/users', userRoutes);
// chatGroupRoutes
import chatGroupRoutes from './routes/chatGroupRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
app.use('/api/chat-groups', chatGroupRoutes);
app.use('/api/messages', messageRoutes);

// Organizer Routes

import organizerRoutes from './routes/organizerRoutes.js';


app.use('/api/organizers', organizerRoutes);

// Import Routes

// Financial Management Routes
app.use('/api/finance', financialRoutes);



// Mount Routes

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/transaction", transactionRoutes);


//Team Manager Routes
app.use('/api/calendar', calendarRoutes);


// Package Routes from the 'dev' branch
app.use('/api/packages', packageRoutes);
app.use('/api/services', additionalServiceRoutes);
app.use('/api/event-requests', eventRequestRoutes);

app.use("/api/finance", financialRoutes);
app.use("/api/member-applications", memberApplicationRoutes);
app.use("/api/admin/applications", adminApplicationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/organizers", organizerRoutes);
app.use("/api/blogposts", blogPostRoutes);
app.use("/api/media", managePostRoutes);

// API Endpoints
app.get('/register/member/application', (req, res) => {
    res.send('API Working');
});


// Serve static files (if needed for media uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Health Check
app.get("/", (req, res) => {
  res.send("API is running...");

});


// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));
