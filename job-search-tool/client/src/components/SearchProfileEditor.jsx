import { useState, useEffect } from 'react'
import { fetchSearchProfile, updateSearchProfile } from '../api'

export default function SearchProfileEditor() {
  const [profile, setProfile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchSearchProfile().then((data) => setProfile(data.profile))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await updateSearchProfile(profile)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!profile) return <p className="text-sm text-gray-500">Loading...</p>

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Keywords and filters used to match discovered jobs from broad sources (RemoteOK, Remotive).
        JobTech uses its own query parameters per source.
      </p>

      <TagField
        label="Keywords"
        tags={profile.keywords}
        onChange={(keywords) => setProfile({ ...profile, keywords })}
        placeholder="e.g. CMO, Head of Marketing"
      />
      <TagField
        label="Exclude Keywords"
        tags={profile.excludeKeywords || []}
        onChange={(excludeKeywords) => setProfile({ ...profile, excludeKeywords })}
        placeholder="e.g. intern, junior, student"
      />
      <TagField
        label="Locations (allowed countries — Sweden requires Stockholm unless remote)"
        tags={profile.locations}
        onChange={(locations) => setProfile({ ...profile, locations })}
        placeholder="e.g. Stockholm, Sweden, Portugal, Remote"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
        {saved && <span className="text-sm text-green-600">Saved</span>}
      </div>
    </div>
  )
}

function TagField({ label, tags, onChange, placeholder }) {
  const [input, setInput] = useState('')

  const addTag = () => {
    const val = input.trim()
    if (val && !tags.includes(val)) {
      onChange([...tags, val])
    }
    setInput('')
  }

  const removeTag = (idx) => {
    onChange(tags.filter((_, i) => i !== idx))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag() }
  }

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag, i) => (
          <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded flex items-center gap-1">
            {tag}
            <button onClick={() => removeTag(i)} className="text-gray-400 hover:text-red-500">&times;</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
        />
        <button onClick={addTag} className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-md text-sm hover:bg-gray-300">
          Add
        </button>
      </div>
    </div>
  )
}
