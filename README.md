# Japanese Learning Journey 🌸

A personal website for learning Japanese, built with Vite and React.

## Features

- **Kana charts**: hiragana and katakana (basic + dakuten/handakuten) with tap-to-hear pronunciation.
- **Vocabulary**: 77 beginner words in 8 topics (greetings, numbers, family, food, colours, time, verbs, adjectives) with kanji, kana, romaji, meaning and audio.
- **Flashcards**: kana or vocabulary decks; flip cards and mark them "I knew it" or "Still learning" (keyboard: Space, ← / →).
- **Quizzes**: 10-question multiple choice, kana → romaji and romaji → kana, with a review list of mistakes.
- **Progress tracking**: daily streak, accuracy, kana and words learned, 4-week activity calendar, weakest characters.
- **Study log**: journal entries with notes, minutes studied and mood; edit and delete supported.
- **Writing practice (書き方)**: 176 characters (71 hiragana, 71 katakana, 34 beginner kanji) in 34 lessons. Learn mode animates the stroke order (start dot, direction arrow, numbers, step-by-step); Practice mode lets you trace on a canvas with finger, stylus or mouse, with stroke-by-stroke hints, undo and clear; Test mode shows the romaji/meaning and checks what you write from memory. Each character has romaji, an English and an Arabic pronunciation/meaning note, stroke count and example words with audio.
- **Reading (読む)**: JLPT N5 reading built on *Beginning Japanese for Professionals: Book 1* (Lessons 0–4, 19 dialogues). Furigana, romaji, English and Arabic toggles; reading-speed timing; comprehension (original questions), fill-in-the-blank and kanji-reading exercises generated from the textbook lines; book page references. N4–N1 are listed as "coming later".
- **Listening (聞く)**: native textbook audio for 16 of the 19 Book 1 dialogues (Lesson 0 uses the device voice), with 0.75×/1×/1.25× speed, line replay, transcripts revealed after exercises, comprehension, choose-the-meaning, listen-and-complete and dictation (kana or romaji). Audio can be saved per lesson for offline listening.
- **Speaking (話す)**: shadowing with native audio, recording and replaying yourself (works offline), a speech-recognition check where the browser supports it (needs internet; Safari on iPhone and Chrome), role-plays of the textbook dialogues, the textbook's "Act in Japanese" situations, and two short supplementary (original) phrase sets: directions and travel.
- **Four skills (技能)**: dashboard with progress per skill, lessons completed, quiz results, weak areas, daily goals and streaks; JLPT N5 now, N4–N1 marked "coming later".
- **Backup**: save all progress and the study log to a `.json` file (share sheet on iPhone, download elsewhere) and restore it on any device. Restores are validated and confirmed first.

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

## Writing practice: data and checking

- **Stroke-order data** comes from [KanjiVG](https://kanjivg.tagaini.net) © Ulrich Apel, licensed CC BY-SA 3.0, pinned to commit `70a0b7a`. `npm run strokes` (scripts/build-strokes.mjs) regenerates `src/data/strokes.json`; the data is bundled, so it works offline.
- **How writing is checked** (src/writing/evaluate.js): this is a stroke-matching check, not full handwriting recognition. Your drawing is resized onto the reference, then each stroke is resampled and compared with the expected KanjiVG stroke in order: shape and position, direction, order (a stroke that fits a different stroke better) and stroke count. 65% or more passes; a wrong stroke count or a reversed stroke can't pass. It runs on the device, so it works offline. It can't judge neatness or stroke endings (tome/hane/harai), and very similar characters written with the right strokes may score close to each other.

## Textbook source

Course content in `src/data/book1.js` comes from **Emiko Konomi, _Beginning Japanese for Professionals: Book 1_ (Portland State University, 2018)**, https://pdxscholar.library.pdx.edu/pdxopen/6, licensed [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Used non-commercially with attribution. Changes: furigana markup, minor typo fixes in the English, and generated exercises. The Arabic translations and comprehension questions are original to this site and are labelled as such in the app.

### Audio

`public/audio/book1/*.mp3` are the textbook's dialogue recordings (same source and license), trimmed to the dialogue, converted to mono 22 kHz 48 kbps MP3 (1.4 MB total). `src/data/audioIndex.json` holds each file's duration and, where it could be determined reliably, each line's start/end time. Line timings come from automatic pause detection checked two ways; when the two disagree, only whole-dialogue playback uses the native recording and single lines use the device voice (the app says so). Timings were not checked by ear.

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
