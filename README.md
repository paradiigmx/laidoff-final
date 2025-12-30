<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# DreamShift

A comprehensive AI-powered career assistance platform built with React, TypeScript, and Vite. DreamShift helps people recover after layoffs, find jobs, make money, and start businesses with personalized AI guidance.

## 🚀 Features

- **Resume Lab** - AI-powered resume creation and optimization with professional templates
- **Job Hunter** - AI-powered job matching and search
- **Coaching** - AI career coaching with interview practice and career guidance
- **Founder Mode** - Tools for entrepreneurs to start and grow businesses
- **Gigs** - Resources for finding gig work and side income
- **Monetization** - Tools and resources for monetizing skills
- **Unemployment Resources** - Severance negotiation, 401k guidance, rights & reporting
- **Assistance** - Financial support, healthcare, mental health resources
- **Personal Hub** - Dashboard with tasks, reminders, budget tracking, and pay calculator

## 📋 Prerequisites

- **Node.js** 18+ (recommended: Node.js 20+)
- **npm** or **yarn**
- **Gemini API Key** - Get yours from [Google AI Studio](https://aistudio.google.com/app/apikey)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd DreamLift-2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

## 🏗️ Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

To preview the production build:
```bash
npm run preview
```

## 📁 Project Structure

```
├── components/          # React components
│   ├── Hub.tsx         # Personal dashboard
│   ├── ResumeView.tsx  # Resume editor
│   ├── JobFinder.tsx   # Job search
│   ├── CoachView.tsx   # AI coaching
│   └── ...
├── services/
│   ├── geminiService.ts  # AI API integration
│   └── storageService.ts # Local storage utilities
├── attached_assets/     # Images and assets
├── App.tsx             # Main application component
├── vite.config.ts      # Vite configuration
└── package.json
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | Yes |
| `GOOGLE_API_KEY` | Alternative Google API key | No |
| `AI_INTEGRATIONS_GEMINI_API_KEY` | Replit AI Integrations key (Replit only) | No |
| `AI_INTEGRATIONS_GEMINI_BASE_URL` | Replit AI Integrations URL (Replit only) | No |

## 🛡️ Security Notes

- **Never commit** `.env` or `.env.local` files to version control
- API keys are loaded from environment variables only
- All sensitive data is stored locally in the browser (localStorage)
- No backend server required - fully client-side application

## 🧪 Tech Stack

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS (via CDN)
- **AI Integration**: Google Gemini API (@google/genai)
- **PDF Generation**: @react-pdf/renderer

## 📝 Development

The development server runs on port **5173** by default (configurable in `vite.config.ts`).

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🚢 Deployment

### Vercel / Netlify

1. Connect your GitHub repository
2. Set environment variables in the platform dashboard
3. Deploy automatically on push

### Static Hosting

1. Run `npm run build`
2. Upload the `dist/` folder to your hosting provider
3. Ensure your server serves `index.html` for all routes (SPA routing)

### Replit

The project includes Replit configuration in `.replit` file. For Replit deployment:
- Use Replit AI Integrations for API access
- Set `AI_INTEGRATIONS_GEMINI_API_KEY` and `AI_INTEGRATIONS_GEMINI_BASE_URL` in Replit secrets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary. All rights reserved.

## 🆘 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Note**: This application requires a valid Gemini API key to function. Make sure to set up your environment variables before running the app.
