"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_server_1 = require("@hono/node-server");
const hono_1 = require("hono");
const cors_1 = require("hono/cors");
const jwt_1 = require("hono/jwt");
const dotenv_1 = require("dotenv");
const auth_routes_1 = require("./modules/auth/auth.routes");
const ai_routes_1 = require("./modules/ai/ai.routes");
const user_routes_1 = require("./modules/users/user.routes");
// Load environment variables
(0, dotenv_1.config)();
const app = new hono_1.Hono();
// Enable CORS
app.use('/*', (0, cors_1.cors)());
// Health Check
app.get('/', (c) => c.text('Giya Compass Backend Running (Production Phase)'));
// Public Routes
app.route('/auth', auth_routes_1.authRoutes);
// Protected Routes Middleware
app.use('/api/*', (0, jwt_1.jwt)({
    secret: process.env.JWT_SECRET || 'fallback_secret',
    alg: 'HS256',
}));
// Protected Routes
app.route('/api', ai_routes_1.aiRoutes);
app.route('/api/user', user_routes_1.userRoutes);
const port = 3001;
console.log(`Server is running on port ${port}`);
(0, node_server_1.serve)({
    fetch: app.fetch,
    port,
});
