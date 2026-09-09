# Reelio

Movie & TV-series discovery app. React + Vite, powered by TMDB.

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and add your TMDB API key:
   ```
   VITE_TMDB_API_KEY=your_key_here
   ```
3. `npm run dev`

## Project structure
```
src/
├── components/   # Reusable UI pieces (cards, navbar, search, loader)
├── pages/        # Route-level pages (Home, MovieDetails, TVDetails, SearchResults)
├── layouts/       # Page shells (MainLayout)
├── services/     # TMDB API client
├── hooks/        # Reusable React hooks
├── utils/        # Formatting helpers
├── styles/       # Global CSS (dark theme)
├── App.jsx
└── main.jsx
```

## Notes
- This is the initial foundation only: discovery home page, movie details, TV details, basic search.
- Swipe discovery and a timeline/feed are intentionally not built yet — this structure is meant to make adding them cleanly later straightforward.
