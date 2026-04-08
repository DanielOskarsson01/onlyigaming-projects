import { useState, useEffect, useRef } from 'react'
import {
  fetchMaterials,
  uploadMaterial,
  updateMaterial,
  deleteMaterial,
  fetchMaterialContent,
  fetchMaterialSets,
  createMaterialSet,
  updateMaterialSet,
  deleteMaterialSet,
} from '../api'

const CATEGORIES = ['cv', 'competencies', 'variants', 'other']

export default function MaterialManager() {
  const [materials, setMaterials] = useState([])
  const [sets, setSets] = useState([])
  const [preview, setPreview] = useState(null)
  const fileRef = useRef()

  const load = async () => {
    const [mData, sData] = await Promise.all([fetchMaterials(), fetchMaterialSets()])
    setMaterials(mData.materials || [])
    setSets(sData.materialSets || [])
  }

  useEffect(() => { load() }, [])

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const name = window.prompt('Material name:', file.name.replace(/\.[^.]+$/, ''))
    if (!name) return
    const category = window.prompt('Category (cv, competencies, variants, other):', 'other')
    await uploadMaterial({
      name,
      content: text,
      originalFilename: file.name,
      category: category || 'other',
    })
    load()
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this material?')) return
    await deleteMaterial(id)
    load()
  }

  const handlePreview = async (id) => {
    if (preview?.id === id) { setPreview(null); return }
    const data = await fetchMaterialContent(id)
    setPreview({ id, content: data.content })
  }

  const handleToggle = async (mat) => {
    await updateMaterial(mat.id, { enabled: !mat.enabled })
    load()
  }

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    items: materials.filter((m) => m.category === cat),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {materials.length} materials loaded
        </p>
        <label className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 cursor-pointer">
          Upload File
          <input
            ref={fileRef}
            type="file"
            accept=".md,.json,.txt,.csv"
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      {grouped.map(({ category, items }) => (
        <div key={category} className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2 capitalize">{category}</h3>
          <div className="space-y-1">
            {items.map((mat) => (
              <div key={mat.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50">
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    onClick={() => handleToggle(mat)}
                    className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${
                      mat.enabled
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 text-gray-300'
                    }`}
                  >
                    {mat.enabled ? '\u2713' : ''}
                  </button>
                  <span className={`text-sm truncate ${mat.enabled ? 'text-gray-700' : 'text-gray-400'}`}>
                    {mat.name}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">
                    ({mat.originalFilename})
                  </span>
                  {mat.isDefault && (
                    <span className="text-xs text-gray-400">(default)</span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handlePreview(mat.id)}
                    className="text-xs text-blue-500 hover:text-blue-700 px-1"
                  >
                    {preview?.id === mat.id ? 'Hide' : 'Preview'}
                  </button>
                  {!mat.isDefault && (
                    <button
                      onClick={() => handleDelete(mat.id)}
                      className="text-xs text-red-400 hover:text-red-600 px-1"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {preview && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Preview</h3>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-64 overflow-y-auto font-mono bg-gray-50 p-3 rounded">
            {preview.content?.slice(0, 5000)}
            {(preview.content?.length || 0) > 5000 && '\n\n... (truncated)'}
          </pre>
        </div>
      )}

      {/* Material Sets */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Material Sets</h3>
          <button
            onClick={async () => {
              const name = window.prompt('New set name:')
              if (!name) return
              await createMaterialSet({ name, materialIds: materials.filter(m => m.enabled).map(m => m.id) })
              load()
            }}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            + New Set
          </button>
        </div>
        <div className="space-y-2">
          {sets.map((set) => (
            <div key={set.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">{set.name}</span>
                <span className="text-xs text-gray-400">({set.materialIds?.length || 0} items)</span>
                {set.isDefault && <span className="text-xs text-gray-400">(default)</span>}
              </div>
              {!set.isDefault && (
                <button
                  onClick={async () => {
                    if (confirm('Delete this set?')) { await deleteMaterialSet(set.id); load() }
                  }}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
