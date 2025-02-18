import express, { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL as string;
const JWT_SECRET = process.env.JWT_SECRET as string;

if (!DATABASE_URL || !JWT_SECRET) {
  console.error('Missing DATABASE_URL or JWT_SECRET in environment variables.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const app = express();

// Enable CORS to allow cross-origin requests
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

interface AuthRequest extends Request {
  user?: { id: number; username: string };
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    res.status(401).json({ message: 'Missing token' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ message: 'Invalid token' });
      return;
    }
    req.user = user as { id: number; username: string };
    next();
  });
};

// POST /auth/register – Create a new user
app.post('/auth/register', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }

  try {
    // Check if username already exists
    const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userExists.rows.length > 0) {
      res.status(400).json({ message: 'Username already exists' });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const newUser = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );

    res.status(201).json({ message: 'User registered', user: newUser.rows[0] });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
    return;
  }
});

// POST /auth/login – Login user and return a token
app.post('/auth/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }

  try {
    // Find user by username
    const userQuery = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userQuery.rows.length === 0) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const user = userQuery.rows[0];
    // Compare provided password with hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Create JWT token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
    return;
  }
});

// GET /tasks – Retrieve tasks for the logged-in user
app.get('/tasks', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const tasks = await pool.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY id ASC', [userId]);
    res.json(tasks.rows);
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving tasks' });
    return;
  }
});

// POST /tasks – Create a new task
app.post('/tasks', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description } = req.body;
  if (!title) {
    res.status(400).json({ message: 'Title is required' });
    return;
  }

  try {
    const userId = req.user!.id;
    const newTask = await pool.query(
      'INSERT INTO tasks (title, description, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, description || null, userId]
    );
    res.status(201).json(newTask.rows[0]);
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating task' });
    return;
  }
});

// PUT /tasks/:id – Update an existing task
app.put('/tasks/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const taskId = req.params.id;
  const { title, description, isComplete } = req.body;

  try {
    const userId = req.user!.id;
    // Check if task exists and belongs to the user
    const taskQuery = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);
    if (taskQuery.rows.length === 0) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Update the task using COALESCE so that null/undefined values leave the original value unchanged
    const updatedTask = await pool.query(
      `UPDATE tasks SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         is_complete = COALESCE($3, is_complete)
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [title, description, isComplete, taskId, userId]
    );

    res.json(updatedTask.rows[0]);
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating task' });
    return;
  }
});

// DELETE /tasks/:id – Delete a task
app.delete('/tasks/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const taskId = req.params.id;

  try {
    const userId = req.user!.id;
    // Check if task exists and belongs to the user
    const taskQuery = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);
    if (taskQuery.rows.length === 0) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);
    res.json({ message: 'Task deleted successfully' });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting task' });
    return;
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});