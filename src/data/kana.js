// Gojūon rows plus dakuten/handakuten. null marks an empty cell in the chart grid.
const ROWS = [
  { group: 'basic', romaji: ['a', 'i', 'u', 'e', 'o'], h: 'あいうえお', k: 'アイウエオ' },
  { group: 'basic', romaji: ['ka', 'ki', 'ku', 'ke', 'ko'], h: 'かきくけこ', k: 'カキクケコ' },
  { group: 'basic', romaji: ['sa', 'shi', 'su', 'se', 'so'], h: 'さしすせそ', k: 'サシスセソ' },
  { group: 'basic', romaji: ['ta', 'chi', 'tsu', 'te', 'to'], h: 'たちつてと', k: 'タチツテト' },
  { group: 'basic', romaji: ['na', 'ni', 'nu', 'ne', 'no'], h: 'なにぬねの', k: 'ナニヌネノ' },
  { group: 'basic', romaji: ['ha', 'hi', 'fu', 'he', 'ho'], h: 'はひふへほ', k: 'ハヒフヘホ' },
  { group: 'basic', romaji: ['ma', 'mi', 'mu', 'me', 'mo'], h: 'まみむめも', k: 'マミムメモ' },
  { group: 'basic', romaji: ['ya', null, 'yu', null, 'yo'], h: 'や ゆ よ', k: 'ヤ ユ ヨ' },
  { group: 'basic', romaji: ['ra', 'ri', 'ru', 're', 'ro'], h: 'らりるれろ', k: 'ラリルレロ' },
  { group: 'basic', romaji: ['wa', null, null, null, 'wo'], h: 'わ   を', k: 'ワ   ヲ' },
  { group: 'basic', romaji: ['n', null, null, null, null], h: 'ん    ', k: 'ン    ' },
  { group: 'dakuten', romaji: ['ga', 'gi', 'gu', 'ge', 'go'], h: 'がぎぐげご', k: 'ガギグゲゴ' },
  { group: 'dakuten', romaji: ['za', 'ji', 'zu', 'ze', 'zo'], h: 'ざじずぜぞ', k: 'ザジズゼゾ' },
  { group: 'dakuten', romaji: ['da', 'ji', 'zu', 'de', 'do'], h: 'だぢづでど', k: 'ダヂヅデド' },
  { group: 'dakuten', romaji: ['ba', 'bi', 'bu', 'be', 'bo'], h: 'ばびぶべぼ', k: 'バビブベボ' },
  { group: 'dakuten', romaji: ['pa', 'pi', 'pu', 'pe', 'po'], h: 'ぱぴぷぺぽ', k: 'パピプペポ' },
]

function buildRows(script) {
  return ROWS.map((row) => ({
    group: row.group,
    cells: row.romaji.map((romaji, i) =>
      romaji ? { char: row[script][i], romaji, script, id: `${script}:${row[script][i]}` } : null,
    ),
  }))
}

export const KANA_ROWS = {
  hiragana: buildRows('h'),
  katakana: buildRows('k'),
}

export function kanaList(script, groups = ['basic', 'dakuten']) {
  return KANA_ROWS[script]
    .filter((row) => groups.includes(row.group))
    .flatMap((row) => row.cells.filter(Boolean))
}

export const ALL_KANA = [...kanaList('hiragana'), ...kanaList('katakana')]
