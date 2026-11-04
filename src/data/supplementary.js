// Supplementary ORIGINAL material (not from the textbook). Book 1 does not cover asking for
// directions or travel; these short N5-level phrases were written for this site and are labelled
// "Supplementary (original)" in the app. They use the device voice.
// Line format matches book1.js: [speaker, japanese, romaji, english, arabic]

export const SUPPLEMENTARY = [
  {
    id: 'S-directions',
    title: 'Asking for directions',
    titleAr: 'السؤال عن الاتجاهات',
    lines: [
      ['', 'すみません、{駅|えき}はどこですか。', 'Sumimasen, eki wa doko desu ka.', 'Excuse me, where is the station?', 'عفواً، أين المحطة؟'],
      ['', 'トイレはどこですか。', 'Toire wa doko desu ka.', 'Where is the toilet?', 'أين دورة المياه؟'],
      ['', 'まっすぐ{行|い}ってください。', 'Massugu itte kudasai.', 'Please go straight.', 'امشِ مستقيماً من فضلك.'],
      ['', '{右|みぎ}に{曲|ま}がってください。', 'Migi ni magatte kudasai.', 'Please turn right.', 'انعطف يميناً من فضلك.'],
      ['', '{左|ひだり}に{曲|ま}がってください。', 'Hidari ni magatte kudasai.', 'Please turn left.', 'انعطف يساراً من فضلك.'],
      ['', '{近|ちか}いですか。', 'Chikai desu ka.', 'Is it near?', 'هل هو قريب؟'],
      ['', '{地図|ちず}を{見|み}せてください。', 'Chizu o misete kudasai.', 'Please show me on the map.', 'أرني على الخريطة من فضلك.'],
    ],
  },
  {
    id: 'S-travel',
    title: 'Travel',
    titleAr: 'السفر',
    lines: [
      ['', 'この{電車|でんしゃ}は{東京|とうきょう}に{行|い}きますか。', 'Kono densha wa Toukyou ni ikimasu ka.', 'Does this train go to Tokyo?', 'هل يذهب هذا القطار إلى طوكيو؟'],
      ['', '{切符|きっぷ}はいくらですか。', 'Kippu wa ikura desu ka.', 'How much is the ticket?', 'كم سعر التذكرة؟'],
      ['', '{東京|とうきょう}まで{一枚|いちまい}ください。', 'Toukyou made ichi-mai kudasai.', 'One ticket to Tokyo, please.', 'تذكرة واحدة إلى طوكيو من فضلك.'],
      ['', 'ホテルはどこですか。', 'Hoteru wa doko desu ka.', 'Where is the hotel?', 'أين الفندق؟'],
      ['', '{英語|えいご}のメニューはありますか。', 'Eigo no menyuu wa arimasu ka.', 'Do you have an English menu?', 'هل توجد قائمة طعام بالإنجليزية؟'],
      ['', '{写真|しゃしん}を{撮|と}ってもいいですか。', 'Shashin o totte mo ii desu ka.', 'May I take a photo?', 'هل يمكنني التقاط صورة؟'],
      ['', 'ゆっくり{話|はな}してください。', 'Yukkuri hanashite kudasai.', 'Please speak slowly.', 'تحدّث ببطء من فضلك.'],
    ],
  },
]

// Topics requested for speaking practice, mapped to textbook dialogues where the book covers them.
export const SPEAKING_TOPICS = [
  { id: 'expressions', title: 'Common expressions', titleAr: 'عبارات شائعة', dialogues: ['L0-1', 'L0-2', 'L0-3'] },
  { id: 'intro', title: 'Self-introduction', titleAr: 'التعريف بالنفس', dialogues: ['L0-3', 'L2-2', 'L2-3'] },
  { id: 'food', title: 'Ordering food', titleAr: 'طلب الطعام', dialogues: ['L4-3', 'L4-4', 'L4-2'] },
  { id: 'shopping', title: 'Shopping', titleAr: 'التسوق', dialogues: ['L1-2', 'L3-2'] },
  { id: 'office', title: 'At work', titleAr: 'في العمل', dialogues: ['L1-1', 'L1-3', 'L1-4', 'L4-1'] },
  { id: 'directions', title: 'Asking for directions', titleAr: 'السؤال عن الاتجاهات', dialogues: ['S-directions'] },
  { id: 'travel', title: 'Travel', titleAr: 'السفر', dialogues: ['S-travel'] },
]

// "Act in Japanese" situations from the textbook, Lesson 0, pp. 12–13.
export const ACT_IN_JAPANESE = {
  page: 12,
  items: [
    'Greet your coworkers in the morning.',
    'Leave the office to go to a meeting outside.',
    'You are meeting Ms. Honda, a business associate, for the first time. Introduce yourself.',
    'Offer a seat to a client.',
    'Accept a gift from a visitor.',
    'Start eating lunch.',
    'Thank a supervisor for treating you at a restaurant.',
    'Hand a report to the assistant to make copies.',
    'Thank a coworker for making copies for you.',
    'Visit the office of a supervisor.',
    'Leave the office of a supervisor.',
    'Ask a coworker to pass a document to you.',
    'Say good-by to a coworker who is about to go home.',
    'Say good-by to coworkers as you leave the office to go home.',
    'Say good night to friends as you part after a night out.',
    'Say good-by to coworkers as you leave the office party.',
  ],
}
