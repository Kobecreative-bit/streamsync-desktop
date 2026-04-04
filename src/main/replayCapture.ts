import { app } from 'electron'
import { join } from 'path'
import { writeFile, mkdir, readdir, rm, stat } from 'fs/promises'
import { existsSync } from 'fs'

const REPLAYS_DIR = join(app.getPath('userData'), 'replays')
const QUALITY = 50

interface ReplaySession {
  id: string
  name: string
  startTime: number
  endTime: number
  duration: number
  frameCount: number
  platforms: string[]
  thumbnailPath: string
  framesDir: string
  pinnedProduct: { name: string; price: number } | null
}

export class ReplayCapture {
  private sessionId: string | null = null
  private framesDir: string | null = null
  private frameCount = 0
  private startTime = 0
  private platforms: string[] = []
  private pinnedProduct: { name: string; price: number } | null = null

  async start(
    sessionId: string,
    platforms: string[],
    pinnedProduct?: { name: string; price: number }
  ): Promise<void> {
    if (!existsSync(REPLAYS_DIR)) {
      await mkdir(REPLAYS_DIR, { recursive: true })
    }

    const sessionDir = join(REPLAYS_DIR, sessionId)
    await mkdir(sessionDir, { recursive: true })

    this.sessionId = sessionId
    this.framesDir = sessionDir
    this.frameCount = 0
    this.startTime = Date.now()
    this.platforms = platforms
    this.pinnedProduct = pinnedProduct || null
  }

  async saveFrame(frameData: Buffer): Promise<void> {
    if (!this.framesDir || !this.sessionId) {
      throw new Error('No active replay session')
    }

    const framePath = join(this.framesDir, `${this.frameCount}.jpg`)
    await writeFile(framePath, frameData)
    this.frameCount++
  }

  async stop(): Promise<ReplaySession> {
    if (!this.sessionId || !this.framesDir) {
      throw new Error('No active replay session')
    }

    const endTime = Date.now()
    const duration = endTime - this.startTime
    const thumbnailPath =
      this.frameCount > 0 ? join(this.framesDir, '0.jpg') : ''

    const session: ReplaySession = {
      id: this.sessionId,
      name: `Stream ${new Date(this.startTime).toLocaleDateString()} ${new Date(this.startTime).toLocaleTimeString()}`,
      startTime: this.startTime,
      endTime,
      duration,
      frameCount: this.frameCount,
      platforms: this.platforms,
      thumbnailPath,
      framesDir: this.framesDir,
      pinnedProduct: this.pinnedProduct
    }

    // Write metadata file
    const metaPath = join(this.framesDir, 'meta.json')
    await writeFile(metaPath, JSON.stringify(session, null, 2))

    // Reset state
    this.sessionId = null
    this.framesDir = null
    this.frameCount = 0
    this.startTime = 0
    this.platforms = []
    this.pinnedProduct = null

    return session
  }

  static async listReplays(): Promise<ReplaySession[]> {
    if (!existsSync(REPLAYS_DIR)) {
      return []
    }

    const entries = await readdir(REPLAYS_DIR, { withFileTypes: true })
    const sessions: ReplaySession[] = []

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const metaPath = join(REPLAYS_DIR, entry.name, 'meta.json')
        if (existsSync(metaPath)) {
          try {
            const { readFile } = await import('fs/promises')
            const raw = await readFile(metaPath, 'utf-8')
            sessions.push(JSON.parse(raw))
          } catch {
            // Skip corrupted metadata
          }
        }
      }
    }

    return sessions.sort((a, b) => b.startTime - a.startTime)
  }

  static async deleteReplay(sessionId: string): Promise<void> {
    const sessionDir = join(REPLAYS_DIR, sessionId)
    if (existsSync(sessionDir)) {
      await rm(sessionDir, { recursive: true, force: true })
    }
  }

  static async getFrames(sessionId: string): Promise<string[]> {
    const sessionDir = join(REPLAYS_DIR, sessionId)
    if (!existsSync(sessionDir)) {
      return []
    }

    const files = await readdir(sessionDir)
    const frameFiles = files
      .filter((f) => f.endsWith('.jpg'))
      .sort((a, b) => {
        const numA = parseInt(a.replace('.jpg', ''), 10)
        const numB = parseInt(b.replace('.jpg', ''), 10)
        return numA - numB
      })

    return frameFiles.map((f) => join(sessionDir, f))
  }

  static async getFrameAsBase64(framePath: string): Promise<string> {
    const { readFile } = await import('fs/promises')
    const data = await readFile(framePath)
    return data.toString('base64')
  }
}

export type { ReplaySession }
