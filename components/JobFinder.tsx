
import React, { useState, useEffect } from 'react';
import { JobSearchResult, ResumeRewriteResult, JobListing, SavedJob, JobStatus, RecentSearch, JobAlert, SavedResume } from '../types';
import { searchJobs } from '../services/geminiService';
import { 
    saveJob, getSavedJobs, deleteSavedJob, isJobSaved, updateJobStatus, clearAllSavedJobs, 
    getRecentSearches, saveRecentSearch, getJobAlerts, saveJobAlert, deleteJobAlert, getSavedResumes,
    getAppSettings, saveJobWithReminder, toggleFavorite, isFavorited,
    getHubTasks, saveHubTask, deleteHubTask, getHubReminders, saveHubReminder, deleteHubReminder
} from '../services/storageService';
import heroImage from '@assets/microsoft-365-TLiWhlDEJwA-unsplash_1766438656269.jpg';

interface JobFinderProps {
  resumeData: ResumeRewriteResult | null;
}

const COUNTRIES = ["United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Remote"];
const JOB_TYPES = ["any", "full-time", "part-time", "contract", "internship"];
const SALARIES = ["", "50000", "80000", "120000", "150000"];
const RECENCY_OPTIONS = [
    { label: "Any Time", value: "any" },
    { label: "Last 24 Hours", value: "24h" },
    { label: "Last 3 Days", value: "3d" },
    { label: "Last Week", value: "7d" }
];
const APPLICATION_STATUSES: JobStatus[] = ['Interested', 'Applied', 'Interviewing', 'Rejected'];

export const JobFinder: React.FC<JobFinderProps> = ({ resumeData }) => {
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [currentResumeData, setCurrentResumeData] = useState<ResumeRewriteResult | null>(resumeData);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'resume' | 'custom' | 'bookmarks' | 'alerts'>('resume');
  const [customKeywords, setCustomKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('United States');
  const [preferences, setPreferences] = useState('');
  const [jobType, setJobType] = useState('any');
  const [minSalary, setMinSalary] = useState('');
  const [recencyFilter, setRecencyFilter] = useState('any');
  
  // Advanced Preferences
  const [culturePref, setCulturePref] = useState('');
  const [remotePref, setRemotePref] = useState('Any');
  const [skillTags, setSkillTags] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [result, setResult] = useState<JobSearchResult | null>(null);
  const [bookmarks, setBookmarks] = useState<SavedJob[]>([]);
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'All'>('All');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [lastSearchResult, setLastSearchResult] = useState<JobSearchResult | null>(null);
  const [lastSearchParams, setLastSearchParams] = useState<any>(null);
  const [actionTrigger, setActionTrigger] = useState(0); // Force re-render when actions change

  useEffect(() => {
    setSavedResumes(getSavedResumes());
    setCurrentResumeData(resumeData);
  }, [resumeData]);

  useEffect(() => {
    refreshBookmarks();
    refreshAlerts();
  }, [searchMode]);

  const refreshBookmarks = () => {
    setBookmarks(getSavedJobs());
  };

  const refreshAlerts = () => {
    setAlerts(getJobAlerts());
  };

  const handleSearch = async () => {
    setLoading(true);
    setLoadingProgress(0);
    setLoadingMessage("Connecting to Job Index...");
    
    try {
      // Stage 1: Quick connection
      setLoadingProgress(10);
      setLoadingMessage("Analyzing resume alignment...");
      
      // Combined resume + custom search: use resume if available, optionally combine with custom keywords
      let sourceText = '';
      if (currentResumeData) {
        sourceText = currentResumeData.originalText;
        if (customKeywords.trim()) {
          sourceText += `\n\nAdditional search keywords: ${customKeywords}`;
        }
      } else {
        sourceText = customKeywords;
      }
      
      // Store search params for persistence
      const searchParams = {
        sourceText,
        preferences,
        location,
        recencyFilter,
        country,
        jobType,
        minSalary,
        culturePref,
        remotePref
      };
      setLastSearchParams(searchParams);
      
      setLoadingProgress(30);
      setLoadingMessage("Searching job boards...");
      
      const data = await searchJobs(
        sourceText, 
        preferences, 
        location, 
        recencyFilter, 
        'relevance', 
        country, 
        '', 
        jobType, 
        '', 
        minSalary,
        { culture: culturePref, remote: remotePref }
      );

      // Stage 2: Quick ranking
      setLoadingProgress(90);
      setLoadingMessage("Ranking matches...");

      setResult(data);
      setLastSearchResult(data);
      setLoadingProgress(100);
      
      // Persist to localStorage for tab switching
      localStorage.setItem('jobFinder_lastResult', JSON.stringify(data));
      localStorage.setItem('jobFinder_lastParams', JSON.stringify(searchParams));
      
      // Save recent search if we have either resume data or custom keywords
      if (customKeywords.trim() || currentResumeData) {
        saveRecentSearch({
          keywords: customKeywords || (currentResumeData?.structuredResume?.title || 'Resume Match'),
          location,
          country,
          jobType
        });
      }
    } catch (e: any) { 
      alert(e.message || "Job search encountered an error."); 
    } finally { 
      setLoading(false); 
    }
  };

  // Individual handlers for favorites, tasks, and reminders
  const handleToggleFavorite = (e: React.MouseEvent, job: JobListing) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({
      id: job.applyUrl,
      title: job.title,
      link: job.applyUrl,
      description: `${job.company} - ${job.location}`,
      category: 'jobs',
      date: new Date().toISOString()
    });
    refreshBookmarks();
    setActionTrigger(prev => prev + 1); // Force re-render
  };

  const handleToggleTask = (e: React.MouseEvent, job: JobListing) => {
    e.preventDefault();
    e.stopPropagation();
    const tasks = getHubTasks();
    const taskTitle = `Apply to ${job.title} at ${job.company}`;
    const existingTask = tasks.find(t => t.title === taskTitle);
    if (existingTask) {
      deleteHubTask(existingTask.id);
    } else {
      saveHubTask({
        title: taskTitle,
        description: `${job.location} - ${job.salary || 'Salary not specified'}`,
        completed: false,
        priority: 'medium',
        category: 'job-search'
      });
    }
    setActionTrigger(prev => prev + 1); // Force re-render
  };

  const handleToggleReminder = (e: React.MouseEvent, job: JobListing) => {
    e.preventDefault();
    e.stopPropagation();
    const reminders = getHubReminders();
    const reminderTitle = `Apply to ${job.title} at ${job.company}`;
    const existingReminder = reminders.find(r => r.title === reminderTitle);
    if (existingReminder) {
      deleteHubReminder(existingReminder.id);
    } else {
      const settings = getAppSettings();
      const reminderDate = new Date();
      reminderDate.setHours(reminderDate.getHours() + settings.defaultReminderHours);
      saveHubReminder({
        title: reminderTitle,
        datetime: reminderDate.toISOString(),
        completed: false
      });
    }
    setActionTrigger(prev => prev + 1); // Force re-render
  };

  const handleStatusChange = (applyUrl: string, status: JobStatus) => {
    updateJobStatus(applyUrl, status);
    refreshBookmarks();
  };

  const handleCreateAlert = () => {
    const alertData = {
        keywords: customKeywords || (currentResumeData?.structuredResume.title || 'General Search'),
        location,
        country,
        jobType,
        recency: recencyFilter
    };
    saveJobAlert(alertData);
    refreshAlerts();
    alert("Subscription active! You'll be notified of new matches.");
  };

  const getGhostColor = (risk: string) => {
    if (risk === 'High') return 'text-red-500 bg-red-50 border-red-100';
    if (risk === 'Medium') return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-emerald-600 bg-emerald-50 border-emerald-100';
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'Applied': return 'bg-blue-600 text-white';
      case 'Interviewing': return 'bg-purple-600 text-white';
      case 'Rejected': return 'bg-slate-400 text-white';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const filteredBookmarks = statusFilter === 'All' 
    ? bookmarks 
    : bookmarks.filter(j => j.status === statusFilter);

  const jobList = searchMode === 'bookmarks' ? filteredBookmarks : (result?.structuredJobs || []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
          {/* Hero Header */}
          <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 text-white mb-8 shadow-2xl border border-slate-800">
            <div className="absolute inset-0">
              <img src={heroImage} alt="" className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/50"></div>
            </div>
            <div className="relative z-10 p-10 md:p-16">
              <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-white/10 text-cyan-300">
                Career Search
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
                Smart Job <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-200 to-white">Discovery.</span>
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed font-medium max-w-xl">
                AI-powered job matching that aligns opportunities with your resume and career goals.
              </p>
            </div>
          </div>

          {/* Search Module */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        {searchMode === 'bookmarks' ? 'Saved Applications' : 'Market Search'}
                        {searchMode === 'alerts' && <span className="text-sm bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">ALERTS ACTIVE</span>}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                      {searchMode === 'bookmarks' ? 'Manage and track your active job funnel.' : 'AI-driven job matching with deep resume alignment.'}
                    </p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex gap-1">
                    {[
                      { id: 'resume', label: 'Match Resume & Pro Search', icon: '✨' },
                      { id: 'bookmarks', label: 'Saved Jobs', icon: '📁' },
                      { id: 'alerts', label: 'Alerts', icon: '🔔' }
                    ].map(tab => (
                      <button 
                        key={tab.id}
                        onClick={() => setSearchMode(tab.id as any)} 
                        className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${searchMode === tab.id ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <span>{tab.icon}</span> {tab.label}
                      </button>
                    ))}
                </div>
              </div>

              {/* Resume Selector - Only show for search modes that use resume */}
              {(searchMode === 'resume' || searchMode === 'custom') && (
                <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800">
                  <label className="block text-xs font-black text-blue-900 dark:text-blue-200 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span>📄</span> Resume-Based Search
                  </label>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-4 font-medium">
                    Jobs will be matched based on the selected resume. Select a resume to update the search context.
                  </p>
                  <select
                    value={selectedResumeId || ''}
                    onChange={(e) => {
                      const resumeId = e.target.value;
                      if (resumeId) {
                        const selectedResume = savedResumes.find(r => r.id === resumeId);
                        if (selectedResume) {
                          setCurrentResumeData(selectedResume.data);
                          setSelectedResumeId(resumeId);
                        }
                      } else {
                        setSelectedResumeId(null);
                        if (resumeData) {
                          setCurrentResumeData(resumeData);
                        }
                      }
                    }}
                    className="w-full pl-4 py-3 rounded-xl border-2 border-blue-300 dark:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-medium"
                  >
                    <option value="">
                      {selectedResumeId 
                        ? `${savedResumes.find(r => r.id === selectedResumeId)?.name || 'Current Resume'} - Active`
                        : resumeData ? 'Using current resume - Select another to change...' : 'Select a resume to base job search on...'}
                    </option>
                    {savedResumes.length === 0 ? (
                      <option disabled>No saved resumes yet</option>
                    ) : (
                      savedResumes.map(resume => (
                        <option key={resume.id} value={resume.id}>
                          {resume.name} - {new Date(resume.date).toLocaleDateString()}
                        </option>
                      ))
                    )}
                  </select>
                  {(selectedResumeId || resumeData) && (
                    <p className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2">
                      <span>✓</span> Search is actively using: {selectedResumeId ? (savedResumes.find(r => r.id === selectedResumeId)?.name || 'Selected Resume') : (resumeData ? 'Current Resume' : 'No Resume')}
                    </p>
                  )}
                </div>
              )}

              {searchMode === 'bookmarks' ? (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 animate-in fade-in">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Application Status:</span>
                  <div className="flex flex-wrap gap-2">
                    {['All', ...APPLICATION_STATUSES].map(status => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status as any)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${statusFilter === status ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => { if(window.confirm("Clear all bookmarks?")) { clearAllSavedJobs(); refreshBookmarks(); } }} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">🗑️ Flush All</button>
              </div>
              ) : searchMode === 'alerts' ? (
                <div className="space-y-4 animate-in fade-in">
                  {alerts.length > 0 ? (
                    alerts.map(alert => (
                      <div key={alert.id} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{alert.keywords}</h4>
                          <p className="text-xs text-slate-500">{alert.location || 'Global'} • {alert.jobType} • {alert.recency} window</p>
                        </div>
                        <button onClick={() => { deleteJobAlert(alert.id); refreshAlerts(); }} className="p-2 text-slate-300 hover:text-red-500 transition-colors">✕</button>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-slate-400 italic">No active alerts. Use "Pro Search" to subscribe.</div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="animate-in slide-in-from-top-4 duration-300">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">Keywords / Target Role (Optional)</label>
                      <input value={customKeywords} onChange={e => setCustomKeywords(e.target.value)} placeholder="e.g. Lead Designer, Python Developer... (Leave empty to match resume)" className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-inner" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">Metro Area / City</label>
                          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Remote, NYC, London..." className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none shadow-inner" />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">Region / Country</label>
                          <select value={country} onChange={e => setCountry(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer shadow-inner font-bold text-slate-700 dark:text-white">
                              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">Recency</label>
                          <select value={recencyFilter} onChange={e => setRecencyFilter(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-widest text-brand-600">
                              {RECENCY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">Salary Floor</label>
                        <select value={minSalary} onChange={e => setMinSalary(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-widest">
                            <option value="">Any Range</option>
                            {SALARIES.slice(1).map(s => <option key={s} value={s}>${parseInt(s).toLocaleString()}+</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">Commitment</label>
                        <select value={jobType} onChange={e => setJobType(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-widest">
                            {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                  </div>
                </div>
              )}
            </div>

            {(searchMode === 'resume' || searchMode === 'custom') && (
              <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-4">
                <button 
                  onClick={handleCreateAlert} 
                  className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-2 hover:bg-orange-50 px-4 py-2 rounded-xl transition-colors"
                >
                  🔔 Subscribe to Alerts
                </button>
                <button 
                  onClick={handleSearch} 
                  disabled={loading} 
                  className="px-10 py-4 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 active:scale-95 text-lg min-w-[220px] flex items-center justify-center gap-4"
                >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="text-sm">{loadingProgress}%</span>
                      </>
                    ) : "Execute Search 🚀"}
                </button>
              </div>
            )}

            {/* Progress Overlays */}
            {loading && (
                <div className="px-8 pb-8">
                  <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-12 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center justify-center animate-in fade-in">
                      <div className="w-full max-w-md h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden relative">
                          <div className="absolute inset-y-0 left-0 bg-brand-500 transition-all duration-700 shadow-[0_0_15px_#0ea5e9]" style={{ width: `${loadingProgress}%` }}></div>
                      </div>
                      <h4 className="text-xl font-black text-slate-800 dark:text-white mb-2">{loadingMessage}</h4>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] animate-pulse">Syncing with Global Employment Network...</p>
                  </div>
                </div>
            )}
          </div>

          {/* Search Results */}
          <div className="space-y-6">
            {jobList.length > 0 ? (
              jobList.map((job) => {
                const isSaved = isJobSaved(job.applyUrl);
                const isExpanded = expandedJobId === job.id;
                const isFav = isFavorited(job.applyUrl);
                const tasks = getHubTasks();
                const reminders = getHubReminders();
                const taskTitle = `Apply to ${job.title} at ${job.company}`;
                const reminderTitle = `Apply to ${job.title} at ${job.company}`;
                const isInTasks = tasks.some(t => t.title === taskTitle);
                const isInReminders = reminders.some(r => r.title === reminderTitle);
                
                return (
                  <div key={job.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 flex flex-col md:flex-row gap-8 hover:shadow-2xl transition-all group">
                    <div className="md:w-20 shrink-0 flex flex-col items-center">
                      <div className={`w-20 h-20 rounded-3xl bg-slate-900 text-white font-black text-3xl flex items-center justify-center uppercase shadow-xl ${!isSaved ? 'group-hover:scale-110' : ''} transition-transform`}>
                          {job.company.substring(0,2)}
                      </div>
                      <div 
                        onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                        className={`mt-6 flex flex-col items-center justify-center w-full p-3 rounded-2xl border-2 transition-all cursor-pointer ${job.matchScore >= 80 ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 'border-slate-100 text-slate-400 bg-slate-50'} hover:scale-105`}
                      >
                          <span className="text-[10px] font-black uppercase tracking-widest">Match</span>
                          <span className="text-2xl font-black">{job.matchScore}%</span>
                          <span className="text-[8px] font-bold mt-1 text-slate-400 uppercase tracking-tighter">{isExpanded ? 'Collapse' : 'Breakdown'}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div>
                          <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-1">{job.title}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 font-bold uppercase tracking-wider">
                            <span className="text-slate-900 dark:text-slate-200">{job.company}</span>
                            <span>•</span>
                            <span>{job.location}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all bg-brand-600 text-white border-brand-600 hover:bg-brand-700 flex items-center gap-2"
                          >
                            Apply Direct →
                          </a>
                          <button 
                            className="px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-600 hover:border-slate-400"
                          >
                            Match Intel
                          </button>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={(e) => handleToggleFavorite(e, job)}
                              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all z-20 ${
                                isFav
                                  ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border-2 border-pink-300 dark:border-pink-700'
                                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 opacity-40 hover:opacity-60 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-500 hover:border-pink-200 dark:hover:border-pink-800'
                              }`}
                              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              {isFav ? '❤️' : '🤍'}
                            </button>
                            <button
                              onClick={(e) => handleToggleTask(e, job)}
                              className={`w-9 h-9 rounded-lg border flex items-center justify-center text-lg transition-all ${
                                isInTasks
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 opacity-40 hover:opacity-60 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 hover:border-emerald-200 dark:hover:border-emerald-800'
                              }`}
                              title={isInTasks ? 'Remove from tasks' : 'Add to tasks'}
                            >
                              ✅
                            </button>
                            <button
                              onClick={(e) => handleToggleReminder(e, job)}
                              className={`w-9 h-9 rounded-lg border flex items-center justify-center text-lg transition-all ${
                                isInReminders
                                  ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 opacity-40 hover:opacity-60 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 hover:border-blue-200 dark:hover:border-blue-800'
                              }`}
                              title={isInReminders ? 'Remove from reminders' : 'Add to reminders'}
                            >
                              ⏰
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 my-6">
                        <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border border-slate-200 dark:border-slate-700">Posted {job.postedDate}</span>
                        {job.salary && <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border border-blue-100">{job.salary}</span>}
                        <div className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-[0.1em] ${getGhostColor(job.ghostJobProbability)}`}>👻 Ghost Risk: {job.ghostJobProbability}</div>
                      </div>

                      {/* Expandable Match Breakdown */}
                      <div className={`transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[800px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-2 h-6 bg-brand-500 rounded-full" />
                            <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Alignment Analysis</h5>
                          </div>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {(job.matchDetails || [job.matchReason]).map((detail, idx) => (
                              <li key={idx} className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:-translate-y-1">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0">✓</div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">{detail}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 italic text-xs text-slate-500 text-center">
                            "This match score is calculated by cross-referencing your core competencies against the semantic requirements of this listing."
                          </div>
                        </div>
                      </div>

                      {searchMode === 'bookmarks' && (
                        <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-6">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Search Status:</span>
                          <div className="flex flex-wrap gap-3">
                            {APPLICATION_STATUSES.map(status => (
                              <button 
                                key={status}
                                onClick={() => handleStatusChange(job.applyUrl, status)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${(bookmarks.find(b => b.applyUrl === job.applyUrl)?.status === status) ? getStatusColor(status) : 'bg-white dark:bg-slate-700 text-slate-400 border border-slate-200 dark:border-slate-600 hover:border-slate-400'}`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4">
                        <a href={job.applyUrl} target="_blank" rel="noreferrer" className="px-10 py-4 bg-slate-900 dark:bg-brand-600 text-white text-xs font-black rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10">
                          Apply Direct ↗
                        </a>
                        {!isExpanded && (
                          <button 
                            onClick={() => setExpandedJobId(job.id)}
                            className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 text-xs font-black rounded-2xl hover:border-brand-300 hover:text-brand-600 transition-all uppercase tracking-widest"
                          >
                            Match Intel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : !loading && (
              <div className="bg-white dark:bg-slate-900 p-24 rounded-[3rem] text-center border-2 border-dashed border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
                  <div className="text-7xl mb-6 opacity-20 grayscale">🔍</div>
                  <h4 className="text-2xl font-black text-slate-800 dark:text-white mb-2">No matches found</h4>
                  <p className="text-slate-400 font-medium">Try broadening your location or keyword parameters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
