import { useState } from 'react'
import { SKILL_TASKS, SLOT_MINUTES, WEEK } from '../data/plan.js'
import { todayKey, useProgress } from '../state/progress.jsx'

const addDays = (date, n) => {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}
// Monday of the week containing `date`.
const mondayOf = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}
const fmt = (d) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })

export default function Plan({ go }) {
  const { data, togglePlan } = useProgress()
  const [offset, setOffset] = useState(0)
  const monday = addDays(mondayOf(new Date()), offset * 7)
  const today = todayKey()

  const days = WEEK.map((w, i) => {
    const date = addDays(monday, i)
    const key = todayKey(date)
    return { ...w, date, key, done: data.plan.done[key] || [] }
  })
  const total = days.reduce((n, d) => n + d.skills.length, 0)
  const finished = days.reduce((n, d) => n + d.skills.filter((s) => d.done.includes(s)).length, 0)
  const minutes = finished * SLOT_MINUTES

  return (
    <section>
      <header className="page-header">
        <h1>計画 Study plan</h1>
        <p className="muted">
          One hour a day: two skills, {SLOT_MINUTES} minutes each. Every skill gets three sessions a week; Sunday is a light review.
        </p>
      </header>

      <div className="plan-week">
        <button className="btn" onClick={() => setOffset((o) => o - 1)} aria-label="Previous week">
          ←
        </button>
        <div className="plan-week-label">
          <strong>
            {fmt(monday)} – {fmt(addDays(monday, 6))}
          </strong>
          <span className="muted small">
            {finished}/{total} sessions · {Math.floor(minutes / 60)}h {minutes % 60}m studied
          </span>
        </div>
        <button className="btn" onClick={() => setOffset((o) => o + 1)} aria-label="Next week">
          →
        </button>
        {offset !== 0 && (
          <button className="btn subtle" onClick={() => setOffset(0)}>
            This week
          </button>
        )}
      </div>

      <div className="plan-days">
        {days.map((d) => (
          <div key={d.key} className={`card plan-day ${d.key === today ? 'today' : ''}`}>
            <div className="card-head">
              <h2>
                {d.day} <span className="muted small">{fmt(d.date)}</span>
              </h2>
              <span className="muted small">
                {d.review ? 'Review · ' : ''}1 hour{d.key === today ? ' · today' : ''}
              </span>
            </div>
            <ul className="plan-slots">
              {d.skills.map((s) => {
                const t = SKILL_TASKS[s]
                const on = d.done.includes(s)
                return (
                  <li key={s} className={`plan-slot ${on ? 'done' : ''}`}>
                    <label className="plan-check">
                      <input type="checkbox" checked={on} onChange={() => togglePlan(d.key, s)} />
                      <span className="plan-text">
                        <strong>
                          {t.title} <span lang="ja">{t.jp}</span> · {SLOT_MINUTES} min
                        </strong>
                        <span className="muted small">{t.task}</span>
                      </span>
                    </label>
                    <button className="btn subtle" onClick={() => go(t.page)}>
                      Open
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
