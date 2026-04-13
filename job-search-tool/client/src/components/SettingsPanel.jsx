import { useState, useEffect } from 'react'
import PromptEditor from './PromptEditor'
import MaterialManager from './MaterialManager'
import KnowledgeManager from './KnowledgeManager'

const TABS = ['Prompts', 'Materials', 'Knowledge', 'Model Config']

export default function SettingsPanel({ onClose }) {
  const [tab, setTab] = useState(0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Settings</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          Close Settings
        </button>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === i
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === 0 && <PromptEditor />}
        {tab === 1 && <MaterialManager />}
        {tab === 2 && <KnowledgeManager />}
        {tab === 3 && <ModelConfig />}
      </div>
    </div>
  )
}

const CLAUDE_MODELS = [
  { id: 'claude-opus-4-6', label: 'Claude Opus 4.6 (Best)' },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (Fast)' },
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (Cheapest)' },
]

function ModelConfig() {
  const [settings, setSettings] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    import('../api').then(({ fetchSettings }) =>
      fetchSettings().then((data) => setSettings(data.settings))
    )
  }, [])

  if (!settings) return <p className="text-sm text-gray-500">Loading...</p>

  const handleSave = async () => {
    setSaving(true)
    const { updateSettings } = await import('../api')
    await updateSettings(settings)
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Analysis Model</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500">Model</label>
            <select
              value={settings.analysisModel || ''}
              onChange={(e) => setSettings({ ...settings, analysisModel: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-sm bg-white"
            >
              {CLAUDE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Max Tokens</label>
            <input
              type="number"
              value={settings.analysisMaxTokens || 8000}
              onChange={(e) => setSettings({ ...settings, analysisMaxTokens: parseInt(e.target.value) })}
              className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500" title="0 = precise and consistent, 1 = creative and varied. 0.2 is recommended for analysis.">Temperature ⓘ</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={settings.analysisTemperature ?? 0.2}
              onChange={(e) => setSettings({ ...settings, analysisTemperature: parseFloat(e.target.value) })}
              className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Cover Letter Model</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">Model</label>
            <select
              value={settings.coverLetterModel || ''}
              onChange={(e) => setSettings({ ...settings, coverLetterModel: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-sm bg-white"
            >
              {CLAUDE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Max Tokens</label>
            <input
              type="number"
              value={settings.coverLetterMaxTokens || 2000}
              onChange={(e) => setSettings({ ...settings, coverLetterMaxTokens: parseInt(e.target.value) })}
              className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-sm"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  )
}
