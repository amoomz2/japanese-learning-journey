import { useState } from 'react'
import { KANA_ROWS } from '../data/kana.js'
import { isLearned, useProgress } from '../state/progress.jsx'
import { canSpeak, speak } from '../utils/speech.js'

export default function KanaChart() {
  const [script, setScript] = useState('hiragana')
  const [showRomaji, setShowRomaji] = useState(true)
  const { data } = useProgress()

  const rows = KANA_ROWS[script]
  const sections = [
    { title: 'Basic (gojūon)', rows: rows.filter((r) => r.group === 'basic') },
    { title: 'Dakuten & handakuten', rows: rows.filter((r) => r.group === 'dakuten') },
  ]

  return (
    <section>
      <header className="page-header">
        <h1>{script === 'hiragana' ? 'ひらがな Hiragana' : 'カタカナ Katakana'}</h1>
        <p className="muted">
          {canSpeak ? 'Tap a character to hear it.' : 'Your browser does not support audio playback.'} Green
          cells are ones you've learned in practice.
        </p>
      </header>

      <div className="toolbar">
        <div className="segmented" role="tablist">
          {['hiragana', 'katakana'].map((s) => (
            <button key={s} role="tab" aria-selected={script === s} className={script === s ? 'active' : ''} onClick={() => setScript(s)}>
              {s === 'hiragana' ? 'Hiragana' : 'Katakana'}
            </button>
          ))}
        </div>
        <label className="toggle">
          <input type="checkbox" checked={showRomaji} onChange={(e) => setShowRomaji(e.target.checked)} />
          Show romaji
        </label>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="card">
          <h2>{section.title}</h2>
          <div className="kana-grid">
            {section.rows.flatMap((row, r) =>
              row.cells.map((cell, c) =>
                cell ? (
                  <button
                    key={`${r}-${c}`}
                    className={`kana-cell ${isLearned(data.kana[cell.id]) ? 'learned' : ''}`}
                    onClick={() => speak(cell.char)}
                    aria-label={`${cell.char}, ${cell.romaji}`}
                  >
                    <span className="kana-char">{cell.char}</span>
                    {showRomaji && <span className="kana-romaji">{cell.romaji}</span>}
                  </button>
                ) : (
                  <div key={`${r}-${c}`} className="kana-cell empty" aria-hidden="true" />
                ),
              ),
            )}
          </div>
        </div>
      ))}
    </section>
  )
}
