const express = require('express');
const helmet = require('helmet');
const winston = require('winston');
const { connectToMongoDB } = require('./config');
const questionRoutes = require('./routes/questionRoutes');
const categoryRoutes = require('./routes/categoryRoutes'); // Import Category Routes
const cors = require('cors'); // Import the cors package


const app = express();

// Use CORS middleware
app.use(cors());


const path = require('path');

const port = process.env.PORT || 3000;

// Setup logging using Winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console(),
  ],
});

app.use(helmet());
app.use(express.json()); // To handle JSON data

// Connect to MongoDB
connectToMongoDB(logger);

// Routes
app.use('/questions', questionRoutes);
app.use('/singlequestion', questionRoutes);
app.use('/categories', categoryRoutes); // Add Category Routes

// Global error handler
app.use((err, req, res, next) => {
  logger.error('An error occurred:', err);
  res.status(500).json({ error: 'An internal server error occurred' });
});

// Customize CSP to allow inline scripts (not recommended)
app.use(helmet.contentSecurityPolicy({
  directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
  },
}));
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.get('/quiz/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/upload.html'));
});

// Start the server
app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});
