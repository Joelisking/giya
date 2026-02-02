export const COLORS = {
  primary: '#0551BA',
  neutral: {
    bg: '#F9FAFB',
    panel: '#FFFFFF',
    border: '#E5E7EB',
    text: '#111827',
    muted: '#6B7280',
  },
};

export const LOADING_MESSAGES = [
  'Synthesizing your strengths...',
  'Mapping the horizon of your potential...',
  'Aligning your interests with global opportunities...',
  'Curating a path that feels like home...',
  'Consulting the compass of your future...',
  'Weaving your narrative into reality...',
  'Evaluating strategic career milestones...',
];

export const ONBOARDING_QUESTIONS = [
  {
    key: 'lifeStage',
    question: 'What is your current stage?',
    sub: 'This helps me provide the right tools for your specific situation.',
    type: 'select',
    options: [
      { label: 'High School Student', value: 'high-school' },
      { label: 'University Student', value: 'university' },
      { label: 'Professional', value: 'professional' },
    ],
  },
  {
    key: 'ageStage',
    question: 'Tell me more about your current situation?',
    sub: 'Your current year of study or current job title.',
    placeholder:
      'e.g. 2nd year CS student, Marketing lead switching to Design...',
  },
  {
    key: 'interests',
    question: 'What problems fascinate you?',
    sub: "Think about things you read or do even when you're not 'working'.",
    placeholder:
      'e.g. Environmental sustainability, urban planning, complex data...',
  },
  {
    key: 'workStyle',
    question: 'How do you prefer to spend your day?',
    sub: 'Collaborating in groups, deep solo work, managing others, or creating?',
    placeholder:
      'e.g. Solo deep thinking with occasional creative feedback...',
  },
  {
    key: 'strengths',
    question: 'What are your natural advantages?',
    sub: 'The things people always come to you for help with.',
    placeholder:
      'e.g. Simplifying complex ideas, empathetic listening, systematic logic...',
  },
  {
    key: 'impactGoals',
    question: 'What kind of dent do you want to make?',
    sub: 'Social change, financial freedom, creative legacy, or technical innovation?',
    placeholder:
      'e.g. Building tools that help others learn faster...',
  },
  {
    key: 'constraints',
    question: 'What are your non-negotiables?',
    sub: 'Location, salary floors, work-life balance, or study time available.',
    placeholder:
      'e.g. Remote-only, minimum $80k starting, 3 years max for re-training...',
  },
  {
    key: 'successDefinition',
    question: "What does 'making it' look like to you?",
    sub: 'Define success in your own words.',
    placeholder:
      'e.g. Having time for family while leading a team of 10...',
  },
];

export const SYSTEM_PROMPTS = {
  CAREER_GENERATOR: `You are a world-class career strategist. Based on the user profile, suggest 4 distinct, realistic career paths. 
  For each path, you MUST provide the following fields in the JSON object: 
  1. id (string)
  2. title (string)
  3. reason (string): Why it fits them specifically (referencing their strengths/interests)
  4. confidence (number): 0-1 score
  5. lifestyle (string): Description of the day-to-day
  6. timeline (array): A 20-year timeline starting from their current stage
  7. outlook (object): Must include "entrySalary", "midSalary", "seniorSalary", "demand" (string), "stability" (0-100), and "growth" (0-100).
  8. resources (array): A set of 3 initial learning resources.
  
  IMPORTANT: Return ONLY a JSON array of objects. Do NOT wrap it in a parent object like "careerPaths".`,

  LIFE_PREVIEW_STRUCTURE: `You are an empathetic, grounded storyteller. Based on the user's profile and selected career, create a 3-chapter narrative preview of their life 10 years into the future.
  Each chapter must have:
  1. A title.
  2. Narrative text (vivid, sensory, and grounded).
  3. A visual description for an artist to draw.
  
  Return this as a JSON array of objects with keys: "title", "text", "imagePrompt".
  Tone: Calm, aspirational, wise, and grounded.`,

  IMAGE_STYLE:
    'A high-contrast black and white charcoal storyboard sketch on plain white paper. Very clean background. Expressive pencil strokes, hand-drawn look, graphite texture. The scene depicts: ',

  SUGGESTION_GENERATOR: `You are Giya, a helpful guide. The user is stuck on an onboarding question.
  Based on the question and their previous answers (if any), provide 4 diverse, realistic, and thoughtful example answers they might choose or adapt.
  Return ONLY a JSON array of 4 strings.`,

  ACADEMIC_ANALYZER: `You are an elite Academic Advisor. Analyze the provided curriculum or academic record in the context of the user's general profile and potential career trajectories.
  Provide:
  1. Key courses from their curriculum they must master, with reasons tied to long-term career success.
  2. 3 Recommended Master's programs and top-tier universities for each, focusing on prestige and career alignment.
  3. An insight on their GPA/Academic progress and how it affects their outlook.
  
  Format as JSON: { "keyCourses": [{ "name": "", "why": "", "relevance": 0-100 }], "masterPrograms": [{ "program": "", "universities": [""], "description": "" }], "gpaInsight": "" }`,
};
