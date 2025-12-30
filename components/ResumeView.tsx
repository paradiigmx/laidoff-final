
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ResumeRewriteResult, FileData, StructuredResume, SavedResume } from '../types';
import { rewriteResume, getFastInsight, tailorResume, generateBulletPoint } from '../services/geminiService';
import { saveResume, getSavedResumes } from '../services/storageService';
import { ResumeActionBar } from './ResumeActionBar';
import heroImage from '@assets/pexels-olly-3760072_1766520094521.jpg';
import { 
    TemplateModern, 
    TemplateExecutive,
    TemplateMinimal,
    TemplateSettings 
} from './ResumeTemplates';
import { ResumePreviewShell } from './resume/ResumePreviewShell';
import { 
    FitSettings, 
    DEFAULT_FIT_SETTINGS, 
    applyCompressionStep, 
    getInitialFitSettings,
    MAX_COMPRESSION_LEVEL,
} from '../services/fitEngine';

interface ResumeViewProps {
  resumeData: ResumeRewriteResult | null;
  fileData: FileData;
  setResumeData: (data: ResumeRewriteResult) => void;
}

const getTemplateComponent = (id: string) => {
    switch (id) {
        case 'modern': return TemplateModern;
        case 'executive': return TemplateExecutive;
        case 'minimal': return TemplateMinimal;
        default: return TemplateModern;
    }
};

const TEMPLATES = [
    { id: 'modern', name: 'Modern', desc: 'Clean, standard 2-column sidebar.' },
    { id: 'executive', name: 'Executive', desc: 'Centered, professional & classic.' },
    { id: 'minimal', name: 'Minimal', desc: 'Simple, clean & straightforward.' },
];


const COLOR_PALETTE: Array<{name: string, value: string}> = [
    { name: 'Slate', value: '#0f172a' },
    { name: 'Sky', value: '#0ea5e9' },
    { name: 'Blue', value: '#2563eb' },
    { name: 'Indigo', value: '#4f46e5' },
    { name: 'Violet', value: '#7c3aed' },
    { name: 'Purple', value: '#9333ea' },
    { name: 'Fuchsia', value: '#c026d3' },
    { name: 'Pink', value: '#db2777' },
    { name: 'Rose', value: '#e11d48' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Lime', value: '#84cc16' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Navy', value: '#1e3a8a' },
    { name: 'Charcoal', value: '#1f2937' },
];

const FONT_OPTIONS = [
    { name: 'Inter (Sans)', value: 'Inter, sans-serif' },
    { name: 'Roboto (Sans)', value: 'Roboto, sans-serif' },
    { name: 'Merriweather (Serif)', value: 'Merriweather, serif' },
];

export const ResumeView: React.FC<ResumeViewProps> = ({ resumeData, fileData, setResumeData }) => {
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing AI...');
  const [error, setError] = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');
  const [activeTemplate, setActiveTemplate] = useState<string>('modern');
  const [zoomLevel, setZoomLevel] = useState(0.65);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'saved'>('idle');
  const [sectionsExpanded, setSectionsExpanded] = useState<Record<string, boolean>>({ design: false, target: false });
  const [settings, setSettings] = useState<TemplateSettings>({
    margin: 'standard', fontSize: 'medium', accentColor: '#0f172a', showPageNumbers: false, fontFamily: 'Inter, sans-serif'
  });
  const [showDebug, setShowDebug] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  
  const [fitSettingsOverride, setFitSettingsOverride] = useState<FitSettings | null>(null);
  const [pageCount, setPageCount] = useState(1);
  const [compressionLevel, setCompressionLevel] = useState(0);
  const resumeContentRef = useRef<HTMLDivElement>(null);
  
  const [history, setHistory] = useState<StructuredResume[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [editableData, setEditableData] = useState<StructuredResume | null>(null);

  const [fastInsight, setFastInsight] = useState<string | null>(null);
  const [isGettingInsight, setIsGettingInsight] = useState(false);

  // Job Tailoring State
  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');

  // Saved Resumes State
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [showSavedResumes, setShowSavedResumes] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [generatingBulletFor, setGeneratingBulletFor] = useState<number | null>(null);

  // Normalize resume data to ensure description is always an array
  const normalizeResumeData = (data: StructuredResume): StructuredResume => {
    return {
      ...data,
      experience: data.experience.map(exp => ({
        ...exp,
        description: Array.isArray(exp.description) 
          ? exp.description 
          : (typeof exp.description === 'string' && exp.description.trim()
              ? exp.description.split(/\n|•|[-]\s/).map(b => b.trim()).filter(b => b.length > 0)
              : [])
      }))
    };
  };

  useEffect(() => {
    if (fileData && !resumeData && !loading) {
      handleRewrite();
    }
  }, [fileData]);

  useEffect(() => {
    setSavedResumes(getSavedResumes());
  }, []);


  useEffect(() => {
    if (resumeData && historyIndex === -1) {
      const data = normalizeResumeData(resumeData.structuredResume);
      setEditableData(data);
      setHistory([data]);
      setHistoryIndex(0);
      setFitSettingsOverride(null);
      setCompressionLevel(0);
      setPageCount(1);
    }
  }, [resumeData]);

  const fitResumeToPage = useCallback(() => {
    if (!resumeContentRef.current || !editableData) return;
    
    requestAnimationFrame(() => {
      if (!resumeContentRef.current) return;
      const contentHeight = resumeContentRef.current.scrollHeight;
      const pageHeightPx = pageCount * 11 * 96;
      const isOverflowing = contentHeight > pageHeightPx + 2;
      
      if (isOverflowing) {
        if (compressionLevel < MAX_COMPRESSION_LEVEL) {
          const newLevel = compressionLevel + 1;
          setCompressionLevel(newLevel);
          const initialSettings = getInitialFitSettings(editableData);
          setFitSettingsOverride(applyCompressionStep(initialSettings, newLevel));
        } else if (pageCount < 2) {
          setPageCount(2);
        }
      }
    });
  }, [compressionLevel, pageCount, editableData]);

  useEffect(() => {
    if (editableData) {
      setCompressionLevel(0);
      setFitSettingsOverride(null);
      setPageCount(1);
    }
  }, [editableData, activeTemplate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fitResumeToPage();
    }, 100);
    return () => clearTimeout(timer);
  }, [fitResumeToPage]);

  // Handle simulated progress messages
  useEffect(() => {
    let interval: number | undefined;
    if (loading) {
        setLoadingProgress(5);
        const messages = [
            "Initializing Career Operating System...",
            "Parsing experience history...",
            "Extracting core competencies...",
            "Validating industry standards...",
            "Performing market gap analysis...",
            "Optimizing achievement bullet points...",
            "Processing resume...",
            "Checking keyword density for ATS...",
            "Generating suggested improvements...",
            "Polishing document structure...",
            "Assembling final layout components..."
        ];
        let msgIdx = 0;
        interval = window.setInterval(() => {
            setLoadingProgress(prev => {
                const next = prev + (100 - prev) * 0.15;
                return Math.min(next, 99);
            });
            setLoadingMessage(messages[msgIdx]);
            msgIdx = (msgIdx + 1) % messages.length;
        }, 1800);
    } else {
        setLoadingProgress(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const updateDataWithHistory = (newData: StructuredResume) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setEditableData(newData);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setEditableData(history[nextIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setEditableData(history[nextIndex]);
    }
  };

  const handleRewrite = async () => {
    setLoading(true);
    setError(null);
    setLoadingMessage("Connecting to Gemini...");
    try {
      const result = await rewriteResume(fileData.base64, fileData.mimeType, instructions, 'Professional', 1);
      // Normalize description to array
      const normalizedResume = normalizeResumeData(result.structuredResume);
      // Preserve hero information (fullName and title) if they already exist
      if (currentData && (currentData.fullName || currentData.title)) {
        normalizedResume.fullName = currentData.fullName || normalizedResume.fullName;
        normalizedResume.title = currentData.title || normalizedResume.title;
      }
      result.structuredResume = normalizedResume;
      setResumeData(result);
      setEditableData(normalizedResume);
      setHistory([normalizedResume]);
      setHistoryIndex(0);
      setFastInsight(null);
    } catch (e: any) { 
        setError(e.message || "AI failed to process your resume. Please try again."); 
        console.error(e);
    } finally { 
        setLoading(false); 
    }
  };

  const handleTailor = async () => {
    if (!jobDescription.trim() && !jobUrl.trim()) {
        setError("Please provide either a Job Description or a Job Link to tailor the resume.");
        return;
    }
    setLoading(true);
    setError(null);
    setLoadingMessage("Analyzing target role requirements...");
    try {
        const baseData = editableData || resumeData?.structuredResume;
        const result = await tailorResume(baseData, { description: jobDescription, url: jobUrl }, 'Professional');
        // Normalize description to array
        const normalizedResume = normalizeResumeData(result.structuredResume);
        // Preserve hero information (fullName and title)
        if (baseData && (baseData.fullName || baseData.title)) {
          normalizedResume.fullName = baseData.fullName || normalizedResume.fullName;
          normalizedResume.title = baseData.title || normalizedResume.title;
        }
        result.structuredResume = normalizedResume;
        setResumeData(result);
        setEditableData(normalizedResume);
        updateDataWithHistory(normalizedResume);
        setFastInsight(null);
    } catch (e: any) {
        setError(e.message || "Tailoring failed. Please check the job link or description.");
    } finally {
        setLoading(false);
    }
  };

  const handleGetFastInsight = async () => {
      if (!editableData) return;
      setIsGettingInsight(true);
      try {
          const insight = await getFastInsight(JSON.stringify(editableData));
          setFastInsight(insight);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGettingInsight(false);
      }
  };

  const handleSaveToProfile = () => {
      if (!editableData || !resumeData) return;
      const defaultName = editableData.fullName || 'Resume';
      const name = prompt('Enter a name for this resume:', defaultName);
      if (name === null) return; // User cancelled
      if (!name.trim()) {
          alert('Please enter a valid name for the resume.');
          return;
      }
      const saved: SavedResume = {
          id: Date.now().toString(),
          name: name.trim(),
          data: { ...resumeData, structuredResume: editableData },
          date: new Date().toISOString()
      };
      saveResume(saved);
      setSavedResumes(getSavedResumes());
      setShareStatus('saved');
      setTimeout(() => setShareStatus('idle'), 2000);
  };

  const handleShareLink = async () => {
    if (!currentData) return;
    try {
      const shareData = {
        structuredResume: currentData,
        fileData: fileData
      };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(shareData))));
      const shareUrl = `${window.location.origin}${window.location.pathname}#resume=${encoded}`;
      
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus('copied');
      setShowShareDropdown(false);
      setTimeout(() => setShareStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      setError('Failed to copy share link. Please try again.');
    }
  };

  const handleShareNative = async () => {
    if (!currentData) return;
    try {
      const shareData = {
        structuredResume: currentData,
        fileData: fileData
      };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(shareData))));
      const shareUrl = `${window.location.origin}${window.location.pathname}#resume=${encoded}`;
      
      if (navigator.share) {
        await navigator.share({
          title: `${currentData.fullName || 'Resume'} - Resume`,
          text: `Check out my resume: ${currentData.fullName || 'Resume'}`,
          url: shareUrl
        });
        setShowShareDropdown(false);
      } else {
        // Fallback to copy link
        await handleShareLink();
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Share failed:', err);
        // Fallback to copy link
        await handleShareLink();
      }
    }
  };

  const handleCopyResumeData = async () => {
    if (!currentData) return;
    try {
      const resumeText = JSON.stringify(currentData, null, 2);
      await navigator.clipboard.writeText(resumeText);
      setShareStatus('copied');
      setShowShareDropdown(false);
      setTimeout(() => setShareStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy resume data:', err);
      setError('Failed to copy resume data. Please try again.');
    }
  };

  const handleShareEmail = () => {
    if (!currentData) return;
    try {
      const shareData = {
        structuredResume: currentData,
        fileData: fileData
      };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(shareData))));
      const shareUrl = `${window.location.origin}${window.location.pathname}#resume=${encoded}`;
      const subject = encodeURIComponent(`${currentData.fullName || 'Resume'} - Resume`);
      const body = encodeURIComponent(`Check out my resume: ${shareUrl}`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
      setShowShareDropdown(false);
    } catch (err) {
      console.error('Failed to open email:', err);
      setError('Failed to open email client. Please try again.');
    }
  };

  const handleShareText = () => {
    if (!currentData) return;
    try {
      const shareData = {
        structuredResume: currentData,
        fileData: fileData
      };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(shareData))));
      const shareUrl = `${window.location.origin}${window.location.pathname}#resume=${encoded}`;
      window.location.href = `sms:?body=${encodeURIComponent(`Check out my resume: ${shareUrl}`)}`;
      setShowShareDropdown(false);
    } catch (err) {
      console.error('Failed to open text:', err);
      setError('Failed to open text message. Please try again.');
    }
  };

  const ActiveTemplateComponent = getTemplateComponent(activeTemplate);
  const currentData = editableData || (resumeData ? resumeData.structuredResume : null);

  const fitSettings = useMemo(() => {
    if (fitSettingsOverride) return fitSettingsOverride;
    if (currentData) return getInitialFitSettings(currentData);
    return DEFAULT_FIT_SETTINGS;
  }, [fitSettingsOverride, currentData]);

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-900 relative transition-colors duration-300">
      {/* Hero Header - Fixed size matching FileUploader */}
      <div className="relative rounded-b-[3rem] overflow-hidden bg-slate-900 text-white shadow-2xl border-b border-slate-800 no-print shrink-0">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/50"></div>
        </div>
        <div className="relative z-10 p-10 md:p-16">
          <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-white/10 text-rose-300">
            Resume Lab
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
            Resume <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-200 to-white">Lab.</span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed font-medium max-w-xl">
            AI-powered resume creation with professional templates and instant optimization.
          </p>
        </div>
      </div>

      {/* Top Header Bar */}
      <ResumeActionBar
        savedResumes={savedResumes}
        onResumeSelect={(resume) => {
          // Open in new tab by encoding the resume data in URL
          const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(resume.data))));
          window.open(`${window.location.origin}${window.location.pathname}#resume=${encoded}`, '_blank');
        }}
        onRewrite={handleRewrite}
        loading={loading}
        showRewrite={true}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {loading && (
            <div className="absolute top-0 left-0 w-full h-1.5 z-[60] bg-slate-100 dark:bg-slate-800">
                <div 
                    className="h-full bg-brand-500 transition-all duration-700 ease-out shadow-[0_0_15px_#0ea5e9]"
                    style={{ width: `${loadingProgress}%` }}
                />
            </div>
        )}

        <div className="settings-panel w-[400px] bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col z-10 shadow-lg shrink-0 h-full transition-colors duration-300">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 animate-in fade-in">
                        ⚠️ {error}
                    </div>
                )}
                
                {loading && (
                    <div className="p-6 bg-slate-900 rounded-[2rem] text-white shadow-2xl relative overflow-hidden animate-pulse">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-brand-500 rounded-full blur-[40px] opacity-20"></div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-400 mb-2">Live Progress</h4>
                        <div className="text-sm font-bold mb-4">{loadingMessage}</div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-400 transition-all duration-300" style={{width: `${loadingProgress}%`}}></div>
                        </div>
                    </div>
                )}

                {/* Collapsible Design Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <button 
                        onClick={() => setSectionsExpanded(prev => ({ ...prev, design: !prev.design }))}
                        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><span>🎨</span> Design & Style</span>
                        <span className="text-slate-400">{sectionsExpanded.design ? '▼' : '▶'}</span>
                    </button>
                    {sectionsExpanded.design && (
                        <div className="p-4 pt-0 space-y-4 border-t border-slate-100 dark:border-slate-700">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Template</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {TEMPLATES.map(t => (
                                        <button 
                                            key={t.id} 
                                            onClick={() => setActiveTemplate(t.id)}
                                            className={`p-3 rounded-xl border-2 text-left transition-all ${activeTemplate === t.id ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/10' : 'border-slate-100 dark:border-slate-700 hover:border-slate-200'}`}
                                        >
                                            <div className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Accent Color</label>
                                <select 
                                    value={settings.accentColor} 
                                    onChange={e => setSettings({...settings, accentColor: e.target.value})} 
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm outline-none cursor-pointer"
                                    style={{ color: settings.accentColor }}
                                >
                                    {COLOR_PALETTE.map(c => (
                                        <option key={c.value} value={c.value} style={{ color: c.value }}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Typography</label>
                                <select 
                                    value={settings.fontFamily} 
                                    onChange={e => setSettings({ ...settings, fontFamily: e.target.value })} 
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm outline-none"
                                >
                                    {FONT_OPTIONS.map(font => <option key={font.value} value={font.value}>{font.name}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Collapsible Target Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <button 
                        onClick={() => setSectionsExpanded(prev => ({ ...prev, target: !prev.target }))}
                        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><span>🎯</span> Target Job</span>
                        <span className="text-slate-400">{sectionsExpanded.target ? '▼' : '▶'}</span>
                    </button>
                    {sectionsExpanded.target && (
                        <div className="p-4 pt-0 space-y-3 border-t border-slate-100 dark:border-slate-700">
                            <p className="text-xs text-slate-500">Paste a job description to tailor your resume.</p>
                            <textarea 
                                value={jobDescription}
                                onChange={e => setJobDescription(e.target.value)}
                                placeholder="Paste job description..."
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-brand-500 min-h-[100px] resize-y"
                            />
                            <input 
                                type="text"
                                value={jobUrl}
                                onChange={e => setJobUrl(e.target.value)}
                                placeholder="Or paste Job URL..."
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                            />
                            <button 
                                onClick={handleTailor}
                                disabled={loading || (!jobDescription.trim() && !jobUrl.trim())}
                                className="w-full py-3 bg-slate-900 dark:bg-brand-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                Generate Targeted Resume 🎯
                            </button>
                        </div>
                    )}
                </div>

                {currentData && (
                    <div className="space-y-6 animate-in fade-in">
                        {/* Contact Information */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
                            <h3 className="font-bold text-slate-900 dark:text-white">Contact Information</h3>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</label>
                                <input 
                                    type="text" 
                                    value={currentData.fullName || ''} 
                                    onChange={e => updateDataWithHistory({ ...currentData, fullName: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Title</label>
                                <input 
                                    type="text" 
                                    value={currentData.title || ''} 
                                    onChange={e => updateDataWithHistory({ ...currentData, title: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</label>
                                <input 
                                    type="email" 
                                    value={currentData.contact?.email || ''} 
                                    onChange={e => updateDataWithHistory({ ...currentData, contact: { ...currentData.contact, email: e.target.value } })}
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</label>
                                <input 
                                    type="tel" 
                                    value={currentData.contact?.phone || ''} 
                                    onChange={e => updateDataWithHistory({ ...currentData, contact: { ...currentData.contact, phone: e.target.value } })}
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</label>
                                <input 
                                    type="text" 
                                    value={currentData.contact?.location || ''} 
                                    onChange={e => updateDataWithHistory({ ...currentData, contact: { ...currentData.contact, location: e.target.value } })}
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                        </div>

                        {/* Profile / Summary */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
                            <h3 className="font-bold text-slate-900 dark:text-white">Profile / Summary</h3>
                            <textarea 
                                value={currentData.summary || ''} 
                                onChange={e => updateDataWithHistory({ ...currentData, summary: e.target.value })}
                                placeholder="Enter your professional summary..."
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-brand-500 min-h-[100px] resize-y"
                            />
                        </div>

                        {/* Experience */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 dark:text-white">Experience</h3>
                                <button 
                                    onClick={() => updateDataWithHistory({ ...currentData, experience: [...currentData.experience, { role: '', company: '', dates: '', description: [] }] })}
                                    className="px-3 py-1.5 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 transition-colors"
                                >
                                    + Add Job
                                </button>
                            </div>
                            {currentData.experience.map((exp, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3 border border-slate-100 dark:border-slate-700">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase">Job {idx + 1}</span>
                                            <div className="flex flex-col gap-1">
                                                <button 
                                                    onClick={() => {
                                                        if (idx === 0) return;
                                                        const newExp = [...currentData.experience];
                                                        [newExp[idx - 1], newExp[idx]] = [newExp[idx], newExp[idx - 1]];
                                                        updateDataWithHistory({ ...currentData, experience: newExp });
                                                    }}
                                                    disabled={idx === 0}
                                                    className="text-slate-400 hover:text-slate-600 disabled:opacity-30 text-xs"
                                                    title="Move up"
                                                >▲</button>
                                                <button 
                                                    onClick={() => {
                                                        if (idx === currentData.experience.length - 1) return;
                                                        const newExp = [...currentData.experience];
                                                        [newExp[idx], newExp[idx + 1]] = [newExp[idx + 1], newExp[idx]];
                                                        updateDataWithHistory({ ...currentData, experience: newExp });
                                                    }}
                                                    disabled={idx === currentData.experience.length - 1}
                                                    className="text-slate-400 hover:text-slate-600 disabled:opacity-30 text-xs"
                                                    title="Move down"
                                                >▼</button>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                const newExp = currentData.experience.filter((_, i) => i !== idx);
                                                updateDataWithHistory({ ...currentData, experience: newExp });
                                            }}
                                            className="text-red-500 hover:text-red-700 text-xs font-bold"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <input 
                                        type="text" 
                                        value={exp.role} 
                                        onChange={e => {
                                            const newExp = [...currentData.experience];
                                            newExp[idx] = { ...exp, role: e.target.value };
                                            updateDataWithHistory({ ...currentData, experience: newExp });
                                        }}
                                        placeholder="Job Title"
                                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                    <input 
                                        type="text" 
                                        value={exp.company} 
                                        onChange={e => {
                                            const newExp = [...currentData.experience];
                                            newExp[idx] = { ...exp, company: e.target.value };
                                            updateDataWithHistory({ ...currentData, experience: newExp });
                                        }}
                                        placeholder="Company"
                                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                    <input 
                                        type="text" 
                                        value={exp.dates} 
                                        onChange={e => {
                                            const newExp = [...currentData.experience];
                                            newExp[idx] = { ...exp, dates: e.target.value };
                                            updateDataWithHistory({ ...currentData, experience: newExp });
                                        }}
                                        placeholder="Dates (e.g., Jan 2020 - Present)"
                                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                    {/* Individual Bullet Points */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase block">Bullet Points</label>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                type="button"
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (!currentData) return;
                                                    setGeneratingBulletFor(idx);
                                                    try {
                                                        const newBullet = await generateBulletPoint(
                                                            currentData, 
                                                            exp.role || '', 
                                                            exp.company || '', 
                                                            exp.description || []
                                                        );
                                                        const currentExp = currentData.experience[idx];
                                                        const newExp = [...currentData.experience];
                                                        newExp[idx] = { ...currentExp, description: [...(currentExp.description || []), newBullet] };
                                                        updateDataWithHistory({ ...currentData, experience: newExp });
                                                    } catch (err) {
                                                        console.error('Failed to generate bullet:', err);
                                                        setError('Failed to generate bullet point. Please try again.');
                                                    } finally {
                                                        setGeneratingBulletFor(null);
                                                    }
                                                }}
                                                disabled={generatingBulletFor === idx || !currentData}
                                                className="text-purple-600 hover:text-purple-700 text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                            >
                                                {generatingBulletFor === idx ? (
                                                    <>
                                                        <span className="animate-spin">⏳</span> Generating...
                                                    </>
                                                ) : (
                                                    '✨ Add AI Bullet'
                                                )}
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    const currentExp = currentData.experience[idx];
                                                    const newExp = [...currentData.experience];
                                                    newExp[idx] = { ...currentExp, description: [...(currentExp.description || []), ''] };
                                                    updateDataWithHistory({ ...currentData, experience: newExp });
                                                }}
                                                disabled={generatingBulletFor === idx}
                                                className="text-brand-600 hover:text-brand-700 text-xs font-bold cursor-pointer disabled:opacity-50"
                                            >
                                                + Add Bullet
                                            </button>
                                        </div>
                                        {(exp.description || []).map((bullet, bulletIdx) => (
                                            <div key={bulletIdx} className="flex items-start gap-2">
                                                <div className="flex flex-col gap-1 pt-2">
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (bulletIdx === 0) return;
                                                            const currentExp = currentData.experience[idx];
                                                            const newDesc = [...(currentExp.description || [])];
                                                            [newDesc[bulletIdx - 1], newDesc[bulletIdx]] = [newDesc[bulletIdx], newDesc[bulletIdx - 1]];
                                                            const newExpArr = [...currentData.experience];
                                                            newExpArr[idx] = { ...currentExp, description: newDesc };
                                                            updateDataWithHistory({ ...currentData, experience: newExpArr });
                                                        }}
                                                        disabled={bulletIdx === 0}
                                                        className="text-slate-400 hover:text-slate-600 disabled:opacity-30 text-xs"
                                                        title="Move up"
                                                    >▲</button>
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            const currentExp = currentData.experience[idx];
                                                            if (bulletIdx === (currentExp.description?.length || 0) - 1) return;
                                                            const newDesc = [...(currentExp.description || [])];
                                                            [newDesc[bulletIdx], newDesc[bulletIdx + 1]] = [newDesc[bulletIdx + 1], newDesc[bulletIdx]];
                                                            const newExpArr = [...currentData.experience];
                                                            newExpArr[idx] = { ...currentExp, description: newDesc };
                                                            updateDataWithHistory({ ...currentData, experience: newExpArr });
                                                        }}
                                                        disabled={bulletIdx === (exp.description?.length || 0) - 1}
                                                        className="text-slate-400 hover:text-slate-600 disabled:opacity-30 text-xs"
                                                        title="Move down"
                                                    >▼</button>
                                                </div>
                                                <input 
                                                    type="text"
                                                    value={bullet}
                                                    onChange={e => {
                                                        const currentExp = currentData.experience[idx];
                                                        const newDesc = [...(currentExp.description || [])];
                                                        newDesc[bulletIdx] = e.target.value;
                                                        const newExpArr = [...currentData.experience];
                                                        newExpArr[idx] = { ...currentExp, description: newDesc };
                                                        updateDataWithHistory({ ...currentData, experience: newExpArr });
                                                    }}
                                                    placeholder={`Bullet point ${bulletIdx + 1}`}
                                                    className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        const currentExp = currentData.experience[idx];
                                                        const newDesc = (currentExp.description || []).filter((_, i) => i !== bulletIdx);
                                                        const newExpArr = [...currentData.experience];
                                                        newExpArr[idx] = { ...currentExp, description: newDesc };
                                                        updateDataWithHistory({ ...currentData, experience: newExpArr });
                                                    }}
                                                    className="text-red-400 hover:text-red-600 p-2"
                                                    title="Delete bullet"
                                                >✕</button>
                                            </div>
                                        ))}
                                        {(!exp.description || exp.description.length === 0) && (
                                            <p className="text-xs text-slate-400 italic">No bullet points yet. Click "+ Add Bullet" to add one.</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Education */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 dark:text-white">Education</h3>
                                <button 
                                    onClick={() => updateDataWithHistory({ ...currentData, education: [...(currentData.education || []), { school: '', degree: '', dates: '' }] })}
                                    className="px-3 py-1.5 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 transition-colors"
                                >
                                    + Add
                                </button>
                            </div>
                            {(currentData.education || []).map((edu, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3 border border-slate-100 dark:border-slate-700">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Education {idx + 1}</span>
                                        <button 
                                            onClick={() => {
                                                const newEdu = (currentData.education || []).filter((_, i) => i !== idx);
                                                updateDataWithHistory({ ...currentData, education: newEdu });
                                            }}
                                            className="text-red-500 hover:text-red-700 text-xs font-bold"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <input 
                                        type="text" 
                                        value={edu.school} 
                                        onChange={e => {
                                            const newEdu = [...(currentData.education || [])];
                                            newEdu[idx] = { ...edu, school: e.target.value };
                                            updateDataWithHistory({ ...currentData, education: newEdu });
                                        }}
                                        placeholder="School / University"
                                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                    <input 
                                        type="text" 
                                        value={edu.degree} 
                                        onChange={e => {
                                            const newEdu = [...(currentData.education || [])];
                                            newEdu[idx] = { ...edu, degree: e.target.value };
                                            updateDataWithHistory({ ...currentData, education: newEdu });
                                        }}
                                        placeholder="Degree"
                                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                    <input 
                                        type="text" 
                                        value={edu.dates || ''} 
                                        onChange={e => {
                                            const newEdu = [...(currentData.education || [])];
                                            newEdu[idx] = { ...edu, dates: e.target.value };
                                            updateDataWithHistory({ ...currentData, education: newEdu });
                                        }}
                                        placeholder="Graduation Year"
                                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Skills */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
                            <h3 className="font-bold text-slate-900 dark:text-white">Skills</h3>
                            <textarea 
                                value={(() => {
                                    const skills = currentData.skills || [];
                                    // Always show 15 lines, fill empty ones with empty strings
                                    const lines = [...skills];
                                    while (lines.length < 15) {
                                        lines.push('');
                                    }
                                    return lines.join('\n');
                                })()}
                                onChange={e => {
                                    // Split by newlines, but also handle comma-separated values if pasted
                                    const text = e.target.value;
                                    // Replace commas with newlines for easier pasting
                                    const normalizedText = text.replace(/,/g, '\n');
                                    const allLines = normalizedText.split('\n');
                                    // Take only the first 15 lines and filter out empty ones
                                    const skills = allLines.slice(0, 15).map(s => s.trim()).filter(s => s);
                                    updateDataWithHistory({ ...currentData, skills });
                                }}
                                placeholder="Enter one skill per line (up to 15 skills)"
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-brand-500 resize-none font-mono whitespace-pre"
                                rows={15}
                                style={{ lineHeight: '1.5' }}
                            />
                            <p className="text-xs text-slate-500 italic">(15 skill limit)</p>
                        </div>

                        {/* Certifications */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
                            <h3 className="font-bold text-slate-900 dark:text-white">Certifications</h3>
                            <textarea 
                                value={(currentData.certifications || []).join('\n')} 
                                onChange={e => updateDataWithHistory({ ...currentData, certifications: e.target.value.split('\n').filter(c => c.trim()) })}
                                placeholder="Enter certifications, one per line"
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-brand-500 min-h-[80px] resize-y"
                            />
                        </div>

                        {/* Awards */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
                            <h3 className="font-bold text-slate-900 dark:text-white">Awards</h3>
                            <textarea 
                                value={(currentData.awards || []).join('\n')} 
                                onChange={e => updateDataWithHistory({ ...currentData, awards: e.target.value.split('\n').filter(a => a.trim()) })}
                                placeholder="Enter awards, one per line"
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-brand-500 min-h-[80px] resize-y"
                            />
                        </div>
                    </div>
                )}

            </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 flex flex-col min-h-0 transition-colors duration-300 bg-slate-200/50 dark:bg-slate-950">
            {loading && (
                <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="relative mb-8">
                        <div className="w-32 h-32 border-[12px] border-slate-100 dark:border-slate-800 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-32 h-32 border-[12px] border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">{Math.round(loadingProgress)}%</span>
                        </div>
                    </div>
                    <div className="text-slate-900 dark:text-white font-black tracking-[0.2em] uppercase text-2xl mb-3">{loadingMessage}</div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.4em] animate-pulse">Forging Your Application</p>
                </div>
            )}
            
            {currentData && (
                <div className="h-full flex flex-col">
                    <div className="flex-1 min-h-0">
                        <ResumePreviewShell zoomLevel={zoomLevel} pageCount={pageCount}>
                            <div ref={resumeContentRef}>
                                <ActiveTemplateComponent 
                                    data={currentData} 
                                    settings={settings} 
                                    onUpdate={(newData) => updateDataWithHistory(newData)}
                                    fitSettings={fitSettings}
                                    pageCount={pageCount}
                                />
                            </div>
                        </ResumePreviewShell>
                    </div>
                    
                    {/* Save, Download, and Share Buttons - Below Resume */}
                    <div className="flex gap-3 items-center justify-center py-4 no-print z-50 bg-slate-200/50 dark:bg-slate-950 relative overflow-visible">
                        <button 
                            onClick={handleSaveToProfile} 
                            disabled={loading || !currentData}
                            className={`px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-md ${
                                shareStatus === 'saved' 
                                ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {shareStatus === 'saved' ? 'Saved! ✓' : '💾 Save Resume'}
                        </button>
                        
                        <div className="relative">
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowDownloadDropdown(!showDownloadDropdown);
                                    setShowShareDropdown(false);
                                }}
                                disabled={isExportingPdf || isExportingWord || !currentData}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {(isExportingPdf || isExportingWord) ? 'Downloading...' : '📥 DOWNLOAD'}
                                <span className="text-xs">▼</span>
                            </button>
                            
                            {/* Download Dropdown Menu */}
                            {showDownloadDropdown && (
                                <>
                                    <div 
                                        className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-[60] min-w-[180px]"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            type="button"
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (!currentData) return;
                                                setShowDownloadDropdown(false);
                                                setIsExportingPdf(true);
                                                try {
                                                    // Small delay to ensure dropdown closes
                                                    await new Promise(resolve => setTimeout(resolve, 100));
                                                    const { exportResumeAsPdf } = await import('./pdf/exportPdf');
                                                    await exportResumeAsPdf(currentData, `${currentData.fullName || 'resume'}.pdf`, settings.accentColor, fitSettings);
                                                } catch (err) {
                                                    console.error('PDF export failed:', err);
                                                    setError('Failed to download PDF. Please try again.');
                                                } finally {
                                                    setIsExportingPdf(false);
                                                }
                                            }}
                                            disabled={isExportingPdf || !currentData}
                                            className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                                        >
                                            📄 Download as PDF
                                        </button>
                                        <button
                                            type="button"
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (!currentData) return;
                                                setShowDownloadDropdown(false);
                                                setIsExportingWord(true);
                                                try {
                                                    // Small delay to ensure dropdown closes
                                                    await new Promise(resolve => setTimeout(resolve, 100));
                                                    const { exportResumeAsWord } = await import('./pdf/exportWord');
                                                    await exportResumeAsWord(currentData, `${currentData.fullName || 'resume'}.doc`);
                                                } catch (err) {
                                                    console.error('Word export failed:', err);
                                                    setError('Failed to download Word document. Please try again.');
                                                } finally {
                                                    setIsExportingWord(false);
                                                }
                                            }}
                                            disabled={isExportingWord || !currentData}
                                            className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 border-t border-slate-200 dark:border-slate-700"
                                        >
                                            📝 Download as Word
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="relative">
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowShareDropdown(!showShareDropdown);
                                    setShowDownloadDropdown(false);
                                }}
                                disabled={!currentData}
                                className={`px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                                    shareStatus === 'copied' 
                                    ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                                }`}
                            >
                                {shareStatus === 'copied' ? 'Copied! ✓' : '🔗 SHARE'}
                                <span className="text-xs">▼</span>
                            </button>
                            
                            {/* Share Dropdown Menu */}
                            {showShareDropdown && (
                                <>
                                    <div 
                                        className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-[60] min-w-[200px]"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {navigator.share && (
                                            <button
                                                type="button"
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    await handleShareNative();
                                                }}
                                                disabled={!currentData}
                                                className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                                            >
                                                📱 Share via...
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleShareEmail();
                                            }}
                                            disabled={!currentData}
                                            className={`w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 ${navigator.share ? 'border-t border-slate-200 dark:border-slate-700' : ''}`}
                                        >
                                            📧 Share via Email
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleShareText();
                                            }}
                                            disabled={!currentData}
                                            className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 border-t border-slate-200 dark:border-slate-700"
                                        >
                                            💬 Share via Text
                                        </button>
                                        <button
                                            type="button"
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                await handleShareLink();
                                            }}
                                            disabled={!currentData}
                                            className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 border-t border-slate-200 dark:border-slate-700"
                                        >
                                            🔗 Copy Share Link
                                        </button>
                                        <button
                                            type="button"
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                await handleCopyResumeData();
                                            }}
                                            disabled={!currentData}
                                            className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 border-t border-slate-200 dark:border-slate-700"
                                        >
                                            📋 Copy Resume Data
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Zoom Bar */}
            <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-2xl rounded-full px-8 py-4 flex items-center gap-8 border border-white/50 dark:border-slate-700/50 no-print z-40">
                <button onClick={() => setZoomLevel(z => Math.max(0.3, z - 0.1))} className="text-xl font-bold text-slate-400 hover:text-brand-600 transition-colors">-</button>
                <span className="text-[10px] font-black uppercase text-slate-500 w-12 text-center tracking-widest">{Math.round(zoomLevel * 100)}%</span>
                <button onClick={() => setZoomLevel(z => Math.min(1.5, z + 0.1))} className="text-xl font-bold text-slate-400 hover:text-brand-600 transition-colors">+</button>
            </div>
            
            {/* Click outside to close dropdowns */}
            {(showDownloadDropdown || showShareDropdown) && (
                <div 
                    className="fixed inset-0 z-[50]" 
                    onClick={() => {
                        setShowDownloadDropdown(false);
                        setShowShareDropdown(false);
                    }}
                />
            )}
        </div>
      </div>
    </div>
  );
};
