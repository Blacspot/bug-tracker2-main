/**
 * DATABASE CONFIGURATION
 *
 * Handles MSSQL connection setup and management.
 * Uses connection pooling for efficient database access.
 * Provides centralized database configuration and error handling.
 */

import * as sql from "mssql";
import dotenv from "dotenv";
import assert from "assert";

// Load environment variables from .env file
dotenv.config();

// Validate that the required environment variables are present
// This prevents runtime errors from missing database configuration
assert(process.env.SQL_SERVER, "❌ Missing environment variable: SQL_SERVER");
assert(process.env.SQL_USER, "❌ Missing environment variable: SQL_USER");
assert(process.env.SQL_PWD, "❌ Missing environment variable: SQL_PWD");
assert(process.env.SQL_DB, "❌ Missing environment variable: SQL_DB");

/**
 * MSSQL connection pool configuration
 * Uses individual environment variables for connection
 */
const config: sql.config = {
  server: process.env.SQL_SERVER,
  user: process.env.SQL_USER,
  password: process.env.SQL_PWD,
  database: process.env.SQL_DB,
  options: {
    encrypt: process.env.SQL_ENCRYPT === 'true', // Enable encryption if set
    trustServerCertificate: true, // For local/dev; adjust for production
    enableArithAbort: true, // Recommended for MSSQL
  },
  pool: {
    max: 10, // Maximum number of connections in pool
    min: 0,  // Minimum number of connections in pool
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  },
};

const pool = new sql.ConnectionPool(config);

// Connection retry configuration
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 5000;

/**
 * Get MSSQL connection pool
 *
 * Implements connection pooling for efficient database access.
 * Includes automatic retry logic for connection failures.
 *
 * @returns Promise<sql.ConnectionPool> - Database connection pool
 * @throws Error if connection fails after all retries
 */
export const getPool = async (): Promise<sql.ConnectionPool> => {
  // Test the connection with retry logic
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await pool.connect();
      console.log("\x1b[32m[DB]\x1b[0m  Connected successfully to MSSQL");
      return pool;
    } catch (error: any) {
      const code = error.code || "UNKNOWN";
      const message = error.message || "No error message provided";

      console.error(`\x1b[31m[DB]\x1b[0m  Connection failed [${code}]: ${message}`);

      // Provide helpful error messages for common connection issues
      switch (code) {
        case "ETIMEOUT":
          console.error("💡 Timeout — check network/firewall settings or server availability.");
          break;
        case "ESOCKET":
          console.error("💡 Socket error — verify SQL_SERVER in your .env file.");
          break;
        case "ELOGIN":
          console.error("💡 Authentication failed — verify SQL_USER and SQL_PWD in your .env file.");
          break;
        default:
          console.error("💡 Unknown error — inspect SQL_SERVER, SQL_USER, SQL_PWD, and SQL_DB in your .env file.");
      }

      // Retry connection if attempts remain
      if (attempt < MAX_RETRIES) {
        console.log(`\x1b[33m[DB]\x1b[0m ⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        console.error("\x1b[31m[DB]\x1b[0m 🚨 Max retries reached. Unable to connect to MSSQL.");
        throw error;
      }
    }
  }

  throw new Error("MSSQL connection failed after multiple retries.");
};

/**
 * Close database connection pool gracefully
 *
 * Should be called during application shutdown to clean up resources.
 * Handles errors during pool closure.
 */
export const closePool = async (): Promise<void> => {
  try {
    await pool.close();
    console.log("\x1b[33m[DB]\x1b[0m 🔒 MSSQL connection pool closed gracefully.");
  } catch (err) {
    console.error("\x1b[31m[DB]\x1b[0m ⚠️ Error closing MSSQL pool:", err);
  }
};