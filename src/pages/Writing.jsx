import { useEffect, useMemo, useState } from 'react'
import { LESSONS, SCRIPTS, charInfo } from '../data/writing.js'
import { isWritingLearned, useProgress } from '../state/progress.jsx'
import { canSpeak, speak } from '../utils/speech.js'
import StrokeOrder from '../writing/StrokeOrder.jsx'
import WritingCanvas from '../writing/WritingCanvas.jsx'
import { checkSingleStroke, evaluate } from '../writing/evaluate.js'
import StrokeSvg from '../writing/StrokeSvg.jsx'

const MODES = [
  ['learn', 'Learn'],
  ['practice', 'Practice'],
  ['test', 'Test'],
]

function shuffle(items) {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Writing() {
  const { data } = useProgress()
  const [script, setScript] = useState('hiragana')
  const [lessonIndex, setLessonIndex] = useState(0)
  const [char, setChar] = useState(LESSONS.hiragana[0].chars[0])
  const [mode, setMode] = useState('learn')

  const lessons = LESSONS[script]
  const lesson = lessons[lessonIndex]
  const info = useMemo(() => charInfo(char), [char])

  const chooseScript = (s) => {
    setScript(s)
    setLessonIndex(0)
    setChar(LESSONS[s][0].chars[0])
  }
  const chooseLesson = (i) => {
    setLessonIndex(i)
    setChar(lessons[i].chars[0])
  }
  const nextChar = () => {
    const i = lesson.chars.indexOf(char)
    if (i < lesson.chars.length - 1) setChar(lesson.chars[i + 1])
    else if (lessonIndex < lessons.length - 1) chooseLesson(lessonIndex + 1)
  }

  return (
    <section>
      <header className="page-header">
        <h1>書き方 Writing Practice</h1>
        <p className="muted">Learn the stroke order, trace it, then write from memory.</p>
      </header>

      <div className="toolbar">
        <div className="segmented" role="tablist" aria-label="Writing system">
          {SCRIPTS.map((s) => (
            <button key={s.key} role="tab" aria-selected={script === s.key} className={script === s.key ? 'active' : ''} onClick={() => chooseScript(s.key)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chip-list left lesson-list">
        {lessons.map((l, i) => (
          <button key={l.id} className={`chip ${i === lessonIndex ? 'active' : ''}`} onClick={() => chooseLesson(i)}>
            {data.writing.lessons.includes(l.id) && '✓ '}
            {l.title}
          </button>
        ))}
      </div>

      <div className="char-strip" role="tablist" aria-label="Characters in this lesson">
        {lesson.chars.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={c === char}
            className={`char-pick ${c === char ? 'active' : ''} ${isWritingLearned(data.writing.chars[c]) ? 'learned' : ''}`}
            onClick={() => setChar(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="toolbar">
        <div className="segmented" role="tablist" aria-label="Mode">
          {MODES.map(([key, label]) => (
            <button key={key} role="tab" aria-selected={mode === key} className={mode === key ? 'active' : ''} onClick={() => setMode(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'learn' && <LearnMode info={info} onPractice={() => setMode('practice')} />}
      {mode === 'practice' && <PracticeMode key={char} info={info} onNext={nextChar} />}
      {mode === 'test' && <TestMode key={lesson.id} lesson={lesson} />}

      <p className="muted small attribution">
        Stroke-order data:{' '}
        <a href="https://kanjivg.tagaini.net" target="_blank" rel="noopener noreferrer">
          KanjiVG
        </a>{' '}
        © Ulrich Apel, CC BY-SA 3.0.
      </p>
    </section>
  )
}

function CharInfo({ info }) {
  return (
    <div className="card char-info">
      <div className="char-head">
        <span className="char-big" lang="ja">
          {info.char}
        </span>
        <div>
          <strong className="char-romaji">{info.romaji}</strong>
          {info.readings && (
            <div className="muted small" lang="ja">
              {info.readings}
            </div>
          )}
          <div className="muted small">
            {info.strokeCount} stroke{info.strokeCount === 1 ? '' : 's'} · {info.script}
          </div>
          {canSpeak && (
            <button className="btn subtle" onClick={() => speak(info.say)}>
              🔊 Listen
            </button>
          )}
        </div>
      </div>
      <p>{info.meaning}</p>
      <p className="arabic" lang="ar" dir="rtl">
        {info.arabic}
      </p>
      {info.examples.length > 0 && (
        <>
          <h3>Examples</h3>
          <ul className="plain-list">
            {info.examples.map(([word, romaji, meaning]) => (
              <li key={word}>
                <span>
                  <span lang="ja" className="example-word">
                    {word}
                  </span>{' '}
                  <span className="muted small">{romaji}</span>
                </span>
                <span className="example-meaning">
                  {meaning}
                  {canSpeak && (
                    <button className="btn subtle" onClick={() => speak(word)} aria-label={`Listen to ${word}`}>
                      🔊
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function LearnMode({ info, onPractice }) {
  return (
    <div className="writing-layout">
      <div className="card center">
        <h2>Stroke order</h2>
        <StrokeOrder strokes={info.strokes} />
        <p className="muted small">The dot shows where each stroke starts; the arrow shows its direction.</p>
      </div>
      <div>
        <CharInfo info={info} />
        <button className="btn primary" onClick={onPractice}>
          Practise writing {info.char} →
        </button>
      </div>
    </div>
  )
}

function useStrokes() {
  const [strokes, setStrokes] = useState([])
  return {
    strokes,
    add: (s) => setStrokes((prev) => [...prev, s]),
    undo: () => setStrokes((prev) => prev.slice(0, -1)),
    clear: () => setStrokes([]),
  }
}

function Result({ result }) {
  if (!result) return null
  return (
    <div className={`write-result ${result.passed ? 'pass' : 'fail'}`} role="status">
      <strong>
        {result.passed ? '✅' : '🔁'} Match: {result.score}%
      </strong>
      <ul>
        {result.messages.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </div>
  )
}

function PracticeMode({ info, onNext }) {
  const { recordWriting } = useProgress()
  const pad = useStrokes()
  const [showGuide, setShowGuide] = useState(true)
  const [stepMode, setStepMode] = useState(true)
  const [strokeTip, setStrokeTip] = useState(null)
  const [result, setResult] = useState(null)

  const next = pad.strokes.length
  const done = next >= info.strokeCount

  const onStroke = (pts) => {
    if (result) return
    if (stepMode && next < info.strokeCount) setStrokeTip({ index: next, ...checkSingleStroke(pts, info.strokes[next]) })
    pad.add(pts)
  }

  const check = () => {
    const r = evaluate(info.strokes, pad.strokes)
    setResult(r)
    recordWriting(info.char, 'practice', r.score, r.passed)
  }

  const retry = () => {
    pad.clear()
    setResult(null)
    setStrokeTip(null)
  }

  const guideStyle = (i) => {
    if (result) return 'faint'
    if (!showGuide) return stepMode && i === next ? 'hint' : 'hidden'
    if (i < next) return 'faint'
    return stepMode && i === next ? 'hint' : 'faint'
  }

  return (
    <div className="writing-layout">
      <div className="card center">
        <div className="card-head">
          <h2>
            Write <span lang="ja">{info.char}</span> <span className="muted small">({info.romaji})</span>
          </h2>
          <span className="muted small">
            {Math.min(next, info.strokeCount)}/{info.strokeCount} strokes
          </span>
        </div>
        <WritingCanvas
          strokes={pad.strokes}
          onStroke={onStroke}
          guide={info.strokes}
          guideStyle={guideStyle}
          arrowFor={!result && stepMode && !done ? next : null}
          inkColors={result?.perStroke}
        />
        {strokeTip && !result && (
          <p className={`stroke-tip ${strokeTip.ok ? 'ok' : 'bad'}`} role="status">
            Stroke {strokeTip.index + 1}: {strokeTip.message}
          </p>
        )}
        <Result result={result} />
        <div className="row">
          <button className="btn" onClick={() => { pad.undo(); setStrokeTip(null) }} disabled={!pad.strokes.length || !!result}>
            ↶ Undo
          </button>
          <button className="btn" onClick={retry} disabled={!pad.strokes.length}>
            {result ? '↺ Try again' : 'Clear'}
          </button>
          {result ? (
            <button className="btn primary" onClick={onNext}>
              Next →
            </button>
          ) : (
            <button className="btn primary" onClick={check} disabled={!pad.strokes.length}>
              Check
            </button>
          )}
        </div>
        <div className="row">
          <label className="toggle">
            <input type="checkbox" checked={showGuide} onChange={(e) => setShowGuide(e.target.checked)} /> Show guide
          </label>
          <label className="toggle">
            <input type="checkbox" checked={stepMode} onChange={(e) => setStepMode(e.target.checked)} /> Stroke-by-stroke hints
          </label>
        </div>
      </div>
      <div className="card">
        <h2>Hints</h2>
        <ul className="hint-list">
          <li>The highlighted stroke is the next one. Start at the dot and follow the arrow.</li>
          <li>Japanese strokes usually go top to bottom and left to right.</li>
          <li>Lift your finger between strokes. Each stroke counts.</li>
          <li>Turn off the guide when you feel ready, then try Test mode.</li>
        </ul>
        <div className="mini-order">
          <StrokeSvg strokes={info.strokes} numbers />
        </div>
      </div>
    </div>
  )
}

function TestMode({ lesson }) {
  const { recordWriting, completeWritingLesson } = useProgress()
  const [order, setOrder] = useState(() => shuffle(lesson.chars))
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState([])
  const [result, setResult] = useState(null)
  const pad = useStrokes()

  const finished = index >= order.length
  const info = finished ? null : charInfo(order[index])
  const passedCount = results.filter((r) => r.passed).length

  useEffect(() => {
    if (finished && results.length === order.length && passedCount === order.length) completeWritingLesson(lesson.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  if (finished) {
    return (
      <div className="card center">
        <h2>
          {passedCount} / {order.length} written correctly
        </h2>
        <p className="muted">{passedCount === order.length ? '完璧！ Lesson complete!' : 'Practise the ones in red, then try again.'}</p>
        <div className="chip-list">
          {results.map((r) => (
            <span key={r.char} className={`chip ${r.passed ? 'chip-pass' : 'chip-fail'}`} lang="ja">
              {r.char} <span className="muted">{r.score}%</span>
            </span>
          ))}
        </div>
        <button
          className="btn primary"
          onClick={() => {
            setOrder(shuffle(lesson.chars))
            setIndex(0)
            setResults([])
            pad.clear()
          }}
        >
          Test again
        </button>
      </div>
    )
  }

  const check = () => {
    const r = evaluate(info.strokes, pad.strokes)
    setResult(r)
    setResults((prev) => [...prev, { char: info.char, score: r.score, passed: r.passed }])
    recordWriting(info.char, 'test', r.score, r.passed)
  }

  const next = () => {
    pad.clear()
    setResult(null)
    setIndex((i) => i + 1)
  }

  return (
    <div className="card center test-card">
      <p className="muted small">
        {index + 1} of {order.length} · {lesson.title}
      </p>
      <p className="prompt">Write the character for</p>
      <div className="test-prompt">
        {info.prompt}
        {canSpeak && info.script !== 'kanji' && (
          <button className="btn subtle" onClick={() => speak(info.say)} aria-label="Listen">
            🔊
          </button>
        )}
      </div>
      <WritingCanvas
        strokes={pad.strokes}
        onStroke={(pts) => !result && pad.add(pts)}
        guide={result ? info.strokes : null}
        guideStyle={() => 'faint'}
        inkColors={result?.perStroke}
        disabled={!!result}
      />
      {result && (
        <p className="muted small">
          Answer: <span lang="ja" className="answer-char">{info.char}</span> ({info.strokeCount} strokes)
        </p>
      )}
      <Result result={result} />
      <div className="row">
        {!result && (
          <>
            <button className="btn" onClick={pad.undo} disabled={!pad.strokes.length}>
              ↶ Undo
            </button>
            <button className="btn" onClick={pad.clear} disabled={!pad.strokes.length}>
              Clear
            </button>
            <button className="btn primary" onClick={check} disabled={!pad.strokes.length}>
              Check
            </button>
          </>
        )}
        {result && (
          <button className="btn primary" onClick={next}>
            {index + 1 === order.length ? 'See results' : 'Next →'}
          </button>
        )}
      </div>
    </div>
  )
}
