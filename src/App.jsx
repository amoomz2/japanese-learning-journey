import { useEffect, useState } from 'react'
import Home from './pages/Home.jsx'
import KanaChart from './pages/KanaChart.jsx'
import Vocabulary from './pages/Vocabulary.jsx'
import Practice from './pages/Practice.jsx'
import Progress from './pages/Progress.jsx'
import Journal from './pages/Journal.jsx'
import Coach from './pages/Coach.jsx'
import { applyUpdate, useOfflineState, useOnline } from './pwa/offline.js'

const PAGES = {
  home: { label: 'Home', component: Home },
  kana: { label: 'Kana', component: KanaChart },
  vocab: { label: 'Vocabulary', component: Vocabulary },
  practice: { label: 'Practice', component: Practice },
  coach: { label: 'AI Coach', component: Coach },
  progress: { label: 'Progress', component: Progress },
  journal: { label: 'Study Log', component: Journal },
}

// Hash routing keeps deep links working on static hosts like GitHub Pages.
// Optional query after the page name, e.g. #/practice?deck=vocab.
function currentPage() {
  const key = window.location.hash.replace('#/', '').split('?')[0]
  return PAGES[key] ? key : 'home'
}

export default function App() {
  const [page, setPage] = useState(currentPage)
  const online = useOnline()
  const { needRefresh } = useOfflineState()

  useEffect(() => {
    const onHash = () => {
      setPage(currentPage())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = (key) => {
    window.location.hash = `#/${key}`
  }

  const Page = PAGES[page].component

  return (
    <div className="app">
      {needRefresh && (
        <div className="update-banner" role="status">
          A new version is available.
          <button className="btn subtle" onClick={applyUpdate}>
            Update now
          </button>
        </div>
      )}
      <nav className="nav">
        <div>
          <a href="#/home" className="brand">
            🌸 <span>日本語 Journey</span>
          </a>
          {!online && (
            <span className="offline-badge" role="status">
              Offline
            </span>
          )}
        </div>
        <div className="nav-links">
          {Object.entries(PAGES)
            .filter(([key]) => key !== 'home')
            .map(([key, p]) => (
              <a key={key} href={`#/${key}`} className={page === key ? 'active' : ''} aria-current={page === key ? 'page' : undefined}>
                {p.label}
              </a>
            ))}
        </div>
      </nav>
      <main className="main">
        <Page go={go} />
      </main>
      <footer className="footer muted small">
        <p>がんばって! · Progress is stored in your browser.</p>
        <p className="credit">Developed by Omaima Al Hinai</p>
      </footer>
    </div>
  )
}
