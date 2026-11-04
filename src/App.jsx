import { useEffect, useState } from 'react'
import Home from './pages/Home.jsx'
import KanaChart from './pages/KanaChart.jsx'
import Vocabulary from './pages/Vocabulary.jsx'
import Practice from './pages/Practice.jsx'
import Progress from './pages/Progress.jsx'
import Journal from './pages/Journal.jsx'
import Writing from './pages/Writing.jsx'
import Reading from './pages/Reading.jsx'
import Listening from './pages/Listening.jsx'
import Speaking from './pages/Speaking.jsx'
import Skills from './pages/Skills.jsx'
import NavBar from './components/NavBar.jsx'
import { applyUpdate, useOfflineState, useOnline } from './pwa/offline.js'

// `group` and `icon` place a page in the navigation (see components/NavBar.jsx).
const PAGES = {
  home: { label: 'Home', component: Home },
  kana: { label: 'Kana', component: KanaChart, group: 'learn', icon: 'あ' },
  vocab: { label: 'Vocabulary', component: Vocabulary, group: 'learn', icon: '語' },
  practice: { label: 'Practice', component: Practice, group: 'learn', icon: '練' },
  writing: { label: 'Writing', component: Writing, group: 'skills', icon: '書' },
  reading: { label: 'Reading', component: Reading, group: 'skills', icon: '読' },
  listening: { label: 'Listening', component: Listening, group: 'skills', icon: '聞' },
  speaking: { label: 'Speaking', component: Speaking, group: 'skills', icon: '話' },
  skills: { label: 'Four skills', component: Skills },
  progress: { label: 'Progress', component: Progress, group: 'you', icon: '進' },
  journal: { label: 'Study Log', component: Journal, group: 'you', icon: '記' },
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
      <NavBar pages={PAGES} current={page} offline={!online} />
      <main className="main">
        <Page go={go} />
      </main>
      <footer className="footer muted small">
        <p>がんばって! · Progress is stored in your browser.</p>
        <p className="credit">
          Developed by Omaima Al Hinai · <span lang="ja">開発：オマイマ・アル・ヒナイ</span>
        </p>
      </footer>
    </div>
  )
}
