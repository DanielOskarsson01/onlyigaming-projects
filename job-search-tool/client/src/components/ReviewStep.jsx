import { useState, useEffect } from 'react'
import { fetchJob, saveChoices } from '../api'

export default function ReviewStep({ job, onBack, onSaved }) {
  const [fullJob, setFullJob] = useState(null)
  const [accepted, setAccepted] = useState({})
  const [gapAnswers, setGapAnswers] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!job) return
    fetchJob(job.id).then((data) => {
      setFullJob(data.job)
      if (data.job.userChoices) {
        setAccepted(data.job.userChoices.accepted || {})
        setGapAnswers(data.job.userChoices.gapAnswers || {})
      }
    })
  }, [job?.id])

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No job selected</p>
        <button onClick={onBack} className="text-blue-600 hover:underline text-sm">Back</button>
      </div>
    )
  }

  const analysis = fullJob?.analysis
  if (!analysis) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Job not analyzed yet.</p>
        <button onClick={onBack} className="text-blue-600 hover:underline text-sm">Back to Evaluate</button>
      </div>
    )
  }

  const toggleSuggestion = (section, index) => {
    const key = `${section}.${index}`
    setAccepted((prev) => {
      const next = { ...prev }
      if (next[key] === true) next[key] = false
      else if (next[key] === false) delete next[key]
      else next[key] = true
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await saveChoices(job.id, { accepted, gapAnswers })
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const acceptedCount = Object.values(accepted).filter((v) => v === true).length
  const rejectedCount = Object.values(accepted).filter((v) => v === false).length
  const answeredGaps = Object.values(gapAnswers).filter((v) => v?.trim()).length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700">&larr; Back</button>
        <h2 className="text-lg font-medium text-gray-900">
          Review: {fullJob?.title || job.title}
        </h2>
      </div>

      {/* Compact fit score */}
      <div className="flex items-center gap-4 bg-white rounded-lg border border-gray-200 px-4 py-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white ${
          (analysis.fit_score || 0) >= 90 ? 'bg-green-500' :
          (analysis.fit_score || 0) >= 70 ? 'bg-blue-500' :
          (analysis.fit_score || 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'
        }`}>
          {analysis.fit_score || '?'}
        </div>
        <div>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
            {analysis.base_variant}
          </span>
          {analysis.fit_summary && (
            <p className="text-xs text-gray-500 mt-1">{analysis.fit_summary}</p>
          )}
        </div>
        <div className="ml-auto text-xs text-gray-400">
          {acceptedCount} accepted, {rejectedCount} rejected, {answeredGaps} gaps answered
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Suggestions */}
      <Section title="Suggestions">
        {renderSuggestions(analysis.suggestions, accepted, toggleSuggestion)}
      </Section>

      {/* Gaps */}
      {analysis.gaps?.length > 0 && (
        <Section title="Gaps - Questions for You">
          <div className="space-y-4">
            {analysis.gaps.map((gap, i) => (
              <div key={i} className="border border-amber-200 bg-amber-50 rounded-md p-4">
                <p className="text-sm font-medium text-amber-900 mb-1">{gap.question || gap}</p>
                {gap.closest_content && (
                  <p className="text-xs text-amber-700 mb-2">
                    Closest existing: {gap.closest_content}
                  </p>
                )}
                <textarea
                  value={gapAnswers[i] || ''}
                  onChange={(e) => setGapAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                  placeholder="Your answer..."
                  rows={2}
                  className="w-full px-3 py-2 border border-amber-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Save & Continue */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save & Continue to Refine'}
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-base font-medium text-gray-900 mb-3">{title}</h3>
      {children}
    </div>
  )
}

function renderSuggestions(suggestions, accepted, toggle) {
  if (!suggestions) return <p className="text-sm text-gray-500">No suggestions.</p>

  const sections = ['summary', 'highlights', 'competencies', 'job_bullets']
  const hasAny = sections.some((s) => suggestions[s]?.has_suggestions)
  if (!hasAny) return <p className="text-sm text-gray-500">No suggestions needed.</p>

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const data = suggestions[section]
        if (!data?.has_suggestions || !data.items?.length) return null
        return (
          <div key={section}>
            <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
              {section.replace('_', ' ')}
            </h4>
            <div className="space-y-2">
              {data.items.map((item, i) => {
                const key = `${section}.${i}`
                const state = accepted[key]
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                      state === true
                        ? 'border-green-300 bg-green-50'
                        : state === false
                        ? 'border-red-200 bg-red-50 opacity-60'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    onClick={() => toggle(section, i)}
                  >
                    <span className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                      state === true
                        ? 'border-green-500 bg-green-500 text-white'
                        : state === false
                        ? 'border-red-400 bg-red-400 text-white'
                        : 'border-gray-300'
                    }`}>
                      {state === true ? '\u2713' : state === false ? '\u2717' : ''}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        item.type === 'new'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {item.type || 'changed'}
                      </span>
                      <p className="text-sm text-gray-800 mt-1">{item.text || item.suggestion || JSON.stringify(item)}</p>
                      {item.addresses && (
                        <p className="text-xs text-gray-500 mt-1">Addresses: {item.addresses}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
