import { useState, useEffect } from 'react'
import { fetchJob, generateCv, downloadUrl } from '../api'

export default function GenerateStep({ job, onBack, onGenerated, loading, setLoading }) {
  const [fullJob, setFullJob] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!job) return
    fetchJob(job.id).then((data) => setFullJob(data.job))
  }, [job?.id])

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No job selected</p>
        <button onClick={onBack} className="text-blue-600 hover:underline text-sm">
          Back to Analyze
        </button>
      </div>
    )
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const data = await generateCv(job.id)
      setFullJob((prev) => ({ ...prev, outputs: data.outputs, status: 'generated' }))
      onGenerated()
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const outputs = fullJob?.outputs

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
          &larr; Back
        </button>
        <h2 className="text-lg font-medium text-gray-900">
          Generate - {fullJob?.company || fullJob?.title || job.title}
        </h2>
      </div>

      {!outputs && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 mb-4">
            Generate all application materials: tailored CV, cover letter, and suggestions document.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating || !fullJob?.analysis}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? 'Generating all materials...' : 'Generate All'}
          </button>
          {!fullJob?.analysis && (
            <p className="mt-2 text-sm text-amber-600">Job needs to be analyzed first.</p>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {outputs && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-base font-medium text-gray-900 mb-4">Downloads</h3>
          <div className="space-y-3">
            {outputs.cvPath && (
              <DownloadLink
                label="Tailored CV"
                filename={outputs.cvPath}
                description="Your tailored CV document"
              />
            )}
            {outputs.coverLetterPath && (
              <DownloadLink
                label="Cover Letter"
                filename={outputs.coverLetterPath}
                description="Tailored cover letter"
              />
            )}
            {outputs.suggestionsPath && (
              <DownloadLink
                label="Suggestions Document"
                filename={outputs.suggestionsPath}
                description="Detailed suggestions for CV improvements"
              />
            )}
            {outputs.responsePath && (
              <DownloadLink
                label="Full Analysis (JSON)"
                filename={outputs.responsePath}
                description="Complete AI analysis response"
              />
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="text-sm text-blue-600 hover:underline"
            >
              {generating ? 'Regenerating...' : 'Regenerate All'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DownloadLink({ label, filename, description }) {
  return (
    <a
      href={downloadUrl(filename)}
      className="flex items-center gap-3 p-3 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
    >
      <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </a>
  )
}
