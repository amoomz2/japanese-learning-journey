import { useEffect, useMemo, useRef, useState } from 'react'
import { BOOK, LESSONS, findDialogue } from '../data/book1.js'
import { useProgress } from '../state/progress.jsx'
import { canSpeak, speak } from '../utils/speech.js'
import { Ruby, kanaOnly } from '../reading/ruby.jsx'
import { fillBlanks, kanjiReadings, readingLength } from '../reading/exercises.js'

export const LEVELS = [
  { key: 'N5', label: 'N5 · Beginner', ready: true },
  { key: 'N4', label: 'N4 · Elementary', ready: false },
  { key: 'N3', label: 'N3 · Intermediate', ready: false },
  { key: 'N2', label: 'N2 · Upper intermediate', ready: false },
  { key: 'N1', label: 'N1 · Advanced', ready: false },
]

function initialDialogue() {
  const id = new URLSearchParams(window.location.hash.split('?')[1]).get('d')
  return id && findDialogue(id) ? id : null
}

export default function Reading({ go }) {
  const [dialogueId, setDialogueId] = useState(initialDialogue)
  const open = (id) => {
    setDialogueId(id)
    window.scrollTo(0, 0)
  }

  return (
    <section>
      <header className="page-header">
        <h1>読む Reading</h1>
        <p className="muted">Read real dialogues from your textbook, then check your understanding.</p>
      </header>
      {dialogueId ? <DialogueReader key={dialogueId} dialogue={findDialogue(dialogueId)} onBack={() => setDialogueId(null)} onOpen={open} /> : <ReadingHome onOpen={open} go={go} />}
      <BookCredit />
    </section>
  )
}

export function BookCredit() {
  return (
    <p className="muted small attribution">
      Dialogues, vocabulary and grammar references from{' '}
      <a href={BOOK.url} target="_blank" rel="noopener noreferrer">
        {BOOK.title}
      </a>{' '}
      by {BOOK.author} ({BOOK.publisher}), licensed{' '}
      <a href={BOOK.licenseUrl} target="_blank" rel="noopener noreferrer">
        {BOOK.license}
      </a>
      . Adapted for this site (furigana layout, exercises). Arabic translations and comprehension questions are original to this site.
    </p>
  )
}

function ReadingHome({ onOpen, go }) {
  const { data } = useProgress()
  const [level, setLevel] = useState('N5')
  const current = LEVELS.find((l) => l.key === level)

  return (
    <>
      <div className="chip-list left level-list" role="tablist" aria-label="JLPT level">
        {LEVELS.map((l) => (
          <button key={l.key} role="tab" aria-selected={level === l.key} className={`chip ${level === l.key ? 'active' : ''}`} onClick={() => setLevel(l.key)}>
            {l.label}
            {!l.ready && ' · soon'}
          </button>
        ))}
      </div>

      {!current.ready ? (
        <div className="card">
          <h2>{current.label}: coming later</h2>
          <p className="muted">
            Your textbook (Book 1) covers N5 and a little N4. Content for {current.key} will be added when there is a reliable source for it; nothing here is
            invented and labelled as textbook material.
          </p>
        </div>
      ) : (
        <>
          <div className="card">
            <h2>Warm up</h2>
            <div className="row left">
              <button className="btn" onClick={() => go('kana')}>
                あ Kana reading
              </button>
              <button className="btn" onClick={() => go('vocab')}>
                語 Vocabulary reading
              </button>
              <button className="btn" onClick={() => go('writing')}>
                書 Kanji in Writing
              </button>
            </div>
          </div>
          {LESSONS.map((lesson) => (
            <div key={lesson.id} className="card">
              <div className="card-head">
                <h2>
                  Lesson {lesson.number}: {lesson.title}
                </h2>
                <span className="muted small">Book p.{lesson.page}</span>
              </div>
              <p className="muted small arabic-inline" lang="ar" dir="rtl">
                {lesson.titleAr}
              </p>
              <div className="dialogue-list">
                {lesson.dialogues.map((d) => {
                  const s = data.reading.items[d.id]
                  const best = s ? Object.values(s.best) : []
                  return (
                    <button key={d.id} className="dialogue-item" onClick={() => onOpen(d.id)}>
                      <span>
                        <strong>
                          {s?.reads ? '✓ ' : ''}
                          {d.title}
                        </strong>
                        <span className="muted small"> · p.{d.page}</span>
                      </span>
                      <span className="muted small">{d.scene}</span>
                      {best.length > 0 && <span className="small score-line">Best: {Math.max(...best)}%{s.bestCpm ? ` · ${s.bestCpm} chars/min` : ''}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </>
  )
}

const EXERCISES = [
  ['quiz', 'Comprehension'],
  ['fill', 'Fill in the blank'],
  ['kanji', 'Kanji reading'],
]

function DialogueReader({ dialogue, onBack, onOpen }) {
  const { data, recordReading } = useProgress()
  const [show, setShow] = useState({ furigana: true, romaji: false, en: true, ar: false })
  const [readResult, setReadResult] = useState(null)
  const [exercise, setExercise] = useState('quiz')
  const started = useRef(Date.now())
  const stats = data.reading.items[dialogue.id]
  const { lesson } = dialogue

  const all = LESSONS.flatMap((l) => l.dialogues.map((d) => d.id))
  const nextId = all[all.indexOf(dialogue.id) + 1]

  const finishReading = () => {
    const seconds = Math.max(3, Math.round((Date.now() - started.current) / 1000))
    const chars = readingLength(dialogue)
    const cpm = Math.round((chars / seconds) * 60)
    setReadResult({ seconds, chars, cpm })
    recordReading(dialogue.id, 'read', cpm)
  }

  const toggle = (key) => setShow((s) => ({ ...s, [key]: !s[key] }))

  return (
    <>
      <button className="btn subtle" onClick={onBack}>
        ← All lessons
      </button>
      <div className="card">
        <div className="card-head">
          <h2>
            Lesson {lesson.number} · {dialogue.title}
          </h2>
          <span className="source-tag">Textbook · p.{dialogue.page}</span>
        </div>
        <p className="muted">{dialogue.scene}</p>
        <div className="chip-list left" aria-label="Show">
          {[
            ['furigana', 'Furigana'],
            ['romaji', 'Romaji'],
            ['en', 'English'],
            ['ar', 'العربية'],
          ].map(([k, label]) => (
            <button key={k} className={`chip ${show[k] ? 'active' : ''}`} aria-pressed={show[k]} onClick={() => toggle(k)}>
              {label}
            </button>
          ))}
        </div>

        <ol className="passage">
          {dialogue.lines.map(([speaker, jp, romaji, en, ar], i) => (
            <li key={i}>
              <span className="speaker">{speaker}</span>
              <div>
                <p className="jp-line" lang="ja">
                  <Ruby text={jp} furigana={show.furigana} />
                  {canSpeak && (
                    <button className="btn subtle listen-inline" onClick={() => speak(kanaOnly(jp))} aria-label="Listen (device voice)">
                      🔊
                    </button>
                  )}
                </p>
                {show.romaji && <p className="muted small">{romaji}</p>}
                {show.en && <p className="small">{en}</p>}
                {show.ar && (
                  <p className="small arabic-inline" lang="ar" dir="rtl">
                    {ar}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
        {show.ar && <p className="muted small">Arabic translation: original to this site.</p>}

        {readResult ? (
          <p className="read-result" role="status">
            You read {readResult.chars} characters in {readResult.seconds}s: <strong>{readResult.cpm} characters/min</strong>
            {stats?.bestCpm > readResult.cpm ? ` (best ${stats.bestCpm})` : ' 🎉'}
          </p>
        ) : (
          <div className="row left">
            <button className="btn primary" onClick={finishReading}>
              ✓ I’ve finished reading
            </button>
            <span className="muted small">Times your reading speed. Try with English hidden!</span>
          </div>
        )}
      </div>

      <details className="card">
        <summary>
          <strong>Vocabulary</strong> <span className="muted small">({dialogue.vocab.length} words · textbook)</span>
        </summary>
        <ul className="plain-list vocab-table">
          {dialogue.vocab.map(([jp, romaji, en]) => (
            <li key={jp}>
              <span lang="ja" className="example-word">
                <Ruby text={jp} />
              </span>
              <span className="muted small">{romaji}</span>
              <span>{en}</span>
            </li>
          ))}
        </ul>
      </details>

      <details className="card">
        <summary>
          <strong>Grammar in this dialogue</strong> <span className="muted small">(see your textbook)</span>
        </summary>
        <ul className="plain-list">
          {dialogue.grammar.map(([title, page]) => (
            <li key={title}>
              <span>{title}</span>
              <span className="muted small">p.{page}</span>
            </li>
          ))}
        </ul>
      </details>

      <div className="card">
        <div className="segmented" role="tablist" aria-label="Exercise">
          {EXERCISES.map(([k, label]) => (
            <button key={k} role="tab" aria-selected={exercise === k} className={exercise === k ? 'active' : ''} onClick={() => setExercise(k)}>
              {label}
              {stats?.best?.[k] !== undefined ? ` ${stats.best[k]}%` : ''}
            </button>
          ))}
        </div>
        {exercise === 'quiz' && <Comprehension key={`q-${dialogue.id}`} dialogue={dialogue} onDone={(p) => recordReading(dialogue.id, 'quiz', p)} />}
        {exercise === 'fill' && <FillBlank key={`f-${dialogue.id}`} dialogue={dialogue} onDone={(p) => recordReading(dialogue.id, 'fill', p)} />}
        {exercise === 'kanji' && <KanjiReading key={`k-${dialogue.id}`} dialogue={dialogue} onDone={(p) => recordReading(dialogue.id, 'kanji', p)} />}
      </div>

      {nextId && (
        <div className="center">
          <button className="btn primary" onClick={() => onOpen(nextId)}>
            Next dialogue →
          </button>
        </div>
      )}
    </>
  )
}

// Shared multiple-choice runner: each item is { prompt (node), options, answer, explain (node) }.
function ChoiceRunner({ items, onDone, label, note }) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState(null)
  const [correct, setCorrect] = useState(0)
  const done = index >= items.length

  useEffect(() => {
    if (done && items.length) onDone(Math.round((correct / items.length) * 100))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  if (!items.length) return <p className="muted">No items for this dialogue.</p>
  if (done) {
    return (
      <div className="center exercise-done">
        <h3>
          {correct} / {items.length} correct
        </h3>
        <button
          className="btn"
          onClick={() => {
            setIndex(0)
            setPicked(null)
            setCorrect(0)
          }}
        >
          Try again
        </button>
      </div>
    )
  }

  const item = items[index]
  const choose = (i) => {
    if (picked !== null) return
    setPicked(i)
    if (i === item.answer) setCorrect((c) => c + 1)
  }

  return (
    <div className="exercise">
      <p className="muted small">
        {label} · {index + 1} of {items.length}
        {note && <span className="source-tag original">{note}</span>}
      </p>
      <div className="exercise-prompt">{item.prompt}</div>
      <div className="options text">
        {item.options.map((o, i) => (
          <button key={i} className={`option ${picked !== null ? (i === item.answer ? 'correct' : picked === i ? 'wrong' : '') : ''}`} onClick={() => choose(i)} disabled={picked !== null}>
            {o}
          </button>
        ))}
      </div>
      {picked !== null && (
        <>
          {item.explain && <div className="muted small explain-line">{item.explain}</div>}
          <button
            className="btn primary"
            onClick={() => {
              setPicked(null)
              setIndex((n) => n + 1)
            }}
          >
            {index + 1 === items.length ? 'See score' : 'Next →'}
          </button>
        </>
      )}
    </div>
  )
}

function Comprehension({ dialogue, onDone }) {
  const items = dialogue.questions.map((q) => ({
    prompt: (
      <>
        <p>{q.q}</p>
        <p className="arabic-inline small" lang="ar" dir="rtl">
          {q.qAr}
        </p>
      </>
    ),
    options: q.options,
    answer: q.answer,
  }))
  return <ChoiceRunner items={items} onDone={onDone} label="Comprehension" note="Original questions" />
}

function FillBlank({ dialogue, onDone }) {
  const items = useMemo(
    () =>
      fillBlanks(dialogue, dialogue.lesson.dialogues.flatMap((d) => d.vocab)).map((f) => ({
        prompt: (
          <p className="jp-line" lang="ja">
            <span className="speaker">{f.speaker}</span> {f.before}
            <span className="blank">＿＿</span>
            {f.after}
          </p>
        ),
        options: f.options,
        answer: f.options.indexOf(f.answer),
        explain: (
          <>
            {f.romaji} · {f.en} · <em>{f.hint}</em>
          </>
        ),
      })),
    [dialogue],
  )
  return <ChoiceRunner items={items} onDone={onDone} label="Fill in the blank" note="From the textbook dialogue" />
}

function KanjiReading({ dialogue, onDone }) {
  const items = useMemo(
    () =>
      kanjiReadings(dialogue, dialogue.lesson).map((k) => ({
        prompt: (
          <p>
            How do you read{' '}
            <span lang="ja" className="kanji-prompt">
              {k.word}
            </span>
            ?
          </p>
        ),
        options: k.options,
        answer: k.options.indexOf(k.answer),
      })),
    [dialogue],
  )
  if (!items.length) return <p className="muted">This dialogue has no kanji. Try another dialogue.</p>
  return <ChoiceRunner items={items} onDone={onDone} label="Kanji reading" note="Kanji from the textbook dialogue" />
}
