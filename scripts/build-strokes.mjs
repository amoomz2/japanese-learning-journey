// Builds src/data/strokes.json from KanjiVG (https://kanjivg.tagaini.net), pinned to one commit.
// KanjiVG © Ulrich Apel, CC BY-SA 3.0. Only the stroke path data is extracted; the SVG
// files are read as text and never executed. Run: node scripts/build-strokes.mjs
import { writeFileSync } from 'node:fs'
import { WRITING_CHARS } from '../src/data/writingChars.js'

const COMMIT = '70a0b7ae0c18ceb5cb358274b029cce0234a43bc'
const BASE = `https://raw.githubusercontent.com/KanjiVG/kanjivg/${COMMIT}/kanji/`

const fileName = (ch) => ch.codePointAt(0).toString(16).padStart(5, '0') + '.svg'

async function strokesFor(ch) {
  const res = await fetch(BASE + fileName(ch))
  if (!res.ok) throw new Error(`${ch}: HTTP ${res.status}`)
  const svg = await res.text()
  const strokes = []
  // <path id="kvg:03042-s1" d="..."/> — the -sN suffix is the stroke number.
  for (const m of svg.matchAll(/<path\s+id="kvg:[0-9a-f]+-s(\d+)"[^>]*?\sd="([^"]+)"/g)) {
    const d = m[2]
    if (!/^[MmCcSsLlZzHhVv0-9.,\s-]+$/.test(d)) throw new Error(`${ch}: unexpected path data`)
    strokes.push([Number(m[1]), d])
  }
  if (!strokes.length) throw new Error(`${ch}: no strokes found`)
  strokes.sort((a, b) => a[0] - b[0])
  strokes.forEach(([n], i) => {
    if (n !== i + 1) throw new Error(`${ch}: stroke numbers are not 1..N`)
  })
  return strokes.map(([, d]) => d)
}

const out = { source: `KanjiVG ${COMMIT}`, license: 'CC BY-SA 3.0, © Ulrich Apel, https://kanjivg.tagaini.net', strokes: {} }
for (const ch of WRITING_CHARS) {
  out.strokes[ch] = await strokesFor(ch)
  process.stdout.write(ch)
}
writeFileSync(new URL('../src/data/strokes.json', import.meta.url), JSON.stringify(out))
console.log(`\nWrote ${Object.keys(out.strokes).length} characters`)
