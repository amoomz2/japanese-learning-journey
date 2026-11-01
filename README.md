# Japanese Learning Journey 🌸

A personal website for learning Japanese, built with Vite and React.

**Live site:** https://amoomz2.github.io/japanese-learning-journey/ (deployed automatically from `main` by GitHub Actions).

## Features

- **Kana charts**: hiragana and katakana (basic + dakuten/handakuten) with tap-to-hear pronunciation.
- **Flashcards**: flip cards and mark them "I knew it" or "Still learning" (keyboard: Space, ← / →).
- **Quizzes**: 10-question multiple choice, kana → romaji and romaji → kana, with a review list of mistakes.
- **Progress tracking**: daily streak, accuracy, kana learned, 4-week activity calendar, weakest characters.
- **Study log**: journal entries with notes, minutes studied and mood; edit and delete supported.

Progress and journal entries are saved in the browser's `localStorage`.

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
  state/progress.jsx Progress, streak and journal state (localStorage)
  utils/speech.js    Pronunciation via the Web Speech API
  pages/             Home, KanaChart, Practice, Progress, Journal
```
