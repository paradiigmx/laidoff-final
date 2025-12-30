
import React, { useState, useRef } from 'react';
import { FileData } from '../types';
import heroImage from '@assets/pexels-olly-3760072_1766521081828.jpg';

interface FileUploaderProps {
  onFileSelect: (file: FileData) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface JobEntry {
    id: number;
    role: string;
    company: string;
    dates: string;
    description: string;
}

const RESUME_TYPES = [
    "Professional (Standard)",
    "Tech / Engineering",
    "Creative / Media",
    "Film & Entertainment",
    "Academic CV",
    "Executive",
    "Educational / Student",
    "Medical / Healthcare"
];

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
  const [textInput, setTextInput] = useState('');
  
  // Builder State
  const [builderData, setBuilderData] = useState({
      fullName: '',
      targetRole: '',
      skills: '',
      phone: '',
      linkedin: '',
      resumeType: 'Professional (Standard)',
      targetPages: 1,
      jobDescription: '',
      jobUrl: ''
  });
  
  const [experienceList, setExperienceList] = useState<JobEntry[]>([
      { id: 1, role: '', company: '', dates: '', description: '' }
  ]);

  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearError = () => setError(null);

  // --- File Processing Logic ---
  const processFile = (file: File) => {
    clearError();
    const validTypes = ['application/pdf', 'text/plain', 'text/markdown'];
    
    if (file.size > MAX_FILE_SIZE) {
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        setError(`File is too large (${sizeInMB}MB). Please compress it to under 5MB or choose a smaller file.`);
        return;
    }

    if (!validTypes.includes(file.type) && !file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      const ext = file.name.split('.').pop()?.toUpperCase() || 'Unknown';
      setError(`Unsupported file type (.${ext}). Please upload a PDF, TXT, or MD file.`);
      return;
    }

    if (file.size === 0) {
        setError("This file appears to be empty. Please check the content and try again.");
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      const mimeType = file.type || 'text/plain';

      onFileSelect({
        base64,
        mimeType,
        name: file.name
      });
    };
    reader.onerror = () => {
        setError("Something went wrong reading your file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Builder Logic ---
  const addExperience = () => {
      setExperienceList([...experienceList, { id: Date.now(), role: '', company: '', dates: '', description: '' }]);
  };

  const updateExperience = (id: number, field: keyof JobEntry, value: string) => {
      setExperienceList(experienceList.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeExperience = (id: number) => {
      setExperienceList(experienceList.filter(item => item.id !== id));
  };

  const handleTextSubmit = () => {
      clearError();
      // Construct a prompt from the builder fields
      // Convert description string to array format for prompt
      const expString = experienceList.map(e => {
        // Split description by newlines or bullets to create array
        const bullets = e.description
          .split(/\n|•|[-]\s/)
          .map(b => b.trim())
          .filter(b => b.length > 0);
        const bulletsText = bullets.length > 0 
          ? bullets.map(b => `  - ${b}`).join('\n')
          : `  - ${e.description}`;
        
        return `
            ROLE: ${e.role}
            COMPANY: ${e.company}
            DATES: ${e.dates}
            DETAILS:
${bulletsText}
          `;
      }).join('\n---\n');

      const targetJobSection = (builderData.jobDescription || builderData.jobUrl) ? `
            TARGET JOB:
            ${builderData.jobDescription ? `DESCRIPTION: ${builderData.jobDescription}` : ''}
            ${builderData.jobUrl ? `URL: ${builderData.jobUrl}` : ''}
          ` : '';

      const finalContent = `
            USER CONFIGURATION:
            - Resume Type: ${builderData.resumeType}
            - Target Page Count: ${builderData.targetPages}
            
            FULL NAME: ${builderData.fullName}
            TARGET ROLE: ${builderData.targetRole}
            PHONE: ${builderData.phone}
            LINKEDIN: ${builderData.linkedin}
            SKILLS: ${builderData.skills}
            
            ${targetJobSection}
            
            WORK HISTORY:
            ${expString}
          `;
      const docName = `${builderData.fullName || 'New'} - AI Profile`;
      
      try {
        const base64 = btoa(unescape(encodeURIComponent(finalContent)));
        onFileSelect({
            base64,
            mimeType: 'text/x-resume-prompt',
            name: docName
        });
      } catch (e) {
          setError("Failed to process text. Please try again.");
      }
  };

  const handlePasteSubmit = () => {
      clearError();
      if (!textInput.trim()) {
          setError("Please enter content to proceed.");
          return;
      }
      
      try {
        const base64 = btoa(unescape(encodeURIComponent(textInput)));
        onFileSelect({
            base64,
            mimeType: 'text/plain',
            name: 'Pasted Resume Text'
        });
      } catch (e) {
          setError("Failed to process text. Please try again.");
      }
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Hero Header - Fixed size */}
      <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 text-white shadow-2xl border border-slate-800">
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

      <div className="w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">

          {/* Content Area - Combined View */}
          <div className="p-8 md:p-10 bg-white min-h-[500px]">
              
              {/* AI Builder Header */}
              <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                      <span>✨</span> AI Builder
                  </h2>
                  <p className="text-sm text-slate-500">Build your resume from scratch or upload/paste existing content</p>
              </div>

              {/* Upload or Paste Resume Section - At the top */}
              <div className="space-y-6 mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      📄 Upload or Paste Resume
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Upload PDF */}
                      <div 
                        className={`
                            h-48 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6 text-center cursor-pointer
                            ${isDragging 
                                ? 'border-brand-500 bg-brand-50 scale-105' 
                                : 'border-slate-300 bg-white hover:border-brand-400 hover:bg-slate-50'
                            }
                        `}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                          <div className="w-16 h-16 bg-blue-100 text-brand-600 rounded-full flex items-center justify-center text-3xl mb-4 shadow-sm">
                              ☁️
                          </div>
                          <h4 className="text-base font-bold text-slate-800 mb-1">Upload Resume</h4>
                          <p className="text-xs text-slate-500 mb-3">PDF, TXT, or MD file</p>
                          <input 
                              type="file" 
                              ref={fileInputRef}
                              onChange={handleInputChange} 
                              className="hidden" 
                              accept=".pdf,.txt,.md"
                          />
                          <div className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold pointer-events-none">
                              Select File
                          </div>
                      </div>

                      {/* Paste Text */}
                      <div className="flex flex-col h-48">
                          <h4 className="text-base font-bold text-slate-800 mb-2">Paste Resume Text</h4>
                          <textarea 
                            className="flex-1 w-full p-4 rounded-xl border border-slate-200 bg-white focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm leading-relaxed"
                            placeholder="Paste your resume text here..."
                            value={textInput}
                            onChange={(e) => { setTextInput(e.target.value); clearError(); }}
                          />
                          <button 
                            onClick={handlePasteSubmit} 
                            className="mt-2 px-4 py-2 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm self-end"
                          >
                              Parse & Fill Form
                          </button>
                      </div>
                  </div>
              </div>

              {/* --- BUILDER CONTENT --- */}
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      
                      {/* Target Job Section */}
                      <section className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              🎯 Target Job (Optional)
                          </h3>
                          <p className="text-xs text-slate-500 mb-4">If provided, AI will generate a resume tailored to this job before you upload.</p>
                          <div className="space-y-4">
                              <div>
                                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Job Description</label>
                                  <textarea 
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500 outline-none min-h-[120px] resize-y text-sm"
                                    placeholder="Paste job description here to tailor the resume and cover letter."
                                    value={builderData.jobDescription}
                                    onChange={(e) => setBuilderData({...builderData, jobDescription: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Job Link (Optional)</label>
                                  <input 
                                    type="text"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                                    placeholder="Job link (optional)"
                                    value={builderData.jobUrl}
                                    onChange={(e) => setBuilderData({...builderData, jobUrl: e.target.value})}
                                  />
                              </div>
                          </div>
                      </section>

                      {/* Configuration Group */}
                      <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              ⚙️ Resume Settings
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Resume Type</label>
                                  <select 
                                    className="w-full p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
                                    value={builderData.resumeType}
                                    onChange={(e) => setBuilderData({...builderData, resumeType: e.target.value})}
                                  >
                                      {RESUME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Target Length</label>
                                  <select 
                                    className="w-full p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
                                    value={builderData.targetPages}
                                    onChange={(e) => setBuilderData({...builderData, targetPages: parseInt(e.target.value)})}
                                  >
                                      <option value={1}>1 Page (Standard)</option>
                                      <option value={2}>2 Pages (Experienced)</option>
                                      <option value={3}>3 Pages (CV / Executive)</option>
                                      <option value={4}>4+ Pages (Academic / Detailed)</option>
                                  </select>
                              </div>
                          </div>
                      </section>

                      {/* Personal Info Group */}
                      <section className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Personal Details</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                                  <input 
                                    type="text"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                    placeholder="e.g. Alex Jordan"
                                    value={builderData.fullName}
                                    onChange={(e) => setBuilderData({...builderData, fullName: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Job Title</label>
                                  <input 
                                    type="text"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                    placeholder="e.g. Senior Project Manager"
                                    value={builderData.targetRole}
                                    onChange={(e) => setBuilderData({...builderData, targetRole: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone (Optional)</label>
                                  <input 
                                    type="text"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                    placeholder="(555) 123-4567"
                                    value={builderData.phone}
                                    onChange={(e) => setBuilderData({...builderData, phone: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">LinkedIn (Optional)</label>
                                  <input 
                                    type="text"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                    placeholder="linkedin.com/in/..."
                                    value={builderData.linkedin}
                                    onChange={(e) => setBuilderData({...builderData, linkedin: e.target.value})}
                                  />
                              </div>
                          </div>
                          
                          <div>
                              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Key Skills</label>
                              <textarea 
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all min-h-[80px]"
                                placeholder="List your top skills (e.g. Python, Leadership, Strategic Planning, Adobe Suite)..."
                                value={builderData.skills}
                                onChange={(e) => setBuilderData({...builderData, skills: e.target.value})}
                              />
                          </div>
                      </section>

                      {/* Experience Group */}
                      <section className="space-y-4">
                          <div className="flex justify-between items-end border-b border-slate-100 pb-2 mb-4">
                              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Experience & History</h3>
                              <button onClick={addExperience} className="text-xs text-brand-600 font-bold hover:text-brand-700 hover:bg-brand-50 px-3 py-1 rounded-lg transition-colors">
                                  + Add Position
                              </button>
                          </div>
                          
                          <div className="space-y-6">
                              {experienceList.map((item, index) => (
                                  <div key={item.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 relative group transition-all hover:shadow-md hover:border-slate-300">
                                      {experienceList.length > 1 && (
                                          <button 
                                            onClick={() => removeExperience(item.id)}
                                            className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                                            title="Remove"
                                          >
                                              ✕
                                          </button>
                                      )}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                          <div>
                                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Job Title</label>
                                              <input 
                                                className="w-full p-2 rounded-lg border border-slate-200 bg-white text-sm focus:ring-1 focus:ring-brand-500 outline-none"
                                                placeholder="e.g. Marketing Manager"
                                                value={item.role}
                                                onChange={(e) => updateExperience(item.id, 'role', e.target.value)}
                                              />
                                          </div>
                                          <div>
                                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Company</label>
                                              <input 
                                                className="w-full p-2 rounded-lg border border-slate-200 bg-white text-sm focus:ring-1 focus:ring-brand-500 outline-none"
                                                placeholder="e.g. Tech Corp"
                                                value={item.company}
                                                onChange={(e) => updateExperience(item.id, 'company', e.target.value)}
                                              />
                                          </div>
                                      </div>
                                      <div>
                                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Dates</label>
                                          <input 
                                            className="w-full p-2 rounded-lg border border-slate-200 bg-white text-sm focus:ring-1 focus:ring-brand-500 outline-none mb-4"
                                            placeholder="e.g. Jan 2020 - Present"
                                            value={item.dates}
                                            onChange={(e) => updateExperience(item.id, 'dates', e.target.value)}
                                          />
                                      </div>
                                      <div>
                                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Responsibilities / Achievements</label>
                                          <textarea 
                                            className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm focus:ring-1 focus:ring-brand-500 outline-none min-h-[100px]"
                                            placeholder="• Led a team of 5...&#10;• Increased revenue by 20%..."
                                            value={item.description}
                                            onChange={(e) => updateExperience(item.id, 'description', e.target.value)}
                                          />
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </section>

                      <div className="pt-4 flex justify-center">
                          <button 
                            onClick={handleTextSubmit} 
                            className="w-full md:w-auto px-12 py-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/20 transition-all transform active:scale-95 text-lg flex items-center justify-center gap-2"
                          >
                              Generate Resume ✨
                          </button>
                      </div>
                  </div>

              {error && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-4 bg-red-600 text-white rounded-full shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-10 fade-in">
                    <span className="font-bold">⚠️ Error:</span>
                    <span>{error}</span>
                    <button onClick={clearError} className="bg-white/20 hover:bg-white/30 rounded-full w-6 h-6 flex items-center justify-center text-xs">✕</button>
                </div>
              )}
          </div>
      </div>
    </div>
  );
};
