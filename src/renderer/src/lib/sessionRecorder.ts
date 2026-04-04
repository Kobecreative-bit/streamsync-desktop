import { useAnalyticsStore, type StreamSession } from '../stores/analyticsStore'

export class SessionRecorder {
  private store = useAnalyticsStore.getState

  start(platforms: string[]): void {
    this.store().startSession(platforms)
  }

  recordComment(): void {
    this.store().recordComment()
  }

  recordBuyingSignal(): void {
    this.store().recordBuyingSignal()
  }

  updateViewers(count: number): void {
    this.store().updateViewerCount(count)
  }

  stop(): StreamSession | null {
    return this.store().endSession()
  }
}

export const sessionRecorder = new SessionRecorder()
