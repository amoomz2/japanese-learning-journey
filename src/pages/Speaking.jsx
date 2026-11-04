import { useEffect, useMemo, useRef, useState } from 'react'
import { findDialogue } from '../data/book1.js'
import { ACT_IN_JAPANESE, SPEAKING_TOPICS, SUPPLEMENTARY } from '../data/supplementary.js'
import { useProgress } from '../state/progress.jsx'
import { useOnline } from '../pwa/offline.js'
import { Ruby } from '../reading/ruby.jsx'
import { BookCredit } from './Reading.jsx'
import { usePlayer } from './Listening.jsx'
import { compareToLine } from '../listening/compare.js'
import { canRecognize, canRecord, recognizeOnce, startRecording } from '../speaking/voice.js'

const PASS = 70

function getSet(id) {
  const book = findDialogue(id)
  if (book) return { ...book, source: 'book' }
  const supp = SUPPLEMENTARY.find((s) => s.id === id)
  return supp ? { ...supp, source: 'original', scene: 'Useful phrases (not in Book 1).' } : null
}

export default function Speaking() {
  const [topic, setTopic] = useState(null)
  return (
    <section>
      <header className="page-header">
        <h1>話す Speaking</h1>
        <p className="muted">Listen, repeat, record yourself and role-play the textbook conversations.</p>
      </header>
      <SupportNote />
      {topic ? <TopicPractice key={topic.id} topic={topic} onBack={() => setTopic(null)} /> : <SpeakingHome onOpen={setTopic} />}
      <BookCredit />
    </section>
  )
}

function SupportNote() {
  const online = useOnline()
  return (
    <div className="card support-note">
      <ul className="plain-list">
        <li>
          <span>🗣 Pronunciation check (speech recognition)</span>
          <strong>{!canRecognize ? 'Not supported in this browser' : online ? 'Available (uses the internet)' : 'Needs internet'}</strong>
        </li>
        <li>
          <span>🎙 Record and replay yourself</span>
          <strong>{canRecord ? 'Available, works offline' : 'Not supported'}</strong>
        </li>
      </ul>
      <p className="muted small">
        The check compares the words the recogniser heard with the textbook line. It can’t judge pitch accent or subtle sounds, so compare your recording with the native audio
        too. Safari on iPhone and Chrome support it; Firefox doesn’t.
      </p>
    </div>
  )
}

function SpeakingHome({ onOpen }) {
  const { data } = useProgress()
  return (
    <>
      <div className="feature-grid">
        {SPEAKING_TOPICS.map((t) => {
          const best = t.dialogues.flatMap((id) => Object.values(data.speaking.items[id]?.best || {}))
          const original = t.dialogues.every((id) => id.startsWith('S-'))
          return (
            <button key={t.id} className="card feature" onClick={() => onOpen(t)}>
              <strong>{t.title}</strong>
              <span className="muted small arabic-inline" lang="ar" dir="rtl">
                {t.titleAr}
              </span>
              <span className="muted small">{original ? 'Supplementary (original)' : `Textbook: ${t.dialogues.map((id) => findDialogue(id)?.lesson.number).filter((n) => n !== undefined).map((n) => `L${n}`).filter((v, i, a) => a.indexOf(v) === i).join(', ')}`}</span>
              {best.length > 0 && <span className="small score-line">Best: {Math.max(...best)}%</span>}
            </button>
          )
        })}
      </div>
      <ActInJapanese />
    </>
  )
}

function ActInJapanese() {
  const { recordSkill } = useProgress()
  const [i, setI] = useState(() => Math.floor(Math.random() * ACT_IN_JAPANESE.items.length))
  return (
    <div className="card">
      <div className="card-head">
        <h2>Act in Japanese</h2>
        <span className="source-tag">Textbook · p.{ACT_IN_JAPANESE.page}</span>
      </div>
      <p className="muted small">Say what you would say, out loud, with the right gesture. Then check the Lesson 0 dialogues.</p>
      <p className="act-prompt">{ACT_IN_JAPANESE.items[i]}</p>
      <div className="row left">
        <button
          className="btn primary"
          onClick={() => {
            recordSkill('speaking', 'act', 'act', 100)
            setI((n) => (n + 1) % ACT_IN_JAPANESE.items.length)
          }}
        >
          ✓ I said it. Next
        </button>
      </div>
    </div>
  )
}

function TopicPractice({ topic, onBack }) {
  const [setId, setSetId] = useState(topic.dialogues[0])
  const [mode, setMode] = useState('shadow')
  const set = getSet(setId)
  const speakers = [...new Set(set.lines.map((l) => l[0]).filter((s) => s && s !== 'Everyone'))]
  const canRolePlay = speakers.length >= 2

  return (
    <>
      <button className="btn subtle" onClick={onBack}>
        ← All topics
      </button>
      <div className="card">
        <h2>{topic.title}</h2>
        <div className="chip-list left">
          {topic.dialogues.map((id) => {
            const s = getSet(id)
            return (
              <button key={id} className={`chip ${id === setId ? 'active' : ''}`} onClick={() => setSetId(id)}>
                {s.source === 'book' ? `L${s.lesson.number} ${s.title}` : s.title}
              </button>
            )
          })}
        </div>
        <p className="muted small">
          {set.scene}{' '}
          {set.source === 'book' ? <span className="source-tag">Textbook · p.{set.page}</span> : <span className="source-tag original">Supplementary (original)</span>}
        </p>
        <div className="segmented" role="tablist" aria-label="Mode">
          <button role="tab" aria-selected={mode === 'shadow'} className={mode === 'shadow' ? 'active' : ''} onClick={() => setMode('shadow')}>
            Shadowing
          </button>
          {canRolePlay && (
            <button role="tab" aria-selected={mode === 'roleplay'} className={mode === 'roleplay' ? 'active' : ''} onClick={() => setMode('roleplay')}>
              Role-play
            </button>
          )}
        </div>
      </div>
      {mode === 'shadow' || !canRolePlay ? <Shadowing key={`s-${setId}`} set={set} /> : <RolePlay key={`r-${setId}`} set={set} speakers={speakers} />}
    </>
  )
}

// Speech-recognition check for one line. Calls onScore(score) with 0–100.
function useCheck() {
  const online = useOnline()
  const [state, setState] = useState({ busy: false, heard: null, score: null, error: null })
  const check = async (line) => {
    setState({ busy: true, heard: null, score: null, error: null })
    try {
      const alts = await recognizeOnce()
      const scored = alts.map((a) => ({ a, s: compareToLine(a, line) })).sort((x, y) => y.s - x.s)[0]
      setState({ busy: false, heard: scored.a, score: scored.s, error: null })
      return scored.s
    } catch (e) {
      setState({ busy: false, heard: null, score: null, error: e.message })
      return null
    }
  }
  return { ...state, check, available: canRecognize && online, reset: () => setState({ busy: false, heard: null, score: null, error: null }) }
}

function CheckResult({ c }) {
  if (c.error) return <p className="backup-error small">{c.error}</p>
  if (c.score === null) return null
  return (
    <p className={`stroke-tip ${c.score >= PASS ? 'ok' : 'bad'}`} role="status">
      {c.score >= PASS ? '✅' : '🔁'} {c.score}% match · heard: <span lang="ja">{c.heard}</span>
    </p>
  )
}

function Recorder() {
  const [rec, setRec] = useState(null)
  const [url, setUrl] = useState(null)
  const [error, setError] = useState(null)
  const audioRef = useRef(null)
  useEffect(() => () => url && URL.revokeObjectURL(url), [url])
  if (!canRecord) return null
  const start = async () => {
    setError(null)
    try {
      const r = await startRecording()
      setRec(r)
      r.done.then((u) => {
        setUrl(u)
        setRec(null)
      })
    } catch {
      setError('Microphone permission was denied.')
    }
  }
  return (
    <>
      {rec ? (
        <button className="btn danger" onClick={() => rec.stop()}>
          ■ Stop
        </button>
      ) : (
        <button className="btn" onClick={start}>
          🎙 Record
        </button>
      )}
      {url && !rec && (
        <button className="btn" onClick={() => audioRef.current?.play()}>
          ▶ Me
        </button>
      )}
      {url && <audio ref={audioRef} src={url} />}
      {error && <span className="backup-error small">{error}</span>}
    </>
  )
}

function Shadowing({ set }) {
  const { recordSkill } = useProgress()
  const player = usePlayer(set)
  const [show, setShow] = useState({ en: true, ar: false })
  return (
    <div className="card">
      <p className="muted small">
        For each line: listen, say it out loud, then {canRecord ? 'record yourself and compare' : 'repeat'}
        {canRecognize ? ' or tap 🗣 to check your pronunciation' : ''}.
      </p>
      <div className="chip-list left">
        <button className={`chip ${show.en ? 'active' : ''}`} onClick={() => setShow((s) => ({ ...s, en: !s.en }))}>
          English
        </button>
        <button className={`chip ${show.ar ? 'active' : ''}`} onClick={() => setShow((s) => ({ ...s, ar: !s.ar }))}>
          العربية
        </button>
      </div>
      <ol className="passage">
        {set.lines.map((line, i) => (
          <ShadowLine key={i} line={line} index={i} player={player} show={show} onScore={(s) => recordSkill('speaking', set.id, 'shadow', s)} />
        ))}
      </ol>
      {player.error && <p className="backup-error small">{player.error}</p>}
    </div>
  )
}

function ShadowLine({ line, index, player, show, onScore }) {
  const c = useCheck()
  const [speaker, jp, romaji, en, ar] = line
  return (
    <li>
      <span className="speaker">{speaker}</span>
      <div>
        <p className="jp-line" lang="ja">
          <Ruby text={jp} />
        </p>
        <p className="muted small">{romaji}</p>
        {show.en && <p className="small">{en}</p>}
        {show.ar && (
          <p className="small arabic-inline" lang="ar" dir="rtl">
            {ar}
          </p>
        )}
        <div className="row left speak-controls">
          <button className={`btn ${player.playing === index ? 'primary' : ''}`} onClick={() => player.playLine(index)}>
            ▶ Listen
          </button>
          <Recorder />
          {c.available && (
            <button
              className="btn"
              disabled={c.busy}
              onClick={async () => {
                const s = await c.check(line)
                if (s !== null) onScore(s)
              }}
            >
              {c.busy ? '🗣 Listening…' : '🗣 Check'}
            </button>
          )}
        </div>
        <CheckResult c={c} />
      </div>
    </li>
  )
}

function RolePlay({ set, speakers }) {
  const { recordSkill } = useProgress()
  const player = usePlayer(set)
  const [role, setRole] = useState(speakers[1] || speakers[0])
  const [step, setStep] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [hint, setHint] = useState(false)
  const [scores, setScores] = useState([])
  const c = useCheck()
  const lines = set.lines
  const finished = step >= lines.length
  const mine = !finished && lines[step][0] === role

  // Partner lines play automatically.
  useEffect(() => {
    if (finished) {
      if (scores.length) recordSkill('speaking', set.id, 'roleplay', Math.round(scores.reduce((a, b) => a + b, 0) / scores.length))
      return
    }
    if (!mine) player.playLine(step)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, finished])

  const restart = (r = role) => {
    setRole(r)
    setStep(0)
    setScores([])
    setRevealed(false)
    setHint(false)
    c.reset()
  }
  const next = (score) => {
    if (score !== undefined) setScores((s) => [...s, score])
    setRevealed(false)
    setHint(false)
    c.reset()
    setStep((n) => n + 1)
  }

  const mySpeech = useMemo(() => lines.filter((l) => l[0] === role).length, [lines, role])

  return (
    <div className="card">
      <div className="row left">
        <span className="muted small">You are:</span>
        {speakers.map((s) => (
          <button key={s} className={`chip ${s === role ? 'active' : ''}`} onClick={() => restart(s)}>
            {s}
          </button>
        ))}
      </div>
      <ol className="passage roleplay">
        {lines.slice(0, Math.min(step + 1, lines.length)).map((line, i) => {
          const isMine = line[0] === role
          const current = i === step
          return (
            <li key={i} className={isMine ? 'mine' : ''}>
              <span className="speaker">{isMine ? `You (${line[0]})` : line[0]}</span>
              <div>
                {isMine && current && !revealed ? (
                  <>
                    <p className="small">Say: “{line[3]}”</p>
                    {hint && <p className="muted small">{line[2]}</p>}
                  </>
                ) : (
                  <>
                    <p className="jp-line" lang="ja">
                      <Ruby text={line[1]} />
                    </p>
                    <p className="muted small">{line[3]}</p>
                  </>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      {finished ? (
        <div className="center exercise-done">
          <h3>{scores.length ? `Role-play score: ${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}%` : 'Role-play complete'}</h3>
          <button className="btn primary" onClick={() => restart()}>
            Again
          </button>
        </div>
      ) : mine ? (
        <div className="row left">
          {!hint && !revealed && (
            <button className="btn subtle" onClick={() => setHint(true)}>
              Hint (romaji)
            </button>
          )}
          {c.available && !revealed && (
            <button
              className="btn primary"
              disabled={c.busy}
              onClick={async () => {
                const s = await c.check(lines[step])
                if (s !== null) setRevealed(true)
              }}
            >
              {c.busy ? '🗣 Listening…' : '🗣 Speak'}
            </button>
          )}
          {!revealed && (
            <button className="btn" onClick={() => setRevealed(true)}>
              Show answer
            </button>
          )}
          {revealed && (
            <>
              <button className="btn" onClick={() => player.playLine(step)}>
                ▶ Model
              </button>
              {c.score !== null ? (
                <button className="btn primary" onClick={() => next(c.score)}>
                  Next →
                </button>
              ) : (
                <>
                  <button className="btn success" onClick={() => next(100)}>
                    ✓ I said it right
                  </button>
                  <button className="btn danger" onClick={() => next(0)}>
                    ✗ Not yet
                  </button>
                </>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="row left">
          <button className="btn" onClick={() => player.playLine(step)}>
            ▶ Replay
          </button>
          <button className="btn primary" onClick={() => next()}>
            Next →
          </button>
        </div>
      )}
      <CheckResult c={c} />
      <p className="muted small">
        You have {mySpeech} line{mySpeech === 1 ? '' : 's'} in this conversation.
      </p>
    </div>
  )
}
