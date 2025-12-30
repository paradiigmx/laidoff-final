# DreamShift

A React + TypeScript + Vite frontend application that provides AI-powered career assistance tools.

## Overview

DreamShift is a career assistance platform powered by Google Gemini AI. It offers:
- Resume Lab with AI rewriting capabilities
- Job Hunter with AI-powered job matching
- AI Career Coach for guidance
- Founder Mode for entrepreneurs
- Money/Gigs resources
- Monetization guidance
- Unemployment & Layoff resources (severance, 401k, rights)
- Assistance resources (financial support, healthcare, mental health)
- Personal Hub dashboard with favorites, tasks, reminders, and financial calculators

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (via CDN)
- **AI Integration**: Google Gemini API (@google/genai)

## Project Structure

```
├── components/          # React components
│   ├── AssistanceResources.tsx
│   ├── CoachView.tsx
│   ├── FileUploader.tsx
│   ├── FounderMode.tsx
│   ├── Hub.tsx           # Personal dashboard with tasks, budget, calculator
│   ├── ImageEditor.tsx
│   ├── JobFinder.tsx
│   ├── Layout.tsx        # Contains ProfileWidget sidebar component
│   ├── MonetizationResources.tsx
│   ├── MoneyResources.tsx
│   ├── ProfileView.tsx     # Saved resumes/projects view
│   ├── EditProfileView.tsx # User profile editing page
│   ├── ResumeTemplates.tsx
│   ├── ResumeView.tsx
│   ├── SettingsView.tsx
│   └── UnemploymentResources.tsx
├── services/
│   ├── geminiService.ts  # AI API integration
│   └── storageService.ts # Local storage utilities
├── App.tsx              # Main application component
├── index.html           # HTML entry point
├── index.tsx            # React entry point
├── types.ts             # TypeScript type definitions
├── vite.config.ts       # Vite configuration
└── package.json
```

## Environment Variables

- `GEMINI_API_KEY`: Required for AI features. Set this secret to enable resume analysis, job matching, and AI coaching.

## Development

The development server runs on port 5000 with:
```bash
npm run dev
```

## Building for Production

```bash
npm run build
```

The build output is in the `dist/` directory.

## Deployment

Configured for autoscale deployment:
- Build: `npm run build`
- Run: `npx serve dist -l 5000`

## Recent Changes

**December 2025 - Resume Editor Tab Redesign**
- Reorganized Resume View sidebar from 4 tabs to 3 tabs:
  - Content: New tab with form fields for editing all resume sections (Contact Info, Summary, Experience, Education, Skills, Certifications, Awards)
  - Design: Templates, accent colors, AI tone, and typography settings
  - Target: Job description targeting for tailored resumes
- Removed Intel tab (feedback/insights feature)
- Merged Settings tab content into Design tab
- Experience section has Add Job / Remove buttons for each entry
- Education section has Add / Remove buttons for each entry
- Skills, Certifications, and Awards use textarea with comma/line separators

**December 2025 - Resume System Overhaul**
- Created services/resumeParser.ts for deterministic resume text parsing:
  - Normalizes bullet characters, extracts sections by heading detection
  - Parses contact info (phone, email, LinkedIn, location)
  - Handles experience with date/role extraction and bullet point collection
  - Parses skills, software, education, certifications, awards sections
- Created services/resumeConstraints.ts for strict formatting rules:
  - Summary: 2-3 sentences, max 70 words / 450 characters
  - Experience bullets: 4 per role (3 roles), 3 per role (4 roles), 2 per role (5+ roles)
  - Max 115 characters per bullet, removes filler phrases, ensures strong verbs
  - Skills/Software: max 12 items each, 24 chars per item
  - Education: max 2 entries
- Updated StructuredResume type with software[] array and rawText field
- Reduced templates to 3: Modern, Executive, Minimal (simplified clean template)
- Removed page count toggle (auto-pagination based on content)
- Added PDF export using @react-pdf/renderer:
  - components/pdf/ResumePdfDocument.tsx - PDF-friendly layout
  - components/pdf/exportPdf.ts - dynamic import for Vite compatibility
- Added debug panel in Settings tab (dev-only) to show parsed JSON
- Implemented comprehensive Fit Engine in services/fitEngine.ts:
  - Role-based bullet limits: ≤3 roles = 4 bullets, 4 roles = 3 bullets, 5 roles = 2 bullets, ≥6 roles = 1 bullet (SHIP SAFE MODE)
  - Skills limit: 10 default, reduced to 8 when certifications exist
  - Summary limit: 75 words default, 55 words for ≥5 roles
  - 10-step progressive compression: skills → words → bullets → font (min 11pt)
  - SPACING_TOKENS for consistent typography (11.5pt base, 1.28 line-height)
  - Certification character limit (90 chars) with ellipsis trimming
  - Compact education mode for ≥5 roles (degree + school only)
  - Page container fixed at 11in height (US Letter with 0.5in margins)
  - Overflow detection using requestAnimationFrame for accurate DOM measurement
  - Auto-expands to 2 pages only after max compression reached
  - PDF export uses identical FitSettings for WYSIWYG consistency
  - Skills overflow displays "+X more" badge when exceeding maxSkillsShown
  - Modern template sidebar fixed at 2.35in width

**December 2025 - Settings & Support Pages**
- Enhanced Settings page with tabs: Settings, FAQs, Terms of Service
- Added notification toggles: Push Notifications, Email Updates, Auto-Save
- Added "Clear Saved Jobs" option in Data & History
- Expanded System Info section with version, engine, platform, last updated
- Added 8 FAQs covering DreamShift features, data security, calculator, and more
- Added comprehensive Terms of Service (9 sections)
- Includes contact support link with email

**December 2025 - Pay Calculator Redesign**
- Added Pay Frequency selector at top of calculator (applies to both modes)
- Separated Salary vs Hourly input modes with dynamic UI switching
- Salary mode: Type selector + Amount input (label shows selected frequency)
- Hourly mode: Type selector, Hours/Week input, Hourly Rate input
- Added overtime section for hourly workers with OT Hours and OT Rate (defaults to 1.5x)
- Results display shows regular/overtime pay breakdown for hourly workers
- Added "Save to Budget" buttons to save monthly gross or net income to budget
- Pre-tax deductions (401k, health insurance, other) remain available in both modes

**December 2025 - Profile System Overhaul**
- Created dedicated EditProfileView component for full-screen profile editing
- Profile picture upload with 5MB limit and removal option
- Simplified ProfileWidget in sidebar to navigate-only (no inline editing)
- Profile dropdown now opens downward (top-full) to prevent overflow issues
- Profile changes sync immediately via custom events (no polling delay)

**December 2025 - Enhanced Hub & Pay Calculator**
- Added hero background image to Hub welcome section with gradient overlay
- Enhanced UserProfile with location fields (state, city, zipCode) and filingStatus
- Reorganized profile widget with categorized sections (Basic Info, Location, Employment, Tax Info, Demographics)
- Enhanced Pay Calculator with:
  - 2024 federal tax brackets with progressive calculations for single, married, head of household
  - State-specific tax rates for all 50 US states (including no-income-tax state flags)
  - Pre-tax deduction support (401k, health insurance, other deductions)
  - Social Security wage base limit handling ($168,600 for 2024)
  - Medicare calculations including Additional Medicare Tax (0.9% above $200k)
  - Annual estimates and effective tax rate display
  - Profile state and filing status auto-populate in calculator
  - State dropdown shows "(No Income Tax)" for applicable states
  - Calculator displays "(from profile)" when using profile-saved state

**December 2025 - DreamShift Rebrand & Hub Dashboard**
- Renamed entire application from "CareerLift AI" to "DreamShift"
- Created new Hub/Home dashboard as default landing page with four tabs:
  - Overview: Stats, favorites display, AI-suggested resources, quick action cards
  - Tasks & Reminders: Full task management with priorities and date-based reminders
  - Budget: Monthly income/expense tracker with category breakdown and net balance
  - Pay Calculator: ADP-style gross-to-net calculator with federal, state, SS, Medicare tax estimates
- Added comprehensive UserProfile system with:
  - Name, email, location, date of birth, gender, veteran status, disability status
  - Job status (employed, unemployed, self-employed, seeking, student, retired)
  - Current/desired job titles and salary goals
  - Profile image upload capability
- Built ProfileWidget in sidebar with dropdown for inline profile editing
- AI-suggested resources adapt based on user's job status
- All Hub data persists in localStorage with "ds_" prefix for DreamShift

**December 2025 - CoachView & FounderMode Redesign**
- Redesigned CoachView with resource-style card layout:
  - Preserved Career Snapshot analytics block at top with metric scores
  - Added 3 coach sections (Career Strategist, Resilience Coach, Interview Master)
  - Each section has 3 diagnostic tool cards with hover animations
  - Cards trigger existing diagnostic workflows when clicked
- Redesigned FounderMode with card-based layout (no more intro page):
  - 3 sections: Discovery & Ideation, Brand Identity, Execution & Launch
  - Each section has 3 tool cards matching MonetizationResources styling
  - Cards feature gradient accent bars, hover lift, dark mode support
  - All tools route to the builder step when clicked

**December 2025 - New Assistance Tab & Resource Reorganization**
- Added new "Assistance" tab for financial support, healthcare, and mental health resources
- Reorganized resources:
  - Unemployment: Severance Negotiation, 401k & Retirement, Rights & Reporting, Career Development, Job Search, Community Support
  - Assistance: Financial Support, Healthcare Coverage, Mental Health, Family Support, Education Assistance, Housing Assistance
- Updated hero images:
  - Unemployment: document signing image (severance theme)
  - Assistance: buildings image (support theme)
- Added 50+ new resources across Unemployment and Assistance pages

**December 2025 - Hero Header Standardization**
- Standardized all hero headers across pages with consistent format:
  - Added pill badges to all heroes (e.g., "Career Search", "AI Coaching", "Cash Flow")
  - Titles follow 2-4 word format: first word white, last word gradient color
  - Consistent dimensions: rounded-[3rem], p-10 md:p-16
  - 80% opacity background images with matching gradient overlays
- Updated hero images:
  - CoachView: chess board image (strategy theme)
  - FounderMode: man reaching for sky (ambition theme)
  - UnemploymentResources: corporate buildings (support theme)
  - ResumeView: hands passing resume (professional theme)
- Added hero header to ResumeView (Resume Builder editor page)
- Added hero header to FileUploader (Resume AI initial upload page)
- Unified subtitle copy lengths across all pages

**December 2025 - Dark Mode & Hero Image Fixes**
- Fixed dark mode styling across all resource pages:
  - Added dark: variants for cards, section headers, badges, and text
  - Fixed title colors not changing in dark mode
  - Added proper border and background colors for dark theme
- Improved hero image visibility on all 6 pages (60% -> 80% opacity)
- Lightened gradient overlays for better image visibility

**December 2025 - Major Resource Expansion**
- Added 60+ new resources across all 4 resource pages:
  - Money/Gigs: Added Pet Services section (Rover, Wag!, Care.com), Creative & Media section (Shutterstock, Canva, 99designs), plus Depop, ThredUp in Selling
  - Monetization: Added Professional Services section (Contra, Maven, Intro), Licensing & Royalties section (DistroKid, Pond5, Envato), Community & Memberships section (Circle, Substack, Ko-fi)
  - Unemployment: Added Resume & Interview Prep section (Resume Worded, Jobscan, Pramp, Interviewing.io), Financial Planning section (Mint, YNAB, Credit Karma), plus LinkedIn Groups, Fishbowl, Lunchclub
  - Assistance: Added Student Loan Relief section (12 resources including Federal Student Aid, IDR, PSLF, loan simulators), Transportation Assistance section (6 resources), Technology Access section (6 resources including ACP, PCs for People)

**December 2025 - Resource Expansion & State Links**
- Fixed unemployment state picker to link directly to official state unemployment websites
- Added STATE_UNEMPLOYMENT_DATA object with official URLs and phone numbers for all 50 US states

**December 2025 - UI Enhancement**
- Added hero images with gradient overlays to 6 major pages:
  - JobFinder, CoachView, FounderMode
  - MoneyResources, MonetizationResources, UnemploymentResources
- Enhanced ResourceCard styling with:
  - Gradient backgrounds and colored accent bars
  - Improved hover animations (lift, rotate icons)
  - Better visual hierarchy with shadow effects
  - Consistent tag and badge styling
- Added `@assets` Vite alias for attached_assets folder
- Added TypeScript declarations for image imports (types/assets.d.ts)
