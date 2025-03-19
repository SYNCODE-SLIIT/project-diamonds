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

// Connect to MongoDB
connectDB();

// Middlewares
app.use(express.json());
app.use(cors());

app.use('/api/finance', financialRoutes);

// API Endpoints
app.get('/', (req, res) => {
    res.send('API Working');
});

// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));