"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const db_1 = require("../../db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
// TODO: Ensure types are synced. For now, using 'any' for complex JSON types if strict types aren't available in backend yet.
// Actually, I should probably copy the types to backend/src/types.ts if not there.
exports.UserService = {
    async getProfile(userId) {
        const [record] = await db_1.db
            .select()
            .from(schema_1.userProfiles)
            .where((0, drizzle_orm_1.eq)(schema_1.userProfiles.userId, userId));
        return record;
    },
    async upsertProfile(userId, data) {
        const existing = await this.getProfile(userId);
        if (existing) {
            const [updated] = await db_1.db
                .update(schema_1.userProfiles)
                .set({ data, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_1.userProfiles.id, existing.id))
                .returning();
            return updated;
        }
        else {
            const [created] = await db_1.db
                .insert(schema_1.userProfiles)
                .values({ userId, data })
                .returning();
            return created;
        }
    },
    async updateCareers(userId, careers) {
        const existing = await this.getProfile(userId);
        if (!existing)
            throw new Error('Profile not found');
        const [updated] = await db_1.db
            .update(schema_1.userProfiles)
            .set({
            careers,
            generationStatus: 'completed',
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.userProfiles.id, existing.id))
            .returning();
        return updated;
    },
    async updateGenerationStatus(userId, status) {
        const existing = await this.getProfile(userId);
        if (!existing)
            throw new Error('Profile not found');
        const [updated] = await db_1.db
            .update(schema_1.userProfiles)
            .set({ generationStatus: status, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.userProfiles.id, existing.id))
            .returning();
        return updated;
    },
};
