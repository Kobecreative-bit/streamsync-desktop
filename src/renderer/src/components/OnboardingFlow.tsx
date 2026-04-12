import { useState, useCallback } from 'react'

interface OnboardingFlowProps {
  onComplete: () => void
}

interface OnboardingStep {
  title: string
  subtitle: string
  body: string
  illustration: () => JSX.Element
}

const steps: OnboardingStep[] = [
  {
    title: 'Welcome to StreamSync',
    subtitle: 'Your all-in-one live commerce studio',
    body: 'Go live on TikTok, YouTube, Instagram, and Facebook simultaneously, with AI-powered selling tools built right in.',
    illustration: WelcomeIllustration
  },
  {
    title: 'Connect Your Platforms',
    subtitle: 'Sign in to go live everywhere',
    body: 'On the Go Live page, you will sign into each platform directly. StreamSync keeps your sessions separate and secure — no API keys needed.',
    illustration: PlatformsIllustration
  },
  {
    title: 'Add Your First Product',
    subtitle: 'Showcase what you are selling',
    body: 'Create product cards with a name, price, and buy link. Pin any product to display it as a floating overlay on all your active streams.',
    illustration: ProductIllustration
  },
  {
    title: 'Meet Your AI Copilot',
    subtitle: 'Never miss a buying signal',
    body: 'The AI Copilot scans comments across all platforms for purchase intent and suggests instant replies so you can convert viewers into buyers.',
    illustration: CopilotIllustration
  },
  {
    title: "You're Ready!",
    subtitle: 'Time to start selling live',
    body: 'Everything is set up. Hit the button below to jump straight into your first multi-platform live stream.',
    illustration: ReadyIllustration
  }
]

function OnboardingFlow({ onComplete }: OnboardingFlowProps): JSX.Element {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState<'next' | 'back'>('next')

  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1
  const step = steps[currentStep]

  const goNext = useCallback(() => {
    if (isLast) {
      onComplete()
      return
    }
    setDirection('next')
    setCurrentStep((s) => s + 1)
  }, [isLast, onComplete])

  const goBack = useCallback(() => {
    if (isFirst) return
    setDirection('back')
    setCurrentStep((s) => s - 1)
  }, [isFirst])

  return (
    <div className="fixed inset-0 z-[60] bg-[#0a0e1a] flex flex-col items-center justify-center">
      {/* Skip link */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-8 text-sm text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
      >
        Skip
        <svg
          className="inline-block w-4 h-4 ml-1 -mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Card */}
      <div
        key={currentStep}
        className={`w-full max-w-xl px-10 py-10 flex flex-col items-center text-center animate-fade-slide-${direction}`}
        style={{
          animation: `fadeSlide${direction === 'next' ? 'Left' : 'Right'} 0.35s ease-out`
        }}
      >
        {/* Illustration */}
        <div className="mb-8">
          <step.illustration />
        </div>

        {/* Text */}
        <h1 className="text-2xl font-bold text-[#f1f5f9] mb-2">{step.title}</h1>
        <p className="text-sm font-medium text-[#f97316] mb-4">{step.subtitle}</p>
        <p className="text-sm text-[#94a3b8] leading-relaxed max-w-md">{step.body}</p>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-10 flex flex-col items-center gap-6">
        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'w-6 h-2 bg-[#f97316]'
                  : i < currentStep
                    ? 'w-2 h-2 bg-[#f97316]/40'
                    : 'w-2 h-2 bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-3">
          {!isFirst && (
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg border border-white/10 text-sm font-medium text-[#94a3b8] hover:text-[#f1f5f9] hover:border-white/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}
          <button
            onClick={goNext}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-[#f97316] hover:bg-[#f97316]/90 text-sm font-semibold text-white transition-colors"
          >
            {isLast ? 'Start Streaming' : 'Next'}
            {!isLast && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
            {isLast && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Inline keyframe animations */}
      <style>{`
        @keyframes fadeSlideLeft {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideRight {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

/* ---- Step Illustrations ---- */

function WelcomeIllustration(): JSX.Element {
  return (
    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center shadow-lg shadow-accent/20">
      <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    </div>
  )
}

function PlatformsIllustration(): JSX.Element {
  const platforms = [
    { color: '#ff0050', label: 'TK' },
    { color: '#ff0000', label: 'YT' },
    { color: '#e1306c', label: 'IG' },
    { color: '#1877f2', label: 'FB' }
  ]
  return (
    <div className="flex items-center gap-3">
      {platforms.map((p) => (
        <div
          key={p.label}
          className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg"
          style={{ backgroundColor: p.color, boxShadow: `0 8px 24px ${p.color}33` }}
        >
          {p.label}
        </div>
      ))}
    </div>
  )
}

function ProductIllustration(): JSX.Element {
  return (
    <div className="w-64 bg-[#1a1f35] border border-white/10 rounded-xl p-4 shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#f97316]/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-[#f97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#f1f5f9]">Sample Product</p>
          <p className="text-xs text-[#f97316]">$29.99</p>
        </div>
      </div>
      <div className="h-2 w-3/4 bg-white/5 rounded" />
      <div className="h-2 w-1/2 bg-white/5 rounded mt-1.5" />
    </div>
  )
}

function CopilotIllustration(): JSX.Element {
  return (
    <div className="w-64 bg-[#1a1f35] border border-white/10 rounded-xl p-4 shadow-lg space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-[#f97316]/10 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-[#f97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p className="text-xs font-semibold text-[#f97316]">Buying Signal Detected</p>
      </div>
      <div className="bg-[#f97316]/5 border border-[#f97316]/20 rounded-lg px-3 py-2">
        <p className="text-xs text-[#94a3b8]">
          <span className="text-[#f1f5f9] font-medium">@viewer:</span> How much is this?
        </p>
      </div>
      <div className="h-2 w-2/3 bg-white/5 rounded" />
    </div>
  )
}

function ReadyIllustration(): JSX.Element {
  return (
    <div className="w-24 h-24 rounded-full bg-[#22c55e]/10 border-2 border-[#22c55e]/30 flex items-center justify-center">
      <svg className="w-12 h-12 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  )
}

export default OnboardingFlow
