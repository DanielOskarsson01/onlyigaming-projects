import { useState, useEffect, useRef } from 'react'
import { analyzeJob, fetchJob } from '../api'

export default function AnalyzeStep({ jobs, onBack, onSelectForReview, onJobUpdated }) {
  const [analyzeStatus, setAnalyzeStatus] = useState({}) // { [jobId]: 'pending'|'analyzing'|'done'|'failed' }
  const [results, setResults] = useState({}) // { [jobId]: { fit_score, base_variant, fit_summary } }
  const [errors, setErrors] = useState({})
  const started = useRef(false)

  // Auto-start analysis on mount
  useEffect(() => {
    if (started.current || !jobs || jobs.length === 0) return
    started.current = true

    // Initialize status
    const initial = {}
    for (const job of jobs) {
      if (job.status === 'analyzed' || job.analysis) {
        initial[job.id] = 'done'
        setResults((prev) => ({
          ...prev,
          [job.id]: {
            fit_score: job.analysis?.fit_score,
            base_variant: job.analysis?.base_variant,
            fit_summary: job.analysis?.fit_summary,
          },
        }))
      } else {
        initial[job.id] = 'pending'
      }
    }
    setAnalyzeStatus(initial)

    async function runAll() {
      for (const job of jobs) {
        if (job.status === 'analyzed' || job.analysis) continue

        setAnalyzeStatus((prev) => ({ ...prev, [job.id]: 'analyzing' }))
        try {
          const data = await analyzeJob(job.id)
          setAnalyzeStatus((prev) => ({ ...prev, [job.id]: 'done' }))
          setResults((prev) => ({
            ...prev,
            [job.id]: {
              fit_score: data.analysis?.fit_score,
              base_variant: data.analysis?.base_variant,
              fit_summary: data.analysis?.fit_summary,
            },
          }))
        } catch (err) {
          setAnalyzeStatus((prev) => ({ ...prev, [job.id]: 'failed' }))
          setErrors((prev) => ({ ...prev, [job.id]: err.message }))
        }
      }
      if (onJobUpdated) onJobUpdated()
    }

    runAll()
  }, [jobs])

  const handleRetry = async (jobId) => {
    setAnalyzeStatus((prev) => ({ ...prev, [jobId]: 'analyzing' }))
    setErrors((prev) => ({ ...prev, [jobId]: null }))
    try {
      const data = await analyzeJob(jobId)
      setAnalyzeStatus((prev) => ({ ...prev, [jobId]: 'done' }))
      setResults((prev) => ({
        ...prev,
        [jobId]: {
          fit_score: data.analysis?.fit_score,
          base_variant: data.analysis?.base_variant,
          fit_summary: data.analysis?.fit_summary,
        },
      }))
      if (onJobUpdated) onJobUpdated()
    } catch (err) {
      setAnalyzeStatus((prev) => ({ ...prev, [jobId]: 'failed' }))
      setErrors((prev) => ({ ...prev, [jobId]: err.message }))
    }
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No jobs ready for analysis. Scrape some jobs first.</p>
        <button onClick={onBack} className="text-sm text-teal-700 hover:text-teal-800 font-medium">
          Back to Validate
        </button>
      </div>
    )
  }

  const statuses = Object.values(analyzeStatus)
  const doneCount = statuses.filter((s) => s === 'done').length
  const failedCount = statuses.filter((s) => s === 'failed').length
  const analyzingCount = statuses.filter((s) => s === 'analyzing').length
  const pendingCount = statuses.filter((s) => s === 'pending').length

  // Sort: done jobs by fit score (highest first), then analyzing, then pending, then failed
  const sortedJobs = [...jobs].sort((a, b) => {
    const sa = analyzeStatus[a.id] || 'pending'
    const sb = analyzeStatus[b.id] || 'pending'
    const order = { done: 0, analyzing: 1, pending: 2, failed: 3 }
    if (order[sa] !== order[sb]) return order[sa] - order[sb]
    if (sa === 'done' && sb === 'done') {
      return (results[b.id]?.fit_score || 0) - (results[a.id]?.fit_score || 0)
    }
    return 0
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            Evaluate ({doneCount}/{jobs.length})
          </h2>
          <p className="text-sm text-gray-500">
            {analyzingCount > 0
              ? `Analyzing ${analyzingCount} job${analyzingCount > 1 ? 's' : ''}... (~30s each)`
              : doneCount === jobs.length
                ? 'All analyses complete. Select a job to review.'
                : `${doneCount} done${failedCount > 0 ? `, ${failedCount} failed` : ''}${pendingCount > 0 ? `, ${pendingCount} pending` : ''}`
            }
          </p>
        </div>
        <button onClick={onBack} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800">
          Back
        </button>
      </div>

      <div className="space-y-2">
        {sortedJobs.map((job) => {
          const status = analyzeStatus[job.id] || 'pending'
          const result = results[job.id]
          const error = errors[job.id]

          return (
            <div
              key={job.id}
              className={`flex items-center justify-between bg-white border rounded-lg px-4 py-3 ${
                status === 'done' ? 'border-green-200' :
                status === 'failed' ? 'border-red-200' :
                status === 'analyzing' ? 'border-blue-200' :
                'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Fit score circle */}
                {status === 'done' && result?.fit_score != null ? (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0 ${
                    result.fit_score >= 90 ? 'bg-green-500' :
                    result.fit_score >= 70 ? 'bg-blue-500' :
                    result.fit_score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}>
                    {result.fit_score}
                  </div>
                ) : status === 'analyzing' ? (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 shrink-0">
                    <span className="animate-spin text-lg">⟳</span>
                  </div>
                ) : status === 'failed' ? (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100 text-red-600 shrink-0 text-lg">
                    ✗
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 text-gray-400 shrink-0 text-sm">
                    ...
                  </div>
                )}

                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {job.title || 'Untitled'}
                  </div>
                  <div className="text-sm text-gray-500 flex gap-3">
                    {job.company && <span>{job.company}</span>}
                    {status === 'done' && result?.base_variant && (
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                        {result.base_variant}
                      </span>
                    )}
                  </div>
                  {status === 'failed' && error && (
                    <p className="text-xs text-red-500 mt-1">{error}</p>
                  )}
                </div>
              </div>

              <div className="ml-4 shrink-0">
                {status === 'done' && (
                  <button
                    onClick={() => onSelectForReview(job)}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                  >
                    Review &rarr;
                  </button>
                )}
                {status === 'failed' && (
                  <button
                    onClick={() => handleRetry(job.id)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                  >
                    Retry
                  </button>
                )}
                {status === 'analyzing' && (
                  <span className="text-sm text-blue-600">Analyzing...</span>
                )}
                {status === 'pending' && (
                  <span className="text-sm text-gray-400">Waiting...</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
