import { Hono } from 'hono';
import { ShareService } from './share.service';

const shareRoutes = new Hono();

shareRoutes.get('/:token', async (c) => {
  const token = c.req.param('token');
  try {
    const plan = await ShareService.getSharedPlan(token);
    if (!plan) {
      return c.json({ error: 'Plan not found or expired' }, 404);
    }
    return c.json(plan);
  } catch (error) {
    console.error('Failed to fetch shared plan:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export { shareRoutes };
