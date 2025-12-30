
import React, { useState, useEffect } from 'react';
import { toggleFavorite, saveHubTask, saveHubReminder, getAppSettings, getHubTasks, getHubReminders, deleteHubTask, deleteHubReminder, isFavorited } from '../services/storageService';
import heroImage from '@assets/public-bar-141_1766521510905.jpg';

const STATE_UNEMPLOYMENT_DATA: Record<string, { url: string, phone: string }> = {
    "Alabama": { url: "https://labor.alabama.gov/unemployment/", phone: "1-866-234-5382" },
    "Alaska": { url: "https://labor.alaska.gov/unemployment/", phone: "1-888-252-2557" },
    "Arizona": { url: "https://des.az.gov/services/employment/unemployment-individual", phone: "1-877-600-2722" },
    "Arkansas": { url: "https://www.dws.arkansas.gov/unemployment/", phone: "1-844-908-2178" },
    "California": { url: "https://edd.ca.gov/unemployment/", phone: "1-800-300-5616" },
    "Colorado": { url: "https://cdle.colorado.gov/unemployment", phone: "1-303-318-9000" },
    "Connecticut": { url: "https://portal.ct.gov/dol/unemployment", phone: "1-860-263-6000" },
    "Delaware": { url: "https://ui.delawareworks.com/", phone: "1-302-761-8446" },
    "Florida": { url: "https://floridajobs.org/reemploymentassistance", phone: "1-833-352-7759" },
    "Georgia": { url: "https://dol.georgia.gov/unemployment-insurance-benefits", phone: "1-877-709-8185" },
    "Hawaii": { url: "https://huiclaims.hawaii.gov/", phone: "1-808-586-8970" },
    "Idaho": { url: "https://www.labor.idaho.gov/dnn/Unemployment-Benefits", phone: "1-208-332-8942" },
    "Illinois": { url: "https://ides.illinois.gov/unemployment.html", phone: "1-800-244-5631" },
    "Indiana": { url: "https://www.in.gov/dwd/indiana-unemployment/", phone: "1-800-891-6499" },
    "Iowa": { url: "https://www.iowaworkforcedevelopment.gov/unemployment-insurance-benefits", phone: "1-866-239-0843" },
    "Kansas": { url: "https://www.getkansasbenefits.gov/", phone: "1-785-575-1460" },
    "Kentucky": { url: "https://kcc.ky.gov/career/unemployment/Pages/default.aspx", phone: "1-502-564-2900" },
    "Louisiana": { url: "https://www.laworks.net/UnemploymentInsurance/UI_MainMenu.asp", phone: "1-866-783-5567" },
    "Maine": { url: "https://www.maine.gov/unemployment/", phone: "1-800-593-7660" },
    "Maryland": { url: "https://www.dllr.state.md.us/employment/unemployment.shtml", phone: "1-410-949-0022" },
    "Massachusetts": { url: "https://www.mass.gov/unemployment-insurance-ui-online", phone: "1-877-626-6800" },
    "Michigan": { url: "https://www.michigan.gov/leo/bureaus-agencies/uia", phone: "1-866-500-0017" },
    "Minnesota": { url: "https://uimn.org/", phone: "1-651-296-3644" },
    "Mississippi": { url: "https://mdes.ms.gov/unemployment-claims/", phone: "1-888-844-3577" },
    "Missouri": { url: "https://uinteract.labor.mo.gov/", phone: "1-800-320-2519" },
    "Montana": { url: "https://uid.dli.mt.gov/", phone: "1-406-444-2545" },
    "Nebraska": { url: "https://dol.nebraska.gov/UIBenefits", phone: "1-402-458-2500" },
    "Nevada": { url: "https://ui.nv.gov/", phone: "1-775-684-0350" },
    "New Hampshire": { url: "https://www.nhes.nh.gov/services/claimants/", phone: "1-603-271-7700" },
    "New Jersey": { url: "https://www.nj.gov/labor/myunemployment/", phone: "1-201-601-4100" },
    "New Mexico": { url: "https://www.jobs.state.nm.us/vosnet/Default.aspx", phone: "1-877-664-6984" },
    "New York": { url: "https://dol.ny.gov/unemployment/file-claim", phone: "1-888-209-8124" },
    "North Carolina": { url: "https://des.nc.gov/apply-unemployment", phone: "1-888-737-0259" },
    "North Dakota": { url: "https://www.jobsnd.com/unemployment-individuals", phone: "1-701-328-4995" },
    "Ohio": { url: "https://unemployment.ohio.gov/", phone: "1-877-644-6562" },
    "Oklahoma": { url: "https://oklahoma.gov/oesc/individuals/unemployment-insurance.html", phone: "1-405-525-1500" },
    "Oregon": { url: "https://unemployment.oregon.gov/", phone: "1-877-345-3484" },
    "Pennsylvania": { url: "https://www.uc.pa.gov/", phone: "1-888-313-7284" },
    "Rhode Island": { url: "https://dlt.ri.gov/individuals/unemployment-insurance", phone: "1-401-243-9100" },
    "South Carolina": { url: "https://dew.sc.gov/individuals/unemployment-insurance", phone: "1-866-831-1724" },
    "South Dakota": { url: "https://dlr.sd.gov/ra/default.aspx", phone: "1-605-626-2452" },
    "Tennessee": { url: "https://www.tn.gov/workforce/unemployment.html", phone: "1-844-224-5818" },
    "Texas": { url: "https://www.twc.texas.gov/jobseekers/unemployment-benefits", phone: "1-800-939-6631" },
    "Utah": { url: "https://jobs.utah.gov/ui/home", phone: "1-801-526-9235" },
    "Vermont": { url: "https://labor.vermont.gov/unemployment-insurance", phone: "1-877-214-3330" },
    "Virginia": { url: "https://www.vec.virginia.gov/unemployed", phone: "1-866-832-2363" },
    "Washington": { url: "https://esd.wa.gov/unemployment", phone: "1-800-318-6022" },
    "West Virginia": { url: "https://workforcewv.org/unemployment", phone: "1-800-252-5627" },
    "Wisconsin": { url: "https://dwd.wisconsin.gov/uiben/", phone: "1-414-435-7069" },
    "Wyoming": { url: "https://wyui.wyo.gov/", phone: "1-307-473-3789" }
};

const STATES = Object.keys(STATE_UNEMPLOYMENT_DATA);

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

const SectionHeader = ({ title, subtitle, icon }: { title: string, subtitle: string, icon: string }) => (
    <div className="mb-12 scroll-mt-28 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-8">
        <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-[1.5rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-3xl shadow-xl">
                {icon}
            </div>
            <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">
                    {title}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{subtitle}</p>
            </div>
        </div>
    </div>
);

const ResourceCard = ({ title, desc, link, icon, color = "blue", badge }: any) => {
    const colorClass = COLOR_CLASSES[color] || COLOR_CLASSES.blue;
    const [isFav, setIsFav] = useState(false);
    const [isInTasks, setIsInTasks] = useState(false);
    const [isInReminders, setIsInReminders] = useState(false);
    
    useEffect(() => {
        setIsFav(isFavorited(link));
        const tasks = getHubTasks();
        setIsInTasks(tasks.some(t => t.title === `Review: ${title}`));
        const reminders = getHubReminders();
        setIsInReminders(reminders.some(r => r.title === `Review: ${title}`));
    }, [link, title]);
    
    const handleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite({ title, desc, link, icon, category: 'unemployment' });
        setIsFav(!isFav);
    };
    
    const handleToggleTask = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const tasks = getHubTasks();
        const existingTask = tasks.find(t => t.title === `Review: ${title}`);
        if (existingTask) {
            deleteHubTask(existingTask.id);
            setIsInTasks(false);
        } else {
            saveHubTask({
                title: `Review: ${title}`,
                description: desc,
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
        const existingReminder = reminders.find(r => r.title === `Review: ${title}`);
        if (existingReminder) {
            deleteHubReminder(existingReminder.id);
            setIsInReminders(false);
        } else {
            const settings = getAppSettings();
            const reminderDate = new Date();
            reminderDate.setHours(reminderDate.getHours() + settings.defaultReminderHours);
            saveHubReminder({
                title: `Review: ${title}`,
                datetime: reminderDate.toISOString(),
                completed: false
            });
            setIsInReminders(true);
        }
    };
    
    return (
        <div className="group relative flex flex-col bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-700 shadow-lg hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:border-slate-200 dark:hover:border-slate-600 hover:-translate-y-2 transition-all duration-500 h-full overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${colorClass.gradient}`}></div>
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass.gradient} opacity-5 dark:opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-15 dark:group-hover:opacity-25 transition-opacity duration-500`}></div>
            
            <div className="p-7 flex flex-col h-full relative z-10">
                <div className="flex justify-between items-start mb-5">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClass.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 border border-white/50`}>
                        <span className="drop-shadow-sm text-white">{icon}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {badge && (
                            <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 text-white dark:text-slate-900 text-[9px] font-black uppercase tracking-widest shadow-lg">
                                {badge}
                            </span>
                        )}
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
                </div>
                <a 
                    href={link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 flex flex-col"
                >
                    <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors flex items-center gap-2">
                        {title}
                        <span className="opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 text-brand-500 text-lg font-bold">↗</span>
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex-1 font-medium">{desc}</p>
                    <div className="mt-5 pt-4 border-t-2 border-slate-100 dark:border-slate-700 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest group-hover:text-brand-500 transition-colors">
                        Visit Official Site →
                    </div>
                </a>
            </div>
        </div>
    );
};

export const UnemploymentResources = () => {
    const [selectedState, setSelectedState] = useState('');

    return (
        <div className="max-w-5xl mx-auto space-y-16 pb-24">
            {/* Hero Header */}
            <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 text-white shadow-2xl border border-slate-800">
                <div className="absolute inset-0">
                    <img src={heroImage} alt="" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/50"></div>
                </div>
                <div className="relative z-10 p-10 md:p-16">
                    <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-white/10 text-blue-300">
                        Relief Access
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
                        Layoff<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-white" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Resources.</span>
                    </h1>
                    <p className="text-lg text-slate-300 leading-relaxed font-medium max-w-xl">
                        Navigate job loss with confidence. Tools for benefits, severance, 401k, and career development.
                    </p>
                </div>
            </div>

            {/* State Finder */}
            <section className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-700 shadow-xl">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">🏛️</span> State Benefits Finder
                </h3>
                <div className="flex flex-col lg:flex-row gap-8 items-end">
                    <div className="flex-1 w-full space-y-2">
                        <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Select Your Working State</label>
                        <select 
                            value={selectedState} 
                            onChange={e => setSelectedState(e.target.value)} 
                            className="w-full p-5 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none cursor-pointer text-xl font-black text-slate-800 dark:text-white transition-all appearance-none shadow-sm"
                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1.5em' }}
                        >
                            <option value="">-- Choose Your State --</option>
                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    {selectedState && STATE_UNEMPLOYMENT_DATA[selectedState] && (
                        <div className="flex gap-3 w-full lg:w-auto">
                            <a href={STATE_UNEMPLOYMENT_DATA[selectedState].url} target="_blank" rel="noreferrer" className="flex-1 lg:flex-none px-10 py-5 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 transition-all text-center whitespace-nowrap shadow-lg shadow-brand-500/20 active:scale-95">File Claim Now</a>
                            <a href={`tel:${STATE_UNEMPLOYMENT_DATA[selectedState].phone}`} className="flex-1 lg:flex-none px-10 py-5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all text-center active:scale-95 flex items-center justify-center gap-2">
                                <span>📞</span> {STATE_UNEMPLOYMENT_DATA[selectedState].phone}
                            </a>
                        </div>
                    )}
                </div>
                {selectedState && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-2xl text-xs font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <span>💡</span> Pro-tip: Keep a log of every job you apply to. Most states require this for weekly certifications.
                    </div>
                )}
            </section>

            <div className="space-y-24">
                {/* Severance Negotiation */}
                <section>
                    <SectionHeader icon="💰" title="Severance Negotiation" subtitle="Maximize your exit package and understand your rights." />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ResourceCard icon="📝" title="Severance Pay Guide" desc="Comprehensive guide on severance packages, what to expect, and how to maximize your payout." link="https://www.investopedia.com/articles/personal-finance/112015/severance-pay-what-it-and-how-it-works.asp" color="emerald" badge="Start Here" />
                        <ResourceCard icon="⚖️" title="Release Agreement Tips" desc="Understand what you're signing. Key clauses to negotiate in your separation agreement." link="https://www.nolo.com/legal-encyclopedia/severance-pay-do-you-have-right-it.html" color="blue" />
                        <ResourceCard icon="📄" title="ERISA Rights" desc="Understand your rights under ERISA for employer benefits like severance and health coverage continuation." link="https://www.dol.gov/agencies/ebsa/about-ebsa/our-activities/resource-center/faqs/benefits" color="indigo" />
                        <ResourceCard icon="🤝" title="Negotiation Strategies" desc="Expert tactics for negotiating better severance terms including extended benefits and outplacement services." link="https://hbr.org/2022/08/7-things-to-consider-before-you-sign-a-severance-agreement" color="purple" />
                        <ResourceCard icon="📊" title="Severance Calculator" desc="Estimate typical severance based on your tenure, role, and industry standards." link="https://www.salary.com/research/severance-pay-calculator" color="teal" />
                        <ResourceCard icon="📋" title="Exit Checklist" desc="Complete checklist of what to request and review before your last day at work." link="https://www.investopedia.com/articles/personal-finance/112015/severance-pay-what-it-and-how-it-works.asp" color="orange" />
                    </div>
                </section>

                {/* 401k & Retirement */}
                <section>
                    <SectionHeader icon="🏦" title="401k & Retirement" subtitle="Protect your retirement funds during job transitions." />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ResourceCard icon="💼" title="401k Rollover Guide" desc="Step-by-step guide to rolling over your 401k to an IRA or new employer plan without penalties." link="https://www.investopedia.com/articles/personal-finance/072215/401k-rollover-rules.asp" color="blue" badge="Essential" />
                        <ResourceCard icon="📈" title="IRA Options" desc="Compare Traditional vs Roth IRA options when rolling over your 401k funds." link="https://www.fidelity.com/viewpoints/retirement/rollover-ira" color="emerald" />
                        <ResourceCard icon="🚫" title="Avoid 401k Mistakes" desc="Common 401k mistakes during job loss and how to avoid early withdrawal penalties." link="https://www.nerdwallet.com/article/investing/401k-rollover" color="red" />
                        <ResourceCard icon="⏰" title="Rollover Timeline" desc="Understand the 60-day rollover rule and how to avoid accidental distributions." link="https://www.irs.gov/retirement-plans/plan-participant-employee/rollovers-of-retirement-plan-and-ira-distributions" color="yellow" />
                        <ResourceCard icon="💰" title="Vesting Schedule" desc="Understand which employer contributions you're entitled to keep based on your vesting period." link="https://www.investopedia.com/terms/v/vesting.asp" color="indigo" />
                        <ResourceCard icon="📊" title="Retirement Calculators" desc="Free tools to recalculate your retirement timeline based on your new situation." link="https://www.bankrate.com/retirement/calculators/retirement-plan-calculator/" color="teal" />
                    </div>
                </section>

                {/* Rights & Reporting */}
                <section>
                    <SectionHeader icon="⚖️" title="Rights & Reporting" subtitle="Know your legal protections and how to file complaints." />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ResourceCard icon="📜" title="WARN Act Rights" desc="Federal law requiring 60 days notice for mass layoffs at large companies. Check if you were entitled to notice." link="https://www.dol.gov/agencies/eta/layoffs/warn" color="red" badge="Legal Guard" />
                        <ResourceCard icon="⚖️" title="EEOC Discrimination" desc="The U.S. Equal Employment Opportunity Commission. Protect yourself if you believe your termination was illegal." link="https://www.eeoc.gov/filing-charge-discrimination" color="slate" />
                        <ResourceCard icon="💼" title="Severance Negotiation" desc="An expert guide on how to negotiate your severance package and understand release agreements." link="https://www.investopedia.com/articles/personal-finance/112015/severance-pay-what-it-and-how-it-works.asp" color="emerald" />
                        <ResourceCard icon="⚖️" title="NLRB Protections" desc="Know your rights to engage in 'protected concerted activity' and discuss working conditions with colleagues." link="https://www.nlrb.gov/about-nlrb/rights-we-protect" color="blue" />
                        <ResourceCard icon="🏛️" title="State Labor Offices" desc="Every state has a Department of Labor that handles wage disputes and local worker protections." link="https://www.dol.gov/agencies/whd/state/contacts" color="yellow" />
                        <ResourceCard icon="📚" title="Legal Aid Search" desc="Find free or low-cost legal help in your community for unemployment appeals or contract disputes." link="https://www.lsc.gov/about-lsc/what-legal-aid/get-legal-help" color="purple" />
                    </div>
                </section>

                {/* Career Development */}
                <section>
                    <SectionHeader icon="📈" title="Career Development" subtitle="Build new skills and credentials for your next role." />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ResourceCard icon="🎓" title="Coursera" desc="Free courses from top universities. Many offer financial aid for certificates during unemployment." link="https://www.coursera.org/" color="blue" badge="Free Courses" />
                        <ResourceCard icon="💻" title="LinkedIn Learning" desc="1 month free trial. Business, tech, and creative skills with certificates you can add to your profile." link="https://www.linkedin.com/learning/" color="indigo" />
                        <ResourceCard icon="📚" title="edX" desc="Free online courses from Harvard, MIT, and more. Audit most courses at no cost." link="https://www.edx.org/" color="red" />
                        <ResourceCard icon="🔧" title="Google Certificates" desc="Professional certificates in IT, Data Analytics, UX Design, and Project Management with job placement support." link="https://grow.google/certificates/" color="emerald" badge="Job Ready" />
                        <ResourceCard icon="⌨️" title="freeCodeCamp" desc="Learn to code for free. Full-stack web development curriculum with certifications." link="https://www.freecodecamp.org/" color="slate" />
                        <ResourceCard icon="📊" title="Khan Academy" desc="Free education for anyone, anywhere. Great for brushing up on fundamentals in any subject." link="https://www.khanacademy.org/" color="teal" />
                    </div>
                </section>

                {/* Job Search Tools */}
                <section>
                    <SectionHeader icon="🔍" title="Job Search Tools" subtitle="Find your next opportunity with top job platforms." />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ResourceCard icon="💼" title="LinkedIn Jobs" desc="The world's largest professional network. Set up job alerts and let recruiters find you." link="https://www.linkedin.com/jobs/" color="blue" badge="Essential" />
                        <ResourceCard icon="🔍" title="Indeed" desc="The largest job search engine. Search millions of jobs and set up instant alerts." link="https://www.indeed.com/" color="indigo" />
                        <ResourceCard icon="🏢" title="Glassdoor" desc="Job listings with salary data and company reviews. Know what you're getting into." link="https://www.glassdoor.com/" color="emerald" />
                        <ResourceCard icon="🎯" title="ZipRecruiter" desc="AI-powered job matching. Get matched with jobs based on your resume." link="https://www.ziprecruiter.com/" color="orange" />
                        <ResourceCard icon="🏠" title="Remote.co" desc="Curated remote job listings. Find legitimate work-from-home opportunities." link="https://remote.co/" color="purple" />
                        <ResourceCard icon="🚀" title="AngelList / Wellfound" desc="Jobs at startups. Often more flexible and willing to take chances on career changers." link="https://wellfound.com/" color="slate" />
                    </div>
                </section>

                {/* Community Support */}
                <section>
                    <SectionHeader icon="🤗" title="Community Support" subtitle="Connect with others navigating similar challenges." />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ResourceCard icon="👥" title="Layoffs.fyi" desc="Track tech layoffs in real-time. Community support and job resources for those affected." link="https://layoffs.fyi/" color="red" badge="Tech Support" />
                        <ResourceCard icon="💬" title="r/layoffs" desc="Reddit community for layoff support. Share experiences and get advice from others going through it." link="https://www.reddit.com/r/layoffs/" color="orange" />
                        <ResourceCard icon="🤝" title="Meetup" desc="Find local networking events and professional groups. Build connections in your field." link="https://www.meetup.com/" color="red" />
                        <ResourceCard icon="📝" title="Blind" desc="Anonymous professional network. Get honest insights about companies and salaries." link="https://www.teamblind.com/" color="slate" />
                        <ResourceCard icon="🎤" title="Toastmasters" desc="Improve your communication and leadership skills. Great for interview prep." link="https://www.toastmasters.org/" color="blue" />
                        <ResourceCard icon="💪" title="Local Workforce Centers" desc="Free career counseling, resume help, and job training at your local American Job Center." link="https://www.careeronestop.org/LocalHelp/AmericanJobCenters/find-american-job-centers.aspx" color="emerald" badge="Free Help" />
                        <ResourceCard icon="🌐" title="LinkedIn Groups" desc="Join industry-specific groups to network, share opportunities, and get support." link="https://www.linkedin.com/groups/" color="blue" />
                        <ResourceCard icon="📱" title="Fishbowl" desc="Professional community organized by industry. Anonymous discussions about work and career." link="https://www.fishbowlapp.com/" color="teal" />
                        <ResourceCard icon="🎯" title="Lunchclub" desc="AI-powered networking that matches you with relevant professionals for 1:1 video calls." link="https://lunchclub.com/" color="purple" />
                    </div>
                </section>

                {/* Resume & Interview */}
                <section>
                    <SectionHeader icon="📝" title="Resume & Interview Prep" subtitle="Polish your materials and ace your interviews." />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ResourceCard icon="📄" title="Resume Worded" desc="AI-powered resume and LinkedIn review. Get instant feedback to improve your application materials." link="https://resumeworded.com/" color="blue" badge="AI-Powered" />
                        <ResourceCard icon="🎯" title="Jobscan" desc="Optimize your resume for ATS systems. Match your resume to job descriptions." link="https://www.jobscan.co/" color="emerald" />
                        <ResourceCard icon="🎤" title="Pramp" desc="Free mock interviews with peers. Practice coding, product, and behavioral interviews." link="https://www.pramp.com/" color="indigo" />
                        <ResourceCard icon="💻" title="Interviewing.io" desc="Anonymous technical interview practice with engineers from top companies." link="https://interviewing.io/" color="slate" />
                        <ResourceCard icon="📚" title="Glassdoor Interview Questions" desc="Real interview questions from candidates who interviewed at your target company." link="https://www.glassdoor.com/Interview/index.htm" color="teal" />
                        <ResourceCard icon="🤖" title="Interview Warmup" desc="Google's free AI interview practice tool. Get feedback on your answers." link="https://grow.google/certificates/interview-warmup/" color="blue" />
                    </div>
                </section>

                {/* Financial Planning */}
                <section>
                    <SectionHeader icon="💰" title="Financial Planning" subtitle="Manage your finances during the transition." />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ResourceCard icon="📊" title="Mint" desc="Free budgeting app to track spending, create budgets, and monitor your financial health." link="https://mint.intuit.com/" color="emerald" badge="Free" />
                        <ResourceCard icon="💳" title="Credit Karma" desc="Free credit monitoring and personalized financial recommendations." link="https://www.creditkarma.com/" color="blue" />
                        <ResourceCard icon="📈" title="YNAB" desc="You Need A Budget - proactive budgeting method perfect for uncertain income situations." link="https://www.ynab.com/" color="teal" />
                        <ResourceCard icon="🏦" title="NerdWallet" desc="Compare financial products, credit cards, and get personalized money advice." link="https://www.nerdwallet.com/" color="indigo" />
                        <ResourceCard icon="📱" title="Copilot" desc="Smart money management app with insights and tracking for your financial life." link="https://copilot.money/" color="purple" />
                        <ResourceCard icon="💡" title="Bankrate Calculators" desc="Financial calculators for budgeting, debt payoff, and emergency fund planning." link="https://www.bankrate.com/calculators/" color="orange" />
                    </div>
                </section>
            </div>
        </div>
    );
};
