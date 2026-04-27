# Caregiver Training

Caregiver Training is a dementia caregiver learning platform built with a React + Vite frontend and an Express + MongoDB backend. It provides structured courses, lesson content, progress tracking, user accounts, accessibility controls, and AI-assisted learning support.

## What the app does

- Guides learners through dementia caregiving courses and lessons.
- Tracks completion, points, and streaks for each user.
- Supports Firebase authentication for sign in and registration.
- Includes an AI caregiver coach powered by Gemini for question-specific help.
- Includes text-to-speech support through ElevenLabs with a browser fallback.
- Lets users change font size for a more accessible reading experience.

## Tech Stack

- Frontend: React, Vite, Firebase Auth
- Backend: Node.js, Express, Mongoose, MongoDB
- AI and voice services: Gemini API, ElevenLabs API

## Project Structure

- `src/` - Frontend application code
- `src/components/` - Pages, layout, chatbot, profile, and lesson UI
- `src/contexts/` - Authentication and font size providers
- `src/services/` - API client and AI/voice integrations
- `src/config/` - Firebase configuration
- `backend/` - Express API server, routes, models, and database config

## Prerequisites

- Node.js 18 or newer
- MongoDB connection string
- Firebase project credentials
- Gemini API key if you want the AI coach to work
- ElevenLabs API key if you want premium text-to-speech

## Setup

### 1. Install dependencies

Install frontend dependencies from the project root:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root for the frontend, then add the Firebase, API, and optional AI keys:

```env
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

Create a separate `.env` file inside `backend/` for the server:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
```

### 3. Run the apps

Start the frontend from the project root:

```bash
npm run dev
```

Start the backend from the `backend/` folder:

```bash
cd backend
npm run dev
```

## Available Scripts

### Frontend

- `npm run dev` - Start the Vite development server
- `npm run build` - Build the frontend for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint

### Backend

- `npm run dev` - Start the Express server with nodemon

## Main Features

- Authentication flow with login and registration screens
- Home, course catalog, lesson, progress dashboard, and profile views
- Course completion and progress persistence
- Question loading and lesson content retrieval from the API
- AI chat help for lesson questions
- Read-aloud support for accessibility and practice

## API Overview

The backend exposes routes for:

- `GET /api/health` - Health check
- `GET /api/questions` - Fetch questions with filters
- `GET /api/lessons/:lessonKey` - Fetch a lesson by key
- `GET /api/lessons/by-subsection/:subsection` - Fetch a lesson by subsection
- `GET /api/users/:firebaseUid` - Fetch a user profile
- `POST /api/users` - Create or update a user profile
- `PUT /api/users/:firebaseUid/preferences` - Update user preferences
- `GET /api/progress/:firebaseUid` - Fetch progress entries for a user
- `POST /api/progress` - Save a progress entry

## Notes

- The frontend defaults to `http://localhost:3000` when `VITE_API_URL` is not set.
- If the Gemini or ElevenLabs keys are missing, the related features will fail gracefully or fall back where supported.
- The app is centered on dementia caregiver education, so course content and AI prompts are tailored to that topic.
