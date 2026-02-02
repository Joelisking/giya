import { Hono } from 'hono';
import { Type } from '@google/genai';
import { SYSTEM_PROMPTS } from '../../constants';
import { getLLMProvider } from '../../llm/factory';
import { jwt } from 'hono/jwt';
import { ChatService } from './chat.service';
import { ReflectionService } from '../users/reflection.service';

const aiRoutes = new Hono();

// Routes are mounted at /api, so inside here they are /suggest-answers etc.
console.log('Mounting AI Routes');

aiRoutes.post('/suggest-answers', async (c) => {
  const { question, context } = await c.req.json();
  const provider = getLLMProvider();
  const prompt = `Context so far: ${context}\nQuestion: ${question}\n${SYSTEM_PROMPTS.SUGGESTION_GENERATOR}`;

  try {
    const schema = {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    };
    const result = await provider.generateContent<string[]>(
      prompt,
      schema
    );
    return c.json(result);
  } catch (e) {
    console.error(e);
    return c.json(['Option 1', 'Option 2', 'Option 3', 'Option 4']);
  }
});

aiRoutes.post('/analyze-record', async (c) => {
  const { profile, career, fileData, mimeType } = await c.req.json();
  const provider = getLLMProvider();

  const prompt = `User Profile: ${JSON.stringify(profile)}\nTarget Career: ${career.title}\n${SYSTEM_PROMPTS.ACADEMIC_ANALYZER}`;
  const cleanBase64 = fileData.includes(',')
    ? fileData.split(',')[1]
    : fileData;

  try {
    const result = await provider.generateContent(prompt, null, [
      { data: cleanBase64, mimeType: mimeType },
    ]);
    return c.json(result);
  } catch (e) {
    console.error(e);
    return c.json(null);
  }
});

aiRoutes.post('/generate-careers', async (c) => {
  const { profile } = await c.req.json();
  const provider = getLLMProvider();
  const prompt = `User Profile: ${JSON.stringify(profile)}. ${SYSTEM_PROMPTS.CAREER_GENERATOR}`;

  const schema = {
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

  try {
    const rawResult = await provider.generateContent(prompt, schema);
    // Normalize — OpenAI's json_object mode wraps arrays in an object
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
    return c.json(careers);
  } catch (e) {
    console.error(e);
    return c.json([]);
  }
});

aiRoutes.post('/life-story', async (c) => {
  const { profile, career } = await c.req.json();
  const provider = getLLMProvider();
  const prompt = `User Profile: ${JSON.stringify(profile)}. Career: ${career.title}. ${SYSTEM_PROMPTS.LIFE_PREVIEW_STRUCTURE}`;

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        text: { type: Type.STRING },
        imagePrompt: { type: Type.STRING },
      },
      required: ['title', 'text', 'imagePrompt'],
    },
  };

  try {
    const result = await provider.generateContent(prompt, schema);
    return c.json(result);
  } catch (e) {
    console.error(e);
    return c.json([]);
  }
});

aiRoutes.post('/generate-image', async (c) => {
  const { description } = await c.req.json();
  const provider = getLLMProvider();
  const prompt = `${SYSTEM_PROMPTS.IMAGE_STYLE} ${description}`;

  try {
    const imageUrl = await provider.generateImage(prompt);
    return c.json({ imageUrl });
  } catch (e) {
    console.error(e);
    return c.json({ imageUrl: null });
  }
});

aiRoutes.post('/chat-sessions', async (c) => {
  const payload = c.get('jwtPayload');
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const { title } = await c.req.json();
  const session = await ChatService.createSession(
    payload.id,
    title || 'New Chat'
  );
  return c.json(session);
});

aiRoutes.get('/chat-sessions/:id/messages', async (c) => {
  const sessionId = c.req.param('id');
  const messages = await ChatService.getSessionMessages(sessionId);
  return c.json(messages);
});

aiRoutes.post('/chat', async (c) => {
  const payload = c.get('jwtPayload');
  const { profile, context, question, sessionId } =
    await c.req.json();
  const provider = getLLMProvider();

  try {
    // Persist user message if session provided
    if (sessionId) {
      await ChatService.addMessage(sessionId, 'user', question);
    }

    // Fetch user's recent reflections to include in context
    let reflectionsContext = '';
    if (payload?.id) {
      const reflections = await ReflectionService.getReflections(
        payload.id
      );
      if (reflections.length > 0) {
        const recentReflections = reflections.slice(0, 5); // Last 5 reflections
        reflectionsContext = `\n\nUser's Journal Reflections (use these to personalize your guidance):\n${recentReflections
          .map(
            (r) =>
              `- [${new Date(r.createdAt!).toLocaleDateString()}]: "${r.content}"`
          )
          .join('\n')}`;
      }
    }

    const fullContext = `User Profile: ${JSON.stringify(profile)}\nActive Focus: ${context}${reflectionsContext}`;

    const answer = await provider.chat(fullContext, question);

    // Persist model response if session provided
    if (sessionId) {
      await ChatService.addMessage(sessionId, 'model', answer);
    }

    return c.json({ text: answer });
  } catch (e) {
    console.error(e);
    return c.json({ text: "I'm thinking... please try again." });
  }
});

export { aiRoutes };
