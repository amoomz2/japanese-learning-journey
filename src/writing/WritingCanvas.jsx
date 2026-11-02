import { useEffect, useRef } from 'react'
import StrokeSvg from './StrokeSvg.jsx'
import { BOX } from './geometry.js'

const INK = { default: null, good: '#2f9e6a', close: '#d9a53f', off: '#c8443a' }

// Square writing pad. Strokes are stored in KanjiVG's 109×109 units so they can be
// compared with the reference directly. Works with finger, stylus and mouse (Pointer Events);
// `touch-action: none` stops the page from scrolling while writing.
export default function WritingCanvas({ strokes, onStroke, guide = null, guideStyle, arrowFor = null, inkColors = null, disabled = false }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const drawing = useRef(null) // { pointerId, pts }
  const sizeRef = useRef(300)

  const inkColor = () => getComputedStyle(wrapRef.current).getPropertyValue('--text').trim() || '#2b2125'

  const redraw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const scale = (sizeRef.current / BOX) * dpr
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(scale, 0, 0, scale, 0, 0)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 5
    const all = drawing.current ? [...strokes, drawing.current.pts] : strokes
    all.forEach((pts, i) => {
      ctx.strokeStyle = (inkColors && INK[inkColors[i]]) || inkColor()
      ctx.beginPath()
      pts.forEach((p, j) => (j ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
      if (pts.length === 1) ctx.lineTo(pts[0].x + 0.01, pts[0].y)
      ctx.stroke()
    })
  }

  // Keep the canvas sharp at any size / pixel ratio.
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current
      const size = wrapRef.current.clientWidth
      const dpr = window.devicePixelRatio || 1
      sizeRef.current = size
      canvas.width = Math.round(size * dpr)
      canvas.height = Math.round(size * dpr)
      redraw()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(redraw)

  const toBox = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: ((e.clientX - rect.left) / rect.width) * BOX, y: ((e.clientY - rect.top) / rect.height) * BOX }
  }

  const onPointerDown = (e) => {
    if (disabled || (e.pointerType === 'mouse' && e.button !== 0)) return
    if (drawing.current) {
      // A second finger while drawing is ignored; a stroke whose end we never heard about
      // (e.g. the system interrupted the touch) is finished before starting the new one.
      if (!e.isPrimary) return
      const stale = drawing.current
      drawing.current = null
      onStroke(stale.pts)
    }
    e.preventDefault()
    canvasRef.current.setPointerCapture(e.pointerId)
    drawing.current = { pointerId: e.pointerId, pts: [toBox(e)] }
    redraw()
  }

  const onPointerMove = (e) => {
    const cur = drawing.current
    if (!cur || e.pointerId !== cur.pointerId) return
    e.preventDefault()
    const events = e.nativeEvent.getCoalescedEvents?.() || [e.nativeEvent]
    for (const ev of events) {
      const p = toBox(ev)
      const last = cur.pts[cur.pts.length - 1]
      if (Math.hypot(p.x - last.x, p.y - last.y) > 0.4) cur.pts.push(p)
    }
    redraw()
  }

  const finish = (e) => {
    const cur = drawing.current
    if (!cur || e.pointerId !== cur.pointerId) return
    drawing.current = null
    onStroke(cur.pts)
  }

  return (
    <div className="writing-pad" ref={wrapRef}>
      {guide && <StrokeSvg strokes={guide} styleFor={guideStyle} arrowFor={arrowFor} className="pad-guide" />}
      {!guide && (
        <svg viewBox={`0 0 ${BOX} ${BOX}`} className="stroke-svg pad-guide" aria-hidden="true">
          <g className="grid">
            <rect x="0.5" y="0.5" width={BOX - 1} height={BOX - 1} />
            <line x1={BOX / 2} y1="0" x2={BOX / 2} y2={BOX} />
            <line x1="0" y1={BOX / 2} x2={BOX} y2={BOX / 2} />
          </g>
        </svg>
      )}
      <canvas
        ref={canvasRef}
        className="pad-canvas"
        aria-label="Writing area. Draw the character here."
        role="img"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
        onLostPointerCapture={finish}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  )
}
