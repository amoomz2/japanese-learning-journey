import { useEffect, useMemo, useState } from 'react'
import { LESSONS, findDialogue } from '../data/book1.js'
import { useProgress } from '../state/progress.jsx'
import { useOnline } from '../pwa/offline.js'
import { canSpeak, speak } from '../utils/speech.js'
import { Ruby, kanaOnly } from '../reading/ruby.jsx'
import { fillBlanks } from '../reading/exercises.js'
import { BookCredit, ChoiceRunner, LEVELS } from './Reading.jsx'
import { SPEEDS, audioFor, downloadAudio, isCached, playClip, removeAudio, stopAudio } from '../listening/audio.js'
import { compareToLine, lineKana } from '../listening/compare.js'

function shuffle(items) {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Plays one line: native textbook audio when available, otherwise the device voice.
export function usePlayer(dialogue) {
  const audio = audioFor(dialogue.id)
  const [speed, setSpeed] = useState(1)
  const [playing, setPlaying] = useState(null) // line index or 'all'
  const [error, setError] = useState(null)

  useEffect(() => () => stopAudio(), [])

  const playLine = async (i) => {
    setError(null)
    setPlaying(i)
    try {
      const seg = audio?.lines?.[i]
      if (seg) await playClip(audio.url, seg[0], seg[1], speed)
      else if (canSpeak) speak(kanaOnly(dialogue.lines[i][1]), 0.8 * speed)
    } catch {
      setError('Audio could not be played. If you are offline, download this lesson’s audio first.')
    } finally {
      setPlaying(null)
    }
  }

  const playAll = async () => {
    setError(null)
    setPlaying('all')
    try {
      if (audio) await playClip(audio.url, 0, null, speed)
      else if (canSpeak) speak(dialogue.lines.map((l) => kanaOnly(l[1])).join('　'), 0.8 * speed)
    } catch {
      setError('Audio could not be played. If you are offline, download this lesson’s audio first.')
    } finally {
      setPlaying(null)
    }
  }

  const stop = () => {
    stopAudio()
    if (canSpeak) window.speechSynthesis.cancel()
    setPlaying(null)
  }

  return { audio, native: Boolean(audio), speed, setSpeed, playing, playLine, playAll, stop, error }
}

function initialDialogue() {
  const id = new URLSearchParams(window.location.hash.split('?')[1]).get('d')
  return id && findDialogue(id) ? id : null
}

export default function Listening() {
  const [dialogueId, setDialogueId] = useState(initialDialogue)
  const open = (id) => {
    setDialogueId(id)
    window.scrollTo(0, 0)
  }
  return (
    <section>
      <header className="page-header">
        <h1>聞く Listening</h1>
        <p className="muted">Native recordings from your textbook. Listen first, read later.</p>
      </header>
      {dialogueId ? <DialogueListener key={dialogueId} dialogue={findDialogue(dialogueId)} onBack={() => setDialogueId(null)} onOpen={open} /> : <ListeningHome onOpen={open} />}
      <BookCredit />
      <p className="muted small attribution">Audio: recordings accompanying the textbook (PDXScholar, CC BY-NC 4.0), compressed and split into lines for this site.</p>
    </section>
  )
}

function lessonUrls(lesson) {
  return lesson.dialogues.map((d) => audioFor(d.id)?.url).filter(Boolean)
}

function LessonDownload({ lesson }) {
  const online = useOnline()
  const urls = lessonUrls(lesson)
  const [state, setState] = useState({ cached: null, progress: null, error: null })

  useEffect(() => {
    isCached(urls).then((cached) => setState((s) => ({ ...s, cached })))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id])

  if (!urls.length || !('caches' in window)) return null
  const download = async () => {
    setState({ cached: false, progress: [0, urls.length], error: null })
    try {
      await downloadAudio(urls, (done, total) => setState((s) => ({ ...s, progress: [done, total] })))
      setState({ cached: true, progress: null, error: null })
    } catch (e) {
      setState({ cached: false, progress: null, error: e.message })
    }
  }
  const remove = async () => {
    await removeAudio(urls)
    setState({ cached: false, progress: null, error: null })
  }

  return (
    <div className="row left download-row">
      {state.cached ? (
        <>
          <span className="small score-line">✓ Audio saved for offline</span>
          <button className="btn subtle" onClick={remove}>
            Remove
          </button>
        </>
      ) : state.progress ? (
        <span className="small muted">
          Downloading {state.progress[0]}/{state.progress[1]}…
        </span>
      ) : (
        <button className="btn" onClick={download} disabled={!online}>
          ⬇ Save audio for offline
        </button>
      )}
      {state.error && <span className="small backup-error">{state.error}</span>}
    </div>
  )
}

function ListeningHome({ onOpen }) {
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
          <p className="muted">Book 1 covers N5. Listening for {current.key} will be added with a reliable source.</p>
        </div>
      ) : (
        LESSONS.map((lesson) => (
          <div key={lesson.id} className="card">
            <div className="card-head">
              <h2>
                Lesson {lesson.number}: {lesson.title}
              </h2>
              <span className="muted small">Book p.{lesson.page}</span>
            </div>
            <LessonDownload lesson={lesson} />
            <div className="dialogue-list">
              {lesson.dialogues.map((d) => {
                const s = data.listening.items[d.id]
                const best = s ? Object.values(s.best) : []
                return (
                  <button key={d.id} className="dialogue-item" onClick={() => onOpen(d.id)}>
                    <span>
                      <strong>{d.title}</strong>
                      <span className="muted small"> · {audioFor(d.id) ? '🎧 native audio' : '🔊 device voice'}</span>
                    </span>
                    <span className="muted small">{d.scene}</span>
                    {best.length > 0 && <span className="small score-line">Best: {Math.max(...best)}%</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))
      )}
    </>
  )
}

const EXERCISES = [
  ['quiz', 'Comprehension'],
  ['meaning', 'Choose the meaning'],
  ['complete', 'Complete the sentence'],
  ['dictation', 'Dictation'],
]

function DialogueListener({ dialogue, onBack, onOpen }) {
  const { data, recordSkill } = useProgress()
  const player = usePlayer(dialogue)
  const [exercise, setExercise] = useState('quiz')
  const [transcript, setTranscript] = useState(false)
  const stats = data.listening.items[dialogue.id]
  const all = LESSONS.flatMap((l) => l.dialogues.map((d) => d.id))
  const nextId = all[all.indexOf(dialogue.id) + 1]

  const done = (kind) => (pct) => {
    recordSkill('listening', dialogue.id, kind, pct)
    setTranscript(true)
  }

  return (
    <>
      <button className="btn subtle" onClick={onBack}>
        ← All lessons
      </button>
      <div className="card">
        <div className="card-head">
          <h2>
            Lesson {dialogue.lesson.number} · {dialogue.title}
          </h2>
          <span className="source-tag">Textbook · p.{dialogue.page}</span>
        </div>
        <p className="muted">{dialogue.scene}</p>
        <p className="small">
          {!player.native
            ? '🔊 No textbook recording for this dialogue: your device’s voice (synthetic) is used.'
            : player.audio.lines
              ? '🎧 Native recording from the textbook audio, for the whole dialogue and each line.'
              : '🎧 Native recording for the whole dialogue. Single lines use your device’s voice (synthetic), because the recording couldn’t be split into lines reliably.'}
        </p>
        <div className="row left">
          {player.playing === 'all' ? (
            <button className="btn" onClick={player.stop}>
              ■ Stop
            </button>
          ) : (
            <button className="btn primary" onClick={player.playAll}>
              ▶ Play dialogue
            </button>
          )}
          <div className="segmented" role="radiogroup" aria-label="Speed">
            {SPEEDS.map((s) => (
              <button key={s} role="radio" aria-checked={player.speed === s} className={player.speed === s ? 'active' : ''} onClick={() => player.setSpeed(s)}>
                {s}×
              </button>
            ))}
          </div>
        </div>
        {player.error && <p className="backup-error small">{player.error}</p>}

        <ol className="passage listen-lines">
          {dialogue.lines.map((line, i) => (
            <li key={i}>
              <span className="speaker">{line[0]}</span>
              <div className="listen-line">
                <button className={`btn ${player.playing === i ? 'primary' : ''}`} onClick={() => player.playLine(i)} aria-label={`Play line ${i + 1}`}>
                  ▶ {i + 1}
                </button>
                {transcript ? (
                  <div>
                    <p className="jp-line" lang="ja">
                      <Ruby text={line[1]} />
                    </p>
                    <p className="muted small">{line[2]}</p>
                    <p className="small">{line[3]}</p>
                    <p className="small arabic-inline" lang="ar" dir="rtl">
                      {line[4]}
                    </p>
                  </div>
                ) : (
                  <span className="muted small">Transcript hidden</span>
                )}
              </div>
            </li>
          ))}
        </ol>
        <button className="btn subtle" onClick={() => setTranscript((t) => !t)}>
          {transcript ? 'Hide transcript' : 'Show transcript'}
        </button>
      </div>

      <div className="card">
        <div className="segmented wrap" role="tablist" aria-label="Exercise">
          {EXERCISES.map(([k, label]) => (
            <button key={k} role="tab" aria-selected={exercise === k} className={exercise === k ? 'active' : ''} onClick={() => setExercise(k)}>
              {label}
              {stats?.best?.[k] !== undefined ? ` ${stats.best[k]}%` : ''}
            </button>
          ))}
        </div>
        {exercise === 'quiz' && <ListenQuiz key={`q${dialogue.id}`} dialogue={dialogue} player={player} onDone={done('quiz')} />}
        {exercise === 'meaning' && <MeaningQuiz key={`m${dialogue.id}`} dialogue={dialogue} player={player} onDone={done('meaning')} />}
        {exercise === 'complete' && <CompleteQuiz key={`c${dialogue.id}`} dialogue={dialogue} player={player} onDone={done('complete')} />}
        {exercise === 'dictation' && <Dictation key={`d${dialogue.id}`} dialogue={dialogue} player={player} onDone={done('dictation')} />}
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

function PlayButton({ player, line }) {
  return (
    <button className="btn listen-big" onClick={() => player.playLine(line)} aria-label="Play the audio">
      🔊 Play{player.playing === line ? 'ing…' : ''}
    </button>
  )
}

function ListenQuiz({ dialogue, player, onDone }) {
  const items = dialogue.questions.map((q) => ({
    prompt: (
      <>
        <p className="muted small">Listen to the whole dialogue (above), then answer.</p>
        <p>{q.q}</p>
        <p className="arabic-inline small" lang="ar" dir="rtl">
          {q.qAr}
        </p>
      </>
    ),
    options: q.options,
    answer: q.answer,
  }))
  return <ChoiceRunner items={items} onDone={onDone} label="Listening comprehension" note="Original questions" />
}

function MeaningQuiz({ dialogue, player, onDone }) {
  const items = useMemo(() => {
    const lesson = dialogue.lesson
    const pool = lesson.dialogues.flatMap((d) => d.lines.map((l) => l[3]))
    return shuffle(dialogue.lines.map((l, i) => ({ i, en: l[3] })))
      .slice(0, 5)
      .map(({ i, en }) => {
        const options = shuffle([en, ...shuffle(pool.filter((p) => p !== en)).slice(0, 3)])
        return { line: i, options, answer: options.indexOf(en) }
      })
  }, [dialogue])
  return (
    <ChoiceRunner
      items={items.map((it) => ({
        prompt: (
          <>
            <p>What does this line mean?</p>
            <PlayButton player={player} line={it.line} />
          </>
        ),
        options: it.options,
        answer: it.answer,
        explain: (
          <span lang="ja">
            <Ruby text={dialogue.lines[it.line][1]} /> · {dialogue.lines[it.line][2]}
          </span>
        ),
      }))}
      onDone={onDone}
      label="Choose the correct meaning"
      note="Textbook lines"
    />
  )
}

function CompleteQuiz({ dialogue, player, onDone }) {
  const items = useMemo(() => {
    const blanks = fillBlanks(dialogue, dialogue.lesson.dialogues.flatMap((d) => d.vocab), 5)
    return blanks.map((b) => ({ ...b, line: dialogue.lines.findIndex((l) => l[3] === b.en) }))
  }, [dialogue])
  return (
    <ChoiceRunner
      items={items.map((b) => ({
        prompt: (
          <>
            <p>Listen and complete the sentence.</p>
            <PlayButton player={player} line={b.line} />
            <p className="jp-line" lang="ja">
              {b.before}
              <span className="blank">＿＿</span>
              {b.after}
            </p>
          </>
        ),
        options: b.options,
        answer: b.options.indexOf(b.answer),
        explain: <>{b.en}</>,
      }))}
      onDone={onDone}
      label="Listen and complete"
      note="Textbook lines"
    />
  )
}

function Dictation({ dialogue, player, onDone }) {
  const lines = useMemo(
    () =>
      shuffle(dialogue.lines.map((l, i) => ({ l, i })).filter(({ l }) => lineKana(l).length <= 22))
        .slice(0, 4),
    [dialogue],
  )
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [scores, setScores] = useState([])
  const finished = index >= lines.length

  useEffect(() => {
    if (finished && lines.length) onDone(Math.round(scores.reduce((a, b) => a + b, 0) / scores.length))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  if (!lines.length) return <p className="muted">No short lines for dictation in this dialogue.</p>
  if (finished) {
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    return (
      <div className="center exercise-done">
        <h3>Dictation: {avg}%</h3>
        <button className="btn" onClick={() => { setIndex(0); setScores([]); setResult(null); setInput('') }}>
          Try again
        </button>
      </div>
    )
  }

  const { l, i } = lines[index]
  const check = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const score = compareToLine(input.trim(), l)
    setResult(score)
    setScores((s) => [...s, score])
  }

  return (
    <div className="exercise">
      <p className="muted small">
        Dictation · {index + 1} of {lines.length}
        <span className="source-tag original">Type in kana or romaji</span>
      </p>
      <PlayButton player={player} line={i} />
      <form className="chat-input" onSubmit={check}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type what you hear…" lang="ja" aria-label="What you heard" disabled={result !== null} autoComplete="off" autoCapitalize="off" spellCheck={false} />
        {result === null && (
          <button className="btn primary" type="submit" disabled={!input.trim()}>
            Check
          </button>
        )}
      </form>
      {result !== null && (
        <div className={`write-result ${result >= 85 ? 'pass' : 'fail'}`} role="status">
          <strong>
            {result >= 85 ? '✅' : '🔁'} {result}% match
          </strong>
          <p className="jp-line" lang="ja">
            <Ruby text={l[1]} />
          </p>
          <p className="muted small">
            {kanaOnly(l[1])} · {l[2]}
          </p>
          <button
            className="btn primary"
            onClick={() => {
              setIndex((n) => n + 1)
              setInput('')
              setResult(null)
            }}
          >
            {index + 1 === lines.length ? 'See score' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  )
}
