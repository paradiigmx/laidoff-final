
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { FileUploader } from './components/FileUploader';
import { ResumeView } from './components/ResumeView';
import { JobFinder } from './components/JobFinder';
import { MoneyResources } from './components/MoneyResources';
import { MonetizationResources } from './components/MonetizationResources';
import { UnemploymentResources } from './components/UnemploymentResources';
import { AssistanceResources } from './components/AssistanceResources';
import { FounderMode } from './components/FounderMode';
import { ProfileView } from './components/ProfileView';
import { EditProfileView } from './components/EditProfileView';
import { CoachView } from './components/CoachView';
import { SettingsView } from './components/SettingsView';
import { Hub } from './components/Hub';
import { FinancialAssessmentView } from './components/FinancialAssessmentView';
import { DreamShiftAssessmentView } from './components/DreamShiftAssessmentView';
import { AppView, FileData, ResumeRewriteResult, SavedResume, SavedFounderProject } from './types';

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [resumeData, setResumeData] = useState<ResumeRewriteResult | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  
  // State for loading saved items from profile
  const [founderProject, setFounderProject] = useState<SavedFounderProject | null>(null);

  useEffect(() => {
    const isDark = localStorage.getItem('dreamshift_dark') === 'true';
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('dreamshift_dark', String(next));
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  // Check for shared resume in URL hash - watch for changes
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#resume=')) {
          try {
              const encoded = hash.substring(8);
              const decoded = decodeURIComponent(escape(atob(encoded)));
              const data = JSON.parse(decoded);
              
              if (data && data.structuredResume) {
                  setResumeData(data as ResumeRewriteResult);
                  setFileData({
                      base64: '',
                      mimeType: 'application/json',
                      name: 'Shared Resume'
                  });
                  setCurrentView(AppView.RESUME);
              }
          } catch (e) {
              console.error("Failed to load resume from URL", e);
          }
      }
    };
    
    // Check on mount
    checkHash();
    
    // Listen for hash changes
    const handleHashChange = () => {
      checkHash();
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleFileSelect = (file: FileData) => {
    setFileData(file);
    setResumeData(null);
    setCurrentView(AppView.RESUME);
  };

  const handleLoadResume = (saved: SavedResume) => {
      setResumeData(saved.data);
      setFileData({
          base64: '',
          mimeType: 'application/json',
          name: saved.name
      });
      setCurrentView(AppView.RESUME);
  };

  const handleLoadProject = (saved: SavedFounderProject) => {
      setFounderProject(saved);
      setCurrentView(AppView.FOUNDER);
  };

  // Restore resume data from URL hash when navigating to resume view
  useEffect(() => {
    if (currentView === AppView.RESUME) {
      const hash = window.location.hash;
      if (hash.startsWith('#resume=')) {
        // If we have hash but missing data, reload it
        if (!resumeData || !fileData) {
          try {
            const encoded = hash.substring(8);
            const decoded = decodeURIComponent(escape(atob(encoded)));
            const data = JSON.parse(decoded);
            
            if (data && data.structuredResume) {
              if (!resumeData) {
                setResumeData(data as ResumeRewriteResult);
              }
              if (!fileData) {
                setFileData({
                  base64: '',
                  mimeType: 'application/json',
                  name: 'Shared Resume'
                });
              }
            }
          } catch (e) {
            console.error("Failed to reload resume from URL", e);
          }
        }
      }
    }
  }, [currentView]);

  const renderContent = () => {
    switch (currentView) {
      case AppView.HOME:
        return <Hub onNavigate={setCurrentView} />;
      
      case AppView.PROFILE:
        return <EditProfileView onBack={() => setCurrentView(AppView.HOME)} />;

      case AppView.RESUME:
        // If we have resumeData from URL hash but no fileData, create a minimal fileData
        if (!fileData && resumeData) {
          return (
            <ResumeView 
              fileData={{
                base64: '',
                mimeType: 'application/json',
                name: 'Resume'
              }} 
              resumeData={resumeData} 
              setResumeData={setResumeData} 
            />
          );
        }
        if (!fileData) {
            return <FileUploader onFileSelect={handleFileSelect} />;
        }
        return (
          <ResumeView 
            fileData={fileData} 
            resumeData={resumeData} 
            setResumeData={setResumeData} 
          />
        );
      
      case AppView.JOBS:
        return <JobFinder resumeData={resumeData} />;

      case AppView.MONEY:
        return <MoneyResources />;
      
      case AppView.MONETIZATION:
        return <MonetizationResources />;

      case AppView.UNEMPLOYMENT:
        return <UnemploymentResources />;
      
      case AppView.ASSISTANCE:
        return <AssistanceResources />;
      
      case AppView.FOUNDER:
        return <FounderMode initialProject={founderProject} />;
      
      case AppView.COACH:
        return <CoachView resumeData={resumeData} onNavigate={setCurrentView} />;
      
      case AppView.FINANCIAL_ASSESSMENT:
        return <FinancialAssessmentView onNavigate={setCurrentView} />;

      case AppView.DREAMSHIFT_ASSESSMENT:
        return <DreamShiftAssessmentView onNavigate={setCurrentView} />;

      case AppView.SETTINGS:
        return <SettingsView darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />;
        
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      darkMode={darkMode}
      onToggleDarkMode={toggleDarkMode}
      onChangeView={(view) => {
          setCurrentView(view);
          if (view === AppView.FOUNDER) setFounderProject(null);
      }}
      hasResume={!!fileData}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
