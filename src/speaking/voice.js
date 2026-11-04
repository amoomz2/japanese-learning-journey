// Microphone helpers: speech recognition (Web Speech API) and recording yourself (MediaRecorder).
const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null

export const canRecognize = Boolean(Recognition)
export const canRecord = typeof window !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && typeof window.MediaRecorder !== 'undefined'

// Listens for one Japanese utterance. Resolves with the recognised alternatives (best first).
// Chrome sends audio to Google's servers and Safari to Apple's (or the device), so this usually
// needs an internet connection.
export function recognizeOnce({ timeoutMs = 8000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!Recognition) return reject(new Error('Speech recognition is not supported in this browser.'))
    const rec = new Recognition()
    rec.lang = 'ja-JP'
    rec.interimResults = false
    rec.maxAlternatives = 3
    rec.continuous = false
    let done = false
    const finish = (fn) => {
      if (done) return
      done = true
      clearTimeout(timer)
      fn()
    }
    const timer = setTimeout(() => {
      try {
        rec.stop()
      } catch {
        // ignore
      }
    }, timeoutMs)
    rec.onresult = (e) => {
      const alts = [...e.results[0]].map((a) => a.transcript)
      finish(() => resolve(alts))
    }
    rec.onerror = (e) => {
      const msg =
        e.error === 'not-allowed' || e.error === 'service-not-allowed'
          ? 'Microphone or speech recognition permission was denied.'
          : e.error === 'network'
            ? 'Speech recognition needs an internet connection.'
            : e.error === 'no-speech'
              ? 'No speech was heard. Try again a little louder.'
              : `Speech recognition error (${e.error}).`
      finish(() => reject(new Error(msg)))
    }
    rec.onend = () => finish(() => reject(new Error('No speech was heard. Try again a little louder.')))
    rec.start()
  })
}

// Records the learner for up to `maxMs`. Returns { stop(): Promise<url> }.
export async function startRecording(maxMs = 8000) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const rec = new MediaRecorder(stream)
  const chunks = []
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
  const stopped = new Promise((resolve) => {
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop())
      resolve(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/mp4' })))
    }
  })
  rec.start()
  const timer = setTimeout(() => rec.state === 'recording' && rec.stop(), maxMs)
  return {
    stop: () => {
      clearTimeout(timer)
      if (rec.state === 'recording') rec.stop()
      return stopped
    },
    done: stopped,
  }
}
