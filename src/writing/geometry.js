// Geometry helpers in KanjiVG's 109×109 coordinate space.
export const BOX = 109

let measurer = null
function measurePath(d) {
  if (!measurer) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '0')
    svg.setAttribute('height', '0')
    svg.style.position = 'absolute'
    svg.style.visibility = 'hidden'
    measurer = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    svg.appendChild(measurer)
    document.body.appendChild(svg)
  }
  measurer.setAttribute('d', d)
  return measurer
}

const sampleCache = new Map()

// Points evenly spaced along an SVG path.
export function samplePath(d, n = 32) {
  const key = `${n}:${d}`
  if (sampleCache.has(key)) return sampleCache.get(key)
  const path = measurePath(d)
  const len = path.getTotalLength()
  const pts = []
  for (let i = 0; i < n; i++) {
    const p = path.getPointAtLength((len * i) / (n - 1))
    pts.push({ x: p.x, y: p.y })
  }
  const result = { len, pts }
  sampleCache.set(key, result)
  return result
}

// Start point, length and arrow position/angle for drawing stroke-direction hints.
export function strokeMeta(d) {
  const { len, pts } = samplePath(d, 32)
  const at = (t) => pts[Math.min(pts.length - 1, Math.round(t * (pts.length - 1)))]
  const a = at(0.35)
  const b = at(0.45)
  return { len, start: pts[0], arrow: { x: a.x, y: a.y, angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI } }
}

export function pathLength(pts) {
  let len = 0
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
  return len
}

// Resample a polyline to n points evenly spaced by arc length.
export function resample(pts, n = 32) {
  if (pts.length === 0) return []
  if (pts.length === 1) return Array.from({ length: n }, () => ({ ...pts[0] }))
  const total = pathLength(pts)
  if (total === 0) return Array.from({ length: n }, () => ({ ...pts[0] }))
  const step = total / (n - 1)
  const out = [{ ...pts[0] }]
  let acc = 0
  let prev = pts[0]
  for (let i = 1; i < pts.length && out.length < n; i++) {
    let cur = pts[i]
    let seg = Math.hypot(cur.x - prev.x, cur.y - prev.y)
    while (acc + seg >= step && out.length < n) {
      const t = (step - acc) / seg
      const p = { x: prev.x + t * (cur.x - prev.x), y: prev.y + t * (cur.y - prev.y) }
      out.push(p)
      prev = p
      seg = Math.hypot(cur.x - prev.x, cur.y - prev.y)
      acc = 0
    }
    acc += seg
    prev = cur
  }
  while (out.length < n) out.push({ ...pts[pts.length - 1] })
  return out
}

export function bbox(strokes) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const s of strokes) for (const p of s) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 }
}

export const pointsToPath = (pts) =>
  pts.length ? `M${pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('L')}` : ''
