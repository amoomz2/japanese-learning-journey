// Characters used by Writing Practice (shared by the app and scripts/build-strokes.mjs).
import { kanaList } from './kana.js'

// Beginner kanji, grouped into lessons.
// Each row: [kanji, readings in hiragana, romaji, English meaning, Arabic meaning, example words]
export const KANJI_LESSONS = [
  {
    id: 'kanji-numbers',
    title: 'Numbers',
    chars: [
      ['一', 'いち・ひと(つ)', 'ichi', 'one', 'واحد', [['いち', 'ichi', 'one'], ['ひとつ', 'hitotsu', 'one (thing)']]],
      ['二', 'に・ふた(つ)', 'ni', 'two', 'اثنان', [['に', 'ni', 'two'], ['ふたつ', 'futatsu', 'two (things)']]],
      ['三', 'さん・みっ(つ)', 'san', 'three', 'ثلاثة', [['さん', 'san', 'three'], ['みっつ', 'mittsu', 'three (things)']]],
      ['四', 'よん・し・よっ(つ)', 'yon', 'four', 'أربعة', [['よん', 'yon', 'four'], ['よっつ', 'yottsu', 'four (things)']]],
      ['五', 'ご・いつ(つ)', 'go', 'five', 'خمسة', [['ご', 'go', 'five'], ['いつつ', 'itsutsu', 'five (things)']]],
      ['六', 'ろく・むっ(つ)', 'roku', 'six', 'ستة', [['ろく', 'roku', 'six'], ['むっつ', 'muttsu', 'six (things)']]],
      ['七', 'なな・しち', 'nana', 'seven', 'سبعة', [['なな', 'nana', 'seven'], ['ななつ', 'nanatsu', 'seven (things)']]],
      ['八', 'はち・やっ(つ)', 'hachi', 'eight', 'ثمانية', [['はち', 'hachi', 'eight'], ['やっつ', 'yattsu', 'eight (things)']]],
      ['九', 'きゅう・く', 'kyuu', 'nine', 'تسعة', [['きゅう', 'kyuu', 'nine'], ['ここのつ', 'kokonotsu', 'nine (things)']]],
      ['十', 'じゅう・とお', 'juu', 'ten', 'عشرة', [['じゅう', 'juu', 'ten'], ['とお', 'too', 'ten (things)']]],
      ['百', 'ひゃく', 'hyaku', 'hundred', 'مئة', [['ひゃく', 'hyaku', 'one hundred'], ['さんびゃく', 'sanbyaku', 'three hundred']]],
      ['千', 'せん', 'sen', 'thousand', 'ألف', [['せん', 'sen', 'one thousand'], ['さんぜん', 'sanzen', 'three thousand']]],
    ],
  },
  {
    id: 'kanji-days',
    title: 'Days & nature',
    chars: [
      ['日', 'にち・ひ・か', 'nichi / hi', 'sun, day', 'شمس، يوم', [['にちようび', 'nichiyoubi', 'Sunday (日曜日)'], ['にほん', 'nihon', 'Japan (日本)']]],
      ['月', 'げつ・がつ・つき', 'getsu / tsuki', 'moon, month', 'قمر، شهر', [['げつようび', 'getsuyoubi', 'Monday (月曜日)'], ['つき', 'tsuki', 'moon']]],
      ['火', 'か・ひ', 'ka / hi', 'fire', 'نار', [['かようび', 'kayoubi', 'Tuesday (火曜日)'], ['ひ', 'hi', 'fire']]],
      ['水', 'すい・みず', 'sui / mizu', 'water', 'ماء', [['すいようび', 'suiyoubi', 'Wednesday (水曜日)'], ['みず', 'mizu', 'water']]],
      ['木', 'もく・き', 'moku / ki', 'tree, wood', 'شجرة، خشب', [['もくようび', 'mokuyoubi', 'Thursday (木曜日)'], ['き', 'ki', 'tree']]],
      ['金', 'きん・かね', 'kin / kane', 'gold, money', 'ذهب، مال', [['きんようび', 'kin\'youbi', 'Friday (金曜日)'], ['おかね', 'okane', 'money (お金)']]],
      ['土', 'ど・つち', 'do / tsuchi', 'earth, soil', 'تراب، أرض', [['どようび', 'doyoubi', 'Saturday (土曜日)'], ['つち', 'tsuchi', 'soil']]],
      ['山', 'さん・やま', 'san / yama', 'mountain', 'جبل', [['やま', 'yama', 'mountain'], ['ふじさん', 'fujisan', 'Mount Fuji (富士山)']]],
      ['川', 'かわ・せん', 'kawa', 'river', 'نهر', [['かわ', 'kawa', 'river'], ['おがわ', 'ogawa', 'stream (小川)']]],
    ],
  },
  {
    id: 'kanji-people',
    title: 'People & body',
    chars: [
      ['人', 'じん・にん・ひと', 'hito / jin', 'person', 'شخص', [['ひと', 'hito', 'person'], ['にほんじん', 'nihonjin', 'Japanese person (日本人)']]],
      ['口', 'こう・くち', 'kuchi', 'mouth', 'فم', [['くち', 'kuchi', 'mouth'], ['いりぐち', 'iriguchi', 'entrance (入口)']]],
      ['目', 'もく・め', 'me', 'eye', 'عين', [['め', 'me', 'eye'], ['めがね', 'megane', 'glasses']]],
      ['手', 'しゅ・て', 'te', 'hand', 'يد', [['て', 'te', 'hand'], ['じょうず', 'jouzu', 'skilful (上手)']]],
      ['子', 'し・こ', 'ko', 'child', 'طفل', [['こども', 'kodomo', 'child (子供)'], ['おんなのこ', 'onna no ko', 'girl (女の子)']]],
      ['女', 'じょ・おんな', 'onna', 'woman', 'امرأة', [['おんな', 'onna', 'woman'], ['おんなのひと', 'onna no hito', 'woman (女の人)']]],
      ['男', 'だん・おとこ', 'otoko', 'man', 'رجل', [['おとこ', 'otoko', 'man'], ['おとこのこ', 'otoko no ko', 'boy (男の子)']]],
    ],
  },
  {
    id: 'kanji-basics',
    title: 'Size & position',
    chars: [
      ['大', 'だい・おお(きい)', 'dai / ookii', 'big', 'كبير', [['おおきい', 'ookii', 'big (大きい)'], ['だいがく', 'daigaku', 'university (大学)']]],
      ['小', 'しょう・ちい(さい)', 'shou / chiisai', 'small', 'صغير', [['ちいさい', 'chiisai', 'small (小さい)'], ['しょうがっこう', 'shougakkou', 'primary school']]],
      ['中', 'ちゅう・なか', 'chuu / naka', 'middle, inside', 'وسط، داخل', [['なか', 'naka', 'inside'], ['ちゅうごく', 'chuugoku', 'China (中国)']]],
      ['上', 'じょう・うえ', 'ue', 'up, above', 'فوق، أعلى', [['うえ', 'ue', 'above'], ['じょうず', 'jouzu', 'skilful (上手)']]],
      ['下', 'か・した', 'shita', 'down, below', 'تحت، أسفل', [['した', 'shita', 'below'], ['ちかてつ', 'chikatetsu', 'subway (地下鉄)']]],
      ['本', 'ほん・もと', 'hon', 'book, origin', 'كتاب، أصل', [['ほん', 'hon', 'book'], ['にほん', 'nihon', 'Japan (日本)']]],
    ],
  },
]

export const WRITING_CHARS = [
  ...kanaList('hiragana').map((k) => k.char),
  ...kanaList('katakana').map((k) => k.char),
  ...KANJI_LESSONS.flatMap((l) => l.chars.map((c) => c[0])),
]
