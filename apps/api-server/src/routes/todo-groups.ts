import { Router, Request, Response } from 'express';
import type { Router as RouterType } from 'express';
import { pool } from '../db/pool.js';

const router: RouterType = Router();

// GET /api/todo-groups - List all groups for user
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, color, is_default, created_at 
       FROM todo_groups 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching todo groups:', error);
    res.status(500).json({ error: 'Failed to fetch todo groups' });
  }
});

// POST /api/todo-groups - Create group
router.post('/', async (req: Request, res: Response) => {
  const { id, name, color, is_default, created_at } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO todo_groups (id, user_id, name, color, is_default, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, color, is_default, created_at`,
      [id, req.userId, name, color || '#6366f1', is_default || false, created_at || new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating todo group:', error);
    res.status(500).json({ error: 'Failed to create todo group' });
  }
});

// PUT /api/todo-groups/:id - Update group
router.put('/:id', async (req: Request, res: Response) => {
  const { name, color, is_default } = req.body;
  try {
    const result = await pool.query(
      `UPDATE todo_groups 
       SET name = COALESCE($1, name), 
           color = COALESCE($2, color),
           is_default = COALESCE($3, is_default)
       WHERE id = $4 AND user_id = $5
       RETURNING id, name, color, is_default, created_at`,
      [name, color, is_default, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo group not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating todo group:', error);
    res.status(500).json({ error: 'Failed to update todo group' });
  }
});

// DELETE /api/todo-groups/:id - Delete group
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `DELETE FROM todo_groups WHERE id = $1 AND user_id = $2 RETURNING id`,
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo group not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting todo group:', error);
    res.status(500).json({ error: 'Failed to delete todo group' });
  }
});

// POST /api/todo-groups/batch - Batch upsert groups
router.post('/batch', async (req: Request, res: Response) => {
  const { groups } = req.body;
  if (!Array.isArray(groups)) {
    return res.status(400).json({ error: 'groups must be an array' });
  }

  try {
    const results = [];
    for (const group of groups) {
      const result = await pool.query(
        `INSERT INTO todo_groups (id, user_id, name, color, is_default, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           color = EXCLUDED.color,
           is_default = EXCLUDED.is_default
         RETURNING id, name, color, is_default, created_at`,
        [group.id, req.userId, group.name, group.color || '#6366f1', 
         group.is_default || false, group.created_at || new Date()]
      );
      results.push(result.rows[0]);
    }
    res.json(results);
  } catch (error) {
    console.error('Error batch upserting todo groups:', error);
    res.status(500).json({ error: 'Failed to batch upsert todo groups' });
  }
});

export default router;
