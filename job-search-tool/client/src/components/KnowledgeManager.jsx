import { useState, useEffect } from 'react'
import {
  fetchKnowledge,
  addKnowledgePoint,
  updateKnowledgePoint,
  deleteKnowledgePoint,
} from '../api'

const TYPES = ['bullet', 'achievement', 'competency', 'highlight', 'experience']

export default function KnowledgeManager() {
  const [data, setData] = useState({ contentPoints: [], rejectedPatterns: [] })
  const [adding, setAdding] = useState(false)
  const [newPoint, setNewPoint] = useState({ type: 'bullet', text: '', section: '', tags: '' })

  const load = async () => {
    const result = await fetchKnowledge()
    setData(result)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!newPoint.text.trim()) return
    await addKnowledgePoint({
      type: newPoint.type,
      text: newPoint.text,
      section: newPoint.section || null,
      tags: newPoint.tags ? newPoint.tags.split(',').map((t) => t.trim()) : [],
    })
    setNewPoint({ type: 'bullet', text: '', section: '', tags: '' })
    setAdding(false)
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this knowledge point?')) return
    await deleteKnowledgePoint(id)
    load()
  }

  const points = data.contentPoints || []
  const rejected = data.rejectedPatterns || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {points.length} learned content points
          {rejected.length > 0 && `, ${rejected.length} rejected patterns`}
        </p>
        <button
          onClick={() => setAdding(!adding)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          {adding ? 'Cancel' : '+ Add Manually'}
        </button>
      </div>

      {adding && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500">Type</label>
              <select
                value={newPoint.type}
                onChange={(e) => setNewPoint({ ...newPoint, type: e.target.value })}
                className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-sm"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Section</label>
              <input
                value={newPoint.section}
                onChange={(e) => setNewPoint({ ...newPoint, section: e.target.value })}
                placeholder="e.g. highlights"
                className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Tags (comma-sep)</label>
              <input
                value={newPoint.tags}
                onChange={(e) => setNewPoint({ ...newPoint, tags: e.target.value })}
                placeholder="e.g. marketing, growth"
                className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-sm"
              />
            </div>
          </div>
          <textarea
            value={newPoint.text}
            onChange={(e) => setNewPoint({ ...newPoint, text: e.target.value })}
            rows={3}
            placeholder="Content text..."
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      )}

      {points.length === 0 && !adding ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No knowledge points yet.</p>
          <p className="text-xs mt-1">Content will accumulate as you approve refinements for jobs.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {points.map((point) => (
            <div
              key={point.id}
              className="bg-white rounded-lg border border-gray-200 p-3 flex items-start gap-3"
            >
              <span className={`shrink-0 text-xs px-2 py-0.5 rounded font-medium ${
                point.type === 'achievement' ? 'bg-green-100 text-green-700' :
                point.type === 'competency' ? 'bg-purple-100 text-purple-700' :
                point.type === 'highlight' ? 'bg-blue-100 text-blue-700' :
                point.type === 'experience' ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {point.type}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">{point.text}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  {point.section && <span>Section: {point.section}</span>}
                  {point.sourceJobTitle && <span>From: {point.sourceJobTitle}</span>}
                  {point.usedInJobs?.length > 0 && (
                    <span>Used in {point.usedInJobs.length} jobs</span>
                  )}
                  {point.tags?.length > 0 && (
                    <span>{point.tags.join(', ')}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(point.id)}
                className="text-xs text-red-400 hover:text-red-600 shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {rejected.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Rejected Patterns</h3>
          <div className="space-y-1">
            {rejected.map((r, i) => (
              <div key={i} className="text-xs text-gray-500 flex items-center gap-2">
                <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                  x{r.rejectedCount}
                </span>
                <span>{r.text}</span>
                {r.reason && <span className="text-gray-400">- {r.reason}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
