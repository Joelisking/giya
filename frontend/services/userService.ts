import { fetchAPI } from './api';
import { UserProfile, CareerPath } from '../types';

export interface DashboardResponse {
  status: 'needs_onboarding' | 'success';
  data?: {
    profile: UserProfile;
    careers: CareerPath[];
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}

export const UserService = {
  async saveProfile(data: UserProfile) {
    return fetchAPI('/user/profile', { data });
  },

  async fetchDashboardData(): Promise<DashboardResponse> {
    return fetchAPI<DashboardResponse>(
      '/user/dashboard',
      undefined,
      'GET'
    );
  },

  async regenerateCareers(): Promise<{ careers: CareerPath[] }> {
    return fetchAPI<{ careers: CareerPath[] }>(
      '/user/regenerate-careers',
      {}
    );
  },

  async createChatSession(title: string): Promise<ChatSession> {
    return fetchAPI<ChatSession>('/chat-sessions', { title });
  },

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return fetchAPI<ChatMessage[]>(
      `/chat-sessions/${sessionId}/messages`,
      undefined,
      'GET'
    );
  },

  // ===== Reflections =====
  async getReflections(): Promise<Reflection[]> {
    return fetchAPI<Reflection[]>(
      '/user/reflections',
      undefined,
      'GET'
    );
  },

  async addReflection(content: string): Promise<Reflection> {
    return fetchAPI<Reflection>('/user/reflections', { content });
  },

  async deleteReflection(id: string): Promise<{ success: boolean }> {
    return fetchAPI<{ success: boolean }>(
      `/user/reflections/${id}`,
      undefined,
      'DELETE'
    );
  },

  // ===== Saved Paths =====
  async getSavedPaths(): Promise<SavedPath[]> {
    return fetchAPI<SavedPath[]>(
      '/user/saved-paths',
      undefined,
      'GET'
    );
  },

  async savePath(careerId: string): Promise<SavedPath> {
    return fetchAPI<SavedPath>('/user/saved-paths', { careerId });
  },

  async unsavePath(careerId: string): Promise<{ success: boolean }> {
    return fetchAPI<{ success: boolean }>(
      `/user/saved-paths/${careerId}`,
      undefined,
      'DELETE'
    );
  },

  // ===== Saved Previews =====
  async getSavedPreviews(): Promise<SavedPreview[]> {
    return fetchAPI<SavedPreview[]>(
      '/user/saved-previews',
      undefined,
      'GET'
    );
  },

  async savePreview(
    careerId: string,
    careerTitle: string,
    scenes: unknown[]
  ): Promise<SavedPreview> {
    return fetchAPI<SavedPreview>('/user/saved-previews', {
      careerId,
      careerTitle,
      scenes,
    });
  },

  async deletePreview(id: string): Promise<{ success: boolean }> {
    return fetchAPI<{ success: boolean }>(
      `/user/saved-previews/${id}`,
      undefined,
      'DELETE'
    );
  },

  // ===== Milestones =====
  async getMilestones(careerId?: string): Promise<Milestone[]> {
    const url = careerId
      ? `/user/milestones?careerId=${careerId}`
      : '/user/milestones';
    return fetchAPI<Milestone[]>(url, undefined, 'GET');
  },

  async completeMilestone(
    careerId: string,
    milestoneId: string
  ): Promise<Milestone> {
    return fetchAPI<Milestone>('/user/milestones', {
      careerId,
      milestoneId,
    });
  },

  async uncompleteMilestone(
    careerId: string,
    milestoneId: string
  ): Promise<{ success: boolean }> {
    return fetchAPI<{ success: boolean }>(
      `/user/milestones/${careerId}/${milestoneId}`,
      undefined,
      'DELETE'
    );
  },

  // ===== Growth Checkpoints =====
  async getGrowthCheckpoint(): Promise<{
    shouldPrompt: boolean;
    type?: string;
  }> {
    return fetchAPI<{ shouldPrompt: boolean; type?: string }>(
      '/user/growth-checkpoint',
      undefined,
      'GET'
    );
  },

  async markCheckpointPrompted(
    type: string
  ): Promise<{ success: boolean }> {
    return fetchAPI<{ success: boolean }>(
      '/user/growth-checkpoint/mark-prompted',
      { type }
    );
  },

  // ===== Shared Plans =====
  async createShareLink(): Promise<{
    shareToken: string;
    expiresAt: string;
  }> {
    return fetchAPI('/user/share', {}, 'POST');
  },

  async getSharedPlan(token: string): Promise<SharedPlan> {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/share/${token}`
    );
    if (!res.ok) throw new Error('Failed to fetch shared plan');
    return res.json();
  },
};

export interface SharedPlan {
  profile: UserProfile;
  careers: CareerPath[];
  userEmail: string; // or username if we have it
  sharedAt: string;
}

export interface Reflection {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface SavedPath {
  id: string;
  userId: string;
  careerId: string;
  savedAt: string;
}

export interface SavedPreview {
  id: string;
  userId: string;
  careerId: string;
  careerTitle: string;
  scenes: unknown[];
  createdAt: string;
}

export interface Milestone {
  id: string;
  userId: string;
  careerId: string;
  milestoneId: string;
  completedAt: string;
}
