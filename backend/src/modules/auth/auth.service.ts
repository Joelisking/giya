import { eq } from 'drizzle-orm';
import { hash, compare } from 'bcryptjs';
import { sign } from 'hono/jwt';
import { db } from '../../db';
import { users } from '../../db/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const AuthService = {
  async signup(email: string, password: string) {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser.length > 0) {
      throw new Error('User already exists');
    }

    const passwordHash = await hash(password, 10);
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
      })
      .returning();

    const token = await sign(
      {
        id: newUser.id,
        email: newUser.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      },
      JWT_SECRET
    );

    return { token, user: { id: newUser.id, email: newUser.email } };
  },

  async login(email: string, password: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const validPassword = await compare(password, user.passwordHash);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    const token = await sign(
      {
        id: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      },
      JWT_SECRET
    ); // 7 days
    return { token, user: { id: user.id, email: user.email } };
  },
};
