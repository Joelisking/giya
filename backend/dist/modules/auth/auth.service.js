"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const bcryptjs_1 = require("bcryptjs");
const jwt_1 = require("hono/jwt");
const db_1 = require("../../db");
const schema_1 = require("../../db/schema");
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
exports.AuthService = {
    async signup(email, password) {
        const existingUser = await db_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, email))
            .limit(1);
        if (existingUser.length > 0) {
            throw new Error('User already exists');
        }
        const passwordHash = await (0, bcryptjs_1.hash)(password, 10);
        const [newUser] = await db_1.db
            .insert(schema_1.users)
            .values({
            email,
            passwordHash,
        })
            .returning();
        const token = await (0, jwt_1.sign)({
            id: newUser.id,
            email: newUser.email,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
        }, JWT_SECRET);
        return { token, user: { id: newUser.id, email: newUser.email } };
    },
    async login(email, password) {
        const [user] = await db_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, email))
            .limit(1);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const validPassword = await (0, bcryptjs_1.compare)(password, user.passwordHash);
        if (!validPassword) {
            throw new Error('Invalid credentials');
        }
        const token = await (0, jwt_1.sign)({
            id: user.id,
            email: user.email,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
        }, JWT_SECRET); // 7 days
        return { token, user: { id: user.id, email: user.email } };
    },
};
