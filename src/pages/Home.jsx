import { useStats } from './Progress.jsx'

export default function Home({ go }) {
  const stats = useStats()
  const learned = stats.scripts.reduce((n, s) => n + s.learned, 0)
  const total = stats.scripts.reduce((n, s) => n + s.total, 0)

  return (
    <section>
      <div className="hero">
        <p className="hero-jp">日本語の旅</p>
        <h1>My Japanese Learning Journey</h1>
        <p className="muted">Learn the kana, practise every day, and keep a record of how far you've come.</p>
        <div className="row">
          <button className="btn primary" onClick={() => go('practice')}>
            Start practising
          </button>
          <button className="btn" onClick={() => go('kana')}>
            Browse kana charts
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="card stat">
          <span className="muted small">Streak</span>
          <strong className="stat-value">{stats.streak} 🔥</strong>
        </div>
        <div className="card stat">
          <span className="muted small">Kana learned</span>
          <strong className="stat-value">
            {learned}/{total}
          </strong>
        </div>
        <div className="card stat">
          <span className="muted small">Words learned</span>
          <strong className="stat-value">
            {stats.vocab.learned}/{stats.vocab.total}
          </strong>
        </div>
        <div className="card stat">
          <span className="muted small">Accuracy</span>
          <strong className="stat-value">{stats.accuracy === null ? '—' : `${stats.accuracy}%`}</strong>
        </div>
      </div>

      <div className="feature-grid">
        {[
          ['kana', 'あ', 'Kana charts', 'Hiragana and katakana with pronunciation.'],
          ['vocab', '語', 'Vocabulary', 'Everyday beginner words, grouped by topic.'],
          ['practice', '練', 'Flashcards & quizzes', 'Drill kana and words, then test yourself.'],
          ['writing', '書', 'Writing practice', 'Stroke order, tracing and writing tests.'],
          ['progress', '進', 'Progress', 'Streaks, accuracy and your weak spots.'],
          ['journal', '記', 'Study log', 'Write down milestones along the way.'],
        ].map(([page, icon, title, text]) => (
          <button key={page} className="card feature" onClick={() => go(page)}>
            <span className="feature-icon">{icon}</span>
            <strong>{title}</strong>
            <span className="muted small">{text}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
