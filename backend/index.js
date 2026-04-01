import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Apartment Rental Backend API');
});

// Authentication routes
app.use('/api/auth', (await import('./routes/auth.js')).default);
// Apartment management routes
app.use('/api/apartments', (await import('./routes/apartments.js')).default);
// Rental application routes
app.use('/api/applications', (await import('./routes/applications.js')).default);
// Admin routes
app.use('/api/admin', (await import('./routes/admin.js')).default);
// Payment routes
app.use('/api/payments', (await import('./routes/payments.js')).default);
// Tenant routes
app.use('/api/tenant', (await import('./routes/tenant.js')).default);

// MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});
