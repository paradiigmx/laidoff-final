
import React, { useState, useEffect } from 'react';
import { BusinessProfile, AppView, BusinessNameIdea, FounderProfile } from '../types';
import { getBusinessProfiles, saveBusinessProfile, deleteBusinessProfile, updateBusinessProfile, saveRoadmapToProfile, savePitchToProfile, saveRevenueStrategyToProfile, saveLogoToProfile, saveNoteToProfile, updateNoteInProfile, deleteNoteFromProfile, toggleFavoriteInvestor, saveInvestorNote } from '../services/storageService';
import { generateBusinessNames, generateRoadmap, RoadmapResult, generatePitch, PitchResult, generateRevenueStrategy, RevenueStrategyResult, searchAngelInvestors, AngelInvestor } from '../services/geminiService';
import { MultiSelectField } from './MultiSelectField';
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

type FounderView = 'overview' | 'brand-identity' | 'name-generator' | 'roadmap' | 'pitch-builder' | 'revenue-strategy' | 'execution' | 'business-profile' | 'business-profile-creator' | 'profile-detail' | 'angel-investors' | 'entity-formation' | 'ein-guide' | 'first-10-customers' | 'resources' | 'skills-to-business' | 'business-idea-validator' | 'pricing-first-offer' | 'business-structure-guide';

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

  
  // Roadmap State
  const [roadmapAssessment, setRoadmapAssessment] = useState({
    primaryGoal: 'First dollar' as 'First dollar' | 'First customer' | 'Validate idea' | 'Build MVP',
    hoursPerDay: '1–2' as '<1' | '1–2' | '3–4' | '5+',
    comfortableTalkingToCustomers: 'Yes' as 'Yes' | 'Some' | 'No',
    comfortableSellingDirectly: 'Yes' as 'Yes' | 'Some' | 'No',
    whatWouldStopYou: 'Fear' as 'Fear' | 'Time' | 'Skills' | 'Money' | 'Uncertainty'
  });
  const [roadmapResult, setRoadmapResult] = useState<RoadmapResult | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  
  // Pitch Builder State
  const [pitchAssessment, setPitchAssessment] = useState({
    pitchingTo: 'Customer' as 'Customer' | 'Partner' | 'Employer' | 'Investor',
    pitchLength: '30 seconds' as '15 seconds' | '30 seconds' | '60 seconds',
    hardestToExplain: 'Problem' as 'Problem' | 'Value' | 'Differentiation',
    speakingConfidence: 'Medium' as 'High' | 'Medium' | 'Low'
  });
  const [pitchResult, setPitchResult] = useState<PitchResult | null>(null);
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
  const [strategyResult, setStrategyResult] = useState<RevenueStrategyResult | null>(null);
  const [strategyLoading, setStrategyLoading] = useState(false);
  
  // Angel Investor Search State
  const [angelInvestors, setAngelInvestors] = useState<AngelInvestor[]>([]);
  const [investorLoading, setInvestorLoading] = useState(false);
  const [editingInvestorNote, setEditingInvestorNote] = useState<{investorId: string; pros: string[]; cons: string[]; compatibility: number; notes: string} | null>(null);
  const [showInvestorNoteModal, setShowInvestorNoteModal] = useState(false);
  const [investorProInput, setInvestorProInput] = useState('');
  const [investorConInput, setInvestorConInput] = useState('');
  const [investorNotesText, setInvestorNotesText] = useState('');
  const [investorCompatibility, setInvestorCompatibility] = useState(50);
  const [investorProsList, setInvestorProsList] = useState<string[]>([]);
  const [investorConsList, setInvestorConsList] = useState<string[]>([]);
  
  // Entity Formation State
  const [selectedEntityType, setSelectedEntityType] = useState<'LLC' | 'Corporation' | 'S-Corp' | 'Non-Profit' | 'Partnership' | 'Sole Proprietorship'>('LLC');
  const [selectedState, setSelectedState] = useState('California');
  
  // Notes State
  const [notes, setNotes] = useState<Array<{id: string; title: string; content: string; createdAt: string; updatedAt: string}>>([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<{id: string; title: string; content: string} | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  
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
  const [showSaveProfileModal, setShowSaveProfileModal] = useState(false);
  const [selectedNameToSave, setSelectedNameToSave] = useState<BusinessNameIdea | null>(null);
  
  // Combined Business Profile Creator State
  const [useCustomName, setUseCustomName] = useState(false);
  const [combinedFormData, setCombinedFormData] = useState({
    // Business Profile fields
    businessName: '',
    businessType: 'Product' as BusinessProfile['businessType'],
    soloOrTeam: 'Solo' as BusinessProfile['soloOrTeam'],
    stage: 'Idea only' as BusinessProfile['stage'],
    timeAvailablePerWeek: '',
    incomeUrgency: 'Immediate' as BusinessProfile['incomeUrgency'],
    existingAssets: [] as string[],
    targetCustomer: '',
    problemBeingSolved: '',
    pricingModel: '',
    // Name Generator fields
    selectedSkills: [] as string[],
    selectedInterests: [] as string[],
    industry: '',
    tone: 'Professional' as 'Professional' | 'Bold' | 'Minimal' | 'Tech' | 'Mysterious',
    includeWords: ''
  });
  const [combinedNameIdeas, setCombinedNameIdeas] = useState<BusinessNameIdea[]>([]);
  const [combinedNameLoading, setCombinedNameLoading] = useState(false);

    useEffect(() => {
    const profiles = getBusinessProfiles();
    setBusinessProfiles(profiles);
    if (profiles.length > 0 && !selectedProfileId) {
      setSelectedProfileId(profiles[0].id);
    }
  }, []);

  const selectedProfile = businessProfiles.find(p => p.id === selectedProfileId) || null;

  // Load saved outputs when profile changes
  useEffect(() => {
    if (selectedProfile && selectedProfile.notes) {
      setNotes(selectedProfile.notes);
    } else {
      setNotes([]);
    }
  }, [selectedProfile?.id, currentView]);


  // Update note form when editing
  useEffect(() => {
    if (editingNote) {
      setNoteTitle(editingNote.title);
      setNoteContent(editingNote.content);
    } else {
      setNoteTitle('');
      setNoteContent('');
    }
  }, [editingNote, showNoteModal]);

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
      setCurrentView('business-profile-creator');
    } catch (e: any) {
      console.error('Name generation error:', e);
      alert(`Failed to generate names: ${e?.message || 'Unknown error'}. Please try again.`);
        } finally {
      setNameLoading(false);
    }
  };


  const handleSaveBusinessProfile = (nameIdea: BusinessNameIdea) => {
    const newProfile = saveBusinessProfile({
      businessName: nameIdea.name,
      businessType: 'Product',
      soloOrTeam: 'Solo',
      stage: 'Idea only',
      timeAvailablePerWeek: '10-20 hours',
      incomeUrgency: 'Immediate',
      existingAssets: selectedSkills.slice(0, 3)
    });
    const updatedProfiles = getBusinessProfiles();
    setBusinessProfiles(updatedProfiles);
    setSelectedProfileId(newProfile.id);
    setShowSaveProfileModal(false);
    setSelectedNameToSave(null);
    alert(`Business profile "${nameIdea.name}" saved!`);
  };

  const handleLoadProfile = (profile: BusinessProfile) => {
    setSelectedProfileId(profile.id);
    if (profile.existingAssets) {
      const profileSkills = profile.existingAssets.filter(a => SKILL_OPTIONS.includes(a));
      if (profileSkills.length > 0) {
        setSelectedSkills(profileSkills);
      }
    }
  };

  const handleDeleteProfile = (profileId: string) => {
    if (confirm('Are you sure you want to delete this business profile?')) {
      deleteBusinessProfile(profileId);
      const updatedProfiles = getBusinessProfiles();
      setBusinessProfiles(updatedProfiles);
      if (selectedProfileId === profileId) {
        setSelectedProfileId(updatedProfiles.length > 0 ? updatedProfiles[0].id : null);
      }
    }
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
                    <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-white/10 text-blue-300">
                        Venture Launch
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
                        Founder <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-teal-300" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Mode.</span>
                    </h1>
                    <p className="text-lg text-slate-300 leading-relaxed font-medium max-w-xl">
                        Transform your skills into a business with AI-powered naming and execution planning.
                    </p>
                </div>
            </div>

      {/* Business Profile Selector - Top of Page */}
      {businessProfiles.length > 0 && (
        <div 
          onClick={() => selectedProfile && setCurrentView('profile-detail')}
          className={`bg-white dark:bg-slate-800 rounded-2xl border-2 ${selectedProfile ? 'border-brand-600 dark:border-brand-500 cursor-pointer hover:shadow-xl transition-all' : 'border-slate-200 dark:border-slate-700'} shadow-md mb-8 overflow-hidden`}
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              {/* Logo Display */}
              {selectedProfile && selectedProfile.savedLogos && selectedProfile.savedLogos.length > 0 ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center flex-shrink-0">
                  <img 
                    src={selectedProfile.savedLogos[0].logoUrl} 
                    alt={selectedProfile.businessName}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-2xl flex-shrink-0">
                  🏢
                </div>
              )}
              
              {/* Business Name and Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 truncate">
                  {selectedProfile ? selectedProfile.businessName : 'No Profile Selected'}
                </h3>
                {selectedProfile && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {selectedProfile.businessType} • {selectedProfile.stage}
                  </p>
                )}
              </div>

              {/* View Details Button */}
              {selectedProfile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentView('profile-detail');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-black rounded-lg hover:from-brand-700 hover:to-brand-800 transition-all flex-shrink-0"
                >
                  View Details →
                </button>
              )}
            </div>

            {/* Profile Selector Dropdown */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-black text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">Select Business Profile</label>
              <select
                value={selectedProfileId || ''}
                onChange={(e) => {
                  e.stopPropagation();
                  const profile = businessProfiles.find(p => p.id === e.target.value);
                  if (profile) {
                    handleLoadProfile(profile);
                  } else {
                    setSelectedProfileId(null);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
              >
                <option value="">Select a business profile...</option>
                {businessProfiles.map(profile => (
                  <option key={profile.id} value={profile.id}>{profile.businessName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Brand Identity Section */}
      <div className="bg-gradient-to-br from-brand-900/10 via-brand-800/10 to-teal-900/10 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-[2.5rem] p-8 md:p-12 border-2 border-brand-800/30 dark:border-brand-900/50 shadow-2xl mb-16">
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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-2xl shadow-lg">
              🎨
                            </div>
                            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Brand Identity</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Create your business name, logo, and visual identity</p>
                            </div>
                        </div>

            </div>

        {/* Brand Identity Tools */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">✨ Business Profile Creator</h3>
                  <p className="text-sm text-blue-100">Create your business profile and generate name ideas</p>
                            </div>
                <button
                  onClick={() => setCurrentView('business-profile-creator')}
                  className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-black transition-colors border border-white/30"
                >
                  Create Profile →
                </button>
              </div>
            </div>
          </div>


        </div>
                    </div>

      {/* Launch Section */}
      <div className="bg-gradient-to-br from-brand-900/10 via-brand-800/10 to-teal-900/10 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-[2.5rem] p-8 md:p-12 border-2 border-brand-800/30 dark:border-brand-900/50 shadow-2xl mb-16">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-2xl shadow-lg">
              🚀
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Launch</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Form your business entity and get your EIN</p>
            </div>
          </div>
        </div>

        {/* Launch Tools */}
        <div className="space-y-4">
          {/* Business Entity Formation - Dropdown */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-6">
              <div className="flex items-center justify-between">
                            <div>
                  <h3 className="text-2xl font-black text-white mb-1">🏢 Business Entity Formation</h3>
                  <p className="text-sm text-blue-100">Compare LLC costs by state with accurate 2026 pricing</p>
                            </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
                  >
                    <option value="Alabama">Alabama</option>
                    <option value="Alaska">Alaska</option>
                    <option value="Arizona">Arizona</option>
                    <option value="Arkansas">Arkansas</option>
                    <option value="California">California</option>
                    <option value="Colorado">Colorado</option>
                    <option value="Connecticut">Connecticut</option>
                    <option value="Delaware">Delaware</option>
                    <option value="Florida">Florida</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Hawaii">Hawaii</option>
                    <option value="Idaho">Idaho</option>
                    <option value="Illinois">Illinois</option>
                    <option value="Indiana">Indiana</option>
                    <option value="Iowa">Iowa</option>
                    <option value="Kansas">Kansas</option>
                    <option value="Kentucky">Kentucky</option>
                    <option value="Louisiana">Louisiana</option>
                    <option value="Maine">Maine</option>
                    <option value="Maryland">Maryland</option>
                    <option value="Massachusetts">Massachusetts</option>
                    <option value="Michigan">Michigan</option>
                    <option value="Minnesota">Minnesota</option>
                    <option value="Mississippi">Mississippi</option>
                    <option value="Missouri">Missouri</option>
                    <option value="Montana">Montana</option>
                    <option value="Nebraska">Nebraska</option>
                    <option value="Nevada">Nevada</option>
                    <option value="New Hampshire">New Hampshire</option>
                    <option value="New Jersey">New Jersey</option>
                    <option value="New Mexico">New Mexico</option>
                    <option value="New York">New York</option>
                    <option value="North Carolina">North Carolina</option>
                    <option value="North Dakota">North Dakota</option>
                    <option value="Ohio">Ohio</option>
                    <option value="Oklahoma">Oklahoma</option>
                    <option value="Oregon">Oregon</option>
                    <option value="Pennsylvania">Pennsylvania</option>
                    <option value="Rhode Island">Rhode Island</option>
                    <option value="South Carolina">South Carolina</option>
                    <option value="South Dakota">South Dakota</option>
                    <option value="Tennessee">Tennessee</option>
                    <option value="Texas">Texas</option>
                    <option value="Utah">Utah</option>
                    <option value="Vermont">Vermont</option>
                    <option value="Virginia">Virginia</option>
                    <option value="Washington">Washington</option>
                    <option value="West Virginia">West Virginia</option>
                    <option value="Wisconsin">Wisconsin</option>
                    <option value="Wyoming">Wyoming</option>
                    <option value="District of Columbia">District of Columbia</option>
                  </select>
                        </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Entity Type</label>
                  <select
                    value={selectedEntityType}
                    onChange={(e) => setSelectedEntityType(e.target.value as any)}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
                  >
                    <option value="LLC">LLC</option>
                    <option value="Corporation">C-Corporation</option>
                    <option value="S-Corp">S-Corporation</option>
                    <option value="Non-Profit">Non-Profit</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                  </select>
                </div>
              </div>
              {renderEntityFormationInfo()}
                    </div>
                    </div>

          {/* EIN Registration */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-brand-700 to-brand-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">🔢 Get EIN</h3>
                  <p className="text-sm text-blue-100">Learn about EINs and apply with the IRS</p>
                </div>
                <button
                  onClick={() => setCurrentView('ein-guide')}
                  className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-black transition-colors border border-white/30"
                >
                  Learn More →
                </button>
              </div>
            </div>
          </div>
        </div>
                    </div>

      {/* Execution Section */}
      <div className="bg-gradient-to-br from-brand-900/10 via-brand-800/10 to-teal-900/10 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-[2.5rem] p-8 md:p-12 border-2 border-brand-800/30 dark:border-brand-900/50 shadow-2xl mb-16">
        {/* Execution Image */}
        <div className="mb-8 rounded-2xl overflow-hidden shadow-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <img
            src={heroImage}
            alt="Execution"
            className="w-full h-48 md:h-64 object-cover"
          />
                    </div>

        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-2xl shadow-lg">
              ⚡
                            </div>
                            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Execution</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Get actionable plans to launch and monetize your business</p>
                            </div>
                        </div>

                </div>


        {/* Execution Tools */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">📅 7-Day Roadmap</h3>
                  <p className="text-sm text-blue-100">Day-by-day plan to earn your first dollar</p>
        </div>
                <button 
                  onClick={() => {
                    if (!selectedProfile) {
                      alert('Please create or select a business profile first.');
                      return;
                    }
                    setCurrentView('roadmap');
                  }}
                  className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-black transition-colors border border-white/30"
                >
                  Start Roadmap →
                </button>
              </div>
            </div>
        </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-brand-700 to-brand-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">🎤 Pitch Builder</h3>
                  <p className="text-sm text-blue-100">Craft your perfect elevator pitch</p>
                </div>
                        <button 
                  onClick={() => {
                    if (!selectedProfile) {
                      alert('Please create or select a business profile first.');
                      return;
                    }
                    setCurrentView('pitch-builder');
                  }}
                  className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-black transition-colors border border-white/30"
                >
                  Build Pitch →
                        </button>
        </div>
                            </div>
            </div>
            
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-brand-700 to-indigo-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">💰 Revenue Strategy</h3>
                  <p className="text-sm text-blue-100">Identify your best monetization paths</p>
                                </div>
                                <button 
                  onClick={() => {
                    if (!selectedProfile) {
                      alert('Please create or select a business profile first.');
                      return;
                    }
                    setCurrentView('revenue-strategy');
                  }}
                  className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-black transition-colors border border-white/30"
                >
                  View Strategy →
                                </button>
                            </div>
                        </div>
                    </div>

          {/* Angel Investors Card */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-8 border-2 border-brand-500 shadow-xl">
            <div className="mb-4">
              <h3 className="text-2xl font-black text-white mb-1">👼 Angel Investors</h3>
              <p className="text-sm text-blue-100">Find investors that match your business</p>
            </div>
            <button 
              onClick={() => {
                if (!selectedProfile) {
                  alert('Please create or select a business profile first.');
                  return;
                }
                setCurrentView('angel-investors');
              }}
              className="w-full py-4 bg-white/10 backdrop-blur-sm text-white font-black rounded-xl hover:bg-white/20 transition-all shadow-lg hover:shadow-xl border border-white/20"
            >
              Search Investors →
            </button>
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="bg-gradient-to-br from-indigo-900/10 via-indigo-800/10 to-purple-900/10 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-[2.5rem] p-8 md:p-12 border-2 border-indigo-800/30 dark:border-indigo-900/50 shadow-2xl mb-16">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-800 to-indigo-900 flex items-center justify-center text-2xl shadow-lg">
              📚
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Resources</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Essential guides and playbooks for building your business</p>
            </div>
          </div>
        </div>

        {/* Resource Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First 10 Customers */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden hover:shadow-xl transition-all">
            <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-6">
              <h3 className="text-2xl font-black text-white mb-1">📚 First 10 Customers</h3>
              <p className="text-sm text-blue-100">A practical playbook for finding your first paying customers</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Get a concrete, week-by-week system to find people who will actually pay you money—no marketing budget required.
              </p>
              <button
                onClick={() => setCurrentView('first-10-customers')}
                className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all"
              >
                Read Article →
              </button>
            </div>
          </div>

          {/* Skills to Business Mapper */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden hover:shadow-xl transition-all">
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-6">
              <h3 className="text-2xl font-black text-white mb-1">🎯 Skills to Business Mapper</h3>
              <p className="text-sm text-blue-200">Transform your skills into profitable business ideas</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Discover how to turn your existing skills and experience into viable business opportunities.
              </p>
              <button
                onClick={() => setCurrentView('skills-to-business')}
                className="w-full py-3 bg-gradient-to-r from-blue-800 to-blue-900 text-white font-black rounded-xl hover:from-blue-900 hover:to-blue-950 transition-all"
              >
                Read Article →
              </button>
            </div>
          </div>

          {/* Business Idea Validator */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden hover:shadow-xl transition-all">
            <div className="bg-gradient-to-r from-green-800 to-green-900 p-6">
              <h3 className="text-2xl font-black text-white mb-1">✅ Business Idea Validator</h3>
              <p className="text-sm text-green-200">Test your idea before you build it</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Validate your business idea in days, not months—before you invest serious time or money.
              </p>
              <button
                onClick={() => setCurrentView('business-idea-validator')}
                className="w-full py-3 bg-gradient-to-r from-green-800 to-green-900 text-white font-black rounded-xl hover:from-green-900 hover:to-green-950 transition-all"
              >
                Read Article →
              </button>
            </div>
          </div>

          {/* Pricing Your First Offer */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden hover:shadow-xl transition-all">
            <div className="bg-gradient-to-r from-purple-800 to-purple-900 p-6">
              <h3 className="text-2xl font-black text-white mb-1">💰 Pricing Your First Offer</h3>
              <p className="text-sm text-purple-200">How to set prices that get you paid</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                A practical framework for setting prices that work—especially when you're just starting out.
              </p>
              <button
                onClick={() => setCurrentView('pricing-first-offer')}
                className="w-full py-3 bg-gradient-to-r from-purple-800 to-purple-900 text-white font-black rounded-xl hover:from-purple-900 hover:to-purple-950 transition-all"
              >
                Read Article →
              </button>
            </div>
          </div>

          {/* Business Structure Guide */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden hover:shadow-xl transition-all">
            <div className="bg-gradient-to-r from-orange-800 to-orange-900 p-6">
              <h3 className="text-2xl font-black text-white mb-1">🏢 Business Structure Guide</h3>
              <p className="text-sm text-orange-200">LLC vs. Sole Prop vs. S-Corp: Which is right for you?</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Break down your business structure options in plain English, so you can make a smart choice without a law degree.
              </p>
              <button
                onClick={() => setCurrentView('business-structure-guide')}
                className="w-full py-3 bg-gradient-to-r from-orange-800 to-orange-900 text-white font-black rounded-xl hover:from-orange-900 hover:to-orange-950 transition-all"
              >
                Read Article →
              </button>
            </div>
          </div>
                </div>
                                    </div>
                                </div>
  );

  const handleGenerateCombinedNames = async (append: boolean = false) => {
    if (!useCustomName && (combinedFormData.selectedSkills.length === 0 || combinedFormData.selectedInterests.length === 0)) {
      alert('Please select at least one skill and one interest to generate names.');
      return;
    }
    setCombinedNameLoading(true);
    try {
      const profileWithSelections: FounderProfile = {
        skills: combinedFormData.selectedSkills.join(', '),
        interests: combinedFormData.selectedInterests.join(', '),
        urgency: combinedFormData.incomeUrgency === 'Immediate' ? 'ASAP' : combinedFormData.incomeUrgency === '30–60 days' ? '30-60 days' : 'Long-term',
        tone: combinedFormData.tone,
        industry: combinedFormData.industry || '',
        includeWords: combinedFormData.includeWords || '',
        nameStyle: 'Auto'
      };
      const names = await generateBusinessNames(profileWithSelections);
      if (append) {
        setCombinedNameIdeas(prev => [...prev, ...names]);
      } else {
        setCombinedNameIdeas(names);
      }
    } catch (e: any) {
      console.error('Name generation error:', e);
      const errorMessage = e?.message || 'Unknown error';
      if (errorMessage.includes('API_KEY') || errorMessage.includes('API key') || errorMessage.includes('GEMINI_API_KEY')) {
        alert('API Key Error: Please set your GEMINI_API_KEY in the .env.local file. See README.md for instructions.');
      } else {
        alert(`Failed to generate names: ${errorMessage}. Please try again.`);
      }
    } finally {
      setCombinedNameLoading(false);
    }
  };

  const handleCreateProfileFromCombined = (selectedName?: BusinessNameIdea) => {
    const finalName = useCustomName ? combinedFormData.businessName : (selectedName?.name || '');
    if (!finalName) {
      alert('Please provide a business name or generate and select one.');
      return;
    }
    
    const profile = saveBusinessProfile({
      businessName: finalName,
      businessType: combinedFormData.businessType,
      soloOrTeam: combinedFormData.soloOrTeam,
      stage: combinedFormData.stage,
      timeAvailablePerWeek: combinedFormData.timeAvailablePerWeek,
      incomeUrgency: combinedFormData.incomeUrgency,
      existingAssets: combinedFormData.existingAssets,
      targetCustomer: combinedFormData.targetCustomer || undefined,
      problemBeingSolved: combinedFormData.problemBeingSolved || undefined,
      pricingModel: combinedFormData.pricingModel || undefined
    });
    
    const updatedProfiles = getBusinessProfiles();
    setBusinessProfiles(updatedProfiles);
    setSelectedProfileId(profile.id);
    
    // Navigate back to overview or the appropriate view
    setCurrentView('overview');
    alert(`Business profile "${finalName}" created successfully!`);
    
    // Reset form
    setCombinedFormData({
      businessName: '',
      businessType: 'Product',
      soloOrTeam: 'Solo',
      stage: 'Idea only',
      timeAvailablePerWeek: '',
      incomeUrgency: 'Immediate',
      existingAssets: [],
      targetCustomer: '',
      problemBeingSolved: '',
      pricingModel: '',
      selectedSkills: [],
      selectedInterests: [],
      industry: '',
      tone: 'Professional',
      includeWords: ''
    });
    setCombinedNameIdeas([]);
    setUseCustomName(false);
  };

  const renderBusinessProfileCreator = () => {
    const assetOptions = ['Skills', 'Audience', 'Email list', 'Portfolio', 'Capital', 'None'];
    
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => {
            setCurrentView('overview');
            setCombinedNameIdeas([]);
            setUseCustomName(false);
          }}
          className="mb-6 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        >
          ← Back to Overview
        </button>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">✨ Business Profile Creator</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Create your business profile and generate name ideas</p>

        {combinedNameIdeas.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Tell us about your business</h2>
            
            {/* Business Name Option */}
            <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-slate-200 dark:border-slate-700">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomName}
                  onChange={(e) => setUseCustomName(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600"
                />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">I already have a business name</span>
              </label>
              {useCustomName && (
                <div className="mt-4">
                  <input
                    type="text"
                    value={combinedFormData.businessName}
                    onChange={(e) => setCombinedFormData({...combinedFormData, businessName: e.target.value})}
                    placeholder="Enter your business name"
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
                  />
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Business Profile Questions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Business Type *</label>
                  <select
                    value={combinedFormData.businessType}
                    onChange={(e) => setCombinedFormData({...combinedFormData, businessType: e.target.value as BusinessProfile['businessType']})}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                    value={combinedFormData.soloOrTeam}
                    onChange={(e) => setCombinedFormData({...combinedFormData, soloOrTeam: e.target.value as BusinessProfile['soloOrTeam']})}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                    value={combinedFormData.stage}
                    onChange={(e) => setCombinedFormData({...combinedFormData, stage: e.target.value as BusinessProfile['stage']})}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                    value={combinedFormData.timeAvailablePerWeek}
                    onChange={(e) => setCombinedFormData({...combinedFormData, timeAvailablePerWeek: e.target.value})}
                    placeholder="e.g., 10-20 hours"
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Income Urgency *</label>
                <select
                  value={combinedFormData.incomeUrgency}
                  onChange={(e) => setCombinedFormData({...combinedFormData, incomeUrgency: e.target.value as BusinessProfile['incomeUrgency']})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                    <label key={asset} className="flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-brand-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={combinedFormData.existingAssets.includes(asset)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCombinedFormData({...combinedFormData, existingAssets: [...combinedFormData.existingAssets, asset]});
                          } else {
                            setCombinedFormData({...combinedFormData, existingAssets: combinedFormData.existingAssets.filter(a => a !== asset)});
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{asset}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Name Generator Questions (only show if not using custom name) */}
              {!useCustomName && (
                <>
                  <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-6 mt-6">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Help us generate name ideas</h3>
                    
                    <MultiSelectField
                      label="Top Skills"
                      options={SKILL_OPTIONS}
                      selectedValues={combinedFormData.selectedSkills}
                      onChange={(skills) => setCombinedFormData({...combinedFormData, selectedSkills: skills})}
                      placeholder="Select skills..."
                    />
                    
                    <MultiSelectField
                      label="Interests / Passions"
                      options={INTEREST_OPTIONS}
                      selectedValues={combinedFormData.selectedInterests}
                      onChange={(interests) => setCombinedFormData({...combinedFormData, selectedInterests: interests})}
                      placeholder="Select interests..."
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Industry (Optional)</label>
                        <select
                          value={combinedFormData.industry}
                          onChange={(e) => setCombinedFormData({...combinedFormData, industry: e.target.value})}
                          className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                          value={combinedFormData.tone}
                          onChange={(e) => setCombinedFormData({...combinedFormData, tone: e.target.value as any})}
                          className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                        value={combinedFormData.includeWords}
                        onChange={(e) => setCombinedFormData({...combinedFormData, includeWords: e.target.value})}
                        placeholder="e.g. 'Lab', 'Stream'"
                        className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Optional fields */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Target Customer (Optional)</label>
                <input
                  type="text"
                  value={combinedFormData.targetCustomer}
                  onChange={(e) => setCombinedFormData({...combinedFormData, targetCustomer: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Problem Being Solved (Optional)</label>
                <textarea
                  value={combinedFormData.problemBeingSolved}
                  onChange={(e) => setCombinedFormData({...combinedFormData, problemBeingSolved: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Pricing Model (Optional)</label>
                <input
                  type="text"
                  value={combinedFormData.pricingModel}
                  onChange={(e) => setCombinedFormData({...combinedFormData, pricingModel: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                {!useCustomName && (
                  <button 
                    onClick={handleGenerateCombinedNames}
                    disabled={combinedNameLoading || combinedFormData.selectedSkills.length === 0 || combinedFormData.selectedInterests.length === 0}
                    className="flex-1 py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black rounded-xl hover:from-brand-500 hover:to-brand-600 transition-all disabled:opacity-50 flex justify-center items-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    {combinedNameLoading ? (
                      <> <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div> Generating...</>
                    ) : (
                      <>✨ Generate Names</>
                    )}
                  </button>
                )}
                {useCustomName && (
                  <button 
                    onClick={() => handleCreateProfileFromCombined()}
                    disabled={!combinedFormData.businessName || !combinedFormData.timeAvailablePerWeek}
                    className="flex-1 py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black rounded-xl hover:from-brand-500 hover:to-brand-600 transition-all disabled:opacity-50 flex justify-center items-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    Create Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg mb-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Choose Your Business Name</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{combinedNameIdeas.length} names generated</p>
                </div>
                <button
                  onClick={() => {
                    setCombinedNameIdeas([]);
                    setUseCustomName(false);
                  }}
                  className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Start Over
                </button>
              </div>
              <div className="p-4 bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-900/20 dark:to-blue-900/20 rounded-xl border-2 border-brand-800/30 dark:border-brand-900/50">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={useCustomName}
                    onChange={(e) => setUseCustomName(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600"
                  />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Use my own business name instead</span>
                </label>
                {useCustomName && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={combinedFormData.businessName}
                      onChange={(e) => setCombinedFormData({...combinedFormData, businessName: e.target.value})}
                      placeholder="Enter your business name"
                      className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
                    />
                    <button
                      onClick={() => handleCreateProfileFromCombined()}
                      disabled={!combinedFormData.businessName || !combinedFormData.timeAvailablePerWeek}
                      className="w-full mt-3 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black rounded-xl hover:from-brand-500 hover:to-brand-600 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
                    >
                      Create Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {combinedNameIdeas.map((idea, i) => (
                <div
                  key={i}
                  className="group text-left p-6 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl hover:border-brand-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white">{idea.name}</h4>
                  </div>
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {(idea.domains || (idea.domain ? [idea.domain] : [])).map((domain, idx) => (
                        <div key={idx} className="text-xs font-mono text-brand-600 dark:text-brand-400 bg-brand-900/10 dark:bg-brand-900/20 px-2 py-1 rounded border border-brand-800/30 dark:border-brand-900/50">
                          {domain}
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">{idea.meaning}</p>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button
                      onClick={() => handleCreateProfileFromCombined(idea)}
                      className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black rounded-xl hover:from-brand-500 hover:to-brand-600 transition-all shadow-lg hover:shadow-xl"
                    >
                      Create Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {combinedNameIdeas.length >= 9 && (
              <div className="flex justify-center mb-8">
                <button
                  onClick={() => handleGenerateCombinedNames(true)}
                  disabled={combinedNameLoading}
                  className="px-8 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black rounded-xl hover:from-brand-500 hover:to-brand-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
                >
                  {combinedNameLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>✨ Generate More</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

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
                    <MultiSelectField
                      label="Top Skills"
                      options={SKILL_OPTIONS}
                      selectedValues={selectedSkills}
                      onChange={setSelectedSkills}
                      placeholder="Select skills..."
                    />
                    <MultiSelectField
                      label="Interests / Passions"
                      options={INTEREST_OPTIONS}
                      selectedValues={selectedInterests}
                      onChange={setSelectedInterests}
                      placeholder="Select interests..."
                    />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Industry (Optional)</label>
                <select
                  value={nameProfile.industry || ''}
                  onChange={(e) => setNameProfile({...nameProfile, industry: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
                            />
                        </div>
                <button 
              onClick={handleGenerateNames}
              disabled={nameLoading}
              className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black rounded-xl hover:from-brand-500 hover:to-brand-600 transition-all disabled:opacity-50 flex justify-center items-center gap-3 shadow-lg hover:shadow-xl"
            >
              {nameLoading ? (
                <> <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div> Generating Names...</>
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
                className="group text-left p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-brand-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                        >
                            <div className="flex justify-between items-start mb-2">
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">{idea.name}</h4>
                            </div>
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {(idea.domains || (idea.domain ? [idea.domain] : [])).map((domain, idx) => (
                      <div key={idx} className="text-xs font-mono text-brand-600 dark:text-brand-400 bg-brand-900/10 dark:bg-brand-900/20 px-2 py-1 rounded border border-brand-800/30 dark:border-brand-900/50">
                        {domain}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{idea.meaning}</p>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{idea.industryFit}</span>
                  </div>
                  <button
                    onClick={() => handleSaveBusinessProfile(idea)}
                    className="w-full py-2 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-lg text-xs font-bold hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors border border-brand-800/30 dark:border-brand-900/50"
                  >
                    💾 Save as Business Profile
                  </button>
                </div>
              </div>
                    ))}
          </div>
                </div>
            )}
        </div>
    );

  const renderProfileSelector = () => (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
        <span className="text-xl">📁</span>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">Active Business Profile</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Select a profile to auto-fill business details across tools</p>
        </div>
        </div>
        {selectedProfile && (
          <button
            onClick={() => setCurrentView('profile-detail')}
            className="px-3 py-1 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-black rounded-lg hover:from-brand-700 hover:to-brand-800 transition-all"
          >
            View Details →
          </button>
        )}
      </div>
      <select
        value={selectedProfileId || ''}
        onChange={(e) => {
          const profile = businessProfiles.find(p => p.id === e.target.value);
          if (profile) {
            handleLoadProfile(profile);
          } else {
            setSelectedProfileId(null);
          }
        }}
        className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
      >
        <option value="">Select a business profile...</option>
        {businessProfiles.map(profile => (
          <option key={profile.id} value={profile.id}>{profile.businessName}</option>
        ))}
      </select>
      {businessProfiles.length === 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">No saved profiles yet. Generate a business name and save it as a profile to get started.</p>
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
      const result = await generateRoadmap(selectedProfile, roadmapAssessment);
      setRoadmapResult(result);
    } catch (e: any) {
      console.error('Roadmap generation error:', e);
      const errorMessage = e?.message || 'Unknown error';
      if (errorMessage.includes('API_KEY') || errorMessage.includes('API key') || errorMessage.includes('GEMINI_API_KEY')) {
        alert('API Key Error: Please set your GEMINI_API_KEY in the .env.local file. See README.md for instructions.');
      } else {
        alert(`Failed to generate roadmap: ${errorMessage}. Please try again.`);
      }
    } finally {
      setRoadmapLoading(false);
    }
  };

  const handleSaveRoadmap = () => {
    if (!selectedProfile || !roadmapResult) {
      alert('Please generate a roadmap first.');
      return;
    }
    saveRoadmapToProfile(selectedProfile.id, roadmapAssessment, roadmapResult);
    const updatedProfiles = getBusinessProfiles();
    setBusinessProfiles(updatedProfiles);
    alert('Roadmap saved to business profile!');
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

        {renderProfileSelector()}

        {!roadmapResult ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Assessment</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">What is your primary goal for the next 7 days?</label>
                <select
                  value={roadmapAssessment.primaryGoal}
                  onChange={(e) => setRoadmapAssessment({...roadmapAssessment, primaryGoal: e.target.value as any})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all disabled:opacity-50 flex justify-center items-center gap-3 shadow-lg hover:shadow-xl"
              >
                {roadmapLoading ? (
                  <> <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Generating Roadmap...</>
                ) : (
                  <>Generate 7-Day Roadmap ⚡</>
                )}
              </button>
                                </div>
                            </div>
        ) : roadmapResult ? (
          <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Your 7-Day Roadmap: {roadmapResult.goal}</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">{roadmapResult.overview}</p>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveRoadmap}
                  className="px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all shadow-lg"
                >
                  💾 Save Roadmap
                </button>
                <button
                  onClick={() => {
                    setRoadmapResult(null);
                    setRoadmapAssessment({
                      primaryGoal: 'First dollar',
                      hoursPerDay: '1–2',
                      comfortableTalkingToCustomers: 'Yes',
                      comfortableSellingDirectly: 'Yes',
                      whatWouldStopYou: 'Fear'
                    });
                  }}
                  className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300"
                >
                  ← Generate New Roadmap
                </button>
              </div>
            </div>

            {/* Recommended Resources */}
            {roadmapResult.recommendedResources && roadmapResult.recommendedResources.length > 0 && (
              <div className="bg-gradient-to-br from-brand-900/10 via-brand-800/10 to-teal-900/10 dark:from-brand-900/20 dark:to-brand-800/20 rounded-2xl p-8 border-2 border-brand-800/30 dark:border-brand-900/50 shadow-md">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">🎯 Recommended Resources</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Resources aligned with your business goals:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roadmapResult.recommendedResources.map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.link}
                      target="_blank"
                      rel="noreferrer"
                      className="p-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-brand-200 dark:border-brand-800 hover:border-brand-400 dark:hover:border-brand-600 transition-all hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-black text-slate-900 dark:text-white">{resource.title}</h4>
                        <span className="text-xs font-bold text-brand-600 dark:text-brand-400 px-2 py-1 bg-brand-50 dark:bg-brand-900/30 rounded">
                          {resource.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{resource.description}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 italic">{resource.reason}</p>
                    </a>
                  ))}
                </div>
                                </div>
        )}

            {/* Daily Roadmap */}
            <div className="space-y-6">
              {roadmapResult.days && roadmapResult.days.map((day) => (
                <div key={day.day} className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                      {day.day}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{day.title}</h3>
                  </div>
                  <div className="space-y-4">
                    {day.tasks.map((task, taskIdx) => (
                      <div key={taskIdx} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-black text-slate-900 dark:text-white">{task.task}</h4>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                            {task.timeEstimate}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{task.description}</p>
                        {task.resources && task.resources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Resources:</p>
                            <div className="flex flex-wrap gap-2">
                              {task.resources.map((resource, resIdx) => (
                                <a
                                  key={resIdx}
                                  href={resource.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 underline"
                                >
                                  {resource.title} →
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
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
      const result = await generatePitch(selectedProfile, pitchAssessment);
      setPitchResult(result);
    } catch (e: any) {
      console.error('Pitch generation error:', e);
      const errorMessage = e?.message || 'Unknown error';
      if (errorMessage.includes('API_KEY') || errorMessage.includes('API key') || errorMessage.includes('GEMINI_API_KEY')) {
        alert('API Key Error: Please set your GEMINI_API_KEY in the .env.local file. See README.md for instructions.');
      } else {
        alert(`Failed to generate pitch: ${errorMessage}. Please try again.`);
      }
    } finally {
      setPitchLoading(false);
    }
  };

  const handleSavePitch = () => {
    if (!selectedProfile || !pitchResult) {
      alert('Please generate a pitch first.');
      return;
    }
    savePitchToProfile(selectedProfile.id, pitchAssessment, pitchResult);
    const updatedProfiles = getBusinessProfiles();
    setBusinessProfiles(updatedProfiles);
    alert('Pitch saved to business profile!');
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

        {renderProfileSelector()}

        {!pitchResult ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Assessment</h2>
            <div className="space-y-6">
                                    <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Who are you pitching to?</label>
                <select
                  value={pitchAssessment.pitchingTo}
                  onChange={(e) => setPitchAssessment({...pitchAssessment, pitchingTo: e.target.value as any})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
        ) : pitchResult ? (
          <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Your {pitchAssessment.pitchLength} Pitch</h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">Pitching to: <span className="font-bold">{pitchAssessment.pitchingTo}</span></p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSavePitch}
                    className="px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all shadow-lg"
                  >
                    💾 Save Pitch
                  </button>
                  <button
                    onClick={() => setPitchResult(null)}
                    className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300"
                  >
                    ← Generate New
                  </button>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-brand-900/10 via-brand-800/10 to-teal-900/10 dark:from-brand-900/20 dark:to-brand-800/20 rounded-2xl p-6 border-2 border-brand-800/30 dark:border-brand-900/50 mb-6">
                <p className="text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-line">
                  {pitchResult.pitch}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">Key Points</h3>
                  <ul className="space-y-2">
                    {pitchResult.keyPoints?.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-brand-600 dark:text-brand-400 font-black mt-1">•</span>
                        <span className="text-slate-700 dark:text-slate-300">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">Tips</h3>
                  <ul className="space-y-2">
                    {pitchResult.tips?.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-brand-600 dark:text-brand-400 font-black mt-1">💡</span>
                        <span className="text-slate-700 dark:text-slate-300">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-200 dark:border-brand-800">
                <h4 className="font-black text-slate-900 dark:text-white mb-2">Call to Action</h4>
                <p className="text-slate-700 dark:text-slate-300 font-medium">{pitchResult.callToAction}</p>
              </div>

              {pitchResult.recommendedResources && pitchResult.recommendedResources.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Recommended Resources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pitchResult.recommendedResources.map((resource, idx) => (
                      <a
                        key={idx}
                        href={resource.link}
                        target="_blank"
                        rel="noreferrer"
                        className="p-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-brand-200 dark:border-brand-800 hover:border-brand-400 dark:hover:border-brand-600 transition-all hover:shadow-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-black text-slate-900 dark:text-white">{resource.title}</h4>
                          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 px-2 py-1 bg-brand-50 dark:bg-brand-900/30 rounded">
                            {resource.category}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{resource.description}</p>
                      </a>
                    ))}
                  </div>
          </div>
        )}
            </div>
          </div>
        ) : null}
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
      const result = await generateRevenueStrategy(selectedProfile, revenueAssessment);
      setStrategyResult(result);
    } catch (e: any) {
      console.error('Revenue strategy generation error:', e);
      const errorMessage = e?.message || 'Unknown error';
      if (errorMessage.includes('API_KEY') || errorMessage.includes('API key') || errorMessage.includes('GEMINI_API_KEY')) {
        alert('API Key Error: Please set your GEMINI_API_KEY in the .env.local file. See README.md for instructions.');
      } else {
        alert(`Failed to generate revenue strategy: ${errorMessage}. Please try again.`);
      }
    } finally {
      setStrategyLoading(false);
    }
  };

  const handleSaveRevenueStrategy = () => {
    if (!selectedProfile || !strategyResult) {
      alert('Please generate a revenue strategy first.');
      return;
    }
    saveRevenueStrategyToProfile(selectedProfile.id, revenueAssessment, strategyResult);
    const updatedProfiles = getBusinessProfiles();
    setBusinessProfiles(updatedProfiles);
    alert('Revenue strategy saved to business profile!');
  };

  const handleSearchAngelInvestors = async () => {
    if (!selectedProfile) {
      alert('Please create or select a business profile first.');
      return;
    }
    setInvestorLoading(true);
    try {
      const investors = await searchAngelInvestors(selectedProfile);
      setAngelInvestors(investors);
    } catch (e: any) {
      console.error('Angel investor search error:', e);
      const errorMessage = e?.message || 'Unknown error';
      if (errorMessage.includes('API_KEY') || errorMessage.includes('API key') || errorMessage.includes('GEMINI_API_KEY')) {
        alert('API Key Error: Please set your GEMINI_API_KEY in the .env.local file. See README.md for instructions.');
      } else {
        alert(`Failed to search investors: ${errorMessage}. Please try again.`);
      }
    } finally {
      setInvestorLoading(false);
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

        {renderProfileSelector()}

        {!strategyResult ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Assessment</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">How soon do you need income?</label>
                <select
                  value={revenueAssessment.incomeTimeline}
                  onChange={(e) => setRevenueAssessment({...revenueAssessment, incomeTimeline: e.target.value as any})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all disabled:opacity-50 flex justify-center items-center gap-3 shadow-lg hover:shadow-xl"
              >
                {strategyLoading ? (
                  <> <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Generating Strategy...</>
                ) : (
                  <>Generate Revenue Strategy ⚡</>
                )}
                                                </button>
                                            </div>
                                    </div>
        ) : strategyResult ? (
          <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Your Revenue Strategy</h2>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{strategyResult.overview}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveRevenueStrategy}
                    className="px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all shadow-lg"
                  >
                    💾 Save Strategy
                  </button>
                  <button
                    onClick={() => setStrategyResult(null)}
                    className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300"
                  >
                    ← Generate New
                  </button>
                </div>
              </div>
            </div>

            {/* Primary Strategies */}
            {strategyResult.primaryStrategies && strategyResult.primaryStrategies.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Primary Revenue Strategies</h3>
                {strategyResult.primaryStrategies.map((strategy, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-xl font-black text-slate-900 dark:text-white">{strategy.strategy}</h4>
                      <div className="flex gap-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                          {strategy.timeToRevenue}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                          {strategy.effortLevel}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{strategy.description}</p>
                    <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-200 dark:border-brand-800 mb-4">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Potential Revenue: <span className="text-brand-600 dark:text-brand-400">{strategy.potentialRevenue}</span>
                      </p>
                    </div>
                    {strategy.resources && strategy.resources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Resources:</p>
                        <div className="flex flex-wrap gap-2">
                          {strategy.resources.map((resource, resIdx) => (
                            <a
                              key={resIdx}
                              href={resource.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 underline"
                            >
                              {resource.title} →
                            </a>
                          ))}
                        </div>
                                </div>
                            )}
                  </div>
                ))}
              </div>
            )}

            {/* Recommended Resources */}
            {strategyResult.recommendedResources && strategyResult.recommendedResources.length > 0 && (
              <div className="bg-gradient-to-br from-brand-900/10 via-brand-800/10 to-teal-900/10 dark:from-brand-900/20 dark:to-brand-800/20 rounded-2xl p-8 border-2 border-brand-800/30 dark:border-brand-900/50 shadow-md">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">🎯 Recommended Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {strategyResult.recommendedResources.map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.link}
                      target="_blank"
                      rel="noreferrer"
                      className="p-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-brand-200 dark:border-brand-800 hover:border-brand-400 dark:hover:border-brand-600 transition-all hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-black text-slate-900 dark:text-white">{resource.title}</h4>
                        <span className="text-xs font-bold text-brand-600 dark:text-brand-400 px-2 py-1 bg-brand-50 dark:bg-brand-900/30 rounded">
                          {resource.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{resource.description}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 italic">{resource.reason}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {strategyResult.nextSteps && strategyResult.nextSteps.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Next Steps</h3>
                <ul className="space-y-2">
                  {strategyResult.nextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-brand-600 dark:text-brand-400 font-black mt-1">{idx + 1}.</span>
                      <span className="text-slate-700 dark:text-slate-300">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}
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
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
                required
              />
                                        </div>
                                        
            <div className="grid grid-cols-2 gap-4">
                                    <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Business Type *</label>
                <select
                  value={profileFormData.businessType}
                  onChange={(e) => setProfileFormData({...profileFormData, businessType: e.target.value as BusinessProfile['businessType']})}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
                  required
                />
                                        </div>
                            </div>
                            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Income Urgency *</label>
                <select
                  value={profileFormData.incomeUrgency}
                  onChange={(e) => setProfileFormData({...profileFormData, incomeUrgency: e.target.value as BusinessProfile['incomeUrgency']})}
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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
                  <label key={asset} className="flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-brand-400 transition-colors">
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
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
              />
                            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Problem Being Solved (Optional)</label>
                <textarea
                  value={profileFormData.problemBeingSolved}
                  onChange={(e) => setProfileFormData({...profileFormData, problemBeingSolved: e.target.value})}
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
                rows={3}
              />
                        </div>
                                        
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Pricing Model (Optional)</label>
                <input
                  type="text"
                  value={profileFormData.pricingModel}
                  onChange={(e) => setProfileFormData({...profileFormData, pricingModel: e.target.value})}
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
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

  const renderProfileDetail = () => {
    if (!selectedProfile) {
      return (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <p className="text-slate-600 dark:text-slate-400">Please select a business profile.</p>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <button
          onClick={() => setCurrentView('overview')}
          className="mb-6 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        >
          ← Back to Overview
        </button>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">{selectedProfile.businessName}</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">{selectedProfile.businessType} • {selectedProfile.stage}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Saved Roadmaps */}
            {selectedProfile.savedRoadmaps && selectedProfile.savedRoadmaps.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">📅 Saved Roadmaps ({selectedProfile.savedRoadmaps.length})</h2>
                <div className="space-y-4">
                  {selectedProfile.savedRoadmaps.map((roadmap) => (
                    <div key={roadmap.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-black text-slate-900 dark:text-white">{roadmap.result?.goal || 'Roadmap'}</h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(roadmap.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                        {roadmap.result?.overview || 'No overview available'}
                      </p>
                      <button
                        onClick={() => {
                          setRoadmapResult(roadmap.result);
                          setRoadmapAssessment(roadmap.assessment);
                          setCurrentView('roadmap');
                        }}
                        className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300"
                      >
                        View Full Roadmap →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Pitches */}
            {selectedProfile.savedPitches && selectedProfile.savedPitches.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">🎤 Saved Pitches ({selectedProfile.savedPitches.length})</h2>
                <div className="space-y-4">
                  {selectedProfile.savedPitches.map((pitch) => (
                    <div key={pitch.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-black text-slate-900 dark:text-white">
                          {pitch.assessment?.pitchingTo || 'Pitch'} • {pitch.assessment?.pitchLength || ''}
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(pitch.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                        {pitch.result?.pitch || 'No pitch available'}
                      </p>
                      <button
                        onClick={() => {
                          setPitchResult(pitch.result);
                          setPitchAssessment(pitch.assessment);
                          setCurrentView('pitch-builder');
                        }}
                        className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300"
                      >
                        View Full Pitch →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Revenue Strategies */}
            {selectedProfile.savedRevenueStrategies && selectedProfile.savedRevenueStrategies.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">💰 Saved Revenue Strategies ({selectedProfile.savedRevenueStrategies.length})</h2>
                <div className="space-y-4">
                  {selectedProfile.savedRevenueStrategies.map((strategy) => (
                    <div key={strategy.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-black text-slate-900 dark:text-white">Revenue Strategy</h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(strategy.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                        {strategy.result?.overview || 'No overview available'}
                      </p>
                      <button
                        onClick={() => {
                          setStrategyResult(strategy.result);
                          setRevenueAssessment(strategy.assessment);
                          setCurrentView('revenue-strategy');
                        }}
                        className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300"
                      >
                        View Full Strategy →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Logos */}
            {selectedProfile.savedLogos && selectedProfile.savedLogos.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">🖼️ Saved Logos ({selectedProfile.savedLogos.length})</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedProfile.savedLogos.map((logo) => (
                    <div key={logo.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <img src={logo.logoUrl} alt={logo.style} className="w-full h-32 object-contain mb-2" />
                      <p className="text-xs text-slate-500 dark:text-slate-400">{logo.style}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notes */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">📝 Notes</h2>
                <button
                  onClick={() => {
                    setEditingNote(null);
                    setShowNoteModal(true);
                  }}
                  className="px-3 py-1 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-black rounded-lg hover:from-brand-700 hover:to-brand-800 transition-all"
                >
                  + New
                </button>
              </div>
              <div className="space-y-3">
                {notes.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No notes yet. Add your first note!</p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-black text-slate-900 dark:text-white text-sm">{note.title}</h3>
                        <button
                          onClick={() => {
                            setEditingNote(note);
                            setShowNoteModal(true);
                          }}
                          className="text-xs text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{note.content}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md">
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">Profile Info</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-bold">Type:</span> {selectedProfile.businessType}</p>
                <p><span className="font-bold">Stage:</span> {selectedProfile.stage}</p>
                <p><span className="font-bold">Team:</span> {selectedProfile.soloOrTeam}</p>
                <p><span className="font-bold">Urgency:</span> {selectedProfile.incomeUrgency}</p>
                {selectedProfile.targetCustomer && (
                  <p><span className="font-bold">Target:</span> {selectedProfile.targetCustomer}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAngelInvestors = () => {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <button
          onClick={() => setCurrentView('overview')}
          className="mb-6 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        >
          ← Back to Overview
        </button>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">👼 Angel Investors</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Find investors that match your business</p>

        {renderProfileSelector()}

        {!angelInvestors.length ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
            <button
              onClick={handleSearchAngelInvestors}
              disabled={investorLoading || !selectedProfile}
              className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all disabled:opacity-50 flex justify-center items-center gap-3 shadow-lg"
            >
              {investorLoading ? (
                <> <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Searching Investors...</>
              ) : (
                <>🔍 Search Angel Investors ⚡</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-slate-600 dark:text-slate-400">Found {angelInvestors.length} investors</p>
              <button
                onClick={handleSearchAngelInvestors}
                disabled={investorLoading}
                className="px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all disabled:opacity-50"
              >
                🔄 Search Again
              </button>
            </div>
            {angelInvestors.map((investor, idx) => {
              const investorId = `${investor.name}-${investor.firm || 'individual'}-${idx}`;
              const isFavorite = selectedProfile?.favoriteInvestors?.includes(investorId) || false;
              const investorNote = selectedProfile?.investorNotes?.find(n => n.investorId === investorId);
              
              return (
                <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">{investor.name}</h3>
                        <button
                          onClick={() => {
                            if (!selectedProfile) {
                              alert('Please select a business profile first.');
                              return;
                            }
                            toggleFavoriteInvestor(selectedProfile.id, investorId);
                            const updatedProfiles = getBusinessProfiles();
                            setBusinessProfiles(updatedProfiles);
                          }}
                          className={`text-2xl ${isFavorite ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-600'} hover:text-brand-600 dark:hover:text-brand-400 transition-colors`}
                        >
                          {isFavorite ? '❤️' : '🤍'}
                        </button>
                      </div>
                      {investor.firm && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">{investor.firm}</p>
                      )}
                    </div>
                    {investor.website && (
                      <a
                        href={investor.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300"
                      >
                        Website →
                      </a>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">{investor.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Focus</p>
                      <div className="flex flex-wrap gap-1">
                        {investor.focus.map((f, i) => (
                          <span key={i} className="text-xs bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 px-2 py-1 rounded">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Stage</p>
                      <div className="flex flex-wrap gap-1">
                        {investor.stage.map((s, i) => (
                          <span key={i} className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    {investor.location && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Location</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{investor.location}</p>
                      </div>
                    )}
                    {investor.checkSize && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Check Size</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{investor.checkSize}</p>
                      </div>
                    )}
                  </div>
                  {investor.contact && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      <span className="font-bold">Contact:</span> {investor.contact}
                    </p>
                  )}
                  
                  {/* Investor Notes Section */}
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-black text-slate-900 dark:text-white">Analysis & Notes</h4>
                      <button
                        onClick={() => {
                          if (!selectedProfile) {
                            alert('Please select a business profile first.');
                            return;
                          }
                          if (investorNote) {
                            setEditingInvestorNote({
                              investorId,
                              pros: investorNote.pros,
                              cons: investorNote.cons,
                              compatibility: investorNote.compatibility,
                              notes: investorNote.notes
                            });
                            setInvestorProInput('');
                            setInvestorConInput('');
                            setInvestorNotesText(investorNote.notes);
                            setInvestorCompatibility(investorNote.compatibility);
                          } else {
                            setEditingInvestorNote({
                              investorId,
                              pros: [],
                              cons: [],
                              compatibility: 50,
                              notes: ''
                            });
                            setInvestorProInput('');
                            setInvestorConInput('');
                            setInvestorNotesText('');
                            setInvestorCompatibility(50);
                          }
                          setShowInvestorNoteModal(true);
                        }}
                        className="px-3 py-1 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-black rounded-lg hover:from-brand-700 hover:to-brand-800 transition-all"
                      >
                        {investorNote ? '✏️ Edit Notes' : '📝 Add Notes'}
                      </button>
                    </div>
                    
                    {investorNote ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Compatibility Score</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  investorNote.compatibility >= 70 ? 'bg-green-500' :
                                  investorNote.compatibility >= 40 ? 'bg-yellow-500' : 'bg-brand-500'
                                }`}
                                style={{ width: `${investorNote.compatibility}%` }}
                              />
                            </div>
                            <span className="text-sm font-black text-slate-900 dark:text-white">{investorNote.compatibility}%</span>
                          </div>
                        </div>
                        
                        {investorNote.pros.length > 0 && (
                          <div>
                            <p className="text-sm font-bold text-green-700 dark:text-green-400 mb-2">✅ Pros</p>
                            <ul className="space-y-1">
                              {investorNote.pros.map((pro, i) => (
                                <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                  <span>•</span>
                                  <span>{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {investorNote.cons.length > 0 && (
                          <div>
                            <p className="text-sm font-bold text-brand-700 dark:text-brand-400 mb-2">❌ Cons</p>
                            <ul className="space-y-1">
                              {investorNote.cons.map((con, i) => (
                                <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                  <span>•</span>
                                  <span>{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {investorNote.notes && (
                          <div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">📝 Notes</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">{investorNote.notes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400 italic">No notes yet. Click "Add Notes" to analyze this investor.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (editingInvestorNote && showInvestorNoteModal) {
      setInvestorProsList(editingInvestorNote.pros || []);
      setInvestorConsList(editingInvestorNote.cons || []);
      setInvestorNotesText(editingInvestorNote.notes || '');
      setInvestorCompatibility(editingInvestorNote.compatibility || 50);
      setInvestorProInput('');
      setInvestorConInput('');
    }
  }, [editingInvestorNote, showInvestorNoteModal]);

  const renderInvestorNoteModal = () => {
    if (!editingInvestorNote || !selectedProfile) return null;
    
    const handleAddPro = () => {
      if (investorProInput.trim()) {
        setInvestorProsList([...investorProsList, investorProInput.trim()]);
        setInvestorProInput('');
      }
    };
    
    const handleAddCon = () => {
      if (investorConInput.trim()) {
        setInvestorConsList([...investorConsList, investorConInput.trim()]);
        setInvestorConInput('');
      }
    };
    
    const handleSave = () => {
      saveInvestorNote(selectedProfile.id, editingInvestorNote.investorId, investorProsList, investorConsList, investorCompatibility, investorNotesText);
      const updatedProfiles = getBusinessProfiles();
      setBusinessProfiles(updatedProfiles);
      setShowInvestorNoteModal(false);
      setEditingInvestorNote(null);
      setInvestorProsList([]);
      setInvestorConsList([]);
      setInvestorNotesText('');
      setInvestorCompatibility(50);
    };
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-3xl border border-slate-200 dark:border-slate-700 shadow-xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Investor Analysis & Notes</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Compatibility Score: {investorCompatibility}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={investorCompatibility}
                onChange={(e) => setInvestorCompatibility(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">✅ Pros</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={investorProInput}
                  onChange={(e) => setInvestorProInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPro()}
                  placeholder="Add a pro..."
                  className="flex-1 p-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                />
                <button
                  onClick={handleAddPro}
                  className="px-4 py-2 bg-green-600 text-white font-black rounded-xl hover:bg-green-700"
                >
                  Add
                </button>
              </div>
              <ul className="space-y-1">
                {investorProsList.map((pro, i) => (
                  <li key={i} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{pro}</span>
                    <button
                      onClick={() => setInvestorProsList(investorProsList.filter((_, idx) => idx !== i))}
                      className="text-brand-600 dark:text-brand-400 hover:text-brand-800"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">❌ Cons</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={investorConInput}
                  onChange={(e) => setInvestorConInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCon()}
                  placeholder="Add a con..."
                  className="flex-1 p-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                />
                <button
                  onClick={handleAddCon}
                  className="px-4 py-2 bg-brand-600 text-white font-black rounded-xl hover:bg-brand-700"
                >
                  Add
                </button>
              </div>
              <ul className="space-y-1">
                {investorConsList.map((con, i) => (
                  <li key={i} className="flex items-center justify-between p-2 bg-brand-50 dark:bg-brand-900/20 rounded-lg">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{con}</span>
                    <button
                      onClick={() => setInvestorConsList(investorConsList.filter((_, idx) => idx !== i))}
                      className="text-brand-600 dark:text-brand-400 hover:text-brand-800"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">📝 Additional Notes</label>
              <textarea
                value={investorNotesText}
                onChange={(e) => setInvestorNotesText(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
                placeholder="Add your notes about this investor..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all"
              >
                Save Notes
              </button>
              <button
                onClick={() => {
                  setShowInvestorNoteModal(false);
                  setEditingInvestorNote(null);
                }}
                className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-black rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEntityFormationInfo = () => {
    // Accurate LLC fees from PDF data (2026)
    const llcFees: Record<string, { filing: number; annual: number; annualFrequency: string; notes?: string }> = {
      'Alabama': { filing: 200, annual: 50, annualFrequency: 'every year' },
      'Alaska': { filing: 250, annual: 100, annualFrequency: 'every 2 years' },
      'Arizona': { filing: 50, annual: 0, annualFrequency: 'no fee and no information report' },
      'Arkansas': { filing: 45, annual: 150, annualFrequency: 'every year' },
      'California': { filing: 70, annual: 800, annualFrequency: 'every year', notes: '+ $20 every 2 years' },
      'Colorado': { filing: 50, annual: 25, annualFrequency: 'every year' },
      'Connecticut': { filing: 120, annual: 80, annualFrequency: 'every year' },
      'Delaware': { filing: 110, annual: 300, annualFrequency: 'every year' },
      'Florida': { filing: 125, annual: 138.75, annualFrequency: 'every year' },
      'Georgia': { filing: 100, annual: 50, annualFrequency: 'every year' },
      'Hawaii': { filing: 50, annual: 15, annualFrequency: 'every year' },
      'Idaho': { filing: 100, annual: 0, annualFrequency: 'information report required every year' },
      'Illinois': { filing: 150, annual: 75, annualFrequency: 'every year' },
      'Indiana': { filing: 95, annual: 31, annualFrequency: 'every 2 years' },
      'Iowa': { filing: 50, annual: 30, annualFrequency: 'every 2 years' },
      'Kansas': { filing: 160, annual: 50, annualFrequency: 'every year' },
      'Kentucky': { filing: 40, annual: 15, annualFrequency: 'every year' },
      'Louisiana': { filing: 100, annual: 35, annualFrequency: 'every year' },
      'Maine': { filing: 175, annual: 85, annualFrequency: 'every year' },
      'Maryland': { filing: 100, annual: 300, annualFrequency: 'every year' },
      'Massachusetts': { filing: 500, annual: 500, annualFrequency: 'every year' },
      'Michigan': { filing: 50, annual: 25, annualFrequency: 'every year' },
      'Minnesota': { filing: 155, annual: 0, annualFrequency: 'information report required every year' },
      'Mississippi': { filing: 50, annual: 0, annualFrequency: 'information report required every year' },
      'Missouri': { filing: 50, annual: 0, annualFrequency: 'no fee and no information report' },
      'Montana': { filing: 35, annual: 20, annualFrequency: 'every year' },
      'Nebraska': { filing: 100, annual: 13, annualFrequency: 'every 2 years' },
      'Nevada': { filing: 425, annual: 350, annualFrequency: 'every year' },
      'New Hampshire': { filing: 100, annual: 100, annualFrequency: 'every year' },
      'New Jersey': { filing: 125, annual: 75, annualFrequency: 'every year' },
      'New Mexico': { filing: 50, annual: 0, annualFrequency: 'no fee and no information report' },
      'New York': { filing: 200, annual: 9, annualFrequency: 'every 2 years' },
      'North Carolina': { filing: 125, annual: 200, annualFrequency: 'every year' },
      'North Dakota': { filing: 135, annual: 50, annualFrequency: 'every year' },
      'Ohio': { filing: 99, annual: 0, annualFrequency: 'no fee and no information report' },
      'Oklahoma': { filing: 100, annual: 25, annualFrequency: 'every year' },
      'Oregon': { filing: 100, annual: 100, annualFrequency: 'every year' },
      'Pennsylvania': { filing: 125, annual: 7, annualFrequency: 'every year' },
      'Rhode Island': { filing: 150, annual: 50, annualFrequency: 'every year' },
      'South Carolina': { filing: 110, annual: 0, annualFrequency: 'no fee and no information report (unless LLC is taxed as S-Corp)' },
      'South Dakota': { filing: 150, annual: 55, annualFrequency: 'every year' },
      'Tennessee': { filing: 300, annual: 300, annualFrequency: 'every year' },
      'Texas': { filing: 300, annual: 0, annualFrequency: 'Public Information Report required every year' },
      'Utah': { filing: 59, annual: 18, annualFrequency: 'every year' },
      'Vermont': { filing: 155, annual: 45, annualFrequency: 'every year' },
      'Virginia': { filing: 100, annual: 50, annualFrequency: 'every year' },
      'Washington': { filing: 200, annual: 60, annualFrequency: 'every year' },
      'West Virginia': { filing: 100, annual: 25, annualFrequency: 'every year' },
      'Wisconsin': { filing: 130, annual: 25, annualFrequency: 'every year' },
      'Wyoming': { filing: 100, annual: 60, annualFrequency: 'every year (minimum)' },
      'District of Columbia': { filing: 99, annual: 300, annualFrequency: 'every 2 years' }
    };

    const getStateInfo = (state: string, entityType: string) => {
      if (entityType === 'LLC' && llcFees[state]) {
        const fee = llcFees[state];
        return {
          filingFee: fee.filing,
          annualFee: fee.annual,
          annualFrequency: fee.annualFrequency,
          notes: fee.notes,
          isRequired: fee.annual > 0 || fee.annualFrequency.includes('required'),
          isOptional: fee.annual === 0 && !fee.annualFrequency.includes('required') && fee.annualFrequency.includes('report')
        };
      }
      
      // For other entity types, use approximate fees
      const defaultFees: Record<string, { filing: number; annual: number }> = {
        'Corporation': { filing: 100, annual: 50 },
        'S-Corp': { filing: 100, annual: 50 },
        'Non-Profit': { filing: 50, annual: 25 },
        'Partnership': { filing: 100, annual: 50 },
        'Sole Proprietorship': { filing: 0, annual: 0 }
      };
      
      const fees = defaultFees[entityType] || { filing: 100, annual: 50 };
      return {
        filingFee: fees.filing,
        annualFee: fees.annual,
        annualFrequency: 'every year',
        notes: undefined,
        isRequired: fees.annual > 0,
        isOptional: false
      };
    };

    const stateInfo = getStateInfo(selectedState, selectedEntityType);
    
    return (
      <div className="space-y-4 mt-4">
        <div className="p-4 bg-gradient-to-br from-brand-900/10 via-brand-800/10 to-teal-900/10 dark:from-brand-900/20 dark:to-brand-800/20 rounded-xl border-2 border-brand-800/30 dark:border-brand-900/50">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">💰 {selectedState} {selectedEntityType} Costs</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-700 dark:text-slate-300">Filing Fee (one-time):</span>
              <span className="font-black text-brand-600 dark:text-brand-400">${stateInfo.filingFee}</span>
            </div>
            {stateInfo.annualFee > 0 ? (
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Annual/Biennial Fee <span className="text-xs text-green-600 dark:text-green-400 font-black">(Required)</span>:
                </span>
                <span className="font-black text-brand-600 dark:text-brand-400">${stateInfo.annualFee}</span>
              </div>
            ) : stateInfo.isOptional ? (
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Information Report <span className="text-xs text-yellow-600 dark:text-yellow-400 font-black">(Optional)</span>:
                </span>
                <span className="font-black text-green-600 dark:text-green-400">$0</span>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">Annual Fee:</span>
                <span className="font-black text-green-600 dark:text-green-400">$0</span>
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Frequency: {stateInfo.annualFrequency}
              {stateInfo.notes && <span className="block mt-1 text-brand-600 dark:text-brand-400 font-bold">{stateInfo.notes}</span>}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-2">
              *Figures reflect state filing and ongoing compliance fees. Local permits, registered agent service, and industry-specific licenses may add additional costs.
            </p>
          </div>
        </div>
        
        <a
          href={`https://www.google.com/search?q=${selectedState.replace(' ', '+')}+business+registration+official+website`}
          target="_blank"
          rel="noreferrer"
          className="block w-full py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all text-center"
        >
          Visit {selectedState} Business Portal →
        </a>
      </div>
    );
  };

  const renderEntityFormation = () => {
    const states = [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
      'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
      'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
      'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina',
      'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
      'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    ];
    
    const entityTypes = {
      'LLC': {
        name: 'Limited Liability Company (LLC)',
        benefits: [
          'Limited personal liability protection',
          'Flexible management structure',
          'Pass-through taxation (no double taxation)',
          'Less paperwork than corporations',
          'Flexible profit distribution'
        ],
        cons: [
          'Annual fees and reporting requirements',
          'Self-employment taxes on all income',
          'May need to dissolve if member leaves (depending on state)',
          'Not ideal for raising venture capital'
        ]
      },
      'Corporation': {
        name: 'C-Corporation',
        benefits: [
          'Strong liability protection',
          'Can issue stock and raise capital easily',
          'Perpetual existence',
          'Can offer employee stock options',
          'Potential tax advantages for retained earnings'
        ],
        cons: [
          'Double taxation (corporate and personal)',
          'More complex and expensive to set up',
          'Stricter record-keeping requirements',
          'Annual meetings and formalities required'
        ]
      },
      'S-Corp': {
        name: 'S-Corporation',
        benefits: [
          'Pass-through taxation (avoid double taxation)',
          'Limited liability protection',
          'Can save on self-employment taxes',
          'Can issue stock (with restrictions)'
        ],
        cons: [
          'Strict eligibility requirements (max 100 shareholders)',
          'Only one class of stock allowed',
          'Must be US citizens/residents',
          'More complex than LLC'
        ]
      },
      'Non-Profit': {
        name: 'Non-Profit Corporation',
        benefits: [
          'Tax-exempt status (501(c)(3))',
          'Eligible for grants and donations',
          'Limited liability protection',
          'Public goodwill and credibility'
        ],
        cons: [
          'Complex application process (IRS 501(c)(3))',
          'Cannot distribute profits to owners',
          'Strict compliance requirements',
          'Public disclosure of financial information'
        ]
      },
      'Partnership': {
        name: 'Partnership',
        benefits: [
          'Easy to form',
          'Pass-through taxation',
          'Shared management and resources',
          'Low startup costs'
        ],
        cons: [
          'Unlimited personal liability (general partnership)',
          'Partners are personally responsible for debts',
          'Potential for disputes',
          'Dissolves if partner leaves'
        ]
      },
      'Sole Proprietorship': {
        name: 'Sole Proprietorship',
        benefits: [
          'Simplest and cheapest to form',
          'Complete control',
          'Simple tax filing',
          'No formal registration required'
        ],
        cons: [
          'Unlimited personal liability',
          'Harder to raise capital',
          'No separation between business and personal assets',
          'Business ends if owner dies'
        ]
      }
    };
    
    const getStateInfo = (state: string, entityType: string) => {
      // State-specific filing fees (approximate, may vary)
      const stateFees: Record<string, Record<string, { filing: number; annual: number }>> = {
        'California': {
          'LLC': { filing: 70, annual: 800 },
          'Corporation': { filing: 100, annual: 800 },
          'S-Corp': { filing: 100, annual: 800 },
          'Non-Profit': { filing: 30, annual: 25 },
          'Partnership': { filing: 70, annual: 800 },
          'Sole Proprietorship': { filing: 0, annual: 0 }
        },
        'Delaware': {
          'LLC': { filing: 90, annual: 300 },
          'Corporation': { filing: 89, annual: 300 },
          'S-Corp': { filing: 89, annual: 300 },
          'Non-Profit': { filing: 89, annual: 25 },
          'Partnership': { filing: 90, annual: 300 },
          'Sole Proprietorship': { filing: 0, annual: 0 }
        },
        'New York': {
          'LLC': { filing: 200, annual: 9 },
          'Corporation': { filing: 125, annual: 9 },
          'S-Corp': { filing: 125, annual: 9 },
          'Non-Profit': { filing: 75, annual: 9 },
          'Partnership': { filing: 200, annual: 9 },
          'Sole Proprietorship': { filing: 0, annual: 0 }
        },
        'Texas': {
          'LLC': { filing: 300, annual: 0 },
          'Corporation': { filing: 300, annual: 0 },
          'S-Corp': { filing: 300, annual: 0 },
          'Non-Profit': { filing: 25, annual: 0 },
          'Partnership': { filing: 750, annual: 0 },
          'Sole Proprietorship': { filing: 0, annual: 0 }
        },
        'Florida': {
          'LLC': { filing: 125, annual: 138.75 },
          'Corporation': { filing: 70, annual: 150 },
          'S-Corp': { filing: 70, annual: 150 },
          'Non-Profit': { filing: 70, annual: 61.25 },
          'Partnership': { filing: 965, annual: 138.75 },
          'Sole Proprietorship': { filing: 0, annual: 0 }
        },
        'Nevada': {
          'LLC': { filing: 75, annual: 350 },
          'Corporation': { filing: 75, annual: 500 },
          'S-Corp': { filing: 75, annual: 500 },
          'Non-Profit': { filing: 50, annual: 50 },
          'Partnership': { filing: 75, annual: 350 },
          'Sole Proprietorship': { filing: 0, annual: 0 }
        },
        'Wyoming': {
          'LLC': { filing: 60, annual: 60 },
          'Corporation': { filing: 60, annual: 60 },
          'S-Corp': { filing: 60, annual: 60 },
          'Non-Profit': { filing: 50, annual: 25 },
          'Partnership': { filing: 60, annual: 60 },
          'Sole Proprietorship': { filing: 0, annual: 0 }
        }
      };
      
      // Default fees if state not in list (approximate averages)
      const defaultFees: Record<string, { filing: number; annual: number }> = {
        'LLC': { filing: 100, annual: 50 },
        'Corporation': { filing: 100, annual: 50 },
        'S-Corp': { filing: 100, annual: 50 },
        'Non-Profit': { filing: 50, annual: 25 },
        'Partnership': { filing: 100, annual: 50 },
        'Sole Proprietorship': { filing: 0, annual: 0 }
      };
      
      const fees = stateFees[state]?.[entityType] || defaultFees[entityType] || { filing: 100, annual: 50 };
      
      const statePros: Record<string, string[]> = {
        'Delaware': ['Business-friendly laws', 'Court of Chancery expertise', 'Privacy protection', 'No state income tax'],
        'California': ['Large market', 'Access to talent', 'Strong economy', 'Innovation hub'],
        'Wyoming': ['Low fees', 'Privacy', 'No state income tax', 'Business-friendly'],
        'Nevada': ['No state income tax', 'Privacy', 'Low initial fees', 'Business-friendly'],
        'Texas': ['No state income tax', 'Large economy', 'Business-friendly', 'Growing tech hub'],
        'Florida': ['No state income tax', 'Growing economy', 'Business-friendly', 'Warm climate'],
        'New York': ['Major market', 'Access to capital', 'Diverse economy', 'Infrastructure']
      };
      
      const stateCons: Record<string, string[]> = {
        'Delaware': ['Higher fees', 'Annual franchise tax ($300+)', 'Must register in home state too'],
        'California': ['High annual fees ($800)', 'Complex regulations', 'Higher taxes', 'Cost of living'],
        'Wyoming': ['Smaller market', 'Less business infrastructure', 'Limited talent pool'],
        'Nevada': ['Annual business license fee', 'Registered agent required', 'Higher annual fees'],
        'Texas': ['Higher initial filing fee ($300)', 'Franchise tax for larger businesses'],
        'Florida': ['Annual report fees', 'Registered agent required', 'State sales tax'],
        'New York': ['High filing fees', 'Annual report fees', 'Complex regulations', 'High cost of doing business']
      };
      
      return {
        filingFee: fees.filing,
        annualFee: fees.annual,
        pros: statePros[state] || ['Standard state regulations', 'Access to local market'],
        cons: stateCons[state] || ['Standard state requirements'],
        website: `https://www.google.com/search?q=${state.replace(' ', '+')}+business+registration+official+website`
      };
    };
    
    const stateInfo = getStateInfo(selectedState, selectedEntityType);
    const entityInfo = entityTypes[selectedEntityType];
    
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <button
          onClick={() => setCurrentView('overview')}
          className="mb-6 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        >
          ← Back to Overview
        </button>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">🏢 Business Entity Formation</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Compare business types and state requirements</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Business Type</label>
            <select
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value as any)}
              className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="LLC">LLC</option>
              <option value="Corporation">C-Corporation</option>
              <option value="S-Corp">S-Corporation</option>
              <option value="Non-Profit">Non-Profit</option>
              <option value="Partnership">Partnership</option>
              <option value="Sole Proprietorship">Sole Proprietorship</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
            >
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{entityInfo.name}</h2>
            <div className="mb-6">
              <h3 className="text-lg font-black text-green-700 dark:text-green-400 mb-3">✅ Benefits</h3>
              <ul className="space-y-2">
                {entityInfo.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span>•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-black text-brand-700 dark:text-brand-400 mb-3">❌ Cons</h3>
              <ul className="space-y-2">
                {entityInfo.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span>•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{selectedState} Information</h2>
            <div className="mb-6 p-4 bg-gradient-to-br from-brand-900/10 via-brand-800/10 to-teal-900/10 dark:from-brand-900/20 dark:to-brand-800/20 rounded-xl border-2 border-brand-800/30 dark:border-brand-900/50">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">💰 Costs</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-bold">Filing Fee:</span> ${stateInfo.filingFee}</p>
                <p><span className="font-bold">Annual Fee:</span> ~${stateInfo.annualFee}/year</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">*Costs vary by state and entity type</p>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-black text-green-700 dark:text-green-400 mb-3">✅ State Pros</h3>
              <ul className="space-y-2">
                {stateInfo.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span>•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-black text-brand-700 dark:text-brand-400 mb-3">❌ State Cons</h3>
              <ul className="space-y-2">
                {stateInfo.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span>•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
            <a
              href={`https://www.google.com/search?q=${selectedState}+business+registration+official+website`}
              target="_blank"
              rel="noreferrer"
              className="block w-full py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all text-center"
            >
              Visit {selectedState} Business Portal →
            </a>
          </div>
        </div>
      </div>
    );
  };

  const renderEinGuide = () => {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => setCurrentView('overview')}
          className="mb-6 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        >
          ← Back to Overview
        </button>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">🔢 Employer Identification Number (EIN)</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Everything you need to know about EINs</p>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">What is an EIN?</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              An Employer Identification Number (EIN), also known as a Federal Tax Identification Number, is a unique nine-digit number assigned by the Internal Revenue Service (IRS) to identify your business for tax purposes. Think of it as a Social Security Number for your business.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Even if you don't have employees, you'll likely need an EIN if you operate as an LLC, corporation, or partnership, or if you want to open a business bank account.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Who Needs an EIN?</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-brand-600 dark:text-brand-400 font-black mt-1">•</span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">LLCs, Corporations, and Partnerships</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Required for all multi-member LLCs and most corporations</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-600 dark:text-brand-400 font-black mt-1">•</span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Sole Proprietors with Employees</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Required if you have any employees</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-600 dark:text-brand-400 font-black mt-1">•</span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Business Bank Accounts</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Most banks require an EIN to open a business account</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-600 dark:text-brand-400 font-black mt-1">•</span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Tax-Exempt Organizations</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Required for non-profits applying for 501(c)(3) status</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-600 dark:text-brand-400 font-black mt-1">•</span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Trusts, Estates, and Other Entities</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Required for various tax-reporting purposes</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Key Benefits of Having an EIN</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <p className="font-bold text-slate-900 dark:text-white mb-2">✅ Protects Your SSN</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Use your EIN instead of your Social Security Number on business documents</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <p className="font-bold text-slate-900 dark:text-white mb-2">✅ Required for Business Banking</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Most banks require an EIN to open a business checking or savings account</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <p className="font-bold text-slate-900 dark:text-white mb-2">✅ Builds Business Credit</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Helps establish business credit separate from personal credit</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <p className="font-bold text-slate-900 dark:text-white mb-2">✅ Professional Credibility</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Makes your business appear more established and legitimate</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">How to Apply for an EIN</h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="font-bold text-slate-900 dark:text-white mb-2">Step 1: Gather Information</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">You'll need your Social Security Number, business name, address, and the type of entity you're forming.</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="font-bold text-slate-900 dark:text-white mb-2">Step 2: Apply Online</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">The fastest way is to apply online through the IRS website. The process takes about 15 minutes and you'll receive your EIN immediately.</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="font-bold text-slate-900 dark:text-white mb-2">Step 3: Save Your EIN</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Once you receive your EIN, save it securely. You'll need it for tax filings, banking, and other business operations.</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-900/10 via-brand-800/10 to-teal-900/10 dark:from-brand-900/20 dark:to-brand-800/20 rounded-2xl p-8 border-2 border-brand-800/30 dark:border-brand-900/50 shadow-md">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Ready to Apply?</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Apply for your EIN directly through the official IRS website. The application is free and you'll receive your EIN immediately upon completion.
            </p>
            <a
              href="https://www.irs.gov/businesses/small-businesses-self-employed/get-an-employer-identification-number"
              target="_blank"
              rel="noreferrer"
              className="inline-block px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all shadow-lg hover:shadow-xl"
            >
              Apply for EIN on IRS Website →
            </a>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
              * The EIN application is completely free. Never pay for EIN services from third-party websites.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderFirst10Customers = () => {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => setCurrentView('resources')}
          className="mb-6 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        >
          ← Back to Resources
        </button>
        
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Your First 10 Customers</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">A Practical Playbook for New Founders</p>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md mb-6">
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Getting your first customers is the hardest part of starting a business. This playbook gives you a concrete, week-by-week system to find people who will actually pay you money—no marketing budget required.
          </p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">What you'll learn:</h3>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-6">
            <li>How to identify and reach your ideal first customers</li>
            <li>The exact scripts and templates for outreach</li>
            <li>How to turn conversations into paying customers</li>
            <li>Common mistakes to avoid</li>
          </ul>
        </div>

        {/* Phase 1 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md mb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Phase 1: Know Who You're Looking For</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Time investment: 2-3 hours</p>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Before you reach out to anyone, you need crystal clarity on who your ideal first customer is. Your first 10 customers should NOT be random people—they should be carefully selected.
          </p>
          
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Define Your Ideal First Customer</h3>
          <p className="text-slate-700 dark:text-slate-300 mb-4">Your ideal first customer has three characteristics:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-6">
            <li>They have the problem you solve — and feel it acutely</li>
            <li>They're accessible to you — you can actually reach them</li>
            <li>They can make buying decisions quickly — no 6-month sales cycles</li>
          </ul>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded mb-6">
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
              <strong>Tip:</strong> For your first customers, prioritize accessibility over 'perfect fit.' A friend-of-a-friend who has a related problem is better than a stranger who's your exact target market.
            </p>
          </div>
          
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Exercise: Customer Profile</h3>
          <p className="text-slate-700 dark:text-slate-300 mb-4">Answer these questions about your ideal first customer:</p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
            <li>What is their job title or role?</li>
            <li>What problem keeps them up at night that you can solve?</li>
            <li>Where do they spend time online (LinkedIn groups, Reddit, Slack communities)?</li>
            <li>Who in your network might know people like this?</li>
            <li>What would make them say 'yes' to a conversation with you?</li>
          </ol>
        </div>

        {/* Phase 2 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md mb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Phase 2: Build Your Prospect List</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Time investment: 3-4 hours</p>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            You need to build a list of 50-100 potential customers. Yes, that many. Expect roughly 10-20% to respond, and 10-20% of those to convert. Math matters.
          </p>
          
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Start With Your Warm Network</h3>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Your first customers will almost certainly come from people you already know, or people one degree removed. This isn't cheating—it's smart.
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <h4 className="font-black text-slate-900 dark:text-white mb-2">Tier 1: Direct connections (aim for 15-20 names)</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                <li>Former colleagues who might have this problem</li>
                <li>Friends in relevant industries</li>
                <li>LinkedIn connections you've actually talked to</li>
                <li>People from previous jobs, schools, or communities</li>
              </ul>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <h4 className="font-black text-slate-900 dark:text-white mb-2">Tier 2: One degree removed (aim for 30-40 names)</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                <li>Ask Tier 1 contacts: "Who do you know who deals with [problem]?"</li>
                <li>LinkedIn's "People Also Viewed" on your ideal customer profiles</li>
                <li>Mutual connections with people who fit your profile</li>
              </ul>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <h4 className="font-black text-slate-900 dark:text-white mb-2">Tier 3: Cold but targeted (aim for 30-40 names)</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                <li>Active members of relevant online communities</li>
                <li>People who've posted about your problem on LinkedIn/Twitter</li>
                <li>Speakers at relevant meetups or podcasts</li>
                <li>Authors of blog posts about your problem space</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded">
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
              <strong>Tip:</strong> Use a simple spreadsheet with columns: Name, Company, How I Know Them, Contact Method, Status, Notes. Don't overcomplicate it.
            </p>
          </div>
        </div>

        {/* Phase 3 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md mb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Phase 3: Reach Out (The Right Way)</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Time investment: 1-2 hours per day for 1-2 weeks</p>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Most founders fail here because they pitch too early. Your first message should NOT be about selling—it should be about learning and helping.
          </p>
          
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">The Outreach Formula</h3>
          <p className="text-slate-700 dark:text-slate-300 mb-4">Every outreach message should have these four elements:</p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-6">
            <li>Personal connection — why you're reaching out to THEM specifically</li>
            <li>Credibility signal — why you understand their world</li>
            <li>Value-first ask — offer to help or learn, not to sell</li>
            <li>Easy next step — low commitment ask (15-min call, not a demo)</li>
          </ol>
          
          <div className="space-y-4 mb-6">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <h4 className="font-black text-slate-900 dark:text-white mb-2">Template: Warm Outreach (Tier 1)</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                "Hey [Name], hope you're doing well! I've been working on something in the [problem space] and immediately thought of you given your work at [Company]. I'm trying to learn from people who deal with [specific problem] day-to-day. Would you have 15 minutes this week for a quick call? No pitch, I promise—just trying to make sure I'm building something actually useful. Happy to share what I'm learning from others in return."
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <h4 className="font-black text-slate-900 dark:text-white mb-2">Template: Referral Outreach (Tier 2)</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                "Hi [Name], [Mutual Connection] suggested I reach out to you. I'm working on [brief description] and she mentioned you'd have great perspective on [specific aspect]. I'd love to learn from your experience with [problem]. Would you be open to a 15-minute call this week? I'm happy to share insights from others I've spoken with."
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <h4 className="font-black text-slate-900 dark:text-white mb-2">Template: Cold Outreach (Tier 3)</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                "Hi [Name], I came across your [post/comment/talk] about [topic] and it really resonated. I'm building [brief description] because I experienced [problem] myself when I was [relevant background]. I'm talking to people who deal with this to make sure I'm solving a real problem. If you have 15 minutes, I'd love to hear your perspective—and I'm happy to share a summary of what I'm learning across these conversations."
              </p>
            </div>
          </div>
          
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Outreach Cadence</h3>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-4">
            <li>Send 5-10 messages per day (more = diminishing returns and burnout)</li>
            <li>Follow up after 3-4 days if no response (one follow-up only)</li>
            <li>Best times: Tuesday-Thursday, 9-11am or 2-4pm in their timezone</li>
            <li>Track everything in your spreadsheet</li>
          </ul>
        </div>

        {/* Phase 4 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md mb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Phase 4: Have Great Conversations</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Time investment: 30-45 minutes per conversation</p>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            The goal of these conversations is to understand their problem deeply AND plant the seed for becoming a customer. Here's how to do both.
          </p>
          
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Conversation Structure</h3>
          
          <div className="space-y-4 mb-6">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <h4 className="font-black text-slate-900 dark:text-white mb-2">Opening (2 minutes)</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                <li>Thank them for their time</li>
                <li>Briefly explain why you're doing this (building something, learning)</li>
                <li>Set expectation: "I have a few questions, but I want this to be useful for you too"</li>
              </ul>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <h4 className="font-black text-slate-900 dark:text-white mb-2">Problem Discovery (15-20 minutes)</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                <li>"Tell me about how you currently handle [problem area]"</li>
                <li>"What's the most frustrating part of that?"</li>
                <li>"How much time/money does that cost you?"</li>
                <li>"What have you tried to solve this? What worked/didn't?"</li>
                <li>"If you could wave a magic wand, what would the ideal solution look like?"</li>
              </ul>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <h4 className="font-black text-slate-900 dark:text-white mb-2">Soft Pitch (5 minutes)</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                <li>"Based on what you've told me, here's what I'm building..." (brief!)</li>
                <li>"Does that sound like it would help with what you described?"</li>
                <li>Listen to their reaction carefully—objections are gold</li>
              </ul>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <h4 className="font-black text-slate-900 dark:text-white mb-2">Close (5 minutes)</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                <li>"Would you be interested in being one of my first users/customers?"</li>
                <li>"I'm offering [special deal] to early customers who help me refine this"</li>
                <li>If not ready: "Can I follow up when I have [specific milestone]?"</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded">
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
              <strong>Tip:</strong> Take notes during the call or immediately after. Their exact words are valuable—you'll use them in your marketing later.
            </p>
          </div>
        </div>

        {/* Phase 5 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md mb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Phase 5: Convert Conversations to Customers</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Time investment: Ongoing</p>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Not everyone will buy on the first call, and that's okay. Here's how to move interested people toward becoming paying customers.
          </p>
          
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">The Follow-Up System</h3>
          <div className="space-y-4 mb-6">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <h4 className="font-black text-slate-900 dark:text-white mb-2">Within 24 hours of the call:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                <li>Send a thank-you email summarizing key points</li>
                <li>Include any resources you promised</li>
                <li>Restate your offer with a clear next step</li>
              </ul>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <h4 className="font-black text-slate-900 dark:text-white mb-2">If they expressed interest but didn't commit:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                <li>Follow up in 3-5 days with something valuable (article, insight)</li>
                <li>Ask if they have any questions</li>
                <li>Create gentle urgency ("I have 3 spots left for founding members")</li>
              </ul>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <h4 className="font-black text-slate-900 dark:text-white mb-2">If they said no or not now:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                <li>Thank them and ask for referrals</li>
                <li>Add to a "nurture" list for future updates</li>
                <li>Ask what would need to change for them to reconsider</li>
              </ul>
            </div>
          </div>
          
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Pricing Your First 10</h3>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Your first customers should get a deal—but they should still pay. Free users don't give real feedback and don't value what they get.
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-6">
            <li>Offer 50% off "founding member" pricing</li>
            <li>Lock in the low price for a year in exchange for feedback commitment</li>
            <li>Consider lifetime deals for your first 3-5 customers</li>
            <li>Make it easy to pay: Stripe link, Gumroad, PayPal</li>
          </ul>
          
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Handling Objections</h3>
          <div className="space-y-3 mb-6">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <p className="font-black text-slate-900 dark:text-white mb-1">"I need to think about it"</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">→ "Totally understand. What specifically would you want to think through? Maybe I can help."</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <p className="font-black text-slate-900 dark:text-white mb-1">"It's not in my budget"</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">→ "What would make this a no-brainer investment for you?" or offer a payment plan</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <p className="font-black text-slate-900 dark:text-white mb-1">"I'm too busy right now"</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">→ "When would be a better time? I can check back in then." (Set a specific date)</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <p className="font-black text-slate-900 dark:text-white mb-1">"I need to check with my boss/partner"</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">→ "Great, can we schedule a call with them too? I'm happy to explain directly."</p>
            </div>
          </div>
        </div>

        {/* Common Mistakes */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md mb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Common Mistakes to Avoid</h2>
          <div className="space-y-4">
            <div className="bg-brand-50 dark:bg-brand-900/20 border-l-4 border-brand-400 p-4 rounded">
              <p className="font-black text-brand-900 dark:text-brand-300 mb-1">1. Pitching before listening</p>
              <p className="text-sm text-brand-800 dark:text-brand-400">The biggest mistake is talking about your solution before you deeply understand their problem. Spend 80% of the conversation asking questions.</p>
            </div>
            <div className="bg-brand-50 dark:bg-brand-900/20 border-l-4 border-brand-400 p-4 rounded">
              <p className="font-black text-brand-900 dark:text-brand-300 mb-1">2. Being vague about the ask</p>
              <p className="text-sm text-brand-800 dark:text-brand-400">"Let me know if you're interested" doesn't work. Be specific: "Can I sign you up right now? It's $X and I can send you the payment link while we're on the call."</p>
            </div>
            <div className="bg-brand-50 dark:bg-brand-900/20 border-l-4 border-brand-400 p-4 rounded">
              <p className="font-black text-brand-900 dark:text-brand-300 mb-1">3. Giving up after one "no"</p>
              <p className="text-sm text-brand-800 dark:text-brand-400">A "no" often means "not right now" or "I don't understand the value yet." Follow up, provide more value, and try again.</p>
            </div>
            <div className="bg-brand-50 dark:bg-brand-900/20 border-l-4 border-red-400 p-4 rounded">
              <p className="font-black text-red-900 dark:text-red-300 mb-1">4. Targeting people who can't buy</p>
              <p className="text-sm text-red-800 dark:text-red-400">Make sure you're talking to decision-makers, not just people who find your idea interesting. Ask early: "Are you the person who would make this purchase decision?"</p>
            </div>
            <div className="bg-brand-50 dark:bg-brand-900/20 border-l-4 border-red-400 p-4 rounded">
              <p className="font-black text-red-900 dark:text-red-300 mb-1">5. Not tracking your pipeline</p>
              <p className="text-sm text-red-800 dark:text-red-400">If you're not tracking outreach, conversations, and follow-ups, opportunities will slip through the cracks. A simple spreadsheet is fine—just use it consistently.</p>
            </div>
          </div>
        </div>

        {/* 7-Day Action Plan */}
        <div className="bg-gradient-to-br from-brand-900/10 via-brand-800/10 to-teal-900/10 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-2xl p-8 border-2 border-brand-800/30 dark:border-brand-900/50 shadow-md">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Your 7-Day Action Plan</h2>
          <div className="space-y-3 text-slate-700 dark:text-slate-300">
            <p><strong>Day 1-2:</strong> Define your ideal customer and build your prospect list (50+ names)</p>
            <p><strong>Day 3-4:</strong> Write your outreach templates and send first 20 messages</p>
            <p><strong>Day 5-6:</strong> Send 10 more messages per day, schedule conversations</p>
            <p><strong>Day 7:</strong> Conduct conversations, refine approach, follow up with interested prospects</p>
          </div>
          <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-red-800/30">
            <p className="text-sm text-slate-700 dark:text-slate-300 italic">
              Remember: Your first 10 customers are the hardest. After that, you'll have testimonials, referrals, and confidence. Just focus on getting through these first 10.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderResources = () => {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <button
          onClick={() => setCurrentView('overview')}
          className="mb-6 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        >
          ← Back to Overview
        </button>
        
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Resources</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Essential guides and playbooks for building your business</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First 10 Customers */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden hover:shadow-xl transition-all">
            <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-6">
              <h3 className="text-2xl font-black text-white mb-1">📚 First 10 Customers</h3>
              <p className="text-sm text-blue-100">A practical playbook for finding your first paying customers</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Get a concrete, week-by-week system to find people who will actually pay you money—no marketing budget required.
              </p>
              <button
                onClick={() => setCurrentView('first-10-customers')}
                className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all"
              >
                Read Article →
              </button>
            </div>
          </div>

          {/* Skills to Business Mapper */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden hover:shadow-xl transition-all">
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-6">
              <h3 className="text-2xl font-black text-white mb-1">🎯 Skills to Business Mapper</h3>
              <p className="text-sm text-blue-200">Transform your skills into profitable business ideas</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Discover how to turn your existing skills and experience into viable business opportunities.
              </p>
              <button
                onClick={() => setCurrentView('skills-to-business')}
                className="w-full py-3 bg-gradient-to-r from-blue-800 to-blue-900 text-white font-black rounded-xl hover:from-blue-900 hover:to-blue-950 transition-all"
              >
                Read Article →
              </button>
            </div>
          </div>

          {/* Business Idea Validator */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden hover:shadow-xl transition-all">
            <div className="bg-gradient-to-r from-green-800 to-green-900 p-6">
              <h3 className="text-2xl font-black text-white mb-1">✅ Business Idea Validator</h3>
              <p className="text-sm text-green-200">Test your idea before you build it</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Validate your business idea in days, not months—before you invest serious time or money.
              </p>
              <button
                onClick={() => setCurrentView('business-idea-validator')}
                className="w-full py-3 bg-gradient-to-r from-green-800 to-green-900 text-white font-black rounded-xl hover:from-green-900 hover:to-green-950 transition-all"
              >
                Read Article →
              </button>
            </div>
          </div>

          {/* Pricing Your First Offer */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden hover:shadow-xl transition-all">
            <div className="bg-gradient-to-r from-purple-800 to-purple-900 p-6">
              <h3 className="text-2xl font-black text-white mb-1">💰 Pricing Your First Offer</h3>
              <p className="text-sm text-purple-200">How to set prices that get you paid</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                A practical framework for setting prices that work—especially when you're just starting out.
              </p>
              <button
                onClick={() => setCurrentView('pricing-first-offer')}
                className="w-full py-3 bg-gradient-to-r from-purple-800 to-purple-900 text-white font-black rounded-xl hover:from-purple-900 hover:to-purple-950 transition-all"
              >
                Read Article →
              </button>
            </div>
          </div>

          {/* Business Structure Guide */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden hover:shadow-xl transition-all">
            <div className="bg-gradient-to-r from-orange-800 to-orange-900 p-6">
              <h3 className="text-2xl font-black text-white mb-1">🏢 Business Structure Guide</h3>
              <p className="text-sm text-orange-200">LLC vs. Sole Prop vs. S-Corp: Which is right for you?</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Break down your business structure options in plain English, so you can make a smart choice without a law degree.
              </p>
              <button
                onClick={() => setCurrentView('business-structure-guide')}
                className="w-full py-3 bg-gradient-to-r from-orange-800 to-orange-900 text-white font-black rounded-xl hover:from-orange-900 hover:to-orange-950 transition-all"
              >
                Read Article →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSkillsToBusiness = () => {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => setCurrentView('resources')}
          className="mb-6 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        >
          ← Back to Resources
        </button>
        
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Skills to Business Mapper</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Transform your skills into profitable business ideas</p>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md mb-6">
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            This guide helps you identify which of your existing skills can be turned into viable business opportunities. 
            Not every skill is a business, but many can be monetized with the right approach.
          </p>
          <p className="text-slate-700 dark:text-slate-300">
            Use the business name generator and profile creator in Founder Mode to explore specific business ideas based on your skills and interests.
          </p>
        </div>
      </div>
    );
  };

  const renderBusinessIdeaValidator = () => {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => setCurrentView('resources')}
          className="mb-6 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        >
          ← Back to Resources
        </button>
        
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Business Idea Validator</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Test Your Idea Before You Build It</p>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md mb-6">
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Most business ideas fail not because the founder couldn't execute, but because they built something nobody wanted. 
            This playbook gives you a systematic way to validate your idea in days, not months—before you invest serious time or money.
          </p>
          
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">The Validation Mindset</h3>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Your goal is NOT to prove your idea is good. Your goal is to find out if it's good—which means actively looking for reasons it might fail.
          </p>
          
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">The Three Questions</h3>
          <p className="text-slate-700 dark:text-slate-300 mb-4">Every business idea must answer YES to all three of these questions:</p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-6">
            <li><strong>Is this a real problem?</strong> — Do people actually experience this pain?</li>
            <li><strong>Will people pay to solve it?</strong> — Is the pain bad enough to open their wallet?</li>
            <li><strong>Can I reach these people?</strong> — Do I have access to potential customers?</li>
          </ol>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded mb-6">
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
              Many ideas pass question 1 but fail question 2. "That's annoying" is not the same as "I'd pay $50/month to fix that." Stay skeptical until money changes hands.
            </p>
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Step 1: Validate the Problem</h3>
          <p className="text-slate-700 dark:text-slate-300 mb-4">Time: 2-4 hours</p>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Before you talk to anyone, do some research to see if this problem shows up in the wild.
          </p>
          
          <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">Online Research Checklist</h4>
          <p className="text-slate-700 dark:text-slate-300 mb-3">Search for evidence that people are actively trying to solve this problem:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-6">
            <li><strong>Reddit</strong> — Search for your problem keywords. Are there threads with 50+ comments? Frustrated people?</li>
            <li><strong>Quora</strong> — Are people asking questions about this problem?</li>
            <li><strong>Google</strong> — Search "how to [solve problem]" — what comes up? Are there ads? (Ads = people paying for solutions)</li>
            <li><strong>Twitter/X</strong> — Search for complaints related to your problem</li>
          </ul>

          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Step 2: Talk to Real People</h3>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Have 10 conversations with people who might have this problem. Don't pitch—just listen.
          </p>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Ask: "Tell me about how you currently handle [problem area]" and listen for pain points.
          </p>

          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Step 3: Test Willingness to Pay</h3>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            The ultimate validation is when someone actually pays you. Try to get pre-sales, deposits, or at least strong verbal commitments with specific details.
          </p>

          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Step 4: Estimate Market Size</h3>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Calculate: Total Addressable Market × Reach % × Price = Potential Revenue
          </p>
          <p className="text-slate-700 dark:text-slate-300 mb-6">
            For most laid-off individuals, you're aiming for side income ($1-3K/month) or full-time income ($5-15K/month). 
            Don't let "it's not a billion-dollar market" stop you from building a great business.
          </p>

          <div className="bg-gradient-to-br from-green-900/10 via-green-800/10 to-emerald-900/10 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-2xl p-8 border-2 border-green-800/30 dark:border-green-900/50 shadow-md">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">The Final Decision</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              After completing all steps, score your idea. If you score 10-12 points: Strong validation. Build it. 
              If you score 6-9 points: Promising but uncertain. Run more tests. If you score 0-5 points: Move on or pivot.
            </p>
            <p className="text-slate-700 dark:text-slate-300 italic">
              Remember: A 'no' on this idea isn't a failure—it's a success. You just saved months of building something nobody wants.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderPricingFirstOffer = () => {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => setCurrentView('resources')}
          className="mb-6 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        >
          ← Back to Resources
        </button>
        
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Pricing Your First Offer</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">How to Set Prices That Get You Paid</p>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md mb-6">
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Pricing is where most new founders freeze. Charge too little and you'll burn out. Charge too much and you won't get customers. 
            This guide gives you a practical framework for setting prices that work—especially when you're just starting out.
          </p>
          
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">The Pricing Mindset Shift</h3>
          <div className="space-y-4 mb-6">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <h4 className="font-black text-slate-900 dark:text-white mb-2">Truth 1: You are not your customer</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                What feels expensive to YOU is often cheap to your customer. A $2,000 consulting engagement might feel outrageous—until you realize it saves a company $50,000 in mistakes. Price based on their math, not yours.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <h4 className="font-black text-slate-900 dark:text-white mb-2">Truth 2: Underpricing hurts everyone</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Low prices signal low value. They attract price-sensitive customers who are often the hardest to work with. They make your business unsustainable. And they train the market to undervalue your type of work. Charge what you're worth.
              </p>
            </div>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded mb-6">
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
              <strong>The goal of pricing isn't to be cheap. It's to be worth it.</strong>
            </p>
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Four Ways to Set Your Price</h3>
          
          <div className="space-y-4 mb-6">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <h4 className="font-black text-slate-900 dark:text-white mb-2">Method 1: Cost-Plus (The Floor)</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                Calculate your minimum viable price based on costs:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                <li>How many hours will this take you?</li>
                <li>What's the minimum hourly rate you need? (Hint: Take your desired annual income ÷ 1,000)</li>
                <li>Add 20-30% buffer for scope creep and overhead</li>
                <li>This is your FLOOR—never go below this</li>
              </ol>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <h4 className="font-black text-slate-900 dark:text-white mb-2">Method 2: Market Rate (The Anchor)</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Research what others charge for similar services. Check competitor websites, search "[service] pricing", 
                look at freelance platforms, and ask peers in your industry.
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <h4 className="font-black text-slate-900 dark:text-white mb-2">Method 3: Value-Based (The Ceiling)</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Price based on the outcome you deliver, not the time you spend. What is the problem costing them? 
                What is the outcome worth? Price at 10-20% of the value you create.
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <h4 className="font-black text-slate-900 dark:text-white mb-2">Method 4: The "Double It" Test</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Simple but effective: Take your initial gut-feeling price and double it. Then see what happens. 
                If everyone says yes immediately → you're too cheap. If about 30% say yes → you're probably right.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Special Pricing for First Customers</h3>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Your first customers take a risk on you. It's fair to offer them a deal—but do it strategically.
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4 rounded mb-4">
            <p className="font-black text-green-900 dark:text-green-300 mb-2">DO:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-green-800 dark:text-green-400">
              <li>Offer "founding customer" or "beta" pricing (30-50% off)</li>
              <li>Make it time-limited ("This rate is for my first 5 clients only")</li>
              <li>Ask for something in return (testimonial, referrals, case study rights)</li>
              <li>Show them the "real" price so they know the value</li>
            </ul>
          </div>
          <div className="bg-brand-50 dark:bg-brand-900/20 border-l-4 border-red-400 p-4 rounded mb-6">
            <p className="font-black text-red-900 dark:text-red-300 mb-2">DON'T:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-800 dark:text-red-400">
              <li>Work for free (undermines your value and attracts bad clients)</li>
              <li>Discount without a clear reason (makes you seem desperate)</li>
              <li>Lock yourself into low prices forever (set end date)</li>
              <li>Apologize for your prices (confidence sells)</li>
            </ul>
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Handling Price Objections</h3>
          <div className="space-y-3 mb-6">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <p className="font-black text-slate-900 dark:text-white mb-1">"That's more than I expected"</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">→ "I understand. Can you share what you were expecting? I want to make sure we're comparing apples to apples."</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <p className="font-black text-slate-900 dark:text-white mb-1">"Can you do it cheaper?"</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">→ "I can adjust the scope to fit a different budget. What would work for you, and I'll tell you what I can deliver at that price."</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <p className="font-black text-slate-900 dark:text-white mb-1">"I need to think about it"</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">→ "Of course. What specifically would you want to think through? Maybe I can help address it now."</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/10 via-purple-800/10 to-pink-900/10 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-2xl p-8 border-2 border-purple-800/30 dark:border-purple-900/50 shadow-md">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Your Pricing Action Plan</h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>Calculate your floor price (Method 1)</li>
              <li>Research market rates (Method 2)</li>
              <li>Estimate the value you create (Method 3)</li>
              <li>Set your price somewhere between floor and value-based ceiling</li>
              <li>Double it. Seriously.</li>
              <li>Test with real prospects and adjust based on response rate</li>
            </ol>
          </div>
        </div>
      </div>
    );
  };

  const renderBusinessStructureGuide = () => {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => setCurrentView('resources')}
          className="mb-6 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        >
          ← Back to Resources
        </button>
        
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Business Structure Guide</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">LLC vs. Sole Prop vs. S-Corp: Which Is Right for You?</p>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md mb-6">
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded mb-6">
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
              <strong>Important:</strong> This guide provides general information, not legal or tax advice. Consult a CPA or attorney for your specific situation.
            </p>
          </div>
          
          <p className="text-slate-700 dark:text-slate-300 mb-6">
            Choosing a business structure is one of the first decisions new founders face—and one of the most confusing. 
            This guide breaks down your options in plain English, so you can make a smart choice without a law degree.
          </p>

          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Your Three Main Options</h3>
          
          <div className="space-y-6 mb-6">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6">
              <h4 className="text-lg font-black text-slate-900 dark:text-white mb-3">Option 1: Sole Proprietorship</h4>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                What it is: You and your business are legally the same entity. No formal registration required (beyond local business licenses).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-black text-green-700 dark:text-green-400 mb-2">✅ Pros:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                    <li>Simplest and cheapest to start (often $0-100)</li>
                    <li>No separate tax return</li>
                    <li>Complete control</li>
                    <li>Can start immediately</li>
                  </ul>
                </div>
                <div>
                  <p className="font-black text-brand-700 dark:text-brand-400 mb-2">❌ Cons:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                    <li>NO liability protection</li>
                    <li>Harder to raise money</li>
                    <li>Less credible to some clients</li>
                    <li>Self-employment tax on all profits (15.3%)</li>
                  </ul>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 italic">
                Best for: Very early stage, low-risk businesses, testing an idea before formalizing
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6">
              <h4 className="text-lg font-black text-slate-900 dark:text-white mb-3">Option 2: Limited Liability Company (LLC)</h4>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                What it is: A separate legal entity that protects your personal assets from business liabilities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-black text-green-700 dark:text-green-400 mb-2">✅ Pros:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                    <li>Personal asset protection</li>
                    <li>More credible and professional</li>
                    <li>Flexible taxation options</li>
                    <li>Relatively simple to set up</li>
                  </ul>
                </div>
                <div>
                  <p className="font-black text-brand-700 dark:text-brand-400 mb-2">❌ Cons:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                    <li>Costs $50-500 to form</li>
                    <li>Some states have annual fees</li>
                    <li>Still pay self-employment tax</li>
                    <li>Requires some ongoing formalities</li>
                  </ul>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 italic">
                Best for: Most small businesses, freelancers/consultants, anyone wanting liability protection
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6">
              <h4 className="text-lg font-black text-slate-900 dark:text-white mb-3">Option 3: S-Corporation (or LLC with S-Corp Election)</h4>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                What it is: A tax election that lets you split income between salary (taxed normally) and distributions (not subject to self-employment tax).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-black text-green-700 dark:text-green-400 mb-2">✅ Pros:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                    <li>Can significantly reduce self-employment taxes</li>
                    <li>All the liability protection of an LLC/corporation</li>
                    <li>Looks more established</li>
                  </ul>
                </div>
                <div>
                  <p className="font-black text-brand-700 dark:text-brand-400 mb-2">❌ Cons:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                    <li>Must pay yourself a "reasonable salary"</li>
                    <li>Requires payroll setup and quarterly filings</li>
                    <li>Higher accounting costs ($1,000-3,000/year)</li>
                    <li>More administrative burden</li>
                  </ul>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 italic">
                Best for: Businesses earning $60K+ in profit where tax savings outweigh admin costs
              </p>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded mb-6">
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
              <strong>Key insight:</strong> You can start as a sole proprietor or LLC and convert to S-corp taxation later when your income justifies it. Don't overcomplicate things on day one.
            </p>
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">The Decision Framework</h3>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 mb-6">
            <p className="font-black text-slate-900 dark:text-white mb-2">Q1: Are you just testing an idea with minimal risk?</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">Yes → Start as a Sole Proprietor. Formalize later if the idea works.</p>
            
            <p className="font-black text-slate-900 dark:text-white mb-2">Q2: Does your business have liability risk?</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">Yes → You need an LLC at minimum. Continue to Q3.</p>
            
            <p className="font-black text-slate-900 dark:text-white mb-2">Q3: Do you expect to earn more than $60,000 in profit this year?</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">Yes → Consider S-Corp election (talk to a CPA first)</p>
            
            <p className="font-black text-slate-900 dark:text-white mb-2">Q4: Are you raising money or bringing in partners?</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">Yes → You may need a C-Corp (talk to a lawyer)</p>
          </div>

          <div className="bg-gradient-to-br from-orange-900/10 via-orange-800/10 to-red-900/10 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-2xl p-8 border-2 border-orange-800/30 dark:border-orange-900/50 shadow-md">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">The 80% Answer</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              For most people reading this guide, the answer is: <strong>Form an LLC in your state.</strong> 
              It gives you liability protection, is relatively simple, and you can always elect S-corp treatment later if your income grows. Don't overthink it.
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              Remember: You can always change your structure later as your business grows. Don't let this decision slow you down from getting started.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderNoteModal = () => {
    const handleSaveNote = () => {
      if (!selectedProfile || !noteTitle.trim() || !noteContent.trim()) {
        alert('Please fill in both title and content.');
        return;
      }
      if (editingNote) {
        updateNoteInProfile(selectedProfile.id, editingNote.id, { title: noteTitle, content: noteContent });
      } else {
        saveNoteToProfile(selectedProfile.id, noteTitle, noteContent);
      }
      const updatedProfiles = getBusinessProfiles();
      setBusinessProfiles(updatedProfiles);
      if (selectedProfile) {
        const updated = updatedProfiles.find(p => p.id === selectedProfile.id);
        if (updated) {
          setNotes(updated.notes || []);
        }
      }
      setShowNoteModal(false);
      setEditingNote(null);
      setNoteTitle('');
      setNoteContent('');
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
            {editingNote ? 'Edit Note' : 'New Note'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Title</label>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
                placeholder="Note title"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Content</label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={6}
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 outline-none"
                placeholder="Note content"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveNote}
                className="flex-1 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all"
              >
                Save Note
              </button>
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setEditingNote(null);
                  setNoteTitle('');
                  setNoteContent('');
                }}
                className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-black rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
                </div>
            </div>
        );
    };

    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {currentView === 'overview' && renderOverview()}
      {currentView === 'name-generator' && renderNameGenerator()}
        {currentView === 'business-profile-creator' && renderBusinessProfileCreator()}
      {currentView === 'roadmap' && renderRoadmap()}
      {currentView === 'pitch-builder' && renderPitchBuilder()}
      {currentView === 'revenue-strategy' && renderRevenueStrategy()}
        {currentView === 'profile-detail' && renderProfileDetail()}
        {currentView === 'angel-investors' && renderAngelInvestors()}
      {currentView === 'entity-formation' && renderEntityFormation()}
      {currentView === 'ein-guide' && renderEinGuide()}
      {currentView === 'first-10-customers' && renderFirst10Customers()}
      {currentView === 'resources' && renderResources()}
      {currentView === 'skills-to-business' && renderSkillsToBusiness()}
      {currentView === 'business-idea-validator' && renderBusinessIdeaValidator()}
      {currentView === 'pricing-first-offer' && renderPricingFirstOffer()}
      {currentView === 'business-structure-guide' && renderBusinessStructureGuide()}
      {showProfileModal && renderBusinessProfileModal()}
      {showNoteModal && renderNoteModal()}
      {showInvestorNoteModal && renderInvestorNoteModal()}
        </div>
    );
};
