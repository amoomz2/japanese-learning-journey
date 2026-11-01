import { useEffect, useState } from 'react'
import Home from './pages/Home.jsx'
import KanaChart from './pages/KanaChart.jsx'
import Practice from './pages/Practice.jsx'
import Progress from './pages/Progress.jsx'
import Journal from './pages/Journal.jsx'

const PAGES = {
  home: { label: 'Home', component: Home },
  kana: { label: 'Kana', component: KanaChart },
  practice: { label: 'Practice', component: Practice },
  progress: { label: 'Progress', component: Progress },
  journal: { label: 'Study Log', component: Journal },
}

// Hash routing keeps deep links working on static hosts like GitHub Pages.
function currentPage() {
  const key = window.location.hash.replace('#/', '')
  return PAGES[key] ? key : 'home'
}

export default function App() {
  const [page, setPage] = useState(currentPage)

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
      <nav className="nav">
        <a href="#/home" className="brand">
          🌸 <span>日本語 Journey</span>
        </a>
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
      <footer className="footer muted small">がんばって! · Progress is stored in your browser.</footer>
    </div>
  )
}
