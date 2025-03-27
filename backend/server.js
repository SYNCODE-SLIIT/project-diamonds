import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';
import path from "path";
import { fileURLToPath } from "url";

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

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import financialRoutes from './routes/financialRoutes.js';
import transactionRoutes from "./routes/transactionRoutes.js";
import packageRoutes from './routes/packageRoutes.js';
import memberApplicationRoutes from './routes/memberApplicationRoutes.js';
import adminApplicationRoutes from './routes/adminApplicationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatGroupRoutes from './routes/chatGroupRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import organizerRoutes from './routes/organizerRoutes.js';
import blogPostRoutes from "./routes/blogPostRoutes.js";
import managePostRoutes from "./routes/managePostRoutes.js";
import ContentcreatorRoutes from "./routes/ContentcreatorRoutes.js"

// Mount Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/transaction", transactionRoutes);
app.use("/api/finance", financialRoutes);
app.use("/api/member-applications", memberApplicationRoutes);
app.use("/api/admin/applications", adminApplicationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat-groups", chatGroupRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/organizers", organizerRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/blogposts", blogPostRoutes);
app.use("/api/media", managePostRoutes);
app.use("/api/content-creators", ContentcreatorRoutes);
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
