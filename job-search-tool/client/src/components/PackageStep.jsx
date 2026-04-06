import { useState, useEffect } from 'react'
import { fetchJob, downloadUrl } from '../api'

export default function PackageStep({ job, onBack }) {
  const [fullJob, setFullJob] = useState(null)

  useEffect(() => {
    if (!job) return
    fetchJob(job.id).then((data) => setFullJob(data.job))
  }, [job?.id])

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No job selected</p>
        <button onClick={onBack} className="text-teal-700 hover:underline text-sm">
          Back to Generate
        </button>
      </div>
    )
  }

  const outputs = fullJob?.outputs

  if (!outputs) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No materials generated yet.</p>
        <button onClick={onBack} className="text-teal-700 hover:underline text-sm">
          Back to Generate
        </button>
      </div>
    )
  }

  const company = fullJob?.company || fullJob?.title || 'Unknown'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
          &larr; Back
        </button>
        <h2 className="text-lg font-medium text-gray-900">
          Application Package - {company}
        </h2>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-base font-medium text-gray-900 mb-4">Ready to Send</h3>
        <div className="space-y-3">
          {outputs.cvPath && (
            <FileRow label="Tailored CV" filename={outputs.cvPath} type="docx" />
          )}
          {outputs.coverLetterPath && (
            <FileRow label="Cover Letter" filename={outputs.coverLetterPath} type="docx" />
          )}
          {outputs.suggestionsPath && (
            <FileRow label="Suggestions" filename={outputs.suggestionsPath} type="docx" />
          )}
          {outputs.responsePath && (
            <FileRow label="Full Analysis (JSON)" filename={outputs.responsePath} type="json" />
          )}
        </div>
      </div>

      {outputs.packageFolder && (
        <div className="bg-teal-50 rounded-lg border border-teal-200 p-4">
          <p className="text-sm text-teal-800">
            <strong>Package folder:</strong> {outputs.packageFolder}
          </p>
          <p className="text-xs text-teal-600 mt-1">
            Files saved to both output/ and JobSearch/Applications/
          </p>
        </div>
      )}

      {fullJob?.analysis && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-base font-medium text-gray-900 mb-2">Job Summary</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Company:</strong> {fullJob.analysis.company_name || company}</p>
            <p><strong>Variant:</strong> {fullJob.analysis.base_variant}</p>
            {fullJob.analysis.fit_score != null && (
              <p>
                <strong>Fit Score:</strong>{' '}
                <span className={`font-medium ${
                  fullJob.analysis.fit_score >= 90 ? 'text-green-600' :
                  fullJob.analysis.fit_score >= 70 ? 'text-blue-600' :
                  fullJob.analysis.fit_score >= 50 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {fullJob.analysis.fit_score}%
                </span>
              </p>
            )}
            {fullJob.analysis.fit_summary && (
              <p className="text-gray-500 text-xs mt-1">{fullJob.analysis.fit_summary}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function FileRow({ label, filename, type }) {
  return (
    <a
      href={downloadUrl(filename)}
      className="flex items-center justify-between p-3 rounded-md border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0 w-8 h-8 bg-teal-100 rounded flex items-center justify-center">
          <span className="text-xs font-medium text-teal-700 uppercase">{type}</span>
        </div>
        <span className="text-sm font-medium text-gray-900">{label}</span>
      </div>
      <span className="text-xs text-gray-400 truncate max-w-[200px]">{filename}</span>
    </a>
  )
}
