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
    question: 'Current stage of life',
    sub: 'This helps me provide the right tools for your specific situation.',
    type: 'select',
    options: [
      { label: 'High School Student', value: 'high-school' },
      { label: 'University Student', value: 'university' },
      { label: 'Professional', value: 'professional' },
      { label: 'Gap Year / Exploring', value: 'exploring' },
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
    question: 'What excites you most right now?',
    sub: 'Select all that apply.',
    type: 'multiselect',
    options: [
      { label: 'Creating things', value: 'creating' },
      { label: 'Solving problems', value: 'solving-problems' },
      { label: 'Helping people', value: 'helping-people' },
      { label: 'Leading teams', value: 'leading' },
      { label: 'Exploring ideas', value: 'exploring-ideas' },
    ],
  },
  {
    key: 'workStyle',
    question: 'How do you like to work?',
    sub: 'Select your preferences.',
    type: 'multiselect',
    options: [
      { label: 'Alone', value: 'alone' },
      { label: 'Collaboratively', value: 'collaboratively' },
      { label: 'Structured', value: 'structured' },
      { label: 'Flexible', value: 'flexible' },
      { label: 'Fast-paced', value: 'fast-paced' },
      { label: 'Deep focus', value: 'deep-focus' },
    ],
  },
  {
    key: 'strengths',
    question: 'What are you naturally good at (or enjoy learning)?',
    sub: 'Select your top strengths.',
    type: 'multiselect',
    options: [
      { label: 'Analytical thinking', value: 'analytical' },
      { label: 'Visual creativity', value: 'creativity' },
      { label: 'Communication', value: 'communication' },
      { label: 'Technology', value: 'technology' },
      { label: 'Strategy', value: 'strategy' },
    ],
  },
  {
    key: 'impactGoals',
    question: 'What kind of impact do you want to have?',
    sub: 'What drives you?',
    type: 'multiselect',
    options: [
      { label: 'Build products', value: 'build-products' },
      { label: 'Influence people', value: 'influence-people' },
      { label: 'Advance technology', value: 'advance-tech' },
      { label: 'Improve society', value: 'improve-society' },
    ],
  },
  {
    key: 'constraints',
    question: 'What constraints should we consider?',
    sub: 'Be realistic about your boundaries.',
    type: 'multiselect',
    options: [
      { label: 'Location dependent', value: 'location' },
      { label: 'Financial limitations', value: 'financial' },
      { label: 'Family expectations', value: 'family' },
      { label: 'Time horizon', value: 'time-horizon' },
      { label: 'None / Flexible', value: 'none' },
    ],
  },
  {
    key: 'successDefinition',
    question: "What does 'success' look like to you (right now)?",
    sub: 'What do you value most?',
    type: 'multiselect',
    options: [
      { label: 'Stability', value: 'stability' },
      { label: 'Recognition', value: 'recognition' },
      { label: 'Freedom', value: 'freedom' },
      { label: 'Mastery', value: 'mastery' },
      { label: 'Purpose', value: 'purpose' },
    ],
  },
];

export const SYSTEM_PROMPTS = {
  CAREER_GENERATOR: `You are a world-class career strategist. Based on the user profile, suggest 4 distinct, realistic career paths. 
  For each path, provide: 
  1. Title
  2. Why it fits them specifically (referencing their strengths/interests)
  3. A confidence score (0-1)
  4. Lifestyle description
  5. A 20-year timeline starting from their current stage
  6. Financial outlook (Entry, Mid, Senior)
  7. A set of 3 initial learning resources.
  
  Format the response as JSON according to the app's TypeScript interfaces.`,

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
