
export interface FileData {
  base64: string;
  mimeType: string;
  name: string;
}

export enum AppView {
  HOME = 'HOME',
  UPLOAD = 'UPLOAD',
  RESUME = 'RESUME',
  JOBS = 'JOBS',
  MONEY = 'MONEY',
  MONETIZATION = 'MONETIZATION',
  UNEMPLOYMENT = 'UNEMPLOYMENT',
  ASSISTANCE = 'ASSISTANCE',
  FOUNDER = 'FOUNDER',
  PROFILE = 'PROFILE',
  COACH = 'COACH',
  SETTINGS = 'SETTINGS',
  FINANCIAL_ASSESSMENT = 'FINANCIAL_ASSESSMENT',
  DREAMSHIFT_ASSESSMENT = 'DREAMSHIFT_ASSESSMENT',
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  imageUrl?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  ethnicity?: string;
  veteranStatus?: 'veteran' | 'non-veteran' | 'prefer-not-to-say';
  disabilityStatus?: 'yes' | 'no' | 'prefer-not-to-say';
  jobStatus: 'employed' | 'unemployed' | 'self-employed' | 'student' | 'retired' | 'seeking';
  currentJobTitle?: string;
  currentCompany?: string;
  desiredJobTitle?: string;
  desiredSalary?: number;
  incomeGoal?: number;
  filingStatus?: 'single' | 'married' | 'head';
  createdAt: string;
  updatedAt: string;
}

export interface HubTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  category: 'job-search' | 'finances' | 'skills' | 'personal' | 'other';
  createdAt: string;
}

export interface HubReminder {
  id: string;
  title: string;
  datetime: string;
  recurring?: 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  createdAt: string;
}

export interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  recurring: boolean;
}

export interface CoachMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export type CoachType = 'career' | 'unemployment' | 'interview';

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
    snippet?: string;
  };
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  platform: string; 
  postedDate: string;
  applyUrl: string;
  ghostJobProbability: 'Low' | 'Medium' | 'High';
  glassdoorRating: string; 
  matchReason: string;
  matchScore: number;
  matchDetails?: string[]; // Detailed bullet points for AI match
}

export interface JobAlert {
  id: string;
  keywords: string;
  location: string;
  country: string;
  jobType: string;
  recency: string;
  createdAt: string;
  lastChecked?: string;
}

export type JobStatus = 'Interested' | 'Applied' | 'Interviewing' | 'Rejected';

export interface SavedJob extends JobListing {
  savedAt: string;
  status: JobStatus;
  reminderAt?: string; // ISO date string for when to remind
  reminderEnabled?: boolean;
}

export interface RecentSearch {
  id: string;
  keywords: string;
  location: string;
  country: string;
  jobType: string;
  timestamp: string;
}

export interface JobSearchResult {
  text: string;
  structuredJobs: JobListing[];
  groundingChunks: GroundingChunk[];
}

export interface StructuredResume {
  fullName: string;
  title: string;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  summary: string;
  skills: string[];
  software?: string[];
  certifications?: string[];
  awards?: string[];
  headshot?: string; 
  projects?: Array<{
    name: string;
    description: string;
    technologies?: string;
    link?: string;
  }>;
  experience: Array<{
    role: string;
    company: string;
    location?: string;
    dates: string;
    description: string[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    location?: string;
    dates?: string;
  }>;
  rawText?: string;
}

export interface ResumeRewriteResult {
  originalText: string;
  rewrittenText: string;
  structuredResume: StructuredResume;
  suggestions: string[];
  marketAnalysis?: string;
}

export interface FounderProfile {
  interests: string;
  skills: string;
  urgency: 'ASAP' | '30 days' | 'Long-term';
  tone: 'Professional' | 'Bold' | 'Minimal' | 'Tech' | 'Mysterious';
  industry?: string;
  includeWords?: string;
  nameStyle?: 'Auto' | 'Abstract' | 'Descriptive' | 'Compound' | 'Playful' | 'Minimal';
}

export interface BusinessNameIdea {
  name: string;
  domain: string;
  meaning: string;
  alternatives: string[];
  industryFit: string;
  availabilityStatus?: 'available' | 'taken' | 'unknown'; 
}

export interface FounderPlan {
  valueProp: string;
  elevatorPitch: string;
  tagline: string;
  story: string;
  monetization: string[];
  antiFocus: string; 
  checklist: Array<{ day: number; task: string; details: string; type: 'legal' | 'tech' | 'marketing' | 'sales' }>;
}

export interface SavedResume {
  id: string;
  name: string;
  data: ResumeRewriteResult;
  date: string;
}

export interface SavedFounderProject {
  id: string;
  name: string;
  idea: BusinessNameIdea;
  plan: FounderPlan;
  logoUrl?: string;
  profile: FounderProfile;
  date: string;
}

// Business Profile (New System)
export interface BusinessProfile {
  id: string;
  businessName: string;
  businessType: 'Product' | 'Service' | 'Content / Media' | 'Marketplace' | 'Other';
  soloOrTeam: 'Solo' | 'Team';
  stage: 'Idea only' | 'Pre-revenue' | 'First customers' | 'Active revenue';
  timeAvailablePerWeek: string;
  incomeUrgency: 'Immediate' | '30–60 days' | 'Long-term';
  existingAssets: string[]; // Skills, Audience, Email list, Portfolio, Capital, None
  targetCustomer?: string;
  problemBeingSolved?: string;
  pricingModel?: string;
  createdAt: string;
  updatedAt: string;
}

// 7-Day Roadmap
export interface RoadmapAssessment {
  primaryGoal: 'First dollar' | 'First customer' | 'Validate idea' | 'Build MVP';
  hoursPerDay: '<1' | '1–2' | '3–4' | '5+';
  comfortableTalkingToCustomers: 'Yes' | 'Some' | 'No';
  comfortableSellingDirectly: 'Yes' | 'Some' | 'No';
  whatWouldStopYou: 'Fear' | 'Time' | 'Skills' | 'Money' | 'Uncertainty';
}

export interface RoadmapDay {
  day: number;
  primaryTask: string;
  optionalTask?: string;
  timeEstimate: string;
}

export interface RoadmapResult {
  days: RoadmapDay[];
  pivotPlan: string;
}

// Pitch Builder
export interface PitchAssessment {
  pitchingTo: 'Customer' | 'Partner' | 'Employer' | 'Investor';
  pitchLength: '15 seconds' | '30 seconds' | '60 seconds';
  hardestToExplain: 'Problem' | 'Value' | 'Differentiation';
  speakingConfidence: 'High' | 'Medium' | 'Low';
}

export interface PitchResult {
  primaryPitch: string;
  simplerVersion: string;
  keyPoints: string[];
}

// Revenue Strategy
export interface RevenueAssessment {
  incomeTimeline: 'Now' | '30 days' | '90+ days';
  willingToSellTime: 'Yes' | 'Some' | 'No';
  willingToBuildOnceSellMany: 'Yes' | 'Some' | 'No';
  pricingComfort: 'Low ($)' | 'Medium ($$)' | 'High ($$$)';
  salesTolerance: 'Direct sales' | 'Inbound only' | 'Mixed';
  existingProof: 'Past clients' | 'Audience' | 'Case studies' | 'None';
}

export interface RevenuePath {
  type: 'Fastest Cash' | 'Sustainable Income' | 'Scalable / Long-Term';
  whatItIs: string;
  whyItFits: string;
  howToStart: string;
  timeline: string;
}

export interface RevenueStrategyResult {
  pathA: RevenuePath;
  pathB: RevenuePath;
  pathC: RevenuePath;
}

export interface FavoriteResource {
  id: string;
  title: string;
  link: string;
  category: 'money' | 'monetization' | 'unemployment';
  description: string;
  date: string;
}

export interface CareerProfile {
  situation: 'laid-off' | 'ending-soon' | 'active-search' | 'exit-planning' | 'burned-out' | 'exploring';
  incomeUrgency: 'immediate' | 'short-term' | 'medium-term' | 'stable';
  industry: string;
  recentRole: string;
  experienceYears: '0-2' | '3-5' | '6-10' | '10+';
  pathDescription: 'linear' | 'lateral' | 'frequent-pivots' | 'long-term' | 'nontraditional';
  topSkills: string[];
  enjoyedSkills: string[];
  marketStrongSkills: string[];
  energySources: string[]; 
  drainingWork: string;
  goalRoleType: 'similar' | 'adjacent' | 'major-change' | 'temporary';
  confidence: number; 
  stress: number; 
  motivation: number; 
  incomeStatus: 'none' | 'severance' | 'freelance' | 'full-time';
  riskComfort: 'very-low' | 'low' | 'moderate' | 'high';
  resumeReady: boolean;
  activelyApplying: boolean;
  lastInterviewDate: string;
  completedDate?: string;
}

export interface CoachScores {
  careerDirection: number; 
  resilience: number; 
  interviewReadiness: number; 
  financialPressure: number; 
  monetizationUrgency: number; 
  primaryCoach: CoachType;
}

// Mock Interview Types
export type InterviewMode = 'quick' | 'full' | 'round';
export type InterviewRound = 1 | 2 | 3 | 4;
export type InputMode = 'voice' | 'text';

export interface QuestionInstance {
  questionId: number;
  promptText: string;
  userTranscript: string; // Final combined answer including follow-ups
  responses: Array<{
    type: 'initial' | 'followup';
    text: string;
    timestamp: string;
  }>;
  scores: {
    structure: number; // 1-5
    specificity: number; // 1-5
    relevance: number; // 1-5
    clarity: number; // 1-5
  };
  totalScore: number; // 0-20
  feedbackBullets: string[];
  betterAnswerSkeleton?: string;
  followUpsAsked: number; // 0-2
}

export interface InterviewSession {
  id: string;
  userId?: string;
  createdAt: string;
  mode: InterviewMode;
  round: InterviewRound;
  currentQuestionIndex: number;
  questions: QuestionInstance[];
  overallScores: {
    structure: number;
    specificity: number;
    relevance: number;
    clarity: number;
    average: number;
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  completed: boolean;
  voiceOutputEnabled: boolean;
  inputMode: InputMode;
}

export interface CareerPathOption {
  title: string;
  description: string;
  matchScore: number;
  gapAnalysis: string[];
  nextSteps: string[];
}

export type ResumeFormData = {
  contact: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
  };
  summary: string;
  experience: Array<{
    jobTitle: string;
    company: string;
    dates: string;
    location?: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    dates: string;
  }>;
  skills: string[];
  certifications: string[];
  awards: string[];
};

export interface FinancialAssessment {
  id: string;
  stabilityLevel: 'Stable' | 'Watch Closely' | 'Immediate Action Needed';
  mobilityScore: 'High' | 'Medium' | 'Low';
  incomeFlexibility: 'High' | 'Medium' | 'Low';
  primaryConstraint: string;
  insight: string;
  answers: {
    employmentStatus: string;
    primaryPressure: string[];
    vehicleAccess: string;
    hasLicense: string;
    canTravel: string;
    skills: string[];
    sellingComfort: string;
    sellableItems: string[];
    hoursPerWeek: string;
    urgency: string;
    educationLevel: string;
    internetAccess: string;
    childcareNeeds: string;
    healthLimitations: string;
    previousExperience: string[];
  };
  suggestedResources: {
    assistance: Array<{ title: string; category: string; link: string }>;
    unemployment: Array<{ title: string; category: string; link: string }>;
    monetization: Array<{ title: string; category: string; link: string }>;
    money: Array<{ title: string; category: string; link: string }>;
  };
  financialPlan?: {
    next7Days: string[];
    next30Days: string[];
    next60to90Days: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export type ResourceCategory = 'assistance' | 'unemployment' | 'monetization' | 'money';
export type TaskPhase = 'immediate' | '30d' | '60d';
export type TaskStatus = 'not_started' | 'in_progress' | 'done';

export interface FinancialPlanTask {
  id: string;
  resourceId: string;
  resourceTitle: string;
  resourceCategory: ResourceCategory;
  resourceLink: string;
  status: TaskStatus;
  dueBy: string; // ISO date string
  notes?: string;
  phase: TaskPhase;
  order: number;
  why?: string; // Explanation for why this was recommended
  createdAt: string;
  updatedAt: string;
}

export interface FinancialPlan {
  id: string;
  assessmentId: string;
  userId?: string;
  lockedUntil: string | null; // ISO date string or null
  selectedResources: FinancialPlanTask[];
  savedResources: Array<{ resourceId: string; resourceTitle: string; resourceCategory: ResourceCategory; resourceLink: string; savedAt: string }>;
  dismissedResources: Array<{ resourceId: string; dismissedAt: string }>;
  createdAt: string;
  updatedAt: string;
}
// DreamShift Assessment Types
export type StrengthArchetype = 'The Explainer' | 'The Builder' | 'The Connector' | 'The Strategist' | 'The Organizer' | 'The Supporter';
export type TransitionStyle = 'Gradual Shift' | 'Hybrid Transition' | 'Strategic Leap';
export type PathType = 'immediate' | 'best-fit' | 'ideal';
export type IncomeTimeline = 'low' | 'medium' | 'delayed';
export type RiskLevel = 'low' | 'medium' | 'high';
export type EffortLevel = 'low' | 'medium' | 'high';

export interface DreamShiftPath {
  id: string;
  type: PathType;
  title: string;
  roleTitle: string; // Specific job title
  plainEnglishFit: string;
  whyThisFitsNow: string; // 1 sentence, constraint-based
  keySignals: {
    energyImpact: string;
    incomeTimeline: IncomeTimeline;
    riskLevel: RiskLevel;
    timeRequirement: string;
  };
  tldr: string;
  bestFor: string;
  watchOut: string;
  tradeoffs: string; // What you gain vs what you give up
  whyItFits: string[];
  firstSteps: Array<{
    description: string;
    timeEstimate: string;
    effortLevel: EffortLevel;
    resourceLink?: string;
  }>;
  recommendedResources: Array<{
    title: string;
    category: string;
    link: string;
    description?: string;
  }>;
}

export interface DreamShiftCard {
  primaryArchetype: StrengthArchetype;
  secondaryArchetype: StrengthArchetype;
  plainEnglishSummary: string;
  fulfillmentDrivers: string[];
  idealWorkEnvironment: {
    pace: string;
    autonomy: string;
    people: string;
    structure: string;
  };
  growthDirection: string[];
  transitionStyle: TransitionStyle;
  traits: string[];
  avoids: string[];
  thrivesIn: string[];
}

export interface DreamShiftAssessment {
  id: string;
  answers: {
    // Section A - Identity & Fulfillment
    energizedWhileWorking: string[];
    enjoyedPartsOfJobs: string[];
    drainsAtWork: string[];
    keepDoingWithoutNotice: string[];
    workPreference: string;
    peopleVsSolo: string;
    creativeVsStructured: string;
    missionVsMoney: string;
    autonomyVsGuidance: string;
    
    // Section B - Strengths & Transferable Skills
    askedForHelpWith: string[];
    explainEasily: string[];
    tasksFeelEasy: string[];
    skillsOutsideJobs: string[];
    naturalRoles: string[];
    
    // Section C - Values & Lifestyle
    stabilityVsFulfillment: number; // 0-100 slider
    flexibilityVsPredictability: number;
    teamVsIndependent: number;
    leadershipVsContribution: number;
    meaningVsIncome: number;
    
    // Section D - Transition Reality
    riskTolerance: string;
    timeAvailablePerWeek: string;
    willingnessToRetrain: string;
    financialPressure: string;
    desireForAutonomy: string;
    urgencyLevel: string;
    
    // Section E - Constraints & Specificity (NEW)
    priorityMattersMost: string; // Income stability / Career fulfillment / Skill growth
    realisticRiskTolerance: string; // Very low / Moderate / High
    incomeTimeline: string; // Immediately / 1-3 months / 3-6 months+
    skillsReliedOn: string[]; // Up to 3
    dailyEnjoyedSkill: string;
    drainsFastest: string;
    tolerableEnvironment: string;
    willingToLearnTools: string; // Yes / Some / No
    willingToBuildPortfolio: string; // Yes / Some / No
    willingToNetwork: string; // Yes / Some / No
  };
  card: DreamShiftCard;
  paths: DreamShiftPath[];
  createdAt: string;
  updatedAt: string;
}

