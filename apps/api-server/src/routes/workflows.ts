import { Router, Request, Response } from 'express';
import type { Router as RouterType } from 'express';
import { pool } from '../db/pool.js';

const router: RouterType = Router();

// GET /api/workflows - List all workflows for user
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, data, todos, created_at, updated_at, deleted_at 
       FROM workflows 
       WHERE user_id = $1 AND deleted_at IS NULL
       ORDER BY updated_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

// GET /api/workflows/:id - Get single workflow
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, data, todos, created_at, updated_at, deleted_at 
       FROM workflows 
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({ error: 'Failed to fetch workflow' });
  }
});

// POST /api/workflows - Create workflow
router.post('/', async (req: Request, res: Response) => {
  const { id, name, data, todos, created_at, updated_at, deleted_at } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO workflows (id, user_id, name, data, todos, created_at, updated_at, deleted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, data, todos, created_at, updated_at, deleted_at`,
      [id, req.userId, name || '', data || {}, todos || [], 
       created_at || new Date(), updated_at || new Date(), deleted_at || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
});

// PUT /api/workflows/:id - Update workflow
router.put('/:id', async (req: Request, res: Response) => {
  const { name, data, todos, deleted_at } = req.body;
  try {
    const result = await pool.query(
      `UPDATE workflows 
       SET name = COALESCE($1, name), 
           data = COALESCE($2, data),
           todos = COALESCE($3, todos),
           updated_at = CURRENT_TIMESTAMP,
           deleted_at = $4
       WHERE id = $5 AND user_id = $6
       RETURNING id, name, data, todos, created_at, updated_at, deleted_at`,
      [name, data, todos, deleted_at || null, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({ error: 'Failed to update workflow' });
  }
});

// DELETE /api/workflows/:id - Delete workflow
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `DELETE FROM workflows WHERE id = $1 AND user_id = $2 RETURNING id`,
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
});

// POST /api/workflows/batch - Batch upsert workflows
router.post('/batch', async (req: Request, res: Response) => {
  const { workflows } = req.body;
  if (!Array.isArray(workflows)) {
    return res.status(400).json({ error: 'workflows must be an array' });
  }

  try {
    const results = [];
    for (const workflow of workflows) {
      const result = await pool.query(
        `INSERT INTO workflows (id, user_id, name, data, todos, created_at, updated_at, deleted_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           data = EXCLUDED.data,
           todos = EXCLUDED.todos,
           updated_at = EXCLUDED.updated_at,
           deleted_at = EXCLUDED.deleted_at
         RETURNING id, name, data, todos, created_at, updated_at, deleted_at`,
        [workflow.id, req.userId, workflow.name || '', workflow.data || {}, 
         workflow.todos || [], workflow.created_at || new Date(), 
         workflow.updated_at || new Date(), workflow.deleted_at || null]
      );
      results.push(result.rows[0]);
    }
    res.json(results);
  } catch (error) {
    console.error('Error batch upserting workflows:', error);
    res.status(500).json({ error: 'Failed to batch upsert workflows' });
  }
});

export default router;
