"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const hono_1 = require("hono");
const auth_service_1 = require("./auth.service");
const authRoutes = new hono_1.Hono();
exports.authRoutes = authRoutes;
authRoutes.post('/signup', async (c) => {
    try {
        const { email, password } = await c.req.json();
        if (!email || !password)
            return c.json({ error: 'Email and password required' }, 400);
        const result = await auth_service_1.AuthService.signup(email, password);
        return c.json(result, 201);
    }
    catch (e) {
        return c.json({ error: e.message }, 400);
    }
});
authRoutes.post('/login', async (c) => {
    try {
        const { email, password } = await c.req.json();
        if (!email || !password)
            return c.json({ error: 'Email and password required' }, 400);
        const result = await auth_service_1.AuthService.login(email, password);
        return c.json(result);
    }
    catch (e) {
        return c.json({ error: e.message }, 401);
    }
});
