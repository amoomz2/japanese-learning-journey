import { useRef, useState } from 'react'
import { useProgress } from '../state/progress.jsx'
import { lastBackupDate, parseBackup, saveBackup, summarize } from './backup.js'

const STALE_DAYS = 14

function describe(s) {
  return `${s.items} practised items, ${s.written} written characters, ${s.read} reading, ${s.listened} listening and ${s.spoken} speaking items, ${s.days} study days, ${s.quizzes} quizzes, ${s.entries} log entries`
}

export default function BackupCard() {
  const { data, replaceAll } = useProgress()
  const fileInput = useRef(null)
  const [lastBackup, setLastBackup] = useState(lastBackupDate)
  const [message, setMessage] = useState(null)

  const current = summarize(data)
  const hasData = current.items + current.entries + current.quizzes + current.written + current.read + current.listened + current.spoken > 0
  const daysSince = lastBackup ? Math.floor((Date.now() - lastBackup.getTime()) / 86400000) : null
  const needsBackup = hasData && (daysSince === null || daysSince >= STALE_DAYS)

  const onExport = async () => {
    setMessage(null)
    try {
      const result = await saveBackup(data)
      if (result === 'cancelled') return
      setLastBackup(lastBackupDate())
      setMessage({ type: 'ok', text: result === 'shared' ? 'Backup ready. Keep it somewhere safe, like Files or iCloud Drive.' : 'Backup file downloaded.' })
    } catch {
      setMessage({ type: 'error', text: "Couldn't create the backup file." })
    }
  }

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow choosing the same file again
    if (!file) return
    setMessage(null)
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('This file is too large to be a backup.')
      let json
      try {
        json = JSON.parse(await file.text())
      } catch {
        throw new Error("This file isn't a Japanese Learning Journey backup.")
      }
      const backup = parseBackup(json)
      const incoming = summarize(backup.data)
      const when = backup.exportedAt ? new Date(backup.exportedAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'an unknown date'
      const ok = window.confirm(
        `Restore the backup from ${when}?\n\nBackup: ${describe(incoming)}.\nThis device now: ${describe(current)}.\n\nEverything on this device will be replaced by the backup.`,
      )
      if (!ok) return
      replaceAll(backup.data)
      setMessage({ type: 'ok', text: `Restored the backup from ${when}.` })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  return (
    <div className="card">
      <h2>Backup</h2>
      <p className="muted">
        Your progress and study log live only on this device. Save a backup file to keep them safe, or to move them to another phone or computer.
      </p>
      <p className={needsBackup ? 'backup-warning' : 'muted small'}>
        {lastBackup
          ? `Last backup: ${lastBackup.toLocaleDateString(undefined, { dateStyle: 'medium' })}${daysSince >= 1 ? ` (${daysSince} day${daysSince === 1 ? '' : 's'} ago)` : ''}`
          : 'No backup yet.'}
        {needsBackup && ' Time to save a fresh one.'}
      </p>
      <div className="row left">
        <button className="btn primary" onClick={onExport} disabled={!hasData}>
          Save backup
        </button>
        <button className="btn" onClick={() => fileInput.current?.click()}>
          Restore from file
        </button>
        <input ref={fileInput} type="file" accept="application/json,.json" onChange={onFile} hidden />
      </div>
      {message && (
        <p className={message.type === 'error' ? 'backup-error' : 'backup-ok'} role="status">
          {message.text}
        </p>
      )}
    </div>
  )
}
