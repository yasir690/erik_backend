// Import dotenv to load environment variables
require('dotenv').config();

const dbConfig = {
  // MongoDB connection string from environment variables
  db: process.env.DB_COLLECTION,
};

module.exports = dbConfig;
