# Phase 1: Planning & Architecture - Complete Documentation

**Project**: GymMind.ai - AI-Powered Gym Coach  
**Phase Duration**: Week 1  
**Status**: ✅ COMPLETE  
**Date Completed**: January 7, 2026

---

## 📋 Phase 1 Objectives

The primary goals of Phase 1 were:

1. ✅ Finalize MVP scope
2. ✅ Lock tech stack
3. ✅ Prepare Copilot-ready specs
4. ✅ Define frontend routes/pages
5. ✅ Define backend API endpoints
6. ✅ Set up GitHub repository structure
7. ✅ Configure environment variables for AI APIs

---

## 🛠️ Tech Stack Decisions

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.3 | React framework with App Router |
| React | 18.3.1 | UI library |
| TypeScript | 5.4.5 | Type safety |
| Tailwind CSS | 3.4.3 | Utility-first styling |
| Lucide React | 0.378.0 | Icon library |
| Recharts | 2.12.7 | Charts for progress tracking |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 14.2.3 | Serverless API endpoints |
| MongoDB | 5.9.2 | NoSQL database |
| Mongoose | 8.4.0 | MongoDB ODM |
| NextAuth.js | 4.24.7 | Authentication |
| Zod | 3.23.8 | Schema validation |
| bcryptjs | 2.4.3 | Password hashing |

### AI Services
| Technology | Purpose |
|------------|---------|
| OpenAI API | Primary LLM for workout plans, chatbot, nutrition parsing |
| Google Gemini API | Alternative LLM provider |
| MediaPipe | Pose detection for form checking |

### Development Tools
| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| Prettier | Code formatting |
| TypeScript | Type checking |

---

## 📁 Project Structure Created

```
GymMind.ai/
│
├── 📄 Configuration Files
│   ├── package.json              # Dependencies & scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── next.config.mjs           # Next.js configuration
│   ├── tailwind.config.ts        # Tailwind CSS configuration
│   ├── postcss.config.mjs        # PostCSS configuration
│   ├── .eslintrc.js              # ESLint rules
│   ├── .prettierrc               # Prettier formatting rules
│   ├── .gitignore                # Git ignore patterns
│   └── .env.example              # Environment variables template
│
├── 📁 .vscode/
│   ├── extensions.json           # Recommended VS Code extensions
│   └── settings.json             # Workspace settings
│
├── 📁 docs/
│   ├── ARCHITECTURE.md           # System architecture documentation
│   ├── API.md                    # Complete API documentation
│   └── PHASE-1-COMPLETE.md       # This file
│
├── 📁 src/
│   │
│   ├── 📁 app/                   # Next.js 14 App Router
│   │   │
│   │   ├── 📁 (auth)/            # Authentication route group
│   │   │   ├── login/page.tsx    # Login page (placeholder)
│   │   │   ├── signup/page.tsx   # Signup page (placeholder)
│   │   │   └── layout.tsx        # Auth layout
│   │   │
│   │   ├── 📁 (protected)/       # Protected route group
│   │   │   ├── onboarding/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── workout-plan/page.tsx
│   │   │   ├── form-check/page.tsx
│   │   │   ├── chat/page.tsx
│   │   │   ├── nutrition/page.tsx
│   │   │   ├── routine-analyzer/page.tsx
│   │   │   ├── progress/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── layout.tsx        # Protected layout
│   │   │
│   │   ├── 📁 api/               # API Routes
│   │   │   └── health/route.ts   # Health check endpoint
│   │   │
│   │   ├── layout.tsx            # Root layout with metadata
│   │   └── page.tsx              # Landing page (fully built)
│   │
│   ├── 📁 components/
│   │   └── ui/index.ts           # UI components barrel file
│   │
│   ├── 📁 hooks/
│   │   └── index.ts              # Custom hooks barrel file
│   │
│   ├── 📁 lib/
│   │   │
│   │   ├── 📁 ai/
│   │   │   ├── llm-client.ts     # LLM provider abstraction layer
│   │   │   └── prompts.ts        # AI prompt templates
│   │   │
│   │   ├── 📁 db/
│   │   │   ├── connection.ts     # MongoDB connection singleton
│   │   │   └── schemas.ts        # All Mongoose schemas
│   │   │
│   │   ├── api-endpoints.ts      # API endpoint definitions
│   │   ├── constants.ts          # Application constants
│   │   ├── routes.ts             # Frontend route definitions
│   │   └── utils.ts              # Utility functions
│   │
│   ├── 📁 styles/
│   │   └── globals.css           # Global styles + Tailwind
│   │
│   └── 📁 types/
│       └── index.ts              # TypeScript type definitions
│
└── 📄 README.md                  # Project documentation
```

---

## 🗺️ Frontend Routes Defined

### Public Routes
| Route | File | Purpose |
|-------|------|---------|
| `/` | `src/app/page.tsx` | Landing page with marketing content |
| `/login` | `src/app/(auth)/login/page.tsx` | User login |
| `/signup` | `src/app/(auth)/signup/page.tsx` | User registration |

### Protected Routes (Require Authentication)
| Route | File | Purpose | Phase |
|-------|------|---------|-------|
| `/onboarding` | `src/app/(protected)/onboarding/page.tsx` | User profile setup | Phase 2 |
| `/dashboard` | `src/app/(protected)/dashboard/page.tsx` | Main control center | Phase 2 |
| `/workout-plan` | `src/app/(protected)/workout-plan/page.tsx` | AI workout generator | Phase 3 |
| `/form-check` | `src/app/(protected)/form-check/page.tsx` | Video form analysis | Phase 6 |
| `/chat` | `src/app/(protected)/chat/page.tsx` | AI chatbot | Phase 4 |
| `/nutrition` | `src/app/(protected)/nutrition/page.tsx` | Calorie tracking | Phase 5 |
| `/routine-analyzer` | `src/app/(protected)/routine-analyzer/page.tsx` | Routine optimization | Phase 7 |
| `/progress` | `src/app/(protected)/progress/page.tsx` | Progress tracking | Phase 7 |
| `/settings` | `src/app/(protected)/settings/page.tsx` | User settings | Phase 8 |

---

## 🔌 API Endpoints Defined

### Authentication APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Create new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/session` | Get current session |

### User APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/PUT | `/api/user/profile` | Get/update profile |
| POST | `/api/user/onboarding` | Complete onboarding |
| DELETE | `/api/user/delete` | Delete account |

### Workout APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/workout/generate` | Generate AI workout plan |
| GET | `/api/workout/plan` | Get current plan |
| POST | `/api/workout/log` | Log completed workout |
| GET | `/api/workout/history` | Get workout history |

### Chat APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/chat/send` | Send message to AI |
| GET | `/api/chat/history` | Get chat history |
| DELETE | `/api/chat/clear` | Clear history |

### Nutrition APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/nutrition/log` | Log meal with AI |
| GET | `/api/nutrition/daily` | Get daily nutrition |
| GET | `/api/nutrition/weekly` | Get weekly summary |

### Form Check APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/form-check/upload` | Upload video |
| POST | `/api/form-check/analyze` | Analyze form |
| GET | `/api/form-check/results/:id` | Get results |

### Progress APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/progress/weight` | Log weight |
| GET | `/api/progress/stats` | Get statistics |
| GET | `/api/progress/predictions` | Get AI predictions |

### Utility APIs
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/api/health` | Health check | ✅ Working |

---

## 🗄️ Database Schemas Created

### Users Collection
```typescript
{
  email: string;
  isOnboardingComplete: boolean;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  height?: number;        // in cm
  weight?: number;        // in kg
  fitnessGoal?: FitnessGoal;
  experienceLevel?: ExperienceLevel;
  trainingLocation?: TrainingLocation;
  availableDays?: DayOfWeek[];
  injuries?: string[];
  bmr?: number;           // Calculated
  tdee?: number;          // Calculated
  createdAt: Date;
  updatedAt: Date;
}
```

### WorkoutPlans Collection
```typescript
{
  userId: ObjectId;
  startDate: Date;
  endDate: Date;
  weekNumber: number;
  goal: FitnessGoal;
  days: WorkoutDay[];
  aiExplanation: string;
}
```

### WorkoutLogs Collection
```typescript
{
  userId: ObjectId;
  workoutPlanId: ObjectId;
  date: Date;
  exercisesCompleted: ExerciseLog[];
  duration: number;
  perceivedExertion: number;  // 1-10
}
```

### MealEntries Collection
```typescript
{
  userId: ObjectId;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  foods: Food[];
  totalCalories: number;
  totalMacros: MacroNutrients;
  aiParsed: boolean;
}
```

### FormCheckResults Collection
```typescript
{
  userId: ObjectId;
  exercise: 'squat' | 'push-up';
  videoUrl: string;
  overallScore: number;      // 0-100
  issues: FormIssue[];
  keypoints: PoseKeypoints[];
  aiSummary: string;
}
```

### ChatMessages Collection
```typescript
{
  userId: ObjectId;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

### WeightLogs Collection
```typescript
{
  userId: ObjectId;
  date: Date;
  weight: number;
  notes?: string;
}
```

### RoutineAnalysis Collection
```typescript
{
  userId: ObjectId;
  inputRoutine: RoutineInput;
  volumeBreakdown: Record<string, number>;
  muscleBalance: MuscleBalanceAnalysis[];
  optimizedRoutine?: WorkoutPlan;
  aiExplanation: string;
}
```

---

## 🤖 AI Integration Layer

### LLM Client Abstraction (`src/lib/ai/llm-client.ts`)

Created a unified interface for multiple LLM providers:

```typescript
// Switch providers easily
const response = await generateLLMResponse(messages, {
  provider: 'openai',  // or 'gemini' or 'anthropic'
  model: 'gpt-4-turbo-preview',
  maxTokens: 2048,
  temperature: 0.7,
});
```

**Supported Providers:**
- ✅ OpenAI (GPT-4, GPT-3.5)
- ✅ Google Gemini
- 🔲 Anthropic Claude (ready to add)

### Prompt Templates (`src/lib/ai/prompts.ts`)

Pre-built prompts for each AI feature:

| Prompt | Purpose |
|--------|---------|
| `SYSTEM_PROMPTS.GYM_COACH` | Base coaching persona |
| `SYSTEM_PROMPTS.WORKOUT_PLANNER` | Workout plan generation |
| `SYSTEM_PROMPTS.CHATBOT` | Conversational assistant |
| `SYSTEM_PROMPTS.NUTRITION_PARSER` | Food parsing |
| `SYSTEM_PROMPTS.ROUTINE_ANALYZER` | Routine analysis |
| `buildWorkoutPlanPrompt()` | Dynamic workout prompt |
| `buildChatbotPrompt()` | Context-aware chat prompt |
| `buildNutritionParsePrompt()` | Meal parsing prompt |
| `buildRoutineAnalysisPrompt()` | Routine analysis prompt |

---

## 🔧 Utility Functions Created

### Fitness Calculations (`src/lib/utils.ts`)
- `calculateBMR()` - Basal Metabolic Rate (Mifflin-St Jeor)
- `calculateTDEE()` - Total Daily Energy Expenditure
- `calculateMacros()` - Recommended macros based on goal

### Date Utilities
- `getDayOfWeek()` - Get day name from date
- `formatDate()` - Format dates (short, long, relative)
- `getStartOfWeek()` - Get Monday of current week

### Validation Utilities
- `isValidEmail()` - Email format validation
- `validatePassword()` - Password strength check

### General Utilities
- `cn()` - Tailwind class merger
- `generateId()` - Random ID generator
- `safeJsonParse()` - Safe JSON parsing
- `extractJsonFromResponse()` - Extract JSON from LLM output

---

## 🎨 Landing Page Built

A complete, production-ready landing page with:

### Sections
1. **Navigation** - Logo, login, signup buttons
2. **Hero Section** - Main headline, CTA buttons
3. **Features Section** - 6 feature cards with icons
4. **How It Works** - 3-step process
5. **CTA Section** - Final conversion section
6. **Footer** - Copyright, branding

### Design System
- Dark theme (dark-950 background)
- Primary color: Green (#22c55e)
- Accent color: Red (#ef4444)
- Responsive design (mobile-first)
- Smooth animations

---

## 🔐 Environment Configuration

### `.env.example` Template Created

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/gymmind

# AI Services
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
DEFAULT_LLM_PROVIDER=openai

# Nutrition APIs
USDA_API_KEY=...
NUTRITIONIX_APP_ID=...
NUTRITIONIX_API_KEY=...

# Rate Limiting
MAX_AI_CALLS_PER_DAY=100
MAX_FORM_CHECK_CALLS_PER_DAY=10

# Feature Flags
ENABLE_FORM_CHECKER=true
ENABLE_ROUTINE_ANALYZER=true
ENABLE_CHATBOT=true
```

---

## 📚 Documentation Created

### README.md
- Project overview
- Quick start guide
- Project structure
- Tech stack details
- API overview
- Development phases
- Deployment instructions

### docs/ARCHITECTURE.md
- System architecture diagram
- Data flow diagrams
- Component relationships
- Security considerations
- Scalability notes
- Deployment architecture

### docs/API.md
- Complete API reference
- Request/response formats
- Authentication details
- Error codes
- Rate limits
- Example requests

---

## ✅ Verification

### TypeScript Compilation
```bash
npm run type-check  # ✅ Passes with no errors
```

### Development Server
```bash
npm run dev  # ✅ Runs successfully on localhost:3000
```

### Endpoints Tested
- `GET /` - Landing page loads ✅
- `GET /api/health` - Returns health status ✅

---

## 📈 Phase 2 Preview

### Next Phase: Core App Skeleton (Week 2)

**Tasks:**
1. Implement NextAuth.js authentication
2. Create login/signup forms with validation
3. Build onboarding flow (multi-step form)
4. Create dashboard layout with sidebar
5. Connect MongoDB Atlas
6. Implement protected routes
7. Add loading states and error handling

**Expected Deliverables:**
- User can sign up with email/password
- User can log in
- Profile data stored in MongoDB
- Dashboard loads (without AI features)
- Onboarding flow captures fitness profile

---

## 📝 Notes for Future Development

### Code Patterns Established
1. **API Response Format**: Consistent `{ success, data, error, meta }` structure
2. **Type Safety**: All data structures have TypeScript interfaces
3. **Route Organization**: Using Next.js route groups `(auth)`, `(protected)`
4. **AI Abstraction**: Provider-agnostic LLM interface
5. **Database**: Mongoose schemas with timestamps

### Important Files to Reference
- Routes: `src/lib/routes.ts`
- API Endpoints: `src/lib/api-endpoints.ts`
- Types: `src/types/index.ts`
- DB Schemas: `src/lib/db/schemas.ts`
- AI Prompts: `src/lib/ai/prompts.ts`

### Commands Reference
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # TypeScript type check
```

---

**Phase 1 Complete** ✅  
**Ready for Phase 2** 🚀
