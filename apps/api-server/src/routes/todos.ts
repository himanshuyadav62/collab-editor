import { Router, Request, Response } from 'express';
import type { Router as RouterType } from 'express';
import { pool } from '../db/pool.js';

const router: RouterType = Router();

// GET /api/todos - List all todos for user
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, title, completed, group_ids, tags, due_date, created_at, updated_at, deleted_at 
       FROM todos 
       WHERE user_id = $1 
       ORDER BY updated_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// GET /api/todos/:id - Get single todo
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, title, completed, group_ids, tags, due_date, created_at, updated_at, deleted_at 
       FROM todos 
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ error: 'Failed to fetch todo' });
  }
});

// POST /api/todos - Create todo
router.post('/', async (req: Request, res: Response) => {
  const { id, title, completed, group_ids, tags, due_date, created_at, updated_at, deleted_at } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO todos (id, user_id, title, completed, group_ids, tags, due_date, created_at, updated_at, deleted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, title, completed, group_ids, tags, due_date, created_at, updated_at, deleted_at`,
      [id, req.userId, title || '', completed || false, group_ids || [], tags || [], 
       due_date || null, created_at || new Date(), updated_at || new Date(), deleted_at || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// PUT /api/todos/:id - Update todo
router.put('/:id', async (req: Request, res: Response) => {
  const { title, completed, group_ids, tags, due_date, deleted_at } = req.body;
  try {
    const result = await pool.query(
      `UPDATE todos 
       SET title = COALESCE($1, title), 
           completed = COALESCE($2, completed),
           group_ids = COALESCE($3, group_ids),
           tags = COALESCE($4, tags),
           due_date = $5,
           updated_at = CURRENT_TIMESTAMP,
           deleted_at = $6
       WHERE id = $7 AND user_id = $8
       RETURNING id, title, completed, group_ids, tags, due_date, created_at, updated_at, deleted_at`,
      [title, completed, group_ids, tags, due_date || null, deleted_at || null, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// DELETE /api/todos/:id - Delete todo
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING id`,
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// POST /api/todos/batch - Batch upsert todos
router.post('/batch', async (req: Request, res: Response) => {
  const { todos } = req.body;
  if (!Array.isArray(todos)) {
    return res.status(400).json({ error: 'todos must be an array' });
  }

  try {
    const results = [];
    for (const todo of todos) {
      const result = await pool.query(
        `INSERT INTO todos (id, user_id, title, completed, group_ids, tags, due_date, created_at, updated_at, deleted_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           completed = EXCLUDED.completed,
           group_ids = EXCLUDED.group_ids,
           tags = EXCLUDED.tags,
           due_date = EXCLUDED.due_date,
           updated_at = EXCLUDED.updated_at,
           deleted_at = EXCLUDED.deleted_at
         RETURNING id, title, completed, group_ids, tags, due_date, created_at, updated_at, deleted_at`,
        [todo.id, req.userId, todo.title || '', todo.completed || false, todo.group_ids || [], 
         todo.tags || [], todo.due_date || null, todo.created_at || new Date(), 
         todo.updated_at || new Date(), todo.deleted_at || null]
      );
      results.push(result.rows[0]);
    }
    res.json(results);
  } catch (error) {
    console.error('Error batch upserting todos:', error);
    res.status(500).json({ error: 'Failed to batch upsert todos' });
  }
});

export default router;
