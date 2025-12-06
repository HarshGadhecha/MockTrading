import * as SQLite from 'expo-sqlite';
import { APP_CONFIG } from '../constants';
import { CREATE_TABLES, CREATE_INDEXES, INITIAL_DATA } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the database
 */
export async function initDatabase(): Promise<void> {
  try {
    db = await SQLite.openDatabaseAsync(APP_CONFIG.DATABASE_NAME);

    // Create tables
    for (const tableSQL of Object.values(CREATE_TABLES)) {
      await db.execAsync(tableSQL);
    }

    // Create indexes
    for (const indexSQL of Object.values(CREATE_INDEXES)) {
      await db.execAsync(indexSQL);
    }

    // Insert initial data
    for (const initialSQL of Object.values(INITIAL_DATA)) {
      await db.execAsync(initialSQL);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Get the database instance
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
}

/**
 * Execute a raw SQL query
 */
export async function executeQuery<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const database = getDatabase();
  try {
    const result = await database.getAllAsync<T>(sql, params);
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

/**
 * Execute a raw SQL statement (for INSERT, UPDATE, DELETE)
 */
export async function executeStatement(
  sql: string,
  params: any[] = []
): Promise<SQLite.SQLiteRunResult> {
  const database = getDatabase();
  try {
    const result = await database.runAsync(sql, params);
    return result;
  } catch (error) {
    console.error('Error executing statement:', error);
    throw error;
  }
}

/**
 * Execute multiple SQL statements in a transaction
 */
export async function executeTransaction(
  statements: Array<{ sql: string; params?: any[] }>
): Promise<void> {
  const database = getDatabase();
  try {
    await database.withTransactionAsync(async () => {
      for (const stmt of statements) {
        await database.runAsync(stmt.sql, stmt.params || []);
      }
    });
  } catch (error) {
    console.error('Error executing transaction:', error);
    throw error;
  }
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
    console.log('Database closed');
  }
}

/**
 * Reset the database (for testing/development)
 */
export async function resetDatabase(): Promise<void> {
  const database = getDatabase();
  try {
    // Drop all tables
    await database.execAsync('DROP TABLE IF EXISTS wallet;');
    await database.execAsync('DROP TABLE IF EXISTS wallet_transactions;');
    await database.execAsync('DROP TABLE IF EXISTS transactions;');
    await database.execAsync('DROP TABLE IF EXISTS portfolio;');
    await database.execAsync('DROP TABLE IF EXISTS favourites;');
    await database.execAsync('DROP TABLE IF EXISTS settings;');

    // Reinitialize
    await initDatabase();

    console.log('Database reset successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}

// Export database instance getter
export default {
  initDatabase,
  getDatabase,
  executeQuery,
  executeStatement,
  executeTransaction,
  closeDatabase,
  resetDatabase,
};
