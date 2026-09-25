# EasyDentalLab - Rebuilt with Vite + React + TypeScript

This is the properly structured rebuild of EasyDentalLab.

## What Changed

**Old version** (`renderer/index.html`):
- Single 6000+ line HTML file
- No TypeScript
- No build tooling
- All components inline

**New version** (this folder):
- Proper component structure
- TypeScript for type safety
- Vite for fast builds and HMR
- Separated concerns (types, utils, hooks, components)

## Migration Path

Existing users on v2.3.60 can auto-update seamlessly:
- localStorage data persists (same format)
- Backup folder config persists
- Auto-update works (same Electron app ID)

## Project Structure

```
src/
├── types/          # TypeScript interfaces (Invoice, Client, etc.)
├── utils/          # Utility functions (PDF, CSV, formatting)
├── hooks/          # Custom React hooks (useData, useBackup)
├── constants/      # App constants (NAV, embedded data)
├── components/
│   ├── ui/         # Reusable UI components (Modal, Input, etc.)
│   ├── forms/      # Form components (InvoiceForm, ClientForm)
│   └── pages/      # Page components (Dashboard, Settings)
└── App.tsx         # Main app component
```

## Development

```bash
npm run dev     # Start dev server with HMR
npm run build   # Build for production
npm run preview # Preview production build
```

## Building for Electron

Vite builds to `dist/index.html`, which Electron loads via `main.js`.
