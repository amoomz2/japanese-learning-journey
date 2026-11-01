import { useState } from 'react'
import { useProgress } from '../state/progress.jsx'

const MOODS = ['😊', '💪', '🤔', '😴', '🎉']
const BLANK = { title: '', notes: '', minutes: '', mood: '😊' }

export default function Journal() {
  const { data, addJournal, updateJournal, deleteJournal } = useProgress()
  const [form, setForm] = useState(BLANK)
  const [editingId, setEditingId] = useState(null)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const entry = { ...form, title: form.title.trim(), minutes: Number(form.minutes) || 0 }
    if (editingId) updateJournal(editingId, entry)
    else addJournal(entry)
    setForm(BLANK)
    setEditingId(null)
  }

  const startEdit = (entry) => {
    setEditingId(entry.id)
    setForm({ title: entry.title, notes: entry.notes, minutes: entry.minutes || '', mood: entry.mood })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = (id) => {
    if (window.confirm('Delete this entry?')) deleteJournal(id)
  }

  const totalMinutes = data.journal.reduce((sum, e) => sum + (e.minutes || 0), 0)

  return (
    <section>
      <header className="page-header">
        <h1>日記 Study Log</h1>
        <p className="muted">
          {data.journal.length} {data.journal.length === 1 ? 'entry' : 'entries'} ·{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m logged
        </p>
      </header>

      <form className="card form" onSubmit={submit}>
        <h2>{editingId ? 'Edit entry' : 'What did you study today?'}</h2>
        <input placeholder="Title, e.g. Finished the K-row of katakana" value={form.title} onChange={set('title')} required />
        <textarea placeholder="Notes, new words, things that clicked…" rows={4} value={form.notes} onChange={set('notes')} />
        <div className="row left">
          <label>
            Minutes
            <input type="number" min="0" max="1440" value={form.minutes} onChange={set('minutes')} className="narrow" />
          </label>
          <div className="moods" role="radiogroup" aria-label="Mood">
            {MOODS.map((m) => (
              <button type="button" key={m} role="radio" aria-checked={form.mood === m} className={`mood ${form.mood === m ? 'active' : ''}`} onClick={() => setForm((f) => ({ ...f, mood: m }))}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="row left">
          <button className="btn primary" type="submit">
            {editingId ? 'Save changes' : 'Add entry'}
          </button>
          {editingId && (
            <button className="btn" type="button" onClick={() => { setEditingId(null); setForm(BLANK) }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {data.journal.length === 0 ? (
        <p className="muted center">Your journey starts with the first entry. 一歩ずつ, one step at a time.</p>
      ) : (
        <ol className="timeline">
          {data.journal.map((e) => (
            <li key={e.id} className="card entry">
              <div className="entry-head">
                <span className="mood-badge">{e.mood}</span>
                <div>
                  <h3>{e.title}</h3>
                  <span className="muted small">
                    {new Date(e.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    {e.minutes ? ` · ${e.minutes} min` : ''}
                  </span>
                </div>
              </div>
              {e.notes && <p className="entry-notes">{e.notes}</p>}
              <div className="row left">
                <button className="btn subtle" onClick={() => startEdit(e)}>
                  Edit
                </button>
                <button className="btn danger subtle" onClick={() => remove(e.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
