// Lessons and character information for Writing Practice.
import { KANA_ROWS } from './kana.js'
import { KANJI_LESSONS } from './writingChars.js'
import strokeData from './strokes.json'

export const STROKES = strokeData.strokes
export const STROKE_SOURCE = strokeData.source

// One example word per kana: [word, romaji, meaning]
const HIRAGANA_EXAMPLES = {
  あ: ['あめ', 'ame', 'rain'], い: ['いぬ', 'inu', 'dog'], う: ['うみ', 'umi', 'sea'], え: ['えき', 'eki', 'station'], お: ['おちゃ', 'ocha', 'tea'],
  か: ['かさ', 'kasa', 'umbrella'], き: ['き', 'ki', 'tree'], く: ['くつ', 'kutsu', 'shoes'], け: ['けさ', 'kesa', 'this morning'], こ: ['こども', 'kodomo', 'child'],
  さ: ['さかな', 'sakana', 'fish'], し: ['しろ', 'shiro', 'white'], す: ['すし', 'sushi', 'sushi'], せ: ['せんせい', 'sensei', 'teacher'], そ: ['そら', 'sora', 'sky'],
  た: ['たまご', 'tamago', 'egg'], ち: ['ちず', 'chizu', 'map'], つ: ['つき', 'tsuki', 'moon'], て: ['て', 'te', 'hand'], と: ['とり', 'tori', 'bird'],
  な: ['なつ', 'natsu', 'summer'], に: ['にく', 'niku', 'meat'], ぬ: ['ぬの', 'nuno', 'cloth'], ね: ['ねこ', 'neko', 'cat'], の: ['のむ', 'nomu', 'to drink'],
  は: ['はな', 'hana', 'flower'], ひ: ['ひと', 'hito', 'person'], ふ: ['ふね', 'fune', 'boat'], へ: ['へや', 'heya', 'room'], ほ: ['ほし', 'hoshi', 'star'],
  ま: ['まど', 'mado', 'window'], み: ['みみ', 'mimi', 'ear'], む: ['むし', 'mushi', 'insect'], め: ['め', 'me', 'eye'], も: ['もも', 'momo', 'peach'],
  や: ['やま', 'yama', 'mountain'], ゆ: ['ゆき', 'yuki', 'snow'], よ: ['よる', 'yoru', 'night'],
  ら: ['らいねん', 'rainen', 'next year'], り: ['りんご', 'ringo', 'apple'], る: ['るす', 'rusu', 'not at home'], れ: ['れきし', 'rekishi', 'history'], ろ: ['ろく', 'roku', 'six'],
  わ: ['わたし', 'watashi', 'I, me'], を: ['ほんをよむ', 'hon o yomu', 'read a book (を marks the object)'], ん: ['ほん', 'hon', 'book'],
  が: ['がっこう', 'gakkou', 'school'], ぎ: ['ぎんこう', 'ginkou', 'bank'], ぐ: ['かぐ', 'kagu', 'furniture'], げ: ['げんき', 'genki', 'healthy, fine'], ご: ['ごはん', 'gohan', 'rice, meal'],
  ざ: ['ざっし', 'zasshi', 'magazine'], じ: ['じかん', 'jikan', 'time'], ず: ['みず', 'mizu', 'water'], ぜ: ['かぜ', 'kaze', 'wind'], ぞ: ['ぞう', 'zou', 'elephant'],
  だ: ['だいがく', 'daigaku', 'university'], ぢ: ['はなぢ', 'hanaji', 'nosebleed'], づ: ['つづく', 'tsuzuku', 'to continue'], で: ['でんわ', 'denwa', 'telephone'], ど: ['どこ', 'doko', 'where'],
  ば: ['ばら', 'bara', 'rose'], び: ['びょういん', 'byouin', 'hospital'], ぶ: ['ぶた', 'buta', 'pig'], べ: ['べんきょう', 'benkyou', 'study'], ぼ: ['ぼうし', 'boushi', 'hat'],
  ぱ: ['かんぱい', 'kanpai', 'cheers!'], ぴ: ['えんぴつ', 'enpitsu', 'pencil'], ぷ: ['てんぷら', 'tenpura', 'tempura'], ぺ: ['ぺらぺら', 'perapera', 'fluent'], ぽ: ['さんぽ', 'sanpo', 'a walk'],
}

const KATAKANA_EXAMPLES = {
  ア: ['アイス', 'aisu', 'ice cream'], イ: ['イギリス', 'igirisu', 'the UK'], ウ: ['ウール', 'uuru', 'wool'], エ: ['エアコン', 'eakon', 'air conditioner'], オ: ['オレンジ', 'orenji', 'orange'],
  カ: ['カメラ', 'kamera', 'camera'], キ: ['キロ', 'kiro', 'kilo'], ク: ['クラス', 'kurasu', 'class'], ケ: ['ケーキ', 'keeki', 'cake'], コ: ['コーヒー', 'koohii', 'coffee'],
  サ: ['サラダ', 'sarada', 'salad'], シ: ['シャツ', 'shatsu', 'shirt'], ス: ['スープ', 'suupu', 'soup'], セ: ['セーター', 'seetaa', 'sweater'], ソ: ['ソファ', 'sofa', 'sofa'],
  タ: ['タクシー', 'takushii', 'taxi'], チ: ['チケット', 'chiketto', 'ticket'], ツ: ['ツアー', 'tsuaa', 'tour'], テ: ['テレビ', 'terebi', 'TV'], ト: ['トマト', 'tomato', 'tomato'],
  ナ: ['ナイフ', 'naifu', 'knife'], ニ: ['ニュース', 'nyuusu', 'news'], ヌ: ['カヌー', 'kanuu', 'canoe'], ネ: ['ネクタイ', 'nekutai', 'necktie'], ノ: ['ノート', 'nooto', 'notebook'],
  ハ: ['ハンバーガー', 'hanbaagaa', 'hamburger'], ヒ: ['ヒーター', 'hiitaa', 'heater'], フ: ['フォーク', 'fooku', 'fork'], ヘ: ['ヘリコプター', 'herikoputaa', 'helicopter'], ホ: ['ホテル', 'hoteru', 'hotel'],
  マ: ['マスク', 'masuku', 'mask'], ミ: ['ミルク', 'miruku', 'milk'], ム: ['チーム', 'chiimu', 'team'], メ: ['メール', 'meeru', 'email'], モ: ['モデル', 'moderu', 'model'],
  ヤ: ['タイヤ', 'taiya', 'tyre'], ユ: ['ユニフォーム', 'yunifoomu', 'uniform'], ヨ: ['ヨーグルト', 'yooguruto', 'yoghurt'],
  ラ: ['ラジオ', 'rajio', 'radio'], リ: ['リモコン', 'rimokon', 'remote control'], ル: ['ルール', 'ruuru', 'rule'], レ: ['レモン', 'remon', 'lemon'], ロ: ['ロボット', 'robotto', 'robot'],
  ワ: ['ワイン', 'wain', 'wine'], ヲ: null, ン: ['パン', 'pan', 'bread'],
  ガ: ['ガム', 'gamu', 'chewing gum'], ギ: ['ギター', 'gitaa', 'guitar'], グ: ['グラス', 'gurasu', 'glass'], ゲ: ['ゲーム', 'geemu', 'game'], ゴ: ['ゴルフ', 'gorufu', 'golf'],
  ザ: ['ピザ', 'piza', 'pizza'], ジ: ['ジュース', 'juusu', 'juice'], ズ: ['チーズ', 'chiizu', 'cheese'], ゼ: ['ゼロ', 'zero', 'zero'], ゾ: ['ゾーン', 'zoon', 'zone'],
  ダ: ['ダンス', 'dansu', 'dance'], ヂ: null, ヅ: null, デ: ['デパート', 'depaato', 'department store'], ド: ['ドア', 'doa', 'door'],
  バ: ['バス', 'basu', 'bus'], ビ: ['ビル', 'biru', 'building'], ブ: ['ブラシ', 'burashi', 'brush'], ベ: ['ベッド', 'beddo', 'bed'], ボ: ['ボール', 'booru', 'ball'],
  パ: ['パスタ', 'pasuta', 'pasta'], ピ: ['ピアノ', 'piano', 'piano'], プ: ['プール', 'puuru', 'swimming pool'], ペ: ['ペン', 'pen', 'pen'], ポ: ['ポスト', 'posuto', 'postbox'],
}

// Sound descriptions built from the romaji, in English and Arabic.
const VOWEL_EN = { a: '"a" as in "father"', i: '"ee" as in "see", but short', u: '"oo" as in "food", short, lips not rounded', e: '"e" as in "pet"', o: '"o" as in "port", short' }
const VOWEL_AR = { a: 'فتحة قصيرة', i: 'كسرة قصيرة', u: 'ضمة قصيرة بدون ضمّ الشفتين', e: 'بين الفتحة والكسرة مثل «إيه» قصيرة', o: 'ضمة مفتوحة مثل «أو» في «أوه»' }
const VOWEL_AR_LETTER = { a: 'ا', i: 'ي', u: 'و', e: 'يه', o: 'و' }
const VOWEL_ALONE_AR = { a: 'آ', i: 'إي', u: 'أو', e: 'إيه', o: 'أو' }
const CONS_AR = {
  k: 'ك', s: 'س', sh: 'ش', t: 'ت', ch: 'تش', ts: 'تس', n: 'ن', h: 'ه', f: 'ف', m: 'م', y: 'ي', r: 'ر', w: 'و',
  g: 'گ', z: 'ز', j: 'ج', d: 'د', b: 'ب', p: 'پ',
}
const CONS_NOTE_AR = {
  g: 'الـ«گ» تُنطق كالجيم المصرية (g).',
  p: 'الـ«پ» تُنطق مثل حرف P الإنجليزي.',
  r: 'الراء اليابانية خفيفة جداً، بين الراء واللام.',
  f: 'تُنطق بنفخ خفيف بين الشفتين، بين الفاء والهاء.',
  ts: 'صوت «تس» معاً كما في كلمة «تسونامي».',
  ch: 'صوت «تش» كما في كلمة «تشاي».',
  j: 'جيم عادية كما في «جميل».',
}
const ROMAJI_EN_NOTE = {
  r: 'The Japanese r is a light tap, between r and l.',
  f: 'Blow gently through your lips, between "f" and "h".',
  ts: 'Like "ts" in "cats".',
  n: '',
}

function splitRomaji(romaji) {
  const m = romaji.match(/^(sh|ch|ts|[kstnhfmyrwgzjdbp]?)([aiueo])$/)
  return m ? { cons: m[1], vowel: m[2] } : null
}

function soundInfo(char, romaji) {
  if (romaji === 'n') {
    return {
      en: 'A nasal "n" on its own. It never starts a word.',
      ar: 'تُنطق «ن» ساكنة (نون ساكنة)، ولا تأتي في أول الكلمة.',
    }
  }
  if (romaji === 'wo') {
    return {
      en: 'Pronounced "o". Used almost only as the particle that marks the object of a sentence.',
      ar: 'تُنطق «أو». تُستخدم تقريباً فقط كأداة تدلّ على المفعول به في الجملة.',
    }
  }
  const parts = splitRomaji(romaji)
  if (!parts) return { en: `Pronounced "${romaji}".`, ar: `تُنطق «${romaji}».` }
  const { cons, vowel } = parts
  const arSyllable = cons ? CONS_AR[cons] + VOWEL_AR_LETTER[vowel] : VOWEL_ALONE_AR[vowel]
  const en = cons ? `"${romaji}": the sound ${cons} followed by ${VOWEL_EN[vowel]}.` : `Vowel ${VOWEL_EN[vowel]}.`
  const enNote = ROMAJI_EN_NOTE[cons] ? ` ${ROMAJI_EN_NOTE[cons]}` : ''
  const ar = `تُنطق «${arSyllable}» — ${cons ? `حرف «${CONS_AR[cons]}» مع ` : 'صوت '}${VOWEL_AR[vowel]}.`
  const arNote = CONS_NOTE_AR[cons] ? ` ${CONS_NOTE_AR[cons]}` : ''
  const sameAs = { ぢ: 'じ', づ: 'ず', ヂ: 'ジ', ヅ: 'ズ' }[char]
  return {
    en: en + enNote + (sameAs ? ` Sounds the same as ${sameAs}; used in only a few words.` : ''),
    ar: ar + arNote + (sameAs ? ` نطقها مثل ${sameAs} تماماً، وتُستخدم في كلمات قليلة.` : ''),
  }
}

const ROW_TITLES = ['Vowels', 'K', 'S', 'T', 'N', 'H', 'M', 'Y', 'R', 'W & N', 'G', 'Z', 'D', 'B', 'P']

function kanaLessons(script) {
  const rows = KANA_ROWS[script]
  // KANA_ROWS has ん on its own row; fold it into the W row so lessons stay a useful size.
  const merged = []
  rows.forEach((row) => {
    const cells = row.cells.filter(Boolean)
    if (cells.length === 1 && cells[0].romaji === 'n') merged[merged.length - 1].cells.push(...cells)
    else merged.push({ group: row.group, cells })
  })
  return merged.map((row, i) => ({
    id: `${script}-${i}`,
    script,
    title: `${ROW_TITLES[i]} · ${row.cells.map((c) => c.char).join('')}`,
    chars: row.cells.map((c) => c.char),
  }))
}

export const SCRIPTS = [
  { key: 'hiragana', label: 'Hiragana', jp: 'ひらがな' },
  { key: 'katakana', label: 'Katakana', jp: 'カタカナ' },
  { key: 'kanji', label: 'Kanji', jp: '漢字' },
]

export const LESSONS = {
  hiragana: kanaLessons('hiragana'),
  katakana: kanaLessons('katakana'),
  kanji: KANJI_LESSONS.map((l) => ({ id: l.id, script: 'kanji', title: l.title, chars: l.chars.map((c) => c[0]) })),
}

export const ALL_LESSONS = [...LESSONS.hiragana, ...LESSONS.katakana, ...LESSONS.kanji]

const INFO = {}
for (const script of ['hiragana', 'katakana']) {
  for (const row of KANA_ROWS[script]) {
    for (const cell of row.cells.filter(Boolean)) {
      const ex = (script === 'hiragana' ? HIRAGANA_EXAMPLES : KATAKANA_EXAMPLES)[cell.char]
      const sound = soundInfo(cell.char, cell.romaji)
      INFO[cell.char] = {
        char: cell.char,
        script,
        romaji: cell.romaji,
        prompt: cell.romaji,
        meaning: sound.en,
        arabic: sound.ar,
        examples: ex ? [ex] : [],
        say: cell.char,
      }
    }
  }
}
for (const lesson of KANJI_LESSONS) {
  for (const [char, readings, romaji, meaning, arabic, examples] of lesson.chars) {
    INFO[char] = {
      char,
      script: 'kanji',
      romaji,
      readings,
      prompt: `${meaning} (${romaji})`,
      meaning: `Means "${meaning}". Readings: ${readings}.`,
      arabic: `معناه «${arabic}». القراءات: ${readings}.`,
      examples,
      say: examples[0][0],
    }
  }
}

export function charInfo(char) {
  return { ...INFO[char], strokes: STROKES[char], strokeCount: STROKES[char].length, id: `write:${char}` }
}
