import { useState, useEffect, useCallback } from 'react'
import DiscoveryItemCard from './DiscoveryItemCard'
import {
  fetchDiscoveries,
  fetchSources,
  patchDiscoveryItem,
  promoteDiscoveryItem,
  triggerScan,
} from '../api'

const FILTERS = ['new', 'interested', 'all', 'dismissed']
const TIME_FILTERS = [
  { label: 'All Time', hours: null },
  { label: 'Last 24h', hours: 24 },
  { label: 'Last 3 Days', hours: 72 },
  { label: 'Last Week', hours: 168 },
]

export default function DiscoveryFeed({ onPromoted }) {
  const [items, setItems] = useState([])
  const [sources, setSources] = useState([])
  const [filter, setFilter] = useState('new')
  const [timeFilter, setTimeFilter] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [promoting, setPromoting] = useState(null)
  const [lastScan, setLastScan] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const statusFilter = filter === 'all' ? undefined : [filter]
      const [itemsData, sourcesData] = await Promise.all([
        fetchDiscoveries(statusFilter),
        fetchSources(),
      ])
      setItems(itemsData.items || [])
      setSources(sourcesData.sources || [])
    } catch (err) {
      setError(err.message)
    }
  }, [filter])

  useEffect(() => { load() }, [load])

  const handleScan = async () => {
    setScanning(true)
    setError(null)
    try {
      const result = await triggerScan()
      setLastScan(result)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setScanning(false)
    }
  }

  const handleInterest = async (id) => {
    await patchDiscoveryItem(id, { status: 'interested' })
    load()
  }

  const handleDismiss = async (id) => {
    await patchDiscoveryItem(id, { status: 'dismissed' })
    load()
  }

  const handlePromote = async (id) => {
    setPromoting(id)
    setError(null)
    try {
      await promoteDiscoveryItem(id, { scrape: false })
      load()
      if (onPromoted) onPromoted()
    } catch (err) {
      setError(err.message)
    } finally {
      setPromoting(null)
    }
  }

  const newCount = items.filter((i) => i.status === 'new').length

  // Apply client-side time filter
  const filteredItems = timeFilter
    ? items.filter((item) => {
        const ts = item.discoveredAt || item.createdAt
        if (!ts) return true
        return Date.now() - new Date(ts).getTime() < timeFilter * 3600000
      })
    : items

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
              {f === 'new' && newCount > 0 && filter !== 'new' && (
                <span className="ml-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                  {newCount}
                </span>
              )}
            </button>
          ))}
          <span className="mx-1 text-gray-300">|</span>
          {TIME_FILTERS.map((tf) => (
            <button
              key={tf.label}
              onClick={() => setTimeFilter(tf.hours)}
              className={`px-2.5 py-1.5 rounded-full text-xs font-medium ${
                timeFilter === tf.hours
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {lastScan && (
            <span className="text-xs text-gray-500">
              {lastScan.newFound} new, {lastScan.errors?.length || 0} errors
            </span>
          )}
          <button
            onClick={handleScan}
            disabled={scanning}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {scanning ? 'Scanning...' : 'Scan Now'}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {items.length > 0 && timeFilter ? (
            <>
              <p>No discoveries in the selected time range.</p>
              <p className="text-sm mt-1">Try a longer time range or "All Time".</p>
            </>
          ) : (
            <>
              <p>No discoveries yet.</p>
              <p className="text-sm mt-1">Click "Scan Now" to check all configured sources.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <DiscoveryItemCard
              key={item.id}
              item={item}
              sources={sources}
              onInterest={handleInterest}
              onDismiss={handleDismiss}
              onPromote={handlePromote}
            />
          ))}
        </div>
      )}
    </div>
  )
}
