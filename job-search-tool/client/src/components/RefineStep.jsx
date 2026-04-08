import { useState, useEffect } from 'react'
import { fetchJob, refineJob, refineIterate, refineApprove } from '../api'

export default function RefineStep({ job, onBack, onApproved }) {
  const [fullJob, setFullJob] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [comments, setComments] = useState({})
  const [globalComment, setGlobalComment] = useState('')

  useEffect(() => {
    if (!job) return
    fetchJob(job.id).then((data) => setFullJob(data.job))
  }, [job?.id])

  const currentIteration = fullJob?.refinement?.iterations?.find(
    (i) => i.id === fullJob.refinement.activeIterationId
  )

  const handleStartRefine = async () => {
    setLoading(true)
    setError(null)
    try {
      await refineJob(job.id)
      const data = await fetchJob(job.id)
      setFullJob(data.job)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestChanges = async () => {
    const allComments = []
    for (const [key, val] of Object.entries(comments)) {
      if (val?.trim()) allComments.push(`[${key}]: ${val}`)
    }
    if (globalComment.trim()) allComments.push(globalComment)
    if (allComments.length === 0) {
      setError('Please add at least one comment before requesting changes.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await refineIterate(job.id, allComments.join('\n\n'))
      const data = await fetchJob(job.id)
      setFullJob(data.job)
      setComments({})
      setGlobalComment('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    setLoading(true)
    setError(null)
    try {
      await refineApprove(job.id)
      onApproved()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No job selected</p>
        <button onClick={onBack} className="text-blue-600 hover:underline text-sm">Back</button>
      </div>
    )
  }

  const iterationCount = fullJob?.refinement?.iterations?.length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700">&larr; Back</button>
        <h2 className="text-lg font-medium text-gray-900">
          Refine: {fullJob?.title || job.title}
        </h2>
        {iterationCount > 0 && (
          <span className="text-xs text-gray-400">Iteration {iterationCount}</span>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Start refine if no iterations yet */}
      {!currentIteration && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-600 mb-4">
            Preview how your accepted suggestions and gap answers will be integrated into the CV and cover letter.
          </p>
          <button
            onClick={handleStartRefine}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating preview...' : 'Generate Integration Preview'}
          </button>
        </div>
      )}

      {/* Preview cards */}
      {currentIteration?.preview && (
        <>
          {/* Integrated suggestions */}
          {currentIteration.preview.integratedSuggestions?.map((item, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  item.section === 'cover_letter'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {item.section?.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-400">{item.source}</span>
              </div>

              {item.original && (
                <div className="bg-red-50 border border-red-100 rounded p-2">
                  <span className="text-xs text-red-500 font-medium">Before:</span>
                  <p className="text-sm text-red-700 mt-0.5">{item.original}</p>
                </div>
              )}

              <div className="bg-green-50 border border-green-100 rounded p-2">
                <span className="text-xs text-green-500 font-medium">
                  {item.original ? 'After:' : 'New:'}
                </span>
                <p className="text-sm text-green-700 mt-0.5">{item.updated}</p>
              </div>

              {item.explanation && (
                <p className="text-xs text-gray-500">{item.explanation}</p>
              )}

              <textarea
                value={comments[`suggestion_${i}`] || ''}
                onChange={(e) => setComments({ ...comments, [`suggestion_${i}`]: e.target.value })}
                placeholder="Add a comment about this change..."
                rows={1}
                className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          ))}

          {/* Cover letter notes */}
          {currentIteration.preview.coverLetterNotes && (
            <div className="bg-white rounded-lg border border-purple-200 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                  Cover Letter Integration
                </span>
              </div>
              <p className="text-sm text-gray-700">{currentIteration.preview.coverLetterNotes}</p>
              <textarea
                value={comments.coverLetter || ''}
                onChange={(e) => setComments({ ...comments, coverLetter: e.target.value })}
                placeholder="Add a comment about the cover letter..."
                rows={1}
                className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {/* New content points */}
          {currentIteration.preview.newContentPoints?.length > 0 && (
            <div className="bg-white rounded-lg border border-green-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                New Content Points (will be saved to Knowledge Bank)
              </h3>
              <div className="space-y-1">
                {currentIteration.preview.newContentPoints.map((point, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                      {point.type}
                    </span>
                    <span className="text-gray-700">{point.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Global comment */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <textarea
              value={globalComment}
              onChange={(e) => setGlobalComment(e.target.value)}
              placeholder="General comments or instructions for the next iteration..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleRequestChanges}
              disabled={loading}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Request Changes'}
            </button>
            <button
              onClick={handleApprove}
              disabled={loading}
              className="px-6 py-2.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              Approve & Generate
            </button>
          </div>
        </>
      )}

      {/* Iteration history */}
      {iterationCount > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Iteration History</h3>
          <div className="space-y-1">
            {fullJob.refinement.iterations.map((iter, i) => (
              <div key={iter.id} className="flex items-center gap-3 text-xs text-gray-500">
                <span className={`w-2 h-2 rounded-full ${
                  iter.status === 'approved' ? 'bg-green-500' :
                  iter.status === 'commented' ? 'bg-amber-500' :
                  'bg-blue-500'
                }`} />
                <span>Iteration {i + 1}</span>
                <span>{iter.status}</span>
                <span>{new Date(iter.createdAt).toLocaleTimeString()}</span>
                {iter.userComments && (
                  <span className="text-gray-400 truncate max-w-xs">"{iter.userComments.slice(0, 60)}"</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
