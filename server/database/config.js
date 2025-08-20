const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database configuration
const isProduction = process.env.NODE_ENV === 'production';
const DATABASE_URL = process.env.DATABASE_URL;

let db;

if (isProduction && DATABASE_URL) {
  // Use PostgreSQL in production (Railway)
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  db = {
    // PostgreSQL query methods
    run: (query, params = []) => {
      return new Promise((resolve, reject) => {
        pool.query(query, params, (err, result) => {
          if (err) reject(err);
          else resolve({ lastID: result.rows[0]?.id || result.insertId });
        });
      });
    },
    
    get: (query, params = []) => {
      return new Promise((resolve, reject) => {
        pool.query(query, params, (err, result) => {
          if (err) reject(err);
          else resolve(result.rows[0] || null);
        });
      });
    },
    
    all: (query, params = []) => {
      return new Promise((resolve, reject) => {
        pool.query(query, params, (err, result) => {
          if (err) reject(err);
          else resolve({ users: result.rows || [] });
        });
      });
    },
    
    close: () => pool.end()
  };
} else {
  // Use SQLite in development
  const dbPath = path.join(__dirname, 'genconnect.db');
  db = new sqlite3.Database(dbPath);
}

module.exports = { db, isProduction };
