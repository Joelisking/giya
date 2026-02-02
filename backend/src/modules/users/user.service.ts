import { db } from '../../db';
import { userProfiles } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { UserProfile, CareerPath } from '../../types'; // Need to ensure these types exist in backend or shared

// TODO: Ensure types are synced. For now, using 'any' for complex JSON types if strict types aren't available in backend yet.
// Actually, I should probably copy the types to backend/src/types.ts if not there.

export const UserService = {
  async getProfile(userId: string) {
    const [record] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return record;
  },

  async upsertProfile(userId: string, data: any) {
    const existing = await this.getProfile(userId);
    if (existing) {
      const [updated] = await db
        .update(userProfiles)
        .set({ data, careers: null, updatedAt: new Date() })
        .where(eq(userProfiles.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userProfiles)
        .values({ userId, data })
        .returning();
      return created;
    }
  },

  async updateCareers(userId: string, careers: any[]) {
    const existing = await this.getProfile(userId);
    if (!existing) throw new Error('Profile not found');

    const [updated] = await db
      .update(userProfiles)
      .set({ careers, updatedAt: new Date() })
      .where(eq(userProfiles.id, existing.id))
      .returning();
    return updated;
  },
};
