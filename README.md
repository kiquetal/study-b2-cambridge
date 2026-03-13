# B2 Cambridge Study Tracker

A minimal Astro-based study tracking application for B2 Cambridge exam preparation with spaced repetition and browser notifications.

## Features

- **Study Session Logging**: Track date, duration, skill area (Reading/Writing/Listening/Speaking), topic, source, notes, exercise count, and confidence level
- **Spaced Repetition**: Automatic review scheduling with intervals: 1, 3, 7, 14, 30 days
- **Browser Notifications**: Get notified when topics are due for review
- **Statistics Dashboard**: View total sessions, total hours, and current study streak
- **SQLite Database**: All data persists in a local SQLite database file (`study.db`)

## Getting Started

```sh
npm install
npm run dev
```

The app will be available at `http://localhost:4321/` (or next available port).

## How to Use

1. **Log a Study Session**: Fill out the form on the left with your study details
2. **Review Topics**: When topics are due for review, you'll see a notification and they'll appear in the "Due for Review" section
3. **Mark as Reviewed**: Click "Mark Reviewed" to update the next review date
4. **Track Progress**: Monitor your stats and streak in the dashboard

## Spaced Repetition Schedule

- First review: 1 day after study
- Second review: 3 days after first review
- Third review: 7 days after second review
- Fourth review: 14 days after third review
- Fifth+ review: 30 days after previous review

## Browser Notifications

On first visit, the app will request notification permissions. Grant permission to receive review reminders when you open the app.

## Data Storage

All study session data is stored in a local SQLite database file (`study.db`) in the project root. This ensures:
- Data persists across browser sessions
- No data loss when clearing browser cache
- Easy backup (just copy the `study.db` file)
- Portable data that can be moved between machines

## Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |

## Tech Stack

- **Astro**: Static site framework with SSR
- **React**: UI components
- **Nanostores**: Lightweight state management
- **SQLite (better-sqlite3)**: Local database for persistent storage
- **TypeScript**: Type safety
