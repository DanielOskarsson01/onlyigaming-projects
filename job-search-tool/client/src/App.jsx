import { useState, useEffect, useCallback } from 'react'
import StepNav from './components/StepNav'
import DiscoverStep from './components/DiscoverStep'
import ValidateStep from './components/ValidateStep'
import AnalyzeStep from './components/AnalyzeStep'
import GenerateStep from './components/GenerateStep'
import PackageStep from './components/PackageStep'
import JobCard from './components/JobCard'
import { fetchJobs, deleteJob, fetchDiscoveries } from './api'

const STEPS = ['Discover', 'Validate', 'Evaluate', 'Generate', 'Package']

function App() {
  const [step, setStep] = useState(0)
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [newDiscoveryCount, setNewDiscoveryCount] = useState(0)

  const loadJobs = useCallback(async () => {
    try {
      const data = await fetchJobs()
      setJobs(data.jobs || [])
    } catch (err) {
      console.error('Failed to load jobs:', err)
    }
  }, [])

  const loadDiscoveryCount = useCallback(async () => {
    try {
      const data = await fetchDiscoveries(['new'])
      setNewDiscoveryCount(data.total || 0)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => { loadJobs(); loadDiscoveryCount() }, [loadJobs, loadDiscoveryCount])

  const handleJobsCreated = (newJobs) => {
    loadJobs()
    if (newJobs?.length === 1) {
      setSelectedJobId(newJobs[0].id)
      setStep(2) // Go to Evaluate
    }
  }

  const handlePromoted = (job) => {
    loadJobs()
    loadDiscoveryCount()
    setSelectedJobId(job.id)
    setStep(2) // Go to Evaluate
  }

  const handleValidated = (job) => {
    loadJobs()
    setSelectedJobId(job.id)
    setStep(2) // Go to Evaluate after scraping
  }

  const handleSelectJob = (job) => {
    setSelectedJobId(job.id)
    if (job.status === 'generated') setStep(4)
    else if (job.status === 'analyzed') setStep(3)
    else setStep(2)
  }

  const handleDeleteJob = async (id) => {
    await deleteJob(id)
    if (selectedJobId === id) setSelectedJobId(null)
    loadJobs()
  }

  const handleAnalyzed = () => loadJobs()
  const handleGenerated = () => { loadJobs(); setStep(4) }

  const selectedJob = jobs.find((j) => j.id === selectedJobId)

  // Count new discoveries for badge
  const badges = { 0: newDiscoveryCount || null }

  // Count validated (ready for scrape) items
  const validatedCount = jobs.filter(j => j.status === 'validated').length
  if (validatedCount > 0) badges[1] = validatedCount

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Job Search Tool</h1>
          <StepNav steps={STEPS} current={step} onStep={setStep} badges={badges} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {step === 0 && (
          <div className="space-y-6">
            <DiscoverStep
              onJobsCreated={handleJobsCreated}
              onPromoted={handlePromoted}
            />

            {jobs.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-3">
                  Pipeline ({jobs.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      selected={job.id === selectedJobId}
                      onSelect={() => handleSelectJob(job)}
                      onDelete={() => handleDeleteJob(job.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <ValidateStep
            onValidated={handleValidated}
            onBack={() => setStep(0)}
            loadDiscoveryCount={loadDiscoveryCount}
          />
        )}

        {step === 2 && (
          <AnalyzeStep
            job={selectedJob}
            onBack={() => setStep(0)}
            onAnalyzed={handleAnalyzed}
            onGenerate={() => setStep(3)}
            loading={loading}
            setLoading={setLoading}
          />
        )}

        {step === 3 && (
          <GenerateStep
            job={selectedJob}
            onBack={() => setStep(2)}
            onGenerated={handleGenerated}
            loading={loading}
            setLoading={setLoading}
          />
        )}

        {step === 4 && (
          <PackageStep
            job={selectedJob}
            onBack={() => setStep(3)}
          />
        )}
      </main>
    </div>
  )
}

export default App
