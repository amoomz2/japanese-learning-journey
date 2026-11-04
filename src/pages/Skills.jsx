import { LESSONS, ALL_DIALOGUES } from '../data/book1.js'
import { WRITING_CHARS } from '../data/writingChars.js'
import { ALL_LESSONS as WRITING_LESSONS } from '../data/writing.js'
import { computeStreak, isWritingLearned, todayKey, useProgress } from '../state/progress.jsx'

const DONE = 70 // a dialogue counts as done in a skill at 70%+

const avg = (xs) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null)
const bestOf = (item) => (item ? Math.max(0, ...Object.values(item.best || {})) : 0)

export function useSkillStats() {
  const { data } = useProgress()
  const today = todayKey()

  const wChars = data.writing.chars
  const wEntries = Object.values(wChars)
  const wTests = wEntries.reduce((n, s) => n + s.tests, 0)
  const wPassed = wEntries.reduce((n, s) => n + s.passed, 0)
  const writing = {
    key: 'writing',
    icon: '書',
    title: 'Writing',
    jp: '書く',
    page: 'writing',
    done: WRITING_CHARS.filter((c) => isWritingLearned(wChars[c])).length,
    total: WRITING_CHARS.length,
    unit: 'characters learned',
    score: wTests ? Math.round((wPassed / wTests) * 100) : null,
    lessons: data.writing.lessons.length,
    lessonsTotal: WRITING_LESSONS.length,
    days: data.writing.days,
    weak: Object.entries(wChars)
      .filter(([, s]) => s.tests > 0 && s.passed < s.tests)
      .slice(0, 5)
      .map(([c]) => c),
  }

  const dialogueSkill = (key, store, title, jp, icon, page) => {
    const items = store.items
    const scored = ALL_DIALOGUES.map((d) => ({ d, best: bestOf(items[d.id]), tried: Boolean(items[d.id]) }))
    const lessonsDone = LESSONS.filter((l) => l.dialogues.every((d) => bestOf(items[d.id]) >= DONE)).length
    return {
      key,
      icon,
      title,
      jp,
      page,
      done: scored.filter((s) => s.best >= DONE).length,
      total: ALL_DIALOGUES.length,
      unit: 'dialogues at 70%+',
      score: avg(scored.filter((s) => s.tried).map((s) => s.best)),
      lessons: lessonsDone,
      lessonsTotal: LESSONS.length,
      days: store.days,
      weak: scored
        .filter((s) => s.tried && s.best < DONE)
        .sort((a, b) => a.best - b.best)
        .slice(0, 5)
        .map((s) => `L${s.d.lesson.number} ${s.d.title}`),
    }
  }

  const reading = dialogueSkill('reading', data.reading, 'Reading', '読む', '読', 'reading')
  reading.speed = Math.max(0, ...Object.values(data.reading.items).map((s) => s.bestCpm || 0)) || null
  const listening = dialogueSkill('listening', data.listening, 'Listening', '聞く', '聞', 'listening')
  const speaking = dialogueSkill('speaking', data.speaking, 'Speaking', '話す', '話', 'speaking')

  const skills = [writing, reading, listening, speaking].map((s) => ({ ...s, today: s.days.includes(today), streak: computeStreak(s.days) }))
  return { skills, streak: computeStreak(data.activeDays), quizzes: data.quizHistory }
}

export default function Skills({ go }) {
  const { skills, streak, quizzes } = useSkillStats()
  const goalsDone = skills.filter((s) => s.today).length
  const tried = skills.filter((s) => s.score !== null)
  const untried = skills.filter((s) => s.score === null)
  // A skill you haven't started is weaker than any score.
  const weakest = untried.length && tried.length ? untried[0] : tried.length ? [...tried].sort((a, b) => a.score - b.score)[0] : null

  return (
    <section>
      <header className="page-header">
        <h1>技能 Four skills</h1>
        <p className="muted">Writing, reading, listening and speaking, all in one place. Level: JLPT N5 (Book 1).</p>
      </header>

      <div className="card">
        <div className="card-head">
          <h2>Today’s goals</h2>
          <span className="muted small">
            {goalsDone}/4 done · streak {streak} 🔥
          </span>
        </div>
        <div className="goal-grid">
          {skills.map((s) => (
            <button key={s.key} className={`goal ${s.today ? 'done' : ''} skill-${s.key}`} onClick={() => go(s.page)}>
              <span className="goal-check">{s.today ? '✓' : '○'}</span>
              <span>
                Practise {s.title.toLowerCase()} <span lang="ja">{s.jp}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="skill-grid">
        {skills.map((s) => (
          <button key={s.key} className={`card skill-card skill-${s.key}`} onClick={() => go(s.page)}>
            <div className="skill-head">
              <span className="skill-icon" lang="ja">
                {s.icon}
              </span>
              <span>
                <strong>{s.title}</strong> <span className="muted small" lang="ja">{s.jp}</span>
              </span>
            </div>
            <div className="bar" role="progressbar" aria-valuenow={s.done} aria-valuemax={s.total}>
              <div className="bar-fill skill-fill" style={{ width: `${(s.done / s.total) * 100}%` }} />
            </div>
            <span className="small">
              {s.done}/{s.total} {s.unit}
            </span>
            <span className="muted small">
              Average score: {s.score === null ? '—' : `${s.score}%`} · lessons done {s.lessons}/{s.lessonsTotal}
              {s.speed ? ` · best speed ${s.speed} chars/min` : ''} · streak {s.streak}
            </span>
          </button>
        ))}
      </div>

      <div className="card">
        <h2>Weak areas</h2>
        {!weakest ? (
          <p className="muted">Practise a little in each skill and your weak spots will appear here.</p>
        ) : (
          <>
            <p>
              {weakest.score === null ? (
                <>
                  You haven’t practised <strong>{weakest.title.toLowerCase()}</strong> yet
                  {untried.length > 1 ? ` (also: ${untried.slice(1).map((s) => s.title.toLowerCase()).join(', ')})` : ''}.{' '}
                </>
              ) : (
                <>
                  Your lowest skill right now is <strong>{weakest.title}</strong> ({weakest.score}%).{' '}
                </>
              )}
              <button className="btn subtle" onClick={() => go(weakest.page)}>
                Practise it →
              </button>
            </p>
            {skills
              .filter((s) => s.weak.length)
              .map((s) => (
                <p key={s.key} className="small">
                  <strong>{s.title}:</strong> <span lang="ja">{s.weak.join(' · ')}</span>
                </p>
              ))}
          </>
        )}
      </div>

      <div className="card">
        <h2>Recent quiz results</h2>
        {quizzes.length === 0 ? (
          <p className="muted">No kana or vocabulary quizzes yet.</p>
        ) : (
          <ul className="plain-list">
            {quizzes.slice(0, 5).map((q) => (
              <li key={q.date}>
                <span>{new Date(q.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                <strong>
                  {q.score}/{q.total}
                </strong>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h2>Levels</h2>
        <ul className="plain-list">
          <li>
            <span>N5 · Beginner</span>
            <strong>Book 1, Lessons 0–4</strong>
          </li>
          {['N4 · Elementary', 'N3 · Intermediate', 'N2 · Upper intermediate', 'N1 · Advanced'].map((l) => (
            <li key={l}>
              <span>{l}</span>
              <span className="muted">Coming later</span>
            </li>
          ))}
        </ul>
        <p className="muted small">
          JLPT tests reading and listening only. This site also trains speaking and writing for real conversations, which the exam doesn’t measure.
        </p>
      </div>
    </section>
  )
}
