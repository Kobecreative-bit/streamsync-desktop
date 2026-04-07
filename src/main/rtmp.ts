import { spawn, type ChildProcess } from 'child_process'
import { store } from './store'

export interface StreamKey {
  platform: 'tiktok' | 'youtube' | 'instagram' | 'facebook'
  serverUrl: string
  streamKey: string
  enabled: boolean
}

export interface RTMPStatus {
  platform: string
  status: 'idle' | 'connecting' | 'live' | 'error'
  error?: string
}

const PLATFORM_RTMP_DEFAULTS: Record<string, string> = {
  tiktok: 'rtmp://push.tiktok.com/live/',
  youtube: 'rtmp://a.rtmp.youtube.com/live2/',
  instagram: 'rtmp://live-upload.instagram.com/rtmp/',
  facebook: 'rtmp://live-api-s.facebook.com:80/rtmp/'
}

const activeProcesses: Map<string, ChildProcess> = new Map()
const statusMap: Map<string, RTMPStatus> = new Map()
let statusCallback: ((statuses: RTMPStatus[]) => void) | null = null

export function getStreamKeys(): StreamKey[] {
  return (store.get('streamKeys' as never) as StreamKey[] | undefined) || [
    { platform: 'tiktok', serverUrl: PLATFORM_RTMP_DEFAULTS.tiktok, streamKey: '', enabled: false },
    { platform: 'youtube', serverUrl: PLATFORM_RTMP_DEFAULTS.youtube, streamKey: '', enabled: false },
    { platform: 'instagram', serverUrl: PLATFORM_RTMP_DEFAULTS.instagram, streamKey: '', enabled: false },
    { platform: 'facebook', serverUrl: PLATFORM_RTMP_DEFAULTS.facebook, streamKey: '', enabled: false }
  ]
}

export function saveStreamKeys(keys: StreamKey[]): void {
  store.set('streamKeys' as never, keys as never)
}

export function getRTMPStatuses(): RTMPStatus[] {
  return Array.from(statusMap.values())
}

export function setStatusCallback(cb: ((statuses: RTMPStatus[]) => void) | null): void {
  statusCallback = cb
}

function emitStatuses(): void {
  if (statusCallback) {
    statusCallback(Array.from(statusMap.values()))
  }
}

function setStatus(platform: string, status: RTMPStatus['status'], error?: string): void {
  statusMap.set(platform, { platform, status, error })
  emitStatuses()
}

export function startRTMPStream(platform: string, serverUrl: string, streamKey: string): boolean {
  if (activeProcesses.has(platform)) {
    return false // Already streaming
  }

  const fullUrl = serverUrl + streamKey

  // Use ffmpeg to capture desktop and stream via RTMP
  // This creates a screen capture stream pushed to the RTMP endpoint
  const args = [
    '-f', 'avfoundation',
    '-framerate', '30',
    '-video_size', '1920x1080',
    '-i', '1:0', // Screen capture with audio
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-maxrate', '3000k',
    '-bufsize', '6000k',
    '-pix_fmt', 'yuv420p',
    '-g', '60',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '44100',
    '-f', 'flv',
    fullUrl
  ]

  // On Linux, use x11grab instead
  if (process.platform === 'linux') {
    args[1] = 'x11grab'
    args[5] = ':0.0'
  } else if (process.platform === 'win32') {
    args[1] = 'gdigrab'
    args[5] = 'desktop'
  }

  setStatus(platform, 'connecting')

  try {
    const proc = spawn('ffmpeg', args, {
      stdio: ['pipe', 'pipe', 'pipe']
    })

    proc.stderr?.on('data', (data: Buffer) => {
      const output = data.toString()
      // ffmpeg outputs progress info to stderr
      if (output.includes('frame=') || output.includes('fps=')) {
        setStatus(platform, 'live')
      }
    })

    proc.on('error', (err) => {
      setStatus(platform, 'error', err.message)
      activeProcesses.delete(platform)
    })

    proc.on('close', (code) => {
      if (code !== 0 && statusMap.get(platform)?.status !== 'idle') {
        setStatus(platform, 'error', `FFmpeg exited with code ${code}`)
      } else {
        setStatus(platform, 'idle')
      }
      activeProcesses.delete(platform)
    })

    activeProcesses.set(platform, proc)
    return true
  } catch (err) {
    setStatus(platform, 'error', err instanceof Error ? err.message : 'Failed to start ffmpeg')
    return false
  }
}

export function stopRTMPStream(platform: string): void {
  const proc = activeProcesses.get(platform)
  if (proc) {
    setStatus(platform, 'idle')
    proc.kill('SIGINT') // Graceful shutdown
    activeProcesses.delete(platform)
  }
}

export function stopAllRTMPStreams(): void {
  for (const [platform, proc] of activeProcesses) {
    setStatus(platform, 'idle')
    proc.kill('SIGINT')
  }
  activeProcesses.clear()
}

export function isFFmpegAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const proc = spawn('ffmpeg', ['-version'], { stdio: 'pipe' })
      proc.on('close', (code) => resolve(code === 0))
      proc.on('error', () => resolve(false))
    } catch {
      resolve(false)
    }
  })
}
