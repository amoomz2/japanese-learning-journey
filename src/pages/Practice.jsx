import { useEffect, useMemo, useState } from 'react'
import { kanaList } from '../data/kana.js'
import { VOCAB_CATEGORIES, vocabList } from '../data/vocab.js'
import { useProgress } from '../state/progress.jsx'
import { canSpeak, speak } from '../utils/speech.js'

const QUIZ_LENGTH = 10

function shuffle(items) {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Normalise kana and vocabulary into one card shape:
// front/frontHint = Japanese side, back/backHint = answer side, say = text to pronounce.
function kanaCard(k) {
  return { id: k.id, front: k.char, back: k.romaji, say: k.char, kind: 'kana' }
}

function vocabCard(w) {
  return {
    id: w.id,
    front: w.kanji || w.kana,
    frontHint: w.kanji ? w.kana : null,
    back: w.meaning,
    backHint: w.romaji,
    say: w.kana,
    kind: 'vocab',
  }
}

function usePool(deck, includeDakuten, vocabCategory) {
  return useMemo(() => {
    if (deck === 'vocab') return vocabList(vocabCategory).map(vocabCard)
    const scripts = deck === 'both' ? ['hiragana', 'katakana'] : [deck]
    const groups = includeDakuten ? ['basic', 'dakuten'] : ['basic']
    return scripts.flatMap((s) => kanaList(s, groups)).map(kanaCard)
  }, [deck, includeDakuten, vocabCategory])
}

function initialDeck() {
  const params = new URLSearchParams(window.location.hash.split('?')[1])
  return params.get('deck') === 'vocab' ? 'vocab' : 'hiragana'
}

export default function Practice() {
  const [mode, setMode] = useState('flashcards')
  const [deck, setDeck] = useState(initialDeck)
  const [includeDakuten, setIncludeDakuten] = useState(false)
  const [vocabCategory, setVocabCategory] = useState('all')

  const pool = usePool(deck, includeDakuten, vocabCategory)
  const settingsKey = `${deck}-${includeDakuten}-${vocabCategory}`

  return (
    <section>
      <header className="page-header">
        <h1>練習 Practice</h1>
        <p className="muted">Every answer updates your progress. Learned items turn green on the Kana and Vocabulary pages.</p>
      </header>

      <div className="toolbar">
        <div className="segmented" role="tablist">
          {[
            ['flashcards', 'Flashcards'],
            ['quiz', 'Quiz'],
          ].map(([key, label]) => (
            <button key={key} role="tab" aria-selected={mode === key} className={mode === key ? 'active' : ''} onClick={() => setMode(key)}>
              {label}
            </button>
          ))}
        </div>
        <select value={deck} onChange={(e) => setDeck(e.target.value)} aria-label="Deck">
          <option value="hiragana">Hiragana</option>
          <option value="katakana">Katakana</option>
          <option value="both">Hiragana + Katakana</option>
          <option value="vocab">Vocabulary</option>
        </select>
        {deck === 'vocab' ? (
          <select value={vocabCategory} onChange={(e) => setVocabCategory(e.target.value)} aria-label="Vocabulary category">
            <option value="all">All categories</option>
            {VOCAB_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        ) : (
          <label className="toggle">
            <input type="checkbox" checked={includeDakuten} onChange={(e) => setIncludeDakuten(e.target.checked)} />
            Include dakuten (が, ぱ…)
          </label>
        )}
      </div>

      {mode === 'flashcards' ? <Flashcards key={settingsKey} pool={pool} /> : <Quiz key={settingsKey} pool={pool} />}
    </section>
  )
}

function CardFront({ card, big = true }) {
  return (
    <>
      <span className={`kana-char ${big ? (card.kind === 'vocab' ? 'word' : 'big') : ''}`}>{card.front}</span>
      {card.frontHint && <span className="muted">{card.frontHint}</span>}
    </>
  )
}

function Flashcards({ pool }) {
  const { recordAnswer } = useProgress()
  const [deck, setDeck] = useState(() => shuffle(pool))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const card = deck[index]
  const done = index >= deck.length

  const answer = (knewIt) => {
    recordAnswer(card.id, knewIt)
    setFlipped(false)
    setIndex((i) => i + 1)
  }

  useEffect(() => {
    const onKey = (e) => {
      if (done || e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return
      if (e.key === ' ') {
        e.preventDefault()
        setFlipped((f) => !f)
      } else if (flipped && e.key === 'ArrowRight') answer(true)
      else if (flipped && e.key === 'ArrowLeft') answer(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (done) {
    return (
      <div className="card center">
        <h2>Deck complete 🎉</h2>
        <p className="muted">You went through all {deck.length} cards.</p>
        <button className="btn primary" onClick={() => { setDeck(shuffle(pool)); setIndex(0) }}>
          Shuffle and start again
        </button>
      </div>
    )
  }

  return (
    <div className="card center">
      <p className="muted small">
        Card {index + 1} of {deck.length}
      </p>
      <button className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped((f) => !f)} aria-label="Flip card">
        <CardFront card={card} />
        <span className="flashcard-back">{flipped ? card.back : 'Tap or press Space to reveal'}</span>
        {flipped && card.backHint && <span className="muted">{card.backHint}</span>}
      </button>
      <div className="row">
        {canSpeak && (
          <button className="btn" onClick={() => speak(card.say)}>
            🔊 Listen
          </button>
        )}
      </div>
      {flipped && (
        <div className="row">
          <button className="btn danger" onClick={() => answer(false)}>
            ← Still learning
          </button>
          <button className="btn success" onClick={() => answer(true)}>
            I knew it →
          </button>
        </div>
      )}
    </div>
  )
}

function makeQuestions(pool) {
  return shuffle(pool)
    .slice(0, QUIZ_LENGTH)
    .map((item) => {
      // Alternate direction: Japanese → answer, or answer → Japanese.
      const direction = Math.random() < 0.5 ? 'toBack' : 'toFront'
      const field = direction === 'toBack' ? 'back' : 'front'
      // Avoid distractors that share the same answer text (e.g. じ / ぢ are both "ji").
      const distractors = shuffle(pool.filter((k) => k[field] !== item[field]))
        .filter((k, i, arr) => arr.findIndex((o) => o[field] === k[field]) === i)
        .slice(0, 3)
      return { item, direction, field, options: shuffle([item, ...distractors]) }
    })
}

function questionPrompt(q) {
  if (q.item.kind === 'vocab') return q.direction === 'toBack' ? 'What does this mean?' : 'How do you say'
  return q.direction === 'toBack' ? 'What is the reading of' : 'Which kana is'
}

function Quiz({ pool }) {
  const { recordAnswer, recordQuiz } = useProgress()
  const [questions, setQuestions] = useState(() => makeQuestions(pool))
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [missed, setMissed] = useState([])

  const q = questions[index]
  const finished = index >= questions.length

  useEffect(() => {
    if (finished) recordQuiz({ score, total: questions.length })
    // Only record once, when the quiz finishes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  const choose = (option) => {
    if (picked) return
    const correct = option[q.field] === q.item[q.field]
    setPicked(option)
    recordAnswer(q.item.id, correct)
    if (correct) setScore((s) => s + 1)
    else setMissed((m) => [...m, q.item])
  }

  const next = () => {
    setPicked(null)
    setIndex((i) => i + 1)
  }

  const restart = () => {
    setQuestions(makeQuestions(pool))
    setIndex(0)
    setPicked(null)
    setScore(0)
    setMissed([])
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="card center">
        <h2>
          {score} / {questions.length} ({pct}%)
        </h2>
        <p className="muted">{pct === 100 ? '完璧! Perfect score!' : pct >= 70 ? 'Great work, keep going!' : 'Keep practising, you will get there.'}</p>
        {missed.length > 0 && (
          <>
            <h3>Review these</h3>
            <div className="chip-list">
              {missed.map((k) => (
                <button key={k.id} className="chip" onClick={() => speak(k.say)}>
                  {k.front} <span className="muted">{k.back}</span>
                </button>
              ))}
            </div>
          </>
        )}
        <button className="btn primary" onClick={restart}>
          New quiz
        </button>
      </div>
    )
  }

  return (
    <div className="card center">
      <p className="muted small">
        Question {index + 1} of {questions.length} · Score {score}
      </p>
      <p className="prompt">{questionPrompt(q)}</p>
      {q.direction === 'toBack' ? (
        <div className="quiz-front">
          <CardFront card={q.item} />
        </div>
      ) : (
        <div className={`kana-char ${q.item.kind === 'vocab' ? 'word' : 'big'}`}>{q.item.back}</div>
      )}
      <div className={`options ${q.item.kind === 'vocab' ? 'text' : ''}`}>
        {q.options.map((opt) => {
          const isAnswer = opt[q.field] === q.item[q.field]
          const state = picked ? (isAnswer ? 'correct' : picked.id === opt.id ? 'wrong' : '') : ''
          return (
            <button key={opt.id} className={`option ${state}`} onClick={() => choose(opt)} disabled={!!picked}>
              {opt[q.field]}
              {q.field === 'front' && opt.frontHint && <span className="option-hint">{opt.frontHint}</span>}
            </button>
          )
        })}
      </div>
      {picked && q.item.kind === 'vocab' && (
        <p className="muted">
          {q.item.front} {q.item.frontHint && `(${q.item.frontHint})`} · {q.item.backHint} · {q.item.back}
        </p>
      )}
      {picked && (
        <button className="btn primary" onClick={next} autoFocus>
          {index + 1 === questions.length ? 'See results' : 'Next →'}
        </button>
      )}
    </div>
  )
}
