import React, { useState, useEffect } from 'react';
import { AppView } from '../types';
import heroImage from '@assets/public-bar-141_1766521510905.jpg';
import { toggleFavorite, saveHubTask, saveHubReminder, getHubTasks, getHubReminders, deleteHubTask, deleteHubReminder, isFavorited, getAppSettings } from '../services/storageService';

interface SeveranceHubProps {
  onNavigate: (view: AppView, articleId?: string) => void;
}

const SEVERANCE_ARTICLES = [
  {
    id: 'understanding-basics',
    title: 'Understanding Severance Pay: The Basics',
    icon: '📚',
    color: 'emerald',
    description: 'Learn what severance pay is, when it\'s required, and what to expect in your package.',
    badge: 'Start Here',
    website: 'https://www.dol.gov/general/topic/wages/severancepay'
  },
  {
    id: 'how-to-calculate',
    title: 'How to Calculate Severance Pay',
    icon: '📊',
    color: 'blue',
    description: 'Standard formulas and factors that determine your severance amount.',
    website: 'https://www.dol.gov/general/topic/wages/severancepay'
  },
  {
    id: 'negotiating',
    title: 'Negotiating Your Severance Package',
    icon: '🤝',
    color: 'purple',
    description: 'Expert strategies for negotiating better severance terms and benefits.',
    website: 'https://www.eeoc.gov/laws/guidance/qa-understanding-waivers-discrimination-claims-employee-severance-agreements'
  },
  {
    id: 'understanding-agreements',
    title: 'Understanding Severance Agreements and Releases',
    icon: '⚖️',
    color: 'indigo',
    description: 'Key clauses, release of claims, and what you\'re agreeing to when you sign.',
    website: 'https://www.eeoc.gov/laws/guidance/qa-understanding-waivers-discrimination-claims-employee-severance-agreements'
  },
  {
    id: 'cobra-health-insurance',
    title: 'COBRA Health Insurance After Job Loss',
    icon: '🏥',
    color: 'red',
    description: 'Your rights to continued health coverage and how COBRA works.',
    website: 'https://www.dol.gov/general/topic/health-plans/cobra'
  },
  {
    id: 'severance-unemployment',
    title: 'Severance and Unemployment Benefits',
    icon: '💼',
    color: 'teal',
    description: 'How severance affects your unemployment eligibility and benefits.',
    website: 'https://www.dol.gov/general/topic/unemployment-insurance'
  },
  {
    id: 'rights-over-40',
    title: 'Rights for Workers Over 40 (OWBPA)',
    icon: '👔',
    color: 'orange',
    description: 'Special protections under the Older Workers Benefit Protection Act.',
    website: 'https://www.eeoc.gov/age-discrimination'
  },
  {
    id: 'taxes-on-severance',
    title: 'Taxes on Severance Pay',
    icon: '💰',
    color: 'yellow',
    description: 'How severance is taxed and strategies to manage your tax burden.',
    website: 'https://www.irs.gov/taxtopics/tc412'
  },
];

const RETIREMENT_ARTICLES = [
  {
    id: '401k-rollover-guide',
    title: '401(k) Rollover Guide: Moving Your Retirement Savings',
    icon: '💼',
    color: 'blue',
    description: 'Step-by-step guide to rolling over your 401(k) to an IRA or new employer plan without penalties.',
    badge: 'Essential',
    website: 'https://www.irs.gov/retirement-plans/plan-participant-employee/rollovers-of-retirement-plan-and-ira-distributions'
  },
  {
    id: 'traditional-vs-roth-ira',
    title: 'Traditional vs. Roth IRA: Choosing the Right Rollover Destination',
    icon: '📈',
    color: 'emerald',
    description: 'Compare Traditional vs Roth IRA options when rolling over your 401(k) funds.',
    website: 'https://www.irs.gov/retirement-plans/traditional-and-roth-iras'
  },
  {
    id: 'avoid-401k-mistakes',
    title: 'Avoid Common 401(k) Mistakes During Job Loss',
    icon: '🚫',
    color: 'red',
    description: 'Common 401(k) mistakes during job loss and how to avoid early withdrawal penalties.',
    website: 'https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-tax-on-early-distributions'
  },
  {
    id: '60-day-rollover-rule',
    title: 'The 60-Day Rollover Rule: What You Need to Know',
    icon: '⏰',
    color: 'yellow',
    description: 'Understand the 60-day rollover rule and how to avoid accidental distributions.',
    website: 'https://www.irs.gov/retirement-plans/plan-participant-employee/rollovers-of-retirement-plan-and-ira-distributions'
  },
  {
    id: 'understanding-vesting-schedules',
    title: 'Understanding Vesting Schedules',
    icon: '💰',
    color: 'indigo',
    description: 'Understand which employer contributions you\'re entitled to keep based on your vesting period.',
    website: 'https://www.dol.gov/sites/dolgov/files/ebsa/about-ebsa/our-activities/resource-center/publications/what-you-should-know-about-your-retirement-plan.pdf'
  },
  {
    id: 'early-withdrawal-penalties-exceptions',
    title: 'Early Withdrawal Penalties and Exceptions',
    icon: '⚠️',
    color: 'orange',
    description: 'Learn about early withdrawal penalties and the exceptions that may apply to your situation.',
    website: 'https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-tax-on-early-distributions'
  },
  {
    id: 'retirement-planning-resources',
    title: 'Retirement Planning Resources',
    icon: '📊',
    color: 'teal',
    description: 'Comprehensive resources and tools for retirement planning after job loss.',
    website: 'https://www.dol.gov/general/topic/retirement'
  },
];

const RIGHTS_ARTICLES = [
  {
    id: 'warn-act-rights',
    title: 'WARN Act Rights',
    icon: '📜',
    color: 'red',
    description: 'Federal law requiring 60 days notice for mass layoffs at large companies. Check if you were entitled to notice.',
    badge: 'Legal Guard',
    website: 'https://www.dol.gov/agencies/eta/layoffs/warn'
  },
  {
    id: 'eeoc-discrimination-guide',
    title: 'EEOC Discrimination Guide',
    icon: '⚖️',
    color: 'slate',
    description: 'The U.S. Equal Employment Opportunity Commission. Protect yourself if you believe your termination was illegal.',
    website: 'https://publicportal.eeoc.gov'
  },
  {
    id: 'nlrb-protected-activity',
    title: 'NLRB Protected Activity',
    icon: '🤝',
    color: 'blue',
    description: 'Know your rights to engage in \'protected concerted activity\' and discuss working conditions with colleagues.',
    website: 'https://www.nlrb.gov/about-nlrb/rights-we-protect'
  },
  {
    id: 'state-labor-offices-wage-claims',
    title: 'State Labor Offices & Wage Claims',
    icon: '🏛️',
    color: 'yellow',
    description: 'Every state has a Department of Labor that handles wage disputes and local worker protections.',
    website: 'https://www.dol.gov/agencies/whd/state/contacts'
  },
  {
    id: 'finding-free-legal-help',
    title: 'Finding Free Legal Help',
    icon: '📚',
    color: 'purple',
    description: 'Find free or low-cost legal help in your community for unemployment appeals or contract disputes.',
    website: 'https://www.lsc.gov/find-legal-aid'
  },
  {
    id: 'whistleblower-protections',
    title: 'Whistleblower Protections',
    icon: '🛡️',
    color: 'orange',
    description: 'Understand your rights when reporting workplace violations, safety issues, or illegal activities.',
    website: 'https://www.whistleblowers.gov'
  },
  {
    id: 'documenting-workplace-issues',
    title: 'Documenting Workplace Issues',
    icon: '📝',
    color: 'indigo',
    description: 'Learn how to properly document workplace problems, discrimination, or violations for legal purposes.',
    website: 'https://www.eeoc.gov/filing-charge-discrimination'
  },
];

const COLOR_CLASSES: Record<string, { gradient: string }> = {
  orange: { gradient: 'from-orange-500 to-orange-600' },
  emerald: { gradient: 'from-emerald-500 to-emerald-600' },
  blue: { gradient: 'from-blue-500 to-blue-600' },
  yellow: { gradient: 'from-yellow-500 to-amber-500' },
  indigo: { gradient: 'from-indigo-500 to-indigo-600' },
  red: { gradient: 'from-red-500 to-red-600' },
  slate: { gradient: 'from-slate-600 to-slate-800' },
  purple: { gradient: 'from-purple-500 to-purple-600' },
  pink: { gradient: 'from-pink-500 to-pink-600' },
  teal: { gradient: 'from-teal-500 to-teal-600' },
};

const RIBBON_COLORS: Record<string, string> = {
  'Start Here': 'from-emerald-500 to-green-500',
  'Essential': 'from-blue-500 to-indigo-500',
  'Legal Guard': 'from-red-500 to-rose-500',
  'default': 'from-purple-500 to-indigo-500'
};

const ArticleCard = ({ article, onNavigate }: { article: typeof SEVERANCE_ARTICLES[0], onNavigate: (view: AppView, articleId?: string) => void }) => {
  const colorClass = COLOR_CLASSES[article.color] || COLOR_CLASSES.blue;
  const ribbonColor = article.badge ? (RIBBON_COLORS[article.badge] || RIBBON_COLORS['default']) : '';
  const [isFav, setIsFav] = useState(false);
  const [isInTasks, setIsInTasks] = useState(false);
  const [isInReminders, setIsInReminders] = useState(false);
  
  useEffect(() => {
    const articleId = `severance-article-${article.id}`;
    setIsFav(isFavorited(articleId));
    const tasks = getHubTasks();
    setIsInTasks(tasks.some(t => t.title === `Review: ${article.title}`));
    const reminders = getHubReminders();
    setIsInReminders(reminders.some(r => r.title === `Review: ${article.title}`));
  }, [article.id, article.title]);
  
  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const articleId = `severance-article-${article.id}`;
    toggleFavorite({ 
      id: articleId, 
      title: article.title, 
      description: article.description, 
      link: `#article-${article.id}`, 
      category: 'severance', 
      date: new Date().toISOString() 
    });
    setIsFav(!isFav);
  };
  
  const handleToggleTask = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const tasks = getHubTasks();
    const existingTask = tasks.find(t => t.title === `Review: ${article.title}`);
    if (existingTask) {
      deleteHubTask(existingTask.id);
      setIsInTasks(false);
    } else {
      saveHubTask({
        title: `Review: ${article.title}`,
        description: article.description,
        completed: false,
        priority: 'medium',
        category: 'other'
      });
      setIsInTasks(true);
    }
  };
  
  const handleToggleReminder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const reminders = getHubReminders();
    const existingReminder = reminders.find(r => r.title === `Review: ${article.title}`);
    if (existingReminder) {
      deleteHubReminder(existingReminder.id);
      setIsInReminders(false);
    } else {
      const settings = getAppSettings();
      const reminderDate = new Date();
      reminderDate.setHours(reminderDate.getHours() + settings.defaultReminderHours);
      saveHubReminder({
        title: `Review: ${article.title}`,
        datetime: reminderDate.toISOString(),
        completed: false
      });
      setIsInReminders(true);
    }
  };

  const handleReadArticle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigate(AppView.SEVERANCE_ARTICLE, article.id);
  };

  const handleVisitWebsite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (article.website) {
      window.open(article.website, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className="group relative flex flex-col bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-700 shadow-lg hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:border-slate-200 dark:hover:border-slate-600 hover:-translate-y-2 transition-all duration-500 h-full overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${colorClass.gradient}`}></div>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass.gradient} opacity-5 dark:opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-15 dark:group-hover:opacity-25 transition-opacity duration-500`}></div>
      
      {article.badge && (
        <div className={`absolute bottom-0 left-0 right-0 py-2 px-4 bg-gradient-to-r ${ribbonColor} text-white text-center z-20`}>
          <span className="text-[10px] font-black uppercase tracking-widest">{article.badge}</span>
        </div>
      )}
      
      <div className={`p-7 flex flex-col h-full relative z-10 ${article.badge ? 'pb-14' : ''}`}>
        <div className="flex justify-between items-start mb-5">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClass.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 border border-white/50`}>
            <span className="drop-shadow-sm text-white">{article.icon}</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleFavorite}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center text-lg transition-all ${
                isFav 
                  ? 'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-40 hover:opacity-60 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:border-pink-200 dark:hover:border-pink-800'
              }`}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              ❤️
            </button>
            <button
              onClick={handleToggleTask}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center text-lg transition-all ${
                isInTasks 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-40 hover:opacity-60 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800'
              }`}
              title={isInTasks ? 'Remove from tasks' : 'Add to tasks'}
            >
              ✅
            </button>
            <button
              onClick={handleToggleReminder}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center text-lg transition-all ${
                isInReminders 
                  ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-40 hover:opacity-60 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800'
              }`}
              title={isInReminders ? 'Remove from reminders' : 'Add to reminders'}
            >
              ⏰
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col mb-6">
          <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {article.title}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex-1 font-medium">{article.description}</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-auto pt-4 border-t-2 border-slate-100 dark:border-slate-700">
          <button
            onClick={handleReadArticle}
            className="w-full px-6 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-black rounded-xl shadow-lg shadow-slate-500/30 hover:shadow-xl hover:shadow-slate-500/40 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>📖</span>
            <span>Read Article</span>
            <span>→</span>
          </button>
          {article.website && (
            <button
              onClick={handleVisitWebsite}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-800 hover:to-brand-900 text-white font-black rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-700/40 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>🌐</span>
              <span>Visit Website</span>
              <span>↗</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const SeveranceHub: React.FC<SeveranceHubProps> = ({ onNavigate }) => {
  const [showCalculator, setShowCalculator] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-24">
      {/* Hero Header */}
      <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 text-white shadow-2xl border border-slate-800">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/50"></div>
        </div>
        <div className="relative z-10 p-10 md:p-16">
          <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-white/10 text-emerald-300">
            Severance Hub
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
            Layoff<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-white" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Resources.</span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed font-medium max-w-xl">
            Comprehensive guides on severance pay, negotiation strategies, legal rights, and tax implications.
          </p>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="mt-16 bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-slate-700 shadow-xl">
        {/* Severance Hub Section */}
        <section>
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-4xl shadow-lg">
              💰
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">
                Severance Hub
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-base font-medium">Comprehensive guides on severance pay, negotiation, and your rights</p>
            </div>
          </div>

          {/* Severance Calculator */}
          <div className="bg-gradient-to-br from-green-50 via-green-50 to-green-50 dark:from-slate-700 dark:via-slate-700 dark:to-slate-800 rounded-2xl p-6 md:p-8 border-2 border-green-200 dark:border-green-800 shadow-lg mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-green-700 to-green-800 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white mb-1">💰 Calculate Your Severance</h3>
                    <p className="text-sm text-green-100">Enter your details to estimate your severance package</p>
                  </div>
                  <button
                    onClick={() => setShowCalculator(!showCalculator)}
                    className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-black transition-colors border border-white/30"
                  >
                    {showCalculator ? 'Hide Calculator' : 'Open Calculator'} →
                  </button>
                </div>
              </div>
              {showCalculator && (
                <div className="p-6">
                  <SeveranceCalculator />
                </div>
              )}
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {SEVERANCE_ARTICLES.map((article) => (
              <ArticleCard key={article.id} article={article} onNavigate={onNavigate} />
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="border-t-2 border-slate-200 dark:border-slate-700 my-12"></div>

        {/* 401k & Retirement Section */}
        <section>
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl shadow-lg">
              🏦
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">
                401k & Retirement
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-base font-medium">Protect your retirement funds during job transitions</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {RETIREMENT_ARTICLES.map((article) => (
              <ArticleCard key={article.id} article={article} onNavigate={onNavigate} />
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="border-t-2 border-slate-200 dark:border-slate-700 my-12"></div>

        {/* Rights & Reporting Section */}
        <section>
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-4xl shadow-lg">
              ⚖️
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">
                Rights & Reporting
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-base font-medium">Know your legal protections and how to file complaints</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {RIGHTS_ARTICLES.map((article) => (
              <ArticleCard key={article.id} article={article} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

// Severance Calculator Component
const SeveranceCalculator = () => {
  const [annualSalary, setAnnualSalary] = useState('');
  const [yearsOfService, setYearsOfService] = useState('');
  const [weeksPerYear, setWeeksPerYear] = useState('2');
  const [result, setResult] = useState<{ weeklySalary: number; totalSeverance: number; months: number } | null>(null);

  const calculate = () => {
    const salary = parseFloat(annualSalary);
    const years = parseFloat(yearsOfService);
    const weeks = parseFloat(weeksPerYear);

    if (salary && years && weeks) {
      const weeklySalary = salary / 52;
      const totalSeverance = weeklySalary * weeks * years;
      const months = (weeks * years) / 4.33; // Average weeks per month
      setResult({ weeklySalary, totalSeverance, months });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">
            Annual Salary ($)
          </label>
          <input
            type="number"
            value={annualSalary}
            onChange={(e) => setAnnualSalary(e.target.value)}
            placeholder="60000"
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">
            Years of Service
          </label>
          <input
            type="number"
            value={yearsOfService}
            onChange={(e) => setYearsOfService(e.target.value)}
            placeholder="5"
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">
            Weeks of Pay Per Year
          </label>
          <select
            value={weeksPerYear}
            onChange={(e) => setWeeksPerYear(e.target.value)}
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none"
          >
            <option value="1">1 week per year</option>
            <option value="2">2 weeks per year</option>
            <option value="3">3 weeks per year</option>
            <option value="4">4 weeks per year</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={calculate}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-700 to-green-800 text-white font-black rounded-xl hover:shadow-lg hover:scale-105 transition-all"
          >
            Calculate
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-green-50 dark:from-green-900/20 dark:to-green-900/20 rounded-2xl border-2 border-green-200 dark:border-green-800">
          <h4 className="text-xl font-black text-slate-900 dark:text-white mb-4">Estimated Severance</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Weekly Salary:</span>
                <span className="text-2xl font-black text-green-700 dark:text-green-400">
                ${result.weeklySalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Total Severance:</span>
              <span className="text-3xl font-black text-green-700 dark:text-green-400">
                ${result.totalSeverance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-green-200 dark:border-green-700">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Equivalent to:</span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {result.months.toFixed(1)} months
              </span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg text-xs text-slate-600 dark:text-slate-400">
            <strong>Note:</strong> This is an estimate. Actual severance may vary based on company policy, your role, and negotiation.
          </div>
        </div>
      )}
    </div>
  );
};

