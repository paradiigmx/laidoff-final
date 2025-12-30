import { StructuredResume, ResumeFormData } from '../types';

const BULLET_CHARS = ['•', '∙', '●', '○', '◦', '▪', '▸', '►', '–', '-', '*'];
const BULLET_REGEX = new RegExp(`^[${BULLET_CHARS.map(c => `\\${c}`).join('')}]\\s*`, 'gm');

const SECTION_PATTERNS: Record<string, RegExp> = {
  summary: /^(SUMMARY|PROFESSIONAL SUMMARY|PROFILE|OBJECTIVE|ABOUT|ABOUT ME)[\s:]*$/im,
  experience: /^(EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT|WORK HISTORY|CAREER HISTORY)[\s:]*$/im,
  skills: /^(SKILLS|CORE SKILLS|KEY SKILLS|COMPETENCIES|CORE COMPETENCIES|AREAS OF EXPERTISE)[\s:]*$/im,
  software: /^(SOFTWARE|TOOLS|SOFTWARE & TOOLS|TECHNICAL SKILLS|TECHNOLOGIES|TECH STACK)[\s:]*$/im,
  education: /^(EDUCATION|ACADEMIC|ACADEMICS|ACADEMIC BACKGROUND)[\s:]*$/im,
  certifications: /^(CERTIFICATIONS|CERTIFICATES|CREDENTIALS|LICENSES|PROFESSIONAL CERTIFICATIONS)[\s:]*$/im,
  awards: /^(AWARDS|HONORS|ACHIEVEMENTS|RECOGNITION|ACCOMPLISHMENTS)[\s:]*$/im,
};

const PHONE_REGEX = /(?:PHONE[:\s]*)?(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/i;
const EMAIL_REGEX = /(?:EMAIL[:\s]*)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
const LINKEDIN_REGEX = /(?:linkedin\.com\/in\/|LINKEDIN[:\s]*)([a-zA-Z0-9_-]+)/i;

const DATE_RANGE_REGEX = /(?:([A-Za-z]{3,}\.?\s*)?\d{1,2}\/)?(\d{4}|\d{1,2}\/\d{4}|[A-Za-z]{3,}\.?\s*\d{4})\s*[-–—to]+\s*(\d{4}|[A-Za-z]{3,}\.?\s*\d{4}|Present|Current|Now)/i;

const FORBIDDEN_PHRASES = [
  'this note is for internal use',
  'i will not',
  'the model',
  'as an ai',
  'i cannot',
  'here is the json',
  'note:',
  'please note',
  'instructions:',
];

function normalizeText(text: string): string {
  let normalized = text;
  BULLET_CHARS.forEach(char => {
    normalized = normalized.replace(new RegExp(`\\${char}`, 'g'), '• ');
  });
  normalized = normalized.replace(/\s{2,}/g, ' ');
  normalized = normalized.replace(/\r\n/g, '\n');
  return normalized.trim();
}

function extractSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const lines = text.split('\n');
  let currentSection = 'header';
  let currentContent: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    let foundSection = false;

    for (const [sectionName, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(trimmedLine)) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = sectionName;
        currentContent = [];
        foundSection = true;
        break;
      }
    }

    if (!foundSection) {
      currentContent.push(line);
    }
  }

  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n').trim();
  }

  return sections;
}

function parseContact(headerText: string): {
  fullName: string;
  phone?: string;
  email?: string;
  location?: string;
  linkedin?: string;
} {
  const lines = headerText.split('\n').filter(l => l.trim());
  const fullName = lines[0]?.trim() || '';
  
  const allText = headerText;
  const phoneMatch = allText.match(PHONE_REGEX);
  const emailMatch = allText.match(EMAIL_REGEX);
  const linkedinMatch = allText.match(LINKEDIN_REGEX);
  
  let location: string | undefined;
  for (const line of lines.slice(1)) {
    const trimmed = line.trim();
    if (trimmed && !phoneMatch?.[0]?.includes(trimmed) && !emailMatch?.[0]?.includes(trimmed)) {
      if (/[A-Za-z]+,?\s*[A-Z]{2}/.test(trimmed) || /\d{5}/.test(trimmed)) {
        location = trimmed;
        break;
      }
    }
  }

  return {
    fullName,
    phone: phoneMatch?.[1] || '',
    email: emailMatch?.[1] || '',
    location: location || '',
    linkedin: linkedinMatch?.[1] ? `linkedin.com/in/${linkedinMatch[1]}` : undefined,
  };
}

function parseExperienceToFormData(experienceText: string): ResumeFormData['experience'] {
  const experiences: ResumeFormData['experience'] = [];
  const lines = experienceText.split('\n');
  
  let currentExp: { jobTitle: string; company: string; dates: string; location?: string; bullets: string[] } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const dateRangeMatch = line.match(DATE_RANGE_REGEX);

    if (dateRangeMatch && !line.startsWith('•')) {
      if (currentExp && currentExp.jobTitle) {
        experiences.push(currentExp);
      }
      
      const datesPart = `${dateRangeMatch[1]} - ${dateRangeMatch[2]}`;
      const beforeDates = line.substring(0, line.indexOf(dateRangeMatch[0])).trim();
      const afterDates = line.substring(line.indexOf(dateRangeMatch[0]) + dateRangeMatch[0].length).trim();
      
      currentExp = {
        jobTitle: beforeDates || afterDates || '',
        company: '',
        dates: datesPart,
        bullets: []
      };
    } else if (currentExp) {
      if (line.startsWith('•')) {
        const bullet = line.replace(/^•\s*/, '').trim();
        if (bullet) {
          currentExp.bullets.push(bullet);
        }
      } else if (!currentExp.company && line.length > 2 && line.length < 100) {
        currentExp.company = line;
      } else if (currentExp.company && !currentExp.jobTitle) {
        currentExp.jobTitle = line;
      }
    }
  }

  if (currentExp && currentExp.jobTitle) {
    experiences.push(currentExp);
  }

  return experiences.slice(0, 5);
}

function parseSkillsList(text: string): string[] {
  const skills: string[] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    const cleanLine = line.replace(/^•\s*/, '').trim();
    const parts = cleanLine.split(/[,;|]/);
    
    for (const part of parts) {
      const skill = part.trim().replace(/[.,;:]+$/, '');
      if (skill && skill.length > 1 && skill.length < 40 && 
          !['etc', 'and', 'various', 'other'].includes(skill.toLowerCase())) {
        const words = skill.split(/\s+/);
        if (words.length <= 3) {
          skills.push(skill);
        }
      }
    }
  }

  const uniqueSkills = [...new Set(skills.map(s => s.toLowerCase()))];
  return skills.filter((s, i) => 
    uniqueSkills.indexOf(s.toLowerCase()) === skills.findIndex(sk => sk.toLowerCase() === s.toLowerCase())
  ).slice(0, 12);
}

function parseEducation(educationText: string): ResumeFormData['education'] {
  const education: ResumeFormData['education'] = [];
  const lines = educationText.split('\n').filter(l => l.trim());
  
  let currentEdu: { degree: string; school: string; dates: string } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const dateMatch = trimmed.match(/(\d{4})\s*[-–—]\s*(\d{4}|Present)/i);
    if (dateMatch) {
      if (currentEdu) {
        currentEdu.dates = trimmed;
      }
      continue;
    }

    if (/University|College|Institute|School|Academy/i.test(trimmed)) {
      if (currentEdu) {
        education.push(currentEdu);
      }
      currentEdu = { school: trimmed, degree: '', dates: '' };
      continue;
    }

    if (currentEdu && !currentEdu.degree && /Bachelor|Master|PhD|Associate|Degree|B\.[AS]|M\.[AS]|MBA/i.test(trimmed)) {
      currentEdu.degree = trimmed;
      continue;
    }

    if (!currentEdu && trimmed.length > 3) {
      currentEdu = { school: trimmed, degree: '', dates: '' };
    }
  }

  if (currentEdu) {
    education.push(currentEdu);
  }

  return education.slice(0, 2);
}

function parseSummary(summaryText: string): string {
  return summaryText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !SECTION_PATTERNS.summary.test(l))
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function parseSimpleList(text: string): string[] {
  const items: string[] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    const cleanLine = line.replace(/^•\s*/, '').trim();
    if (cleanLine && cleanLine.length > 1 && cleanLine.length <= 80) {
      items.push(cleanLine);
    }
  }

  return items.slice(0, 6);
}

function sanitizeString(str: string, maxLength: number = 500): string {
  let cleaned = str;
  for (const phrase of FORBIDDEN_PHRASES) {
    cleaned = cleaned.replace(new RegExp(phrase, 'gi'), '');
  }
  return cleaned.trim().substring(0, maxLength);
}

function sanitizeBullet(bullet: string): string {
  let cleaned = bullet.replace(/^[-–—•*]\s*/, '').trim();
  cleaned = sanitizeString(cleaned, 115);
  const words = cleaned.split(/\s+/);
  if (words.length > 18) {
    cleaned = words.slice(0, 18).join(' ');
  }
  if (cleaned.length > 115) {
    cleaned = cleaned.substring(0, 115).trim();
  }
  return cleaned;
}

function sanitizeSummary(summary: string): string {
  let cleaned = sanitizeString(summary, 450);
  const words = cleaned.split(/\s+/).filter(w => w);
  if (words.length > 70) {
    cleaned = words.slice(0, 70).join(' ');
  }
  if (cleaned.length > 450) {
    cleaned = cleaned.substring(0, 450).trim();
  }
  return cleaned;
}

export function sanitizeResumeFormData(data: Partial<ResumeFormData>): ResumeFormData {
  const roleCount = data.experience?.length || 0;
  let maxBulletsPerRole = 4;
  if (roleCount === 4) maxBulletsPerRole = 3;
  if (roleCount >= 5) maxBulletsPerRole = 2;

  const sanitizedExperience = (data.experience || []).slice(0, 5).map(exp => ({
    jobTitle: sanitizeString(exp.jobTitle || '', 100),
    company: sanitizeString(exp.company || '', 100),
    dates: sanitizeString(exp.dates || '', 50),
    location: exp.location ? sanitizeString(exp.location, 50) : undefined,
    bullets: (exp.bullets || [])
      .map(b => sanitizeBullet(b))
      .filter(b => b.length > 0)
      .slice(0, maxBulletsPerRole)
  }));

  return {
    contact: {
      fullName: sanitizeString(data.contact?.fullName || '', 100),
      title: sanitizeString(data.contact?.title || '', 60),
      email: sanitizeString(data.contact?.email || '', 100),
      phone: sanitizeString(data.contact?.phone || '', 20),
      location: sanitizeString(data.contact?.location || '', 100),
      linkedin: data.contact?.linkedin ? sanitizeString(data.contact.linkedin, 100) : undefined,
    },
    summary: sanitizeSummary(data.summary || ''),
    experience: sanitizedExperience,
    education: (data.education || []).slice(0, 2).map(edu => ({
      degree: sanitizeString(edu.degree || '', 100),
      school: sanitizeString(edu.school || '', 100),
      dates: sanitizeString(edu.dates || '', 50),
    })),
    skills: (data.skills || [])
      .map(s => sanitizeString(s, 40))
      .filter(s => s.length > 0)
      .slice(0, 12),
    certifications: (data.certifications || [])
      .map(c => sanitizeString(c, 80))
      .filter(c => c.length > 0)
      .slice(0, 6),
    awards: (data.awards || [])
      .map(a => sanitizeString(a, 80))
      .filter(a => a.length > 0)
      .slice(0, 6),
  };
}

export function heuristicParseToFormData(resumeText: string): Partial<ResumeFormData> {
  const normalized = normalizeText(resumeText);
  const sections = extractSections(normalized);

  const contactInfo = parseContact(sections.header || '');
  
  return {
    contact: {
      fullName: contactInfo.fullName,
      title: '',
      email: contactInfo.email || '',
      phone: contactInfo.phone || '',
      location: contactInfo.location || '',
      linkedin: contactInfo.linkedin,
    },
    summary: sections.summary ? parseSummary(sections.summary) : '',
    experience: sections.experience ? parseExperienceToFormData(sections.experience) : [],
    education: sections.education ? parseEducation(sections.education) : [],
    skills: sections.skills ? parseSkillsList(sections.skills) : [],
    certifications: sections.certifications ? parseSimpleList(sections.certifications) : [],
    awards: sections.awards ? parseSimpleList(sections.awards) : [],
  };
}

export function parseResumeTextToFormData(rawText: string): ResumeFormData {
  const heuristic = heuristicParseToFormData(rawText);
  return sanitizeResumeFormData(heuristic);
}

export function parseResumeTextToStructuredResume(rawText: string): StructuredResume {
  const formData = parseResumeTextToFormData(rawText);
  
  return {
    fullName: formData.contact.fullName,
    title: formData.contact.title,
    contact: {
      email: formData.contact.email,
      phone: formData.contact.phone,
      location: formData.contact.location,
      linkedin: formData.contact.linkedin,
    },
    summary: formData.summary,
    skills: formData.skills,
    experience: formData.experience.map(exp => ({
      role: exp.jobTitle,
      company: exp.company,
      location: exp.location,
      dates: exp.dates,
      description: exp.bullets,
    })),
    education: formData.education,
    certifications: formData.certifications.length > 0 ? formData.certifications : undefined,
    awards: formData.awards.length > 0 ? formData.awards : undefined,
    rawText,
  };
}

export function validateParsedResume(resume: StructuredResume): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (!resume.fullName || resume.fullName === 'Unknown') {
    warnings.push('Could not extract full name');
  }

  if (!resume.experience || resume.experience.length === 0) {
    warnings.push('No experience entries found');
  }

  if (!resume.skills || resume.skills.length === 0) {
    warnings.push('No skills found');
  }

  if (!resume.summary) {
    warnings.push('No summary found');
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

export const SYSTEM_PROMPT_RESUME_PARSE = `You are a resume parsing engine. Output ONLY valid JSON. No markdown. No commentary.
You MUST output exactly this JSON shape:
{
  "contact": {"fullName":"","title":"","email":"","phone":"","location":"","linkedin":""},
  "summary":"",
  "experience":[{"jobTitle":"","company":"","dates":"","location":"","bullets":[]}],
  "education":[{"degree":"","school":"","dates":""}],
  "skills":[],
  "certifications":[],
  "awards":[]
}
Rules:
- Do not include any keys other than those shown.
- Do not include explanations, notes, or instruction text.
- Do not fabricate information. If not present, use empty string or empty array.
- title must be a single role title, not a list.
- bullets must be short (one sentence), no paragraphs.
Return only JSON.`;
