import { useEffect, useRef, useState } from 'react'
import { loadSettings, mistakesPrompt, streamCoach } from './coach.js'
import { useOnline } from '../pwa/offline.js'

// Shown on the quiz results screen: asks the AI Coach to explain the missed items.
export default function ExplainMistakes({ missed }) {
  const online = useOnline()
  const [text, setText] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [error, setError] = useState(null)
  const abortRef = useRef(null)
  const configured = Boolean(loadSettings().apiKey)

  useEffect(() => () => abortRef.current?.abort(), [])

  const explain = async () => {
    const { system, user } = mistakesPrompt(missed)
    const controller = new AbortController()
    abortRef.current = controller
    setText('')
    setError(null)
    setStatus('loading')
    try {
      await streamCoach({
        settings: loadSettings(),
        system,
        messages: [{ role: 'user', content: user }],
        signal: controller.signal,
        onText: (t) => setText((prev) => prev + t),
      })
      setStatus('done')
    } catch (err) {
      if (err.code === 'aborted') return
      setError(err.message)
      setStatus('error')
    }
  }

  if (!configured) {
    return (
      <p className="muted small">
        ✨ Want these explained with memory tricks? <a href="#/coach">Set up the AI Coach</a>.
      </p>
    )
  }

  return (
    <div className="explain">
      {status === 'idle' && (
        <button className="btn" onClick={explain} disabled={!online}>
          ✨ Explain my mistakes{!online && ' (needs internet)'}
        </button>
      )}
      {(status === 'loading' || status === 'done') && (
        <div className="explain-box">
          <p className="explain-text">{text || <span className="typing">Thinking…</span>}</p>
        </div>
      )}
      {status === 'error' && (
        <p className="backup-error" role="alert">
          {error}{' '}
          <button className="btn subtle" onClick={explain}>
            Try again
          </button>
        </p>
      )}
    </div>
  )
}
