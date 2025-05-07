import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';
import { handleMulterError } from './middleware/uploadmiddleware.js';

import crypto from 'crypto';


import authRoutes from "./routes/authRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import financialRoutes from './routes/financialRoutes.js';
import financeNotificationRoutes from './routes/financeNotificationRoutes.js';
import transactionRoutes from "./routes/transactionRoutes.js";
import packageRoutes from './routes/packageRoutes.js';
import userRoutes from "./routes/userRoutes.js";
import stripeRoutes from './routes/stripeRoutes.js';

import blogPostRoutes from "./routes/blogPostRoutes.js";
import managePostRoutes from "./routes/managePostRoutes.js";
import calendarRoutes from './routes/calendarRoutes.js';
import additionalServiceRoutes from './routes/additionalServiceRoutes.js';
import eventRequestRoutes from './routes/eventRequestRoutes.js';

import organizerRoutes from './routes/organizerRoutes.js';

import memberApplicationRoutes from './routes/memberApplicationRoutes.js';
import adminApplicationRoutes from './routes/adminApplicationRoutes.js';
import chatGroupRoutes from './routes/chatGroupRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import directChatRoutes from './routes/directChatRoutes.js';

import adminRoutes from './routes/adminRoutes.js';

import ContentcreatorRoutes from './routes/ContentcreatorRoutes.js'; 


//team manager
import assignmentRoutes from './routes/assignmentRoutes.js';
import eventRoutes from './routes/eventRoutes.js'; 

import path from "path";
import { fileURLToPath } from "url";
import mongoose from 'mongoose';
import DirectChat from './models/DirectChat.js';

import practiceRoutes from './routes/practiceRoutes.js';
import practiceRequestRoutes from './routes/practiceRequestRoutes.js';

import certificateRoutes from './routes/certificateRoutes.js';
import sponsorshipRoutes from './routes/sponsorshipRoutes.js';



import merchandiseRoutes from './routes/merchandiseRoutes.js';


import collaborationRoutes from './routes/collaborationRoutes.js'

import chatbotRoutes from './routes/chatbot.js';


// Load environment variables
dotenv.config();

// Generate a new JWT secret on each server start to invalidate existing tokens on restart
const dynamicSecret = crypto.randomBytes(64).toString('hex');
process.env.JWT_SECRET = dynamicSecret;

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


// Special middleware for Stripe webhooks
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));


// Add multer error handling middleware
app.use(handleMulterError);

// Connect to MongoDB
connectDB();

// Memebr Application Routes

app.use('/api/member-applications', memberApplicationRoutes);

// Admin Application Routes
app.use('/api/admin/applications', adminApplicationRoutes);

// User Routes

app.use('/api/users', userRoutes);
// chatGroupRoutes
app.use('/api/chat-groups', chatGroupRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/direct-chats', directChatRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/organizers', organizerRoutes);

// Import Routes

// Financial Management Routes
app.use('/api/finance', financialRoutes);

app.use('/api/assignments', assignmentRoutes);

// Mount Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/transaction", transactionRoutes);

// Additional routes (Team Manager, Packages, etc.)
app.use('/api/calendar', calendarRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/services', additionalServiceRoutes);
app.use('/api/event-requests', eventRequestRoutes);

app.use("/api/finance", financialRoutes);
app.use("/api/member-applications", memberApplicationRoutes);
app.use("/api/admin/applications", adminApplicationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat-groups", chatGroupRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/organizers", organizerRoutes);
app.use("/api/blogposts", blogPostRoutes);
app.use("/api/media", managePostRoutes);
app.use("/api/content-creators", ContentcreatorRoutes);

app.use('/api/practices', practiceRoutes);
app.use('/api/practice-requests', practiceRequestRoutes);


app.use('/api/merchandise', merchandiseRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Stripe Routes
app.use('/api/stripe', stripeRoutes);


// API Endpoints
app.get('/register/member/application', (req, res) => {
    res.send('API Working');
});

// Serve static files (if needed for media uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use('/api/events', eventRoutes);
app.use('/api/assignments', assignmentRoutes);



// API Health Check
app.get("/", (req, res) => {
    res.send("API is running...");
});

app.use('/api', collaborationRoutes);

app.use('/api', certificateRoutes);

app.use('/api', sponsorshipRoutes);




// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));