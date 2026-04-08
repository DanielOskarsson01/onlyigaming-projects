import { useState, useEffect } from 'react'
import {
  fetchPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt,
  duplicatePrompt,
  fetchSettings,
  updateSettings,
} from '../api'

export default function PromptEditor() {
  const [prompts, setPrompts] = useState([])
  const [settings, setSettings] = useState(null)
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [pData, sData] = await Promise.all([fetchPrompts(), fetchSettings()])
    setPrompts(pData.prompts || [])
    setSettings(sData.settings || {})
  }

  useEffect(() => { load() }, [])

  const handleSelect = (prompt) => {
    setSelected(prompt.id)
    setEditing({ ...prompt })
  }

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    await updatePrompt(editing.id, { name: editing.name, systemPrompt: editing.systemPrompt })
    await load()
    setSaving(false)
  }

  const handleCreate = async (type) => {
    const name = prompt(`New ${type} prompt name:`)
    if (!name) return
    await createPrompt({ type, name, systemPrompt: '# Enter your prompt here\n' })
    load()
  }

  const handleDuplicate = async (id) => {
    await duplicatePrompt(id)
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this prompt?')) return
    await deletePrompt(id)
    if (selected === id) { setSelected(null); setEditing(null) }
    load()
  }

  const handleSetActive = async (type, id) => {
    const key = type === 'analysis' ? 'activeAnalysisPromptId' : 'activeCoverLetterPromptId'
    await updateSettings({ [key]: id })
    load()
  }

  const analysisPrompts = prompts.filter((p) => p.type === 'analysis')
  const coverLetterPrompts = prompts.filter((p) => p.type === 'cover_letter')

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <PromptList
          title="Analysis Prompts"
          prompts={analysisPrompts}
          activeId={settings?.activeAnalysisPromptId}
          selectedId={selected}
          onSelect={handleSelect}
          onSetActive={(id) => handleSetActive('analysis', id)}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onCreate={() => handleCreate('analysis')}
        />
        <PromptList
          title="Cover Letter Prompts"
          prompts={coverLetterPrompts}
          activeId={settings?.activeCoverLetterPromptId}
          selectedId={selected}
          onSelect={handleSelect}
          onSetActive={(id) => handleSetActive('cover_letter', id)}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onCreate={() => handleCreate('cover_letter')}
        />
      </div>

      {editing && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <input
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              className="text-sm font-medium px-2 py-1 border border-gray-200 rounded w-64"
            />
            <span className="text-xs text-gray-400">
              {editing.systemPrompt?.length || 0} chars
            </span>
          </div>
          <textarea
            value={editing.systemPrompt || ''}
            onChange={(e) => setEditing({ ...editing, systemPrompt: e.target.value })}
            rows={20}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setSelected(null); setEditing(null) }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function PromptList({ title, prompts, activeId, selectedId, onSelect, onSetActive, onDuplicate, onDelete, onCreate }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <button
          onClick={onCreate}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          + New
        </button>
      </div>
      <div className="space-y-1">
        {prompts.map((p) => (
          <div
            key={p.id}
            className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm ${
              selectedId === p.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelect(p)}
          >
            <div className="flex items-center gap-2">
              {activeId === p.id && (
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" title="Active" />
              )}
              <span className="text-gray-700">{p.name}</span>
              {p.isDefault && (
                <span className="text-xs text-gray-400">(default)</span>
              )}
            </div>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {activeId !== p.id && (
                <button
                  onClick={() => onSetActive(p.id)}
                  className="text-xs text-green-600 hover:text-green-800 px-1"
                  title="Set as active"
                >
                  Activate
                </button>
              )}
              <button
                onClick={() => onDuplicate(p.id)}
                className="text-xs text-gray-400 hover:text-gray-600 px-1"
              >
                Copy
              </button>
              {!p.isDefault && (
                <button
                  onClick={() => onDelete(p.id)}
                  className="text-xs text-red-400 hover:text-red-600 px-1"
                >
                  Del
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
