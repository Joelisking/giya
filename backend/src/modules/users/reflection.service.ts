import { db } from '../../db/index';
import { reflections } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';

export const ReflectionService = {
  async getReflections(userId: string) {
    return db
      .select()
      .from(reflections)
      .where(eq(reflections.userId, userId))
      .orderBy(desc(reflections.createdAt));
  },

  async addReflection(userId: string, content: string) {
    const [reflection] = await db
      .insert(reflections)
      .values({
        userId,
        content,
      })
      .returning();
    return reflection;
  },

  async deleteReflection(userId: string, reflectionId: string) {
    // Ensure user owns the reflection before deleting
    const [existing] = await db
      .select()
      .from(reflections)
      .where(eq(reflections.id, reflectionId));

    if (!existing || existing.userId !== userId) {
      return null;
    }

    await db
      .delete(reflections)
      .where(eq(reflections.id, reflectionId));
    return { success: true };
  },
};
