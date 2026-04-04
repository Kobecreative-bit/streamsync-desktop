import { getTikTokScraperScript } from './tiktokScraper'
import { getYouTubeScraperScript } from './youtubeScraper'
import { getInstagramScraperScript } from './instagramScraper'
import { getFacebookScraperScript } from './facebookScraper'

export type Platform = 'tiktok' | 'youtube' | 'instagram' | 'facebook'

const scraperMap: Record<Platform, () => string> = {
  tiktok: getTikTokScraperScript,
  youtube: getYouTubeScraperScript,
  instagram: getInstagramScraperScript,
  facebook: getFacebookScraperScript
}

export interface ScrapedComment {
  user: string
  text: string
}

export async function scrapeComments(
  webview: Electron.WebviewTag,
  platform: Platform
): Promise<ScrapedComment[]> {
  try {
    const script = scraperMap[platform]()
    const result = await webview.executeJavaScript(script)
    if (Array.isArray(result)) {
      return result.filter(
        (c): c is ScrapedComment =>
          typeof c === 'object' &&
          c !== null &&
          typeof c.user === 'string' &&
          typeof c.text === 'string' &&
          c.user.length > 0 &&
          c.text.length > 0
      )
    }
    return []
  } catch {
    return []
  }
}

export {
  getTikTokScraperScript,
  getYouTubeScraperScript,
  getInstagramScraperScript,
  getFacebookScraperScript
}
