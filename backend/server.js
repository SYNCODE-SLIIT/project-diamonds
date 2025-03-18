import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// App Config
const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Log the current database and collection
mongoose.connection.on('connected', () => {
    console.log("Connected to MongoDB!");
    console.log("Current Database:", mongoose.connection.name); // Log database name
  });

// Middlewares
app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send('API Working');
});

// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));