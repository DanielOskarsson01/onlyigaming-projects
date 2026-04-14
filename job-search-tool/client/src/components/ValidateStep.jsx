import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchDiscoveries, fetchJobs, patchDiscoveryItem, promoteDiscoveryItem, scrapeJob, setJobText } from '../api'

export default function ValidateStep({ onDone, onBack, loadDiscoveryCount }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState('select') // 'select' | 'scraping'
  const [scrapeStatus, setScrapeStatus] = useState({}) // { [key]: { status, jobId, wordCount, error, url, title, company } }
  const [manualText, setManualText] = useState({})

  const loadItems = useCallback(async () => {
    try {
      const data = await fetchDiscoveries(['new', 'interested'])
      setItems(data.items || [])
    } catch (err) {
      console.error('Failed to load discoveries:', err)
    }
  }, [])

  // Check for already-promoted jobs that need scraping
  const autoScrapeStarted = useRef(false)
  useEffect(() => {
    loadItems()

    // Also check for promoted jobs waiting to be scraped
    fetchJobs().then((data) => {
      const promoted = (data.jobs || []).filter((j) => j.status === 'promoted')
      if (promoted.length > 0 && !autoScrapeStarted.current) {
        autoScrapeStarted.current = true
        // Auto-enter scraping phase for already-promoted jobs
        setPhase('scraping')
        const initialStatus = {}
        promoted.forEach((job) => {
          initialStatus[job.id] = {
            status: 'pending',
            jobId: job.id,
            wordCount: 0,
            error: null,
            url: job.url,
            title: job.title,
            company: job.company,
          }
        })
        setScrapeStatus(initialStatus)
        // Start scraping
        scrapePromotedJobs(promoted)
      }
    })
  }, [loadItems])

  // Scrape a list of already-promoted jobs
  const scrapePromotedJobs = async (jobs) => {
    const concurrency = 3
    let idx = 0

    async function scrapeNext() {
      while (idx < jobs.length) {
        const job = jobs[idx++]
        if (!job) break

        setScrapeStatus((prev) => ({ ...prev, [job.id]: { ...prev[job.id], status: 'scraping' } }))
        try {
          const result = await scrapeJob(job.id)
          const updated = result.job
          if (updated?.status === 'scraped') {
            setScrapeStatus((prev) => ({
              ...prev,
              [job.id]: { ...prev[job.id], status: 'done', wordCount: updated.scrapeResult?.wordCount || 0 },
            }))
          } else {
            setScrapeStatus((prev) => ({
              ...prev,
              [job.id]: { ...prev[job.id], status: 'failed', error: updated?.scrapeResult?.error || 'Scrape failed' },
            }))
          }
        } catch (err) {
          setScrapeStatus((prev) => ({
            ...prev,
            [job.id]: { ...prev[job.id], status: 'failed', error: err.message },
          }))
        }
      }
    }

    const workers = []
    for (let i = 0; i < concurrency; i++) workers.push(scrapeNext())
    await Promise.all(workers)
  }

  const handleApprove = async (id) => {
    await patchDiscoveryItem(id, { status: 'interested' })
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status: 'interested' } : i))
  }

  const handleDismiss = async (id) => {
    await patchDiscoveryItem(id, { status: 'dismissed' })
    setItems((prev) => prev.filter((i) => i.id !== id))
    loadDiscoveryCount()
  }

  const handleApproveAll = async () => {
    setLoading(true)
    for (const item of items) {
      if (item.status !== 'interested') {
        await patchDiscoveryItem(item.id, { status: 'interested' })
      }
    }
    setItems((prev) => prev.map((i) => ({ ...i, status: 'interested' })))
    setLoading(false)
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

  const approvedItems = items.filter((i) => i.status === 'interested')

  // Phase B: Promote + Scrape all approved items
  const handleStartScraping = async () => {
    if (approvedItems.length === 0) return
    setPhase('scraping')

    // Initialize status for all approved items
    const initialStatus = {}
    for (const item of approvedItems) {
      initialStatus[item.id] = { status: 'pending', jobId: null, wordCount: 0, error: null, url: item.url }
    }
    setScrapeStatus(initialStatus)

    // Step 1: Promote all (create job entries without scraping)
    const promotedJobs = []
    for (const item of approvedItems) {
      setScrapeStatus((prev) => ({ ...prev, [item.id]: { ...prev[item.id], status: 'promoting' } }))
      try {
        const result = await promoteDiscoveryItem(item.id, { scrape: false })
        promotedJobs.push({ itemId: item.id, jobId: result.job.id, url: item.url })
        setScrapeStatus((prev) => ({ ...prev, [item.id]: { ...prev[item.id], jobId: result.job.id, status: 'pending' } }))
      } catch (err) {
        setScrapeStatus((prev) => ({ ...prev, [item.id]: { ...prev[item.id], status: 'failed', error: `Promote failed: ${err.message}` } }))
      }
    }

    loadDiscoveryCount()

    // Step 2: Scrape all promoted jobs (concurrency limit of 3)
    const concurrency = 3
    let idx = 0

    async function scrapeNext() {
      while (idx < promotedJobs.length) {
        const current = promotedJobs[idx++]
        if (!current) break

        setScrapeStatus((prev) => ({ ...prev, [current.itemId]: { ...prev[current.itemId], status: 'scraping' } }))
        try {
          const result = await scrapeJob(current.jobId)
          const job = result.job
          if (job?.status === 'scraped') {
            setScrapeStatus((prev) => ({
              ...prev,
              [current.itemId]: { ...prev[current.itemId], status: 'done', wordCount: job.scrapeResult?.wordCount || 0 },
            }))
          } else {
            setScrapeStatus((prev) => ({
              ...prev,
              [current.itemId]: { ...prev[current.itemId], status: 'failed', error: job?.scrapeResult?.error || 'Scrape failed' },
            }))
          }
        } catch (err) {
          setScrapeStatus((prev) => ({
            ...prev,
            [current.itemId]: { ...prev[current.itemId], status: 'failed', error: err.message },
          }))
        }
      }
    }

    // Run N concurrent workers
    const workers = []
    for (let i = 0; i < concurrency; i++) {
      workers.push(scrapeNext())
    }
    await Promise.all(workers)
  }

  const handleManualSave = async (itemId) => {
    const text = manualText[itemId]?.trim()
    if (!text) return

    const entry = scrapeStatus[itemId]
    if (!entry?.jobId) return

    try {
      const result = await setJobText(entry.jobId, text)
      if (result.job?.status === 'scraped') {
        setScrapeStatus((prev) => ({
          ...prev,
          [itemId]: { ...prev[itemId], status: 'done', wordCount: result.job.scrapeResult?.wordCount || 0 },
        }))
      }
    } catch (err) {
      console.error('Manual save failed:', err)
    }
  }

  const handleRetry = async (itemId) => {
    const entry = scrapeStatus[itemId]
    if (!entry?.jobId) return

    setScrapeStatus((prev) => ({ ...prev, [itemId]: { ...prev[itemId], status: 'scraping', error: null } }))
    try {
      const result = await scrapeJob(entry.jobId)
      const job = result.job
      if (job?.status === 'scraped') {
        setScrapeStatus((prev) => ({
          ...prev,
          [itemId]: { ...prev[itemId], status: 'done', wordCount: job.scrapeResult?.wordCount || 0 },
        }))
      } else {
        setScrapeStatus((prev) => ({
          ...prev,
          [itemId]: { ...prev[itemId], status: 'failed', error: job?.scrapeResult?.error || 'Scrape failed' },
        }))
      }
    } catch (err) {
      setScrapeStatus((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], status: 'failed', error: err.message },
      }))
    }
  }

  // Check if all scrapes are resolved
  const statuses = Object.values(scrapeStatus)
  const allResolved = statuses.length > 0 && statuses.every((s) => s.status === 'done')
  const doneCount = statuses.filter((s) => s.status === 'done').length
  const failedCount = statuses.filter((s) => s.status === 'failed').length
  const pendingCount = statuses.filter((s) => s.status === 'pending' || s.status === 'promoting').length
  const scrapingCount = statuses.filter((s) => s.status === 'scraping').length

  // Empty state
  if (phase === 'select' && items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No items to validate. Run a discovery scan first.</p>
        <button onClick={onBack} className="text-sm text-teal-700 hover:text-teal-800 font-medium">
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
            {phase === 'select' ? `Validate (${items.length})` : `Scraping (${doneCount}/${statuses.length})`}
          </h2>
          <p className="text-sm text-gray-500">
            {phase === 'select'
              ? 'Approve or dismiss discovered jobs. Click "Scrape Approved" when ready.'
              : `${doneCount} done${failedCount > 0 ? `, ${failedCount} failed` : ''}${scrapingCount > 0 ? `, ${scrapingCount} scraping` : ''}${pendingCount > 0 ? `, ${pendingCount} pending` : ''}`
            }
          </p>
        </div>
        <div className="flex gap-2">
          {phase === 'select' && (
            <>
              <button
                onClick={handleApproveAll}
                disabled={loading}
                className="px-3 py-1.5 text-sm border border-green-300 text-green-700 rounded-md hover:bg-green-50"
              >
                Approve All
              </button>
              <button
                onClick={handleDismissAll}
                disabled={loading}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Dismiss All
              </button>
            </>
          )}
          <button onClick={onBack} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800">
            Back
          </button>
        </div>
      </div>

      {/* Phase A: Select items */}
      {phase === 'select' && (
        <>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between bg-white border rounded-lg px-4 py-3 ${
                  item.status === 'interested'
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 truncate">
                    {item.status === 'interested' && <span className="text-green-600 mr-1">✓</span>}
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
                  {item.status !== 'interested' && (
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {approvedItems.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleStartScraping}
                className="px-6 py-2.5 bg-teal-700 text-white rounded-md text-sm font-medium hover:bg-teal-800"
              >
                Scrape Approved ({approvedItems.length}) &rarr;
              </button>
            </div>
          )}
        </>
      )}

      {/* Phase B: Scraping progress */}
      {phase === 'scraping' && (
        <>
          <div className="space-y-2">
            {Object.entries(scrapeStatus).map(([key, entry]) => {
              // entry may come from discovery items or directly from promoted jobs
              const item = items.find((i) => i.id === key) || { id: key, title: entry.title, company: entry.company, url: entry.url }
              return (
                <div key={key} className={`bg-white border rounded-lg px-4 py-3 ${
                  entry.status === 'done' ? 'border-green-300' :
                  entry.status === 'failed' ? 'border-red-300' :
                  entry.status === 'scraping' ? 'border-blue-300' :
                  'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate">
                        {entry.status === 'done' && <span className="text-green-600 mr-1">✓</span>}
                        {entry.status === 'failed' && <span className="text-red-600 mr-1">✗</span>}
                        {entry.status === 'scraping' && <span className="text-blue-600 mr-1">⟳</span>}
                        {item.title || 'Untitled'}
                      </div>
                      <div className="text-sm text-gray-500 flex gap-3">
                        {item.company && <span>{item.company}</span>}
                        {entry.url && (
                          <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-xs">
                            {(() => { try { return new URL(entry.url).hostname } catch { return entry.url } })()}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 shrink-0 text-sm">
                      {entry.status === 'pending' && <span className="text-gray-400">Waiting...</span>}
                      {entry.status === 'promoting' && <span className="text-gray-400">Creating...</span>}
                      {entry.status === 'scraping' && <span className="text-blue-600">Scraping...</span>}
                      {entry.status === 'done' && <span className="text-green-600">{entry.wordCount} words</span>}
                      {entry.status === 'failed' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRetry(key)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                          >
                            Retry
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manual paste fallback for failed scrapes */}
                  {entry.status === 'failed' && (
                    <div className="mt-3 border-t border-red-200 pt-3">
                      <p className="text-sm text-red-600 mb-2">{entry.error}</p>
                      {entry.url && (
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-sm text-blue-600 hover:underline mb-2"
                        >
                          Open job page in browser &rarr;
                        </a>
                      )}
                      <textarea
                        value={manualText[key] || ''}
                        onChange={(e) => setManualText((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder="Paste the job description here..."
                        className="w-full h-32 p-3 border border-gray-300 rounded-md text-sm font-mono resize-y"
                      />
                      <button
                        onClick={() => handleManualSave(key)}
                        disabled={!manualText[key]?.trim()}
                        className="mt-2 px-4 py-1.5 bg-teal-700 text-white rounded text-sm hover:bg-teal-800 disabled:opacity-50"
                      >
                        Save Manual Text
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {(allResolved || (doneCount > 0 && failedCount === 0 && scrapingCount === 0 && pendingCount === 0)) && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={onDone}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Continue to Evaluate &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
