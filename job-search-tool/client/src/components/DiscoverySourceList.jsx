import { useState, useEffect } from 'react'
import { fetchSources, createSource, updateSource, deleteSource as apiDeleteSource, detectSource } from '../api'

export default function DiscoverySourceList() {
  const [sources, setSources] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [addUrl, setAddUrl] = useState('')
  const [detecting, setDetecting] = useState(false)
  const [detection, setDetection] = useState(null)
  const [error, setError] = useState(null)

  const load = async () => {
    const data = await fetchSources()
    setSources(data.sources || [])
  }

  useEffect(() => { load() }, [])

  const toggleEnabled = async (source) => {
    await updateSource(source.id, { enabled: !source.enabled })
    load()
  }

  const handleDelete = async (id) => {
    await apiDeleteSource(id)
    load()
  }

  // AI-assisted detection
  const handleDetect = async () => {
    if (!addUrl.trim()) return
    setDetecting(true)
    setError(null)
    setDetection(null)
    try {
      const result = await detectSource(addUrl.trim())
      if (result.error) {
        setError(result.error)
      } else {
        setDetection(result)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setDetecting(false)
    }
  }

  const handleConfirmAdd = async () => {
    if (!detection) return
    setError(null)
    try {
      // Derive name from URL hostname
      const hostname = new URL(detection.url).hostname.replace(/^www\./, '')
      const name = hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1)

      await createSource({
        name,
        provider: 'career_page',
        type: 'career_page',
        config: {
          url: detection.url,
          linkSelector: detection.linkPattern || 'a[href*="/job"]',
          baseUrl: new URL(detection.url).origin,
        },
        enabled: true,
      })

      setShowAdd(false)
      setAddUrl('')
      setDetection(null)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          Monitored Sites ({sources.length})
        </h3>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="text-sm text-teal-700 hover:text-teal-800 font-medium"
          >
            + Add URL
          </button>
        )}
      </div>

      {/* Source list */}
      <div className="space-y-1">
        {sources.map((s) => (
          <SourceRow key={s.id} source={s} onToggle={toggleEnabled} onDelete={handleDelete} />
        ))}
        {sources.length === 0 && (
          <p className="text-sm text-gray-400 py-2">No sources configured.</p>
        )}
      </div>

      {/* Add URL (AI-assisted) */}
      {showAdd && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex gap-2">
            <input
              value={addUrl}
              onChange={(e) => setAddUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDetect()}
              placeholder="Paste a job board or career page URL..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              autoFocus
            />
            <button
              onClick={handleDetect}
              disabled={detecting || !addUrl.trim()}
              className="px-4 py-2 bg-teal-700 text-white rounded-md text-sm font-medium hover:bg-teal-800 disabled:opacity-50"
            >
              {detecting ? 'Detecting...' : 'Detect Jobs'}
            </button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {detection && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  detection.confidence === 'high' ? 'bg-green-100 text-green-700' :
                  detection.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {detection.confidence} confidence
                </span>
                <span className="text-gray-500">{detection.pageType}</span>
                <span className="text-gray-700 font-medium">{detection.jobCount} jobs found</span>
              </div>

              {detection.jobs.length > 0 && (
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md bg-white">
                  {detection.jobs.slice(0, 10).map((job, i) => (
                    <div key={i} className="px-3 py-2 border-b border-gray-100 last:border-0 text-sm">
                      <span className="text-gray-900">{job.title}</span>
                      {job.company && <span className="text-gray-400 ml-2">- {job.company}</span>}
                    </div>
                  ))}
                  {detection.jobs.length > 10 && (
                    <div className="px-3 py-2 text-xs text-gray-400">
                      ...and {detection.jobs.length - 10} more
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleConfirmAdd}
                  className="px-3 py-1.5 bg-teal-700 text-white rounded-md text-sm font-medium hover:bg-teal-800"
                >
                  Add to Monitoring
                </button>
                <button
                  onClick={() => { setDetection(null); setAddUrl('') }}
                  className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-md text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!detection && !detecting && (
            <button
              onClick={() => { setShowAdd(false); setAddUrl(''); setError(null) }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function SourceRow({ source, onToggle, onDelete }) {
  const configUrl = source.config?.url || source.config?.baseUrl || ''

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-md hover:bg-gray-50">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => onToggle(source)}
          className={`w-8 h-5 rounded-full transition-colors relative shrink-0 ${
            source.enabled ? 'bg-green-500' : 'bg-gray-300'
          }`}
        >
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
            source.enabled ? 'left-3.5' : 'left-0.5'
          }`} />
        </button>
        <div className="min-w-0">
          <p className="text-sm text-gray-900 truncate">{source.name}</p>
          <p className="text-xs text-gray-400 truncate">
            {configUrl && <span>{configUrl}</span>}
            {source.lastChecked && (
              <span className="ml-2">
                Last: {new Date(source.lastChecked).toLocaleDateString()} ({source.lastFoundCount} found)
              </span>
            )}
            {source.lastError && <span className="text-red-500 ml-2">{source.lastError}</span>}
          </p>
        </div>
      </div>
      <button
        onClick={() => onDelete(source.id)}
        className="text-gray-400 hover:text-red-500 text-lg shrink-0 leading-none"
        title="Remove"
      >
        &times;
      </button>
    </div>
  )
}
