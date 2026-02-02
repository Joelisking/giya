import { db } from '../../db';
import { sharedPlans, userProfiles, users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';

export const ShareService = {
  async createShareLink(userId: string) {
    // Generate a secure random token (8 chars)
    const token = randomBytes(4).toString('hex');

    // Insert new share record
    const [record] = await db
      .insert(sharedPlans)
      .values({
        userId,
        shareToken: token,
      })
      .returning();

    return record;
  },

  async getSharedPlan(token: string) {
    // 1. Get the shared plan record
    const [plan] = await db
      .select()
      .from(sharedPlans)
      .where(eq(sharedPlans.shareToken, token));

    if (!plan) return null;

    // 2. Get the user profile data
    const [result] = await db
      .select({
        profile: userProfiles.data,
        careers: userProfiles.careers,
        userEmail: users.email,
      })
      .from(userProfiles)
      .innerJoin(users, eq(userProfiles.userId, users.id))
      .where(eq(userProfiles.userId, plan.userId));

    if (!result) return null;

    return {
      ...result,
      sharedAt: plan.createdAt,
    };
  },
};
