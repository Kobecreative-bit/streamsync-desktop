function Replays(): JSX.Element {
  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.05 11a9 9 0 111.5 5.5L3 21l4.5-1.5A9 9 0 013.05 11z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Replays</h2>
        <p className="text-text-secondary max-w-xs mx-auto">
          Replays are automatically saved after each live stream
        </p>
      </div>
    </div>
  )
}

export default Replays
