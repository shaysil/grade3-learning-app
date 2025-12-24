# Grade 3 Learning App

A small, modular, offline-friendly learning app for Grade 3 kids supporting Hebrew (audio-based), English, and Math.

## Run locally

1. npm install
2. npm run dev

## Features

- Hebrew mode: audio-first multiple choice; uses pre-generated audio URLs
- Smart distractor algorithm that picks similar words
- Math mode: vertical layout for operations
- Parent dashboard protected by a password (default `parent123`) to edit/manage words
- LocalStorage caching for words and progress
- Ready to deploy as a static site (GitHub Pages)

## Next steps (recommended)

- Add real audio files under `public/audio/` and update `public/words_he.json` (Audio must be pre-generated MP3 files the app plays directly.)
- Add avatars in `public/avatars/` and expand unlock logic
- Service worker already added: extend caching rules to include audio files by path patterns
- Add more polish and accessibility features

## Deployment

- Build: `npm run build`
- Deploy `dist` folder to GitHub Pages or any static host

Have fun! 🎉