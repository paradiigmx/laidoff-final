# DreamShift

## Overview

DreamShift is a React + TypeScript + Vite frontend application providing AI-powered career assistance. It aims to empower users with tools for career advancement, job searching, entrepreneurial ventures, and financial guidance, leveraging Google Gemini AI for intelligent assistance. Key capabilities include:

-   **Resume Lab**: AI-powered resume rewriting and optimization.
-   **Job Hunter**: AI-driven job matching and search.
-   **AI Career Coach**: Personalized career guidance.
-   **Founder Mode**: Tools and resources for aspiring entrepreneurs.
-   **Financial Resources**: Guidance on money management, gigs, and monetization strategies.
-   **Support Resources**: Assistance for unemployment, layoffs, financial support, healthcare, and mental health.
-   **Personal Hub**: A centralized dashboard for tasks, reminders, financial calculators, and personalized insights.

## User Preferences

I prefer iterative development, so please provide updates frequently and in small, manageable chunks. I like detailed explanations for any significant changes or new features. When making changes, please ask for my approval before implementing major architectural shifts or complex features. I value clear and concise communication.

## System Architecture

DreamShift is built as a single-page application (SPA) using **React 19** with **TypeScript** for a robust and scalable frontend. **Vite** is used as the build tool for fast development and optimized production builds. Styling is managed with **Tailwind CSS** delivered via CDN for utility-first styling.

**Key Architectural Decisions & Features:**

-   **AI Integration**: Utilizes the `@google/genai` library to integrate with the Google Gemini API for AI functionalities such as resume analysis, job matching, and AI coaching.
-   **Modular Component Structure**: The application is organized into reusable React components (`components/`) and dedicated service layers (`services/`) for AI interaction (`geminiService.ts`) and local storage management (`storageService.ts`).
-   **Personal Hub Dashboard**: The default landing page features a multi-tabbed dashboard (Overview, Tasks & Reminders, Budget, Pay Calculator) providing a centralized user experience.
-   **Profile Management**: A comprehensive `UserProfile` system is implemented, allowing users to manage personal details, employment status, financial goals, and upload profile pictures. Profile data influences AI suggestions and calculator functionalities.
-   **Resume Management System**:
    -   Features a redesigned resume editor with dedicated tabs for Content, Design, and Target.
    -   `resumeParser.ts` for deterministic resume text parsing and `resumeConstraints.ts` for strict formatting rules (e.g., bullet limits, character counts).
    -   `Fit Engine` (`fitEngine.ts`) for intelligent resume compression and layout adjustment, ensuring content fits within page limits before auto-expanding to two pages.
    -   PDF export functionality using `@react-pdf/renderer` for high-quality resume generation.
-   **Financial Calculators**: An advanced Pay Calculator with dynamic salary/hourly modes, federal and state tax calculations (including 2024 brackets, Social Security, Medicare), and pre-tax deduction handling.
-   **Resource Centers**: Dedicated sections for Unemployment, Assistance, Money/Gigs, and Monetization, featuring a card-based layout with standardized hero headers and an extensive collection of resources, including state-specific unemployment data.
-   **UI/UX Design**:
    -   Standardized hero headers across major pages with consistent formatting (gradient titles, pill badges, 80% opacity background images).
    -   Card-based layouts for CoachView, FounderMode, and resource pages, featuring hover animations and consistent styling.
    -   Comprehensive dark mode support across all resource pages and components.
    -   Responsive design for various screen sizes.
-   **Settings and Support**: Enhanced settings page with tabs for FAQs, Terms of Service, notification toggles, and data management options.
-   **State Management**: Local storage is used for persistence of user data within the `Hub` and `UserProfile`, prefixed with "ds_" for DreamShift.

## External Dependencies

-   **Google Gemini API**: Integrated via `@google/genai` for all AI-powered features (resume analysis, job matching, career coaching, image generation).
-   **Tailwind CSS**: Used for styling, typically included via CDN.
-   **@react-pdf/renderer**: Used for generating PDF versions of resumes.

## Recent Changes

**December 30, 2025 - Founder Mode Multi-Select & Business Profiles**
- Created MultiSelectField component (components/MultiSelectField.tsx):
  - Styled dropdown matching single-select styling with chevron arrow
  - Displays selected items as removable chips with × button
  - Search/filter functionality for quick option finding
  - Checkbox selection UI for multiple item selection
- Updated Founder Mode name generator:
  - Replaced native multi-select with MultiSelectField for Top Skills and Interests
  - Added "Save as Business Profile" button on each generated name card
  - Saves business name and skills to profile for later use
- Added Business Profile selector to Founder Mode tools:
  - Appears at top of Logo Generator, Domain Check, Roadmap, Pitch Builder, and Revenue Strategy
  - Auto-fills business name when a saved profile is selected
  - Enables loading saved profiles across all Founder Mode tools