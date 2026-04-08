import { useState, useEffect } from 'react'
import { fetchJob, analyzeJob, fetchPrompts } from '../api'

export default function AnalyzeStep({ job, onBack, onAnalyzed, onReview }) {
  const [fullJob, setFullJob] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState(null)
  const [prompts, setPrompts] = useState([])

  useEffect(() => {
    if (!job) return
    fetchJob(job.id).then((data) => setFullJob(data.job))
    fetchPrompts('analysis').then((data) => setPrompts(data.prompts || []))
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

  const handleAnalyze = async (promptId) => {
    setAnalyzing(true)
    setError(null)
    try {
      const data = await analyzeJob(job.id, { promptId })
      setFullJob((prev) => ({ ...prev, analysis: data.analysis, status: 'analyzed' }))
      onAnalyzed()
    } catch (err) {
      setError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  const analysis = fullJob?.analysis
  const analyses = fullJob?.analyses || []

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
            onClick={() => handleAnalyze()}
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

          {/* Analysis comparison (when multiple analyses exist) */}
          {analyses.length > 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Analysis History</h3>
              <div className="space-y-1">
                {analyses.map((a) => (
                  <div key={a.id} className={`flex items-center justify-between px-3 py-2 rounded text-sm ${
                    a.id === fullJob.activeAnalysisId ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        (a.result?.fit_score || 0) >= 70 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}>
                        {a.result?.fit_score || '?'}
                      </span>
                      <span className="text-gray-700">{a.result?.base_variant}</span>
                      <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleString()}</span>
                    </div>
                    {a.id === fullJob.activeAnalysisId && (
                      <span className="text-xs text-blue-600 font-medium">Active</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Job Analysis */}
          <Section title="Job Analysis">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Explicit Requirements</h4>
                <div className="space-y-1">
                  {analysis.job_analysis?.explicit_requirements?.map((req, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded ${
                        req.priority === 'must-have' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{req.priority}</span>
                      <span className="text-gray-700">{req.requirement}</span>
                      {req.frequency > 1 && <span className="text-xs text-gray-400">x{req.frequency}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {analysis.job_analysis?.key_keywords_ranked?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Key Keywords (ranked)</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.job_analysis.key_keywords_ranked.map((kw, i) => (
                      <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.job_analysis?.industry_language?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Industry Language</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.job_analysis.industry_language.map((term, i) => (
                      <span key={i} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded">{term}</span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.job_analysis?.culture_signals?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Culture Signals</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.job_analysis.culture_signals.map((s, i) => (
                      <span key={i} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.job_analysis?.operational_context && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Operational Context</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {Object.entries(analysis.job_analysis.operational_context)
                      .filter(([, v]) => v && v !== 'null')
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

          {/* Actions */}
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              {prompts.length > 1 && (
                <select
                  onChange={(e) => { if (e.target.value) handleAnalyze(e.target.value) }}
                  disabled={analyzing}
                  className="px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-600"
                  defaultValue=""
                >
                  <option value="" disabled>Re-analyze with different prompt...</option>
                  {prompts.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
              {analyzing && <span className="text-sm text-gray-500">Analyzing...</span>}
            </div>
            <button
              onClick={onReview}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Continue to Review &rarr;
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
