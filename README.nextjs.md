# UPSC Tracker Pro - Next.js Application

A modern, Progressive Web App (PWA) for tracking your 75-day UPSC preparation journey with AI-powered daily insights.

## Features

- 📅 **75-Day Structured Plan**: Comprehensive day-by-day syllabus tracking
- ✅ **Progress Tracking**: Mark tasks complete and track your progress
- 🔥 **Streak Counter**: Stay motivated with daily streak tracking
- 🤖 **AI-Powered Insights**: Get daily motivational quotes from Gemini AI
- 📱 **PWA Support**: Install as a native app on any device
- 🔔 **Smart Notifications**: Set daily reminders for your study sessions
- 💾 **Local Storage**: All data stored locally in your browser
- 🔄 **Multi-Device Sync**: Session management across web and mobile

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **AI**: Google Gemini AI
- **PWA**: Custom Service Worker

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Gemini API key (get one from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. Clone the repository and navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main application page
│   ├── globals.css         # Global styles
│   └── register-sw.tsx     # Service Worker registration
├── components/
│   ├── AIExpert.tsx        # AI-powered motivation component
│   ├── DayTracker.tsx      # Daily task tracker
│   ├── Login.tsx           # User authentication
│   └── Stats.tsx           # Progress statistics
├── services/
│   ├── gemini.ts           # Gemini AI integration
│   ├── notification.ts     # Browser notifications
│   └── storage.ts          # Local storage management
├── public/
│   ├── manifest.json       # PWA manifest
│   └── sw.js              # Service Worker
├── constants.tsx           # 75-day plan data
├── types.ts               # TypeScript type definitions
└── next.config.mjs        # Next.js configuration
```

## Features Explanation

### Day Tracking
- View any day from the 75-day plan
- See tasks organized by phase
- Track completion status
- View pending tasks from previous days

### Statistics Dashboard
- Overall completion percentage
- Current day and date
- Streak counter with fire icon
- Target completion date

### AI Expert
- Daily motivational quotes powered by Gemini AI
- Context-aware based on your current day's topics
- Refresh for new inspiration

### PWA Features
- Install prompt for mobile and desktop
- Offline support via Service Worker
- Native app experience
- Push notifications support

## Environment Variables

- `NEXT_PUBLIC_GEMINI_API_KEY`: Your Gemini AI API key (required for AI features)
- `GEMINI_API_KEY`: Alternative key name for server-side usage

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- All modern browsers with PWA support

## Contributing

This is a personal project, but feel free to fork and customize for your own use!

## License

MIT License - feel free to use this for your UPSC preparation journey!

## Acknowledgments

- Built with Next.js and React
- AI powered by Google Gemini
- Icons from Heroicons
- Avatar generation by DiceBear
