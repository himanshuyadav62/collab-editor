import * as Y from 'yjs';
import { encodeState, applyUpdate } from '@collab-editor/collab';
import pg from 'pg';
import { config } from '../config/env.js';

const { Pool } = pg;

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: config.databaseUrl,
});

// Initialize database table
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        name VARCHAR(255) PRIMARY KEY,
        state BYTEA NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// Initialize on module load
initDatabase();

/**
 * Load a document from database
 */
export async function loadDocument(documentName: string): Promise<Y.Doc> {
  const doc = new Y.Doc();
  
  try {
    const result = await pool.query(
      'SELECT state FROM documents WHERE name = $1',
      [documentName]
    );
    
    if (result.rows.length > 0 && result.rows[0].state) {
      const state = new Uint8Array(result.rows[0].state);
      applyUpdate(doc, state);
      console.log(`Loaded document from DB: ${documentName}`);
    } else {
      console.log(`Created new document: ${documentName}`);
    }
  } catch (error) {
    console.error(`Error loading document ${documentName}:`, error);
  }
  
  return doc;
}

/**
 * Save a document to database
 */
export async function saveDocument(documentName: string, doc: Y.Doc): Promise<void> {
  try {
    const state = encodeState(doc);
    const buffer = Buffer.from(state);
    
    await pool.query(
      `INSERT INTO documents (name, state, updated_at) 
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (name) 
       DO UPDATE SET state = $2, updated_at = CURRENT_TIMESTAMP`,
      [documentName, buffer]
    );
    
    console.log(`Saved document to DB: ${documentName} (${state.byteLength} bytes)`);
  } catch (error) {
    console.error(`Error saving document ${documentName}:`, error);
  }
}

/**
 * Delete a document from database
 */
export async function deleteDocument(documentName: string): Promise<void> {
  try {
    await pool.query('DELETE FROM documents WHERE name = $1', [documentName]);
    console.log(`Deleted document: ${documentName}`);
  } catch (error) {
    console.error(`Error deleting document ${documentName}:`, error);
  }
}

/**
 * List all documents
 */
export async function listDocuments(): Promise<string[]> {
  try {
    const result = await pool.query('SELECT name FROM documents ORDER BY updated_at DESC');
    return result.rows.map(row => row.name);
  } catch (error) {
    console.error('Error listing documents:', error);
    return [];
  }
}
