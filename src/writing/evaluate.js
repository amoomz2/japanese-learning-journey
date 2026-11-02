// Handwriting check. This is NOT full handwriting recognition: it compares the learner's
// strokes with the known KanjiVG strokes of the expected character, one by one, checking
// stroke count, order, direction and shape/position. It runs entirely on the device.
import { bbox, pathLength, resample, samplePath } from './geometry.js'

const N = 24
const PASS = 65

const meanDist = (a, b) => a.reduce((sum, p, i) => sum + Math.hypot(p.x - b[i].x, p.y - b[i].y), 0) / a.length

// Fit the learner's drawing onto the reference's bounding box (same centre, same size),
// so writing a little smaller, bigger or off-centre isn't punished.
function normalise(user, expected) {
  const u = bbox(user)
  const e = bbox(expected)
  const uSize = Math.max(u.w, u.h, 1)
  const eSize = Math.max(e.w, e.h, 1)
  const s = eSize / uSize
  return user.map((st) => st.map((p) => ({ x: (p.x - u.cx) * s + e.cx, y: (p.y - u.cy) * s + e.cy })))
}

export function expectedPoints(strokes) {
  return strokes.map((d) => samplePath(d, N).pts)
}

// Compare one drawn stroke with one expected stroke (already in the same coordinates).
export function compareStroke(drawn, expected) {
  const u = resample(drawn, N)
  const fwd = meanDist(u, expected)
  const rev = meanDist([...u].reverse(), expected)
  const expectedLen = pathLength(expected)
  const reversed = expectedLen > 14 && rev + 4 < fwd
  const dist = Math.min(fwd, rev)
  const similarity = Math.max(0, Math.min(1, 1 - (dist - 4) / 18))
  return { dist, similarity, reversed }
}

// Live check of a single stroke while practising stroke by stroke (no normalisation:
// the learner is drawing over the guide, so position matters).
export function checkSingleStroke(drawn, expectedD) {
  const r = compareStroke(drawn, samplePath(expectedD, N).pts)
  if (r.reversed) return { ok: false, message: 'Right shape, but drawn in the wrong direction. Follow the arrow.' }
  if (r.similarity >= 0.55) return { ok: true, message: 'Good stroke!' }
  if (r.similarity >= 0.3) return { ok: true, message: 'Close. Try to follow the guide a little more closely.' }
  return { ok: false, message: "That stroke doesn't match the highlighted one. Undo and try again." }
}

export function evaluate(strokesD, drawn) {
  const expected = expectedPoints(strokesD)
  const n = expected.length
  const messages = []

  if (drawn.length === 0) return { score: 0, passed: false, perStroke: [], messages: ['Draw the character first.'] }
  const size = bbox(drawn)
  if (Math.max(size.w, size.h) < 12) {
    return { score: 0, passed: false, perStroke: drawn.map(() => 'off'), messages: ['Your drawing is very small. Use more of the box.'] }
  }

  const user = normalise(drawn, expected)
  const pairs = Math.min(n, user.length)
  const perStroke = []
  let simTotal = 0
  let reversedCount = 0
  let orderCount = 0
  const issues = []

  for (let i = 0; i < pairs; i++) {
    const r = compareStroke(user[i], expected[i])
    simTotal += r.similarity
    // Would this stroke fit another expected stroke much better? Then it's probably out of order.
    let best = i
    let bestDist = r.dist
    for (let j = 0; j < n; j++) {
      if (j === i) continue
      const d = compareStroke(user[i], expected[j]).dist
      if (d < bestDist) {
        best = j
        bestDist = d
      }
    }
    const outOfOrder = best !== i && bestDist < 9 && bestDist < r.dist * 0.6
    if (outOfOrder) {
      orderCount++
      issues.push(`Stroke ${i + 1} looks like stroke ${best + 1}. Check the stroke order.`)
      perStroke.push('close')
    } else if (r.reversed) {
      reversedCount++
      issues.push(`Stroke ${i + 1} is drawn in the wrong direction.`)
      perStroke.push('close')
    } else if (r.similarity >= 0.55) {
      perStroke.push('good')
    } else if (r.similarity >= 0.3) {
      perStroke.push('close')
      issues.push(`Stroke ${i + 1} is a little off in shape or position.`)
    } else {
      perStroke.push('off')
      issues.push(`Stroke ${i + 1} doesn't match the expected stroke.`)
    }
  }
  for (let i = pairs; i < user.length; i++) perStroke.push('off')

  let score = (simTotal / Math.max(n, user.length)) * 100
  score -= reversedCount * 8 + orderCount * 6
  if (user.length !== n) {
    messages.push(
      user.length < n
        ? `This character has ${n} strokes; you drew ${user.length}. Some strokes may be joined or missing.`
        : `This character has ${n} strokes; you drew ${user.length}. Some strokes may be split or extra.`,
    )
    score = Math.min(score, PASS - 1)
  }
  // Stroke direction is part of writing a character correctly, so a reversed stroke can't pass.
  if (reversedCount > 0) score = Math.min(score, PASS - 1)
  score = Math.max(0, Math.min(100, Math.round(score)))
  const passed = score >= PASS

  messages.push(...issues.slice(0, 3))
  if (passed && messages.length === 0) messages.push(score >= 85 ? 'Excellent! Shape, order and direction all match. 素晴らしい！' : 'Well done! The strokes match.')
  else if (passed) messages.unshift('Good! It matches. A few things to polish:')

  return { score, passed, perStroke, messages }
}
