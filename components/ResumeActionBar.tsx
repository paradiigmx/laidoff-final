import React, { useState, useEffect } from 'react';
import { SavedResume, ResumeRewriteResult, FileData } from '../types';
import { getSavedResumes } from '../services/storageService';

interface ResumeActionBarProps {
  savedResumes: SavedResume[];
  onResumeSelect: (resume: SavedResume) => void;
  onRewrite?: () => void;
  loading?: boolean;
  showRewrite?: boolean;
}

export const ResumeActionBar: React.FC<ResumeActionBarProps> = ({ 
  savedResumes, 
  onResumeSelect, 
  onRewrite,
  loading = false,
  showRewrite = true
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex flex-col md:flex-row gap-4 items-center shrink-0 z-20 shadow-sm">
      <div className="flex-1 w-full flex items-center gap-3">
        <div className="flex-1 relative">
          <select
            value=""
            onChange={(e) => {
              const resumeId = e.target.value;
              if (resumeId) {
                const selectedResume = savedResumes.find(r => r.id === resumeId);
                if (selectedResume) {
                  onResumeSelect(selectedResume);
                }
                e.target.value = '';
              }
            }}
            className="w-full pl-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none shadow-sm appearance-none cursor-pointer"
          >
            <option value="">Select a saved resume to open in new tab...</option>
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
        </div>
        {showRewrite && onRewrite && (
          <button 
            onClick={onRewrite} 
            disabled={loading} 
            className={`bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 shadow-lg shadow-brand-500/10 ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>✨</span>}
            {loading ? 'AI Working...' : 'Rewrite AI'}
          </button>
        )}
      </div>
    </div>
  );
};


