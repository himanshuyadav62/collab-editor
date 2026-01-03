import { pool } from './pool.js';

async function migrate() {
  console.log('Running database migrations...');

  try {
    // Notes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id UUID PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(500) NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)`);
    console.log('✓ Notes table created');

    // Todos table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id UUID PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(500) NOT NULL DEFAULT '',
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        group_ids TEXT[] DEFAULT '{}',
        tags TEXT[] DEFAULT '{}',
        due_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id)`);
    console.log('✓ Todos table created');

    // Todo groups table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todo_groups (
        id UUID PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(50) NOT NULL DEFAULT '#6366f1',
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_todo_groups_user_id ON todo_groups(user_id)`);
    console.log('✓ Todo groups table created');

    // Workflows table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS workflows (
        id UUID PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        name VARCHAR(500) NOT NULL DEFAULT '',
        data JSONB DEFAULT '{}',
        todos TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id)`);
    console.log('✓ Workflows table created');

    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
