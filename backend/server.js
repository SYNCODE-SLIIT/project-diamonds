import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';
import financialRoutes from './routes/financialRoutes.js';

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

// Memebr Application Routes
import memberApplicationRoutes from '../backend/routes/memberApplicationRoutes.js';
app.use('/api/member-applications', memberApplicationRoutes);
import adminApplicationRoutes from './routes/adminApplicationRoutes.js';
app.use('/api/admin/applications', adminApplicationRoutes);
// User Routes
import userRoutes from './routes/userRoutes.js';
app.use('/api/users', userRoutes);

// Other imports and middleware setup...
import organizerRoutes from './routes/organizerRoutes.js';

// Mount the organizer routes
app.use('/api/organizers', organizerRoutes);


app.use('/api/finance', financialRoutes);

// API Endpoints
app.get('/register/member/application', (req, res) => {
    res.send('API Working');
});

// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));