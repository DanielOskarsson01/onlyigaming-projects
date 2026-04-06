const STATUS_COLORS = {
  scraped: 'bg-yellow-100 text-yellow-800',
  scrape_failed: 'bg-red-100 text-red-800',
  analyzed: 'bg-blue-100 text-blue-800',
  reviewed: 'bg-purple-100 text-purple-800',
  generated: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
}

export default function JobCard({ job, selected, onSelect, onDelete }) {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-gray-900 truncate">
            {job.title || 'Untitled'}
          </h3>
          {job.company && (
            <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="text-gray-400 hover:text-red-500 text-sm shrink-0"
          title="Delete"
        >
          &times;
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-600'}`}>
          {job.status}
        </span>
        {job.scrapeResult?.wordCount > 0 && (
          <span className="text-xs text-gray-400">
            {job.scrapeResult.wordCount} words
          </span>
        )}
      </div>

      {job.url && (
        <p className="text-xs text-gray-400 mt-2 truncate">{job.url}</p>
      )}

      {job.analysis?.base_variant && (
        <p className="text-xs text-gray-500 mt-1">
          Variant: <span className="font-medium">{job.analysis.base_variant}</span>
        </p>
      )}
    </div>
  )
}
