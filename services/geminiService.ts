
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { JobSearchResult, ResumeRewriteResult, BusinessNameIdea, FounderProfile, FounderPlan, CoachMessage, StructuredResume, DreamShiftCard, DreamShiftPath } from "../types";

export interface RoadmapDay {
    day: number;
    title: string;
    tasks: Array<{
        task: string;
        description: string;
        timeEstimate: string;
        resources?: Array<{
            title: string;
            link: string;
            category: string;
        }>;
    }>;
}

export interface RoadmapResult {
    overview: string;
    goal: string;
    days: RoadmapDay[];
    recommendedResources: Array<{
        title: string;
        link: string;
        category: string;
        description: string;
        reason: string;
    }>;
}

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
        const prompt = `Generate 9 brandable names. For each name, provide 3-5 domain variations (e.g., .com, .io, .co, .net, .app). Profile: ${JSON.stringify(profile)}. Output strictly JSON array: [{"name": "", "domain": "", "domains": ["name.com", "name.io", "name.co"], "meaning": "", "industryFit": "", "availabilityStatus": "available"}]`;
        const response = await getAI().models.generateContent({
            model,
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
        });
        const cleanText = response.text.replace(/```json\n?|\n?```/g, "").trim();
        const match = cleanText.match(/\[[\s\S]*\]/);
        const results = JSON.parse(match ? match[0] : cleanText);
        // Ensure each result has a domains array, using domain as fallback
        return results.map((item: any) => ({
            ...item,
            domains: item.domains || (item.domain ? [item.domain] : [])
        }));
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

export interface RoadmapDay {
    day: number;
    title: string;
    tasks: Array<{
        task: string;
        description: string;
        timeEstimate: string;
        resources?: Array<{
            title: string;
            link: string;
            category: string;
        }>;
    }>;
}

export interface RoadmapResult {
    overview: string;
    goal: string;
    days: RoadmapDay[];
    recommendedResources: Array<{
        title: string;
        link: string;
        category: string;
        description: string;
        reason: string;
    }>;
}

export const generateRoadmap = async (
    businessProfile: any,
    assessment: {
        primaryGoal: string;
        hoursPerDay: string;
        comfortableTalkingToCustomers: string;
        comfortableSellingDirectly: string;
        whatWouldStopYou: string;
    }
): Promise<RoadmapResult> => {
    try {
        const model = "gemini-2.5-flash";
        const businessContext = `
Business Name: ${businessProfile.businessName}
Business Type: ${businessProfile.businessType}
Stage: ${businessProfile.stage}
Target Customer: ${businessProfile.targetCustomer || 'Not specified'}
Problem Being Solved: ${businessProfile.problemBeingSolved || 'Not specified'}
Industry/Sector: ${businessProfile.targetCustomer || businessProfile.businessType}
`;
        
        const prompt = `Create a realistic 7-day roadmap to help this business achieve: ${assessment.primaryGoal}

${businessContext}

Assessment:
- Primary Goal: ${assessment.primaryGoal}
- Hours Available Per Day: ${assessment.hoursPerDay}
- Comfortable Talking to Customers: ${assessment.comfortableTalkingToCustomers}
- Comfortable Selling Directly: ${assessment.comfortableSellingDirectly}
- Potential Blocker: ${assessment.whatWouldStopYou}

Based on the business type and industry, recommend relevant resources from these categories:
- Monetization platforms (Etsy, Shopify, Gumroad, Stripe, etc.)
- Marketing tools (social media platforms, email marketing, etc.)
- Service platforms (Upwork, Fiverr, etc.) if applicable
- E-commerce platforms if selling products
- Content creation tools if relevant
- Business tools (accounting, legal, etc.)
- Industry-specific resources based on the business type

For each day, provide:
- Day number (1-7)
- Day title (brief, action-oriented)
- 2-4 specific tasks with descriptions
- Time estimates for each task
- Relevant resources for that day's tasks (link to actual platforms/tools)

Also provide an overview paragraph and a list of 5-8 recommended resources that align with this business type/industry.

Output JSON in this exact format:
{
  "overview": "1-2 paragraph overview of the roadmap",
  "goal": "${assessment.primaryGoal}",
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "tasks": [
        {
          "task": "Task name",
          "description": "Detailed description",
          "timeEstimate": "e.g., 1-2 hours",
          "resources": [
            {
              "title": "Resource name",
              "link": "https://...",
              "category": "Category"
            }
          ]
        }
      ]
    }
  ],
  "recommendedResources": [
    {
      "title": "Resource name",
      "link": "https://...",
      "category": "Category",
      "description": "Brief description",
      "reason": "Why this fits this business"
    }
  ]
}`;

        const response = await getAI().models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const cleanJson = response.text.replace(/```json\n?|\n?```/g, "").trim();
        return JSON.parse(cleanJson || "{}");
    } catch (error) { 
        throw handleError(error, "generate roadmap"); 
    }
};

export interface PitchResult {
    pitch: string;
    keyPoints: string[];
    callToAction: string;
    tips: string[];
    recommendedResources?: Array<{
        title: string;
        link: string;
        category: string;
        description: string;
    }>;
}

export const generatePitch = async (
    businessProfile: any,
    assessment: {
        pitchingTo: string;
        pitchLength: string;
        hardestToExplain: string;
        speakingConfidence: string;
    }
): Promise<PitchResult> => {
    try {
        const model = "gemini-2.5-flash";
        const businessContext = `
Business Name: ${businessProfile.businessName}
Business Type: ${businessProfile.businessType}
Target Customer: ${businessProfile.targetCustomer || 'Not specified'}
Problem Being Solved: ${businessProfile.problemBeingSolved || 'Not specified'}
Value Proposition: ${businessProfile.pricingModel || 'Not specified'}
`;
        
        const prompt = `Create a ${assessment.pitchLength} elevator pitch for this business.

${businessContext}

Assessment:
- Pitching To: ${assessment.pitchingTo}
- Pitch Length: ${assessment.pitchLength}
- Hardest to Explain: ${assessment.hardestToExplain}
- Speaking Confidence: ${assessment.speakingConfidence}

The pitch should:
- Be clear and compelling
- Address the hardest-to-explain aspect clearly
- Match the confidence level (if low confidence, use simpler language)
- Include a strong call to action
- Be appropriate for ${assessment.pitchingTo}

Also recommend 3-5 resources that would help with pitching (pitch practice tools, presentation platforms, etc.).

Output JSON in this exact format:
{
  "pitch": "The full pitch text",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "callToAction": "Clear call to action",
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "recommendedResources": [
    {
      "title": "Resource name",
      "link": "https://...",
      "category": "Category",
      "description": "Brief description"
    }
  ]
}`;

        const response = await getAI().models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const cleanJson = response.text.replace(/```json\n?|\n?```/g, "").trim();
        return JSON.parse(cleanJson || "{}");
    } catch (error) { 
        throw handleError(error, "generate pitch"); 
    }
};

export interface RevenueStrategyResult {
    overview: string;
    primaryStrategies: Array<{
        strategy: string;
        description: string;
        timeToRevenue: string;
        effortLevel: string;
        potentialRevenue: string;
        resources?: Array<{
            title: string;
            link: string;
            category: string;
        }>;
    }>;
    recommendedResources: Array<{
        title: string;
        link: string;
        category: string;
        description: string;
        reason: string;
    }>;
    nextSteps: string[];
}

export const generateRevenueStrategy = async (
    businessProfile: any,
    assessment: {
        incomeTimeline: string;
        willingToSellTime: string;
        willingToBuildOnceSellMany: string;
        pricingComfort: string;
        salesTolerance: string;
        existingProof: string;
    }
): Promise<RevenueStrategyResult> => {
    try {
        const model = "gemini-2.5-flash";
        const businessContext = `
Business Name: ${businessProfile.businessName}
Business Type: ${businessProfile.businessType}
Stage: ${businessProfile.stage}
Target Customer: ${businessProfile.targetCustomer || 'Not specified'}
Problem Being Solved: ${businessProfile.problemBeingSolved || 'Not specified'}
Pricing Model: ${businessProfile.pricingModel || 'Not specified'}
Existing Assets: ${businessProfile.existingAssets?.join(', ') || 'None'}
`;
        
        const prompt = `Create a revenue strategy for this business.

${businessContext}

Assessment:
- Income Timeline: ${assessment.incomeTimeline}
- Willing to Sell Time: ${assessment.willingToSellTime}
- Willing to Build Once, Sell Many: ${assessment.willingToBuildOnceSellMany}
- Pricing Comfort: ${assessment.pricingComfort}
- Sales Tolerance: ${assessment.salesTolerance}
- Existing Proof: ${assessment.existingProof}

Based on the business type and assessment, recommend 3-5 revenue strategies that:
- Match the income timeline
- Align with willingness to sell time vs build products
- Fit the pricing comfort level
- Work with sales tolerance
- Leverage existing proof/assets

For each strategy, provide:
- Strategy name
- Description
- Time to first revenue
- Effort level
- Potential revenue range
- Relevant resources (platforms, tools, etc.)

Also recommend 5-8 general resources that align with this business type/industry.

Output JSON in this exact format:
{
  "overview": "1-2 paragraph overview",
  "primaryStrategies": [
    {
      "strategy": "Strategy name",
      "description": "Detailed description",
      "timeToRevenue": "e.g., 1-2 weeks",
      "effortLevel": "low/medium/high",
      "potentialRevenue": "e.g., $500-$2000/month",
      "resources": [
        {
          "title": "Resource name",
          "link": "https://...",
          "category": "Category"
        }
      ]
    }
  ],
  "recommendedResources": [
    {
      "title": "Resource name",
      "link": "https://...",
      "category": "Category",
      "description": "Brief description",
      "reason": "Why this fits"
    }
  ],
  "nextSteps": ["Step 1", "Step 2", "Step 3"]
}`;

        const response = await getAI().models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const cleanJson = response.text.replace(/```json\n?|\n?```/g, "").trim();
        return JSON.parse(cleanJson || "{}");
    } catch (error) { 
        throw handleError(error, "generate revenue strategy"); 
    }
};

export interface AngelInvestor {
    name: string;
    firm?: string;
    focus: string[];
    stage: string[];
    location?: string;
    website?: string;
    contact?: string;
    description: string;
    checkSize?: string;
}

export const searchAngelInvestors = async (
    businessProfile: any
): Promise<AngelInvestor[]> => {
    try {
        const model = "gemini-2.5-flash";
        const businessContext = `
Business Name: ${businessProfile.businessName}
Business Type: ${businessProfile.businessType}
Stage: ${businessProfile.stage}
Industry/Sector: ${businessProfile.targetCustomer || businessProfile.businessType}
Problem Being Solved: ${businessProfile.problemBeingSolved || 'Not specified'}
`;
        
        const prompt = `Find 10-15 angel investors or early-stage VC firms that would be a good fit for this business.

${businessContext}

Search for:
- Angel investors who invest in this industry/sector
- Early-stage VCs that match the business stage
- Investors who focus on this business type
- Location-appropriate investors if relevant

For each investor, provide:
- Name (and firm name if applicable)
- Focus areas/industries
- Investment stage (pre-seed, seed, Series A, etc.)
- Location (if known)
- Website or LinkedIn
- Contact method (if available)
- Brief description
- Typical check size (if known)

Output JSON array in this exact format:
[
  {
    "name": "Investor name",
    "firm": "Firm name (if applicable)",
    "focus": ["Industry 1", "Industry 2"],
    "stage": ["Seed", "Series A"],
    "location": "City, State or Remote",
    "website": "https://...",
    "contact": "email or contact method",
    "description": "Brief description",
    "checkSize": "e.g., $25K-$100K"
  }
]`;

        const response = await getAI().models.generateContent({
            model,
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
        });
        const text = response.text || "";
        const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
        // Try to extract JSON array from the response
        const match = cleanJson.match(/\[[\s\S]*\]/);
        if (match) {
            return JSON.parse(match[0]);
        }
        // If no array found, try parsing the whole response
        try {
            return JSON.parse(cleanJson);
        } catch (e) {
            // If JSON parsing fails, return empty array
            console.error("Failed to parse investor search response:", e);
            return [];
        }
    } catch (error) { 
        throw handleError(error, "search angel investors"); 
    }
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
        const model = "gemini-2.5-flash";
        const prompt = `Generate 4 professional business logo design concepts for "${name}" company in the ${industry} industry. Style: ${style}. 

For each logo concept, provide:
1. A detailed text description of the logo design
2. Color scheme recommendations (provide hex codes)
3. Typography suggestions
4. Visual elements and symbols

The logos should be:
- Clean and simple
- Suitable for business cards and websites
- Professional and modern
- Reflecting the ${style} style
- Appropriate for the ${industry} industry

Output as a JSON array with exactly 4 logo concepts, each with:
{
  "description": "Detailed description of the logo design",
  "colors": ["#hexcode1", "#hexcode2", "#hexcode3"],
  "typography": "Font style recommendation",
  "elements": ["element1", "element2"],
  "style": "${style}"
}`;

        const response = await getAI().models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        const cleanJson = response.text.replace(/```json\n?|\n?```/g, "").trim();
        let logoConcepts: any[] = [];
        try {
            const parsed = JSON.parse(cleanJson);
            logoConcepts = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
            console.error('Failed to parse logo concepts, using defaults:', e);
            // If parsing fails, create default concepts
            logoConcepts = [
                { description: `${style} logo for ${name}`, colors: ['#4F46E5', '#7C3AED'], typography: 'Modern sans-serif', elements: ['geometric shape'], style },
                { description: `${style} logo for ${name}`, colors: ['#EC4899', '#F59E0B'], typography: 'Bold serif', elements: ['icon'], style },
                { description: `${style} logo for ${name}`, colors: ['#10B981', '#3B82F6'], typography: 'Clean sans-serif', elements: ['symbol'], style },
                { description: `${style} logo for ${name}`, colors: ['#8B5CF6', '#EF4444'], typography: 'Minimal', elements: ['abstract'], style }
            ];
        }
        
        // Convert logo concepts to visual SVG representations
        const logoUrls = logoConcepts.slice(0, 4).map((concept: any, index: number) => {
            const colors = concept?.colors || ['#4F46E5', '#7C3AED', '#EC4899'];
            const primaryColor = (colors[0]?.replace('#', '') || '4F46E5').substring(0, 6);
            const secondaryColor = (colors[1]?.replace('#', '') || '7C3AED').substring(0, 6);
            const displayName = name.length > 12 ? name.substring(0, 10) + '...' : name;
            
            // Create an SVG logo placeholder based on the concept
            const svg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#${primaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#${secondaryColor};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="#ffffff"/>
  <circle cx="200" cy="150" r="60" fill="url(#grad${index})" opacity="0.8"/>
  <text x="200" y="250" font-family="Arial, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="#1a1a1a">${displayName}</text>
  <text x="200" y="280" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#666666">${style}</text>
  <text x="200" y="320" font-family="Arial, sans-serif" font-size="11" text-anchor="middle" fill="#999999">Concept ${index + 1}</text>
</svg>`.trim();
            return `data:image/svg+xml;base64,${btoa(svg)}`;
        });
        
        if (logoUrls.length === 0) {
            throw new Error('No logo concepts were generated. Please try again.');
        }
        
        return logoUrls;
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
