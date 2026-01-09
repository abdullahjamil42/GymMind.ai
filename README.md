# GymMind.ai - AI Gym Coach 🏋️‍♂️🤖

> AI-Powered Gym Coaching Web Application

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-green)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini-AI-4285F4)](https://ai.google.dev/)

## 📋 Overview

GymMind.ai is an intelligent, AI-powered gym coaching web application that provides personalized workout plans, real-time exercise form analysis, nutrition tracking, and adaptive training recommendations. Built as a complete MVP demonstrating modern full-stack development with AI integration.

### ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🏃 **Personalized Workout Plans** | AI-generated routines based on your goals, experience, and schedule |
| 📹 **Exercise Form Analysis** | MediaPipe-powered pose detection with real-time form feedback |
| 🥗 **Smart Nutrition Tracking** | Natural language meal logging with AI food parsing |
| 💬 **24/7 AI Coach** | Conversational fitness assistant powered by Gemini |
| 📊 **Progress Tracking** | Visual analytics with streaks, achievements, and weight tracking |
| 🔄 **Routine Analyzer** | AI-powered workout split optimization with muscle group balance |
| 🎯 **Interactive Workouts** | Guided workout sessions with set/rep logging |

## 🏗️ Project Structure

```
gymmind-ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Authentication pages
│   │   ├── (protected)/        # Authenticated routes
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── workout-plan/   # View workout plans
│   │   │   ├── workout-session/# Interactive workout
│   │   │   ├── nutrition/      # Nutrition tracking
│   │   │   ├── form-check/     # Form analysis
│   │   │   ├── progress/       # Progress tracking
│   │   │   └── routine-analyzer/ # Routine optimization
│   │   └── api/                # API routes
│   ├── components/             # React components
│   │   └── ui/                 # Reusable UI components
│   ├── lib/                    # Utilities and configs
│   │   ├── mongodb.ts          # Database connection
│   │   ├── gemini.ts           # AI integration
│   │   └── utils.ts            # Helper functions
│   ├── models/                 # Mongoose schemas
│   └── styles/                 # Global styles
├── public/                     # Static assets
└── docs/                       # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.17.0
- npm or yarn
- MongoDB (local or Atlas)
- Google AI API key (for Gemini)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/GymMind.ai.git
cd GymMind.ai

# Install dependencies
npm install
```

### Environment Setup

Create `.env.local` in the project root:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gymmind

# Authentication
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Google Gemini AI
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Production Build

```bash
npm run build
npm start
```

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/*` | * | NextAuth.js authentication |
| `/api/user/profile` | GET/PUT | User profile management |
| `/api/workout-plan` | GET/POST | Workout plan CRUD |
| `/api/workout-plan/generate` | POST | AI workout generation |
| `/api/nutrition` | GET/POST/DELETE | Nutrition tracking |
| `/api/nutrition/parse` | POST | AI food parsing |
| `/api/chat` | POST | AI coach chat |
| `/api/form-analysis` | POST | Form analysis |
| `/api/routine-analyzer` | POST | Routine optimization |
| `/api/progress` | GET/POST | Progress tracking |

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **MediaPipe** - Pose detection

### Backend
- **Next.js API Routes** - Serverless functions
- **MongoDB** - NoSQL database
- **Mongoose** - ODM
- **NextAuth.js** - Authentication

### AI/ML
- **Google Gemini** - LLM for chat, workout generation, nutrition parsing
- **MediaPipe Pose** - Computer vision for form analysis

## 🚢 Deployment (Vercel)

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your Vercel domain)
   - `GOOGLE_GENERATIVE_AI_API_KEY`
4. Deploy!

## 📸 Screenshots

### Dashboard
The central hub showing workout stats, nutrition tracking, and quick actions.

### AI Coach
Chat with your personal AI fitness coach for advice and motivation.

### Form Check
Upload exercise videos for AI-powered form analysis and corrections.

### Nutrition Tracker
Log meals with natural language and track macros throughout the day.

## 🔒 Security

- Password hashing with bcrypt
- JWT session tokens with NextAuth.js
- Protected API routes with session validation
- Environment variables for sensitive data

## 📄 License

Private - All rights reserved

---

Built with ❤️ for fitness enthusiasts
