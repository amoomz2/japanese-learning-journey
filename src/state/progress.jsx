import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'jlj-progress-v1'
const EMPTY = { kana: {}, activeDays: [], journal: [], quizHistory: [] }

// A kana counts as learned after 3+ correct answers with at least 80% accuracy.
export function isLearned(stat) {
  if (!stat) return false
  const total = stat.correct + stat.wrong
  return stat.correct >= 3 && stat.correct / total >= 0.8
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY
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

  const resetProgress = useCallback(() => setData((d) => ({ ...EMPTY, journal: d.journal })), [])

  // Replaces everything with a validated backup (see src/backup/backup.js).
  const replaceAll = useCallback((next) => setData({ ...EMPTY, ...next }), [])

  const value = useMemo(
    () => ({ data, recordAnswer, recordQuiz, addJournal, updateJournal, deleteJournal, resetProgress, replaceAll }),
    [data, recordAnswer, recordQuiz, addJournal, updateJournal, deleteJournal, resetProgress, replaceAll],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  return useContext(ProgressContext)
}
