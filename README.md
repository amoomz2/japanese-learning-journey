# Japanese Learning Journey 🌸

A personal website for learning Japanese, built with Vite and React.

**Live site:** https://amoomz2.github.io/japanese-learning-journey/ (deployed automatically from `main` by GitHub Actions).

## Features

- **Kana charts**: hiragana and katakana (basic + dakuten/handakuten) with tap-to-hear pronunciation.
- **Vocabulary**: 77 beginner words in 8 topics (greetings, numbers, family, food, colours, time, verbs, adjectives) with kanji, kana, romaji, meaning and audio.
- **Flashcards**: kana or vocabulary decks; flip cards and mark them "I knew it" or "Still learning" (keyboard: Space, ← / →).
- **Quizzes**: 10-question multiple choice, kana → romaji and romaji → kana, with a review list of mistakes.
- **Progress tracking**: daily streak, accuracy, kana and words learned, 4-week activity calendar, weakest characters.
- **Study log**: journal entries with notes, minutes studied and mood; edit and delete supported.

Progress and journal entries are saved in the browser's `localStorage`.

## Install on iPhone & offline use

The site is a Progressive Web App (via `vite-plugin-pwa`).

- Open the live site in **Safari**, tap **Share → Add to Home Screen**. It opens full screen like an app.
- On first visit the service worker caches the whole app (all lessons are in the bundle) plus the Japanese font, so kana, vocabulary, flashcards, quizzes, progress and the study log all work in Airplane Mode.
- Progress is stored on the device (`localStorage`); there is no server, so nothing needs syncing.
- **Progress → Offline & storage** shows connection and offline status, storage use, and lets you protect data from cleanup or remove the offline copy.
- When a new version is deployed, a banner offers **Update now**.
- Needs internet: the very first visit, and fetching updates. Pronunciation offline needs a Japanese voice installed on the device.

Icons are generated from `public/icon.svg` with `npm run icons`.

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

The build output in `dist/` uses relative paths and hash routing, so it can be hosted on GitHub Pages.

## Project structure

```
src/
  App.jsx            Navigation and hash routing
  main.jsx           Entry point
  styles.css         Theme (light/dark) and all styles
  data/kana.js       Hiragana/katakana tables
  data/vocab.js      Beginner vocabulary by category
  state/progress.jsx Progress, streak and journal state (localStorage)
  utils/speech.js    Pronunciation via the Web Speech API
  pages/             Home, KanaChart, Vocabulary, Practice, Progress, Journal
```
