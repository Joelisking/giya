import { db } from '../../db';
import {
  savedPaths,
  savedPreviews,
  milestones,
  growthCheckpoints,
} from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export const SavedPathsService = {
  async getSavedPaths(userId: string) {
    return db
      .select()
      .from(savedPaths)
      .where(eq(savedPaths.userId, userId));
  },

  async savePath(userId: string, careerId: string) {
    const existing = await db
      .select()
      .from(savedPaths)
      .where(
        and(
          eq(savedPaths.userId, userId),
          eq(savedPaths.careerId, careerId)
        )
      );

    if (existing.length > 0) return existing[0];

    const [result] = await db
      .insert(savedPaths)
      .values({ userId, careerId })
      .returning();
    return result;
  },

  async unsavePath(userId: string, careerId: string) {
    await db
      .delete(savedPaths)
      .where(
        and(
          eq(savedPaths.userId, userId),
          eq(savedPaths.careerId, careerId)
        )
      );
  },
};

export const SavedPreviewsService = {
  async getSavedPreviews(userId: string) {
    return db
      .select()
      .from(savedPreviews)
      .where(eq(savedPreviews.userId, userId));
  },

  async savePreview(
    userId: string,
    careerId: string,
    careerTitle: string,
    scenes: unknown[]
  ) {
    // Check if preview already exists for this career
    const existing = await db
      .select()
      .from(savedPreviews)
      .where(
        and(
          eq(savedPreviews.userId, userId),
          eq(savedPreviews.careerId, careerId)
        )
      );

    if (existing.length > 0) {
      // Update existing preview
      const [result] = await db
        .update(savedPreviews)
        .set({ scenes, careerTitle })
        .where(eq(savedPreviews.id, existing[0].id))
        .returning();
      return result;
    }

    const [result] = await db
      .insert(savedPreviews)
      .values({ userId, careerId, careerTitle, scenes })
      .returning();
    return result;
  },

  async deletePreview(userId: string, previewId: string) {
    await db
      .delete(savedPreviews)
      .where(
        and(
          eq(savedPreviews.userId, userId),
          eq(savedPreviews.id, previewId)
        )
      );
  },
};

export const MilestoneService = {
  async getMilestones(userId: string, careerId?: string) {
    if (careerId) {
      return db
        .select()
        .from(milestones)
        .where(
          and(
            eq(milestones.userId, userId),
            eq(milestones.careerId, careerId)
          )
        );
    }
    return db
      .select()
      .from(milestones)
      .where(eq(milestones.userId, userId));
  },

  async completeMilestone(
    userId: string,
    careerId: string,
    milestoneId: string
  ) {
    const existing = await db
      .select()
      .from(milestones)
      .where(
        and(
          eq(milestones.userId, userId),
          eq(milestones.careerId, careerId),
          eq(milestones.milestoneId, milestoneId)
        )
      );

    if (existing.length > 0) return existing[0];

    const [result] = await db
      .insert(milestones)
      .values({ userId, careerId, milestoneId })
      .returning();
    return result;
  },

  async uncompleteMilestone(
    userId: string,
    careerId: string,
    milestoneId: string
  ) {
    await db
      .delete(milestones)
      .where(
        and(
          eq(milestones.userId, userId),
          eq(milestones.careerId, careerId),
          eq(milestones.milestoneId, milestoneId)
        )
      );
  },
};

export const GrowthCheckpointService = {
  async getCheckpoints(userId: string) {
    return db
      .select()
      .from(growthCheckpoints)
      .where(eq(growthCheckpoints.userId, userId));
  },

  async shouldPromptCheckpoint(
    userId: string
  ): Promise<{ shouldPrompt: boolean; type?: string }> {
    const checkpoints = await this.getCheckpoints(userId);
    const now = new Date();

    for (const checkpoint of checkpoints) {
      if (
        checkpoint.nextPromptAt &&
        new Date(checkpoint.nextPromptAt) <= now
      ) {
        return { shouldPrompt: true, type: checkpoint.type };
      }
    }

    // If no checkpoints exist, create default ones
    if (checkpoints.length === 0) {
      const thirtyDaysFromNow = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000
      );
      await db.insert(growthCheckpoints).values([
        { userId, type: 'annual', nextPromptAt: thirtyDaysFromNow },
        { userId, type: 'skill', nextPromptAt: thirtyDaysFromNow },
        { userId, type: 'goal', nextPromptAt: thirtyDaysFromNow },
      ]);
    }

    return { shouldPrompt: false };
  },

  async markPrompted(userId: string, type: string) {
    const now = new Date();
    const nextPrompt = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    ); // 30 days

    await db
      .update(growthCheckpoints)
      .set({ lastPromptedAt: now, nextPromptAt: nextPrompt })
      .where(
        and(
          eq(growthCheckpoints.userId, userId),
          eq(growthCheckpoints.type, type)
        )
      );
  },
};
