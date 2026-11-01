import { useState } from 'react'
import { enableOffline, isStandalone, offlineSupported, removeOffline, useOfflineState, useOnline, useStorageInfo } from './offline.js'
import { canSpeak } from '../utils/speech.js'

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`
}

export default function OfflineCard() {
  const online = useOnline()
  const { offlineReady } = useOfflineState()
  const [busy, setBusy] = useState(false)
  const [storage, refreshStorage] = useStorageInfo([offlineReady])

  const run = (fn) => async () => {
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
      refreshStorage()
    }
  }

  const keepData = run(async () => {
    await navigator.storage?.persist?.()
  })

  const onRemove = run(async () => {
    if (window.confirm('Remove the offline copy? Your progress and study log stay on this device.')) await removeOffline()
  })

  return (
    <div className="card">
      <h2>Offline &amp; storage</h2>
      <ul className="plain-list">
        <li>
          <span>
            <span className={`status-dot ${online ? 'ok' : 'warn'}`} />
            Connection
          </span>
          <strong>{online ? 'Online' : 'Offline'}</strong>
        </li>
        <li>
          <span>
            <span className={`status-dot ${offlineReady ? 'ok' : ''}`} />
            All lessons saved for offline
          </span>
          <strong>{!offlineSupported ? 'Not supported' : offlineReady ? 'Yes' : 'No'}</strong>
        </li>
        <li>
          <span>
            <span className="status-dot ok" />
            Progress &amp; study log
          </span>
          <strong>Saved on this device</strong>
        </li>
        {storage?.supported && (
          <li>
            <span>
              <span className={`status-dot ${storage.persisted ? 'ok' : 'warn'}`} />
              Protected from automatic cleanup
            </span>
            <strong>{storage.persisted ? 'Yes' : 'No'}</strong>
          </li>
        )}
      </ul>

      {storage?.supported && storage.quota > 0 && (
        <div className="storage-meter">
          <div className="bar" role="progressbar" aria-valuenow={storage.usage} aria-valuemax={storage.quota}>
            <div className="bar-fill" style={{ width: `${Math.max(1, (storage.usage / storage.quota) * 100)}%` }} />
          </div>
          <p className="muted small">
            Using {formatBytes(storage.usage)} of about {formatBytes(storage.quota)} available
          </p>
        </div>
      )}

      <div className="row left">
        {offlineSupported && !offlineReady && (
          <button className="btn primary" onClick={run(enableOffline)} disabled={busy || !online}>
            Save lessons for offline
          </button>
        )}
        {storage?.supported && !storage.persisted && navigator.storage?.persist && (
          <button className="btn" onClick={keepData} disabled={busy}>
            Keep my data
          </button>
        )}
        {offlineReady && (
          <button className="btn danger subtle" onClick={onRemove} disabled={busy}>
            Remove offline copy
          </button>
        )}
      </div>

      <p className="muted small">
        Kana charts, vocabulary, flashcards, quizzes, progress and the study log all work without internet once saved.
        {!isStandalone() && ' Tip: on iPhone, tap Share → Add to Home Screen to use it like an app.'}
        {canSpeak && ' Pronunciation offline needs a Japanese voice on your device (iPhone: Settings → Accessibility → Spoken Content → Voices → Japanese).'}
      </p>
    </div>
  )
}
