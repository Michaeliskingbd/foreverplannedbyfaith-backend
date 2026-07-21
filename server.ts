import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import rsvpRoutes from './routes/rsvpRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (important for getting correct client IP when hosted on Render/Heroku etc)
app.set('trust proxy', true);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/rsvp', rsvpRoutes);

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://michaeliskingbd_db_user:v4OuYspO6pmGAzOq@rsvp.g4bnmye.mongodb.net/?appName=rsvp';



mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });
