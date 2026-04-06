import { useState, useEffect } from 'react'
import { fetchJob, analyzeJob, saveChoices } from '../api'

export default function AnalyzeStep({ job, onBack, onAnalyzed, onGenerate, loading, setLoading }) {
  const [fullJob, setFullJob] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState(null)
  const [accepted, setAccepted] = useState({})
  const [gapAnswers, setGapAnswers] = useState({})
  const [saving, setSaving] = useState(false)

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
        <button onClick={onBack} className="text-blue-600 hover:underline text-sm">
          Back to Discover
        </button>
      </div>
    )
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setError(null)
    try {
      const data = await analyzeJob(job.id)
      setFullJob((prev) => ({ ...prev, analysis: data.analysis, status: 'analyzed' }))
      onAnalyzed()
    } catch (err) {
      setError(err.message)
    } finally {
      setAnalyzing(false)
    }
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

  const handleSaveChoices = async () => {
    setSaving(true)
    try {
      await saveChoices(job.id, { accepted, gapAnswers })
      onGenerate()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const analysis = fullJob?.analysis

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
          &larr; Back
        </button>
        <h2 className="text-lg font-medium text-gray-900">
          {fullJob?.title || job.title} {fullJob?.company ? `- ${fullJob.company}` : ''}
        </h2>
      </div>

      {!analysis && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 mb-4">
            Run 5-layer analysis on this job ad to get CV tailoring recommendations.
          </p>
          <button
            onClick={handleAnalyze}
            disabled={analyzing || job.status === 'scrape_failed'}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? 'Analyzing (this takes ~30s)...' : 'Run Analysis'}
          </button>
          {job.status === 'scrape_failed' && (
            <p className="mt-2 text-sm text-red-600">Cannot analyze - scraping failed for this job.</p>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {analysis && (
        <>
          {/* Fit Score + Variant */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start gap-6">
              {/* Fit Score Circle */}
              <div className="shrink-0 flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white ${
                  (analysis.fit_score || 0) >= 90 ? 'bg-green-500' :
                  (analysis.fit_score || 0) >= 70 ? 'bg-blue-500' :
                  (analysis.fit_score || 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'
                }`}>
                  {analysis.fit_score || '?'}
                </div>
                <span className="text-xs text-gray-500 mt-1">Fit Score</span>
              </div>
              <div className="flex-1 min-w-0">
                {analysis.fit_summary && (
                  <p className="text-sm text-gray-700 mb-3">{analysis.fit_summary}</p>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">Variant:</span>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {analysis.base_variant}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{analysis.variant_reasoning}</p>
              </div>
            </div>
          </div>

          {/* Job Analysis */}
          <Section title="Job Analysis">
            <div className="space-y-4">
              {/* Explicit Requirements */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Explicit Requirements</h4>
                <div className="space-y-1">
                  {analysis.job_analysis?.explicit_requirements?.map((req, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded ${
                        req.priority === 'must-have'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {req.priority}
                      </span>
                      <span className="text-gray-700">{req.requirement}</span>
                      {req.frequency > 1 && (
                        <span className="text-xs text-gray-400">x{req.frequency}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              {analysis.job_analysis?.key_keywords_ranked?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Key Keywords (ranked)</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.job_analysis.key_keywords_ranked.map((kw, i) => (
                      <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Industry Language */}
              {analysis.job_analysis?.industry_language?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Industry Language</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.job_analysis.industry_language.map((term, i) => (
                      <span key={i} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Culture Signals */}
              {analysis.job_analysis?.culture_signals?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Culture Signals</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.job_analysis.culture_signals.map((s, i) => (
                      <span key={i} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Operational Context */}
              {analysis.job_analysis?.operational_context && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Operational Context</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {Object.entries(analysis.job_analysis.operational_context)
                      .filter(([_, v]) => v && v !== 'null')
                      .map(([k, v]) => (
                        <div key={k} className="bg-gray-50 p-2 rounded">
                          <span className="text-gray-400 text-xs">{k.replace(/_/g, ' ')}</span>
                          <p className="text-gray-700">{v}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </Section>

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
              onClick={handleSaveChoices}
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Choices & Generate CV'}
            </button>
          </div>
        </>
      )}
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
