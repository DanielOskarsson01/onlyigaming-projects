import { useState } from 'react'
import { scrapeUrls, createJob } from '../api'
import DiscoveryFeed from './DiscoveryFeed'
import DiscoverySourceList from './DiscoverySourceList'
import SearchProfileEditor from './SearchProfileEditor'

const TABS = ['Feed', 'Manual Add', 'Sources']

export default function DiscoverStep({ onJobsCreated, onPromoted }) {
  const [tab, setTab] = useState(0)

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((label, i) => (
          <button
            key={label}
            onClick={() => setTab(i)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === i
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 0 && (
        <DiscoveryFeed onPromoted={onPromoted} />
      )}

      {tab === 1 && (
        <ManualAdd onJobsCreated={onJobsCreated} />
      )}

      {tab === 2 && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Sources</h2>
            <DiscoverySourceList />
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Search Profile</h2>
            <SearchProfileEditor />
          </div>
        </div>
      )}
    </div>
  )
}

function ManualAdd({ onJobsCreated }) {
  const [mode, setMode] = useState('url')
  const [urls, setUrls] = useState('')
  const [pasteTitle, setPasteTitle] = useState('')
  const [pasteCompany, setPasteCompany] = useState('')
  const [pasteText, setPasteText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleScrape = async () => {
    const urlList = urls.split('\n').map((u) => u.trim()).filter(Boolean)
    if (urlList.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const data = await scrapeUrls(urlList)
      onJobsCreated(data.results)
      setUrls('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePaste = async () => {
    if (!pasteText.trim()) return
    setLoading(true)
    setError(null)
    try {
      const data = await createJob({
        title: pasteTitle || undefined,
        company: pasteCompany || undefined,
        textContent: pasteText,
      })
      onJobsCreated([data.job])
      setPasteTitle('')
      setPasteCompany('')
      setPasteText('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Add Job Ads Manually</h2>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('url')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            mode === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Scrape URLs
        </button>
        <button
          onClick={() => setMode('paste')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            mode === 'paste' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Paste Text
        </button>
      </div>

      {mode === 'url' ? (
        <div className="space-y-3">
          <textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder="Paste job ad URLs (one per line)..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleScrape}
            disabled={loading || !urls.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Scraping...' : 'Scrape'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              value={pasteTitle}
              onChange={(e) => setPasteTitle(e.target.value)}
              placeholder="Job title (optional)"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              value={pasteCompany}
              onChange={(e) => setPasteCompany(e.target.value)}
              placeholder="Company (optional)"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste the full job ad text here..."
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handlePaste}
            disabled={loading || !pasteText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Add Job'}
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  )
}
