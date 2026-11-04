// Text comparison for dictation and speech recognition: forgiving about script, spacing and punctuation.
import { kanaOnly, plain } from '../reading/ruby.jsx'

const toHiragana = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
const stripJa = (s) => toHiragana(s).replace(/[\s、。！？!?,.・…「」『』（）()〜~－]/g, '')
const stripRomaji = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '')

function levenshtein(a, b) {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j]
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return dp[b.length]
}

export function similarity(a, b) {
  if (!a && !b) return 1
  return 1 - levenshtein(a, b) / Math.max(a.length, b.length)
}

// Compare learner text (kana, kanji or romaji) with a textbook line. Returns a 0–100 score.
export function compareToLine(input, line) {
  const [, jp, romaji] = line
  const asRomaji = /^[\sa-zA-Z'’.,!?-]+$/.test(input)
  if (asRomaji) return Math.round(similarity(stripRomaji(input), stripRomaji(romaji)) * 100)
  const byKana = similarity(stripJa(input), stripJa(kanaOnly(jp)))
  const byKanji = similarity(stripJa(input), stripJa(plain(jp)))
  return Math.round(Math.max(byKana, byKanji) * 100)
}

export const lineKana = (line) => kanaOnly(line[1])
