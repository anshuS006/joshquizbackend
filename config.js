const { MongoClient } = require('mongodb');
let db;

const connectToMongoDB = async (logger) => {
  try {
    const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017';
    const dbName = process.env.DB_NAME || 'quizDB';
    const client = await MongoClient.connect(mongoURL);
    logger.info('Connected to MongoDB');
    db = client.db(dbName);
  } catch (err) {
    logger.error('Failed to connect to MongoDB:', err);
    process.exit(1); // Exit if the database connection fails
  }
};

const getDB = () => db;

module.exports = { connectToMongoDB, getDB };
