import { useEffect, useId, useRef, useState } from 'react'

// Site navigation. Desktop: one row of links in three groups. Tablet/phone: a Menu button that
// opens a grouped panel. `pages` is App's page table; each entry may have `group` and `icon`.
const GROUPS = [
  ['learn', 'Learn'],
  ['skills', 'Four skills'],
  ['you', 'Your journey'],
]

export default function NavBar({ pages, current, offline }) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef(null)
  const panelRef = useRef(null)
  const panelId = useId()

  const items = Object.entries(pages).filter(([, p]) => p.group)
  const grouped = GROUPS.map(([key, title]) => ({ key, title, items: items.filter(([, p]) => p.group === key) }))
  const currentLabel = pages[current]?.label

  // Close when the page changes.
  useEffect(() => setOpen(false), [current])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    // Move focus into the panel, on the current page if it's listed.
    const target = panelRef.current?.querySelector('[aria-current="page"]') || panelRef.current?.querySelector('a')
    target?.focus()
    document.addEventListener('keydown', onKey)
    document.body.classList.add('menu-open')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('menu-open')
    }
  }, [open])

  const link = ([key, p], variant) => (
    <a key={key} href={`#/${key}`} className={`nav-link ${variant} ${current === key ? 'active' : ''}`} aria-current={current === key ? 'page' : undefined} onClick={() => setOpen(false)}>
      {variant === 'menu' && (
        <span className="nav-icon" aria-hidden="true" lang="ja">
          {p.icon}
        </span>
      )}
      <span className="nav-label">{p.label}</span>
    </a>
  )

  return (
    <header className="site-header">
      <nav className="nav" aria-label="Main">
        <div className="nav-brand">
          <a href="#/home" className="brand" aria-current={current === 'home' ? 'page' : undefined}>
            <span aria-hidden="true">🌸</span> <span>日本語 Journey</span>
          </a>
          {offline && (
            <span className="offline-badge" role="status">
              Offline
            </span>
          )}
        </div>

        <ul className="nav-row">
          {grouped.map((g, gi) => (
            <li key={g.key} className="nav-group">
              {gi > 0 && <span className="nav-divider" aria-hidden="true" />}
              <ul aria-label={g.title}>
                {g.items.map((item) => (
                  <li key={item[0]}>{link(item, 'topnav')}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <button
          ref={buttonRef}
          type="button"
          className={`menu-button ${open ? 'open' : ''}`}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
        >
          {currentLabel && current !== 'home' && <span className="menu-current">{currentLabel}</span>}
          <span className="menu-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="menu-text">{open ? 'Close' : 'Menu'}</span>
        </button>
      </nav>

      <div className={`menu-backdrop ${open ? 'open' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <div id={panelId} ref={panelRef} className={`menu-panel ${open ? 'open' : ''}`} hidden={!open}>
        <a href="#/home" className={`nav-link menu home-link ${current === 'home' ? 'active' : ''}`} aria-current={current === 'home' ? 'page' : undefined} onClick={() => setOpen(false)}>
          <span className="nav-icon" aria-hidden="true">
            🌸
          </span>
          <span className="nav-label">Home</span>
        </a>
        {grouped.map((g) => (
          <section key={g.key} className="menu-group" aria-label={g.title}>
            <h2 className="menu-heading">{g.title}</h2>
            <ul>
              {g.items.map((item) => (
                <li key={item[0]}>{link(item, 'menu')}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </header>
  )
}
