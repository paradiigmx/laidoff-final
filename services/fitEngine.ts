import { StructuredResume } from '../types';

export interface FitSettings {
  maxSkillsShown: number;
  maxBulletsPerRole: number;
  bulletMaxWords: number;
  summaryMaxWords: number;
  lineHeight: number;
  baseFontSize: number;
  certMaxChars: number;
}

export interface RenderPlan {
  pageCount: number;
  fitSettings: FitSettings;
  page1Sections: SectionBlock[];
  page2Sections: SectionBlock[];
  compressionLevel: number;
}

export interface SectionBlock {
  type: 'header' | 'summary' | 'skills' | 'experience' | 'certifications' | 'education' | 'awards';
  data: any;
  priority: number;
}

export function getBulletsPerRole(roleCount: number): number {
  if (roleCount <= 3) return 4;
  if (roleCount === 4) return 3;
  if (roleCount === 5) return 2;
  return 1;
}

export function getMaxSkillsShown(hasCertifications: boolean, baseMax: number = 10): number {
  if (hasCertifications) {
    return Math.min(baseMax, 8);
  }
  return baseMax;
}

export function getSummaryMaxWords(roleCount: number): number {
  if (roleCount >= 5) return 55;
  return 75;
}

export const DEFAULT_FIT_SETTINGS: FitSettings = {
  maxSkillsShown: 10,
  maxBulletsPerRole: 4,
  bulletMaxWords: 16,
  summaryMaxWords: 75,
  lineHeight: 1.28,
  baseFontSize: 11.5,
  certMaxChars: 90,
};

export const SPACING_TOKENS = {
  sectionTitleMarginBottom: '6px',
  sectionPaddingBottom: '10px',
  roleBlockMarginBottom: '10px',
  bulletListMarginTop: '4px',
  bulletItemMargin: '2px 0',
  sidebarWidth: '2.35in',
  bulletPaddingLeft: '1.1em',
};

const COMPRESSION_STEPS: Partial<FitSettings>[] = [
  { maxSkillsShown: 8 },
  { maxSkillsShown: 6 },
  { bulletMaxWords: 14 },
  { bulletMaxWords: 12 },
  { summaryMaxWords: 60 },
  { summaryMaxWords: 45 },
  { maxBulletsPerRole: 3 },
  { maxBulletsPerRole: 2 },
  { maxBulletsPerRole: 1 },
  { baseFontSize: 11.0 },
];

export function getInitialFitSettings(resume: StructuredResume): FitSettings {
  const roleCount = resume.experience?.length || 0;
  const hasCerts = (resume.certifications?.length || 0) > 0;
  
  return {
    ...DEFAULT_FIT_SETTINGS,
    maxBulletsPerRole: getBulletsPerRole(roleCount),
    maxSkillsShown: getMaxSkillsShown(hasCerts),
    summaryMaxWords: getSummaryMaxWords(roleCount),
  };
}

export function applyCompressionStep(
  currentSettings: FitSettings,
  compressionLevel: number
): FitSettings {
  if (compressionLevel <= 0 || compressionLevel > COMPRESSION_STEPS.length) {
    return currentSettings;
  }
  
  let settings = { ...currentSettings };
  for (let i = 0; i < compressionLevel; i++) {
    const step = COMPRESSION_STEPS[i];
    if (step.maxSkillsShown !== undefined) {
      settings.maxSkillsShown = Math.min(settings.maxSkillsShown, step.maxSkillsShown);
    }
    if (step.maxBulletsPerRole !== undefined) {
      settings.maxBulletsPerRole = Math.min(settings.maxBulletsPerRole, step.maxBulletsPerRole);
    }
    if (step.bulletMaxWords !== undefined) {
      settings.bulletMaxWords = Math.min(settings.bulletMaxWords, step.bulletMaxWords);
    }
    if (step.summaryMaxWords !== undefined) {
      settings.summaryMaxWords = Math.min(settings.summaryMaxWords, step.summaryMaxWords);
    }
    if (step.baseFontSize !== undefined) {
      settings.baseFontSize = Math.min(settings.baseFontSize, step.baseFontSize);
    }
  }
  return settings;
}

export function trimToWordLimit(text: string, maxWords: number): string {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  const trimmed = words.slice(0, maxWords).join(' ');
  const lastChar = trimmed[trimmed.length - 1];
  if (['.', '!', '?', ','].includes(lastChar)) {
    return trimmed.slice(0, -1) + '…';
  }
  return trimmed + '…';
}

export function trimToCharLimit(text: string, maxChars: number): string {
  if (!text || text.length <= maxChars) return text;
  return text.substring(0, maxChars - 1).trim() + '…';
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

  const constrainedCerts = resume.certifications?.map(cert => 
    trimToCharLimit(cert, fitSettings.certMaxChars)
  );

  return {
    ...resume,
    experience: constrainedExperience,
    summary: constrainedSummary,
    certifications: constrainedCerts,
  };
}

export function createRenderPlan(
  resume: StructuredResume,
  templateId: string,
  compressionLevel: number = 0
): RenderPlan {
  const initialSettings = getInitialFitSettings(resume);
  const fitSettings = applyCompressionStep(initialSettings, compressionLevel);
  
  const roleCount = resume.experience?.length || 0;
  const hasCerts = (resume.certifications?.length || 0) > 0;
  
  const sections: SectionBlock[] = [];
  
  sections.push({ type: 'header', data: { name: resume.fullName, title: resume.title, contact: resume.contact }, priority: 0 });
  
  if (resume.summary) {
    sections.push({ type: 'summary', data: trimToWordLimit(resume.summary, fitSettings.summaryMaxWords), priority: 2 });
  }
  
  if (resume.skills?.length) {
    const { visible, overflow } = getDisplaySkills(resume.skills, fitSettings.maxSkillsShown);
    sections.push({ type: 'skills', data: { visible, overflow }, priority: 3 });
  }
  
  const baseMaxBullets = getBulletsPerRole(roleCount);
  const effectiveMaxBullets = Math.min(fitSettings.maxBulletsPerRole, baseMaxBullets);
  
  resume.experience?.forEach((exp, idx) => {
    const constrainedExp = {
      ...exp,
      description: exp.description?.slice(0, effectiveMaxBullets).map(b => trimToWordLimit(b, fitSettings.bulletMaxWords)) || []
    };
    sections.push({ type: 'experience', data: constrainedExp, priority: 1 });
  });
  
  if (hasCerts) {
    const maxCertsPage1 = roleCount >= 5 ? 1 : resume.certifications!.length;
    const page1Certs = resume.certifications!.slice(0, maxCertsPage1).map(c => trimToCharLimit(c, fitSettings.certMaxChars));
    const page2Certs = resume.certifications!.slice(maxCertsPage1).map(c => trimToCharLimit(c, fitSettings.certMaxChars));
    
    if (page1Certs.length > 0) {
      sections.push({ type: 'certifications', data: page1Certs, priority: 4 });
    }
    if (page2Certs.length > 0) {
      sections.push({ type: 'certifications', data: page2Certs, priority: 14 });
    }
  }
  
  if (resume.education?.length) {
    const compactEducation = roleCount >= 5;
    sections.push({ type: 'education', data: { entries: resume.education, compact: compactEducation }, priority: 5 });
  }
  
  if (resume.awards?.length) {
    sections.push({ type: 'awards', data: resume.awards, priority: 6 });
  }
  
  const page1Sections = sections.filter(s => s.priority < 10);
  const page2Sections = sections.filter(s => s.priority >= 10);
  
  return {
    pageCount: page2Sections.length > 0 ? 2 : 1,
    fitSettings,
    page1Sections,
    page2Sections,
    compressionLevel,
  };
}

export const MAX_COMPRESSION_LEVEL = COMPRESSION_STEPS.length;
