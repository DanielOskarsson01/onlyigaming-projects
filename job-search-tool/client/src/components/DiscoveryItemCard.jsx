const SOURCE_COLORS = {
  jobtech: 'bg-blue-100 text-blue-700',
  remoteok: 'bg-purple-100 text-purple-700',
  remotive: 'bg-green-100 text-green-700',
  career_page: 'bg-orange-100 text-orange-700',
}

const STATUS_STYLES = {
  new: 'border-blue-300 bg-blue-50/30',
  interested: 'border-green-300 bg-green-50/30',
  dismissed: 'border-gray-200 bg-gray-50 opacity-50',
  promoted: 'border-gray-200 bg-gray-50 opacity-60',
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function DiscoveryItemCard({ item, sources, onInterest, onDismiss, onPromote }) {
  const source = sources?.find((s) => s.id === item.sourceId)
  const providerColor = SOURCE_COLORS[source?.provider] || 'bg-gray-100 text-gray-600'
  const borderStyle = STATUS_STYLES[item.status] || ''

  return (
    <div className={`p-4 rounded-lg border transition-all ${borderStyle}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-gray-900 text-sm leading-snug">
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {item.title}
              </a>
            ) : (
              item.title
            )}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {item.company && (
              <span className="text-xs text-gray-500">{item.company}</span>
            )}
            {item.location && (
              <span className="text-xs text-gray-400">{item.location}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${providerColor}`}>
            {source?.name?.split(' - ')[0] || item.sourceId}
          </span>
          <span className="text-xs text-gray-400">
            {timeAgo(item.discoveredAt)}
            {item.postedAt && ` (posted ${timeAgo(item.postedAt)})`}
          </span>
        </div>
      </div>

      {item.snippet && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.snippet}</p>
      )}

      {item.status !== 'promoted' && item.status !== 'dismissed' && (
        <div className="flex items-center gap-2 mt-3">
          {item.status === 'new' && (
            <>
              <button
                onClick={() => onInterest(item.id)}
                className="px-3 py-1 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700"
              >
                Interested
              </button>
              <button
                onClick={() => onDismiss(item.id)}
                className="px-3 py-1 text-xs font-medium rounded-md bg-gray-200 text-gray-600 hover:bg-gray-300"
              >
                Dismiss
              </button>
            </>
          )}
          {item.status === 'interested' && (
            <>
              <button
                onClick={() => onPromote(item.id)}
                className="px-3 py-1 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Promote to Pipeline
              </button>
              <button
                onClick={() => onDismiss(item.id)}
                className="px-3 py-1 text-xs font-medium rounded-md bg-gray-200 text-gray-600 hover:bg-gray-300"
              >
                Dismiss
              </button>
            </>
          )}
        </div>
      )}

      {item.status === 'promoted' && (
        <p className="text-xs text-green-600 mt-2">Promoted to pipeline</p>
      )}
    </div>
  )
}
