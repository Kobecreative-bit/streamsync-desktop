interface HelpButtonProps {
  onClick: () => void
}

function HelpButton({ onClick }: HelpButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="w-9 h-9 rounded-full bg-[#1a1f35] border border-white/10 flex items-center justify-center text-[#94a3b8] hover:text-[#f97316] hover:border-[#f97316]/30 hover:bg-[#f97316]/5 transition-all duration-200 shadow-sm"
      title="Help"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="10" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"
        />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </button>
  )
}

export default HelpButton
