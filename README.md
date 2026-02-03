# Square Puzzles

A production-grade daily word puzzle platform with admin-controlled puzzle creation, user authentication, and responsive design.

## Tech Stack

### Frontend
- **Next.js 16** with App Router
- **TypeScript**
- **Tailwind CSS v4**
- Runs on Port 3000

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with Mongoose ODM
- **JWT Authentication** (HTTP-only cookies)
- Runs on Port 5000

## Project Structure

```
game-website/
├── my-app/                 # Frontend (Next.js)
│   ├── app/               # App Router pages
│   │   ├── (auth)/        # Login, Register, Forgot Password
│   │   ├── (main)/        # Dashboard, Play, Profile, etc.
│   │   └── (admin)/       # Admin Dashboard, Create Puzzle, etc.
│   ├── components/        # Reusable components
│   │   ├── layout/        # Sidebar, BottomNav, Header
│   │   ├── puzzle/        # PuzzleGrid, PuzzleActions
│   │   └── ui/            # Button, Card, Input, Modal
│   ├── lib/               # API client, Auth context, EmailJS
│   └── types/             # TypeScript interfaces
│
└── backend/               # Backend (Express.js)
    ├── src/
    │   ├── config/        # Database, environment
    │   ├── controllers/   # Route handlers
    │   ├── middleware/    # Auth, validation, error handling
    │   ├── models/        # Mongoose schemas
    │   ├── routes/        # API routes
    │   └── services/      # Business logic
    └── scripts/           # Admin seeding
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account or local MongoDB
- EmailJS account (for notifications)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB URI and JWT secret
# MONGODB_URI=mongodb+srv://...
# JWT_SECRET=your-secret-key

# Seed admin user
npm run seed:admin

# Start development server
npm run dev
```

### 2. Frontend Setup

```bash
cd my-app

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local with your EmailJS credentials

# Start development server
npm run dev
```

### 3. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

## Features

### User Features
- Daily puzzle gameplay
- Progress auto-save
- Hint system
- Result sharing (clipboard)
- Puzzle history
- Streak tracking

### Admin Features
- Puzzle creation with visual preview
- Word placement and validation
- Visible/hint cell configuration
- Daily message setting
- Report management
- User management

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Puzzle (User)
- `GET /api/puzzle/today` - Get today's puzzle
- `POST /api/puzzle/check` - Validate grid
- `POST /api/puzzle/hint` - Get hint
- `POST /api/puzzle/save` - Save progress
- `GET /api/puzzle/yesterday` - Get yesterday's result

### Admin
- `POST /api/admin/puzzle` - Create puzzle
- `GET /api/admin/puzzles` - List puzzles
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/reports` - View reports

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your-service-id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your-public-key
```

## Deployment

### Push to GitHub

```bash
# Create a new repo on GitHub (github.com → New repository), then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Deploy on Render (frontend + backend)

The repo includes a **Blueprint** (`render.yaml`) so you can deploy both services from the Render dashboard.

1. **Push your code to GitHub** (see above).
2. In [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**.
3. Connect your GitHub repo. Render will detect `render.yaml` and create:
   - **spiritualunitymatch-backend** (root: `backend`, health: `/api/health`)
   - **spiritualunitymatch-frontend** (root: `my-app`, Next.js standalone)
4. In each service, set **Environment** variables (marked `sync: false` in the blueprint):
   - **Backend**: `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, etc.
   - **Frontend**: `NEXT_PUBLIC_API_URL` = your backend URL (e.g. `https://spiritualunitymatch-backend.onrender.com/api`)
5. Deploy. Frontend subdirectory routes (e.g. `/dashboard`, `/login`) work on direct load/refresh via Next.js and `skipTrailingSlashRedirect`.

### MongoDB Atlas
1. Create cluster
2. Add database user
3. Whitelist IP addresses
4. Get connection string

## Security

- JWT stored in HTTP-only cookies
- Password hashing with bcrypt (12 rounds)
- Rate limiting on auth endpoints
- CORS restricted to frontend URL
- Input validation with express-validator
- Secure headers with Helmet

## License

MIT
