# GymMind.ai 🏋️‍♂️🤖

> AI-Powered Gym Coach - Your intelligent fitness companion

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-green)](https://www.mongodb.com/)

## 📋 Overview

GymMind.ai is an AI-powered gym coaching web application that provides:

- **🏃 Personalized Workout Plans** - AI-generated workout routines based on your goals
- **📹 Exercise Form Analysis** - Computer vision-powered form checking using MediaPipe
- **🥗 Smart Nutrition Tracking** - Natural language meal logging with AI parsing
- **💬 24/7 AI Coach** - Conversational fitness assistant
- **📊 Progress Tracking** - Visual analytics and AI predictions
- **🔧 Routine Optimization** - AI analysis of existing workout routines

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17.0 or higher
- MongoDB (local or Atlas)
- OpenAI API key (or Gemini/Claude)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/gymmind-ai.git
cd gymmind-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🏗️ Project Structure

```
gymmind-ai/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (auth)/             # Authentication routes
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (protected)/        # Protected routes (requires auth)
│   │   │   ├── dashboard/
│   │   │   ├── workout-plan/
│   │   │   ├── form-check/
│   │   │   ├── chat/
│   │   │   ├── nutrition/
│   │   │   ├── routine-analyzer/
│   │   │   ├── progress/
│   │   │   └── settings/
│   │   ├── api/                # API Routes
│   │   │   └── health/
│   │   ├── layout.tsx
│   │   └── page.tsx            # Landing page
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components
│   │   ├── forms/              # Form components
│   │   └── features/           # Feature-specific components
│   ├── lib/                    # Utility libraries
│   │   ├── ai/                 # AI service integrations
│   │   │   ├── llm-client.ts   # LLM provider abstraction
│   │   │   └── prompts.ts      # AI prompt templates
│   │   ├── db/                 # Database utilities
│   │   │   ├── connection.ts   # MongoDB connection
│   │   │   └── schemas.ts      # Mongoose schemas
│   │   ├── api-endpoints.ts    # API endpoint definitions
│   │   ├── routes.ts           # Frontend route definitions
│   │   └── utils.ts            # Utility functions
│   ├── types/                  # TypeScript types
│   │   └── index.ts
│   ├── hooks/                  # Custom React hooks
│   └── styles/                 # Global styles
│       └── globals.css
├── public/                     # Static assets
├── .env.example                # Environment template
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
```

## 🔧 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Recharts** - Charts/graphs

### Backend
- **Next.js API Routes** - Serverless functions
- **MongoDB + Mongoose** - Database
- **NextAuth.js** - Authentication

### AI Services
- **OpenAI GPT-4** - Primary LLM for plans/chat/analysis
- **Google Gemini** - Alternative LLM
- **MediaPipe/MoveNet** - Pose detection for form checking
- **USDA FoodData Central** - Nutrition database

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/session` | Get current session |

### Workout
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workout/generate` | Generate AI workout plan |
| GET | `/api/workout/plan` | Get current plan |
| POST | `/api/workout/log` | Log completed workout |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/send` | Send message to AI |
| GET | `/api/chat/history` | Get chat history |

### Nutrition
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/nutrition/log` | Log meal with AI parsing |
| GET | `/api/nutrition/daily` | Get daily nutrition |

### Form Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/form-check/upload` | Upload video |
| POST | `/api/form-check/analyze` | Analyze form |

See [src/lib/api-endpoints.ts](src/lib/api-endpoints.ts) for complete API documentation.

## 🛠️ Development Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Planning & Architecture | ✅ Complete |
| 2 | Core App Skeleton (Auth, Onboarding, Dashboard) | 🔲 Pending |
| 3 | AI Workout Plan Generator | 🔲 Pending |
| 4 | AI Gym Chatbot | 🔲 Pending |
| 5 | Calorie & Macro Tracker | 🔲 Pending |
| 6 | Exercise Form Checker | 🔲 Pending |
| 7 | Routine Analyzer & Progress Tracking | 🔲 Pending |
| 8 | Polishing, Testing & Documentation | 🔲 Pending |

## 🔐 Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Required
MONGODB_URI=mongodb://localhost:27017/gymmind
NEXTAUTH_SECRET=your-secret-here
OPENAI_API_KEY=sk-your-key-here

# Optional (alternative LLM providers)
GOOGLE_GEMINI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here

# Optional (enhanced nutrition)
USDA_API_KEY=your-key-here
NUTRITIONIX_APP_ID=your-id-here
NUTRITIONIX_API_KEY=your-key-here
```

## 📦 Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run type-check # Run TypeScript check
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Docker

```dockerfile
# Coming soon
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ by the GymMind.ai Team
