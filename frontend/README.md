# Lingo Master Frontend

A modern Next.js frontend for the Lingo Master English learning application with plant-based progression system.

## Features

- 🌱 **Plant Growth System**: Watch your plant grow from seed to fruit tree as you complete levels
- 📚 **8 Learning Groups**: From basic to master level, each with 50 levels (except group 0 with 20)
- 🎯 **6 Question Types**: MCQ, Pronunciation, Fill-in-blank, Synonyms, Antonyms, and Sentence Completion
- 🧪 **Group Jump Tests**: Pass 100% tests to unlock higher groups
- 📊 **Progress Tracking**: Detailed analytics and achievement system
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- ⚡ **Fast Performance**: Built with Next.js 14 and TypeScript

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on http://localhost:8000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Update environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── groups/            # Groups pages
│   │   ├── page.tsx       # Groups list
│   │   └── [groupId]/     # Group detail pages
│   │       ├── page.tsx   # Group overview
│   │       └── levels/    # Level pages
│   │           └── [levelId]/
│   │               └── page.tsx
│   └── progress/          # Progress tracking
│       └── page.tsx
├── components/            # Reusable components
├── services/             # API services
│   └── api.ts           # API client
└── utils/               # Utility functions
```

## Features Overview

### Plant Growth System
- **Seed** 🌱: Start of journey (0-20% complete)
- **Sprout** 🌿: Early progress (20-40% complete)
- **Sapling** 🌳: Halfway there (40-60% complete)
- **Tree** 🌲: Almost there (60-80% complete)
- **Fruit Tree** 🍎: Group complete (80-100% complete)

### Question Types
1. **Multiple Choice**: Select the correct answer from options
2. **Text-to-Speech**: Pronounce words correctly
3. **Fill in the Blank**: Complete sentences with missing words
4. **Synonyms**: Find words with similar meanings
5. **Antonyms**: Find words with opposite meanings
6. **Sentence Completion**: Complete partial sentences

### Progress Tracking
- Daily level completion tracking
- XP system for motivation
- Streak maintenance
- Accuracy statistics
- Study time analytics
- Achievement system

## API Integration

The frontend communicates with the Django backend through RESTful APIs:

- `GET /api/groups/` - Get all groups
- `GET /api/groups/{id}/` - Get specific group
- `GET /api/groups/{id}/levels/` - Get group levels
- `GET /api/groups/{id}/levels/{id}/questions/` - Get level questions
- `POST /api/groups/{id}/levels/{id}/progress/` - Update level progress
- `GET /api/progress/` - Get user progress
- `POST /api/progress/daily/` - Update daily progress

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- Use TypeScript for type safety
- Follow Next.js 14 App Router conventions
- Use Tailwind CSS for styling
- Implement responsive design
- Add proper error handling
- Use Framer Motion for animations

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy automatically

### Other Platforms

1. Build the project: `npm run build`
2. Deploy the `out` folder to your hosting platform
3. Configure environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
