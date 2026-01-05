import { Router, Request, Response } from 'express';
import type { Router as RouterType } from 'express';
import { pool } from '../db/pool.js';

const router: RouterType = Router();

// GET /api/notes - List all notes for user
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, title, content, created_at, updated_at, deleted_at 
       FROM notes 
       WHERE user_id = $1 
       ORDER BY updated_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// GET /api/notes/:id - Get single note
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, title, content, created_at, updated_at, deleted_at 
       FROM notes 
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// POST /api/notes - Create note
router.post('/', async (req: Request, res: Response) => {
  const { id, title, content, created_at, updated_at, deleted_at } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO notes (id, user_id, title, content, created_at, updated_at, deleted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title, content, created_at, updated_at, deleted_at`,
      [id, req.userId, title || '', content || '', created_at || new Date(), updated_at || new Date(), deleted_at || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// PUT /api/notes/:id - Update note
router.put('/:id', async (req: Request, res: Response) => {
  const { title, content, deleted_at } = req.body;
  try {
    const result = await pool.query(
      `UPDATE notes 
       SET title = COALESCE($1, title), 
           content = COALESCE($2, content), 
           updated_at = CURRENT_TIMESTAMP,
           deleted_at = $3
       WHERE id = $4 AND user_id = $5
       RETURNING id, title, content, created_at, updated_at, deleted_at`,
      [title, content, deleted_at || null, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// PATCH /api/notes/:id/content - Update note content only (for real-time saving)
router.patch('/:id/content', async (req: Request, res: Response) => {
  const { content } = req.body;
  try {
    const result = await pool.query(
      `UPDATE notes 
       SET content = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING id, updated_at`,
      [content, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating note content:', error);
    res.status(500).json({ error: 'Failed to update note content' });
  }
});

// PATCH /api/notes/:id/title - Update note title only
router.patch('/:id/title', async (req: Request, res: Response) => {
  const { title } = req.body;
  try {
    const result = await pool.query(
      `UPDATE notes 
       SET title = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING id, updated_at`,
      [title, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating note title:', error);
    res.status(500).json({ error: 'Failed to update note title' });
  }
});

// DELETE /api/notes/:id - Delete note
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id`,
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// POST /api/notes/batch - Batch upsert notes
router.post('/batch', async (req: Request, res: Response) => {
  const { notes } = req.body;
  if (!Array.isArray(notes)) {
    return res.status(400).json({ error: 'notes must be an array' });
  }

  try {
    const results = [];
    for (const note of notes) {
      const result = await pool.query(
        `INSERT INTO notes (id, user_id, title, content, created_at, updated_at, deleted_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           content = EXCLUDED.content,
           updated_at = EXCLUDED.updated_at,
           deleted_at = EXCLUDED.deleted_at
         RETURNING id, title, content, created_at, updated_at, deleted_at`,
        [note.id, req.userId, note.title || '', note.content || '', 
         note.created_at || new Date(), note.updated_at || new Date(), note.deleted_at || null]
      );
      results.push(result.rows[0]);
    }
    res.json(results);
  } catch (error) {
    console.error('Error batch upserting notes:', error);
    res.status(500).json({ error: 'Failed to batch upsert notes' });
  }
});

export default router;
