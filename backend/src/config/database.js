// ============================================
// Database Configuration
// PostgreSQL (Chat) + MongoDB (Products)
// ============================================

const { Pool } = require('pg');
const { MongoClient } = require('mongodb');
const logger = require('./logger');

// ============================================
// PostgreSQL Configuration
// ============================================

const pgPool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'chat_database',
  user: process.env.POSTGRES_USER || 'chat_user',
  password: process.env.POSTGRES_PASSWORD || 'chat_password_2024',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// PostgreSQL connection test
async function connectPostgres() {
  try {
    const client = await pgPool.connect();
    const result = await client.query('SELECT NOW()');
    logger.info('✅ PostgreSQL connected:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    logger.error('❌ PostgreSQL connection failed:', error.message);
    throw error;
  }
}

// PostgreSQL query wrapper
async function queryPostgres(text, params) {
  const start = Date.now();
  try {
    const result = await pgPool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Query error:', { text, error: error.message });
    throw error;
  }
}

// ============================================
// MongoDB Configuration
// ============================================

let mongoClient = null;
let mongodb = null;

const MONGODB_URI = process.env.MONGODB_URI ||
  'mongodb://admin:mongo_password_2024@mongodb:27017/product_catalog?authSource=admin';

async function connectMongoDB() {
  try {
    mongoClient = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    await mongoClient.connect();
    mongodb = mongoClient.db('product_catalog');

    // Test connection
    await mongodb.command({ ping: 1 });
    logger.info('✅ MongoDB connected: product_catalog');

    return mongodb;
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

// Get MongoDB database instance
function getMongoDb() {
  if (!mongodb) {
    throw new Error('MongoDB not connected. Call connectMongoDB() first.');
  }
  return mongodb;
}

// Get MongoDB collection
function getCollection(collectionName) {
  return getMongoDb().collection(collectionName);
}

// ============================================
// Graceful Shutdown
// ============================================

async function closeDatabases() {
  try {
    // Close PostgreSQL
    await pgPool.end();
    logger.info('PostgreSQL pool closed');

    // Close MongoDB
    if (mongoClient) {
      await mongoClient.close();
      logger.info('MongoDB connection closed');
    }
  } catch (error) {
    logger.error('Error closing databases:', error);
  }
}

process.on('SIGTERM', closeDatabases);
process.on('SIGINT', closeDatabases);

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // PostgreSQL
  pgPool,
  connectPostgres,
  queryPostgres,

  // MongoDB
  connectMongoDB,
  getMongoDb,
  getCollection,

  // Cleanup
  closeDatabases
};
