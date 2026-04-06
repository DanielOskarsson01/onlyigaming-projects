import { useState, useEffect, useCallback } from 'react'
import { fetchDiscoveries, patchDiscoveryItem, promoteDiscoveryItem } from '../api'

export default function ValidateStep({ onValidated, onBack, loadDiscoveryCount }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [promoting, setPromoting] = useState(null)

  const loadItems = useCallback(async () => {
    try {
      const data = await fetchDiscoveries(['new', 'interested'])
      setItems(data.items || [])
    } catch (err) {
      console.error('Failed to load discoveries:', err)
    }
  }, [])

  useEffect(() => { loadItems() }, [loadItems])

  const handleDismiss = async (id) => {
    await patchDiscoveryItem(id, { status: 'dismissed' })
    setItems((prev) => prev.filter((i) => i.id !== id))
    loadDiscoveryCount()
  }

  const handlePromote = async (item) => {
    setPromoting(item.id)
    try {
      const data = await promoteDiscoveryItem(item.id)
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      loadDiscoveryCount()
      if (data.job) {
        onValidated(data.job)
      }
    } catch (err) {
      console.error('Promote failed:', err)
    } finally {
      setPromoting(null)
    }
  }

  const handleDismissAll = async () => {
    setLoading(true)
    for (const item of items) {
      await patchDiscoveryItem(item.id, { status: 'dismissed' })
    }
    setItems([])
    loadDiscoveryCount()
    setLoading(false)
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No items to validate. Run a discovery scan first.</p>
        <button
          onClick={onBack}
          className="text-sm text-teal-700 hover:text-teal-800 font-medium"
        >
          Back to Discover
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            Validate ({items.length})
          </h2>
          <p className="text-sm text-gray-500">Approve or dismiss - only approved jobs get scraped and analyzed.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDismissAll}
            disabled={loading}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Dismiss All
          </button>
          <button
            onClick={onBack}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
          >
            Back
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900 truncate">
                {item.title || 'Untitled'}
              </div>
              <div className="text-sm text-gray-500 flex gap-3">
                {item.company && <span>{item.company}</span>}
                {item.location && <span>{item.location}</span>}
              </div>
            </div>

            <div className="flex gap-2 ml-4 shrink-0">
              <button
                onClick={() => handleDismiss(item.id)}
                className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
              >
                Dismiss
              </button>
              <button
                onClick={() => handlePromote(item)}
                disabled={promoting === item.id}
                className="px-3 py-1 text-sm bg-teal-700 text-white rounded hover:bg-teal-800 disabled:opacity-50"
              >
                {promoting === item.id ? 'Scraping...' : 'Approve & Scrape'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
