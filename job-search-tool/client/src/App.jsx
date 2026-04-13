import { useState, useEffect, useCallback } from 'react'
import StepNav from './components/StepNav'
import DiscoverStep from './components/DiscoverStep'
import ValidateStep from './components/ValidateStep'
import AnalyzeStep from './components/AnalyzeStep'
import ReviewStep from './components/ReviewStep'
import RefineStep from './components/RefineStep'
import GenerateStep from './components/GenerateStep'
import PackageStep from './components/PackageStep'
import SettingsPanel from './components/SettingsPanel'
import JobCard from './components/JobCard'
import { fetchJobs, deleteJob, fetchDiscoveries } from './api'

const STEPS = ['Discover', 'Validate', 'Evaluate', 'Review', 'Refine', 'Generate', 'Package']

function App() {
  const [step, setStep] = useState(0)
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [newDiscoveryCount, setNewDiscoveryCount] = useState(0)
  const [showSettings, setShowSettings] = useState(false)

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

  // Manual URL scrape from DiscoverStep creates jobs with status 'scraped' → go to Evaluate
  const handleJobsCreated = (newJobs) => {
    loadJobs()
    if (newJobs?.length === 1) {
      setSelectedJobId(newJobs[0].id)
      setStep(2) // Go to Evaluate
    }
  }

  // Promote from DiscoveryFeed — stay on Discover, just reload
  const handlePromoted = () => {
    loadJobs()
    loadDiscoveryCount()
  }

  // Validate done (batch promote + scrape complete) → go to Evaluate
  const handleValidateDone = () => {
    loadJobs()
    setStep(2) // Go to Evaluate
  }

  // Select a job from Evaluate to proceed to Review
  const handleSelectForReview = (job) => {
    setSelectedJobId(job.id)
    setStep(3) // Go to Review
  }

  const handleSelectJob = (job) => {
    setSelectedJobId(job.id)
    if (job.status === 'generated') setStep(6)
    else if (job.status === 'refined') setStep(5)
    else if (job.status === 'reviewed') setStep(4)
    else if (job.status === 'analyzed') setStep(3)
    else if (job.status === 'scraped') setStep(2)
    else if (job.status === 'promoted') setStep(1)
    else setStep(2)
  }

  const handleDeleteJob = async (id) => {
    await deleteJob(id)
    if (selectedJobId === id) setSelectedJobId(null)
    loadJobs()
  }

  const handleGenerated = () => { loadJobs(); setStep(6) }

  const selectedJob = jobs.find((j) => j.id === selectedJobId)

  // Badges
  const badges = { 0: newDiscoveryCount || null }

  // Count scraped jobs ready for analysis
  const scrapedCount = jobs.filter(j => j.status === 'scraped').length
  if (scrapedCount > 0) badges[2] = scrapedCount

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Job Search Tool</h1>
          <div className="flex items-center gap-4">
            <StepNav steps={STEPS} current={step} onStep={setStep} badges={badges} />
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-md transition-colors ${
                showSettings
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {showSettings ? (
          <SettingsPanel onClose={() => setShowSettings(false)} />
        ) : (
          <>
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
                onDone={handleValidateDone}
                onBack={() => setStep(0)}
                loadDiscoveryCount={loadDiscoveryCount}
              />
            )}

            {step === 2 && (
              <AnalyzeStep
                jobs={jobs.filter((j) => j.status === 'scraped')}
                onBack={() => setStep(1)}
                onSelectForReview={handleSelectForReview}
                onJobUpdated={loadJobs}
              />
            )}

            {step === 3 && (
              <ReviewStep
                job={selectedJob}
                onBack={() => setStep(2)}
                onSaved={() => { loadJobs(); setStep(4) }}
              />
            )}

            {step === 4 && (
              <RefineStep
                job={selectedJob}
                onBack={() => setStep(3)}
                onApproved={() => { loadJobs(); setStep(5) }}
              />
            )}

            {step === 5 && (
              <GenerateStep
                job={selectedJob}
                onBack={() => setStep(4)}
                onGenerated={handleGenerated}
                loading={loading}
                setLoading={setLoading}
              />
            )}

            {step === 6 && (
              <PackageStep
                job={selectedJob}
                onBack={() => setStep(5)}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App
