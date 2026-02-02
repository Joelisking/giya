import { db } from '../../db';
import { chatSessions, chatMessages } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const ChatService = {
  async createSession(userId: string, title: string) {
    const [session] = await db
      .insert(chatSessions)
      .values({ userId, title })
      .returning();
    return session;
  },

  async getSessionMessages(sessionId: string) {
    return db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);
  },

  async addMessage(sessionId: string, role: string, content: string) {
    const [message] = await db
      .insert(chatMessages)
      .values({ sessionId, role, content })
      .returning();
    return message;
  },
};
