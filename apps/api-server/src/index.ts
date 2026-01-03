import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { authMiddleware } from './middleware/auth.js';
import notesRouter from './routes/notes.js';
import todosRouter from './routes/todos.js';
import todoGroupsRouter from './routes/todo-groups.js';
import workflowsRouter from './routes/workflows.js';

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protected API routes
app.use('/api/notes', authMiddleware, notesRouter);
app.use('/api/todos', authMiddleware, todosRouter);
app.use('/api/todo-groups', authMiddleware, todoGroupsRouter);
app.use('/api/workflows', authMiddleware, workflowsRouter);

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`🚀 API server running on port ${config.port}`);
});
