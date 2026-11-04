// Native textbook audio: one compressed file per dialogue, with each line's start/end time.
// Files live in public/audio/book1/ and are cached on demand ("Download for offline").
import index from '../data/audioIndex.json'

export const AUDIO_CACHE = 'jlj-audio'
export const SPEEDS = [0.75, 1, 1.25]

export function audioFor(dialogueId) {
  const entry = index.dialogues[dialogueId]
  return entry ? { ...entry, url: `./audio/book1/${entry.file}` } : null
}

let player = null
let stopTimer = null

function getPlayer() {
  if (!player) {
    player = new Audio()
    player.preload = 'auto'
  }
  return player
}

export function stopAudio() {
  if (stopTimer) cancelAnimationFrame(stopTimer)
  stopTimer = null
  if (player) player.pause()
}

// Plays [start, end] seconds of a file. Resolves when that part has finished (or was stopped).
export function playClip(url, start = 0, end = null, rate = 1) {
  stopAudio()
  const audio = getPlayer()
  return new Promise((resolve, reject) => {
    const begin = () => {
      audio.currentTime = start
      audio.playbackRate = rate
      if ('preservesPitch' in audio) audio.preservesPitch = true
      audio.play().then(() => {
        const tick = () => {
          if (audio.paused) return resolve()
          if (end !== null && audio.currentTime >= end) {
            audio.pause()
            return resolve()
          }
          stopTimer = requestAnimationFrame(tick)
        }
        stopTimer = requestAnimationFrame(tick)
      }, reject)
    }
    if (!audio.src.endsWith(url.replace('./', '/'))) {
      audio.src = url
      audio.addEventListener('loadedmetadata', begin, { once: true })
      audio.addEventListener('error', () => reject(new Error('Audio could not be loaded.')), { once: true })
      audio.load()
    } else begin()
  })
}

// --- Offline downloads (per lesson) ---
const absolute = (url) => new URL(url, window.location.href).href

export async function isCached(urls) {
  if (!('caches' in window)) return false
  const cache = await caches.open(AUDIO_CACHE)
  const hits = await Promise.all(urls.map((u) => cache.match(absolute(u))))
  return hits.every(Boolean)
}

export async function downloadAudio(urls, onProgress) {
  const cache = await caches.open(AUDIO_CACHE)
  let done = 0
  for (const u of urls) {
    const url = absolute(u)
    if (!(await cache.match(url))) {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Download failed (${res.status})`)
      await cache.put(url, res)
    }
    onProgress?.(++done, urls.length)
  }
}

export async function removeAudio(urls) {
  const cache = await caches.open(AUDIO_CACHE)
  await Promise.all(urls.map((u) => cache.delete(absolute(u))))
}
