# Game Legends - Interactive Lottery and Trainer Management Platform

## Overview

Game Legends is an Arabic-language web application for managing soccer manager game trainers and conducting lottery draws. The platform features a control panel for trainer data management and an intelligent lottery system that assigns random clubs to participants with 24-hour session persistence.

**Core Purpose:** Provide an interactive platform for gaming community management with features for tracking trainer statistics and conducting fair, transparent lottery draws for club assignments.

**Key Features:**
- Trainer management dashboard (CRUD operations)
- Lottery system with 24-hour automatic session persistence
- Password-protected administrative functions
- Modern bilingual UI (Arabic primary, English support)
- Dark/light theme toggle
- Vercel deployment ready with dual storage options

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- Vanilla JavaScript (ES6+)
- HTML5 with RTL (Right-to-Left) support for Arabic
- CSS3 with CSS Custom Properties for theming
- Font Awesome 6.4.0 for icons

**Design Pattern:**
- Single Page Application (SPA) approach with multiple HTML pages
- Client-side routing via direct HTML file access
- Modular CSS organization (separate files for control panel, lottery, global styles)
- Theme system using `data-theme` attribute toggling between light/dark modes

**Key Components:**
1. **index.html** - Landing page with navigation
2. **control-panel.html** - Trainer management interface
3. **draw-new.html** - Enhanced lottery system with session management
4. **draw.html** - Legacy lottery implementation

**State Management:**
- localStorage for client-side persistence (names, clubs, titles, theme preferences)
- JWT tokens stored in localStorage for authentication
- API-driven data synchronization with backend

### Backend Architecture

**Technology Stack:**
- Node.js 18+
- Express.js 4.18.2 web framework
- JWT (jsonwebtoken 9.0.2) for authentication
- bcryptjs 2.4.3 for password hashing (installed but not actively used)
- CORS enabled for cross-origin requests

**Design Pattern:**
- RESTful API architecture
- Middleware-based authentication using JWT
- Dual storage abstraction layer (file-based for Replit, KV for Vercel)
- Modular route organization

**API Structure:**

```
/api/auth
  POST /login - Authenticate and receive JWT token
  GET /verify - Validate existing JWT token

/api/trainers
  GET / - Retrieve all trainers (public)
  POST / - Add new trainer (protected)
  PUT /:id - Update trainer (protected)
  DELETE /:id - Delete trainer (protected)

/api/lottery
  GET / - Get active lottery draws (public)
  POST / - Create new lottery draw (protected)
  DELETE /:id - Delete lottery draw (protected)
```

**Authentication Flow:**
1. Client submits password to `/api/auth/login`
2. Server validates against environment variable `ADMIN_PASSWORD` (default: "1")
3. JWT token generated with 24-hour expiration
4. Token stored client-side and sent in Authorization header for protected routes
5. Middleware `verifyToken` validates JWT on protected endpoints

**Data Models:**

*Trainer:*
```javascript
{
  id: number,
  name: string,
  leagues: number,
  cups: number,
  tournaments: number
}
```

*Lottery Draw:*
```javascript
{
  id: timestamp,
  title: string,
  results: [{ name: string, club: string }],
  createdAt: ISO8601 timestamp,
  expiresAt: ISO8601 timestamp (createdAt + 24 hours)
}
```

### Data Storage Solutions

**Dual Storage System (backend/storage.js):**

The application implements an intelligent storage abstraction that automatically adapts based on deployment environment, ensuring seamless operation on both Replit and Vercel.

**File-Based Storage (Development/Replit):**
- Activated when `NODE_ENV !== 'production'` or Vercel KV package unavailable
- JSON files stored in `backend/data/` directory
- Files: `trainers.json`, `lottery.json`
- Automatic directory creation and initialization with default trainer data
- Manual expiry filtering for lottery draws (removes expired entries on read)
- Perfect for local development and Replit deployment

**Vercel KV Storage (Production):**
- Activated when `NODE_ENV === 'production'` AND `@vercel/kv` package available
- Redis-based key-value store powered by Upstash
- Storage keys: `trainers` (trainers list), `lottery:*` (individual lottery draws)
- Native 24-hour TTL for lottery draws using KV's `ex` parameter (86400 seconds)
- Automatic fallback to default trainers if key doesn't exist
- Survives serverless cold starts (critical for Vercel deployment)

**Storage Interface Methods:**
- `getTrainers()` - Retrieve trainer list from storage
- `setTrainers(trainers)` - Save updated trainer list
- `getLotteryDraws()` - Retrieve all active lottery draws (auto-filters expired)
- `addLotteryDraw(draw)` - Add new lottery with 24-hour expiry
- `deleteLotteryDraw(id)` - Remove specific lottery draw
- `getDefaultTrainers()` - Return initial seed data (10 trainers)

**Data Persistence Strategy:**
- **Trainers**: Persist indefinitely until manually deleted (both environments)
- **Lottery Draws**: Auto-expire after exactly 24 hours
  - File mode: Filters expired draws during read operations
  - KV mode: Uses native Redis TTL for automatic deletion
- **Environment Detection**: Gracefully handles missing KV in development
- **Data Migration**: No migration needed - storage layer abstracts implementation

### Authentication and Authorization

**Single Password System:**
- Shared password for both control panel and lottery creation
- Default password: "1" (configurable via `ADMIN_PASSWORD` environment variable)
- Plain text comparison (note: bcryptjs installed but not implemented)

**JWT Implementation:**
- Secret key: `JWT_SECRET` environment variable (default: 'game-legends-secret-key-2025')
- Token payload: `{ admin: true, timestamp: Date.now() }`
- Expiration: 24 hours
- Middleware: `verifyToken` in `backend/middleware/auth.js`

**Protected Routes:**
- All POST, PUT, DELETE operations on trainers and lottery
- Public access to GET endpoints for displaying data

**Security Considerations:**
- CORS enabled for all origins (development convenience)
- No rate limiting implemented
- Password stored in plain text (not production-ready)
- JWT secret should be strong random string in production

### Deployment Configuration

**Vercel Serverless:**
- Entry point: `backend/server.js`
- Serverless wrapper: `api/index.js`
- Build configuration: `vercel.json`
- Static file serving from `frontend/` directory
- Catch-all routing to serve SPA

**Environment Variables Required:**
- `ADMIN_PASSWORD` - Admin authentication password
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - Environment mode (production/development)
- `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN` - Vercel KV credentials (auto-injected)

**Vercel Configuration (vercel.json):**
- Single build target: Node.js serverless function
- Route priority: API routes first, then static files
- All routes proxy through Express server

## External Dependencies

### Third-Party Packages

**Production Dependencies:**
- **@vercel/kv** (3.0.0) - Vercel KV storage client using Upstash Redis
- **bcryptjs** (2.4.3) - Password hashing library (installed but unused)
- **cors** (2.8.5) - Cross-Origin Resource Sharing middleware
- **dotenv** (16.3.1) - Environment variable loader
- **express** (4.18.2) - Web application framework
- **jsonwebtoken** (9.0.2) - JWT authentication tokens

### External Services

**Vercel KV Database:**
- Redis-compatible key-value store
- Provided by Upstash infrastructure
- Required for production deployment on Vercel
- Not required for local/Replit development

**CDN Resources:**
- Font Awesome 6.4.0 (icons) - `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`

### Platform Integrations

**Replit:**
- Direct file system access for data storage
- Port 5000 default binding
- Automatic environment setup

**Vercel:**
- Serverless function deployment
- KV storage integration
- Automatic HTTPS and CDN
- Environment variable management

### External Links (Embedded in UI)

- Online Soccer Manager game: `https://ar.onlinesoccermanager.com/`
- WhatsApp group (results): `https://chat.whatsapp.com/I5ZFr5Es2mqFOvkpxABwUV`
- WhatsApp group (discussion): `https://chat.whatsapp.com/IhtZfd0fLSiE1AeNPp04Ua`