import express from 'express';
import dotenv from 'dotenv';
import eventRoutes from './routes/event.route.js';
import aiRoutes from './routes/ai.route.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

// Load env variables
dotenv.config();
const port = process.env.PORT || 4000;

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello World!' });
});

app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/ai', aiRoutes);

// Error Middleware
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is running...\nLocal: http://localhost:${port}`);
});
