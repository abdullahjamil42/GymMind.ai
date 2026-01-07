# API Documentation

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://gymmind.ai/api`

## Authentication

All protected endpoints require a valid session cookie from NextAuth.js.

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "2026-01-07T12:00:00Z",
    "requestId": "abc123"
  }
}
```

### Error Response

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided"
  }
}
```

---

## Health Check

### GET `/api/health`

Check API status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-07T12:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "llm": "available"
  }
}
```

---

## Authentication Endpoints

### POST `/api/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "email": "user@example.com"
  }
}
```

### POST `/api/auth/login`

Log in to an existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

---

## User Endpoints

### POST `/api/user/onboarding`

Complete user onboarding with fitness profile.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "height": 180,
  "weight": 80,
  "fitnessGoal": "build-muscle",
  "experienceLevel": "intermediate",
  "trainingLocation": "gym",
  "availableDays": ["monday", "wednesday", "friday"],
  "injuries": ["lower back pain"]
}
```

### GET `/api/user/profile`

Get current user's profile.

### PUT `/api/user/profile`

Update user profile.

---

## Workout Endpoints

### POST `/api/workout/generate`

Generate a new AI workout plan.

**Request Body:**
```json
{
  "regenerate": false,
  "preferences": {
    "focusAreas": ["chest", "back"],
    "excludeExercises": ["deadlift"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "planId": "plan_123",
    "weeklyPlan": [
      {
        "day": "monday",
        "name": "Push Day",
        "focus": ["chest", "shoulders", "triceps"],
        "exercises": [
          {
            "id": "ex_1",
            "name": "Bench Press",
            "muscleGroup": "chest",
            "equipment": "barbell",
            "sets": 4,
            "reps": "8-10",
            "restSeconds": 90,
            "instructions": "..."
          }
        ],
        "estimatedDuration": 60,
        "isRestDay": false
      }
    ],
    "explanation": "This plan focuses on..."
  }
}
```

### GET `/api/workout/plan`

Get current active workout plan.

### POST `/api/workout/log`

Log a completed workout session.

**Request Body:**
```json
{
  "date": "2026-01-07",
  "day": "monday",
  "exercisesCompleted": [
    {
      "exerciseId": "ex_1",
      "setsCompleted": 4,
      "repsPerSet": [10, 10, 9, 8],
      "weightUsed": 60,
      "notes": "Felt strong today"
    }
  ],
  "duration": 55,
  "perceivedExertion": 7
}
```

---

## Chat Endpoints

### POST `/api/chat/send`

Send a message to the AI coach.

**Request Body:**
```json
{
  "message": "What should I eat after a workout?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "msg_123",
    "role": "assistant",
    "content": "After a workout, focus on protein and carbohydrates...",
    "timestamp": "2026-01-07T12:00:00Z"
  }
}
```

### GET `/api/chat/history`

Get chat history with pagination.

**Query Parameters:**
- `limit` (optional): Number of messages (default: 50)
- `before` (optional): Cursor for pagination

---

## Nutrition Endpoints

### POST `/api/nutrition/log`

Log a meal using natural language.

**Request Body:**
```json
{
  "mealType": "lunch",
  "description": "Grilled chicken breast with rice and broccoli"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mealId": "meal_123",
    "foods": [
      {
        "name": "Grilled chicken breast",
        "quantity": "1 breast (150g)",
        "calories": 231,
        "macros": {
          "protein": 43,
          "carbs": 0,
          "fat": 5,
          "fiber": 0
        }
      }
    ],
    "totalCalories": 450,
    "totalMacros": {
      "protein": 48,
      "carbs": 52,
      "fat": 8,
      "fiber": 6
    }
  }
}
```

### GET `/api/nutrition/daily`

Get daily nutrition summary.

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format (default: today)

---

## Form Check Endpoints

### POST `/api/form-check/upload`

Upload a video for form analysis.

**Request Body:** `multipart/form-data`
- `video`: Video file (MP4, MOV, max 50MB)
- `exercise`: Exercise type (`squat` | `push-up`)

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadId": "upload_123",
    "status": "processing"
  }
}
```

### POST `/api/form-check/analyze`

Analyze an uploaded video.

**Request Body:**
```json
{
  "uploadId": "upload_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "resultId": "result_123",
    "exercise": "squat",
    "overallScore": 78,
    "issues": [
      {
        "type": "knee_cave",
        "severity": "moderate",
        "description": "Knees caving inward during descent",
        "correction": "Focus on pushing knees out over toes",
        "timestamp": 2.5
      }
    ],
    "summary": "Good depth and bar path, but watch your knee position..."
  }
}
```

---

## Routine Analyzer Endpoints

### POST `/api/routine/analyze`

Analyze an existing workout routine.

**Request Body:**
```json
{
  "exercises": [
    { "name": "Bench Press", "setsPerWeek": 12, "muscleGroup": "chest" },
    { "name": "Shoulder Press", "setsPerWeek": 9, "muscleGroup": "shoulders" },
    { "name": "Pull-ups", "setsPerWeek": 6, "muscleGroup": "back" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "volumeAnalysis": {
      "chest": { "sets": 12, "status": "optimal" },
      "shoulders": { "sets": 9, "status": "optimal" },
      "back": { "sets": 6, "status": "undertrained" }
    },
    "issues": [
      {
        "type": "imbalance",
        "description": "Push volume significantly exceeds pull volume",
        "severity": "moderate",
        "suggestion": "Add 6-8 sets of rowing movements"
      }
    ],
    "overallScore": 65,
    "summary": "Your routine has good pushing volume but lacks pulling movements..."
  }
}
```

---

## Progress Endpoints

### POST `/api/progress/weight`

Log a weight measurement.

**Request Body:**
```json
{
  "weight": 79.5,
  "date": "2026-01-07",
  "notes": "Morning weight, fasted"
}
```

### GET `/api/progress/stats`

Get progress statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "startWeight": 82,
    "currentWeight": 79.5,
    "targetWeight": 75,
    "weightChange": -2.5,
    "workoutsCompleted": 24,
    "currentStreak": 5,
    "longestStreak": 12,
    "avgCaloriesPerDay": 2150,
    "estimatedTimeToGoal": 45
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_INVALID_CREDENTIALS` | Invalid email or password |
| `AUTH_TOKEN_EXPIRED` | Session has expired |
| `AUTH_UNAUTHORIZED` | Not authenticated |
| `VALIDATION_ERROR` | Invalid request data |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `DAILY_LIMIT_EXCEEDED` | Daily AI call limit reached |
| `AI_SERVICE_ERROR` | AI provider error |
| `INTERNAL_ERROR` | Server error |

---

## Rate Limits

- **AI Endpoints**: 100 calls/day per user
- **Form Check**: 10 analyses/day per user
- **General API**: 1000 requests/hour per user
