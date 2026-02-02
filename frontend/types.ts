export type LifeStage =
  | 'high-school'
  | 'university'
  | 'professional'
  | 'exploring';

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  lifeStage: LifeStage;
  ageStage: string;
  interests: string;
  workStyle: string;
  strengths: string;
  impactGoals: string;
  constraints: string;
  successDefinition: string;
}

export interface AcademicAnalysis {
  keyCourses: {
    name: string;
    why: string;
    relevance: number;
  }[];
  masterPrograms: {
    program: string;
    universities: string[];
    description: string;
  }[];
  gpaInsight: string;
}

export interface CareerPath {
  id: string;
  title: string;
  reason: string;
  confidence: number;
  lifestyle: string;
  timeline: TimelineEvent[];
  outlook: {
    entrySalary: string;
    midSalary: string;
    seniorSalary: string;
    demand: string;
    stability: number; // 0-100
    growth: number; // 0-100
  };
  resources: Resource[];
}

export interface TimelineEvent {
  id: string;
  age: number;
  label: string;
  description: string;
  type: 'education' | 'milestone' | 'role' | 'skill';
}

export interface Resource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'course' | 'bootcamp';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeCommitment: string;
  whyItMatters: string;
  link?: string;
}

export interface StoryScene {
  title: string;
  text: string;
  imagePrompt: string;
  imageUrl?: string;
}

export interface AppState {
  step: 'onboarding' | 'dashboard' | 'career-details';
  profile: UserProfile | null;
  suggestedCareers: CareerPath[];
  selectedCareer: CareerPath | null;
  isGenerating: boolean;
  lifePreviewScenes: StoryScene[] | null;
  academicAnalysis: AcademicAnalysis | null;
  isAnalyzingRecord: boolean;
}

export interface AppError {
  message: string;
  code?: string;
  status?: number;
}
