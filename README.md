# GymMind.ai - AI Gym Coach 🏋️‍♂️🤖

> AI-Powered Gym Coaching Web Application

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-green)](https://www.mongodb.com/)

## 📋 Overview

GymMind.ai is an intelligent, AI-powered gym coaching web application that provides personalized workout plans, real-time exercise form analysis, and adaptive training recommendations.

### Key Features

- **🏃 Personalized Workout Plans** - AI-generated routines based on your goals
- **📹 Exercise Form Analysis** - Computer vision-powered form checking
- **🥗 Smart Nutrition Tracking** - Natural language meal logging
- **💬 24/7 AI Coach** - Conversational fitness assistant
- **📊 Progress Tracking** - Visual analytics and predictions

## 🏗️ Project Structure

```
gymmind-ai/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and configurations
│   ├── styles/           # Global styles
│   └── types/            # TypeScript types
├── docs/                 # Documentation
├── public/               # Static assets
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.17.0
- npm
- MongoDB (local or Atlas)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:3000 to view the app.

### Building

```bash
npm run build
npm start
```

## 🔧 Environment Variables

Create `.env.local` at root:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/gymmind

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# AI APIs (optional)
OPENAI_API_KEY=sk-...
```

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Phase 1 Complete](docs/PHASE-1-COMPLETE.md)
- [Phase 2 Complete](docs/PHASE-2-COMPLETE.md)

## 📄 License

Private - All rights reserved
