import { useState } from 'react'
import { VOCAB_CATEGORIES } from '../data/vocab.js'
import { isLearned, useProgress } from '../state/progress.jsx'
import { canSpeak, speak } from '../utils/speech.js'

export default function Vocabulary({ go }) {
  const [category, setCategory] = useState('all')
  const [showRomaji, setShowRomaji] = useState(true)
  const { data } = useProgress()

  const categories = VOCAB_CATEGORIES.filter((c) => category === 'all' || c.key === category)

  return (
    <section>
      <header className="page-header">
        <h1>単語 Vocabulary</h1>
        <p className="muted">
          {canSpeak ? 'Tap a word to hear it.' : 'Your browser does not support audio playback.'} Words you've
          learned in Practice are marked ✓.
        </p>
      </header>

      <div className="toolbar">
        <div className="chip-list left">
          <button className={`chip ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>
            All
          </button>
          {VOCAB_CATEGORIES.map((c) => (
            <button key={c.key} className={`chip ${category === c.key ? 'active' : ''}`} onClick={() => setCategory(c.key)}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>
        <label className="toggle">
          <input type="checkbox" checked={showRomaji} onChange={(e) => setShowRomaji(e.target.checked)} />
          Show romaji
        </label>
      </div>

      {categories.map((c) => {
        const learned = c.words.filter((w) => isLearned(data.kana[w.id])).length
        return (
          <div key={c.key} className="card">
            <div className="card-head">
              <h2>
                {c.icon} {c.label}
              </h2>
              <span className="muted small">
                {learned}/{c.words.length} learned
              </span>
            </div>
            <div className="vocab-grid">
              {c.words.map((w) => (
                <button
                  key={w.id}
                  className={`vocab-card ${isLearned(data.kana[w.id]) ? 'learned' : ''}`}
                  onClick={() => speak(w.kana)}
                  aria-label={`${w.kanji || w.kana}, ${w.romaji}, ${w.meaning}`}
                >
                  <span className={`vocab-jp ${(w.kanji || w.kana).length > 5 ? 'long' : ''}`}>{w.kanji || w.kana}</span>
                  {w.kanji && <span className="vocab-kana">{w.kana}</span>}
                  {showRomaji && <span className="muted small">{w.romaji}</span>}
                  <span className="vocab-meaning">{w.meaning}</span>
                </button>
              ))}
            </div>
          </div>
        )
      })}

      <div className="center">
        <button className="btn primary" onClick={() => go('practice?deck=vocab')}>
          Practise vocabulary
        </button>
      </div>
    </section>
  )
}
