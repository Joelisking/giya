import { Hono } from 'hono';
import { AuthService } from './auth.service';

const authRoutes = new Hono();

authRoutes.post('/signup', async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password)
      return c.json({ error: 'Email and password required' }, 400);

    const result = await AuthService.signup(email, password);
    return c.json(result, 201);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

authRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password)
      return c.json({ error: 'Email and password required' }, 400);

    const result = await AuthService.login(email, password);
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message }, 401);
  }
});

export { authRoutes };
