export interface SignalResult {
  isSignal: boolean
  confidence: number
  matchedPatterns: string[]
}

interface SignalPattern {
  pattern: RegExp
  weight: number
  label: string
}

const SIGNAL_PATTERNS: SignalPattern[] = [
  { pattern: /how much/i, weight: 0.9, label: 'price inquiry' },
  { pattern: /price\??/i, weight: 0.9, label: 'price inquiry' },
  { pattern: /where (can i|to) buy/i, weight: 1.0, label: 'purchase intent' },
  { pattern: /i want (one|this|it|some)/i, weight: 0.85, label: 'desire' },
  { pattern: /link\??/i, weight: 0.8, label: 'link request' },
  { pattern: /how (do i|can i) (order|buy|purchase|get)/i, weight: 1.0, label: 'purchase intent' },
  { pattern: /do you ship/i, weight: 0.85, label: 'shipping inquiry' },
  { pattern: /take my money/i, weight: 0.9, label: 'purchase intent' },
  { pattern: /in stock/i, weight: 0.8, label: 'availability' },
  { pattern: /discount|coupon|code|deal/i, weight: 0.75, label: 'deal seeking' },
  { pattern: /can i get/i, weight: 0.7, label: 'purchase intent' },
  { pattern: /available\??/i, weight: 0.6, label: 'availability' },
  { pattern: /interested/i, weight: 0.65, label: 'interest' },
  { pattern: /cost\??/i, weight: 0.8, label: 'price inquiry' },
  { pattern: /order/i, weight: 0.7, label: 'purchase intent' },
  { pattern: /ship(ping)?\??/i, weight: 0.7, label: 'shipping inquiry' },
  { pattern: /\bbuy\b/i, weight: 0.75, label: 'purchase intent' },
  { pattern: /purchase/i, weight: 0.8, label: 'purchase intent' },
  { pattern: /need this/i, weight: 0.8, label: 'desire' },
  { pattern: /drop the link/i, weight: 0.9, label: 'link request' },
  { pattern: /still available/i, weight: 0.85, label: 'availability' },
  { pattern: /how to order/i, weight: 0.95, label: 'purchase intent' },
  { pattern: /where.*link/i, weight: 0.85, label: 'link request' },
  { pattern: /send.*link/i, weight: 0.85, label: 'link request' }
]

const CONFIDENCE_THRESHOLD = 0.5

export function analyzeBuyingSignal(text: string): SignalResult {
  const matchedPatterns: string[] = []
  let totalWeight = 0

  for (const { pattern, weight, label } of SIGNAL_PATTERNS) {
    if (pattern.test(text)) {
      matchedPatterns.push(label)
      totalWeight += weight
    }
  }

  // Normalize confidence: one strong match = ~0.8, multiple matches boost higher
  const confidence = matchedPatterns.length > 0
    ? Math.min(1, totalWeight / matchedPatterns.length * 0.9 + (matchedPatterns.length - 1) * 0.05)
    : 0

  return {
    isSignal: confidence >= CONFIDENCE_THRESHOLD,
    confidence: Math.round(confidence * 100) / 100,
    matchedPatterns: [...new Set(matchedPatterns)]
  }
}

interface ReplyProduct {
  name: string
  price: number
  buyLink?: string
}

const REPLY_TEMPLATES_BY_SIGNAL: Record<string, string[]> = {
  'price inquiry': [
    'Thanks @{user}! The {product} is ${price} -- link in bio!',
    'Hey @{user}! It\'s ${price} for the {product}. Grab yours from the link below!',
    '@{user} Great question! The {product} is only ${price} right now.'
  ],
  'purchase intent': [
    'Love the energy @{user}! Get the {product} from the link in bio!',
    '@{user} You can grab the {product} for ${price} -- link pinned in comments!',
    'Thanks @{user}! Tap the product card below to order the {product}!'
  ],
  'link request': [
    '@{user} Link is in my bio! The {product} is ${price}.',
    'Dropping the link now @{user}! Check the product card below for the {product}.',
    '@{user} Check the link in bio for the {product} -- ${price}!'
  ],
  'shipping inquiry': [
    'Great question @{user}! Yes we ship worldwide. The {product} is ${price} -- link in bio!',
    '@{user} We ship everywhere! Grab the {product} for ${price} from the link below.',
    'Absolutely @{user}! Worldwide shipping available for the {product}.'
  ],
  'desire': [
    'You have amazing taste @{user}! Get the {product} for ${price} -- link in bio!',
    '@{user} It can be yours! The {product} is ${price}. Link below!',
    'Grab it @{user}! The {product} is only ${price} right now.'
  ],
  'availability': [
    '@{user} Yes, the {product} is available right now for ${price}! Link in bio.',
    'In stock @{user}! The {product} is ${price} -- grab it before it sells out!',
    '@{user} Still available! Get the {product} for ${price} from the link below.'
  ],
  'deal seeking': [
    '@{user} You\'re in luck! The {product} is ${price} today. Use code LIVE20 for 20% off!',
    'Best deal right now @{user} -- the {product} at ${price}. Link in bio!',
    '@{user} Special live deal on the {product} -- ${price}! Link below.'
  ],
  'interest': [
    'Thanks for the interest @{user}! The {product} is ${price} -- link in bio!',
    '@{user} Glad you like it! Grab the {product} for ${price} from the link below.',
    'Awesome @{user}! The {product} is only ${price}. Check the product card!'
  ]
}

const GENERIC_REPLIES = [
  'Thanks @{user}! Check the link in bio to shop!',
  '@{user} Tap the product card below to get yours!',
  'Glad you love it @{user}! Link in bio to order.',
  '@{user} Check the link below for details!',
  'Thanks for watching @{user}! Link in bio!'
]

export function generateContextReply(
  username: string,
  product: ReplyProduct | null,
  signalType: string
): string {
  let templates: string[]

  if (product) {
    const signalTemplates = REPLY_TEMPLATES_BY_SIGNAL[signalType]
    templates = signalTemplates && signalTemplates.length > 0
      ? signalTemplates
      : REPLY_TEMPLATES_BY_SIGNAL['purchase intent']
  } else {
    templates = GENERIC_REPLIES
  }

  const template = templates[Math.floor(Math.random() * templates.length)]

  let reply = template.replace(/\{user\}/g, username)

  if (product) {
    reply = reply
      .replace(/\{product\}/g, product.name)
      .replace(/\{price\}/g, product.price.toFixed(2))
  }

  return reply
}

export function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 0.8) return 'high'
  if (confidence >= 0.65) return 'medium'
  return 'low'
}
