import { useMemo } from 'react'
import { BOX, strokeMeta } from './geometry.js'

// Draws a character from KanjiVG stroke paths on a practice grid.
// `styleFor(i)` returns 'done' | 'current' | 'todo' | 'faint' | 'hidden' for each stroke.
export default function StrokeSvg({ strokes, styleFor = () => 'done', arrowFor = null, numbers = false, animate = null, grid = true, className = '' }) {
  const meta = useMemo(() => strokes.map(strokeMeta), [strokes])

  return (
    <svg viewBox={`0 0 ${BOX} ${BOX}`} className={`stroke-svg ${className}`} aria-hidden="true">
      {grid && (
        <g className="grid">
          <rect x="0.5" y="0.5" width={BOX - 1} height={BOX - 1} />
          <line x1={BOX / 2} y1="0" x2={BOX / 2} y2={BOX} />
          <line x1="0" y1={BOX / 2} x2={BOX} y2={BOX / 2} />
        </g>
      )}
      {strokes.map((d, i) => {
        const style = styleFor(i)
        if (style === 'hidden') return null
        const anim = animate && animate.index === i
        return (
          <path
            key={anim ? `a${i}-${animate.run}` : i}
            d={d}
            className={`stroke ${style} ${anim ? 'drawing' : ''}`}
            style={anim ? { strokeDasharray: meta[i].len, strokeDashoffset: meta[i].len, animationDuration: `${animate.duration}ms` } : undefined}
          />
        )
      })}
      {numbers &&
        strokes.map((_, i) =>
          styleFor(i) === 'hidden' ? null : (
            <text key={`n${i}`} x={Math.max(1, meta[i].start.x - 4)} y={Math.max(6, meta[i].start.y - 2)} className="stroke-number">
              {i + 1}
            </text>
          ),
        )}
      {arrowFor !== null && meta[arrowFor] && (
        <g className="stroke-arrow">
          <circle cx={meta[arrowFor].start.x} cy={meta[arrowFor].start.y} r="3.2" />
          <path
            d="M-4,-3.5 L4,0 L-4,3.5 Z"
            transform={`translate(${meta[arrowFor].arrow.x} ${meta[arrowFor].arrow.y}) rotate(${meta[arrowFor].arrow.angle})`}
          />
        </g>
      )}
    </svg>
  )
}
