// Pronunciation through the browser's built-in speech synthesis (no audio files needed).
let jaVoice = null

function pickVoice() {
  if (!('speechSynthesis' in window)) return null
  jaVoice = window.speechSynthesis.getVoices().find((v) => v.lang?.startsWith('ja')) || null
  return jaVoice
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  pickVoice()
  window.speechSynthesis.onvoiceschanged = pickVoice
}

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

export function speak(text) {
  if (!canSpeak) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'ja-JP'
  u.rate = 0.8
  const voice = jaVoice || pickVoice()
  if (voice) u.voice = voice
  window.speechSynthesis.speak(u)
}
