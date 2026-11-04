// Furigana markup used in the book data: {漢字|かんじ}
const RUBY = /\{([^|}]+)\|([^}]+)\}/g

export function parseRuby(text) {
  const parts = []
  let last = 0
  for (const m of text.matchAll(RUBY)) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index) })
    parts.push({ text: m[1], reading: m[2] })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ text: text.slice(last) })
  return parts
}

// Plain Japanese (kanji kept), and kana-only reading.
export const plain = (text) => text.replace(RUBY, '$1')
export const kanaOnly = (text) => text.replace(RUBY, '$2')

// Every kanji word with its reading, e.g. { word: '今日', reading: 'きょう' }.
export function rubyWords(text) {
  return [...text.matchAll(RUBY)].map((m) => ({ word: m[1], reading: m[2] }))
}

export function Ruby({ text, furigana = true }) {
  return parseRuby(text).map((p, i) =>
    p.reading ? (
      furigana ? (
        <ruby key={i}>
          {p.text}
          <rt>{p.reading}</rt>
        </ruby>
      ) : (
        <span key={i}>{p.text}</span>
      )
    ) : (
      <span key={i}>{p.text}</span>
    ),
  )
}
