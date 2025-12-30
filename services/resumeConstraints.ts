import { StructuredResume } from '../types';

export interface ConstraintOptions {
  targetTitle?: string;
  maxSummaryWords?: number;
  maxSummaryChars?: number;
  maxSkills?: number;
  maxSoftware?: number;
  maxEducation?: number;
  maxBulletChars?: number;
  maxSkillChars?: number;
}

const DEFAULT_OPTIONS: Required<ConstraintOptions> = {
  targetTitle: '',
  maxSummaryWords: 70,
  maxSummaryChars: 450,
  maxSkills: 12,
  maxSoftware: 12,
  maxEducation: 2,
  maxBulletChars: 115,
  maxSkillChars: 24,
};

const FILLER_PHRASES = [
  'responsible for',
  'was responsible for',
  'duties included',
  'helped to',
  'assisted with',
  'worked on',
  'was involved in',
  'participated in',
  'in charge of',
  'tasked with',
  'various',
  'multiple',
  'numerous',
  'successfully',
  'effectively',
  'efficiently',
];

const STRONG_VERBS = [
  'Achieved', 'Accelerated', 'Accomplished', 'Administered', 'Analyzed',
  'Architected', 'Automated', 'Built', 'Championed', 'Collaborated',
  'Consolidated', 'Coordinated', 'Created', 'Decreased', 'Delivered',
  'Designed', 'Developed', 'Directed', 'Drove', 'Eliminated',
  'Engineered', 'Established', 'Exceeded', 'Executed', 'Expanded',
  'Generated', 'Grew', 'Headed', 'Identified', 'Implemented',
  'Improved', 'Increased', 'Initiated', 'Innovated', 'Integrated',
  'Launched', 'Led', 'Managed', 'Mentored', 'Modernized',
  'Negotiated', 'Optimized', 'Orchestrated', 'Oversaw', 'Pioneered',
  'Produced', 'Proposed', 'Reduced', 'Redesigned', 'Resolved',
  'Restructured', 'Revamped', 'Scaled', 'Spearheaded', 'Standardized',
  'Streamlined', 'Strengthened', 'Transformed', 'Upgraded',
];

function constrainSummary(summary: string, options: Required<ConstraintOptions>): string {
  if (!summary) return '';

  let constrained = summary
    .replace(/\s{2,}/g, ' ')
    .trim();

  const sentences = constrained.split(/(?<=[.!?])\s+/);
  const limitedSentences = sentences.slice(0, 3);
  constrained = limitedSentences.join(' ');

  if (constrained.length > options.maxSummaryChars) {
    constrained = constrained.substring(0, options.maxSummaryChars - 3).trim() + '...';
  }

  const words = constrained.split(/\s+/);
  if (words.length > options.maxSummaryWords) {
    constrained = words.slice(0, options.maxSummaryWords).join(' ');
    if (!constrained.endsWith('.')) {
      constrained += '.';
    }
  }

  return constrained;
}

function removeFiller(text: string): string {
  let result = text;
  for (const filler of FILLER_PHRASES) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    result = result.replace(regex, '');
  }
  return result.replace(/\s{2,}/g, ' ').trim();
}

function ensureStrongVerb(bullet: string): string {
  const trimmed = bullet.trim();
  
  const pronouns = /^(I|We|My|Our)\s+/i;
  let cleaned = trimmed.replace(pronouns, '');

  const firstWord = cleaned.split(/\s+/)[0];
  const isStrongVerb = STRONG_VERBS.some(v => 
    v.toLowerCase() === firstWord?.toLowerCase() || 
    v.toLowerCase() + 'd' === firstWord?.toLowerCase() ||
    v.toLowerCase() + 'ed' === firstWord?.toLowerCase()
  );

  if (!isStrongVerb && cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned;
}

function constrainBullet(bullet: string, maxChars: number): string {
  let constrained = removeFiller(bullet);
  constrained = ensureStrongVerb(constrained);

  if (constrained.length > maxChars) {
    const words = constrained.split(/\s+/);
    let result = '';
    for (const word of words) {
      if ((result + ' ' + word).trim().length <= maxChars - 3) {
        result = (result + ' ' + word).trim();
      } else {
        break;
      }
    }
    constrained = result.endsWith('.') ? result : result + '.';
  }

  return constrained;
}

function getBulletsPerRole(roleCount: number): number {
  if (roleCount <= 3) return 4;
  if (roleCount === 4) return 3;
  return 2;
}

function constrainExperience(
  experience: StructuredResume['experience'],
  options: Required<ConstraintOptions>
): StructuredResume['experience'] {
  const roleCount = experience.length;
  const bulletsPerRole = getBulletsPerRole(roleCount);

  return experience.map(exp => ({
    ...exp,
    description: exp.description
      .slice(0, bulletsPerRole)
      .map(bullet => constrainBullet(bullet, options.maxBulletChars)),
  }));
}

function constrainSkills(
  skills: string[],
  options: Required<ConstraintOptions>,
  targetTitle?: string
): string[] {
  const cleaned = skills
    .map(s => s.trim())
    .filter(s => s.length > 0 && s.length <= options.maxSkillChars)
    .map(s => s.length > options.maxSkillChars 
      ? s.substring(0, options.maxSkillChars - 2) + '..' 
      : s
    );

  const uniqueSkills: string[] = [];
  const lowerSet = new Set<string>();
  
  for (const skill of cleaned) {
    const lower = skill.toLowerCase().replace(/[-_\s]/g, '');
    if (!lowerSet.has(lower)) {
      lowerSet.add(lower);
      uniqueSkills.push(skill);
    }
  }

  return uniqueSkills.slice(0, options.maxSkills);
}

function constrainSoftware(
  software: string[] | undefined,
  options: Required<ConstraintOptions>
): string[] | undefined {
  if (!software || software.length === 0) return undefined;

  const cleaned = software
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const uniqueSoftware: string[] = [];
  const lowerSet = new Set<string>();
  
  for (const item of cleaned) {
    const lower = item.toLowerCase().replace(/[-_\s]/g, '');
    if (!lowerSet.has(lower)) {
      lowerSet.add(lower);
      uniqueSoftware.push(item);
    }
  }

  return uniqueSoftware.slice(0, options.maxSoftware);
}

function constrainEducation(
  education: StructuredResume['education'],
  options: Required<ConstraintOptions>
): StructuredResume['education'] {
  return education.slice(0, options.maxEducation).map(edu => ({
    ...edu,
    degree: edu.degree?.trim() || '',
    school: edu.school?.trim() || '',
  }));
}

export function applyResumeConstraints(
  resume: StructuredResume,
  options?: ConstraintOptions
): StructuredResume {
  const opts: Required<ConstraintOptions> = { ...DEFAULT_OPTIONS, ...options };

  return {
    ...resume,
    summary: constrainSummary(resume.summary, opts),
    experience: constrainExperience(resume.experience, opts),
    skills: constrainSkills(resume.skills, opts, opts.targetTitle),
    software: constrainSoftware(resume.software, opts),
    education: constrainEducation(resume.education, opts),
    certifications: resume.certifications?.slice(0, 5),
    awards: resume.awards?.slice(0, 5),
  };
}

export function getConstraintStats(resume: StructuredResume): {
  summaryWordCount: number;
  summaryCharCount: number;
  experienceCount: number;
  avgBulletsPerRole: number;
  skillCount: number;
  softwareCount: number;
  educationCount: number;
} {
  const summaryWords = resume.summary?.split(/\s+/).length || 0;
  const summaryChars = resume.summary?.length || 0;
  const expCount = resume.experience?.length || 0;
  const totalBullets = resume.experience?.reduce((sum, exp) => sum + (exp.description?.length || 0), 0) || 0;

  return {
    summaryWordCount: summaryWords,
    summaryCharCount: summaryChars,
    experienceCount: expCount,
    avgBulletsPerRole: expCount > 0 ? Math.round(totalBullets / expCount) : 0,
    skillCount: resume.skills?.length || 0,
    softwareCount: resume.software?.length || 0,
    educationCount: resume.education?.length || 0,
  };
}

export interface FitSettings {
  maxSkillsShown: number;
  maxBulletsPerRole: number;
  bulletMaxWords: number;
  summaryMaxWords: number;
  lineHeight: number;
  baseFontSize: number;
}

export const DEFAULT_FIT_SETTINGS: FitSettings = {
  maxSkillsShown: 12,
  maxBulletsPerRole: 4,
  bulletMaxWords: 16,
  summaryMaxWords: 80,
  lineHeight: 1.35,
  baseFontSize: 12,
};

export function trimToWordLimit(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

export function getDisplaySkills(
  skills: string[] | undefined,
  maxShown: number
): { visible: string[]; overflow: number } {
  if (!skills || skills.length === 0) {
    return { visible: [], overflow: 0 };
  }
  if (skills.length <= maxShown) {
    return { visible: skills, overflow: 0 };
  }
  return {
    visible: skills.slice(0, maxShown),
    overflow: skills.length - maxShown,
  };
}

const COMPRESSION_STEPS: Partial<FitSettings>[] = [
  { maxSkillsShown: 10 },
  { maxSkillsShown: 8 },
  { maxBulletsPerRole: 3 },
  { maxBulletsPerRole: 2 },
  { bulletMaxWords: 14 },
  { bulletMaxWords: 12 },
  { summaryMaxWords: 60 },
  { summaryMaxWords: 45 },
  { lineHeight: 1.25 },
  { baseFontSize: 11.5 },
  { baseFontSize: 11 },
];

export function applyCompressionStep(
  currentSettings: FitSettings,
  compressionLevel: number
): FitSettings {
  if (compressionLevel <= 0 || compressionLevel > COMPRESSION_STEPS.length) {
    return currentSettings;
  }
  
  let settings = { ...DEFAULT_FIT_SETTINGS };
  for (let i = 0; i < compressionLevel; i++) {
    settings = { ...settings, ...COMPRESSION_STEPS[i] };
  }
  return settings;
}

export function measureOverflow(element: HTMLElement | null): boolean {
  if (!element) return false;
  return element.scrollHeight > element.clientHeight;
}

export function applyFitConstraints(
  resume: StructuredResume,
  fitSettings: FitSettings
): StructuredResume {
  const roleCount = resume.experience?.length || 0;
  const baseMaxBullets = getBulletsPerRole(roleCount);
  const effectiveMaxBullets = Math.min(fitSettings.maxBulletsPerRole, baseMaxBullets);

  const constrainedExperience = resume.experience?.map(exp => ({
    ...exp,
    description: exp.description
      ?.slice(0, effectiveMaxBullets)
      .map(bullet => trimToWordLimit(bullet, fitSettings.bulletMaxWords))
  })) || [];

  const constrainedSummary = resume.summary 
    ? trimToWordLimit(resume.summary, fitSettings.summaryMaxWords)
    : '';

  return {
    ...resume,
    experience: constrainedExperience,
    summary: constrainedSummary,
  };
}
