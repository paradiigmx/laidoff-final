import React, { useState } from 'react';
import { DreamShiftAssessment, AppView, DreamShiftCard, DreamShiftPath, StrengthArchetype, TransitionStyle } from '../types';
import { saveDreamShiftAssessment } from '../services/storageService';
import { generateDreamShiftResults } from '../services/geminiService';

interface DreamShiftAssessmentViewProps {
  onNavigate: (view: AppView) => void;
  onSave?: () => void;
}

export const DreamShiftAssessmentView: React.FC<DreamShiftAssessmentViewProps> = ({ onNavigate, onSave }) => {
  const [currentSection, setCurrentSection] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [assessmentAnswers, setAssessmentAnswers] = useState({
    // Section A - Identity & Fulfillment
    energizedWhileWorking: [] as string[],
    enjoyedPartsOfJobs: [] as string[],
    drainsAtWork: [] as string[],
    keepDoingWithoutNotice: [] as string[],
    workPreference: '',
    peopleVsSolo: '',
    creativeVsStructured: '',
    missionVsMoney: '',
    autonomyVsGuidance: '',
    
    // Section B - Strengths & Transferable Skills
    askedForHelpWith: [] as string[],
    explainEasily: [] as string[],
    tasksFeelEasy: [] as string[],
    skillsOutsideJobs: [] as string[],
    naturalRoles: [] as string[],
    
    // Section C - Values & Lifestyle
    stabilityVsFulfillment: 50,
    flexibilityVsPredictability: 50,
    teamVsIndependent: 50,
    leadershipVsContribution: 50,
    meaningVsIncome: 50,
    
    // Section D - Transition Reality
    riskTolerance: '',
    timeAvailablePerWeek: '',
    willingnessToRetrain: '',
    financialPressure: '',
    desireForAutonomy: '',
    urgencyLevel: '',
    
    // Section E - Constraints & Specificity (NEW)
    priorityMattersMost: '',
    realisticRiskTolerance: '',
    incomeTimeline: '',
    skillsReliedOn: [] as string[],
    dailyEnjoyedSkill: '',
    drainsFastest: '',
    tolerableEnvironment: '',
    willingToLearnTools: '',
    willingToBuildPortfolio: '',
    willingToNetwork: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dreamShiftResult, setDreamShiftResult] = useState<DreamShiftAssessment | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<{ [key: string]: boolean }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Generate DreamShift results using AI
      const result = await generateDreamShiftResults(assessmentAnswers);
      
      const assessment: DreamShiftAssessment = {
        id: '',
        answers: assessmentAnswers,
        card: result.card,
        paths: result.paths,
        createdAt: '',
        updatedAt: ''
      };

      const saved = saveDreamShiftAssessment(assessment);
      setDreamShiftResult(saved);
      if (onSave) onSave();
    } catch (error) {
      console.error('Error generating DreamShift results:', error);
      alert('There was an error generating your DreamShift results. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (dreamShiftResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* DreamShift Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl mb-8">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">✨ Your DreamShift Card</h1>
              <p className="text-slate-600 dark:text-slate-400">Share your career identity and direction</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-8 text-white mb-6">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black mb-2">{dreamShiftResult.card.primaryArchetype}</h2>
                <p className="text-purple-200 text-lg">with {dreamShiftResult.card.secondaryArchetype} traits</p>
              </div>
              
              {/* Plain English Summary */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                <p className="text-lg font-bold text-center">{dreamShiftResult.card.plainEnglishSummary || 'Your career identity and direction'}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-black text-lg mb-3">Fulfillment Drivers</h3>
                  <ul className="space-y-2">
                    {dreamShiftResult.card.fulfillmentDrivers.map((driver, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-200">•</span>
                        <span>{driver}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-black text-lg mb-3">Ideal Work Environment</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Prefers:</strong> {dreamShiftResult.card.idealWorkEnvironment.pace}, {dreamShiftResult.card.idealWorkEnvironment.autonomy}, {dreamShiftResult.card.idealWorkEnvironment.people}, {dreamShiftResult.card.idealWorkEnvironment.structure}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <h4 className="font-black text-sm mb-2">Traits</h4>
                  <ul className="space-y-1 text-sm">
                    {dreamShiftResult.card.traits?.map((trait, idx) => (
                      <li key={idx}>• {trait}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-black text-sm mb-2">Avoids</h4>
                  <ul className="space-y-1 text-sm">
                    {dreamShiftResult.card.avoids?.map((avoid, idx) => (
                      <li key={idx}>• {avoid}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-black text-sm mb-2">Thrives In</h4>
                  <ul className="space-y-1 text-sm">
                    {dreamShiftResult.card.thrivesIn?.map((thrive, idx) => (
                      <li key={idx}>• {thrive}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-black text-lg mb-3">Growth Direction</h3>
                <div className="flex flex-wrap gap-2">
                  {dreamShiftResult.card.growthDirection.map((direction, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      {direction}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-purple-200 mb-2">Transition Style</p>
                <p className="text-2xl font-black">{dreamShiftResult.card.transitionStyle}</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  const cardText = `✨ My DreamShift Card\n\n${dreamShiftResult.card.primaryArchetype} (with ${dreamShiftResult.card.secondaryArchetype} traits)\n\n${dreamShiftResult.card.plainEnglishSummary || ''}\n\nFulfillment Drivers:\n${dreamShiftResult.card.fulfillmentDrivers.map(d => `• ${d}`).join('\n')}\n\nTraits:\n${dreamShiftResult.card.traits?.map(t => `• ${t}`).join('\n') || ''}\n\nAvoids:\n${dreamShiftResult.card.avoids?.map(a => `• ${a}`).join('\n') || ''}\n\nThrives In:\n${dreamShiftResult.card.thrivesIn?.map(t => `• ${t}`).join('\n') || ''}\n\nGrowth Direction: ${dreamShiftResult.card.growthDirection.join(', ')}\n\nTransition Style: ${dreamShiftResult.card.transitionStyle}`;
                  navigator.clipboard.writeText(cardText);
                  alert('DreamShift Card copied to clipboard!');
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
              >
                📋 Copy Card
              </button>
              <button
                onClick={() => onNavigate(AppView.HUB)}
                className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                View in Hub →
              </button>
            </div>
          </div>

          {/* Career Paths */}
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Your Career Paths</h2>
            
            {dreamShiftResult.paths.map((path, idx) => (
              <div key={path.id} className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 ${
                path.type === 'best-fit' ? 'border-emerald-300 dark:border-emerald-700' :
                path.type === 'transitional' ? 'border-amber-300 dark:border-amber-700' :
                'border-blue-300 dark:border-blue-700'
              } shadow-md`}>
                {/* LAYER 1 - SUMMARY (Always Visible) */}
                <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">
                    {path.type === 'immediate' ? '🔵' : path.type === 'best-fit' ? '🟢' : '🟣'}
                  </span>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{path.roleTitle || path.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {path.type === 'immediate' ? 'Immediate / Low-Friction Path' :
                       path.type === 'best-fit' ? 'Best-Fit / Skill-Aligned Path' :
                       'Ideal / Unconstrained Path'}
                    </p>
                    {path.title && path.title !== path.roleTitle && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1">{path.title}</p>
                    )}
                  </div>
                </div>
                
                {/* Why This Fits Now */}
                {path.whyThisFitsNow && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4 border-l-4 border-blue-500">
                    <p className="text-xs font-black text-blue-900 dark:text-blue-300 mb-1">Why this fits now</p>
                    <p className="text-slate-900 dark:text-white font-bold">{path.whyThisFitsNow}</p>
                  </div>
                )}
                
                {/* Plain English Fit */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 mb-4 border-l-4 border-purple-500">
                  <p className="text-slate-900 dark:text-white font-bold">{path.plainEnglishFit}</p>
                </div>
                  
                  {/* Key Signals */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Energy Impact</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{path.keySignals.energyImpact}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Income Timeline</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white capitalize">{path.keySignals.incomeTimeline}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Risk Level</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white capitalize">{path.keySignals.riskLevel}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Time Required</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{path.keySignals.timeRequirement}</p>
                    </div>
                  </div>
                  
                  {/* TL;DR, Best For, Watch Out */}
                  <div className="space-y-2 mb-4">
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border-l-2 border-purple-400">
                      <p className="text-xs font-black text-purple-900 dark:text-purple-300 mb-1">TL;DR</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{path.tldr}</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border-l-2 border-emerald-400">
                        <p className="text-xs font-black text-emerald-900 dark:text-emerald-300 mb-1">Best for</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{path.bestFor}</p>
                      </div>
                      <div className="flex-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border-l-2 border-amber-400">
                        <p className="text-xs font-black text-amber-900 dark:text-amber-300 mb-1">Watch out</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{path.watchOut}</p>
                      </div>
                    </div>
                    
                    {/* Tradeoffs */}
                    {path.tradeoffs && (
                      <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 mt-2">
                        <p className="text-xs font-black text-slate-900 dark:text-white mb-1">Tradeoffs</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{path.tradeoffs}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* LAYER 2 - EXPANDABLE DETAILS */}
                <button
                  onClick={() => setExpandedPaths({ ...expandedPaths, [path.id]: !expandedPaths[path.id] })}
                  className="w-full bg-slate-100 dark:bg-slate-700 p-3 rounded-lg flex items-center justify-between hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors mb-4"
                >
                  <span className="font-black text-slate-900 dark:text-white">Why this fits & Next Steps</span>
                  <span className="text-slate-600 dark:text-slate-400">{expandedPaths[path.id] ? '▲' : '▼'}</span>
                </button>
                
                {expandedPaths[path.id] && (
                  <div className="space-y-4 mb-6">
                    {/* Why It Fits - Bullets */}
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white mb-2">Why it fits</h4>
                      <ul className="space-y-2">
                        {Array.isArray(path.whyItFits) ? path.whyItFits.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                            <span className="text-purple-600 dark:text-purple-400">•</span>
                            <span>{reason}</span>
                          </li>
                        )) : (
                          <li className="text-slate-700 dark:text-slate-300">{path.whyItFits}</li>
                        )}
                      </ul>
                    </div>

                    {/* First 3 Steps */}
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white mb-3">First 3 Steps</h4>
                      <div className="space-y-3">
                        {path.firstSteps.map((step, stepIdx) => (
                          <div key={stepIdx} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">{step.description}</p>
                            <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
                              <span>⏱️ {step.timeEstimate}</span>
                              <span className="capitalize">Effort: {step.effortLevel}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Resources */}
                    {path.recommendedResources.length > 0 && (
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white mb-3">Recommended Resources</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {path.recommendedResources.map((resource, resIdx) => (
                            <a
                              key={resIdx}
                              href={resource.link.startsWith('http') ? resource.link : '#'}
                              target={resource.link.startsWith('http') ? '_blank' : undefined}
                              rel={resource.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                              onClick={resource.link.startsWith('app-') ? (e) => {
                                e.preventDefault();
                                // Handle app navigation
                                if (resource.link === 'app-resume') onNavigate(AppView.RESUME);
                                else if (resource.link === 'app-jobs') onNavigate(AppView.JOBS);
                                else if (resource.link === 'app-coach') onNavigate(AppView.COACH);
                              } : undefined}
                              className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <p className="text-sm font-black text-slate-900 dark:text-white">{resource.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{resource.category}</p>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <button
            onClick={() => onNavigate(AppView.COACH)}
            className="mb-4 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold flex items-center gap-2"
          >
            ← Back to AI Coach
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-2xl shadow-lg">
              ✨
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white">DreamShift Assessment</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Discover what fulfills you, what you're good at, and your next direction</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
          {/* Section Navigation */}
          <div className="flex gap-2 mb-8 pb-4 border-b border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setCurrentSection('A')}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                currentSection === 'A' ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              A. Identity & Fulfillment
            </button>
            <button
              type="button"
              onClick={() => setCurrentSection('B')}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                currentSection === 'B' ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              B. Strengths & Skills
            </button>
            <button
              type="button"
              onClick={() => setCurrentSection('C')}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                currentSection === 'C' ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              C. Values & Lifestyle
            </button>
            <button
              type="button"
              onClick={() => setCurrentSection('D')}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                currentSection === 'D' ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              D. Transition Reality
            </button>
          </div>

          {/* Section A - Identity & Fulfillment */}
          {currentSection === 'A' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">A. Identity & Fulfillment</h2>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  1. When do you feel most energized while working? (select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Solving complex problems', 'Creating something new', 'Helping others', 'Working with a team', 'Working independently', 'Teaching or explaining', 'Organizing systems', 'Leading projects'].map(option => (
                    <label key={option} className="flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-purple-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={assessmentAnswers.energizedWhileWorking.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssessmentAnswers({...assessmentAnswers, energizedWhileWorking: [...assessmentAnswers.energizedWhileWorking, option]});
                          } else {
                            setAssessmentAnswers({...assessmentAnswers, energizedWhileWorking: assessmentAnswers.energizedWhileWorking.filter(o => o !== option)});
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  2. What parts of past jobs did you secretly enjoy? (select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Building relationships', 'Learning new skills', 'Problem-solving', 'Creative projects', 'Mentoring others', 'Data analysis', 'Process improvement', 'Customer interaction'].map(option => (
                    <label key={option} className="flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-purple-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={assessmentAnswers.enjoyedPartsOfJobs.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssessmentAnswers({...assessmentAnswers, enjoyedPartsOfJobs: [...assessmentAnswers.enjoyedPartsOfJobs, option]});
                          } else {
                            setAssessmentAnswers({...assessmentAnswers, enjoyedPartsOfJobs: assessmentAnswers.enjoyedPartsOfJobs.filter(o => o !== option)});
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  3. What consistently drains you at work? (select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Micromanagement', 'Repetitive tasks', 'Conflict', 'Unclear expectations', 'Too many meetings', 'Lack of autonomy', 'Bureaucracy', 'Isolation'].map(option => (
                    <label key={option} className="flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-purple-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={assessmentAnswers.drainsAtWork.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssessmentAnswers({...assessmentAnswers, drainsAtWork: [...assessmentAnswers.drainsAtWork, option]});
                          } else {
                            setAssessmentAnswers({...assessmentAnswers, drainsAtWork: assessmentAnswers.drainsAtWork.filter(o => o !== option)});
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  4. What would you keep doing even if no one noticed? (select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Writing', 'Designing', 'Teaching', 'Organizing', 'Building', 'Connecting people', 'Researching', 'Creating content'].map(option => (
                    <label key={option} className="flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-purple-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={assessmentAnswers.keepDoingWithoutNotice.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssessmentAnswers({...assessmentAnswers, keepDoingWithoutNotice: [...assessmentAnswers.keepDoingWithoutNotice, option]});
                          } else {
                            setAssessmentAnswers({...assessmentAnswers, keepDoingWithoutNotice: assessmentAnswers.keepDoingWithoutNotice.filter(o => o !== option)});
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  5. Do you prefer creating, solving, organizing, teaching, or supporting?
                </label>
                <select
                  value={assessmentAnswers.workPreference}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, workPreference: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">Select...</option>
                  <option value="Creating">Creating</option>
                  <option value="Solving">Solving</option>
                  <option value="Organizing">Organizing</option>
                  <option value="Teaching">Teaching</option>
                  <option value="Supporting">Supporting</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  6. People vs Solo: Do you prefer working with others or independently?
                </label>
                <select
                  value={assessmentAnswers.peopleVsSolo}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, peopleVsSolo: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">Select...</option>
                  <option value="Strongly prefer people">Strongly prefer people</option>
                  <option value="Prefer people">Prefer people</option>
                  <option value="Balanced">Balanced</option>
                  <option value="Prefer solo">Prefer solo</option>
                  <option value="Strongly prefer solo">Strongly prefer solo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  7. Creative vs Structured: Do you prefer creative freedom or clear structure?
                </label>
                <select
                  value={assessmentAnswers.creativeVsStructured}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, creativeVsStructured: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">Select...</option>
                  <option value="Strongly prefer creative">Strongly prefer creative</option>
                  <option value="Prefer creative">Prefer creative</option>
                  <option value="Balanced">Balanced</option>
                  <option value="Prefer structured">Prefer structured</option>
                  <option value="Strongly prefer structured">Strongly prefer structured</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  8. Mission vs Money: What matters more to you right now?
                </label>
                <select
                  value={assessmentAnswers.missionVsMoney}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, missionVsMoney: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">Select...</option>
                  <option value="Strongly prefer mission">Strongly prefer mission</option>
                  <option value="Prefer mission">Prefer mission</option>
                  <option value="Balanced">Balanced</option>
                  <option value="Prefer money">Prefer money</option>
                  <option value="Strongly prefer money">Strongly prefer money</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  9. Autonomy vs Guidance: Do you prefer independence or clear direction?
                </label>
                <select
                  value={assessmentAnswers.autonomyVsGuidance}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, autonomyVsGuidance: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">Select...</option>
                  <option value="Strongly prefer autonomy">Strongly prefer autonomy</option>
                  <option value="Prefer autonomy">Prefer autonomy</option>
                  <option value="Balanced">Balanced</option>
                  <option value="Prefer guidance">Prefer guidance</option>
                  <option value="Strongly prefer guidance">Strongly prefer guidance</option>
                </select>
              </div>
            </div>
          )}

          {/* Section B - Strengths & Transferable Skills */}
          {currentSection === 'B' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">B. Strengths & Transferable Skills</h2>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  10. What do people ask you for help with? (select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Explaining things', 'Problem-solving', 'Organizing', 'Writing', 'Design', 'Technical issues', 'Planning', 'Connecting people'].map(option => (
                    <label key={option} className="flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-purple-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={assessmentAnswers.askedForHelpWith.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssessmentAnswers({...assessmentAnswers, askedForHelpWith: [...assessmentAnswers.askedForHelpWith, option]});
                          } else {
                            setAssessmentAnswers({...assessmentAnswers, askedForHelpWith: assessmentAnswers.askedForHelpWith.filter(o => o !== option)});
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  11. What do you explain easily to others? (select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Complex concepts', 'Technical topics', 'Processes', 'People dynamics', 'Creative ideas', 'Data', 'Strategies', 'Tools'].map(option => (
                    <label key={option} className="flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-purple-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={assessmentAnswers.explainEasily.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssessmentAnswers({...assessmentAnswers, explainEasily: [...assessmentAnswers.explainEasily, option]});
                          } else {
                            setAssessmentAnswers({...assessmentAnswers, explainEasily: assessmentAnswers.explainEasily.filter(o => o !== option)});
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  12. What tasks feel "easy" to you? (select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Writing', 'Designing', 'Analyzing data', 'Teaching', 'Organizing', 'Building', 'Connecting', 'Planning'].map(option => (
                    <label key={option} className="flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-purple-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={assessmentAnswers.tasksFeelEasy.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssessmentAnswers({...assessmentAnswers, tasksFeelEasy: [...assessmentAnswers.tasksFeelEasy, option]});
                          } else {
                            setAssessmentAnswers({...assessmentAnswers, tasksFeelEasy: assessmentAnswers.tasksFeelEasy.filter(o => o !== option)});
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  13. What skills have you learned outside of formal jobs? (select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Freelancing', 'Volunteering', 'Side projects', 'Hobbies', 'Online courses', 'Mentoring', 'Community organizing', 'Creative work'].map(option => (
                    <label key={option} className="flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-purple-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={assessmentAnswers.skillsOutsideJobs.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssessmentAnswers({...assessmentAnswers, skillsOutsideJobs: [...assessmentAnswers.skillsOutsideJobs, option]});
                          } else {
                            setAssessmentAnswers({...assessmentAnswers, skillsOutsideJobs: assessmentAnswers.skillsOutsideJobs.filter(o => o !== option)});
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  14. What roles have you naturally fallen into? (select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['The explainer', 'The organizer', 'The connector', 'The problem-solver', 'The creative', 'The planner', 'The supporter', 'The builder'].map(option => (
                    <label key={option} className="flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-purple-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={assessmentAnswers.naturalRoles.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssessmentAnswers({...assessmentAnswers, naturalRoles: [...assessmentAnswers.naturalRoles, option]});
                          } else {
                            setAssessmentAnswers({...assessmentAnswers, naturalRoles: assessmentAnswers.naturalRoles.filter(o => o !== option)});
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section C - Values & Lifestyle */}
          {currentSection === 'C' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">C. Values & Lifestyle</h2>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  15. Stability vs Fulfillment: How important is stability vs finding fulfilling work?
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={assessmentAnswers.stabilityVsFulfillment}
                    onChange={(e) => setAssessmentAnswers({...assessmentAnswers, stabilityVsFulfillment: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Stability</span>
                    <span className="font-black text-purple-600 dark:text-purple-400">{assessmentAnswers.stabilityVsFulfillment}</span>
                    <span>Fulfillment</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  16. Flexibility vs Predictability: How important is flexibility vs predictable schedule?
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={assessmentAnswers.flexibilityVsPredictability}
                    onChange={(e) => setAssessmentAnswers({...assessmentAnswers, flexibilityVsPredictability: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Predictability</span>
                    <span className="font-black text-purple-600 dark:text-purple-400">{assessmentAnswers.flexibilityVsPredictability}</span>
                    <span>Flexibility</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  17. Team vs Independent: How important is teamwork vs working independently?
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={assessmentAnswers.teamVsIndependent}
                    onChange={(e) => setAssessmentAnswers({...assessmentAnswers, teamVsIndependent: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Team</span>
                    <span className="font-black text-purple-600 dark:text-purple-400">{assessmentAnswers.teamVsIndependent}</span>
                    <span>Independent</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  18. Leadership vs Contribution: Do you prefer leading or contributing to a team?
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={assessmentAnswers.leadershipVsContribution}
                    onChange={(e) => setAssessmentAnswers({...assessmentAnswers, leadershipVsContribution: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Leadership</span>
                    <span className="font-black text-purple-600 dark:text-purple-400">{assessmentAnswers.leadershipVsContribution}</span>
                    <span>Contribution</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  19. Meaning vs Income: What's your current priority - meaningful work or income?
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={assessmentAnswers.meaningVsIncome}
                    onChange={(e) => setAssessmentAnswers({...assessmentAnswers, meaningVsIncome: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Income</span>
                    <span className="font-black text-purple-600 dark:text-purple-400">{assessmentAnswers.meaningVsIncome}</span>
                    <span>Meaning</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section D - Transition Reality */}
          {currentSection === 'D' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">D. Transition Reality</h2>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  20. What's your risk tolerance for career changes?
                </label>
                <select
                  value={assessmentAnswers.riskTolerance}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, riskTolerance: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">Select...</option>
                  <option value="Very low - need stability">Very low - need stability</option>
                  <option value="Low - prefer gradual changes">Low - prefer gradual changes</option>
                  <option value="Medium - open to calculated risks">Medium - open to calculated risks</option>
                  <option value="High - willing to take big leaps">High - willing to take big leaps</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  21. How many hours per week can you dedicate to transition activities?
                </label>
                <select
                  value={assessmentAnswers.timeAvailablePerWeek}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, timeAvailablePerWeek: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">Select...</option>
                  <option value="<5 hours">Less than 5 hours</option>
                  <option value="5-10 hours">5-10 hours</option>
                  <option value="10-20 hours">10-20 hours</option>
                  <option value="20+ hours">20+ hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  22. How willing are you to retrain or learn new skills?
                </label>
                <select
                  value={assessmentAnswers.willingnessToRetrain}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, willingnessToRetrain: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">Select...</option>
                  <option value="Very willing">Very willing</option>
                  <option value="Somewhat willing">Somewhat willing</option>
                  <option value="Prefer using existing skills">Prefer using existing skills</option>
                  <option value="Not willing">Not willing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  23. What's your current financial pressure level?
                </label>
                <select
                  value={assessmentAnswers.financialPressure}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, financialPressure: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">Select...</option>
                  <option value="Low - stable financially">Low - stable financially</option>
                  <option value="Medium - some pressure">Medium - some pressure</option>
                  <option value="High - urgent need">High - urgent need</option>
                  <option value="Critical - immediate need">Critical - immediate need</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  24. How much autonomy do you desire in your work?
                </label>
                <select
                  value={assessmentAnswers.desireForAutonomy}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, desireForAutonomy: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">Select...</option>
                  <option value="Very high - need full control">Very high - need full control</option>
                  <option value="High - prefer independence">High - prefer independence</option>
                  <option value="Medium - balanced">Medium - balanced</option>
                  <option value="Low - prefer guidance">Low - prefer guidance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  25. What's your urgency level for making a change?
                </label>
                <select
                  value={assessmentAnswers.urgencyLevel}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, urgencyLevel: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">Select...</option>
                  <option value="No urgency - exploring options">No urgency - exploring options</option>
                  <option value="Low urgency - planning ahead">Low urgency - planning ahead</option>
                  <option value="Medium urgency - want to change soon">Medium urgency - want to change soon</option>
                  <option value="High urgency - need to change now">High urgency - need to change now</option>
                </select>
              </div>
            </div>
          )}

          {/* Section E - Constraints & Specificity */}
          {currentSection === 'E' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">E. Constraints & Specificity</h2>
              
              {/* A. Constraints */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  26. Which matters most right now?
                </label>
                <select
                  value={assessmentAnswers.priorityMattersMost}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, priorityMattersMost: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Income stability">Income stability</option>
                  <option value="Career fulfillment">Career fulfillment</option>
                  <option value="Skill growth">Skill growth</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  27. How much risk can you realistically take?
                </label>
                <select
                  value={assessmentAnswers.realisticRiskTolerance}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, realisticRiskTolerance: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Very low">Very low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  28. How soon do you need income?
                </label>
                <select
                  value={assessmentAnswers.incomeTimeline}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, incomeTimeline: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Immediately">Immediately</option>
                  <option value="1-3 months">1–3 months</option>
                  <option value="3-6 months+">3–6 months+</option>
                </select>
              </div>

              {/* B. Skill Depth */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  29. Which skills do people already rely on you for? (select up to 3)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Explaining complex ideas', 'Problem-solving / troubleshooting', 'Writing / documentation', 'Teaching / mentoring', 'Designing systems or processes', 'Organizing / planning', 'Connecting people', 'Building / creating'].map(option => (
                    <label key={option} className="flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-purple-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={assessmentAnswers.skillsReliedOn.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked && assessmentAnswers.skillsReliedOn.length < 3) {
                            setAssessmentAnswers({...assessmentAnswers, skillsReliedOn: [...assessmentAnswers.skillsReliedOn, option]});
                          } else if (!e.target.checked) {
                            setAssessmentAnswers({...assessmentAnswers, skillsReliedOn: assessmentAnswers.skillsReliedOn.filter(s => s !== option)});
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  30. Which skill do you enjoy using daily, not just occasionally?
                </label>
                <select
                  value={assessmentAnswers.dailyEnjoyedSkill}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, dailyEnjoyedSkill: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Explaining complex ideas">Explaining complex ideas</option>
                  <option value="Problem-solving / troubleshooting">Problem-solving / troubleshooting</option>
                  <option value="Writing / documentation">Writing / documentation</option>
                  <option value="Teaching / mentoring">Teaching / mentoring</option>
                  <option value="Designing systems or processes">Designing systems or processes</option>
                  <option value="Organizing / planning">Organizing / planning</option>
                  <option value="Connecting people">Connecting people</option>
                  <option value="Building / creating">Building / creating</option>
                </select>
              </div>

              {/* C. Role Tolerances */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    31. Which would drain you fastest?
                  </label>
                  <select
                    value={assessmentAnswers.drainsFastest}
                    onChange={(e) => setAssessmentAnswers({...assessmentAnswers, drainsFastest: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Repetitive tasks">Repetitive tasks</option>
                    <option value="Heavy meetings">Heavy meetings</option>
                    <option value="Constant client interaction">Constant client interaction</option>
                    <option value="Tight supervision">Tight supervision</option>
                  </select>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    32. Which environment do you tolerate even if it's not ideal?
                  </label>
                  <select
                    value={assessmentAnswers.tolerableEnvironment}
                    onChange={(e) => setAssessmentAnswers({...assessmentAnswers, tolerableEnvironment: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Corporate structure">Corporate structure</option>
                    <option value="Client-facing work">Client-facing work</option>
                    <option value="Independent work with ambiguity">Independent work with ambiguity</option>
                  </select>
                </div>
              </div>

              {/* D. Transition Reality Check */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    33. Are you willing to learn new tools?
                  </label>
                  <select
                    value={assessmentAnswers.willingToLearnTools}
                    onChange={(e) => setAssessmentAnswers({...assessmentAnswers, willingToLearnTools: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="Some">Some</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    34. Are you willing to build a portfolio?
                  </label>
                  <select
                    value={assessmentAnswers.willingToBuildPortfolio}
                    onChange={(e) => setAssessmentAnswers({...assessmentAnswers, willingToBuildPortfolio: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="Some">Some</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    35. Are you willing to network actively?
                  </label>
                  <select
                    value={assessmentAnswers.willingToNetwork}
                    onChange={(e) => setAssessmentAnswers({...assessmentAnswers, willingToNetwork: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="Some">Some</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                if (currentSection === 'A') return;
                const sections = ['A', 'B', 'C', 'D', 'E'];
                const currentIndex = sections.indexOf(currentSection);
                setCurrentSection(sections[currentIndex - 1] as 'A' | 'B' | 'C' | 'D' | 'E');
              }}
              disabled={currentSection === 'A'}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            
            {currentSection !== 'E' ? (
              <button
                type="button"
                onClick={() => {
                  const sections = ['A', 'B', 'C', 'D', 'E'];
                  const currentIndex = sections.indexOf(currentSection);
                  setCurrentSection(sections[currentIndex + 1] as 'A' | 'B' | 'C' | 'D' | 'E');
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-black hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Generating Your DreamShift...' : '✨ Complete Assessment'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

