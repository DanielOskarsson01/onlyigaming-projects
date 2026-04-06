export default function StepNav({ steps, current, onStep, badges = {} }) {
  return (
    <nav className="flex items-center gap-2">
      {steps.map((label, i) => (
        <button
          key={label}
          onClick={() => onStep(i)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors relative ${
            i === current
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {i + 1}. {label}
          {badges[i] && i !== current && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {badges[i] > 99 ? '99+' : badges[i]}
            </span>
          )}
        </button>
      ))}
    </nav>
  )
}
