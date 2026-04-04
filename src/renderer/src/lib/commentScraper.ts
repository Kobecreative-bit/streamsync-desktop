/**
 * Fallback / Demo Mode Comment Generator
 *
 * Used when webview scrapers return no results (platforms not logged in,
 * selectors not matching, etc.). Generates realistic simulated comments
 * for demonstration purposes.
 */

const FAKE_USERNAMES = [
  'ShopQueen23', 'LiveBuyer99', 'DealHunter_', 'TrendyMom', 'BargainBoss',
  'StyleGuru88', 'FashionFan_', 'SmartSaver', 'NightOwlShop', 'TechLover42',
  'GlowUpGirl', 'VibeChecker', 'CozyCorner', 'WildCard_', 'StarGazer77',
  'SunnyDays_', 'MoonlitShop', 'CityWalker', 'DreamChaser', 'HappyBuyer'
]

const REGULAR_COMMENTS = [
  'Great stream!', 'Hello from NYC!', 'Love your content!', 'Just joined!',
  'This is amazing!', 'Can you show that again?', 'You look great today!',
  'Hi from Toronto!', 'First time here!', 'Been following you for months!',
  'The quality is so good!', 'Love this vibe', 'Watching from London!',
  'Happy Friday!', 'Your setup looks professional!', 'Best live stream ever!',
  'Just shared this with my friends!', 'You always have the best stuff!',
  'Keep up the great work!', 'This energy is everything!'
]

const BUYING_COMMENTS = [
  'How much is this?', 'Price?', 'Where can I buy this?', 'I want one!',
  'Drop the link please!', 'Can I order this?', 'Do you ship to Canada?',
  'Is this still available?', 'I need this!', 'How do I purchase?',
  'Whats the cost?', 'Take my money!', 'Link please!',
  'Can you ship internationally?', 'Is there a discount code?',
  "I'm interested!", 'How to order?', 'Is it in stock?',
  'Any deals today?', 'Can I get two?'
]

const PLATFORMS: Array<'tiktok' | 'youtube' | 'instagram' | 'facebook'> = [
  'tiktok', 'youtube', 'instagram', 'facebook'
]

function generateDemoComment(): Comment {
  const isBuying = Math.random() < 0.3
  const comments = isBuying ? BUYING_COMMENTS : REGULAR_COMMENTS
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    user: FAKE_USERNAMES[Math.floor(Math.random() * FAKE_USERNAMES.length)],
    text: comments[Math.floor(Math.random() * comments.length)],
    platform: PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)],
    timestamp: Date.now(),
    isBuyingSignal: isBuying
  }
}

/** @deprecated Use generateDemoComment instead */
function generateFakeComment(): Comment {
  return generateDemoComment()
}

export { generateDemoComment, generateFakeComment }
