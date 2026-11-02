import { useEffect, useRef, useState } from 'react'
import StrokeSvg from './StrokeSvg.jsx'
import { strokeMeta } from './geometry.js'

// Animated stroke-order demonstration with replay and step-by-step controls.
export default function StrokeOrder({ strokes, autoPlay = true }) {
  const count = strokes.length
  const [shown, setShown] = useState(autoPlay ? 0 : count) // strokes fully drawn
  const [animating, setAnimating] = useState(null) // { index, duration, run }
  const [playing, setPlaying] = useState(autoPlay)
  const timers = useRef([])
  const run = useRef(0)

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const animateStroke = (i, then) => {
    const duration = Math.max(350, Math.min(1100, strokeMeta(strokes[i]).len * 11))
    run.current += 1
    setAnimating({ index: i, duration, run: run.current })
    timers.current.push(
      setTimeout(() => {
        setShown(i + 1)
        setAnimating(null)
        then?.()
      }, duration + 60),
    )
  }

  const play = () => {
    clearTimers()
    setPlaying(true)
    setShown(0)
    const step = (i) => {
      if (i >= count) {
        setPlaying(false)
        return
      }
      animateStroke(i, () => timers.current.push(setTimeout(() => step(i + 1), 280)))
    }
    timers.current.push(setTimeout(() => step(0), 250))
  }

  const goTo = (n) => {
    clearTimers()
    setPlaying(false)
    if (n > shown && n === shown + 1) {
      setShown(n - 1)
      animateStroke(n - 1)
    } else {
      setAnimating(null)
      setShown(Math.max(0, Math.min(count, n)))
    }
  }

  useEffect(() => {
    if (autoPlay) play()
    else setShown(count)
    return clearTimers
    // Restart whenever the character changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes])

  const current = animating ? animating.index : shown > 0 ? shown - 1 : null
  const styleFor = (i) => {
    if (animating && i === animating.index) return 'current'
    if (i < shown) return i === current && !playing ? 'current' : 'done'
    return 'todo'
  }

  return (
    <div className="stroke-order">
      <StrokeSvg strokes={strokes} styleFor={styleFor} animate={animating} arrowFor={current} numbers={!playing} className="big" />
      <p className="muted small center">
        {playing ? `Drawing stroke ${(animating?.index ?? shown) + 1} of ${count}…` : shown === 0 ? `${count} strokes` : `Stroke ${shown} of ${count}`}
      </p>
      <div className="row">
        <button className="btn" onClick={() => goTo(shown - 1)} disabled={shown === 0} aria-label="Previous stroke">
          ◀
        </button>
        <button className="btn primary" onClick={play}>
          {playing ? 'Restart' : '▶ Replay'}
        </button>
        <button className="btn" onClick={() => goTo(shown + 1)} disabled={shown >= count} aria-label="Next stroke">
          ▶
        </button>
      </div>
    </div>
  )
}
