import { ALL_LESSONS } from '../data/writing.js'
import { WRITING_CHARS } from '../data/writingChars.js'
import { computeStreak, isWritingLearned, useProgress } from '../state/progress.jsx'

export default function WritingProgress() {
  const { data } = useProgress()
  const chars = data.writing.chars
  const entries = Object.entries(chars)
  const learned = WRITING_CHARS.filter((c) => isWritingLearned(chars[c])).length
  const practiced = entries.filter(([, s]) => s.practiced + s.tests > 0).length
  const tests = entries.reduce((n, [, s]) => n + s.tests, 0)
  const passed = entries.reduce((n, [, s]) => n + s.passed, 0)
  const difficult = entries
    .filter(([, s]) => s.tests > 0 && s.passed < s.tests)
    .sort(([, a], [, b]) => a.passed / a.tests - b.passed / b.tests || a.best - b.best)
    .slice(0, 8)

  return (
    <div className="card">
      <h2>書 Writing</h2>
      <div className="stat-grid compact">
        <div className="stat">
          <span className="muted small">Characters learned</span>
          <strong className="stat-value">
            {learned}/{WRITING_CHARS.length}
          </strong>
        </div>
        <div className="stat">
          <span className="muted small">Practised</span>
          <strong className="stat-value">{practiced}</strong>
        </div>
        <div className="stat">
          <span className="muted small">Test accuracy</span>
          <strong className="stat-value">{tests ? `${Math.round((passed / tests) * 100)}%` : '—'}</strong>
        </div>
        <div className="stat">
          <span className="muted small">Writing streak</span>
          <strong className="stat-value">{computeStreak(data.writing.days)} 🔥</strong>
        </div>
        <div className="stat">
          <span className="muted small">Lessons completed</span>
          <strong className="stat-value">
            {data.writing.lessons.length}/{ALL_LESSONS.length}
          </strong>
        </div>
      </div>
      <h3>Difficult characters</h3>
      {difficult.length === 0 ? (
        <p className="muted">None yet. Characters you miss in Test mode will show up here.</p>
      ) : (
        <div className="chip-list left">
          {difficult.map(([ch, s]) => (
            <span key={ch} className="chip" lang="ja">
              {ch} <span className="muted">{s.passed}/{s.tests}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
