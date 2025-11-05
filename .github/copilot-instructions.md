# Casa Fácil - AI Agent Instructions

## Project Overview
Casa Fácil is a Next.js real estate platform with AI-powered property search and chat assistance. The app uses Firebase for data storage, Groq for AI chat capabilities, and follows the Next.js 13+ App Router pattern.

## Key Architecture Components

### Frontend Structure
- `src/app/*` - Next.js App Router pages and API routes
- `src/components/*` - Reusable React components
- `src/lib/*` - Core services and utilities
- `src/store/*` - Global state management using Zustand
- `src/ai/*` - AI integration services

### Core Services
- **Firebase Integration** (`src/lib/firebase.ts`): 
  - Handles auth, Firestore DB, and storage
  - Requires proper env vars setup (see Environment section)

- **AI Chat Service** (`src/app/api/chat/route.ts`):
  - Integrates with Groq API for property-aware chat responses
  - Uses context-aware property search
  - Maintains chat history

### State Management
- Uses Zustand for global state (`src/store/useAppStore.ts`)
- Auth state managed through `AuthProvider.tsx`

## Development Workflow

### Environment Setup
Required `.env.local` variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
GROQ_API_KEY=
```

### Development Commands
```bash
npm install    # Install dependencies
npm run dev    # Start development server
npm run build  # Production build
npm run lint   # Run ESLint
```

## Key Patterns and Conventions

### API Routes
- All API routes use Next.js App Router pattern
- Error handling includes detailed logging and user-friendly messages
- Standard response format: `{ success: boolean, data/error: any }`

### AI Integration
- Property-aware chat responses (see `aiPropertySearch.ts`)
- Context building from Firestore data
- Rate limiting and error handling patterns

### Firebase Patterns
- Singleton initialization in `firebase.ts`
- Service-based approach for Firebase operations
- Environment validation on startup