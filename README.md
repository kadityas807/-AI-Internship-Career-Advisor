# AI Career Mentor 🎓🤖

An AI-powered career guidance platform that tracks your skills, documents projects, manages applications, and provides personalized mentoring with **persistent memory**.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                │
│  ┌──────────┐ ┌──────────┐ ┌────────────────────┐   │
│  │Dashboard │ │ Mentor   │ │  Skills/Projects/  │   │
│  │          │ │  Chat    │ │  Applications      │   │
│  └────┬─────┘ └────┬─────┘ └────────┬───────────┘   │
│       │            │                │               │
│       └────────────┴────────────────┘               │
│                    │                                │
│            Firebase Auth + Firestore                │
└────────────────────┬────────────────────────────────┘
                     │ HTTP API
┌────────────────────┴────────────────────────────────┐
│               Backend (Express.js)                  │
│  ┌──────────────┐ ┌────────────┐ ┌──────────────┐   │
│  │ /api/mentor  │ │/api/generate│ │/api/upload   │   │
│  └──────┬───────┘ └──────┬─────┘ └──────┬───────┘   │
│         └────────────────┴──────────────┘           │
│                     │                               │
│              Hindsight AI API                       │
│         (Memory + LLM Inference)                    │
└─────────────────────────────────────────────────────┘
```

## Features

| Feature | Description |
|---------|-------------|
| 🧠 **AI Mentor Chat** | Personalized career advice with persistent memory |
| 🎤 **Voice Input** | Speak to your mentor using Web Speech API |
| 📊 **Dashboard** | Peer benchmarking and progress overview |
| 📋 **Skill Tracking** | Track technical and soft skills with proficiency levels |
| 🏗️ **Project Registry** | Document projects with tech stack and outcomes |
| 📝 **Application Tracker** | Log jobs, track statuses, get rejection analysis |
| 🗺️ **Career Roadmap** | AI-generated time-to-ready plan |
| 🔍 **Career Fingerprint** | Unique candidate identity analysis |
| 🎮 **Demo Mode** | Try the full app without signing up |

## Getting Started

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Add your Hindsight API keys
npm run dev            # Starts on port 5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev            # Starts on port 3000
```

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Express.js, TypeScript, LangChain
- **Database**: Firebase Firestore
- **Auth**: Firebase Auth (Google + Anonymous for demo)
- **AI**: Hindsight AI (memory-augmented LLM inference)

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `HINDSIGHT_API_KEY` | Hindsight API key |
| `HINDSIGHT_BANK_ID` | Memory bank ID |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase configuration |
| `NEXT_PUBLIC_BACKEND_URL` | Backend URL (default: http://localhost:5000) |
| `HINDSIGHT_API_KEY` | Hindsight API key |

---

Built with ❤️ for hackathon
