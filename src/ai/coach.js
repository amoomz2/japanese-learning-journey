// AI Coach: talks to Claude directly from the browser with the learner's own API key.
// The key is kept in this device's localStorage under its own name, so it is never
// included in progress backups and never sent anywhere except api.anthropic.com.
const SETTINGS_KEY = 'jlj-ai-settings'

export const MODELS = [
  { id: 'claude-opus-5-5', label: 'Claude Opus 5.5', note: 'Best explanations · about $0.01–0.03 per reply' },
  { id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5', note: 'Fastest and cheapest · well under $0.001 per reply' },
]
const DEFAULT_MODEL = MODELS[0].id

export function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
    return { apiKey: typeof s.apiKey === 'string' ? s.apiKey : '', model: MODELS.some((m) => m.id === s.model) ? s.model : DEFAULT_MODEL }
  } catch {
    return { apiKey: '', model: DEFAULT_MODEL }
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function clearSettings() {
  localStorage.removeItem(SETTINGS_KEY)
}

export const looksLikeKey = (key) => /^sk-ant-[\w-]{20,}$/.test(key.trim())

const LEVEL = `The learner is a beginner studying Japanese on a personal website. They know hiragana and katakana partially and about 80 basic words (greetings, numbers, family, food, colours, time, simple verbs and adjectives). They don't read kanji yet.

Always write Japanese in kana (add kanji only in brackets after the kana if useful), followed by romaji in brackets and a short English meaning. Use only very simple grammar (です/ます forms). Keep replies short and friendly. Write plain text with line breaks; don't use markdown headings, tables or bold.`

export const SCENARIOS = [
  { id: 'intro', icon: '🙋', title: 'Introduce yourself', setup: 'You are meeting the learner for the first time at a language exchange in Tokyo. Ask their name, where they are from and what they like.' },
  { id: 'restaurant', icon: '🍜', title: 'Order at a restaurant', setup: 'You are a waiter at a small ramen restaurant. Greet the learner, take their order (food and drink) and tell them the price.' },
  { id: 'shop', icon: '🛍️', title: 'Shopping', setup: 'You are a shop assistant at a convenience store (コンビニ). Help the learner buy a few things, using numbers and prices.' },
  { id: 'directions', icon: '🗺️', title: 'Ask for directions', setup: 'You are a friendly local near a train station. The learner is looking for the station, a toilet or a restaurant.' },
  { id: 'free', icon: '💬', title: 'Free chat', setup: 'Chat with the learner about their day, their family, food and hobbies.' },
]

export function conversationSystem(scenario) {
  return `${LEVEL}

You are a patient Japanese conversation partner. Role-play: ${scenario.setup}

Each reply has this shape:
1. If the learner's last message had Japanese mistakes (or was in English), start with a line "✏️ " giving the natural Japanese for what they meant, in kana with romaji, and a few words on why. If it was correct, start with "✅ " and a few words of praise instead.
2. Then your next line in the role-play: Japanese (kana), romaji in brackets, English on the next line.
3. End with a short hint like "💡 You could answer: ..." so the learner knows what to say next.

Speak only one or two short sentences per turn. The learner may write in kana, romaji or English; all are fine. Start the conversation yourself when asked to begin.`
}

export function mistakesPrompt(missed) {
  const list = missed
    .map((m) => (m.kind === 'vocab' ? `- word ${m.front}${m.frontHint ? ` (${m.frontHint})` : ''} = "${m.back}" (${m.backHint})` : `- kana ${m.front} = "${m.back}"`))
    .join('\n')
  return {
    system: `${LEVEL}

You are an encouraging Japanese coach. The learner just finished a quiz. For each item they got wrong, give: what it is, a vivid memory trick (mnemonic, shape association or sound link), and for kana one tiny example word using it. If two of the items are easy to confuse with each other, point out the difference. Finish with one short sentence of encouragement. Keep each item to two or three lines.`,
    user: `I got these wrong in my quiz:\n${list}\n\nPlease help me remember them.`,
  }
}

let clientPromise = null
let clientKey = null

// The SDK is loaded only when the coach is first used, so the rest of the app stays small.
async function getClient(apiKey) {
  if (!clientPromise || clientKey !== apiKey) {
    clientKey = apiKey
    clientPromise = import('@anthropic-ai/sdk').then(({ default: Anthropic }) => ({
      Anthropic,
      client: new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 2 }),
    }))
  }
  return clientPromise
}

// Streams one coach reply. `messages` is the full conversation; assistant turns must be
// passed back exactly as returned (`content` blocks), so the history is never edited.
// Returns the assistant content blocks to append to the history.
export async function streamCoach({ settings, system, messages, onText, signal }) {
  if (!settings.apiKey) throw new CoachError('no-key', 'Add your Claude API key to use the AI Coach.')
  if (!navigator.onLine) throw new CoachError('offline', 'The AI Coach needs an internet connection.')

  const { Anthropic, client } = await getClient(settings.apiKey)
  const isOpus = settings.model === 'claude-opus-5-5'
  try {
    const stream = client.beta.messages.stream(
      {
        model: settings.model,
        max_tokens: 4000,
        output_config: { effort: 'low' }, // quick, chat-style replies
        // Opus: if a safety classifier declines a harmless request, the server retries on Anthropic's default fallback model.
        ...(isOpus ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' } : {}),
        system,
        messages,
      },
      { signal },
    )
    stream.on('text', (text) => onText(text))
    const message = await stream.finalMessage()
    if (message.stop_reason === 'refusal') throw new CoachError('refusal', "The coach couldn't answer that one. Try asking in a different way.")
    return message.content
  } catch (err) {
    if (err instanceof CoachError) throw err
    if (err instanceof Anthropic.APIUserAbortError) throw new CoachError('aborted', 'Stopped.')
    if (err instanceof Anthropic.AuthenticationError) throw new CoachError('auth', "Your API key wasn't accepted. Check it in AI Coach settings.")
    if (err instanceof Anthropic.PermissionDeniedError) throw new CoachError('auth', "This API key isn't allowed to use that model.")
    if (err instanceof Anthropic.RateLimitError) throw new CoachError('rate', 'Too many requests (or no credit left on your API account). Wait a moment and try again.')
    if (err instanceof Anthropic.BadRequestError) throw new CoachError('bad', `The request was rejected: ${err.message}`)
    if (err instanceof Anthropic.APIConnectionError) throw new CoachError('network', "Couldn't reach Claude. Check your internet connection.")
    if (err instanceof Anthropic.APIError) throw new CoachError('api', `Claude had a problem (${err.status ?? 'error'}). Try again in a moment.`)
    throw new CoachError('unknown', 'Something went wrong talking to the AI Coach.')
  }
}

export class CoachError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
  }
}
