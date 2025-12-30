
import React, { useState, useEffect } from 'react';
import { BusinessProfile, AppView, BusinessNameIdea, FounderProfile } from '../types';
import { getBusinessProfiles, saveBusinessProfile } from '../services/storageService';
import { generateBusinessNames, generateLogoOptions } from '../services/geminiService';
import heroImage from '@assets/public-bar-058_1766520289277.jpg';

const SKILL_OPTIONS = [
    "Software Development", "Marketing", "Graphic Design", "Data Analysis", 
    "Project Management", "Sales", "Content Writing", "Social Media Strategy", 
    "Customer Service", "Finance", "Leadership", "SEO", "UI/UX Design",
    "Public Speaking", "Research", "Teaching", "Video Editing", "Machine Learning"
];

const INTEREST_OPTIONS = [
    "Technology", "Health & Wellness", "Sustainability", "Gaming", 
    "Fashion", "Travel", "Food & Beverage", "Education", "Art & Design",
    "Music", "Sports", "Real Estate", "Crypto/Web3", "Movies", 
    "Photography", "Reading", "Cooking", "DIY/Crafts"
];

const INDUSTRY_OPTIONS = [
    "SaaS", "E-commerce", "Fintech", "HealthTech", "EdTech", 
    "Retail", "Media & Entertainment", "Consulting", "Non-profit", 
    "Manufacturing", "Logistics", "Real Estate", "Automotive",
    "Artificial Intelligence", "Cybersecurity", "Clean Energy"
];

interface FounderModeProps {
  onNavigate?: (view: AppView) => void;
}

type FounderView = 'overview' | 'brand-identity' | 'name-generator' | 'logo-generator' | 'domain-check' | 'roadmap' | 'pitch-builder' | 'revenue-strategy' | 'execution' | 'business-profile';

export const FounderMode: React.FC<FounderModeProps> = ({ onNavigate }) => {
  const [currentView, setCurrentView] = useState<FounderView>('overview');
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Name Generator State
  const [nameProfile, setNameProfile] = useState<FounderProfile>({
        interests: '',
        skills: '',
        urgency: 'ASAP',
        tone: 'Professional',
        industry: '',
        includeWords: '',
        nameStyle: 'Auto'
    });
    const [nameIdeas, setNameIdeas] = useState<BusinessNameIdea[]>([]);
  const [nameLoading, setNameLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Logo Generator State
  const [selectedBusinessName, setSelectedBusinessName] = useState('');
    const [logoStyle, setLogoStyle] = useState('Modern');
    const [generatedLogos, setGeneratedLogos] = useState<string[]>([]);
    const [logoLoading, setLogoLoading] = useState(false);
  
  // Domain Check State
  const [domainToCheck, setDomainToCheck] = useState('');
  const [domainResults, setDomainResults] = useState<{domain: string; available: boolean}[]>([]);
  
  // Roadmap State
  const [roadmapAssessment, setRoadmapAssessment] = useState({
    primaryGoal: 'First dollar' as 'First dollar' | 'First customer' | 'Validate idea' | 'Build MVP',
    hoursPerDay: '1–2' as '<1' | '1–2' | '3–4' | '5+',
    comfortableTalkingToCustomers: 'Yes' as 'Yes' | 'Some' | 'No',
    comfortableSellingDirectly: 'Yes' as 'Yes' | 'Some' | 'No',
    whatWouldStopYou: 'Fear' as 'Fear' | 'Time' | 'Skills' | 'Money' | 'Uncertainty'
  });
  const [roadmapResult, setRoadmapResult] = useState<any>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  
  // Pitch Builder State
  const [pitchAssessment, setPitchAssessment] = useState({
    pitchingTo: 'Customer' as 'Customer' | 'Partner' | 'Employer' | 'Investor',
    pitchLength: '30 seconds' as '15 seconds' | '30 seconds' | '60 seconds',
    hardestToExplain: 'Problem' as 'Problem' | 'Value' | 'Differentiation',
    speakingConfidence: 'Medium' as 'High' | 'Medium' | 'Low'
  });
  const [pitchResult, setPitchResult] = useState<any>(null);
  const [pitchLoading, setPitchLoading] = useState(false);
  
  // Revenue Strategy State
  const [revenueAssessment, setRevenueAssessment] = useState({
    incomeTimeline: 'Now' as 'Now' | '30 days' | '90+ days',
    willingToSellTime: 'Yes' as 'Yes' | 'Some' | 'No',
    willingToBuildOnceSellMany: 'Yes' as 'Yes' | 'Some' | 'No',
    pricingComfort: 'Medium ($$)' as 'Low ($)' | 'Medium ($$)' | 'High ($$$)',
    salesTolerance: 'Mixed' as 'Direct sales' | 'Inbound only' | 'Mixed',
    existingProof: 'None' as 'Past clients' | 'Audience' | 'Case studies' | 'None'
  });
  const [strategyResult, setStrategyResult] = useState<any>(null);
  const [strategyLoading, setStrategyLoading] = useState(false);
  
  // Business Profile Modal State
  const [profileFormData, setProfileFormData] = useState({
    businessName: '',
    businessType: 'Product' as BusinessProfile['businessType'],
    soloOrTeam: 'Solo' as BusinessProfile['soloOrTeam'],
    stage: 'Idea only' as BusinessProfile['stage'],
    timeAvailablePerWeek: '',
    incomeUrgency: 'Immediate' as BusinessProfile['incomeUrgency'],
    existingAssets: [] as string[],
    targetCustomer: '',
    problemBeingSolved: '',
    pricingModel: ''
  });

    useEffect(() => {
    const profiles = getBusinessProfiles();
    setBusinessProfiles(profiles);
    if (profiles.length > 0 && !selectedProfileId) {
      setSelectedProfileId(profiles[0].id);
    }
  }, []);

  const selectedProfile = businessProfiles.find(p => p.id === selectedProfileId) || null;

  const handleGenerateNames = async () => {
    if (selectedSkills.length === 0 || selectedInterests.length === 0) {
      alert('Please select at least one skill and one interest.');
            return;
        }
    setNameLoading(true);
    try {
      const profileWithSelections = {
        ...nameProfile,
        skills: selectedSkills.join(', '),
        interests: selectedInterests.join(', ')
      };
      const names = await generateBusinessNames(profileWithSelections);
            setNameIdeas(names);
      setCurrentView('name-generator');
    } catch (e: any) {
      console.error('Name generation error:', e);
      alert(`Failed to generate names: ${e?.message || 'Unknown error'}. Please try again.`);
        } finally {
      setNameLoading(false);
    }
  };

  const handleGenerateLogos = async () => {
    if (!selectedBusinessName) {
      alert('Please enter a business name.');
      return;
    }
        setLogoLoading(true);
        try {
      const logos = await generateLogoOptions(selectedBusinessName, nameProfile.industry || 'Business', logoStyle);
            setGeneratedLogos(logos);
        } catch (e) {
      alert('Failed to generate logos. Please try again.');
        } finally {
            setLogoLoading(false);
        }
    };

  const checkDomainAvailability = async (domain: string) => {
    // Simple domain check - in production, this would use a real domain API
    const cleanDomain = domain.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9-]/g, '');
    const extensions = ['.com', '.io', '.co', '.net', '.org'];
    const results = extensions.map(ext => ({
      domain: `${cleanDomain}${ext}`,
      available: Math.random() > 0.3 // Simulated - replace with real API
    }));
    setDomainResults(results);
  };

  const renderOverview = () => (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 text-white shadow-2xl border border-slate-800 mb-16">
                <div className="absolute inset-0">
                    <img src={heroImage} alt="" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/50"></div>
                </div>
                <div className="relative z-10 p-10 md:p-16">
                    <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-white/10 text-orange-300">
                        Venture Launch
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
                        Founder <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-amber-200 to-white" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Mode.</span>
                    </h1>
                    <p className="text-lg text-slate-300 leading-relaxed font-medium max-w-xl">
                        Transform your skills into a business with AI-powered naming and execution planning.
                    </p>
                </div>
            </div>

      {/* Brand Identity Section */}
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-[2.5rem] p-8 md:p-12 border-2 border-purple-200 dark:border-purple-800 shadow-2xl mb-16">
        {/* Brand Identity Image */}
        <div className="mb-8 rounded-2xl overflow-hidden shadow-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <img
            src={heroImage}
            alt="Brand Identity"
            className="w-full h-48 md:h-64 object-cover"
                />
            </div>

        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-2xl shadow-lg">
              🎨
                            </div>
                            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Brand Identity</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Create your business name, logo, and visual identity</p>
                            </div>
                        </div>

          {/* 3-column explainer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mt-8 mb-6">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
              <p className="text-3xl mb-2">✨</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">AI-powered business names</p>
                    </div>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
              <p className="text-3xl mb-2">🖼️</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Professional logo generation</p>
                    </div>
            <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl border border-pink-200 dark:border-pink-700">
              <p className="text-3xl mb-2">🌐</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Domain availability check</p>
                    </div>
                </div>
            </div>

        {/* Brand Identity Tools */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">✨ Business Name Generator</h3>
                  <p className="text-sm text-purple-100">AI-powered brandable business names</p>
                            </div>
                <button
                  onClick={() => setCurrentView('name-generator')}
                  className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-black transition-colors border border-white/30"
                >
                  Generate Names →
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-pink-600 p-6">
              <div className="flex items-center justify-between">
                            <div>
                  <h3 className="text-2xl font-black text-white mb-1">🖼️ Logo Generator</h3>
                  <p className="text-sm text-indigo-100">Generate professional logo concepts</p>
                            </div>
                <button
                  onClick={() => setCurrentView('logo-generator')}
                  className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-black transition-colors border border-white/30"
                >
                  Generate Logos →
                </button>
                        </div>
                    </div>
                    </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">🌐 Domain Availability Check</h3>
                  <p className="text-sm text-pink-100">Find available domains instantly</p>
                </div>
                <button
                  onClick={() => setCurrentView('domain-check')}
                  className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-black transition-colors border border-white/30"
                >
                  Check Domains →
                </button>
              </div>
            </div>
          </div>
        </div>
                    </div>

      {/* Execution Section */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-[2.5rem] p-8 md:p-12 border-2 border-emerald-200 dark:border-emerald-800 shadow-2xl mb-16">
        {/* Execution Image */}
        <div className="mb-8 rounded-2xl overflow-hidden shadow-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <img
            src={heroImage}
            alt="Execution & Launch"
            className="w-full h-48 md:h-64 object-cover"
          />
                    </div>

        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-2xl shadow-lg">
                                🚀
                            </div>
                            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Execution & Launch</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Get actionable plans to launch and monetize your business</p>
                            </div>
                        </div>

          {/* 3-column explainer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mt-8 mb-6">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700">
              <p className="text-3xl mb-2">📅</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">7-Day Roadmap</p>
                    </div>
            <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-700">
              <p className="text-3xl mb-2">🎤</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Pitch Builder</p>
            </div>
            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-200 dark:border-cyan-700">
              <p className="text-3xl mb-2">💰</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Revenue Strategy</p>
                    </div>
                    </div>
                </div>

        {/* Active Business Profile Selector */}
        {businessProfiles.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <h4 className="text-sm font-black text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wider">Active Business Profile</h4>
                            <select 
                value={selectedProfileId || ''}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {businessProfiles.map(profile => (
                  <option key={profile.id} value={profile.id}>{profile.businessName}</option>
                ))}
                            </select>
              <button
                onClick={() => setShowProfileModal(true)}
                className="mt-3 w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                + Create New Profile
              </button>
                    </div>
            </div>
        )}

        {/* Execution Tools */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">📅 7-Day Roadmap</h3>
                  <p className="text-sm text-emerald-100">Day-by-day plan to earn your first dollar</p>
        </div>
                <button 
                  onClick={() => {
                    if (!selectedProfileId && businessProfiles.length === 0) {
                      setShowProfileModal(true);
                    } else {
                      setCurrentView('roadmap');
                    }
                  }}
                  className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-black transition-colors border border-white/30"
                >
                  Start Roadmap →
                </button>
              </div>
            </div>
        </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">🎤 Pitch Builder</h3>
                  <p className="text-sm text-teal-100">Craft your perfect elevator pitch</p>
                </div>
                        <button 
                  onClick={() => {
                    if (!selectedProfileId && businessProfiles.length === 0) {
                      setShowProfileModal(true);
                    } else {
                      setCurrentView('pitch-builder');
                    }
                  }}
                  className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-black transition-colors border border-white/30"
                >
                  Build Pitch →
                        </button>
        </div>
                            </div>
            </div>
            
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">💰 Revenue Strategy</h3>
                  <p className="text-sm text-cyan-100">Identify your best monetization paths</p>
                                </div>
                                <button 
                  onClick={() => {
                    if (!selectedProfileId && businessProfiles.length === 0) {
                      setShowProfileModal(true);
                    } else {
                      setCurrentView('revenue-strategy');
                    }
                  }}
                  className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-black transition-colors border border-white/30"
                >
                  View Strategy →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                                    </div>
                                </div>
  );

  const renderNameGenerator = () => (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button
        onClick={() => setCurrentView('overview')}
        className="mb-6 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
      >
        ← Back to Overview
      </button>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8">✨ Business Name Generator</h1>
      
      {nameIdeas.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Tell us about your business</h2>
          <div className="space-y-6">
                    <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Top Skills (select multiple)</label>
              <select
                multiple
                value={selectedSkills}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedSkills(values);
                }}
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none min-h-[120px]"
                size={5}
              >
                {SKILL_OPTIONS.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
                    </div>
                    <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Interests / Passions (select multiple)</label>
                        <select 
                multiple
                value={selectedInterests}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedInterests(values);
                }}
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none min-h-[120px]"
                size={5}
              >
                {INTEREST_OPTIONS.map(interest => (
                  <option key={interest} value={interest}>{interest}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Industry (Optional)</label>
                <select
                  value={nameProfile.industry || ''}
                  onChange={(e) => setNameProfile({...nameProfile, industry: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">Select industry...</option>
                  {INDUSTRY_OPTIONS.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Brand Tone</label>
                <select
                  value={nameProfile.tone}
                  onChange={(e) => setNameProfile({...nameProfile, tone: e.target.value as any})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            <option value="Professional">Professional</option>
                            <option value="Bold">Bold</option>
                            <option value="Minimal">Minimal</option>
                            <option value="Tech">Tech / Modern</option>
                            <option value="Mysterious">Mysterious</option>
                        </select>
                    </div>
                </div>
                        <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Must Include Word(s) (Optional)</label>
                            <input 
                                type="text" 
                value={nameProfile.includeWords || ''}
                onChange={(e) => setNameProfile({...nameProfile, includeWords: e.target.value})}
                                placeholder="e.g. 'Lab', 'Stream'"
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                <button 
              onClick={handleGenerateNames}
              disabled={nameLoading}
              className="w-full py-4 bg-purple-600 text-white font-black rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-3"
            >
              {nameLoading ? (
                <> <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Generating Names...</>
              ) : (
                <>Generate Business Names ⚡</>
                    )}
                </button>
            </div>
        </div>
      ) : (
                <div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-slate-600 dark:text-slate-400">We found {nameIdeas.length} brandable names for you</p>
            <button
              onClick={() => setNameIdeas([])}
              className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            >
              Generate New Names
            </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {nameIdeas.map((idea, i) => (
              <div
                            key={i}
                className="group text-left p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-purple-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                        >
                            <div className="flex justify-between items-start mb-2">
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">{idea.name}</h4>
                                {idea.availabilityStatus && (
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                                        idea.availabilityStatus === 'available' ? 'bg-green-50 text-green-700 border-green-200' :
                                        idea.availabilityStatus === 'taken' ? 'bg-red-50 text-red-700 border-red-200' :
                                        'bg-slate-50 text-slate-600 border-slate-200'
                                    }`}>
                                        {idea.availabilityStatus === 'available' ? 'AVAILABLE' : idea.availabilityStatus === 'taken' ? 'TAKEN' : 'UNKNOWN'}
                                    </span>
                                )}
                            </div>
                <div className="text-sm font-mono text-purple-600 dark:text-purple-400 mb-3 bg-purple-50 dark:bg-purple-900/20 inline-block px-2 py-1 rounded">{idea.domain}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{idea.meaning}</p>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{idea.industryFit}</span>
                  <button
                    onClick={() => {
                      setSelectedBusinessName(idea.name);
                      setCurrentView('logo-generator');
                    }}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold text-sm"
                  >
                    Use for Logo →
                        </button>
                </div>
              </div>
                    ))}
          </div>
                </div>
            )}
        </div>
    );

  const renderLogoGenerator = () => (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <button
        onClick={() => setCurrentView('overview')}
        className="mb-6 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
      >
        ← Back to Overview
      </button>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8">🖼️ Logo Generator</h1>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Business Name</label>
            <input
              type="text"
              value={selectedBusinessName}
              onChange={(e) => setSelectedBusinessName(e.target.value)}
              placeholder="Enter your business name"
              className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Logo Style</label>
            <select
              value={logoStyle}
              onChange={(e) => setLogoStyle(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="Modern">Modern</option>
              <option value="Retro">Retro</option>
              <option value="Luxury">Luxury</option>
              <option value="Playful">Playful</option>
              <option value="Tech">Tech</option>
              <option value="Minimal">Minimal</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleGenerateLogos}
          disabled={logoLoading || !selectedBusinessName}
          className="w-full py-4 bg-purple-600 text-white font-black rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-3"
        >
          {logoLoading ? (
            <> <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Generating Logos...</>
          ) : (
            <>Generate Logos ⚡</>
          )}
        </button>
                            </div>

      {logoLoading && generatedLogos.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Generating logos... This may take a moment.</p>
                        </div>
        </div>
      )}

      {generatedLogos.length > 0 && (
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Generated Logos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {generatedLogos.map((logo, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 aspect-square flex items-center justify-center overflow-hidden group relative">
                {logo ? (
                  <>
                    <img src={logo} alt={`Logo ${i + 1}`} className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a
                        href={logo}
                        download={`logo-${selectedBusinessName}-${i}.png`}
                        className="px-4 py-2 bg-white text-slate-900 rounded-lg text-xs font-bold hover:scale-105 transition-transform"
                      >
                        Download
                      </a>
                                </div>
                  </>
                ) : (
                  <div className="text-slate-400 text-sm">Failed to load</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderDomainCheck = () => (
    <div className="max-w-4xl mx-auto px-4 py-12">
                                <button 
        onClick={() => setCurrentView('overview')}
        className="mb-6 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
      >
        ← Back to Overview
      </button>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8">🌐 Domain Availability Check</h1>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md mb-8">
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Enter Business Name</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={domainToCheck}
              onChange={(e) => setDomainToCheck(e.target.value)}
              placeholder="e.g. MyBusiness"
              className="flex-1 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <button
              onClick={() => checkDomainAvailability(domainToCheck)}
              disabled={!domainToCheck}
              className="px-6 py-3 bg-purple-600 text-white font-black rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              Check Availability
                                </button>
                            </div>
                            </div>
      </div>

      {domainResults.length > 0 && (
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Domain Availability Results</h2>
          <div className="space-y-3">
            {domainResults.map((result, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border-2 ${
                  result.available
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-lg font-black text-slate-900 dark:text-white">{result.domain}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    result.available
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {result.available ? 'AVAILABLE' : 'TAKEN'}
                  </span>
                </div>
                {result.available && (
                  <a
                    href={`https://www.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=${result.domain}`}
                                    target="_blank" 
                                    rel="noreferrer"
                    className="mt-3 inline-block text-sm font-bold text-green-700 dark:text-green-400 hover:underline"
                  >
                    Buy on GoDaddy →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const handleGenerateRoadmap = async () => {
    if (!selectedProfile) {
      alert('Please create or select a business profile first.');
      return;
    }
    setRoadmapLoading(true);
    try {
      // TODO: Implement roadmap generation with AI
      alert('Roadmap generation coming soon. This will use your business profile to create a 7-day plan.');
    } catch (e) {
      alert('Failed to generate roadmap. Please try again.');
    } finally {
      setRoadmapLoading(false);
    }
  };

  const renderRoadmap = () => {

    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
                                <button 
          onClick={() => setCurrentView('overview')}
          className="mb-6 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                >
          ← Back to Overview
                                </button>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">📅 7-Day Roadmap</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Create a realistic plan to earn your first dollar</p>

        {selectedProfile ? (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 mb-6 border border-emerald-200 dark:border-emerald-700">
            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Using Business Profile: {selectedProfile.businessName}</p>
                            </div>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-6 border border-amber-200 dark:border-amber-700">
            <p className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-2">No Business Profile Selected</p>
            <button
              onClick={() => setShowProfileModal(true)}
              className="text-sm font-bold text-amber-700 dark:text-amber-400 hover:underline"
            >
              Create a Business Profile first →
            </button>
                        </div>
        )}

        {!roadmapResult ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Assessment</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">What is your primary goal for the next 7 days?</label>
                <select
                  value={roadmapAssessment.primaryGoal}
                  onChange={(e) => setRoadmapAssessment({...roadmapAssessment, primaryGoal: e.target.value as any})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="First dollar">First dollar</option>
                  <option value="First customer">First customer</option>
                  <option value="Validate idea">Validate idea</option>
                  <option value="Build MVP">Build MVP</option>
                </select>
                    </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">How many hours per day can you commit?</label>
                <select
                  value={roadmapAssessment.hoursPerDay}
                  onChange={(e) => setRoadmapAssessment({...roadmapAssessment, hoursPerDay: e.target.value as any})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="<1">Less than 1 hour</option>
                  <option value="1–2">1–2 hours</option>
                  <option value="3–4">3–4 hours</option>
                  <option value="5+">5+ hours</option>
                </select>
                </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Are you comfortable talking to customers?</label>
                  <select
                    value={roadmapAssessment.comfortableTalkingToCustomers}
                    onChange={(e) => setRoadmapAssessment({...roadmapAssessment, comfortableTalkingToCustomers: e.target.value as any})}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Yes">Yes</option>
                    <option value="Some">Some</option>
                    <option value="No">No</option>
                  </select>
                </div>

                                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Are you comfortable selling directly?</label>
                  <select
                    value={roadmapAssessment.comfortableSellingDirectly}
                    onChange={(e) => setRoadmapAssessment({...roadmapAssessment, comfortableSellingDirectly: e.target.value as any})}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Yes">Yes</option>
                    <option value="Some">Some</option>
                    <option value="No">No</option>
                  </select>
                                </div>
                                    </div>

                                <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">What would stop you from executing?</label>
                <select
                  value={roadmapAssessment.whatWouldStopYou}
                  onChange={(e) => setRoadmapAssessment({...roadmapAssessment, whatWouldStopYou: e.target.value as any})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Fear">Fear</option>
                  <option value="Time">Time</option>
                  <option value="Skills">Skills</option>
                  <option value="Money">Money</option>
                  <option value="Uncertainty">Uncertainty</option>
                </select>
                                    </div>

              <button
                onClick={handleGenerateRoadmap}
                disabled={roadmapLoading || !selectedProfile}
                className="w-full py-4 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-3"
              >
                {roadmapLoading ? (
                  <> <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Generating Roadmap...</>
                ) : (
                  <>Generate 7-Day Roadmap ⚡</>
                )}
              </button>
                                </div>
                            </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Your 7-Day Roadmap</h2>
            <p className="text-slate-600 dark:text-slate-400">Roadmap results will appear here...</p>
                                </div>
        )}
                            </div>
    );
  };

  const handleGeneratePitch = async () => {
    if (!selectedProfile) {
      alert('Please create or select a business profile first.');
      return;
    }
    setPitchLoading(true);
    try {
      // TODO: Implement pitch generation with AI
      alert('Pitch generation coming soon. This will use your business profile to create a spoken pitch.');
    } catch (e) {
      alert('Failed to generate pitch. Please try again.');
    } finally {
      setPitchLoading(false);
    }
  };

  const renderPitchBuilder = () => {

    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => setCurrentView('overview')}
          className="mb-6 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        >
          ← Back to Overview
        </button>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">🎤 Pitch Builder</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Craft your perfect elevator pitch</p>

        {selectedProfile ? (
          <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-4 mb-6 border border-teal-200 dark:border-teal-700">
            <p className="text-sm font-bold text-teal-900 dark:text-teal-300">Using Business Profile: {selectedProfile.businessName}</p>
                                    </div>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-6 border border-amber-200 dark:border-amber-700">
            <p className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-2">No Business Profile Selected</p>
            <button
              onClick={() => setShowProfileModal(true)}
              className="text-sm font-bold text-amber-700 dark:text-amber-400 hover:underline"
            >
              Create a Business Profile first →
            </button>
                            </div>
        )}

        {!pitchResult ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Assessment</h2>
            <div className="space-y-6">
                                    <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Who are you pitching to?</label>
                <select
                  value={pitchAssessment.pitchingTo}
                  onChange={(e) => setPitchAssessment({...pitchAssessment, pitchingTo: e.target.value as any})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="Customer">Customer</option>
                  <option value="Partner">Partner</option>
                  <option value="Employer">Employer</option>
                  <option value="Investor">Investor</option>
                </select>
                                    </div>

                                    <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Pitch length</label>
                <select
                  value={pitchAssessment.pitchLength}
                  onChange={(e) => setPitchAssessment({...pitchAssessment, pitchLength: e.target.value as any})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="15 seconds">15 seconds</option>
                  <option value="30 seconds">30 seconds</option>
                  <option value="60 seconds">60 seconds</option>
                </select>
                                </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">What's hardest to explain about your business?</label>
                                    <select
                  value={pitchAssessment.hardestToExplain}
                  onChange={(e) => setPitchAssessment({...pitchAssessment, hardestToExplain: e.target.value as any})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="Problem">Problem</option>
                  <option value="Value">Value</option>
                  <option value="Differentiation">Differentiation</option>
                                    </select>
                                </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">How confident are you speaking this aloud?</label>
                <select
                  value={pitchAssessment.speakingConfidence}
                  onChange={(e) => setPitchAssessment({...pitchAssessment, speakingConfidence: e.target.value as any})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                                    </select>
              </div>

                                    <button 
                onClick={handleGeneratePitch}
                disabled={pitchLoading || !selectedProfile}
                className="w-full py-4 bg-teal-600 text-white font-black rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-3"
              >
                {pitchLoading ? (
                  <> <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Generating Pitch...</>
                ) : (
                  <>Generate Pitch ⚡</>
                )}
                                    </button>
                                </div>
                            </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Your Pitch</h2>
            <p className="text-slate-600 dark:text-slate-400">Pitch results will appear here...</p>
          </div>
        )}
      </div>
    );
  };

  const handleGenerateStrategy = async () => {
    if (!selectedProfile) {
      alert('Please create or select a business profile first.');
      return;
    }
    setStrategyLoading(true);
    try {
      // TODO: Implement revenue strategy generation with AI
      alert('Revenue strategy generation coming soon. This will use your business profile to identify monetization paths.');
    } catch (e) {
      alert('Failed to generate strategy. Please try again.');
    } finally {
      setStrategyLoading(false);
    }
  };

  const renderRevenueStrategy = () => {

    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
                                                <button 
          onClick={() => setCurrentView('overview')}
          className="mb-6 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                                >
          ← Back to Overview
                                                </button>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">💰 Revenue Strategy</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Identify your best monetization paths</p>

        {selectedProfile ? (
          <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-4 mb-6 border border-cyan-200 dark:border-cyan-700">
            <p className="text-sm font-bold text-cyan-900 dark:text-cyan-300">Using Business Profile: {selectedProfile.businessName}</p>
          </div>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-6 border border-amber-200 dark:border-amber-700">
            <p className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-2">No Business Profile Selected</p>
                                                <button 
              onClick={() => setShowProfileModal(true)}
              className="text-sm font-bold text-amber-700 dark:text-amber-400 hover:underline"
                                                >
              Create a Business Profile first →
                                                </button>
                                            </div>
        )}

        {!strategyResult ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Assessment</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">How soon do you need income?</label>
                <select
                  value={revenueAssessment.incomeTimeline}
                  onChange={(e) => setRevenueAssessment({...revenueAssessment, incomeTimeline: e.target.value as any})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                >
                  <option value="Now">Now</option>
                  <option value="30 days">30 days</option>
                  <option value="90+ days">90+ days</option>
                </select>
                                        </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Are you willing to sell time for money?</label>
                  <select
                    value={revenueAssessment.willingToSellTime}
                    onChange={(e) => setRevenueAssessment({...revenueAssessment, willingToSellTime: e.target.value as any})}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="Yes">Yes</option>
                    <option value="Some">Some</option>
                    <option value="No">No</option>
                  </select>
                            </div>
                            
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Are you willing to build once, sell many?</label>
                  <select
                    value={revenueAssessment.willingToBuildOnceSellMany}
                    onChange={(e) => setRevenueAssessment({...revenueAssessment, willingToBuildOnceSellMany: e.target.value as any})}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="Yes">Yes</option>
                    <option value="Some">Some</option>
                    <option value="No">No</option>
                  </select>
                                        </div>
                            </div>
                            
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Pricing comfort</label>
                <select
                  value={revenueAssessment.pricingComfort}
                  onChange={(e) => setRevenueAssessment({...revenueAssessment, pricingComfort: e.target.value as any})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                >
                  <option value="Low ($)">Low ($)</option>
                  <option value="Medium ($$)">Medium ($$)</option>
                  <option value="High ($$$)">High ($$$)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Sales tolerance</label>
                <select
                  value={revenueAssessment.salesTolerance}
                  onChange={(e) => setRevenueAssessment({...revenueAssessment, salesTolerance: e.target.value as any})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                >
                  <option value="Direct sales">Direct sales</option>
                  <option value="Inbound only">Inbound only</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Existing proof</label>
                <select
                  value={revenueAssessment.existingProof}
                  onChange={(e) => setRevenueAssessment({...revenueAssessment, existingProof: e.target.value as any})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                >
                  <option value="Past clients">Past clients</option>
                  <option value="Audience">Audience</option>
                  <option value="Case studies">Case studies</option>
                  <option value="None">None</option>
                </select>
              </div>

                                                <button 
                onClick={handleGenerateStrategy}
                disabled={strategyLoading || !selectedProfile}
                className="w-full py-4 bg-cyan-600 text-white font-black rounded-xl hover:bg-cyan-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-3"
              >
                {strategyLoading ? (
                  <> <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Generating Strategy...</>
                ) : (
                  <>Generate Revenue Strategy ⚡</>
                )}
                                                </button>
                                            </div>
                                    </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Your Revenue Strategy</h2>
            <p className="text-slate-600 dark:text-slate-400">Strategy results will appear here...</p>
                                </div>
                            )}
                    </div>
    );
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profile = saveBusinessProfile(profileFormData);
    setBusinessProfiles([...businessProfiles, profile]);
    setSelectedProfileId(profile.id);
    setShowProfileModal(false);
    // Reset form
    setProfileFormData({
      businessName: '',
      businessType: 'Product',
      soloOrTeam: 'Solo',
      stage: 'Idea only',
      timeAvailablePerWeek: '',
      incomeUrgency: 'Immediate',
      existingAssets: [],
      targetCustomer: '',
      problemBeingSolved: '',
      pricingModel: ''
    });
  };

  const renderBusinessProfileModal = () => {

    const assetOptions = ['Skills', 'Audience', 'Email list', 'Portfolio', 'Capital', 'None'];

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Create Business Profile</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Business Name *</label>
              <input
                type="text"
                value={profileFormData.businessName}
                onChange={(e) => setProfileFormData({...profileFormData, businessName: e.target.value})}
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                required
              />
                                        </div>
                                        
            <div className="grid grid-cols-2 gap-4">
                                    <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Business Type *</label>
                <select
                  value={profileFormData.businessType}
                  onChange={(e) => setProfileFormData({...profileFormData, businessType: e.target.value as BusinessProfile['businessType']})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                >
                  <option value="Product">Product</option>
                  <option value="Service">Service</option>
                  <option value="Content / Media">Content / Media</option>
                  <option value="Marketplace">Marketplace</option>
                  <option value="Other">Other</option>
                </select>
                                            </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Solo or Team? *</label>
                                    <select
                  value={profileFormData.soloOrTeam}
                  onChange={(e) => setProfileFormData({...profileFormData, soloOrTeam: e.target.value as BusinessProfile['soloOrTeam']})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                >
                  <option value="Solo">Solo</option>
                  <option value="Team">Team</option>
                                    </select>
                                        </div>
                                    </div>
                            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Stage *</label>
                <select
                  value={profileFormData.stage}
                  onChange={(e) => setProfileFormData({...profileFormData, stage: e.target.value as BusinessProfile['stage']})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                >
                  <option value="Idea only">Idea only</option>
                  <option value="Pre-revenue">Pre-revenue</option>
                  <option value="First customers">First customers</option>
                  <option value="Active revenue">Active revenue</option>
                </select>
                                            </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Time Available/Week *</label>
                <input
                  type="text"
                  value={profileFormData.timeAvailablePerWeek}
                  onChange={(e) => setProfileFormData({...profileFormData, timeAvailablePerWeek: e.target.value})}
                  placeholder="e.g., 10-20 hours"
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                />
                                        </div>
                            </div>
                            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Income Urgency *</label>
                <select
                  value={profileFormData.incomeUrgency}
                  onChange={(e) => setProfileFormData({...profileFormData, incomeUrgency: e.target.value as BusinessProfile['incomeUrgency']})}
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                required
              >
                <option value="Immediate">Immediate</option>
                <option value="30–60 days">30–60 days</option>
                <option value="Long-term">Long-term</option>
              </select>
                                            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Existing Assets (select all that apply)</label>
              <div className="grid grid-cols-3 gap-2">
                {assetOptions.map(asset => (
                  <label key={asset} className="flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-purple-400 transition-colors">
                    <input
                      type="checkbox"
                        checked={profileFormData.existingAssets.includes(asset)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfileFormData({...profileFormData, existingAssets: [...profileFormData.existingAssets, asset]});
                          } else {
                            setProfileFormData({...profileFormData, existingAssets: profileFormData.existingAssets.filter(a => a !== asset)});
                          }
                        }}
                      className="rounded"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{asset}</span>
                  </label>
                                        ))}
                                    </div>
                            </div>
                            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Target Customer (Optional)</label>
                <input
                  type="text"
                  value={profileFormData.targetCustomer}
                  onChange={(e) => setProfileFormData({...profileFormData, targetCustomer: e.target.value})}
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
                            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Problem Being Solved (Optional)</label>
                <textarea
                  value={profileFormData.problemBeingSolved}
                  onChange={(e) => setProfileFormData({...profileFormData, problemBeingSolved: e.target.value})}
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                rows={3}
              />
                        </div>
                                        
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Pricing Model (Optional)</label>
                <input
                  type="text"
                  value={profileFormData.pricingModel}
                  onChange={(e) => setProfileFormData({...profileFormData, pricingModel: e.target.value})}
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
                    </div>
                            
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-black hover:bg-purple-700 transition-colors"
              >
                Create Profile
              </button>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
                            </div>
          </form>
                </div>
            </div>
        );
    };

    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {currentView === 'overview' && renderOverview()}
      {currentView === 'name-generator' && renderNameGenerator()}
      {currentView === 'logo-generator' && renderLogoGenerator()}
      {currentView === 'domain-check' && renderDomainCheck()}
      {currentView === 'roadmap' && renderRoadmap()}
      {currentView === 'pitch-builder' && renderPitchBuilder()}
      {currentView === 'revenue-strategy' && renderRevenueStrategy()}
      {showProfileModal && renderBusinessProfileModal()}
        </div>
    );
};
