import { spawn, execSync, type ChildProcess } from 'child_process'
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
  bitrate?: string
  fps?: string
  droppedFrames?: number
}

export interface MediaDevice {
  id: string
  name: string
  type: 'video' | 'audio'
}

export interface RTMPConfig {
  videoDevice: string
  audioDevice: string
  resolution: '1920x1080' | '1280x720' | '854x480'
  framerate: number
  videoBitrate: number  // kbps
  audioBitrate: number  // kbps
}

const PLATFORM_RTMP_DEFAULTS: Record<string, string> = {
  tiktok: 'rtmp://push.tiktok.com/live/',
  youtube: 'rtmp://a.rtmp.youtube.com/live2/',
  instagram: 'rtmp://live-upload.instagram.com/rtmp/',
  facebook: 'rtmp://live-api-s.facebook.com:80/rtmp/'
}

// Single ffmpeg process that sends the same camera feed to all platforms
let multiStreamProcess: ChildProcess | null = null
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

export function getRTMPConfig(): RTMPConfig {
  return (store.get('rtmpConfig' as never) as RTMPConfig | undefined) || {
    videoDevice: '0',
    audioDevice: '0',
    resolution: '1280x720',
    framerate: 30,
    videoBitrate: 4500,
    audioBitrate: 160
  }
}

export function saveRTMPConfig(config: RTMPConfig): void {
  store.set('rtmpConfig' as never, config as never)
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

function setStatus(platform: string, status: RTMPStatus['status'], extra?: Partial<RTMPStatus>): void {
  statusMap.set(platform, { platform, status, ...extra })
  emitStatuses()
}

/**
 * List available video and audio devices.
 * macOS: ffmpeg -f avfoundation -list_devices true -i ""
 * Windows: ffmpeg -f dshow -list_devices true -i dummy
 * Linux: v4l2-ctl --list-devices + arecord -l
 */
export function listMediaDevices(): MediaDevice[] {
  const devices: MediaDevice[] = []

  try {
    if (process.platform === 'darwin') {
      const output = execSync('ffmpeg -f avfoundation -list_devices true -i "" 2>&1 || true', {
        encoding: 'utf-8',
        timeout: 5000
      })
      let section: 'video' | 'audio' | null = null
      for (const line of output.split('\n')) {
        if (line.includes('AVFoundation video devices')) {
          section = 'video'
        } else if (line.includes('AVFoundation audio devices')) {
          section = 'audio'
        } else if (section) {
          const match = line.match(/\[(\d+)]\s+(.+)/)
          if (match) {
            devices.push({
              id: match[1],
              name: match[2].trim(),
              type: section
            })
          }
        }
      }
    } else if (process.platform === 'win32') {
      const output = execSync('ffmpeg -f dshow -list_devices true -i dummy 2>&1 || true', {
        encoding: 'utf-8',
        timeout: 5000
      })
      let section: 'video' | 'audio' | null = null
      for (const line of output.split('\n')) {
        if (line.includes('"video"') || line.includes('DirectShow video')) {
          section = 'video'
        } else if (line.includes('"audio"') || line.includes('DirectShow audio')) {
          section = 'audio'
        } else if (section) {
          const match = line.match(/"(.+?)"/)
          if (match && !match[1].includes('Alternative')) {
            devices.push({
              id: match[1],
              name: match[1],
              type: section
            })
          }
        }
      }
    } else {
      // Linux: basic webcam + audio detection
      try {
        const vOutput = execSync('v4l2-ctl --list-devices 2>&1 || true', { encoding: 'utf-8', timeout: 5000 })
        const vLines = vOutput.split('\n')
        for (let i = 0; i < vLines.length; i++) {
          const devMatch = vLines[i + 1]?.match(/\/dev\/video(\d+)/)
          if (vLines[i].trim() && !vLines[i].startsWith('\t') && devMatch) {
            devices.push({ id: `/dev/video${devMatch[1]}`, name: vLines[i].trim().replace(/:$/, ''), type: 'video' })
          }
        }
      } catch { /* no v4l2 */ }
      try {
        const aOutput = execSync('arecord -l 2>&1 || true', { encoding: 'utf-8', timeout: 5000 })
        for (const line of aOutput.split('\n')) {
          const match = line.match(/card (\d+):.*\[(.+?)\]/)
          if (match) {
            devices.push({ id: `hw:${match[1]}`, name: match[2], type: 'audio' })
          }
        }
      } catch { /* no arecord */ }
    }
  } catch {
    // ffmpeg not available or device listing failed
  }

  return devices
}

/**
 * Start a single ffmpeg process that captures from the webcam + mic
 * and pushes the same encoded stream to ALL enabled RTMP endpoints.
 *
 * Uses the "tee" muxer to output one encode to multiple destinations,
 * so we only encode once regardless of how many platforms we stream to.
 */
export function startMultiStream(enabledKeys: StreamKey[]): boolean {
  if (multiStreamProcess) {
    return false // Already streaming
  }

  if (enabledKeys.length === 0) {
    return false
  }

  const config = getRTMPConfig()
  const [width, height] = config.resolution.split('x')

  // Mark all platforms as connecting
  for (const key of enabledKeys) {
    setStatus(key.platform, 'connecting')
  }

  // Build ffmpeg args: capture webcam + mic, encode once, output to multiple RTMP
  const args: string[] = []

  // Input: webcam + microphone
  if (process.platform === 'darwin') {
    // macOS: avfoundation — video_device_index:audio_device_index
    args.push(
      '-f', 'avfoundation',
      '-framerate', String(config.framerate),
      '-video_size', config.resolution,
      '-pixel_format', 'uyvy422',
      '-i', `${config.videoDevice}:${config.audioDevice}`
    )
  } else if (process.platform === 'win32') {
    // Windows: dshow — separate video and audio inputs
    args.push(
      '-f', 'dshow',
      '-video_size', config.resolution,
      '-framerate', String(config.framerate),
      '-i', `video=${config.videoDevice}:audio=${config.audioDevice}`
    )
  } else {
    // Linux: v4l2 for video, alsa/pulse for audio
    args.push(
      '-f', 'v4l2',
      '-video_size', config.resolution,
      '-framerate', String(config.framerate),
      '-i', config.videoDevice,
      '-f', 'alsa',
      '-i', config.audioDevice
    )
  }

  // Video encoding: x264 optimized for live streaming
  args.push(
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-tune', 'zerolatency',
    '-b:v', `${config.videoBitrate}k`,
    '-maxrate', `${config.videoBitrate}k`,
    '-bufsize', `${config.videoBitrate * 2}k`,
    '-pix_fmt', 'yuv420p',
    '-g', String(config.framerate * 2), // keyframe every 2 seconds
    '-keyint_min', String(config.framerate),
    '-sc_threshold', '0',
    '-vf', `scale=${width}:${height}`
  )

  // Audio encoding
  args.push(
    '-c:a', 'aac',
    '-b:a', `${config.audioBitrate}k`,
    '-ar', '44100',
    '-ac', '2'
  )

  // Use tee muxer to send the same encoded stream to all platforms
  // This encodes ONCE and copies to multiple outputs = efficient
  if (enabledKeys.length === 1) {
    // Single destination — direct output
    const key = enabledKeys[0]
    args.push('-f', 'flv', key.serverUrl + key.streamKey)
  } else {
    // Multiple destinations — use tee muxer
    const teeTargets = enabledKeys
      .map((key) => `[f=flv]${key.serverUrl}${key.streamKey}`)
      .join('|')
    args.push('-f', 'tee', '-map', '0:v', '-map', '0:a', teeTargets)
  }

  try {
    multiStreamProcess = spawn('ffmpeg', args, {
      stdio: ['pipe', 'pipe', 'pipe']
    })

    multiStreamProcess.stderr?.on('data', (data: Buffer) => {
      const output = data.toString()

      // Parse ffmpeg progress output
      if (output.includes('frame=') || output.includes('fps=')) {
        // Extract stats
        const bitrateMatch = output.match(/bitrate=\s*([\d.]+kbits\/s)/)
        const fpsMatch = output.match(/fps=\s*([\d.]+)/)
        const dropMatch = output.match(/drop=\s*(\d+)/)

        for (const key of enabledKeys) {
          setStatus(key.platform, 'live', {
            bitrate: bitrateMatch?.[1] || undefined,
            fps: fpsMatch?.[1] || undefined,
            droppedFrames: dropMatch ? parseInt(dropMatch[1]) : undefined
          })
        }
      }

      // Detect errors per output
      if (output.includes('Connection refused') || output.includes('Failed to connect')) {
        // Try to identify which platform failed
        for (const key of enabledKeys) {
          if (output.includes(key.serverUrl) || output.includes(key.streamKey)) {
            setStatus(key.platform, 'error', { error: 'Connection refused — check stream key' })
          }
        }
      }

      if (output.includes('error') && output.toLowerCase().includes('no such device')) {
        for (const key of enabledKeys) {
          setStatus(key.platform, 'error', { error: 'Camera or microphone not found' })
        }
      }
    })

    multiStreamProcess.on('error', (err) => {
      for (const key of enabledKeys) {
        setStatus(key.platform, 'error', { error: err.message })
      }
      multiStreamProcess = null
    })

    multiStreamProcess.on('close', (code) => {
      for (const key of enabledKeys) {
        if (statusMap.get(key.platform)?.status !== 'idle') {
          if (code !== 0) {
            setStatus(key.platform, 'error', { error: `Stream ended unexpectedly (code ${code})` })
          } else {
            setStatus(key.platform, 'idle')
          }
        }
      }
      multiStreamProcess = null
    })

    return true
  } catch (err) {
    for (const key of enabledKeys) {
      setStatus(key.platform, 'error', { error: err instanceof Error ? err.message : 'Failed to start ffmpeg' })
    }
    multiStreamProcess = null
    return false
  }
}

/**
 * Stop the multi-stream ffmpeg process. Ends ALL platform streams at once.
 */
export function stopAllRTMPStreams(): void {
  if (multiStreamProcess) {
    // Send 'q' to ffmpeg stdin for graceful shutdown
    multiStreamProcess.stdin?.write('q')
    setTimeout(() => {
      if (multiStreamProcess) {
        multiStreamProcess.kill('SIGINT')
        multiStreamProcess = null
      }
    }, 2000)
  }
  for (const [platform] of statusMap) {
    setStatus(platform, 'idle')
  }
  statusMap.clear()
}

/**
 * Stop a single platform by restarting the stream without it.
 * Since we use a single ffmpeg process, we have to restart with the remaining platforms.
 */
export function stopRTMPStream(platform: string): void {
  setStatus(platform, 'idle')

  // If this was the only platform, just stop everything
  const liveKeys = getStreamKeys().filter(
    (k) => k.enabled && k.streamKey && statusMap.get(k.platform)?.status === 'live' && k.platform !== platform
  )

  stopAllRTMPStreams()

  // Restart with remaining platforms if any
  if (liveKeys.length > 0) {
    setTimeout(() => startMultiStream(liveKeys), 1000)
  }
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

export function isStreaming(): boolean {
  return multiStreamProcess !== null
}
