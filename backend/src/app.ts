import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { config } from 'dotenv';
import { authRoutes } from './modules/auth/auth.routes';
import { aiRoutes } from './modules/ai/ai.routes';
import { shareRoutes } from './modules/users/share.routes';
import { userRoutes } from './modules/users/user.routes';

// Load environment variables
config();

const app = new Hono();

// Enable CORS
app.use('/*', cors());

// Health Check
app.get('/', (c) =>
  c.text('Giya Compass Backend Running (Production Phase)')
);

// Public Routes
app.route('/auth', authRoutes);
app.route('/share', shareRoutes);

// Protected Routes Middleware
app.use(
  '/api/*',
  jwt({
    secret: process.env.JWT_SECRET || 'fallback_secret',
    alg: 'HS256',
  })
);

// Protected Routes
app.route('/api', aiRoutes);
app.route('/api/user', userRoutes);

export default app;
