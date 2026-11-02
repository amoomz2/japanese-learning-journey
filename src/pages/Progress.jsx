import { kanaList } from '../data/kana.js'
import { vocabList } from '../data/vocab.js'
import OfflineCard from '../pwa/OfflineCard.jsx'
import BackupCard from '../backup/BackupCard.jsx'
import WritingProgress from '../writing/WritingProgress.jsx'
import { computeStreak, isLearned, todayKey, useProgress } from '../state/progress.jsx'

export function useStats() {
  const { data } = useProgress()
  const scripts = ['hiragana', 'katakana'].map((script) => {
    const all = kanaList(script)
    const learned = all.filter((k) => isLearned(data.kana[k.id])).length
    return { script, learned, total: all.length }
  })
  const words = vocabList()
  const vocab = { learned: words.filter((w) => isLearned(data.kana[w.id])).length, total: words.length }
  const answers = Object.values(data.kana).reduce((acc, s) => ({ correct: acc.correct + s.correct, total: acc.total + s.correct + s.wrong }), { correct: 0, total: 0 })
  return {
    scripts,
    vocab,
    streak: computeStreak(data.activeDays),
    daysStudied: data.activeDays.length,
    accuracy: answers.total ? Math.round((answers.correct / answers.total) * 100) : null,
    answers: answers.total,
  }
}

function last28Days(activeDays) {
  const set = new Set(activeDays)
  return Array.from({ length: 28 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (27 - i))
    const key = todayKey(d)
    return { key, active: set.has(key) }
  })
}

export default function Progress() {
  const { data, resetProgress } = useProgress()
  const stats = useStats()

  const weakest = Object.entries(data.kana)
    .filter(([, s]) => s.wrong > 0)
    .sort(([, a], [, b]) => b.wrong / (b.correct + b.wrong) - a.wrong / (a.correct + a.wrong))
    .slice(0, 8)

  const onReset = () => {
    if (window.confirm('Reset all practice progress? Your study log entries will be kept.')) resetProgress()
  }

  return (
    <section>
      <header className="page-header">
        <h1>進歩 Progress</h1>
        <p className="muted">Saved in this browser. Clearing site data or switching devices starts fresh.</p>
      </header>

      <div className="stat-grid">
        <Stat label="Current streak" value={`${stats.streak} 🔥`} hint={stats.streak === 1 ? 'day' : 'days'} />
        <Stat label="Days studied" value={stats.daysStudied} />
        <Stat label="Accuracy" value={stats.accuracy === null ? '—' : `${stats.accuracy}%`} hint={`${stats.answers} answers`} />
        <Stat label="Quizzes taken" value={data.quizHistory.length} />
      </div>

      <div className="card">
        <h2>Learned so far</h2>
        {[
          ...stats.scripts.map((s) => ({ ...s, label: s.script === 'hiragana' ? 'ひらがな' : 'カタカナ' })),
          { ...stats.vocab, label: '単語 words' },
        ].map((s) => (
          <div key={s.label} className="progress-row">
            <span className="progress-label">{s.label}</span>
            <div className="bar" role="progressbar" aria-valuenow={s.learned} aria-valuemax={s.total}>
              <div className="bar-fill" style={{ width: `${(s.learned / s.total) * 100}%` }} />
            </div>
            <span className="progress-count">
              {s.learned}/{s.total}
            </span>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Last 4 weeks</h2>
        <div className="calendar">
          {last28Days(data.activeDays).map((d) => (
            <div key={d.key} className={`day ${d.active ? 'active' : ''}`} title={d.key} />
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Needs more practice</h2>
        {weakest.length === 0 ? (
          <p className="muted">No mistakes recorded yet. Take a quiz to find your weak spots.</p>
        ) : (
          <div className="chip-list">
            {weakest.map(([id, s]) => (
              <span key={id} className="chip">
                {id.split(':')[1]} <span className="muted">{Math.round((s.correct / (s.correct + s.wrong)) * 100)}%</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {data.quizHistory.length > 0 && (
        <div className="card">
          <h2>Recent quizzes</h2>
          <ul className="plain-list">
            {data.quizHistory.slice(0, 5).map((q) => (
              <li key={q.date}>
                <span>{new Date(q.date).toLocaleString()}</span>
                <strong>
                  {q.score}/{q.total}
                </strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      <WritingProgress />

      <BackupCard />

      <OfflineCard />

      <button className="btn danger subtle" onClick={onReset}>
        Reset practice progress
      </button>
    </section>
  )
}

function Stat({ label, value, hint }) {
  return (
    <div className="card stat">
      <span className="muted small">{label}</span>
      <strong className="stat-value">{value}</strong>
      {hint && <span className="muted small">{hint}</span>}
    </div>
  )
}
