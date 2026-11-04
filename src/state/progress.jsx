import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'jlj-progress-v1'
const EMPTY_WRITING = { chars: {}, days: [], lessons: [] }
const EMPTY_READING = { items: {}, days: [] }
const EMPTY = { kana: {}, activeDays: [], journal: [], quizHistory: [], writing: EMPTY_WRITING, reading: EMPTY_READING }

// Reading: per dialogue, reads/best speed (characters per minute) and best % per exercise type.
export const READING_EXERCISES = ['quiz', 'fill', 'kanji']

// Writing: a character counts as learned once it has passed a Test-mode check.
export const isWritingLearned = (stat) => Boolean(stat && stat.passed > 0)

// A kana counts as learned after 3+ correct answers with at least 80% accuracy.
export function isLearned(stat) {
  if (!stat) return false
  const total = stat.correct + stat.wrong
  return stat.correct >= 3 && stat.correct / total >= 0.8
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw)
    return { ...EMPTY, ...parsed, writing: { ...EMPTY_WRITING, ...parsed.writing }, reading: { ...EMPTY_READING, ...parsed.reading } }
  } catch {
    return EMPTY
  }
}

export function todayKey(date = new Date()) {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return d.toISOString().slice(0, 10)
}

export function computeStreak(activeDays) {
  const days = new Set(activeDays)
  const cursor = new Date()
  // A streak stays alive until the end of today even if you haven't studied yet.
  if (!days.has(todayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (days.has(todayKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const [data, setData] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Storage may be unavailable (private mode); progress just won't persist.
    }
  }, [data])

  const markActive = (d) => {
    const today = todayKey()
    return d.activeDays.includes(today) ? d.activeDays : [...d.activeDays, today]
  }

  const recordAnswer = useCallback((id, correct) => {
    setData((d) => {
      const prev = d.kana[id] || { correct: 0, wrong: 0 }
      const next = { ...prev, [correct ? 'correct' : 'wrong']: prev[correct ? 'correct' : 'wrong'] + 1 }
      return { ...d, kana: { ...d.kana, [id]: next }, activeDays: markActive(d) }
    })
  }, [])

  const recordQuiz = useCallback((result) => {
    setData((d) => ({
      ...d,
      quizHistory: [{ ...result, date: new Date().toISOString() }, ...d.quizHistory].slice(0, 50),
      activeDays: markActive(d),
    }))
  }, [])

  const addJournal = useCallback((entry) => {
    setData((d) => ({
      ...d,
      journal: [{ id: crypto.randomUUID(), date: new Date().toISOString(), ...entry }, ...d.journal],
      activeDays: markActive(d),
    }))
  }, [])

  const updateJournal = useCallback((id, changes) => {
    setData((d) => ({ ...d, journal: d.journal.map((e) => (e.id === id ? { ...e, ...changes } : e)) }))
  }, [])

  const deleteJournal = useCallback((id) => {
    setData((d) => ({ ...d, journal: d.journal.filter((e) => e.id !== id) }))
  }, [])

  // kind: 'practice' | 'test'. Keeps per-character counts, best score and writing days.
  const recordWriting = useCallback((char, kind, score, passed) => {
    setData((d) => {
      const today = todayKey()
      const prev = d.writing.chars[char] || { practiced: 0, tests: 0, passed: 0, best: 0 }
      const next = {
        practiced: prev.practiced + (kind === 'practice' ? 1 : 0),
        tests: prev.tests + (kind === 'test' ? 1 : 0),
        passed: prev.passed + (kind === 'test' && passed ? 1 : 0),
        best: Math.max(prev.best, score),
      }
      const days = d.writing.days.includes(today) ? d.writing.days : [...d.writing.days, today]
      return { ...d, writing: { ...d.writing, chars: { ...d.writing.chars, [char]: next }, days }, activeDays: markActive(d) }
    })
  }, [])

  // kind: 'read' (value = characters per minute) or an exercise in READING_EXERCISES (value = % correct).
  const recordReading = useCallback((id, kind, value) => {
    setData((d) => {
      const today = todayKey()
      const prev = d.reading.items[id] || { reads: 0, bestCpm: 0, best: {}, attempts: 0 }
      const next =
        kind === 'read'
          ? { ...prev, reads: prev.reads + 1, bestCpm: Math.max(prev.bestCpm, value), lastCpm: value }
          : { ...prev, attempts: prev.attempts + 1, best: { ...prev.best, [kind]: Math.max(prev.best[kind] || 0, value) } }
      const days = d.reading.days.includes(today) ? d.reading.days : [...d.reading.days, today]
      return { ...d, reading: { items: { ...d.reading.items, [id]: next }, days }, activeDays: markActive(d) }
    })
  }, [])

  const completeWritingLesson = useCallback((lessonId) => {
    setData((d) => (d.writing.lessons.includes(lessonId) ? d : { ...d, writing: { ...d.writing, lessons: [...d.writing.lessons, lessonId] } }))
  }, [])

  const resetProgress = useCallback(() => setData((d) => ({ ...EMPTY, journal: d.journal })), [])

  // Replaces everything with a validated backup (see src/backup/backup.js).
  const replaceAll = useCallback((next) => setData({ ...EMPTY, ...next }), [])

  const value = useMemo(
    () => ({ data, recordAnswer, recordQuiz, addJournal, updateJournal, deleteJournal, resetProgress, replaceAll, recordWriting, completeWritingLesson, recordReading }),
    [data, recordAnswer, recordQuiz, addJournal, updateJournal, deleteJournal, resetProgress, replaceAll, recordWriting, completeWritingLesson, recordReading],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  return useContext(ProgressContext)
}
