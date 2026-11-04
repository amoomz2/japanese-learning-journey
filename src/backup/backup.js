// Backup files are plain JSON so they can be kept in iCloud Drive, Files, email, etc.
const APP_ID = 'japanese-learning-journey'
const FORMAT_VERSION = 1
const LAST_BACKUP_KEY = 'jlj-last-backup'

export function makeBackup(data) {
  return { app: APP_ID, version: FORMAT_VERSION, exportedAt: new Date().toISOString(), data }
}

export function backupFileName(date = new Date()) {
  return `japanese-journey-backup-${date.toISOString().slice(0, 10)}.json`
}

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const isCount = (v) => Number.isInteger(v) && v >= 0
const isDay = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)
const isDate = (v) => typeof v === 'string' && !Number.isNaN(Date.parse(v))

// Validates a parsed backup and returns clean data, or throws an Error with a user-facing message.
// Unknown fields are dropped and malformed entries skipped rather than trusted.
export function parseBackup(json) {
  if (!isObject(json) || json.app !== APP_ID) throw new Error("This file isn't a Japanese Learning Journey backup.")
  if (json.version > FORMAT_VERSION) throw new Error('This backup is from a newer version of the app. Update the app and try again.')
  const d = json.data
  if (!isObject(d)) throw new Error('This backup file is damaged.')

  const kana = {}
  if (isObject(d.kana)) {
    for (const [id, s] of Object.entries(d.kana)) {
      if (typeof id === 'string' && isObject(s) && isCount(s.correct) && isCount(s.wrong)) kana[id] = { correct: s.correct, wrong: s.wrong }
    }
  }
  const activeDays = Array.isArray(d.activeDays) ? [...new Set(d.activeDays.filter(isDay))].sort() : []
  const quizHistory = Array.isArray(d.quizHistory)
    ? d.quizHistory.filter((q) => isObject(q) && isCount(q.score) && isCount(q.total) && isDate(q.date)).map(({ score, total, date }) => ({ score, total, date })).slice(0, 50)
    : []
  const journal = Array.isArray(d.journal)
    ? d.journal
        .filter((e) => isObject(e) && typeof e.title === 'string' && isDate(e.date))
        .map((e) => ({
          id: typeof e.id === 'string' ? e.id : crypto.randomUUID(),
          date: e.date,
          title: e.title.slice(0, 500),
          notes: typeof e.notes === 'string' ? e.notes.slice(0, 20000) : '',
          minutes: isCount(e.minutes) ? Math.min(e.minutes, 1440) : 0,
          mood: typeof e.mood === 'string' ? e.mood.slice(0, 8) : '😊',
        }))
    : []

  const w = isObject(d.writing) ? d.writing : {}
  const writingChars = {}
  if (isObject(w.chars)) {
    for (const [ch, s] of Object.entries(w.chars)) {
      if (typeof ch === 'string' && ch.length <= 2 && isObject(s) && isCount(s.practiced) && isCount(s.tests) && isCount(s.passed) && isCount(s.best)) {
        writingChars[ch] = { practiced: s.practiced, tests: s.tests, passed: Math.min(s.passed, s.tests), best: Math.min(s.best, 100) }
      }
    }
  }
  const writing = {
    chars: writingChars,
    days: Array.isArray(w.days) ? [...new Set(w.days.filter(isDay))].sort() : [],
    lessons: Array.isArray(w.lessons) ? [...new Set(w.lessons.filter((l) => typeof l === 'string' && /^[a-z]+-[a-z0-9]+$/.test(l)))] : [],
  }

  const r = isObject(d.reading) ? d.reading : {}
  const readingItems = {}
  if (isObject(r.items)) {
    for (const [id, s] of Object.entries(r.items)) {
      if (!/^L\d+-\d+$/.test(id) || !isObject(s) || !isCount(s.reads) || !isCount(s.bestCpm) || !isCount(s.attempts)) continue
      const best = {}
      if (isObject(s.best)) for (const k of ['quiz', 'fill', 'kanji']) if (isCount(s.best[k])) best[k] = Math.min(s.best[k], 100)
      readingItems[id] = { reads: s.reads, bestCpm: Math.min(s.bestCpm, 5000), attempts: s.attempts, best, ...(isCount(s.lastCpm) ? { lastCpm: Math.min(s.lastCpm, 5000) } : {}) }
    }
  }
  const reading = { items: readingItems, days: Array.isArray(r.days) ? [...new Set(r.days.filter(isDay))].sort() : [] }

  return { exportedAt: isDate(json.exportedAt) ? json.exportedAt : null, data: { kana, activeDays, quizHistory, journal, writing, reading } }
}

export function summarize(data) {
  return {
    items: Object.keys(data.kana).length,
    days: data.activeDays.length,
    quizzes: data.quizHistory.length,
    entries: data.journal.length,
    written: Object.keys(data.writing?.chars || {}).length,
    read: Object.keys(data.reading?.items || {}).length,
  }
}

// iPhone home-screen apps can't always download files, so prefer the share sheet
// ("Save to Files", AirDrop, Mail…) and fall back to a normal download.
export async function saveBackup(data) {
  const name = backupFileName()
  const text = JSON.stringify(makeBackup(data), null, 2)
  const file = new File([text], name, { type: 'application/json' })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Japanese Journey backup' })
      markBackedUp()
      return 'shared'
    } catch (e) {
      if (e.name === 'AbortError') return 'cancelled'
      // Fall through to a download if sharing fails for another reason.
    }
  }

  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
  markBackedUp()
  return 'downloaded'
}

function markBackedUp() {
  try {
    localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString())
  } catch {
    // ignore
  }
}

export function lastBackupDate() {
  try {
    const v = localStorage.getItem(LAST_BACKUP_KEY)
    return v ? new Date(v) : null
  } catch {
    return null
  }
}
