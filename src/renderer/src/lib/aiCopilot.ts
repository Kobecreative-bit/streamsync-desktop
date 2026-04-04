const BUYING_KEYWORDS = [
  'how much', 'price', 'cost', 'where to buy', 'buy', 'link',
  'want', 'order', 'ship', 'available', 'interested', 'purchase',
  'deal', 'discount', 'money', 'get one', 'get two', 'need this',
  'in stock'
]

const REPLY_TEMPLATES = [
  'Thanks {user}! The link is in my bio — grab it before it sells out! 🔥',
  'Great question {user}! Yes we ship worldwide. Link pinned in comments! 🌎',
  'Glad you love it {user}! Use code LIVE20 for 20% off today only! 💰',
  'Hey {user}! Tap the product link below to order yours! ⬇️',
  "You've got great taste {user}! Check the link in my bio to snag one! ✨",
  'Absolutely {user}! It\'s available right now — link dropping in comments! 🛒',
  '{user} yes! Limited stock so grab yours ASAP! Link in bio! 🏃‍♂️',
  'Love the energy {user}! Click the product card below to shop! 🛍️'
]

function detectBuyingSignal(text: string): boolean {
  const lower = text.toLowerCase()
  return BUYING_KEYWORDS.some((keyword) => lower.includes(keyword))
}

function generateSuggestedReply(username: string): string {
  const template = REPLY_TEMPLATES[Math.floor(Math.random() * REPLY_TEMPLATES.length)]
  return template.replace('{user}', `@${username}`)
}

export { detectBuyingSignal, generateSuggestedReply }
