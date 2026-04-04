import { store } from './store'

interface ReplayMeta {
  id: string
  name: string
  startTime: number
  endTime: number
  duration: number
  frameCount: number
  platforms: string[]
  thumbnailPath: string
  pinnedProduct: { name: string; price: number } | null
}

export function saveReplayMeta(meta: ReplayMeta): void {
  const replays = store.get('replays', []) as ReplayMeta[]
  replays.push(meta)
  store.set('replays', replays)
}

export function getReplays(): ReplayMeta[] {
  return store.get('replays', []) as ReplayMeta[]
}

export function deleteReplayMeta(id: string): void {
  const replays = store.get('replays', []) as ReplayMeta[]
  store.set(
    'replays',
    replays.filter((r) => r.id !== id)
  )
}

export type { ReplayMeta }
