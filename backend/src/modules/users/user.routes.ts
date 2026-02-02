import { Hono } from 'hono';
import { UserService } from './user.service';
import { ReflectionService } from './reflection.service';
import { ShareService } from './share.service';
import {
  SavedPathsService,
  SavedPreviewsService,
  MilestoneService,
  GrowthCheckpointService,
} from './progress.service';
import { getLLMProvider } from '../../llm/factory';
import { SYSTEM_PROMPTS } from '../../constants';
import { Type } from '@google/genai';

const userRoutes = new Hono();

// Shared Schema Definition
const CAREER_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      title: { type: Type.STRING },
      reason: { type: Type.STRING },
      confidence: { type: Type.NUMBER },
      lifestyle: { type: Type.STRING },
      timeline: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            age: { type: Type.NUMBER },
            label: { type: Type.STRING },
            description: { type: Type.STRING },
            type: { type: Type.STRING },
          },
          required: ['id', 'age', 'label', 'description', 'type'],
        },
      },
      outlook: {
        type: Type.OBJECT,
        properties: {
          entrySalary: { type: Type.STRING },
          midSalary: { type: Type.STRING },
          seniorSalary: { type: Type.STRING },
          demand: { type: Type.STRING },
          stability: { type: Type.NUMBER },
          growth: { type: Type.NUMBER },
        },
        required: [
          'entrySalary',
          'midSalary',
          'seniorSalary',
          'demand',
          'stability',
          'growth',
        ],
      },
      resources: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            type: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            timeCommitment: { type: Type.STRING },
            whyItMatters: { type: Type.STRING },
          },
          required: [
            'id',
            'title',
            'type',
            'difficulty',
            'timeCommitment',
            'whyItMatters',
          ],
        },
      },
    },
    required: [
      'id',
      'title',
      'reason',
      'confidence',
      'lifestyle',
      'timeline',
      'outlook',
      'resources',
    ],
  },
};

userRoutes.get('/me', async (c) => {
  const payload = c.get('jwtPayload');
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const profile = await UserService.getProfile(payload.id);
  return c.json(profile || null);
});

userRoutes.post('/profile', async (c) => {
  const payload = c.get('jwtPayload');
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const { data } = await c.req.json();
  const result = await UserService.upsertProfile(payload.id, data);
  return c.json(result);
});

async function generateAndSaveCareers(
  userId: string,
  profileData: any
) {
  console.log('Generating careers via LLM...');
  const provider = getLLMProvider();
  const prompt = `User Profile: ${JSON.stringify(profileData)}. ${SYSTEM_PROMPTS.CAREER_GENERATOR}`;

  const rawResult: any = await provider.generateContent(
    prompt,
    CAREER_SCHEMA
  );

  // Normalize/Extract — OpenAI's json_object mode always returns an object,
  // so the array may be wrapped under any key name.
  let careers: any[] = [];
  if (Array.isArray(rawResult)) {
    careers = rawResult;
  } else if (rawResult && typeof rawResult === 'object') {
    const arrayValue = Object.values(rawResult).find((v) =>
      Array.isArray(v)
    );
    if (arrayValue) {
      careers = arrayValue as any[];
    }
  }

  // Inject IDs if missing (Backend side)
  const finalizedCareers = careers.map((c: any, i: number) => ({
    ...c,
    id: c.id || `career-${Date.now()}-${i}`,
  }));

  // Save to DB
  if (finalizedCareers.length > 0) {
    await UserService.updateCareers(userId, finalizedCareers);
  }
  return finalizedCareers;
}

userRoutes.get('/dashboard', async (c) => {
  const payload = c.get('jwtPayload');
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const record = await UserService.getProfile(payload.id);

  if (!record) {
    return c.json({ status: 'needs_onboarding' });
  }

  // If careers exist, return them
  if (
    record.careers &&
    Array.isArray(record.careers) &&
    record.careers.length > 0
  ) {
    return c.json({
      status: 'success',
      data: {
        profile: record.data,
        careers: record.careers,
      },
    });
  }

  // If missing, GENERATE
  try {
    const careers = await generateAndSaveCareers(
      payload.id,
      record.data
    );
    return c.json({
      status: 'success',
      data: {
        profile: record.data,
        careers: careers,
      },
    });
  } catch (e) {
    console.error('Generation failed', e);
    return c.json({ error: 'Failed to generate careers' }, 500);
  }
});

userRoutes.post('/regenerate-careers', async (c) => {
  const payload = c.get('jwtPayload');
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const record = await UserService.getProfile(payload.id);
  if (!record) return c.json({ error: 'No profile found' }, 404);

  try {
    const careers = await generateAndSaveCareers(
      payload.id,
      record.data
    );
    return c.json({ careers });
  } catch (e) {
    console.error('Regeneration failed', e);
    return c.json({ error: 'Failed to regenerate' }, 500);
  }
});

// ===== Reflections Routes =====

userRoutes.get('/reflections', async (c) => {
  const payload = c.get('jwtPayload');
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const reflections = await ReflectionService.getReflections(
    payload.id
  );
  return c.json(reflections);
});

userRoutes.post('/reflections', async (c) => {
  const payload = c.get('jwtPayload');
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const { content } = await c.req.json();
  if (!content || typeof content !== 'string') {
    return c.json({ error: 'Content is required' }, 400);
  }

  const reflection = await ReflectionService.addReflection(
    payload.id,
    content
  );
  return c.json(reflection);
});

userRoutes.delete('/reflections/:id', async (c) => {
  const payload = c.get('jwtPayload');
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const reflectionId = c.req.param('id');
  const result = await ReflectionService.deleteReflection(
    payload.id,
    reflectionId
  );

  if (!result) {
    return c.json({ error: 'Not found or unauthorized' }, 404);
  }

  return c.json({ success: true });
});

// ========== Saved Paths Routes ==========
userRoutes.get('/saved-paths', async (c) => {
  const payload = c.get('jwtPayload');
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const paths = await SavedPathsService.getSavedPaths(payload.id);
  return c.json(paths);
});

userRoutes.post('/saved-paths', async (c) => {
  const payload = c.get('jwtPayload');
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const { careerId } = await c.req.json();
  const result = await SavedPathsService.savePath(
    payload.id,
    careerId
  );
  return c.json(result);
});

userRoutes.delete('/saved-paths/:careerId', async (c) => {
  const payload = c.get('jwtPayload');
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const careerId = c.req.param('careerId');
  await SavedPathsService.unsavePath(payload.id, careerId);
  return c.json({ success: true });
});

// ========== Saved Previews Routes ==========
userRoutes.get('/saved-previews', async (c) => {
  const payload = c.get('jwtPayload');
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const previews = await SavedPreviewsService.getSavedPreviews(
    payload.id
  );
  return c.json(previews);
});

userRoutes.post('/saved-previews', async (c) => {
  const payload = c.get('jwtPayload');
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const { careerId, careerTitle, scenes } = await c.req.json();
  const result = await SavedPreviewsService.savePreview(
    payload.id,
    careerId,
    careerTitle,
    scenes
  );
  return c.json(result);
});

userRoutes.delete('/saved-previews/:id', async (c) => {
  const payload = c.get('jwtPayload');
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const previewId = c.req.param('id');
  await SavedPreviewsService.deletePreview(payload.id, previewId);
  return c.json({ success: true });
});

// ========== Milestones Routes ==========
userRoutes.get('/milestones', async (c) => {
  const payload = c.get('jwtPayload');
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const careerId = c.req.query('careerId');
  const milestones = await MilestoneService.getMilestones(
    payload.id,
    careerId
  );
  return c.json(milestones);
});

userRoutes.post('/milestones', async (c) => {
  const payload = c.get('jwtPayload');
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const { careerId, milestoneId } = await c.req.json();
  const result = await MilestoneService.completeMilestone(
    payload.id,
    careerId,
    milestoneId
  );
  return c.json(result);
});

userRoutes.delete('/milestones/:careerId/:milestoneId', async (c) => {
  const payload = c.get('jwtPayload');
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const careerId = c.req.param('careerId');
  const milestoneId = c.req.param('milestoneId');
  await MilestoneService.uncompleteMilestone(
    payload.id,
    careerId,
    milestoneId
  );
  return c.json({ success: true });
});

// ========== Growth Checkpoints Routes ==========
userRoutes.get('/growth-checkpoint', async (c) => {
  const payload = c.get('jwtPayload');
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const result = await GrowthCheckpointService.shouldPromptCheckpoint(
    payload.id
  );
  return c.json(result);
});

userRoutes.post('/growth-checkpoint/mark-prompted', async (c) => {
  const payload = c.get('jwtPayload');
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const { type } = await c.req.json();
  await GrowthCheckpointService.markPrompted(payload.id, type);
  return c.json({ success: true });
});

// ===== Shared Plans Routes =====
userRoutes.post('/share', async (c) => {
  const payload = c.get('jwtPayload');
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const result = await ShareService.createShareLink(payload.id);
    return c.json(result);
  } catch (error) {
    console.error('Failed to create share link:', error);
    return c.json({ error: 'Failed to create share link' }, 500);
  }
});

export { userRoutes };
