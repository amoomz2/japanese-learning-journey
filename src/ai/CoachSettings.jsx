import { useState } from 'react'
import { MODELS, clearSettings, looksLikeKey, saveSettings } from './coach.js'

export default function CoachSettings({ settings, onChange, onClose }) {
  const [key, setKey] = useState('')
  const [error, setError] = useState(null)
  const hasKey = Boolean(settings.apiKey)

  const saveKey = (e) => {
    e.preventDefault()
    const trimmed = key.trim()
    if (!looksLikeKey(trimmed)) {
      setError('That doesn\'t look like a Claude API key. It should start with "sk-ant-".')
      return
    }
    const next = { ...settings, apiKey: trimmed }
    saveSettings(next)
    onChange(next)
    setKey('')
    setError(null)
    onClose?.()
  }

  const setModel = (model) => {
    const next = { ...settings, model }
    if (hasKey) saveSettings(next)
    onChange(next)
  }

  const removeKey = () => {
    if (!window.confirm('Remove your API key from this device?')) return
    clearSettings()
    onChange({ apiKey: '', model: settings.model })
  }

  return (
    <div className="card form">
      <h2>{hasKey ? 'AI Coach settings' : 'Set up the AI Coach'}</h2>

      {!hasKey && (
        <ol className="setup-steps">
          <li>
            Create an account at{' '}
            <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">
              console.anthropic.com
            </a>{' '}
            and add a little credit (a few dollars lasts a long time).
          </li>
          <li>Go to <strong>API Keys → Create Key</strong> and copy it.</li>
          <li>Paste it below. Tip: set a monthly spend limit in the Console so you're never surprised.</li>
        </ol>
      )}

      {hasKey ? (
        <div className="row left">
          <span className="muted">
            API key saved on this device (ending …{settings.apiKey.slice(-4)})
          </span>
          <button type="button" className="btn danger subtle" onClick={removeKey}>
            Remove key
          </button>
        </div>
      ) : (
        <form onSubmit={saveKey} className="form">
          <input
            type="password"
            placeholder="sk-ant-..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Claude API key"
          />
          {error && <p className="backup-error">{error}</p>}
          <div className="row left">
            <button className="btn primary" type="submit">
              Save key
            </button>
          </div>
        </form>
      )}

      <fieldset className="model-choice">
        <legend className="muted small">Model</legend>
        {MODELS.map((m) => (
          <label key={m.id} className="toggle">
            <input type="radio" name="coach-model" checked={settings.model === m.id} onChange={() => setModel(m.id)} />
            <span>
              {m.label} <span className="muted small">· {m.note}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <p className="muted small">
        Your key stays on this device and is only sent to Anthropic (api.anthropic.com). It is not included in backups. Usage is billed to your
        Anthropic account. The AI Coach needs internet; everything else still works offline.
      </p>
      {hasKey && onClose && (
        <div className="row left">
          <button type="button" className="btn" onClick={onClose}>
            Done
          </button>
        </div>
      )}
    </div>
  )
}
