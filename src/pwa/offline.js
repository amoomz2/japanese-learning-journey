import { useEffect, useState, useSyncExternalStore } from 'react'
import { registerSW } from 'virtual:pwa-register'

// Offline mode (service worker + Cache Storage). On by default; the Progress page can turn it off.
const DISABLED_KEY = 'jlj-offline-disabled'
const supported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator

let state = { needRefresh: false, offlineReady: false }
const listeners = new Set()
const setState = (patch) => {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

let updateSW = null

function isDisabled() {
  try {
    return localStorage.getItem(DISABLED_KEY) === '1'
  } catch {
    return false
  }
}

function register() {
  if (!supported) return
  updateSW = registerSW({
    immediate: true,
    onNeedRefresh: () => setState({ needRefresh: true }),
    onOfflineReady: () => setState({ offlineReady: true }),
    onRegisteredSW: (_url, reg) => {
      if (reg?.active) setState({ offlineReady: true })
      // Check for a new version every hour while the app is open.
      if (reg) setInterval(() => navigator.onLine && reg.update(), 60 * 60 * 1000)
    },
  })
}

export function initOffline() {
  if (!isDisabled()) register()
}

export function applyUpdate() {
  updateSW?.(true)
}

export async function enableOffline() {
  try {
    localStorage.removeItem(DISABLED_KEY)
  } catch {
    // ignore
  }
  register()
}

// Removes the service worker and cached files. Progress and study log are kept.
export async function removeOffline() {
  try {
    localStorage.setItem(DISABLED_KEY, '1')
  } catch {
    // ignore
  }
  if (supported) {
    const regs = await navigator.serviceWorker.getRegistrations()
    await Promise.all(regs.map((r) => r.unregister()))
  }
  if ('caches' in window) {
    const keys = await caches.keys()
    await Promise.all(keys.map((k) => caches.delete(k)))
  }
  setState({ offlineReady: false, needRefresh: false })
}

export function useOfflineState() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
  )
}

export function useOnline() {
  return useSyncExternalStore(
    (l) => {
      window.addEventListener('online', l)
      window.addEventListener('offline', l)
      return () => {
        window.removeEventListener('online', l)
        window.removeEventListener('offline', l)
      }
    },
    () => navigator.onLine,
  )
}

export function useStorageInfo(deps = []) {
  const [info, setInfo] = useState(null)
  const refresh = async () => {
    if (!navigator.storage?.estimate) return setInfo({ supported: false })
    const [estimate, persisted] = await Promise.all([navigator.storage.estimate(), navigator.storage.persisted?.() ?? false])
    setInfo({ supported: true, usage: estimate.usage || 0, quota: estimate.quota || 0, persisted })
  }
  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return [info, refresh]
}

export const offlineSupported = supported
export const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
