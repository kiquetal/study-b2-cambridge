# NASA-Themed B2 Cambridge Study Tracker

## ✅ Implementation Complete!

Your B2 Cambridge Study Tracker has been successfully updated with the NASA-themed design from the reference files.

### 🎨 Design Features Implemented:

**Color Scheme:**
- Primary/Neon Orange: `#ec5b13`
- Dark Background: `#221610`
- Light Background: `#f8f6f6`

**Typography:**
- Font: Public Sans (Google Fonts)
- Uppercase tracking for headers
- Font weights: 300-900

**UI Components:**
- ✅ NASA-style header with rocket icon
- ✅ Sidebar with folder icon and archive branding
- ✅ Material Symbols icons throughout
- ✅ Dark theme enabled by default
- ✅ Custom scrollbars with primary color
- ✅ Neon glow text effects
- ✅ Border styling with primary/20 opacity
- ✅ Stats cards with dark backgrounds
- ✅ Form inputs with dark theme styling
- ✅ Buttons with primary orange color
- ✅ Alert boxes for due reviews

### 📁 Project Structure:

```
src/
├── layouts/
│   └── Layout.astro          # Main layout with NASA header
├── components/
│   ├── Dashboard.tsx         # Stats & sessions (NASA styled)
│   └── StudyForm.tsx         # Study entry form (NASA styled)
├── lib/
│   ├── db.ts                 # SQLite database layer
│   ├── store.ts              # State management with API calls
│   └── types.ts              # TypeScript interfaces
├── pages/
│   ├── index.astro           # Main page with sidebar layout
│   └── api/
│       ├── sessions.ts       # GET/POST sessions
│       └── sessions/[id].ts  # PATCH individual session
└── styles/
    └── global.css            # Tailwind + custom NASA theme
```

### 🚀 Running the App:

```bash
npm run dev
```

Visit: `http://localhost:4321/`

### 🎯 Features:

1. **SQLite Database** - All data persists in `study.db` file
2. **Spaced Repetition** - 1, 3, 7, 14, 30 day intervals
3. **Browser Notifications** - Alerts for due reviews
4. **NASA Theme** - Dark mode with orange accents
5. **Responsive Layout** - Sidebar + main content area
6. **Stats Dashboard** - Total sessions, hours, streak
7. **Recent Sessions** - Last 5 sessions displayed

### 🎨 Theme Customization:

The theme is configured in `src/styles/global.css` using Tailwind's `@theme` directive:

- `--color-primary`: Main orange color
- `--color-neon-yellow`: Same as primary for consistency
- `--color-background-dark`: Dark background
- `--font-display`: Public Sans font

All components use Tailwind utility classes matching the NASA design system.
