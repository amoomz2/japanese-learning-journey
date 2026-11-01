import { useEffect, useRef, useState } from 'react'
import CoachSettings from '../ai/CoachSettings.jsx'
import { SCENARIOS, conversationSystem, loadSettings, streamCoach } from '../ai/coach.js'
import { useOnline } from '../pwa/offline.js'
import { canSpeak, speak } from '../utils/speech.js'

const START = 'Please begin the role-play.'

// Reads only the Japanese parts of a reply aloud.
function speakJapanese(text) {
  const parts = text
    .split('\n')
    .filter((line) => !line.startsWith('💡') && !line.startsWith('✏️') && !line.startsWith('✅'))
    .join(' ')
    .match(/[぀-ヿ一-龯！-？、。ー〜]+/g)
  if (parts) speak(parts.join(' '))
}

export default function Coach() {
  const [settings, setSettings] = useState(loadSettings)
  const [showSettings, setShowSettings] = useState(false)
  const [scenario, setScenario] = useState(null)
  const online = useOnline()

  const configured = Boolean(settings.apiKey)

  return (
    <section>
      <header className="page-header">
        <h1>先生 AI Coach</h1>
        <p className="muted">Practise real conversations with an AI partner who corrects you as you go.</p>
      </header>

      {!online && <p className="card muted">You're offline. The AI Coach needs internet; kana, vocabulary and practice still work.</p>}

      {(!configured || showSettings) && <CoachSettings settings={settings} onChange={setSettings} onClose={configured ? () => setShowSettings(false) : null} />}

      {configured && !showSettings && (
        <>
          {scenario ? (
            <Conversation key={scenario.id} scenario={scenario} settings={settings} online={online} onExit={() => setScenario(null)} />
          ) : (
            <div className="card">
              <div className="card-head">
                <h2>Conversation practice</h2>
                <button className="btn subtle" onClick={() => setShowSettings(true)}>
                  ⚙️ Settings
                </button>
              </div>
              <p className="muted">Pick a situation. Reply in kana, romaji or English; the coach shows you the natural Japanese.</p>
              <div className="feature-grid">
                {SCENARIOS.map((s) => (
                  <button key={s.id} className="card feature" onClick={() => setScenario(s)} disabled={!online}>
                    <span className="feature-icon">{s.icon}</span>
                    <strong>{s.title}</strong>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function Conversation({ scenario, settings, online, onExit }) {
  // history: what is sent to Claude (assistant turns kept exactly as returned)
  // turns: what is shown on screen
  const [history, setHistory] = useState([])
  const [turns, setTurns] = useState([])
  const [streaming, setStreaming] = useState(null)
  const [input, setInput] = useState('')
  const [error, setError] = useState(null)
  const abortRef = useRef(null)
  const endRef = useRef(null)
  const busy = streaming !== null

  const send = async (text, prior = history, shown = true) => {
    const nextHistory = [...prior, { role: 'user', content: text }]
    setHistory(nextHistory)
    if (shown) {
      setTurns((t) => [...t, { role: 'user', text }])
      setInput('')
    }
    setError(null)
    setStreaming('')
    const controller = new AbortController()
    abortRef.current = controller
    let reply = ''
    try {
      const content = await streamCoach({
        settings,
        system: conversationSystem(scenario),
        messages: nextHistory,
        signal: controller.signal,
        onText: (t) => {
          reply += t
          setStreaming(reply)
        },
      })
      setHistory([...nextHistory, { role: 'assistant', content }])
      setTurns((t) => [...t, { role: 'assistant', text: reply }])
    } catch (err) {
      // The failed message never got an answer: take it back out so it can be retried.
      setHistory(prior)
      if (shown) {
        setTurns((t) => t.slice(0, -1))
        setInput(text)
      }
      if (err.code !== 'aborted') setError({ message: err.message, retry: () => send(text, prior, shown) })
    } finally {
      // Only clean up if a newer request hasn't started in the meantime.
      if (abortRef.current === controller) {
        setStreaming(null)
        abortRef.current = null
      }
    }
  }

  useEffect(() => {
    send(START, [], false)
    return () => abortRef.current?.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [turns, streaming])

  const submit = (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    send(text)
  }

  return (
    <div className="card chat">
      <div className="card-head">
        <h2>
          {scenario.icon} {scenario.title}
        </h2>
        <button className="btn subtle" onClick={onExit}>
          ← Situations
        </button>
      </div>

      <div className="chat-log" aria-live="polite">
        {turns.map((t, i) => (
          <div key={i} className={`bubble ${t.role}`}>
            <p>{t.text}</p>
            {t.role === 'assistant' && canSpeak && (
              <button className="btn subtle listen" onClick={() => speakJapanese(t.text)} aria-label="Listen to the Japanese">
                🔊
              </button>
            )}
          </div>
        ))}
        {busy && (
          <div className="bubble assistant">
            <p>{streaming || <span className="typing">…</span>}</p>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && (
        <p className="backup-error" role="alert">
          {error.message}{' '}
          {error.retry && (
            <button className="btn subtle" onClick={error.retry}>
              Try again
            </button>
          )}
        </p>
      )}

      <form className="chat-input" onSubmit={submit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={online ? 'Type in kana, romaji or English…' : 'Offline'}
          disabled={!online}
          aria-label="Your reply"
          lang="ja"
        />
        {busy ? (
          <button type="button" className="btn" onClick={() => abortRef.current?.abort()}>
            Stop
          </button>
        ) : (
          <button className="btn primary" type="submit" disabled={!input.trim() || !online}>
            Send
          </button>
        )}
      </form>
    </div>
  )
}
