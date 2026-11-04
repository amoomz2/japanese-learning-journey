// Exercises generated from the book's dialogue lines and vocabulary lists.
import { kanaOnly, plain, rubyWords } from './ruby.jsx'

function shuffle(items) {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const unique = (items, key = (x) => x) => items.filter((x, i, arr) => arr.findIndex((y) => key(y) === key(x)) === i)

// Fill in the blank: hide a vocabulary word that appears in a line; choose it from four words.
export function fillBlanks(dialogue, lessonVocab, count = 4) {
  const vocab = unique(
    lessonVocab
      .map(([jp, romaji, en]) => ({ word: plain(jp).replace(/[()（）〜]/g, '').replace(/な$/, ''), jp, romaji, en }))
      .filter((v) => v.word.length >= 2),
    (v) => v.word,
  )
  const items = []
  for (const [speaker, jp, romaji, en] of dialogue.lines) {
    const text = plain(jp)
    const hit = vocab.filter((v) => text.includes(v.word)).sort((a, b) => b.word.length - a.word.length)[0]
    if (!hit) continue
    const distractors = shuffle(vocab.filter((v) => v.word !== hit.word && !text.includes(v.word))).slice(0, 3)
    if (distractors.length < 3) continue
    items.push({
      speaker,
      before: text.slice(0, text.indexOf(hit.word)),
      after: text.slice(text.indexOf(hit.word) + hit.word.length),
      answer: hit.word,
      hint: `${hit.romaji}: ${hit.en}`,
      en,
      romaji,
      options: shuffle([hit.word, ...distractors.map((d) => d.word)]),
    })
  }
  return shuffle(items).slice(0, count)
}

// Kanji reading: "how do you read 今日?" with readings from the same lesson as distractors.
export function kanjiReadings(dialogue, lesson, count = 5) {
  const own = unique(dialogue.lines.flatMap((l) => rubyWords(l[1])), (w) => w.word)
  const pool = unique(
    lesson.dialogues.flatMap((d) => [...d.lines.map((l) => l[1]), ...d.vocab.map((v) => v[0])]).flatMap(rubyWords),
    (w) => w.reading,
  )
  return shuffle(own)
    .slice(0, count)
    .map((w) => ({
      word: w.word,
      answer: w.reading,
      options: shuffle([w.reading, ...shuffle(pool.filter((p) => p.reading !== w.reading)).slice(0, 3).map((p) => p.reading)]),
    }))
    .filter((q) => q.options.length >= 2)
}

// Characters a reader actually reads (kanji/kana/punctuation), for reading speed.
export function readingLength(dialogue) {
  return dialogue.lines.reduce((n, l) => n + plain(l[1]).replace(/\s/g, '').length, 0)
}

export { kanaOnly }
