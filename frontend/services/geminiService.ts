import {
  UserProfile,
  CareerPath,
  StoryScene,
  AcademicAnalysis,
} from '../types';

import { fetchAPI } from './api';

export const suggestOnboardingAnswers = async (
  question: string,
  context: string
): Promise<string[]> => {
  try {
    return await fetchAPI<string[]>('/suggest-answers', {
      question,
      context,
    });
  } catch (error) {
    console.error(error);
    return ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
  }
};

export const analyzeAcademicRecord = async (
  profile: UserProfile,
  career: CareerPath,
  fileData: string,
  mimeType: string
): Promise<AcademicAnalysis | null> => {
  try {
    return await fetchAPI<AcademicAnalysis | null>(
      '/analyze-record',
      {
        profile,
        career,
        fileData, // Backend expects raw base64 data as provided by frontend logic
        mimeType,
      }
    );
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const generateCareers = async (
  profile: UserProfile
): Promise<CareerPath[]> => {
  try {
    // Extend type to allow checking for wrapped response
    const res = await fetchAPI<any>('/generate-careers', {
      profile,
    });
    console.log('generateCareers response:', res);

    // Handle wrapped response — OpenAI's json_object mode always returns
    // an object, so the array may be under any key name.
    let careers: CareerPath[] = [];
    if (Array.isArray(res)) {
      careers = res;
    } else if (res && typeof res === 'object') {
      const arrayValue = Object.values(res).find((v) =>
        Array.isArray(v)
      );
      if (arrayValue) {
        careers = arrayValue as CareerPath[];
      } else {
        console.error('generateCareers received non-array:', res);
        return [];
      }
    } else {
      console.error('generateCareers received unexpected:', res);
      return [];
    }

    // Ensure every career has an ID and matches the interface
    return careers.map((c: any, i: number) => {
      // Normalize Outlook
      const outlook = c.outlook || c.financialOutlook || {};

      return {
        ...c,
        id: c.id || `career-${Date.now()}-${i}`,
        confidence: c.confidenceScore || c.confidence || 0, // Handle score/confidence naming
        lifestyle: c.lifestyle || c.lifestyleDescription || '', // Handle description naming
        outlook: {
          entrySalary: outlook.entry || outlook.entrySalary || 'N/A',
          midSalary: outlook.mid || outlook.midSalary || 'N/A',
          seniorSalary:
            outlook.senior || outlook.seniorSalary || 'N/A',
          demand: outlook.demand || 'Growing',
          stability: outlook.stability || 75,
          growth: outlook.growth || 80,
        },
        resources: c.resources || c.learningResources || [],
      };
    });
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const generateLifeStoryStructure = async (
  profile: UserProfile,
  career: CareerPath
): Promise<StoryScene[]> => {
  try {
    return await fetchAPI<StoryScene[]>('/life-story', {
      profile,
      career,
    });
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const generateSceneSketch = async (
  description: string
): Promise<string | null> => {
  try {
    const result = await fetchAPI<{ imageUrl: string | null }>(
      '/generate-image',
      {
        description,
      }
    );
    return result.imageUrl;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const askGiya = async (
  profile: UserProfile,
  context: string,
  question: string,
  sessionId?: string
): Promise<string> => {
  try {
    const result = await fetchAPI<{ text: string }>('/chat', {
      profile,
      context,
      question,
      sessionId,
    });
    return result.text;
  } catch (error) {
    console.error(error);
    return "I'm thinking... please try again.";
  }
};
