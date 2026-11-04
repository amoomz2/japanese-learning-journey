// Weekly study plan: one hour a day, two skills, 30 minutes each. Original to this site (not from the textbook).
// Every skill gets three sessions a week; Sunday is a light review day. Monday is first.
export const SLOT_MINUTES = 30

export const SKILL_TASKS = {
  writing: { title: 'Writing', jp: '書く', page: 'writing', task: 'Trace 3–5 kanji with stroke order, then test yourself on them.' },
  reading: { title: 'Reading', jp: '読む', page: 'reading', task: 'Read one dialogue with furigana, then do its quiz.' },
  listening: { title: 'Listening', jp: '聞く', page: 'listening', task: 'Listen to one dialogue a few times, then try the dictation.' },
  speaking: { title: 'Speaking', jp: '話す', page: 'speaking', task: 'Shadow one dialogue, then record yourself and compare.' },
  flash: { title: 'Flashcards', jp: '復習', page: 'practice', task: 'Review kana and vocabulary with flashcards or a quiz.' },
  weak: { title: 'Weak spots', jp: '弱点', page: 'skills', task: 'Open the skills overview and redo whatever scored lowest this week.' },
}

export const WEEK = [
  { day: 'Monday', skills: ['writing', 'reading'] },
  { day: 'Tuesday', skills: ['listening', 'speaking'] },
  { day: 'Wednesday', skills: ['reading', 'listening'] },
  { day: 'Thursday', skills: ['speaking', 'writing'] },
  { day: 'Friday', skills: ['writing', 'listening'] },
  { day: 'Saturday', skills: ['reading', 'speaking'] },
  { day: 'Sunday', skills: ['flash', 'weak'], review: true },
]
