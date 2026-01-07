# GymMind.ai - Architecture Documentation

## System Overview

GymMind.ai is built as a modern full-stack web application using Next.js 14 with the App Router, providing both frontend and backend functionality in a single codebase.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Landing   │  │    Auth     │  │  Protected  │              │
│  │    Page     │  │   Pages     │  │    Pages    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                           │                                      │
│                    React Components                              │
│                    Tailwind CSS                                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 Next.js API Routes                       │    │
│  │  /api/auth/*  /api/workout/*  /api/chat/*  /api/...     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Auth      │  │  Validation │  │    Rate     │              │
│  │ Middleware  │  │   (Zod)     │  │  Limiting   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   AI Orchestration                       │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐            │    │
│  │  │  OpenAI   │  │  Gemini   │  │ MediaPipe │            │    │
│  │  │   API     │  │    API    │  │  Vision   │            │    │
│  │  └───────────┘  └───────────┘  └───────────┘            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 Business Logic                           │    │
│  │  • BMR/TDEE Calculations   • Form Analysis Rules         │    │
│  │  • Workout Scheduling      • Progress Predictions        │    │
│  │  • Nutrition Parsing       • Volume Balancing            │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    MongoDB                               │    │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐         │    │
│  │  │ Users  │  │Workouts│  │  Meals │  │  Chat  │         │    │
│  │  └────────┘  └────────┘  └────────┘  └────────┘         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               External Data Sources                      │    │
│  │  • USDA FoodData Central    • Nutritionix API           │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### Workout Plan Generation

```
User Request → API Route → Validate Input
                              ↓
                         Load User Profile
                              ↓
                     Build LLM Prompt (with context)
                              ↓
                      Call OpenAI/Gemini API
                              ↓
                     Parse JSON Response
                              ↓
                    Save to MongoDB
                              ↓
                  Return Structured Plan
```

### Form Check Analysis

```
Video Upload → Store Temporarily → Extract Frames
                                       ↓
                              Load MediaPipe Model
                                       ↓
                            Extract Pose Keypoints
                                       ↓
                        Apply Rule-Based Analysis
                              (joint angles, alignment)
                                       ↓
                          Calculate Form Score
                                       ↓
                     Generate Correction Suggestions
                                       ↓
                        Save Results to MongoDB
```

### AI Chatbot Flow

```
User Message → API Route → Load User Context
                               ↓
                    Load Recent Chat History
                               ↓
                   Inject Context into Prompt
                               ↓
                     Apply Domain Constraints
                               ↓
                      Call LLM API
                               ↓
                   Save Message to History
                               ↓
                    Return AI Response
```

## Key Design Decisions

### 1. LLM Abstraction Layer

We use a unified LLM interface (`llm-client.ts`) that allows easy switching between providers:

```typescript
const response = await generateLLMResponse(messages, {
  provider: 'openai',  // or 'gemini' or 'anthropic'
  model: 'gpt-4-turbo-preview',
  maxTokens: 2048,
  temperature: 0.7,
});
```

### 2. Prompt Engineering

All prompts are centralized in `prompts.ts` with:
- System prompts for each feature
- User context injection
- Output format specifications
- Domain constraints

### 3. MongoDB Schema Design

Schemas are designed for:
- Fast queries (indexed fields)
- Efficient storage (embedded vs referenced)
- Future extensibility

### 4. Next.js App Router

Using App Router provides:
- File-based routing
- Server components by default
- Simplified data fetching
- Better SEO capabilities

## Security Considerations

1. **Authentication**: NextAuth.js with JWT sessions
2. **API Security**: Rate limiting per user
3. **Data Validation**: Zod schemas for all inputs
4. **Environment Variables**: Secrets never exposed to client
5. **CORS**: Configured for production domains only

## Scalability

The architecture supports scaling through:
- Serverless deployment (Vercel)
- MongoDB Atlas clustering
- CDN for static assets
- API response caching
- Background job processing (future)

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         VERCEL                                │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │   Edge CDN     │  │  Serverless    │  │   Static       │  │
│  │   (Global)     │  │   Functions    │  │   Assets       │  │
│  └────────────────┘  └────────────────┘  └────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│  │  MongoDB   │  │  OpenAI    │  │   USDA     │              │
│  │   Atlas    │  │    API     │  │    API     │              │
│  └────────────┘  └────────────┘  └────────────┘              │
└──────────────────────────────────────────────────────────────┘
```
