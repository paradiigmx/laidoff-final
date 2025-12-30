import React, { useState, useEffect, useRef } from 'react';
import { ResumeRewriteResult, SavedResume, InterviewSession, InterviewMode, InterviewRound, InputMode, QuestionInstance, AppView } from '../types';
import { getSavedResumes } from '../services/storageService';
import heroImage from '@assets/public-bar-063_1766520405673.jpg';

interface CoachViewProps {
  resumeData: ResumeRewriteResult | null;
  onNavigate?: (view: AppView) => void;
}

// Question Bank (20 questions)
const QUESTION_BANK = [
  // Round 1 - Core Basics
  { id: 1, text: "Tell me about yourself.", round: 1 },
  { id: 2, text: "Why do you want this role?", round: 1 },
  { id: 3, text: "Why do you want to work here?", round: 1 },
  { id: 4, text: "Walk me through your resume.", round: 1 },
  { id: 5, text: "What are your strengths?", round: 1 },
  // Round 2 - Proof & Performance
  { id: 6, text: "What's a project you're proud of and why?", round: 2 },
  { id: 7, text: "Tell me about a time you improved a process.", round: 2 },
  { id: 8, text: "Tell me about a goal you hit — how did you measure success?", round: 2 },
  { id: 9, text: "Tell me about a time you had to learn something quickly.", round: 2 },
  { id: 10, text: "What's your biggest accomplishment?", round: 2 },
  // Round 3 - Conflict & Pressure
  { id: 11, text: "Tell me about a time you made a mistake — what happened?", round: 3 },
  { id: 12, text: "Tell me about a conflict with a coworker — how did you handle it?", round: 3 },
  { id: 13, text: "Tell me about a time you received critical feedback.", round: 3 },
  { id: 14, text: "How do you handle tight deadlines or pressure?", round: 3 },
  { id: 15, text: "Tell me about a time you had to deal with ambiguity.", round: 3 },
  // Round 4 - Judgment & Values
  { id: 16, text: "Tell me about a time you had to make a tough decision.", round: 4 },
  { id: 17, text: "What motivates you at work?", round: 4 },
  { id: 18, text: "What type of manager do you work best with?", round: 4 },
  { id: 19, text: "Where do you see yourself in 2–3 years?", round: 4 },
  { id: 20, text: "Do you have any questions for me?", round: 4 },
];

// Assessment Packs (6 questions each)
const getAssessmentQuestions = (round: InterviewRound): number[] => {
  if (round === 1) return [1, 2, 3, 4, 5, 20]; // Q1-Q5 + Q20
  if (round === 2) return [6, 7, 8, 9, 10, 20]; // Q6-Q10 + Q20
  if (round === 3) return [11, 12, 13, 14, 15, 20]; // Q11-Q15 + Q20
  if (round === 4) return [16, 17, 18, 19, 20, 20]; // Q16-Q19 + Q20 (Q20 is already "Do you have any questions for me?")
  return [];
};

export const CoachView: React.FC<CoachViewProps> = ({ resumeData, onNavigate }) => {
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [currentResumeData, setCurrentResumeData] = useState<ResumeRewriteResult | null>(resumeData);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  
  // Interview State
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true);
  const [inputMode, setInputMode] = useState<InputMode>('voice');
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Financial Assessment State
  const [financialAssessment, setFinancialAssessment] = useState<any>(null);
  const [showFinancialTips, setShowFinancialTips] = useState(false);
  const [showFinancialResources, setShowFinancialResources] = useState(false);
  const [expandedFinancialSection, setExpandedFinancialSection] = useState<string | null>(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentAnswers, setAssessmentAnswers] = useState({
    employmentStatus: '',
    primaryPressure: [] as string[],
    vehicleAccess: '',
    hasLicense: '',
    canTravel: '',
    skills: [] as string[],
    sellingComfort: '',
    sellableItems: [] as string[],
    hoursPerWeek: '',
    urgency: '',
    educationLevel: '',
    internetAccess: '',
    childcareNeeds: '',
    healthLimitations: '',
    previousExperience: [] as string[]
  });
  
  // Voice/STT Refs
    const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

    useEffect(() => {
    setSavedResumes(getSavedResumes());
    setCurrentResumeData(resumeData);
    
    // Initialize speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      // Load voices (they may not be available immediately)
      const loadVoices = () => {
        if (synthRef.current) {
          synthRef.current.getVoices(); // Trigger voice loading
        }
      };
      loadVoices();
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }
    
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            setCurrentTranscript(prev => prev + finalTranscript);
          } else if (interimTranscript) {
            setCurrentTranscript(prev => prev + interimTranscript);
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'no-speech' || event.error === 'audio-capture') {
            setIsRecording(false);
          }
        };
        
        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [resumeData]);
  
  const speakText = (text: string) => {
    if (!synthRef.current || !voiceOutputEnabled) return;
    
    synthRef.current.cancel(); // Cancel any ongoing speech
    
    // Get available voices and prefer a more natural one
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find((v: SpeechSynthesisVoice) => 
      v.name.includes('Samantha') || 
      v.name.includes('Alex') || 
      v.name.includes('Google') ||
      v.name.includes('Microsoft') ||
      v.lang.startsWith('en')
    ) || voices.find((v: SpeechSynthesisVoice) => v.lang.startsWith('en'));
    
    const utterance = new SpeechSynthesisUtterance(text);
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    utterance.rate = 0.95; // Slightly slower for more natural speech
    utterance.pitch = 1.1; // Slightly higher pitch for more natural sound
    utterance.volume = 1.0;
    
    synthRef.current.speak(utterance);
  };
  
  const startRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not available. Please use text input or check your browser permissions.');
            return;
        }
    
    try {
      setCurrentTranscript('');
      setIsRecording(true);
            recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      alert('Could not start recording. Please check microphone permissions.');
    }
  };
  
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }
    setIsRecording(false);
  };
  
  const startInterview = (mode: InterviewMode, round?: InterviewRound) => {
    const selectedRound = round || 1;
    const questionIds = getAssessmentQuestions(selectedRound);
    
    const newSession: InterviewSession = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      mode,
      round: selectedRound,
      currentQuestionIndex: 0,
      questions: questionIds.map((qId, index) => {
        const question = QUESTION_BANK.find(q => q.id === qId);
        return {
          questionId: qId,
          promptText: question?.text || '',
          userTranscript: '',
          responses: [],
          scores: {
            structure: 0,
            specificity: 0,
            relevance: 0,
            clarity: 0,
          },
          totalScore: 0,
          feedbackBullets: [],
          followUpsAsked: 0,
        };
      }),
      overallScores: {
        structure: 0,
        specificity: 0,
        relevance: 0,
        clarity: 0,
        average: 0,
      },
      grade: 'F',
      completed: false,
      voiceOutputEnabled,
      inputMode,
    };
    
    setSession(newSession);
    
    // Speak first question
    if (newSession.questions[0]) {
      speakText(newSession.questions[0].promptText);
    }
  };
  
  const renderStartScreen = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-16 pb-24">
            {/* Hero Header */}
            <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 text-white shadow-2xl border border-slate-800">
                <div className="absolute inset-0">
                    <img src={heroImage} alt="" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/50"></div>
                </div>
                <div className="relative z-10 p-10 md:p-16">
                    <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-white/10 text-purple-300">
                        AI Coaching
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
                        Career <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-200 to-white">Coach.</span>
                    </h1>
                    <p className="text-lg text-slate-300 leading-relaxed font-medium max-w-xl">
              Expert guidance for career strategy, interview preparation, and professional growth.
                    </p>
                </div>
            </div>

        {/* DreamShift Assessment Section */}
        <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-[2.5rem] p-8 md:p-12 border-2 border-purple-200 dark:border-purple-800 shadow-2xl mb-16">
          {/* Dream-like Hero Image */}
          <div className="mb-8 rounded-2xl overflow-hidden shadow-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <img 
              src="/attached_assets/microsoft-365-TLiWhlDEJwA-unsplash_1766438656269.jpg" 
              alt="DreamShift career discovery" 
              className="w-full h-48 md:h-64 object-cover"
            />
          </div>

          {/* Section Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-2xl shadow-lg">
                ✨
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">DreamShift</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Discover what fulfills you, what you're good at, and your next direction</p>
              </div>
            </div>
                </div>
                
          {/* 3-Column Explainer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Understand your stability level</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Get a clear picture of your current financial situation and what it means for your next steps.</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-3xl mb-3">💼</div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Identify realistic income paths</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Discover income opportunities that match your skills, constraints, and timeline.</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-3xl mb-3">🧭</div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Build a step-by-step stabilization plan</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Create an actionable 30-60-90 day plan tailored to your specific needs and goals.</p>
            </div>
                    </div>
                    
          {/* DreamShift Assessment Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">✨ DreamShift Assessment</h3>
                  <p className="text-sm text-purple-100">30-40 questions • Discover your career identity and direction</p>
                </div>
                <button
                  onClick={() => onNavigate && onNavigate(AppView.DREAMSHIFT_ASSESSMENT)}
                  className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-black transition-colors border border-white/30"
                >
                  Start Assessment →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Stability Section */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-[2.5rem] p-8 md:p-12 border-2 border-emerald-200 dark:border-emerald-800 shadow-2xl mb-16">
          {/* Professional Finance Image */}
          <div className="mb-8 rounded-2xl overflow-hidden shadow-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <img 
              src="/attached_assets/microsoft-365-TLiWhlDEJwA-unsplash_1766438656269.jpg" 
              alt="Financial planning and stability" 
              className="w-full h-48 md:h-64 object-cover"
            />
                                </div>

          {/* Section Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-2xl shadow-lg">
                💰
                        </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Financial Stability</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Assess your situation, identify income paths, and build a stabilization plan</p>
              </div>
            </div>
          </div>

          {/* 3-Column Explainer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Understand your stability level</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Discover what fulfills you and what energizes you in your work.</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-3xl mb-3">💼</div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Identify realistic income paths</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Surface your natural strengths and transferable skills you may have overlooked.</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-3xl mb-3">🧭</div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Build a step-by-step stabilization plan</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Get a realistic direction and transition plan that fits your life.</p>
            </div>
          </div>

          {/* Note */}
          <div className="mb-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 italic">Not credit-based. Not judgmental. Takes ~5 minutes.</p>
          </div>

          {/* Financial Stability Assessment - Navigate to separate view */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">📊 Financial Stability Assessment</h3>
                  <p className="text-sm text-emerald-100">15 questions • 5 minutes • Get personalized resources</p>
                </div>
                <button
                  onClick={() => onNavigate && onNavigate(AppView.FINANCIAL_ASSESSMENT)}
                  className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-black transition-colors border border-white/30"
                >
                  Start Assessment →
                </button>
              </div>
            </div>
            
            {showAssessment && !financialAssessment && (
              <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                // Calculate assessment results
                const mobilityScore = (assessmentAnswers.vehicleAccess === 'Yes, reliable' && assessmentAnswers.hasLicense === 'Yes' && assessmentAnswers.canTravel === 'Yes') ? 'High' :
                  (assessmentAnswers.vehicleAccess === 'Yes, but unreliable' || assessmentAnswers.canTravel === 'Limited') ? 'Medium' : 'Low';
                
                const incomeFlexibility = assessmentAnswers.hoursPerWeek === '40+' ? 'High' :
                  assessmentAnswers.hoursPerWeek === '20-40' ? 'Medium' : 'Low';
                
                let stabilityLevel = 'Stable';
                if (assessmentAnswers.urgency === 'Critical (<30 days)') stabilityLevel = 'Immediate Action Needed';
                else if (assessmentAnswers.urgency === 'Tight (1–2 months)') stabilityLevel = 'Watch Closely';
                
                let primaryConstraint = 'Time';
                if (assessmentAnswers.vehicleAccess === 'No' || assessmentAnswers.canTravel === 'No') primaryConstraint = 'Transportation';
                else if (assessmentAnswers.hoursPerWeek === '<10') primaryConstraint = 'Time';
                else if (assessmentAnswers.urgency === 'Critical (<30 days)') primaryConstraint = 'Urgency';
                else primaryConstraint = 'Skills';
                
                let insight = '';
                if (primaryConstraint === 'Transportation') {
                  insight = "Your biggest limiter right now isn't skill — it's transportation.";
                } else if (primaryConstraint === 'Time') {
                  insight = "You have income potential, but time and urgency are working against you.";
                } else if (primaryConstraint === 'Urgency') {
                  insight = "Your situation requires immediate action. Focus on fastest income paths first.";
                } else {
                  insight = "You have flexibility. Focus on matching your skills to reliable income sources.";
                }
                
                // Determine which resources to show based on answers
                const suggestedResources: any = {
                  assistance: [],
                  unemployment: [],
                  monetization: [],
                  money: []
                };

                // Assistance resources based on financial pressures
                if (assessmentAnswers.primaryPressure.includes('Rent / housing')) {
                  suggestedResources.assistance.push({ title: 'Emergency Rental Assistance', category: 'Housing', link: 'https://www.consumerfinance.gov/renthelp' });
                  suggestedResources.assistance.push({ title: '211.org', category: 'Housing Support', link: 'https://www.211.org/' });
                }
                if (assessmentAnswers.primaryPressure.includes('Food')) {
                  suggestedResources.assistance.push({ title: 'SNAP (Food Stamps)', category: 'Food Assistance', link: 'https://www.fns.usda.gov/snap/' });
                  suggestedResources.assistance.push({ title: 'Feeding America', category: 'Food Bank', link: 'https://www.feedingamerica.org/find-your-local-foodbank' });
                }
                if (assessmentAnswers.primaryPressure.includes('Utilities')) {
                  suggestedResources.assistance.push({ title: 'LIHEAP Energy Assistance', category: 'Utility Help', link: 'https://www.benefits.gov/benefit/623' });
                }
                if (assessmentAnswers.primaryPressure.includes('Medical')) {
                  suggestedResources.assistance.push({ title: 'Medicaid', category: 'Healthcare', link: 'https://www.medicaid.gov/' });
                }
                if (assessmentAnswers.internetAccess === 'No' || assessmentAnswers.internetAccess === 'Yes, but limited') {
                  suggestedResources.assistance.push({ title: 'Lifeline Program', category: 'Internet/Phone', link: 'https://www.lifelinesupport.org/' });
                  suggestedResources.assistance.push({ title: 'ACP (Affordable Connectivity Program)', category: 'Internet', link: 'https://www.affordableconnectivity.gov/' });
                }

                // Unemployment resources
                if (assessmentAnswers.employmentStatus === 'Recently laid off' || assessmentAnswers.employmentStatus === 'Unemployed (3+ months)') {
                  suggestedResources.unemployment.push({ title: 'File for Unemployment Benefits', category: 'Benefits', link: 'state-specific' });
                  suggestedResources.unemployment.push({ title: 'Resume Builder', category: 'Job Prep', link: 'app-resume' });
                  suggestedResources.unemployment.push({ title: 'Job Search Tools', category: 'Job Search', link: 'app-jobs' });
                }

                // Monetization resources based on skills
                if (assessmentAnswers.skills.some(s => s.includes('Creative') || s.includes('Design'))) {
                  suggestedResources.monetization.push({ title: 'Creative Freelance Platforms', category: 'Creative Work', link: 'app-monetization' });
                }
                if (assessmentAnswers.skills.some(s => s.includes('Writing') || s.includes('Content'))) {
                  suggestedResources.monetization.push({ title: 'Content Creation Tools', category: 'Writing', link: 'app-monetization' });
                }
                if (assessmentAnswers.skills.some(s => s.includes('Tech'))) {
                  suggestedResources.monetization.push({ title: 'Tech Freelance Platforms', category: 'Tech Work', link: 'app-monetization' });
                }
                if (assessmentAnswers.sellingComfort !== 'No') {
                  suggestedResources.monetization.push({ title: 'Service Sales Platforms', category: 'Services', link: 'app-monetization' });
                }

                // Money/Gigs resources based on mobility and constraints
                if (mobilityScore === 'High' || assessmentAnswers.vehicleAccess === 'Yes, reliable') {
                  suggestedResources.money.push({ title: 'Delivery & Driving Gigs', category: 'Delivery', link: 'app-money' });
                  suggestedResources.money.push({ title: 'Rideshare Opportunities', category: 'Rideshare', link: 'app-money' });
                }
                if (assessmentAnswers.internetAccess === 'Yes, reliable') {
                  suggestedResources.money.push({ title: 'Remote Work Opportunities', category: 'Remote', link: 'app-jobs' });
                  suggestedResources.money.push({ title: 'Online Gigs', category: 'Online', link: 'app-money' });
                }
                if (assessmentAnswers.sellableItems.length > 0 && !assessmentAnswers.sellableItems.includes('No')) {
                  suggestedResources.money.push({ title: 'Selling Platforms', category: 'Selling', link: 'app-money' });
                }
                if (assessmentAnswers.previousExperience.includes('Food service')) {
                  suggestedResources.money.push({ title: 'Food Service Gigs', category: 'Food Service', link: 'app-money' });
                }
                
                setFinancialAssessment({
                  stabilityLevel,
                  mobilityScore,
                  incomeFlexibility,
                  primaryConstraint,
                  insight,
                  answers: assessmentAnswers,
                  suggestedResources
                });
                setShowAssessment(false);
              }} className="space-y-6">
                {/* A. Current Financial Status */}
                <div className="space-y-4">
                  <h4 className="text-base font-black text-slate-900 dark:text-white">A. Current Financial Status</h4>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">1. Current employment status:</label>
                    <select
                      value={assessmentAnswers.employmentStatus}
                      onChange={(e) => setAssessmentAnswers({...assessmentAnswers, employmentStatus: e.target.value})}
                      className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Employed">Employed</option>
                      <option value="Recently laid off">Recently laid off</option>
                      <option value="Unemployed (3+ months)">Unemployed (3+ months)</option>
                      <option value="Gig / contract only">Gig / contract only</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">2. Primary financial pressures right now: (select all that apply)</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['Rent / housing', 'Utilities', 'Food', 'Transportation', 'Debt', 'Medical', 'Childcare', 'Insurance'].map(pressure => (
                        <label key={pressure} className="flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-emerald-400 transition-colors">
                          <input
                            type="checkbox"
                            checked={assessmentAnswers.primaryPressure.includes(pressure)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAssessmentAnswers({...assessmentAnswers, primaryPressure: [...assessmentAnswers.primaryPressure, pressure]});
                              } else {
                                setAssessmentAnswers({...assessmentAnswers, primaryPressure: assessmentAnswers.primaryPressure.filter(p => p !== pressure)});
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-xs text-slate-700 dark:text-slate-300">{pressure}</span>
                        </label>
                    ))}
                </div>
                  </div>
                </div>

                {/* B. Transportation & Mobility */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-base font-black text-slate-900 dark:text-white">B. Transportation & Mobility</h4>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">3. Do you currently have access to a working vehicle?</label>
                    <select
                      value={assessmentAnswers.vehicleAccess}
                      onChange={(e) => setAssessmentAnswers({...assessmentAnswers, vehicleAccess: e.target.value})}
                      className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Yes, reliable">Yes, reliable</option>
                      <option value="Yes, but unreliable">Yes, but unreliable</option>
                      <option value="No">No</option>
                    </select>
                            </div>
                  
                            <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">4. Do you have a valid driver's license?</label>
                    <select
                      value={assessmentAnswers.hasLicense}
                      onChange={(e) => setAssessmentAnswers({...assessmentAnswers, hasLicense: e.target.value})}
                      className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                            </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">5. Are you able to travel locally for work?</label>
                    <select
                      value={assessmentAnswers.canTravel}
                      onChange={(e) => setAssessmentAnswers({...assessmentAnswers, canTravel: e.target.value})}
                      className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Yes">Yes</option>
                      <option value="Limited">Limited</option>
                      <option value="No">No</option>
                    </select>
                        </div>
                    </div>

                {/* C. Skills & Income Capacity */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-base font-black text-slate-900 dark:text-white">C. Skills & Income Capacity</h4>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">6. What are you best at? (select up to 3)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Customer service', 'Writing / content', 'Design / creative', 'Tech / troubleshooting', 'Organization / admin', 'Physical labor', 'Sales / persuasion', 'Teaching / explaining'].map(skill => (
                        <label key={skill} className="flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-emerald-400 transition-colors">
                          <input
                            type="checkbox"
                            checked={assessmentAnswers.skills.includes(skill)}
                            onChange={(e) => {
                              if (e.target.checked && assessmentAnswers.skills.length < 3) {
                                setAssessmentAnswers({...assessmentAnswers, skills: [...assessmentAnswers.skills, skill]});
                              } else if (!e.target.checked) {
                                setAssessmentAnswers({...assessmentAnswers, skills: assessmentAnswers.skills.filter(s => s !== skill)});
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-xs text-slate-700 dark:text-slate-300">{skill}</span>
                        </label>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">7. Are you comfortable selling things or services?</label>
                    <select
                      value={assessmentAnswers.sellingComfort}
                      onChange={(e) => setAssessmentAnswers({...assessmentAnswers, sellingComfort: e.target.value})}
                      className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Yes, confidently">Yes, confidently</option>
                      <option value="Somewhat">Somewhat</option>
                      <option value="No">No</option>
                    </select>
                            </div>
                </div>

                {/* D. Assets & Flexibility */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-base font-black text-slate-900 dark:text-white">D. Assets & Flexibility</h4>
                  
                            <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">8. Do you have items you could realistically sell?</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {['Electronics', 'Furniture', 'Clothing', 'Creative work', 'No'].map(item => (
                        <label key={item} className="flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-emerald-400 transition-colors">
                          <input
                            type="checkbox"
                            checked={assessmentAnswers.sellableItems.includes(item)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAssessmentAnswers({...assessmentAnswers, sellableItems: [...assessmentAnswers.sellableItems, item]});
                              } else {
                                setAssessmentAnswers({...assessmentAnswers, sellableItems: assessmentAnswers.sellableItems.filter(i => i !== item)});
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
                        </label>
                      ))}
                            </div>
                        </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">9. How many hours per week can you realistically dedicate to income generation?</label>
                    <select
                      value={assessmentAnswers.hoursPerWeek}
                      onChange={(e) => setAssessmentAnswers({...assessmentAnswers, hoursPerWeek: e.target.value})}
                      className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="<10">&lt;10</option>
                      <option value="10–20">10–20</option>
                      <option value="20–40">20–40</option>
                      <option value="40+">40+</option>
                    </select>
                    </div>
                </div>

                {/* E. Risk & Urgency */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-base font-black text-slate-900 dark:text-white">E. Risk & Urgency</h4>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">10. How urgent is your financial situation?</label>
                    <select
                      value={assessmentAnswers.urgency}
                      onChange={(e) => setAssessmentAnswers({...assessmentAnswers, urgency: e.target.value})}
                      className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Stable (2+ months runway)">Stable (2+ months runway)</option>
                      <option value="Tight (1–2 months)">Tight (1–2 months)</option>
                      <option value="Critical (<30 days)">Critical (&lt;30 days)</option>
                    </select>
                  </div>
                </div>

                {/* F. Education & Access */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-base font-black text-slate-900 dark:text-white">F. Education & Access</h4>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">11. What is your highest level of education?</label>
                    <select
                      value={assessmentAnswers.educationLevel}
                      onChange={(e) => setAssessmentAnswers({...assessmentAnswers, educationLevel: e.target.value})}
                      className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="High school or less">High school or less</option>
                      <option value="Some college">Some college</option>
                      <option value="Associate's degree">Associate's degree</option>
                      <option value="Bachelor's degree">Bachelor's degree</option>
                      <option value="Master's degree or higher">Master's degree or higher</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">12. Do you have reliable internet access at home?</label>
                    <select
                      value={assessmentAnswers.internetAccess}
                      onChange={(e) => setAssessmentAnswers({...assessmentAnswers, internetAccess: e.target.value})}
                      className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Yes, reliable">Yes, reliable</option>
                      <option value="Yes, but limited">Yes, but limited</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                {/* G. Personal Constraints */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-base font-black text-slate-900 dark:text-white">G. Personal Constraints</h4>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">13. Do you have childcare needs that affect your work availability?</label>
                    <select
                      value={assessmentAnswers.childcareNeeds}
                      onChange={(e) => setAssessmentAnswers({...assessmentAnswers, childcareNeeds: e.target.value})}
                      className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="No childcare needs">No childcare needs</option>
                      <option value="Some childcare needs">Some childcare needs</option>
                      <option value="Significant childcare needs">Significant childcare needs</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">14. Do you have any health or physical limitations that affect work options?</label>
                    <select
                      value={assessmentAnswers.healthLimitations}
                      onChange={(e) => setAssessmentAnswers({...assessmentAnswers, healthLimitations: e.target.value})}
                      className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="No limitations">No limitations</option>
                      <option value="Some limitations">Some limitations</option>
                      <option value="Significant limitations">Significant limitations</option>
                    </select>
                  </div>
                </div>

                {/* H. Experience & Background */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-base font-black text-slate-900 dark:text-white">H. Experience & Background</h4>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">15. What types of work have you done before? (select all that apply)</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['Retail / Customer service', 'Office / Administrative', 'Food service', 'Delivery / Driving', 'Construction / Physical', 'Healthcare', 'Education / Teaching', 'Sales', 'Tech / IT', 'Creative / Design', 'Other'].map(exp => (
                        <label key={exp} className="flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-emerald-400 transition-colors">
                          <input
                            type="checkbox"
                            checked={assessmentAnswers.previousExperience.includes(exp)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAssessmentAnswers({...assessmentAnswers, previousExperience: [...assessmentAnswers.previousExperience, exp]});
                              } else {
                                setAssessmentAnswers({...assessmentAnswers, previousExperience: assessmentAnswers.previousExperience.filter(e => e !== exp)});
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-xs text-slate-700 dark:text-slate-300">{exp}</span>
                        </label>
                        ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-xl font-black text-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
                >
                  Complete Assessment
                </button>
              </form>
                            </div>
            )}
          </div>

          {financialAssessment ? (
            /* Assessment Results & Resources */
            <div className="space-y-6">
              {/* Stability Snapshot */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Stability Snapshot</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className={`p-4 rounded-xl border-2 ${
                    financialAssessment.stabilityLevel === 'Stable' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400' :
                    financialAssessment.stabilityLevel === 'Watch Closely' ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-400' :
                    'bg-red-50 dark:bg-red-900/30 border-red-400'
                  }`}>
                    <p className="text-xs font-black text-slate-600 dark:text-slate-400 mb-1">Stability Level</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{financialAssessment.stabilityLevel}</p>
                  </div>
                  <div className={`p-4 rounded-xl border-2 ${
                    financialAssessment.mobilityScore === 'High' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400' :
                    financialAssessment.mobilityScore === 'Medium' ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-400' :
                    'bg-red-50 dark:bg-red-900/30 border-red-400'
                  }`}>
                    <p className="text-xs font-black text-slate-600 dark:text-slate-400 mb-1">Mobility Score</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{financialAssessment.mobilityScore}</p>
                  </div>
                  <div className={`p-4 rounded-xl border-2 ${
                    financialAssessment.incomeFlexibility === 'High' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400' :
                    financialAssessment.incomeFlexibility === 'Medium' ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-400' :
                    'bg-red-50 dark:bg-red-900/30 border-red-400'
                  }`}>
                    <p className="text-xs font-black text-slate-600 dark:text-slate-400 mb-1">Income Flexibility</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{financialAssessment.incomeFlexibility}</p>
                  </div>
                  <div className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <p className="text-xs font-black text-slate-600 dark:text-slate-400 mb-1">Primary Constraint</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{financialAssessment.primaryConstraint}</p>
                  </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border-l-4 border-emerald-500">
                  <p className="text-sm font-black text-emerald-900 dark:text-emerald-300 mb-1">Insight:</p>
                  <p className="text-sm text-emerald-800 dark:text-emerald-400 italic">{financialAssessment.insight}</p>
                </div>
                <button
                  onClick={() => {
                    setFinancialAssessment(null);
                    setShowAssessment(false);
                  }}
                  className="mt-4 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Retake Assessment
                </button>
              </div>

              {/* Suggested Resources Based on Assessment */}
              {financialAssessment.suggestedResources && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Recommended Resources</h3>
                  <div className="space-y-4">
                    {financialAssessment.suggestedResources.assistance.length > 0 && (
                            <div>
                        <h4 className="text-base font-black text-emerald-900 dark:text-emerald-300 mb-3">💚 Assistance Resources</h4>
                        <div className="space-y-2">
                          {financialAssessment.suggestedResources.assistance.map((resource: any, idx: number) => (
                            <div key={idx} className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                              <p className="text-sm font-black text-emerald-900 dark:text-emerald-300">{resource.title}</p>
                              <p className="text-xs text-emerald-800 dark:text-emerald-400">{resource.category}</p>
                              {resource.link.startsWith('http') && (
                                <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">Visit Resource →</a>
                              )}
                            </div>
                          ))}
                        </div>
                    </div>
                    )}
                    {financialAssessment.suggestedResources.unemployment.length > 0 && (
                      <div>
                        <h4 className="text-base font-black text-blue-900 dark:text-blue-300 mb-3">💼 Unemployment Resources</h4>
                        <div className="space-y-2">
                          {financialAssessment.suggestedResources.unemployment.map((resource: any, idx: number) => (
                            <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                              <p className="text-sm font-black text-blue-900 dark:text-blue-300">{resource.title}</p>
                              <p className="text-xs text-blue-800 dark:text-blue-400">{resource.category}</p>
                            </div>
                        ))}
                    </div>
            </div>
                    )}
                    {financialAssessment.suggestedResources.monetization.length > 0 && (
                      <div>
                        <h4 className="text-base font-black text-purple-900 dark:text-purple-300 mb-3">💎 Monetization Resources</h4>
                        <div className="space-y-2">
                          {financialAssessment.suggestedResources.monetization.map((resource: any, idx: number) => (
                            <div key={idx} className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                              <p className="text-sm font-black text-purple-900 dark:text-purple-300">{resource.title}</p>
                              <p className="text-xs text-purple-800 dark:text-purple-400">{resource.category}</p>
        </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {financialAssessment.suggestedResources.money.length > 0 && (
                      <div>
                        <h4 className="text-base font-black text-amber-900 dark:text-amber-300 mb-3">💰 Money / Gigs Resources</h4>
                        <div className="space-y-2">
                          {financialAssessment.suggestedResources.money.map((resource: any, idx: number) => (
                            <div key={idx} className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                              <p className="text-sm font-black text-amber-900 dark:text-amber-300">{resource.title}</p>
                              <p className="text-xs text-amber-800 dark:text-amber-400">{resource.category}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Financial Tips Section */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-white mb-1">💰 Practical Financial Tips</h3>
                      <p className="text-sm text-emerald-100">Short-term stabilization focus</p>
                    </div>
                    <button
                      onClick={() => setShowFinancialTips(!showFinancialTips)}
                      className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-black transition-colors border border-white/30"
                    >
                      {showFinancialTips ? '▲ Hide' : '▼ Show'} Tips
                    </button>
                  </div>
                </div>
                
                {showFinancialTips && (
                  <div className="p-6 space-y-4">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border-l-4 border-emerald-500">
                      <p className="text-sm font-black text-emerald-900 dark:text-emerald-300 mb-2">Prioritize cash flow over optimization</p>
                      <p className="text-xs text-emerald-800 dark:text-emerald-400">Right now, getting money in the door matters more than perfect budgeting. Focus on income first.</p>
                            </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border-l-4 border-emerald-500">
                      <p className="text-sm font-black text-emerald-900 dark:text-emerald-300 mb-2">Why stability beats perfection</p>
                      <p className="text-xs text-emerald-800 dark:text-emerald-400">One reliable income stream is better than three speculative ones. Build stability, then optimize.</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border-l-4 border-emerald-500">
                      <p className="text-sm font-black text-emerald-900 dark:text-emerald-300 mb-2">Avoid panic decisions</p>
                      <p className="text-xs text-emerald-800 dark:text-emerald-400">Urgency can lead to bad choices. Take a breath, assess options, then act deliberately.</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border-l-4 border-emerald-500">
                      <p className="text-sm font-black text-emerald-900 dark:text-emerald-300 mb-2">Focus on income before career alignment (temporarily)</p>
                      <p className="text-xs text-emerald-800 dark:text-emerald-400">Short-term income does not define long-term direction. Cash buys time. Time buys options.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Income Path Suggestions */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Income Path Suggestions</h3>
                <div className="space-y-4">
                  {/* Immediate Income */}
                            <div>
                    <h4 className="text-base font-black text-emerald-900 dark:text-emerald-300 mb-3">Immediate Income (0–14 days)</h4>
                    <div className="space-y-3">
                      {financialAssessment.answers.sellableItems.length > 0 && financialAssessment.answers.sellableItems[0] !== 'No' && (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700">
                          <p className="text-sm font-black text-emerald-900 dark:text-emerald-300 mb-1">Sell Items</p>
                          <p className="text-xs text-emerald-800 dark:text-emerald-400 mb-2">You have items you can sell. Use the Monetization tools in the app to list and sell quickly.</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Effort: Low | Links to: Monetization Resources</p>
                            </div>
                      )}
                      {financialAssessment.mobilityScore === 'High' && (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700">
                          <p className="text-sm font-black text-emerald-900 dark:text-emerald-300 mb-1">Delivery / Local Gigs</p>
                          <p className="text-xs text-emerald-800 dark:text-emerald-400 mb-2">With reliable transportation, delivery and local gig work can start immediately.</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Effort: Low | Links to: Job Hunter, Monetization Resources</p>
                        </div>
                      )}
                      {financialAssessment.answers.sellingComfort !== 'No' && (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700">
                          <p className="text-sm font-black text-emerald-900 dark:text-emerald-300 mb-1">Service Sales</p>
                          <p className="text-xs text-emerald-800 dark:text-emerald-400 mb-2">Your comfort with selling makes service-based income a strong option.</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Effort: Medium | Links to: Monetization Resources</p>
                        </div>
                      )}
                    </div>
                    </div>

                  {/* Short-Term Income */}
                  <div>
                    <h4 className="text-base font-black text-emerald-900 dark:text-emerald-300 mb-3">Short-Term Income (30–60 days)</h4>
                    <div className="space-y-3">
                      {financialAssessment.mobilityScore === 'Low' && financialAssessment.answers.skills.some(s => s.includes('Tech') || s.includes('Writing') || s.includes('Design')) && (
                        <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-700">
                          <p className="text-sm font-black text-teal-900 dark:text-teal-300 mb-1">Remote Work / Digital Services</p>
                          <p className="text-xs text-teal-800 dark:text-teal-400 mb-2">Your skills align with remote opportunities. No transportation needed.</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Effort: Medium | Links to: Job Hunter</p>
                            </div>
                        )}
                      {financialAssessment.answers.skills.some(s => s.includes('Creative') || s.includes('Design')) && (
                        <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-700">
                          <p className="text-sm font-black text-teal-900 dark:text-teal-300 mb-1">Creative Monetization</p>
                          <p className="text-xs text-teal-800 dark:text-teal-400 mb-2">Your creative skills can be monetized through the app's creator tools.</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Effort: Medium | Links to: Monetization Resources</p>
                        </div>
                      )}
                      <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-700">
                        <p className="text-sm font-black text-teal-900 dark:text-teal-300 mb-1">Job Applications</p>
                        <p className="text-xs text-teal-800 dark:text-teal-400 mb-2">Use Job Hunter to find and apply to positions matching your skills and constraints.</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Effort: Medium | Links to: Job Hunter</p>
                      </div>
                    </div>
                  </div>

                  {/* Skill-Based Income */}
                  {financialAssessment.answers.skills.length > 0 && (
                    <div>
                      <h4 className="text-base font-black text-emerald-900 dark:text-emerald-300 mb-3">Skill-Based Income</h4>
                      <div className="space-y-3">
                        {financialAssessment.answers.skills.map(skill => (
                          <div key={skill} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-black text-slate-900 dark:text-white mb-1">{skill}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">Explore opportunities in Job Hunter and Monetization Resources that match this skill.</p>
                          </div>
                                    ))}
                                </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Next-Step Financial Plan */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Next-Step Financial Plan</h3>
                <div className="space-y-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border-l-4 border-emerald-500">
                    <p className="text-sm font-black text-emerald-900 dark:text-emerald-300 mb-2">Next 7 Days</p>
                    <ul className="text-xs text-emerald-800 dark:text-emerald-400 space-y-1 ml-4 list-disc">
                      <li>Apply to {financialAssessment.mobilityScore === 'High' ? '2-3 delivery/gig opportunities' : '3-5 remote or local walkable opportunities'}</li>
                      <li>Complete setup for {financialAssessment.answers.sellableItems.length > 0 && financialAssessment.answers.sellableItems[0] !== 'No' ? 'selling items' : 'one income path'}</li>
                      <li>Review and organize your skills for quick application</li>
                    </ul>
                  </div>
                  <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl border-l-4 border-teal-500">
                    <p className="text-sm font-black text-teal-900 dark:text-teal-300 mb-2">30 Days</p>
                    <ul className="text-xs text-teal-800 dark:text-teal-400 space-y-1 ml-4 list-disc">
                      <li>Establish at least one consistent income source</li>
                      <li>Reduce primary financial pressure: {financialAssessment.answers.primaryPressure.join(', ') || 'None specified'}</li>
                      <li>Build a routine around your income generation</li>
                    </ul>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border-l-4 border-slate-400">
                    <p className="text-sm font-black text-slate-900 dark:text-white mb-2">60–90 Days</p>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 ml-4 list-disc">
                      <li>Improve income reliability and consistency</li>
                      <li>Transition toward better-fit work if applicable</li>
                      <li>Build multiple income streams if time allows</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 rounded-xl text-white mt-4">
                    <p className="text-sm font-black italic">This plan prioritizes stability first. Direction comes next.</p>
                  </div>
                </div>
              </div>

              {/* Financial Resources Cheat Sheet */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-white mb-1">📚 Financial Resources & Guides</h3>
                      <p className="text-sm text-emerald-100">Essential financial knowledge and tools</p>
                    </div>
                                        <button 
                      onClick={() => setShowFinancialResources(!showFinancialResources)}
                      className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-black transition-colors border border-white/30"
                                        >
                      {showFinancialResources ? '▲ Hide' : '▼ Show'} Resources
                    </button>
                                            </div>
                </div>
                
                {showFinancialResources && (
                  <div className="p-6 space-y-6">
                    {/* Common Financial Mistakes Section */}
                    <div className="border-2 border-amber-200 dark:border-amber-700 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedFinancialSection(expandedFinancialSection === 'mistakes' ? null : 'mistakes')}
                        className="w-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 p-4 flex items-center justify-between hover:from-amber-200 hover:to-orange-200 dark:hover:from-amber-900/40 dark:hover:to-orange-900/40 transition-colors"
                      >
                        <h4 className="text-lg font-black text-amber-900 dark:text-amber-300">⚠️ Common Financial Mistakes During Transitions</h4>
                        <span className="text-amber-600 dark:text-amber-400">{expandedFinancialSection === 'mistakes' ? '▲' : '▼'}</span>
                                        </button>
                      {expandedFinancialSection === 'mistakes' && (
                        <div className="p-4 bg-white dark:bg-slate-800 space-y-3">
                          <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-amber-900 dark:text-amber-300">Chasing too many income options at once:</strong> Spreading yourself thin across multiple opportunities can lead to burnout and missed deadlines. Focus on 2-3 solid paths first, then expand once you have momentum.</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-amber-900 dark:text-amber-300">Ignoring assistance out of pride:</strong> There's no shame in using available resources. Assistance programs exist to help people in transition. Your future self will thank you for accepting help now.</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-amber-900 dark:text-amber-300">Waiting too long to act:</strong> Financial situations rarely improve on their own. The longer you wait, the fewer options you'll have. Small actions today prevent bigger problems tomorrow.</p>
                        </div>
                      )}
                                </div>

                    {/* Section 1: Understanding Your Financial Situation */}
                    <div className="border-2 border-emerald-200 dark:border-emerald-700 rounded-xl overflow-hidden">
                                        <button 
                        onClick={() => setExpandedFinancialSection(expandedFinancialSection === 'situation' ? null : 'situation')}
                        className="w-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 p-4 flex items-center justify-between hover:from-emerald-200 hover:to-teal-200 dark:hover:from-emerald-900/40 dark:hover:to-teal-900/40 transition-colors"
                                        >
                        <h4 className="text-lg font-black text-emerald-900 dark:text-emerald-300">1. Understanding Your Financial Situation</h4>
                        <span className="text-emerald-600 dark:text-emerald-400">{expandedFinancialSection === 'situation' ? '▲' : '▼'}</span>
                                        </button>
                      {expandedFinancialSection === 'situation' && (
                        <div className="p-4 bg-white dark:bg-slate-800 space-y-3">
                          <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-emerald-900 dark:text-emerald-300">Know your numbers:</strong> Track income, expenses, and debts. Understanding what you have versus what you need is the foundation of financial stability.</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-emerald-900 dark:text-emerald-300">Prioritize essentials:</strong> Housing, food, utilities, and transportation come first. Everything else can wait.</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-emerald-900 dark:text-emerald-300">Identify your runway:</strong> How long can you survive on current resources? This determines urgency.</p>
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-black text-emerald-900 dark:text-emerald-300 mb-2">📚 Resources:</p>
                            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 ml-4 list-disc">
                              <li><a href="https://www.consumerfinance.gov/consumer-tools/money-as-you-grow/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">CFPB Money Management Tools</a></li>
                              <li><a href="https://www.mint.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Mint - Free Budgeting App</a></li>
                              <li><a href="https://www.youneedabudget.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">YNAB - Budgeting Method</a></li>
                              <li><a href="https://www.benefits.gov/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Benefits.gov - Government Benefits Finder</a></li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Section 2: Immediate Financial Actions */}
                    <div className="border-2 border-emerald-200 dark:border-emerald-700 rounded-xl overflow-hidden">
                                                <button 
                        onClick={() => setExpandedFinancialSection(expandedFinancialSection === 'actions' ? null : 'actions')}
                        className="w-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 p-4 flex items-center justify-between hover:from-emerald-200 hover:to-teal-200 dark:hover:from-emerald-900/40 dark:hover:to-teal-900/40 transition-colors"
                                                >
                        <h4 className="text-lg font-black text-emerald-900 dark:text-emerald-300">2. Immediate Financial Actions</h4>
                        <span className="text-emerald-600 dark:text-emerald-400">{expandedFinancialSection === 'actions' ? '▲' : '▼'}</span>
                                                </button>
                      {expandedFinancialSection === 'actions' && (
                        <div className="p-4 bg-white dark:bg-slate-800 space-y-3">
                          <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-emerald-900 dark:text-emerald-300">Apply for assistance programs:</strong> SNAP, LIHEAP, rental assistance, and Medicaid can provide immediate relief. Don't wait.</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-emerald-900 dark:text-emerald-300">Contact creditors:</strong> Many companies offer hardship programs, payment plans, or temporary deferrals. Ask before you default.</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-emerald-900 dark:text-emerald-300">File for unemployment:</strong> If you were laid off, file immediately. Benefits are retroactive to your application date.</p>
                          <p className="text-xs text-amber-700 dark:text-amber-400 italic"><strong>Common mistake:</strong> Waiting until you're desperate to seek help. Apply for assistance programs as soon as you need them.</p>
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-black text-emerald-900 dark:text-emerald-300 mb-2">📚 Resources:</p>
                            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 ml-4 list-disc">
                              <li><a href="https://www.fns.usda.gov/snap/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">SNAP (Food Stamps) Application</a></li>
                              <li><a href="https://www.benefits.gov/benefit/623" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">LIHEAP Energy Assistance</a></li>
                              <li><a href="https://www.consumerfinance.gov/renthelp" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Emergency Rental Assistance</a></li>
                              <li><a href="https://www.211.org/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">211.org - Local Resource Finder</a></li>
                              <li><a href="https://www.medicaid.gov/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Medicaid & CHIP</a></li>
                              <li><a href="https://www.healthcare.gov/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">HealthCare.gov - Insurance Marketplace</a></li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Section 3: Building Income Streams */}
                    <div className="border-2 border-emerald-200 dark:border-emerald-700 rounded-xl overflow-hidden">
                                                <button 
                        onClick={() => setExpandedFinancialSection(expandedFinancialSection === 'income' ? null : 'income')}
                        className="w-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 p-4 flex items-center justify-between hover:from-emerald-200 hover:to-teal-200 dark:hover:from-emerald-900/40 dark:hover:to-teal-900/40 transition-colors"
                                                >
                        <h4 className="text-lg font-black text-emerald-900 dark:text-emerald-300">3. Building Income Streams</h4>
                        <span className="text-emerald-600 dark:text-emerald-400">{expandedFinancialSection === 'income' ? '▲' : '▼'}</span>
                                                </button>
                      {expandedFinancialSection === 'income' && (
                        <div className="p-4 bg-white dark:bg-slate-800 space-y-3">
                          <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-emerald-900 dark:text-emerald-300">Start with what you have:</strong> Sell unused items, monetize existing skills, take on gig work. Every dollar counts.</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-emerald-900 dark:text-emerald-300">Match opportunities to constraints:</strong> No car? Focus on remote work. Limited time? Prioritize high-value gigs.</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-emerald-900 dark:text-emerald-300">Diversify when possible:</strong> One income source is vulnerable. Two or three provide stability.</p>
                          <p className="text-xs text-amber-700 dark:text-amber-400 italic"><strong>Common mistake:</strong> Waiting for the perfect opportunity. Take available work now, optimize later.</p>
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-black text-emerald-900 dark:text-emerald-300 mb-2">📚 Resources:</p>
                            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 ml-4 list-disc">
                              <li><a href="https://www.doordash.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">DoorDash - Food Delivery</a></li>
                              <li><a href="https://www.uber.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Uber - Rideshare & Delivery</a></li>
                              <li><a href="https://www.instacart.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Instacart - Grocery Delivery</a></li>
                              <li><a href="https://remote.co/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Remote.co - Remote Jobs</a></li>
                              <li><a href="https://www.flexjobs.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">FlexJobs - Flexible Work</a></li>
                              <li><a href="https://www.upwork.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Upwork - Freelance Work</a></li>
                              <li><a href="https://www.fiverr.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Fiverr - Gig Services</a></li>
                              <li><a href="https://www.facebook.com/marketplace/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Facebook Marketplace - Sell Items</a></li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Section 4: Managing Financial Stress */}
                    <div className="border-2 border-emerald-200 dark:border-emerald-700 rounded-xl overflow-hidden">
                                                <button 
                        onClick={() => setExpandedFinancialSection(expandedFinancialSection === 'stress' ? null : 'stress')}
                        className="w-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 p-4 flex items-center justify-between hover:from-emerald-200 hover:to-teal-200 dark:hover:from-emerald-900/40 dark:hover:to-teal-900/40 transition-colors"
                                                >
                        <h4 className="text-lg font-black text-emerald-900 dark:text-emerald-300">4. Managing Financial Stress</h4>
                        <span className="text-emerald-600 dark:text-emerald-400">{expandedFinancialSection === 'stress' ? '▲' : '▼'}</span>
                                                </button>
                      {expandedFinancialSection === 'stress' && (
                        <div className="p-4 bg-white dark:bg-slate-800 space-y-3">
                          <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-emerald-900 dark:text-emerald-300">Focus on what you control:</strong> You can't control the economy, but you can control your actions. Take one step at a time.</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-emerald-900 dark:text-emerald-300">Avoid panic decisions:</strong> Financial stress can lead to bad choices. Breathe, assess, then act deliberately.</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-emerald-900 dark:text-emerald-300">Seek support:</strong> Talk to friends, family, or counselors. You don't have to handle this alone.</p>
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-black text-emerald-900 dark:text-emerald-300 mb-2">📚 Resources:</p>
                            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 ml-4 list-disc">
                              <li><a href="https://www.crisistextline.org/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Crisis Text Line - 24/7 Support</a></li>
                              <li><a href="https://www.nami.org/help" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">NAMI - Mental Health Support</a></li>
                              <li><a href="https://www.mentalhealth.gov/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">MentalHealth.gov - Resources</a></li>
                              <li><a href="https://www.debt.org/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Debt.org - Debt Management Help</a></li>
                            </ul>
                                            </div>
                                        </div>
                                    )}
                    </div>

                    {/* Section 5: Long-Term Financial Planning */}
                    <div className="border-2 border-emerald-200 dark:border-emerald-700 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedFinancialSection(expandedFinancialSection === 'planning' ? null : 'planning')}
                        className="w-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 p-4 flex items-center justify-between hover:from-emerald-200 hover:to-teal-200 dark:hover:from-emerald-900/40 dark:hover:to-teal-900/40 transition-colors"
                      >
                        <h4 className="text-lg font-black text-emerald-900 dark:text-emerald-300">5. Long-Term Financial Planning</h4>
                        <span className="text-emerald-600 dark:text-emerald-400">{expandedFinancialSection === 'planning' ? '▲' : '▼'}</span>
                      </button>
                      {expandedFinancialSection === 'planning' && (
                        <div className="p-4 bg-white dark:bg-slate-800 space-y-3">
                          <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-emerald-900 dark:text-emerald-300">Build an emergency fund:</strong> Once stable, save 1-3 months of expenses. This prevents future crises.</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-emerald-900 dark:text-emerald-300">Improve credit gradually:</strong> Pay bills on time, reduce debt, and monitor your credit report.</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-emerald-900 dark:text-emerald-300">Invest in skills:</strong> The best financial investment is increasing your earning potential through education and training.</p>
                          <p className="text-xs text-amber-700 dark:text-amber-400 italic"><strong>Common mistake:</strong> Trying to do everything at once. Focus on stability first, then optimization.</p>
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-black text-emerald-900 dark:text-emerald-300 mb-2">📚 Resources:</p>
                            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 ml-4 list-disc">
                              <li><a href="https://www.annualcreditreport.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">AnnualCreditReport.com - Free Credit Reports</a></li>
                              <li><a href="https://www.creditkarma.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Credit Karma - Credit Monitoring</a></li>
                              <li><a href="https://www.coursera.org/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Coursera - Free Online Courses</a></li>
                              <li><a href="https://www.khanacademy.org/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Khan Academy - Free Education</a></li>
                              <li><a href="https://www.edx.org/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">edX - Online Learning</a></li>
                              <li><a href="https://www.sba.gov/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">SBA - Small Business Resources</a></li>
                            </ul>
                                </div>
                            </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Mock Interview Section - Complete */}
        <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-[2.5rem] p-8 md:p-12 border-2 border-purple-200 dark:border-purple-800 shadow-2xl">
          {/* Professional Interview Image */}
          <div className="mb-8 rounded-2xl overflow-hidden shadow-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <img 
              src="/attached_assets/pexels-olly-3760072_1766521081828.jpg" 
              alt="Professional interview coaching session" 
              className="w-full h-48 md:h-64 object-cover"
            />
                            </div>

          {/* Section Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-2xl shadow-lg">
                🎤
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Mock Interview</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Practice with AI interviewer, get scored feedback, and improve your answers</p>
              </div>
            </div>
          </div>

          {/* Resume Selector */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-200 dark:border-slate-700 shadow-md">
            <label className="block text-sm font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="text-lg">📄</span> Active Resume for Interview Practice
            </label>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              The AI interviewer will reference your resume during the interview. Select a resume to update the context.
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
                }
              }}
              className="w-full pl-4 py-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none shadow-sm font-medium"
            >
              <option value="">
                {currentResumeData
                  ? `${savedResumes.find(r => r.id === currentResumeData.id)?.name || 'Current Resume'} - Active`
                  : 'Select a resume to base interview practice on...'}
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
            {currentResumeData && selectedResumeId && (
              <p className="mt-4 text-sm text-purple-600 dark:text-purple-400 font-bold flex items-center gap-2">
                <span>✓</span> Interview practice is actively using: {savedResumes.find(r => r.id === selectedResumeId)?.name || 'Current Resume'}
              </p>
            )}
          </div>

          {/* Start Interview Options */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-200 dark:border-slate-700 shadow-md">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Start Interview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => startInterview('quick', 1)}
                className="p-6 bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-2xl hover:from-brand-700 hover:to-brand-800 transition-all shadow-lg text-left group transform hover:scale-[1.02]"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">⚡</div>
                <h4 className="text-xl font-black mb-2">Quick Mock</h4>
                <p className="text-sm opacity-90">Assessment A: Round 1 (6 questions)</p>
              </button>
              
              <button
                onClick={() => startInterview('full')}
                className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-2xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg text-left group transform hover:scale-[1.02]"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🎯</div>
                <h4 className="text-xl font-black mb-2">Full Mock</h4>
                <p className="text-sm opacity-90">All 4 rounds (24 questions total)</p>
              </button>
              
              <button
                onClick={() => {
                  const round = parseInt(prompt('Enter round number (1-4):') || '1') as InterviewRound;
                  if (round >= 1 && round <= 4) {
                    startInterview('round', round);
                  }
                }}
                className="p-6 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg text-left group transform hover:scale-[1.02]"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📋</div>
                <h4 className="text-xl font-black mb-2">Choose Round</h4>
                <p className="text-sm opacity-90">Select Round 1, 2, 3, or 4</p>
              </button>
                                    </div>
          </div>

          {/* Settings Row */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-200 dark:border-slate-700 shadow-md">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-black text-slate-900 dark:text-white block mb-1">Voice Output</label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">The interviewer will speak questions aloud</p>
                </div>
                <button 
                  onClick={() => setVoiceOutputEnabled(!voiceOutputEnabled)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    voiceOutputEnabled ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    voiceOutputEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-black text-slate-900 dark:text-white block mb-1">Input Mode</label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">How you'll respond to questions</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setInputMode('voice')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      inputMode === 'voice'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🎙️ Voice
                  </button>
                  <button 
                    onClick={() => setInputMode('text')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      inputMode === 'text'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    ⌨️ Text
                  </button>
                </div>
              </div>
                                    </div>
                                </div>
                                
          {/* Quick Reference Guide */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 border-2 border-purple-200 dark:border-purple-700 shadow-md">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span>📋</span> Quick Reference Guide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tell me about yourself */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-800 p-4 rounded-xl border-l-4 border-blue-500">
                <h4 className="font-black text-blue-900 dark:text-blue-300 text-sm mb-2">"Tell me about yourself"</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">What they're asking: Can you summarize your background and connect it to this role?</p>
                <div className="bg-white dark:bg-slate-900 p-2 rounded text-xs">
                  <strong className="text-blue-800 dark:text-blue-400">Framework:</strong> Present → Past → Future
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded mt-2 text-xs italic text-slate-600 dark:text-slate-400">
                  <strong>Example:</strong> "I'm a [current role] focused on [key skill]. Previously, I [relevant experience]. I'm interested in this role because [connection]."
                </div>
              </div>

              {/* Why this role/company */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-800 p-4 rounded-xl border-l-4 border-purple-500">
                <h4 className="font-black text-purple-900 dark:text-purple-300 text-sm mb-2">"Why this role / why this company"</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">What they're asking: Did you research us? Do you understand what we do?</p>
                <div className="bg-white dark:bg-slate-900 p-2 rounded text-xs">
                  <strong className="text-purple-800 dark:text-purple-400">Framework:</strong> Company detail → Experience → Mutual fit
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded mt-2 text-xs italic text-slate-600 dark:text-slate-400">
                  <strong>Example:</strong> "I noticed [specific company initiative]. In my role at [company], I [relevant experience]. I'm excited to [contribution]."
                </div>
              </div>

              {/* Behavioral questions */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 p-4 rounded-xl border-l-4 border-indigo-500">
                <h4 className="font-black text-indigo-900 dark:text-indigo-300 text-sm mb-2">Behavioral questions <span className="text-xs">("Tell me about a time...")</span></h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">What they're asking: Can you demonstrate specific skills through past examples?</p>
                <div className="bg-white dark:bg-slate-900 p-2 rounded text-xs">
                  <strong className="text-indigo-800 dark:text-indigo-400">Framework:</strong> STAR (Situation, Task, Action, Result)
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded mt-2 text-xs italic text-amber-800 dark:text-amber-400">
                  <strong>Tip:</strong> Keep answers 60-120 seconds. Lead with relevance, not chronology.
                </div>
              </div>

              {/* Conflict and mistakes */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-700 dark:to-slate-800 p-4 rounded-xl border-l-4 border-red-500">
                <h4 className="font-black text-red-900 dark:text-red-300 text-sm mb-2">Conflict and mistake questions</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">What they're asking: How do you handle difficult situations? Can you take responsibility?</p>
                <div className="bg-white dark:bg-slate-900 p-2 rounded text-xs">
                  <strong className="text-red-800 dark:text-red-400">Framework:</strong> Acknowledge → Context → Learning → Growth
                </div>
              </div>

              {/* Strengths */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-700 dark:to-slate-800 p-4 rounded-xl border-l-4 border-emerald-500">
                <h4 className="font-black text-emerald-900 dark:text-emerald-300 text-sm mb-2">Strengths and accomplishments</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">What they're asking: What are you actually good at? Can you prove it?</p>
                <div className="bg-white dark:bg-slate-900 p-2 rounded text-xs">
                  <strong className="text-emerald-800 dark:text-emerald-400">Framework:</strong> Name strength → Evidence → Connect to role
                </div>
              </div>

              {/* Future questions */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-slate-700 dark:to-slate-800 p-4 rounded-xl border-l-4 border-amber-500">
                <h4 className="font-black text-amber-900 dark:text-amber-300 text-sm mb-2">Future-oriented questions <span className="text-xs">("Where do you see yourself...")</span></h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">What they're asking: Are you committed? Will you stay?</p>
                <div className="bg-white dark:bg-slate-900 p-2 rounded text-xs">
                  <strong className="text-amber-800 dark:text-amber-400">Framework:</strong> Growth trajectory → Company → Long-term thinking
                </div>
                </div>
            </div>
          </div>

          {/* Interview Cheat Sheet - At Bottom */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">📚 Interview Cheat Sheet</h3>
                  <p className="text-sm text-indigo-100">Expert tips and frameworks to ace your interview</p>
                </div>
                <button
                  onClick={() => setShowCheatSheet(!showCheatSheet)}
                  className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-black transition-colors border border-white/30"
                >
                  {showCheatSheet ? '▲ Hide' : '▼ Show'} Tips
                </button>
                </div>
            </div>

          {showCheatSheet && (
            <div className="p-6 space-y-4">
              {/* Section 1: How Interviewers Evaluate Answers */}
              <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
                <button
                  onClick={() => setExpandedSection(expandedSection === '1' ? null : '1')}
                  className="w-full px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-left flex items-center justify-between hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  <span className="text-lg font-black">1. How Interviewers Evaluate Answers</span>
                  <span className="text-2xl font-bold">{expandedSection === '1' ? '−' : '+'}</span>
                </button>
                {expandedSection === '1' && (
                  <div className="p-6 space-y-5 text-base">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      Interviewers are <strong className="text-blue-700 dark:text-blue-400">pattern matching</strong>, not memorizing answers. They listen for:
                    </p>
                    <ul className="space-y-3 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-black text-lg">•</span>
                        <span className="text-slate-700 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">Clarity of thought</strong> — Can you explain complex ideas simply?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-black text-lg">•</span>
                        <span className="text-slate-700 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">Ownership</strong> — <em className="text-blue-700 dark:text-blue-400">"I did"</em> not <em className="text-slate-500">"we did"</em></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-black text-lg">•</span>
                        <span className="text-slate-700 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">Decision-making under pressure</strong> — How you handle ambiguity</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-black text-lg">•</span>
                        <span className="text-slate-700 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">Ability to explain impact</strong> — What actually changed?</span>
                      </li>
                    </ul>
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border-2 border-blue-200 dark:border-blue-700">
                      <p className="text-lg font-black text-blue-900 dark:text-blue-300 mb-3">What a strong answer usually includes:</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                          <strong className="text-blue-800 dark:text-blue-300 text-sm">Context</strong>
                          <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1">What was happening</p>
                                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                          <strong className="text-blue-800 dark:text-blue-300 text-sm">Action</strong>
                          <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1">What <em>you</em> did</p>
                                    </div>
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                          <strong className="text-blue-800 dark:text-blue-300 text-sm">Outcome</strong>
                          <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1">What changed</p>
                                            </div>
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                          <strong className="text-blue-800 dark:text-blue-300 text-sm">Reflection</strong>
                          <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1">What you learned</p>
                                    </div>
                      </div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border-l-4 border-amber-500">
                      <p className="text-sm text-amber-900 dark:text-amber-300 italic"><strong>Note:</strong> Most candidates fail by being too vague, too long, too generic, or afraid to claim ownership.</p>
                    </div>
                  </div>
                )}
                                </div>

              {/* Section 2: How to Answer Common Interview Questions */}
              <div className="border-2 border-purple-200 dark:border-purple-800 rounded-xl overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-900">
                <button
                  onClick={() => setExpandedSection(expandedSection === '2' ? null : '2')}
                  className="w-full px-6 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-left flex items-center justify-between hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  <span className="text-lg font-black">2. How to Answer Common Interview Questions</span>
                  <span className="text-2xl font-bold">{expandedSection === '2' ? '−' : '+'}</span>
                </button>
                {expandedSection === '2' && (
                  <div className="p-6 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 border-purple-500">
                      <h4 className="text-lg font-black text-purple-900 dark:text-purple-300 mb-3">"Tell me about yourself"</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3"><strong className="text-slate-900 dark:text-white">What they're asking:</strong> Can you summarize your background and connect it to this role?</p>
                      <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg mb-3">
                        <p className="text-sm font-black text-purple-800 dark:text-purple-300 mb-2">Framework:</p>
                        <p className="text-base text-purple-900 dark:text-purple-200 font-medium">Present → Past → Future <span className="text-xs text-slate-500">(or Future → Present → Past)</span></p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Example:</p>
                        <p className="text-sm italic text-slate-600 dark:text-slate-400">"I'm a <strong>[current role]</strong> focused on <strong>[key skill]</strong>. Previously, I <strong>[relevant experience]</strong>. I'm interested in this role because <strong>[connection]</strong>."</p>
                      </div>
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-2 border-red-400">
                        <p className="text-xs font-bold text-red-800 dark:text-red-400">Common mistake:</p>
                        <p className="text-xs text-red-700 dark:text-red-300 italic">Listing responsibilities instead of impact, or reciting your resume chronologically</p>
                      </div>
                </div>
                
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 border-pink-500">
                      <h4 className="text-lg font-black text-pink-900 dark:text-pink-300 mb-3">"Why this role / why this company"</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3"><strong className="text-slate-900 dark:text-white">What they're asking:</strong> Did you research us? Do you understand what we do?</p>
                      <div className="bg-pink-50 dark:bg-pink-900/30 p-4 rounded-lg mb-3">
                        <p className="text-sm font-black text-pink-800 dark:text-pink-300 mb-2">Framework:</p>
                        <p className="text-base text-pink-900 dark:text-pink-200 font-medium">Specific company detail → Your relevant experience → Mutual fit</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Example:</p>
                        <p className="text-sm italic text-slate-600 dark:text-slate-400">"I noticed <strong>[specific company initiative]</strong>. In my role at <strong>[company]</strong>, I <strong>[relevant experience]</strong>. I'm excited to <strong>[contribution]</strong>."</p>
                      </div>
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-2 border-red-400">
                        <p className="text-xs font-bold text-red-800 dark:text-red-400">Common mistake:</p>
                        <p className="text-xs text-red-700 dark:text-red-300 italic">Generic answers like "I want to grow" without showing you researched the company</p>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 border-indigo-500">
                      <h4 className="text-lg font-black text-indigo-900 dark:text-indigo-300 mb-3">Behavioral questions <span className="text-sm">("Tell me about a time...")</span></h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3"><strong className="text-slate-900 dark:text-white">What they're asking:</strong> Can you demonstrate specific skills through past examples?</p>
                      <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-3">
                        <p className="text-sm font-black text-indigo-800 dark:text-indigo-300 mb-2">Framework:</p>
                        <p className="text-base text-indigo-900 dark:text-indigo-200 font-medium">STAR <span className="text-xs">(Situation, Task, Action, Result)</span></p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border-l-2 border-amber-400">
                        <p className="text-xs italic text-amber-900 dark:text-amber-300"><strong>Tip:</strong> Keep answers 60-120 seconds. Lead with relevance, not chronology.</p>
                      </div>
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-2 border-red-400">
                        <p className="text-xs font-bold text-red-800 dark:text-red-400">Common mistake:</p>
                        <p className="text-xs text-red-700 dark:text-red-300 italic">Listing responsibilities instead of impact, or describing what happened without your specific actions</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2">Conflict & Mistakes</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">How you handle difficult situations?</p>
                        <p className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-3">Acknowledge → Context → Learning → Growth</p>
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-2 border-red-400">
                          <p className="text-xs font-bold text-red-800 dark:text-red-400">Common mistake:</p>
                          <p className="text-xs text-red-700 dark:text-red-300 italic">Blaming others or avoiding responsibility</p>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2">Strengths</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">What are you good at?</p>
                        <p className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-3">Name → Evidence → Connect</p>
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-2 border-red-400">
                          <p className="text-xs font-bold text-red-800 dark:text-red-400">Common mistake:</p>
                          <p className="text-xs text-red-700 dark:text-red-300 italic">Listing generic traits without proof or connection to the role</p>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2">Future Questions</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Are you committed?</p>
                        <p className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-3">Growth → Company → Long-term</p>
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-2 border-red-400">
                          <p className="text-xs font-bold text-red-800 dark:text-red-400">Common mistake:</p>
                          <p className="text-xs text-red-700 dark:text-red-300 italic">Saying you want this job forever without showing realistic career progression</p>
                        </div>
                      </div>
                    </div>
                            </div>
                        )}
                    </div>

              {/* Section 3: How to Master Interview Performance */}
              <div className="border-2 border-emerald-200 dark:border-emerald-800 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-900">
                <button
                  onClick={() => setExpandedSection(expandedSection === '3' ? null : '3')}
                  className="w-full px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-left flex items-center justify-between hover:from-emerald-700 hover:to-teal-700 transition-all"
                >
                  <span className="text-lg font-black">3. How to Master Interview Performance</span>
                  <span className="text-2xl font-bold">{expandedSection === '3' ? '−' : '+'}</span>
                </button>
                {expandedSection === '3' && (
                  <div className="p-6 space-y-5">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 border-emerald-500">
                      <h4 className="text-lg font-black text-emerald-900 dark:text-emerald-300 mb-4">Answer Length</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
                          <p className="text-xs font-black text-red-700 dark:text-red-400 mb-1">Too Short</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">&lt; 30 sec</p>
                          <p className="text-xs italic text-red-600 dark:text-red-400 mt-2">Haven't thought deeply</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-lg text-center border-2 border-emerald-400">
                          <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 mb-1">✓ Sweet Spot</p>
                          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">60-120 sec</p>
                          <p className="text-xs italic text-emerald-600 dark:text-emerald-400 mt-2">Perfect balance</p>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-center">
                          <p className="text-xs font-black text-amber-700 dark:text-amber-400 mb-1">Too Long</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">&gt; 2 min</p>
                          <p className="text-xs italic text-amber-600 dark:text-amber-400 mt-2">Loses attention</p>
                        </div>
                      </div>
                </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 border-teal-500">
                      <h4 className="text-lg font-black text-teal-900 dark:text-teal-300 mb-4">Speaking Techniques</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="text-teal-600 dark:text-teal-400 text-xl">💭</span>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">Pause before answering</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 italic">"That's a good question — let me think for a second" is professional</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-teal-600 dark:text-teal-400 text-xl">🗣️</span>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">Speak in complete thoughts</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 italic">Finish sentences, avoid trailing off</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-teal-600 dark:text-teal-400 text-xl">🔇</span>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">Avoid filler</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 italic">Reduce "um", "like", "you know" — <strong>silence is better than filler</strong></p>
                          </div>
                            </div>
                        <div className="flex items-start gap-3">
                          <span className="text-teal-600 dark:text-teal-400 text-xl">🧘</span>
                            <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">Stay calm under pressure</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 italic">If you don't know something, say so and explain how you'd find out</p>
                            </div>
                        </div>
                    </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 border-blue-500">
                      <h4 className="text-lg font-black text-blue-900 dark:text-blue-300 mb-4">Recovery Strategies</h4>
                      <div className="space-y-3">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <p className="text-xs font-black text-blue-800 dark:text-blue-400 mb-1">Bad answer?</p>
                          <p className="text-sm italic text-blue-700 dark:text-blue-300">"Let me reframe that" or "Actually, a better example would be..."</p>
                            </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <p className="text-xs font-black text-blue-800 dark:text-blue-400 mb-1">Confused?</p>
                          <p className="text-sm italic text-blue-700 dark:text-blue-300">"Could you clarify what you mean by <strong>[term]</strong>?"</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <p className="text-xs font-black text-blue-800 dark:text-blue-400 mb-1">Need time?</p>
                          <p className="text-sm italic text-blue-700 dark:text-blue-300">"That's a good question — let me think for a second"</p>
                            </div>
                        </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 4: What to Ask the Interviewer */}
              <div className="border-2 border-amber-200 dark:border-amber-800 rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-slate-800 dark:to-slate-900">
                <button
                  onClick={() => setExpandedSection(expandedSection === '4' ? null : '4')}
                  className="w-full px-6 py-5 bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 text-white text-left flex items-center justify-between hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700 transition-all"
                >
                  <span className="text-lg font-black">4. What to Ask the Interviewer <span className="text-2xl">⭐</span></span>
                  <span className="text-2xl font-bold">{expandedSection === '4' ? '−' : '+'}</span>
                </button>
                {expandedSection === '4' && (
                  <div className="p-6 space-y-6">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-5 rounded-xl text-white shadow-lg">
                      <p className="text-lg font-black mb-2">Why this matters:</p>
                      <p className="text-sm leading-relaxed">Interviewers <strong>expect</strong> questions. Smart questions signal <em>preparation</em>, <em>curiosity</em>, and <em>long-term thinking</em>. <strong>Bad questions are worse than no questions.</strong></p>
                    </div>
                    
                    {/* This Question Can Win the Interview - Callout Box */}
                    <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 p-6 rounded-2xl shadow-2xl border-2 border-purple-400">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🟣</span>
                        <h3 className="text-2xl font-black text-white">This Question Can Win the Interview</h3>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl mb-4 border border-white/20">
                        <p className="text-sm font-black text-white mb-2">Why it matters:</p>
                        <p className="text-sm text-purple-100 leading-relaxed">
                          The questions you ask at the end of an interview can be the difference between getting the job and being passed over. Elite questions demonstrate <strong>strategic thinking</strong>, show you've done your research, and position you as a <strong>collaborator</strong> rather than just a candidate. They can surface objections early, build rapport, and leave a lasting positive impression.
                        </p>
                      </div>
                      <div className="space-y-3 mb-4">
                        <p className="text-sm font-black text-white mb-2">Elite Questions to Ask:</p>
                        <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                          <p className="text-sm italic text-white">"You've been here for a few years — what do you wish you'd known before starting?"</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                          <p className="text-sm italic text-white">"What differentiates someone who's good at this role from someone who excels?"</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                          <p className="text-sm italic text-white">"What challenges is the team currently trying to solve?"</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                          <p className="text-sm italic text-white">"What does success look like 90 days in?"</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                          <p className="text-sm italic text-white">"Is there anything in my background that gives you pause?"</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                          <p className="text-sm italic text-white">"What would make someone a clear yes for this role?"</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                          <p className="text-sm italic text-white">"How does this team measure success, and what does that look like in practice?"</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                          <p className="text-sm italic text-white">"What surprised you most about working here, and how has that shaped your perspective?"</p>
                        </div>
                      </div>
                      <div className="bg-red-500/30 backdrop-blur-sm p-4 rounded-xl border-2 border-red-400/50">
                        <p className="text-sm font-black text-white mb-2 flex items-center gap-2">⚠️ Warning About Bad Questions:</p>
                        <p className="text-sm text-red-100 leading-relaxed">
                          Avoid questions that show you haven't researched the company, focus only on what you'll get (salary, benefits, time off), or can be answered by a quick Google search. Bad questions signal <strong>lack of preparation</strong> and <strong>self-centeredness</strong>. Examples to avoid: "What does this company do?", "How much vacation time do I get?", "What's the salary range?" (unless invited to ask).
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 border-blue-500">
                      <h4 className="text-lg font-black text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                        <span className="text-blue-600">A.</span> Role Insight Questions
                      </h4>
                      <div className="space-y-3 mb-3">
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                          <p className="text-sm italic text-blue-900 dark:text-blue-300">"What do you wish you had known about this role before you started?"</p>
                            </div>
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                          <p className="text-sm italic text-blue-900 dark:text-blue-300">"What does success look like in the first 6 months?"</p>
                            </div>
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                          <p className="text-sm italic text-blue-900 dark:text-blue-300">"What are the biggest challenges someone in this role will face?"</p>
                        </div>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-400 italic font-medium">💡 They show foresight and shift the conversation from evaluation to collaboration.</p>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 border-purple-500">
                      <h4 className="text-lg font-black text-purple-900 dark:text-purple-300 mb-3 flex items-center gap-2">
                        <span className="text-purple-600">B.</span> Interviewer Perspective Questions
                      </h4>
                      <div className="space-y-3 mb-3">
                        <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                          <p className="text-sm italic text-purple-900 dark:text-purple-300">"You've been here for a few years — what's kept you here?"</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                          <p className="text-sm italic text-purple-900 dark:text-purple-300">"What surprised you most about working here?"</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                          <p className="text-sm italic text-purple-900 dark:text-purple-300">"What does someone need to do to really stand out on this team?"</p>
                        </div>
                      </div>
                      <p className="text-xs text-purple-700 dark:text-purple-400 italic font-medium">💡 They build rapport and show you're paying attention to <em>them</em>, not just the job.</p>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 border-indigo-500">
                      <h4 className="text-lg font-black text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
                        <span className="text-indigo-600">C.</span> Team & Culture Questions
                      </h4>
                      <div className="space-y-3 mb-3">
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                          <p className="text-sm italic text-indigo-900 dark:text-indigo-300">"How does the team handle feedback?"</p>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                          <p className="text-sm italic text-indigo-900 dark:text-indigo-300">"How are decisions typically made?"</p>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                          <p className="text-sm italic text-indigo-900 dark:text-indigo-300">"How does this team support growth?"</p>
            </div>
        </div>
                      <p className="text-xs text-indigo-700 dark:text-indigo-400 italic font-medium">💡 They help you evaluate fit and signal maturity, not desperation.</p>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 border-orange-500">
                      <h4 className="text-lg font-black text-orange-900 dark:text-orange-300 mb-3 flex items-center gap-2">
                        <span className="text-orange-600">D.</span> Closing Questions <span className="text-sm">(Power Moves)</span>
                      </h4>
                      <div className="space-y-3 mb-3">
                        <div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-lg border border-orange-200 dark:border-orange-700">
                          <p className="text-sm italic text-orange-900 dark:text-orange-300">"Is there anything about my background that gives you hesitation?"</p>
                            </div>
                        <div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-lg border border-orange-200 dark:border-orange-700">
                          <p className="text-sm italic text-orange-900 dark:text-orange-300">"What would be the next steps after this conversation?"</p>
                            </div>
                        <div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-lg border border-orange-200 dark:border-orange-700">
                          <p className="text-sm italic text-orange-900 dark:text-orange-300">"What would make someone a clear yes for this role?"</p>
                        </div>
                      </div>
                      <p className="text-xs text-orange-700 dark:text-orange-400 italic font-medium">💡 They demonstrate confidence and can surface objections early.</p>
                    </div>

                    <div className="bg-gradient-to-r from-red-500 to-amber-500 p-5 rounded-xl text-white shadow-lg">
                      <p className="text-lg font-black mb-2 flex items-center gap-2">⚠️ Warning</p>
                      <p className="text-sm font-medium">Never ask about salary/benefits in early interviews unless invited.</p>
                    </div>
                            </div>
                        )}
                                </div>
                                
              {/* Section 5: Additional Resources & Practice Tips */}
              <div className="border-2 border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-900">
                                        <button 
                  onClick={() => setExpandedSection(expandedSection === '5' ? null : '5')}
                  className="w-full px-6 py-5 bg-gradient-to-r from-slate-600 to-gray-600 text-white text-left flex items-center justify-between hover:from-slate-700 hover:to-gray-700 transition-all"
                >
                  <span className="text-lg font-black">5. Additional Resources & Practice Tips</span>
                  <span className="text-2xl font-bold">{expandedSection === '5' ? '−' : '+'}</span>
                </button>
                {expandedSection === '5' && (
                  <div className="p-6 space-y-5">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 border-indigo-500">
                      <h4 className="text-lg font-black text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
                        <span>📅</span> Practice Cadence
                      </h4>
                      <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2"><strong className="text-indigo-800 dark:text-indigo-400">Recommendation:</strong> <span className="font-bold text-indigo-900 dark:text-indigo-300">2-3 mock interviews per week</span> leading up to real interviews.</p>
                        <p className="text-xs italic text-indigo-700 dark:text-indigo-400">Space them out to allow for reflection and improvement.</p>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 border-blue-500">
                      <h4 className="text-lg font-black text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                        <span>🎥</span> Self-Review Techniques
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 dark:text-blue-400 font-black">✓</span>
                          <p className="text-sm text-slate-700 dark:text-slate-300">Record yourself answering common questions</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 dark:text-blue-400 font-black">✓</span>
                          <p className="text-sm text-slate-700 dark:text-slate-300">Listen for filler words, pacing, and clarity</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 dark:text-blue-400 font-black">✓</span>
                          <p className="text-sm text-slate-700 dark:text-slate-300">Time your answers — are they too short or too long?</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 border-purple-500">
                      <h4 className="text-lg font-black text-purple-900 dark:text-purple-300 mb-3 flex items-center gap-2">
                        <span>🧠</span> Tailoring Without Memorizing
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600 dark:text-purple-400 font-black">•</span>
                          <p className="text-sm text-slate-700 dark:text-slate-300">Memorize <strong className="text-purple-800 dark:text-purple-400">frameworks</strong>, not scripts</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600 dark:text-purple-400 font-black">•</span>
                          <p className="text-sm text-slate-700 dark:text-slate-300">Prepare <strong className="text-purple-800 dark:text-purple-400">3-5 behavioral stories</strong> that demonstrate different skills</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600 dark:text-purple-400 font-black">•</span>
                          <p className="text-sm text-slate-700 dark:text-slate-300">Practice adapting the same story to different questions</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 border-teal-500">
                      <h4 className="text-lg font-black text-teal-900 dark:text-teal-300 mb-3 flex items-center gap-2">
                        <span>📝</span> Using Notes
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">It's okay to have brief notes <em className="text-teal-700 dark:text-teal-400">(company name, key points)</em>, but avoid reading directly. <strong className="text-teal-800 dark:text-teal-400">Notes should be reminders, not scripts.</strong></p>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 border-emerald-500">
                      <h4 className="text-lg font-black text-emerald-900 dark:text-emerald-300 mb-3 flex items-center gap-2">
                        <span>📖</span> Practicing Behavioral Stories
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">Before interviews, write out <strong className="text-emerald-800 dark:text-emerald-400">3-5 STAR stories</strong> covering:</p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded text-center text-xs font-medium text-emerald-800 dark:text-emerald-400">Leadership</div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded text-center text-xs font-medium text-emerald-800 dark:text-emerald-400">Conflict</div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded text-center text-xs font-medium text-emerald-800 dark:text-emerald-400">Failure</div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded text-center text-xs font-medium text-emerald-800 dark:text-emerald-400">Achievement</div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded text-center text-xs font-medium text-emerald-800 dark:text-emerald-400">Teamwork</div>
                      </div>
                      <p className="text-xs italic text-emerald-700 dark:text-emerald-400">Practice telling them in <strong>60-90 seconds</strong>.</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-6 rounded-xl text-white shadow-lg">
                      <p className="text-xl font-black mb-2 italic">💡 Remember</p>
                      <p className="text-base leading-relaxed">The goal isn't <em>perfect</em> answers. It's <strong>clear thinking under pressure</strong>.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
                </div>
            </div>
        );
    };

  if (!session) {
    return renderStartScreen();
  }
  
  // Interview in progress
  const currentQuestion = session.questions[session.currentQuestionIndex];
  const isLastQuestion = session.currentQuestionIndex === session.questions.length - 1;
  
  const handleNextQuestion = () => {
    if (isLastQuestion) {
      // End interview - calculate final scores
      // TODO: Implement scoring logic
      setSession({ ...session, completed: true });
    } else {
      setSession({
        ...session,
        currentQuestionIndex: session.currentQuestionIndex + 1
      });
      
      // Speak next question
      const nextQuestion = session.questions[session.currentQuestionIndex + 1];
      if (nextQuestion) {
        speakText(nextQuestion.promptText);
      }
    }
  };

    return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black mb-2">Mock Interview</h2>
          <p className="text-slate-500">Question {session.currentQuestionIndex + 1} of {session.questions.length}</p>
                                    </div>
        <button
          onClick={() => setSession(null)}
          className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm font-bold"
        >
          Exit Interview
        </button>
                                </div>
                                
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="mb-6">
          <h3 className="text-xl font-black mb-4 text-slate-900 dark:text-white">
            {currentQuestion.promptText}
          </h3>
                                </div>

        <div className="space-y-4">
          {inputMode === 'voice' ? (
            <div className="space-y-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  isRecording
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-brand-600 text-white hover:bg-brand-700'
                }`}
              >
                {isRecording ? '⏹️ Stop Recording' : '🎙️ Start Recording'}
              </button>
              {currentTranscript && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Your transcript:</p>
                  <p className="text-slate-900 dark:text-white">{currentTranscript}</p>
                            </div>
                        )}
            </div>
          ) : (
            <textarea
              value={currentTranscript}
              onChange={(e) => setCurrentTranscript(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white min-h-[200px] focus:ring-2 focus:ring-brand-500 outline-none"
            />
          )}
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                // Save answer to current question
                const updatedQuestions = [...session.questions];
                updatedQuestions[session.currentQuestionIndex] = {
                  ...updatedQuestions[session.currentQuestionIndex],
                  userTranscript: currentTranscript,
                  responses: [
                    ...updatedQuestions[session.currentQuestionIndex].responses,
                    {
                      type: 'initial',
                      text: currentTranscript,
                      timestamp: new Date().toISOString()
                    }
                  ]
                };
                setSession({ ...session, questions: updatedQuestions });
                setCurrentTranscript('');
                handleNextQuestion();
              }}
              disabled={!currentTranscript.trim()}
              className="flex-1 px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLastQuestion ? 'Finish Interview' : 'Next Question →'}
            </button>
          </div>
                    </div>
                </div>
        </div>
    );
};
