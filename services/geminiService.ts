
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { JobSearchResult, ResumeRewriteResult, BusinessNameIdea, FounderProfile, FounderPlan, CoachMessage, StructuredResume, DreamShiftCard, DreamShiftPath } from "../types";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY || '';

let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    if (!apiKey) {
      throw new Error("Please set the GEMINI_API_KEY environment variable to use AI features.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

const handleError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);
  console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  console.error('Error message:', errorMessage);
  if (errorMessage.includes('Requested entity was not found')) {
    return new Error("The AI model requested is temporarily unavailable. Please try again later.");
  }
  if (errorMessage.includes('API_KEY') || errorMessage.includes('API key')) {
    return new Error("Invalid API Key or configuration error. Contact support.");
  }
  if (errorMessage.includes('Could not find model')) {
    return new Error("AI model not available. Please try again later.");
  }
  return new Error(`Failed to ${context}: ${errorMessage}`);
};

// Common schema for resume output to maintain consistency
const RESUME_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    originalText: { type: Type.STRING },
    rewrittenText: { type: Type.STRING },
    suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    marketAnalysis: { type: Type.STRING },
    structuredResume: {
      type: Type.OBJECT,
      properties: {
        fullName: { type: Type.STRING },
        title: { type: Type.STRING },
        contact: {
          type: Type.OBJECT,
          properties: {
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            location: { type: Type.STRING },
            linkedin: { type: Type.STRING },
            website: { type: Type.STRING }
          }
        },
        summary: { type: Type.STRING },
        skills: { type: Type.ARRAY, items: { type: Type.STRING } },
        certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
        awards: { type: Type.ARRAY, items: { type: Type.STRING } },
        experience: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              role: { type: Type.STRING },
              company: { type: Type.STRING },
              location: { type: Type.STRING },
              dates: { type: Type.STRING },
              description: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        },
        education: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              degree: { type: Type.STRING },
              school: { type: Type.STRING },
              location: { type: Type.STRING },
              dates: { type: Type.STRING }
            }
          }
        }
      }
    }
  },
  required: ["originalText", "rewrittenText", "suggestions", "structuredResume"],
};

export const rewriteResume = async (
  base64Data: string,
  mimeType: string,
  additionalInstructions: string,
  tone: string = "Professional",
  pageCount: number = 1
): Promise<ResumeRewriteResult> => {
  try {
    const model = "gemini-2.5-flash";
    const isGeneration = mimeType === 'text/x-resume-prompt';
    
    let lengthConstraint = `TARGET EXACTLY ${pageCount} PAGE(S).`;

    let contentsPayload: any = {};

    if (isGeneration) {
        const userPrompt = atob(base64Data);
        const prompt = `Expert resume writer. Create a professional resume. User Description: "${userPrompt}". Tone: ${tone}. ${lengthConstraint}. Include certifications and awards if relevant. Output JSON.`;
        contentsPayload = { parts: [{ text: prompt }] };
    } else {
        const prompt = `Expert resume editor. Analyze document. Task: Rewrite in ${tone} tone. ${lengthConstraint}. Populate structured data including certifications and awards. 3 improvement suggestions. 'marketAnalysis' paragraph. ${additionalInstructions ? `User Instructions: ${additionalInstructions}` : ''}`;
        contentsPayload = {
            parts: [
              { inlineData: { data: base64Data, mimeType } },
              { text: prompt },
            ],
        };
    }

    const response = await getAI().models.generateContent({
      model,
      contents: contentsPayload,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESUME_RESPONSE_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanJson) as ResumeRewriteResult;
  } catch (error) {
    throw handleError(error, "generate your resume");
  }
};

export const tailorResume = async (
  baseResumeData: any,
  jobContext: { description?: string, url?: string },
  tone: string = "Professional"
): Promise<ResumeRewriteResult> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Expert Career Strategist and Resume Writer.
      TASK: Tailor the provided base resume to perfectly align with the specific job requirements.
      
      BASE RESUME DATA:
      ${JSON.stringify(baseResumeData)}
      
      TARGET JOB DETAILS:
      ${jobContext.description ? `DESCRIPTION: ${jobContext.description}` : ''}
      ${jobContext.url ? `URL: ${jobContext.url}` : ''}

      INSTRUCTIONS:
      1. If a URL is provided, analyze the job requirements via search.
      2. Rewrite the 'summary' to highlight relevant experience for this specific role.
      3. Reorder or reword 'skills' to prioritize what the job description asks for.
      4. Adjust 'experience' bullet points to focus on accomplishments that prove fit for this role.
      5. Include or highlight specific 'certifications' or 'awards' that bolster the application.
      6. Maintain a ${tone} tone.
      7. Provide a 'marketAnalysis' of why this user is a good fit (or what gaps exist) for this specific role.
    `;

    const response = await getAI().models.generateContent({
      model,
      contents: prompt + `\n\nRESPOND ONLY with a valid JSON object matching this exact structure:
{
  "structuredResume": {
    "fullName": "string",
    "contact": { "email": "string", "phone": "string", "linkedin": "string", "location": "string" },
    "summary": "string",
    "experience": [{ "role": "string", "company": "string", "dates": "string", "description": ["bullet1", "bullet2"] }],
    "education": [{ "school": "string", "degree": "string", "dates": "string" }],
    "skills": ["skill1", "skill2"],
    "software": ["software1"],
    "certifications": ["cert1"],
    "awards": ["award1"]
  },
  "marketAnalysis": "string"
}`,
      config: {
        tools: jobContext.url ? [{ googleSearch: {} }] : [],
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    return parsed as ResumeRewriteResult;
  } catch (error) {
    throw handleError(error, "tailor your resume for this job");
  }
};

export const startCoachingChat = (systemInstruction: string, history: CoachMessage[] = []) => {
    try {
        const chat = getAI().chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction,
            },
            history: history.map(h => ({
              role: h.role === 'model' ? 'model' : 'user',
              parts: h.parts
            }))
        });
        return chat;
    } catch (error) {
        throw handleError(error, "start coaching chat");
    }
};

export const getFastInsight = async (context: string): Promise<string> => {
    try {
        const response = await getAI().models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: `Provide a extremely concise 2-sentence executive summary/critique of this resume context: ${context.slice(0, 2000)}`,
        });
        return response.text || "No insight available.";
    } catch (error) {
        throw handleError(error, "get quick insight");
    }
};

export const speakText = async (text: string, voice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' = 'Kore'): Promise<Uint8Array> => {
    try {
        const response = await getAI().models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voice },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio data returned");
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    } catch (error) {
        throw handleError(error, "generate speech");
    }
};

export const generateBulletPoint = async (
  resume: StructuredResume,
  role: string,
  company: string,
  existingBullets: string[]
): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    const skills = resume.skills?.join(', ') || '';
    const allBullets = resume.experience?.flatMap(exp => exp.description || []) || [];
    
    const prompt = `You are an expert resume writer. Generate ONE new, unique bullet point for a resume.

RESUME CONTEXT:
- Skills: ${skills}
- Current Role: ${role} at ${company}
- Existing Bullets for this role: ${existingBullets.join('; ')}
- All other bullets in resume: ${allBullets.slice(0, 10).join('; ')}

REQUIREMENTS:
1. The new bullet must be DIFFERENT from all existing bullets (don't repeat content)
2. It must be RELEVANT to the skills listed: ${skills}
3. It should highlight an accomplishment or responsibility
4. Use action verbs and be specific
5. Keep it concise (one sentence, max 150 characters)
6. Make it professional and impactful

Return ONLY the bullet point text, nothing else. No numbering, no prefixes, just the bullet text.`;

    const response = await getAI().models.generateContent({
      model,
      contents: prompt,
    });

    const text = response.text?.trim() || '';
    // Clean up any markdown or formatting
    const cleanText = text.replace(/^[-•*]\s*/, '').replace(/^[\d.]\s*/, '').trim();
    return cleanText || 'Generated bullet point';
  } catch (error) {
    throw handleError(error, "generate bullet point");
  }
};

export const searchJobs = async (
  resumeText: string,
  preferences: string,
  location: string,
  datePosted: string = 'any',
  sortBy: string = 'relevance',
  country: string = '',
  language: string = '',
  jobType: string = 'any',
  industry: string = '',
  minSalary: string = '',
  extraPrefs?: { culture?: string, remote?: string, tools?: string }
): Promise<JobSearchResult> => {
  try {
    const model = "gemini-2.5-flash";
    // Optimized prompt - more concise for faster response
    const prompt = `Find 15-20 active jobs matching: ${resumeText.slice(0, 800)}. Location: ${location}, ${country}. Type: ${jobType}. Salary: ${minSalary || 'any'}. Posted: ${datePosted}. 
    Return JSON array with: title, company, location, salary, platform, postedDate, applyUrl, ghostJobProbability ('Low'/'Medium'/'High'), glassdoorRating, matchReason, matchScore (0-100), matchDetails (3-5 bullets).`;

    const response = await getAI().models.generateContent({
      model,
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });

    const text = response.text || "";
    const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    let structuredJobs: any[] = [];
    try {
        const jsonMatch = cleanJson.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
            structuredJobs = JSON.parse(jsonMatch[0]);
        } else {
            structuredJobs = JSON.parse(cleanJson);
        }
    } catch (e) { 
        console.error("Job parse error", e); 
    }

    return {
      text,
      structuredJobs: Array.isArray(structuredJobs) ? structuredJobs : [],
      groundingChunks: groundingChunks.filter(c => c.web?.uri),
    };
  } catch (error) {
    throw handleError(error, "search for jobs");
  }
};

export const generateBusinessNames = async (profile: FounderProfile): Promise<BusinessNameIdea[]> => {
    try {
        const model = "gemini-2.5-flash";
        const prompt = `Generate 10 brandable names. Profile: ${JSON.stringify(profile)}. Output strictly JSON array: [{"name": "", "domain": "", "meaning": "", "industryFit": "", "availabilityStatus": "available"}]`;
        const response = await getAI().models.generateContent({
            model,
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
        });
        const cleanText = response.text.replace(/```json\n?|\n?```/g, "").trim();
        const match = cleanText.match(/\[[\s\S]*\]/);
        return JSON.parse(match ? match[0] : cleanText);
    } catch (error) { throw handleError(error, "generate business names"); }
};

export const generateFounderPlan = async (name: string, domain: string, profile: FounderProfile): Promise<FounderPlan> => {
    try {
        const model = "gemini-2.5-flash";
        const prompt = `Y-Combinator style 7-day launch plan for "${name}". Profile: ${JSON.stringify(profile)}. Output JSON.`;
        const response = await getAI().models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const cleanJson = response.text.replace(/```json\n?|\n?```/g, "").trim();
        return JSON.parse(cleanJson || "{}");
    } catch (error) { throw handleError(error, "generate your business plan"); }
};

export const generateLogo = async (name: string, tone: string, industry: string): Promise<string> => {
    try {
        const model = "gemini-2.5-flash"; 
        const response = await getAI().models.generateContent({
            model,
            contents: { parts: [{ text: `Minimal vector logo for "${name}", ${industry}, ${tone} style, white background.` }] },
        });
        const part = response.candidates[0].content.parts.find(p => p.inlineData);
        if (!part) throw new Error("No image generated");
        return `data:image/png;base64,${part.inlineData.data}`;
    } catch (error) { throw handleError(error, "generate a logo"); }
};

export const generateLogoOptions = async (name: string, industry: string, style: string): Promise<string[]> => {
    try {
        const variations = [`Style: ${style}. Minimal`, `Style: ${style}. Abstract`, `Style: ${style}. Typographic`, `Style: ${style}. Modern` ];
        const results = await Promise.all(variations.map(async (v) => {
            try {
                const response = await getAI().models.generateContent({
                    model: "gemini-2.0-flash-exp",
                    contents: [{ 
                        parts: [{ 
                            text: `Create a professional logo for "${name}" in the ${industry} industry. Style: ${v}. The logo should be clean, modern, and suitable for business use. White background.` 
                        }] 
                    }],
                });
                
                if (!response.candidates || response.candidates.length === 0) {
                    console.error('No candidates in response');
                    return null;
                }
                
                const candidate = response.candidates[0];
                if (!candidate.content || !candidate.content.parts) {
                    console.error('No content parts in candidate');
                    return null;
                }
                
                const p = candidate.content.parts.find((part: any) => part.inlineData);
                if (!p || !p.inlineData) {
                    console.error('No inline data found in parts');
                    return null;
                }
                
                return `data:image/png;base64,${p.inlineData.data}`;
            } catch (e: any) {
                console.error('Error generating logo variation:', e);
                return null;
            }
        }));
        const filtered = results.filter((r): r is string => r !== null);
        if (filtered.length === 0) {
            throw new Error('No logos were generated. Please try again with a different name or style.');
        }
        return filtered;
    } catch (error) { 
        console.error('Logo generation error:', error);
        throw handleError(error, "generate logo options"); 
    }
};

export const editImage = async (base64Data: string, mimeType: string, promptText: string): Promise<string> => {
    try {
        const response = await getAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ inlineData: { data: base64Data, mimeType } }, { text: promptText }] },
        });
        const part = response.candidates[0].content.parts.find(p => p.inlineData);
        if (!part) throw new Error("No image generated");
        return `data:image/png;base64,${part.inlineData.data}`;
    } catch (error) { throw handleError(error, "edit your image"); }
};

export const generateDreamShiftResults = async (answers: any): Promise<{ card: DreamShiftCard; paths: DreamShiftPath[] }> => {
    try {
        const prompt = `You are a career transition coach helping someone discover their career identity and direction through the DreamShift Assessment.

CRITICAL: Output must be SCANNABLE, CONCISE, and ACTION-ORIENTED. Users should understand their result in 10-15 seconds.

Based on these assessment answers, generate:

1. A DreamShift Card (shareable identity card, not a report):
   - Primary and secondary strength archetypes (The Explainer, The Builder, The Connector, The Strategist, The Organizer, The Supporter)
   - Plain English Summary: 1-2 sentences, no jargon, concrete language
   - Fulfillment Drivers: 3-5 bullets, 5-8 words each, action-oriented
   - Ideal Work Environment: Format as "Prefers: [pace], [autonomy], [people], [structure]" - one line each
   - Growth Direction: 2-3 directional phrases (NOT job titles), 3-5 words each
   - Transition Style: One of: "Gradual Shift", "Hybrid Transition", "Strategic Leap"
   - Traits: 3-4 short bullets (5-8 words each)
   - Avoids: 2-3 short bullets (5-8 words each)
   - Thrives in: 2-3 short bullets (5-8 words each)

2. Three DISTINCT career paths with SPECIFIC JOB TITLES (not generic descriptions):
   - Path 1 (immediate): Immediate / Low-Friction Path - specific job title that works with current constraints
   - Path 2 (best-fit): Best-Fit / Skill-Aligned Path - specific job title that matches their strengths
   - Path 3 (ideal): Ideal / Unconstrained Path - specific job title they'd thrive in with fewer constraints

CRITICAL: Each path MUST have a CONCRETE JOB TITLE (e.g., "Technical Writer", "Customer Success Manager", "Product Designer", "Data Analyst", "Content Strategist", "Operations Manager", etc.). NO generic descriptions like "education-focused role" or "creative problem-solving direction".

For each path, provide:
LAYER 1 - SUMMARY (always visible):
- Role Title: SPECIFIC, COMMON JOB TITLE (e.g., "Technical Writer", "Product Manager", "UX Designer")
- Title: Short directional description (3-5 words)
- Why this fits now: 1 sentence, constraint-based, explains why THIS specific role fits their current situation
- Plain English Fit: 1-2 sentences max, concrete, no abstractions
- Key Signals (bullets):
  - Energy impact: One sentence max
  - Income timeline: low/medium/delayed
  - Risk level: low/medium/high
  - Time requirement: Brief description
- TL;DR Line: One sentence, friend-to-friend tone
- Best for: One sentence describing who this fits
- Watch out: One sentence about potential challenges
- Tradeoffs: What they gain vs what they give up (1-2 sentences)

LAYER 2 - EXPANDABLE DETAILS:
- Why it fits: MAX 3 bullets (not paragraphs), action-first, references specific assessment answers
- First 3 Steps: Each step starts with a verb, one concrete outcome per step
  - Description: Action-first, 10-15 words max
  - Time estimate: e.g., "1-2 weeks"
  - Effort level: low/medium/high
- Recommended Resources: 3-5 resources (app-resume, app-jobs, app-coach, or external links)

The three paths MUST be DIFFERENT from each other. If assessment shows they need immediate income, Path 1 should be a real job they can get quickly. If they have strong skills, Path 2 should match those skills with a specific role. Path 3 should be aspirational but still a real career path.

LANGUAGE RULES:
- Prefer verbs over nouns
- Prefer bullets over paragraphs
- Avoid abstractions like "strategic innovation enablement"
- Cap sentences at ~20 words
- Action-first phrasing
- No repeated phrases like "leverages your" or "aligns well with"
- Remove sentences that don't change decisions

Assessment Answers:
${JSON.stringify(answers, null, 2)}

Return ONLY valid JSON in this exact format:
{
  "card": {
    "primaryArchetype": "The Explainer" | "The Builder" | "The Connector" | "The Strategist" | "The Organizer" | "The Supporter",
    "secondaryArchetype": "The Explainer" | "The Builder" | "The Connector" | "The Strategist" | "The Organizer" | "The Supporter",
    "plainEnglishSummary": "1-2 sentences, no jargon, concrete language",
    "fulfillmentDrivers": ["5-8 words each", "action-oriented", "bullet format"],
    "idealWorkEnvironment": {
      "pace": "one line description",
      "autonomy": "one line description",
      "people": "one line description",
      "structure": "one line description"
    },
    "growthDirection": ["3-5 words", "directional phrase"],
    "transitionStyle": "Gradual Shift" | "Hybrid Transition" | "Strategic Leap",
    "traits": ["5-8 words", "short bullet"],
    "avoids": ["5-8 words", "short bullet"],
    "thrivesIn": ["5-8 words", "short bullet"]
  },
  "paths": [
    {
      "id": "path_1",
      "type": "immediate",
      "roleTitle": "SPECIFIC JOB TITLE (e.g., Technical Writer, Customer Success Manager, Data Analyst)",
      "title": "Short directional description (3-5 words)",
      "whyThisFitsNow": "1 sentence, constraint-based, explains why THIS specific role fits their current situation",
      "plainEnglishFit": "1-2 sentences max, concrete, no abstractions",
      "keySignals": {
        "energyImpact": "one sentence max",
        "incomeTimeline": "low" | "medium" | "delayed",
        "riskLevel": "low" | "medium" | "high",
        "timeRequirement": "brief description"
      },
      "tldr": "one sentence, friend-to-friend tone",
      "bestFor": "one sentence describing who this fits",
      "watchOut": "one sentence about potential challenges",
      "tradeoffs": "What they gain vs what they give up (1-2 sentences)",
      "whyItFits": ["max 3 bullets", "action-first", "not paragraphs", "references specific assessment answers"],
      "firstSteps": [
        {
          "description": "action-first, 10-15 words max, starts with verb",
          "timeEstimate": "e.g., 1-2 weeks",
          "effortLevel": "low" | "medium" | "high",
          "resourceLink": "optional"
        }
      ],
      "recommendedResources": [
        {
          "title": "Resource name",
          "category": "Category",
          "link": "app-resume or http://...",
          "description": "optional"
        }
      ]
    },
    {
      "id": "path_2",
      "type": "best-fit",
      "roleTitle": "SPECIFIC JOB TITLE that matches their skills",
      "title": "...",
      "whyThisFitsNow": "...",
      "plainEnglishFit": "...",
      "keySignals": {...},
      "tldr": "...",
      "bestFor": "...",
      "watchOut": "...",
      "tradeoffs": "...",
      "whyItFits": [...],
      "firstSteps": [...],
      "recommendedResources": [...]
    },
    {
      "id": "path_3",
      "type": "ideal",
      "roleTitle": "SPECIFIC JOB TITLE for unconstrained scenario",
      "title": "...",
      "whyThisFitsNow": "...",
      "plainEnglishFit": "...",
      "keySignals": {...},
      "tldr": "...",
      "bestFor": "...",
      "watchOut": "...",
      "tradeoffs": "...",
      "whyItFits": [...],
      "firstSteps": [...],
      "recommendedResources": [...]
    }
  ]
}`;

        const response = await getAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                temperature: 0.7,
            }
        });

        const text = response.text || '{}';
        const parsed = JSON.parse(text);
        
        // Ensure all required fields are present
        if (!parsed.card || !parsed.paths || parsed.paths.length !== 3) {
            throw new Error("Invalid response format from AI");
        }

        return {
            card: parsed.card as DreamShiftCard,
            paths: parsed.paths.map((p: any, idx: number) => ({
                ...p,
                id: p.id || `path_${idx}`,
            })) as DreamShiftPath[]
        };
    } catch (error) {
        throw handleError(error, "generate DreamShift results");
    }
};
