import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Avoid unhandled event crash when a second instance is started.
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the existing server or run with a different PORT.`);
      process.exit(1);
    }

    console.error('Server startup error:', err);
    process.exit(1);
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});
