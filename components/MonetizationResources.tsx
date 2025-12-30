
import React, { useState, useEffect } from 'react';
import { toggleFavorite, isFavorited, saveHubTask, saveHubReminder, getAppSettings, getHubTasks, getHubReminders, deleteHubTask, deleteHubReminder } from '../services/storageService';
import heroImage from '@assets/kit-formerly-convertkit--CbLJAUI_js-unsplash_1766438656267.jpg';

interface ResourceDetails {
    pros: string[];
    cons: string[];
    tips: string[];
    requirements: string[];
    bestFit: string;
}

const ResourceCard = ({ title, description, link, tags, icon, badge, colorClass = "from-blue-500 to-cyan-500", details }: { title: string, description: string, link: string, tags: string[], icon: string, badge?: string, colorClass?: string, details?: ResourceDetails }) => {
    const [isFav, setIsFav] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
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
        toggleFavorite({
            id: link,
            title,
            link,
            description,
            category: 'monetization',
            date: new Date().toISOString()
        });
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
                description,
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
        <div className="group relative flex flex-col bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 shadow-lg hover:shadow-2xl hover:shadow-brand-100/50 dark:hover:shadow-slate-900/50 hover:border-brand-200 dark:hover:border-slate-600 hover:-translate-y-2 transition-all duration-500 overflow-hidden h-full">
            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${colorClass}`}></div>
            <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${colorClass} opacity-5 dark:opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity duration-500`}></div>
            
            <div className="p-8 flex flex-col h-full relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 border-2 border-white/50`}>
                        <span className="drop-shadow-lg filter">{icon}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {badge && (
                            <span className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 text-white dark:text-slate-900 shadow-lg">
                                {badge}
                            </span>
                        )}
                        <div className="flex gap-1">
                            <button 
                                onClick={handleFavorite}
                                className={`w-9 h-9 rounded-lg border flex items-center justify-center text-lg transition-all z-20 ${
                                    isFav 
                                        ? 'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700' 
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-40 hover:opacity-60 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:border-pink-200 dark:hover:border-pink-800'
                                }`}
                                title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                            >
                                {isFav ? '❤️' : '🤍'}
                            </button>
                            <button
                                onClick={handleToggleTask}
                                className={`w-9 h-9 rounded-lg border flex items-center justify-center text-lg transition-all ${
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
                                className={`w-9 h-9 rounded-lg border flex items-center justify-center text-lg transition-all ${
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

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors flex items-center gap-2">
                    {title}
                    <span className="opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 text-brand-500 text-lg font-bold">↗</span>
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 font-medium flex-1">{description}</p>
                
                {details?.bestFit && (
                   <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-700 dark:to-slate-800 rounded-2xl border border-slate-100 dark:border-slate-600 group-hover:from-brand-50/50 dark:group-hover:from-brand-900/20 group-hover:to-white dark:group-hover:to-slate-800 transition-colors shadow-inner">
                       <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Ideal Channel</span>
                       <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-relaxed block">{details.bestFit}</span>
                   </div>
                )}

                <div className="flex flex-wrap gap-2 mb-6">
                    {tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1.5 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider rounded-full border-2 border-slate-100 dark:border-slate-600 group-hover:border-brand-200 dark:group-hover:border-brand-700 group-hover:text-brand-700 dark:group-hover:text-brand-300 group-hover:bg-brand-50/50 dark:group-hover:bg-brand-900/30 transition-all shadow-sm">
                            #{tag}
                        </span>
                    ))}
                </div>

                <div className="mt-auto space-y-3">
                    <a href={link} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-700 dark:to-slate-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:from-brand-600 hover:to-brand-500 transition-all shadow-xl shadow-slate-900/20 group-hover:shadow-brand-500/20">
                        Launch Platform ↗
                    </a>
                    {details && (
                        <button 
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-full py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center justify-center gap-2"
                        >
                            <span>{isOpen ? 'Hide Details' : 'View Insights'}</span>
                            <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                    )}
                </div>
            </div>

            {isOpen && details && (
                <div className="px-8 pb-8 pt-4 border-t border-slate-50 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/50 animate-in slide-in-from-top-4 duration-300">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-2 flex items-center gap-2">📋 Requirements</h4>
                            <ul className="space-y-1">
                                {details.requirements.map((r, i) => <li key={i} className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex gap-2"><span>•</span> {r}</li>)}
                            </ul>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">👍 Pros</h4>
                                <ul className="space-y-1">
                                    {details.pros.map((p, i) => <li key={i} className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{p}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-2">👎 Cons</h4>
                                <ul className="space-y-1">
                                    {details.cons.map((c, i) => <li key={i} className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{c}</li>)}
                                </ul>
                            </div>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-700 rounded-2xl border border-slate-100 dark:border-slate-600 shadow-sm">
                            <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">💡 Winning Strategy</h4>
                            <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 italic leading-relaxed">"{details.tips[0]}"</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SectionHeader = ({ title, subtitle, id, icon }: { title: string, subtitle: string, id: string, icon: string }) => (
    <div id={id} className="mb-12 scroll-mt-28 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-8 mt-24 first:mt-0">
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

export const MonetizationResources = () => {
    return (
        <div className="pb-20 max-w-6xl mx-auto">
            <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 text-white mb-16 shadow-2xl border border-slate-800">
                <div className="absolute inset-0">
                    <img src={heroImage} alt="" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/50"></div>
                </div>
                <div className="relative z-10 p-10 md:p-16">
                    <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-white/10 text-brand-300">
                        Independent Revenue
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
                        Build Your<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-200" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Platform.</span>
                    </h1>
                    <p className="text-lg text-slate-300 leading-relaxed font-medium max-w-xl">
                        Leverage existing audiences and tools to turn your expertise into direct cash flow.
                    </p>
                </div>
            </div>

            <SectionHeader id="selling" icon="🛍️" title="Commerce & Digital Goods" subtitle="Direct-to-consumer platforms for products." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                <ResourceCard 
                    title="Shopify" 
                    description="The standard for building a dedicated online brand and storefront."
                    link="https://www.shopify.com/"
                    tags={['DTC', 'E-commerce']}
                    icon="🏪"
                    badge="Gold Standard"
                    colorClass="from-green-500 to-emerald-600"
                    details={{
                        requirements: ['Domain', 'Inventory/Service', 'Marketing Budget'],
                        pros: ['Total control', 'Extensive apps', 'Scalability'],
                        cons: ['Monthly subscription', 'Steep learning curve'],
                        tips: ['Use a clean, high-speed theme.', 'Focus on your SEO from day one.'],
                        bestFit: "Niche consumer products, branded apparel, and subscription-based physical goods."
                    }}
                />
                <ResourceCard 
                    title="Gumroad" 
                    description="The easiest way to sell digital products and software directly to fans."
                    link="https://gumroad.com/"
                    tags={['Digital', 'Creator']}
                    icon="📦"
                    colorClass="from-pink-500 to-rose-600"
                    details={{
                        requirements: ['Digital asset', 'Email address'],
                        pros: ['Instant setup', 'Affiliate support', 'Clean UI'],
                        cons: ['10% transaction fee', 'Limited storefront design'],
                        tips: ['Build an email list and sell to them directly.', 'Leverage the "Pay what you want" model.'],
                        bestFit: "E-books, Notion templates, UI kits, software scripts, and PDF guides."
                    }}
                />
                <ResourceCard 
                    title="Etsy" 
                    description="The world's largest marketplace for handmade, vintage, and creative goods."
                    link="https://www.etsy.com/sell"
                    tags={['Handmade', 'Vintage', 'Digital']}
                    icon="🧶"
                    badge="Built-in Traffic"
                    colorClass="from-orange-500 to-orange-600"
                    details={{
                        requirements: ['Unique product photos', 'Active customer service'],
                        pros: ['Huge existing customer base', 'Trusted platform', 'Easy tax handling'],
                        cons: ['Listing & transaction fees', 'High competition'],
                        tips: ['Invest in professional product photography.', 'Optimize your titles for Etsy search (SEO).'],
                        bestFit: "Handmade jewelry, vintage collectibles, digital printable planners, and craft supplies."
                    }}
                />
            </div>

            <SectionHeader id="support" icon="💖" title="Member-Based Support" subtitle="Direct recurring income from your community." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                 <ResourceCard 
                    title="Patreon" 
                    description="Build a membership business by offering exclusive content to your fans."
                    link="https://www.patreon.com/"
                    tags={['Recurring', 'Community']}
                    icon="🎖️"
                    badge="Stable Income"
                    colorClass="from-red-500 to-red-600"
                    details={{
                        requirements: ['Regular content output', 'Active fan base'],
                        pros: ['Predictable monthly revenue', 'Direct fan connection', 'Tiered pricing'],
                        cons: ['Requires constant engagement', 'Platform fees'],
                        tips: ['Offer value that isnt available anywhere else.', 'Start with 3 clear membership tiers.'],
                        bestFit: "Podcasters, YouTubers, niche educators, and independent artists with loyal followings."
                    }}
                />
                <ResourceCard 
                    title="Buy Me a Coffee" 
                    description="The most lightweight way to accept one-time tips or simple memberships."
                    link="https://www.buymeacoffee.com/"
                    tags={['Tips', 'Minimal']}
                    icon="☕"
                    colorClass="from-yellow-400 to-amber-500"
                    details={{
                        requirements: ['Social media presence', 'Payment account'],
                        pros: ['No monthly fees', 'Extremely easy to set up', 'Friendly tone'],
                        cons: ['Not optimized for high-volume sales', 'Basic analytics'],
                        tips: ['Add your link to your social bio and email signature.', 'Thank every supporter personally.'],
                        bestFit: "Open-source developers, casual bloggers, and digital creators wanting a 'tip-jar' model."
                    }}
                />
                 <ResourceCard 
                    title="Teachable" 
                    description="Create and sell online courses under your own professional brand."
                    link="https://teachable.com/"
                    tags={['Education', 'Sales']}
                    icon="🧠"
                    badge="LMS Pro"
                    colorClass="from-teal-500 to-cyan-600"
                    details={{
                        requirements: ['Video curriculum', 'Marketing plan'],
                        pros: ['Own your student data', 'Professional checkout', 'Affiliate tools'],
                        cons: ['Requires marketing knowledge', 'Monthly platform costs'],
                        tips: ['Focus on a specific "Transformation" for your students.', 'Use a free lead magnet to build your list.'],
                        bestFit: "Subject matter experts teaching high-ticket professional skills or technical hobbies."
                    }}
                />
            </div>

            <SectionHeader id="assets" icon="🖼️" title="Asset Marketplaces" subtitle="Sell your raw digital creative work." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                <ResourceCard 
                    title="Creative Market" 
                    description="The marketplace for fonts, graphics, and website themes."
                    link="https://creativemarket.com/"
                    tags={['Design', 'Fonts']}
                    icon="🖋️"
                    badge="High Quality"
                    colorClass="from-slate-800 to-slate-900"
                    details={{
                        requirements: ['Vetted portfolio application', 'High design standards'],
                        pros: ['Massive design-focused traffic', 'Premium pricing allowed'],
                        cons: ['Strict approval process', 'Marketplace commission'],
                        tips: ['Design for current trends (e.g. brutalism, Y2K).', 'Use stunning preview graphics.'],
                        bestFit: "Typographers, graphic designers, and UI/UX specialists selling professional-grade assets."
                    }}
                />
                <ResourceCard 
                    title="Adobe Stock" 
                    description="Sell your photos, videos, and vectors directly inside Adobe apps."
                    link="https://contributor.stock.adobe.com/"
                    tags={['Photography', 'Assets']}
                    icon="📷"
                    colorClass="from-blue-600 to-blue-700"
                    details={{
                        requirements: ['Technical quality standards', 'Model/Property releases'],
                        pros: ['Integrated into Creative Cloud', 'Passive income potential'],
                        cons: ['Low per-item royalty', 'High volume required'],
                        tips: ['Keyword your assets accurately for discovery.', 'Shoot high-demand business/tech concepts.'],
                        bestFit: "Photographers and videographers with a high volume of high-quality, commercial stock assets."
                    }}
                />
                 <ResourceCard 
                    title="Printful" 
                    description="Connect your designs to a print-on-demand fulfillment network."
                    link="https://www.printful.com/"
                    tags={['POD', 'Physical']}
                    icon="👕"
                    badge="Zero Inventory"
                    colorClass="from-red-600 to-orange-500"
                    details={{
                        requirements: ['Graphic designs', 'Connected storefront (Etsy/Shopify)'],
                        pros: ['No upfront inventory cost', 'Automatic fulfillment', 'Global shipping'],
                        cons: ['Low margins', 'Little control over production speed'],
                        tips: ['Focus on niche funny or relatable slogans.', 'Order samples to check quality.'],
                        bestFit: "Meme creators, niche artists, and illustrators selling physical merchandise with zero overhead."
                    }}
                />
            </div>

            <SectionHeader id="consulting" icon="🎯" title="Consulting & Coaching" subtitle="Monetize your expertise directly." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                <ResourceCard 
                    title="Calendly" 
                    description="Schedule and charge for consulting calls. Integrate with Stripe for payments."
                    link="https://calendly.com/"
                    tags={['Scheduling', 'Consulting']}
                    icon="📅"
                    badge="Essential"
                    colorClass="from-blue-500 to-blue-700"
                    details={{
                        requirements: ['Calendar integration', 'Stripe account for payments'],
                        pros: ['Easy scheduling', 'Payment collection', 'Professional appearance'],
                        cons: ['Free tier limited', 'No built-in audience'],
                        tips: ['Set buffer time between calls.', 'Use routing to offer different session types.'],
                        bestFit: "Consultants, coaches, and experts offering paid 1-on-1 sessions."
                    }}
                />
                <ResourceCard 
                    title="Clarity.fm" 
                    description="Get paid for phone consultations. Built-in marketplace of people seeking advice."
                    link="https://clarity.fm/"
                    tags={['Advice', 'Calls']}
                    icon="📞"
                    colorClass="from-emerald-500 to-teal-600"
                    details={{
                        requirements: ['Expertise in a domain', 'Profile setup'],
                        pros: ['Built-in demand', 'Per-minute billing', 'Easy to start'],
                        cons: ['Platform fees', 'Variable demand'],
                        tips: ['Price high to attract serious clients.', 'Build reviews early.'],
                        bestFit: "Industry experts in business, marketing, or tech offering quick advice calls."
                    }}
                />
                <ResourceCard 
                    title="Coach.me" 
                    description="Offer habit coaching and personal development guidance to paying clients."
                    link="https://www.coach.me/"
                    tags={['Coaching', 'Habits']}
                    icon="🏆"
                    colorClass="from-orange-500 to-amber-600"
                    details={{
                        requirements: ['Coaching methodology', 'Time commitment'],
                        pros: ['Recurring revenue', 'App integration', 'Structured approach'],
                        cons: ['Ongoing commitment', 'Client management'],
                        tips: ['Focus on accountability and follow-ups.', 'Specialize in one habit domain.'],
                        bestFit: "Life coaches, fitness trainers, and productivity experts."
                    }}
                />
            </div>

            <SectionHeader id="services" icon="💼" title="Professional Services" subtitle="Package your expertise as a service." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                <ResourceCard 
                    title="Contra" 
                    description="Commission-free freelance platform for independent professionals."
                    link="https://contra.com/"
                    tags={['Freelance', 'No Fees']}
                    icon="💫"
                    badge="Zero Fees"
                    colorClass="from-purple-500 to-pink-600"
                    details={{
                        requirements: ['Professional profile', 'Portfolio'],
                        pros: ['No platform fees', 'Modern interface', 'Contract tools'],
                        cons: ['Smaller client base', 'Building presence'],
                        tips: ['Optimize your profile for search.', 'Share projects publicly.'],
                        bestFit: "Freelancers tired of paying platform fees who want to build their brand."
                    }}
                />
                <ResourceCard 
                    title="Maven" 
                    description="Create and sell cohort-based courses to engaged students."
                    link="https://maven.com/"
                    tags={['Courses', 'Cohort']}
                    icon="🎯"
                    colorClass="from-indigo-500 to-purple-600"
                    details={{
                        requirements: ['Expertise', 'Course curriculum', 'Live teaching ability'],
                        pros: ['Higher completion rates', 'Premium pricing', 'Community feel'],
                        cons: ['Time commitment', 'Requires live sessions'],
                        tips: ['Start with a focused topic.', 'Build a waitlist first.'],
                        bestFit: "Experts who want to teach live courses to engaged cohorts."
                    }}
                />
                <ResourceCard 
                    title="Intro" 
                    description="Get paid for video calls. Experts charge $50-500+ for 15-minute intros."
                    link="https://intro.co/"
                    tags={['Advice', 'Video Calls']}
                    icon="📹"
                    colorClass="from-blue-500 to-indigo-600"
                    details={{
                        requirements: ['Industry expertise', 'Application approval'],
                        pros: ['High per-hour rates', 'Short time commitment', 'Passive scheduling'],
                        cons: ['Approval process', 'Building demand'],
                        tips: ['Price based on your expertise.', 'Respond quickly to requests.'],
                        bestFit: "Industry experts whose time is valuable for quick advice calls."
                    }}
                />
            </div>

            <SectionHeader id="licensing" icon="📜" title="Licensing & Royalties" subtitle="Earn ongoing income from your creations." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                <ResourceCard 
                    title="DistroKid" 
                    description="Distribute your music to Spotify, Apple Music, and 150+ streaming services."
                    link="https://distrokid.com/"
                    tags={['Music', 'Streaming']}
                    icon="🎵"
                    badge="Musicians"
                    colorClass="from-cyan-500 to-blue-600"
                    details={{
                        requirements: ['Original music', 'Annual subscription'],
                        pros: ['Keep 100% royalties', 'Fast distribution', 'Unlimited uploads'],
                        cons: ['Annual fee', 'Crowded market'],
                        tips: ['Release consistently.', 'Build playlists around your music.'],
                        bestFit: "Musicians wanting to distribute music and collect streaming royalties."
                    }}
                />
                <ResourceCard 
                    title="Pond5" 
                    description="Sell stock video, music, sound effects, and photos to creators worldwide."
                    link="https://www.pond5.com/sell-media"
                    tags={['Stock', 'Video']}
                    icon="🎬"
                    colorClass="from-blue-600 to-blue-800"
                    details={{
                        requirements: ['High-quality media', 'Content ownership'],
                        pros: ['Set your own prices', 'High royalty rates', 'Non-exclusive'],
                        cons: ['Competitive market', 'Quality standards'],
                        tips: ['Focus on niche footage.', 'Keyword thoroughly.'],
                        bestFit: "Videographers and audio producers with quality content libraries."
                    }}
                />
                <ResourceCard 
                    title="Envato Market" 
                    description="Sell themes, templates, plugins, and digital assets to millions of buyers."
                    link="https://author.envato.com/"
                    tags={['Themes', 'Templates']}
                    icon="🎨"
                    colorClass="from-emerald-500 to-teal-600"
                    details={{
                        requirements: ['High-quality digital products', 'Review approval'],
                        pros: ['Massive buyer base', 'Passive income', 'Strong brand'],
                        cons: ['Strict review process', 'Competitive'],
                        tips: ['Study top sellers in your category.', 'Provide excellent documentation.'],
                        bestFit: "Developers and designers creating themes, templates, or plugins."
                    }}
                />
            </div>

            <SectionHeader id="community" icon="👥" title="Community & Memberships" subtitle="Build recurring revenue from your audience." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                <ResourceCard 
                    title="Circle" 
                    description="Build a community platform with courses, discussions, and member spaces."
                    link="https://circle.so/"
                    tags={['Community', 'Courses']}
                    icon="⭕"
                    colorClass="from-indigo-500 to-purple-600"
                    details={{
                        requirements: ['Community vision', 'Content plan'],
                        pros: ['All-in-one platform', 'White-label option', 'Course hosting'],
                        cons: ['Monthly cost', 'Requires active management'],
                        tips: ['Start with a core group.', 'Host regular live events.'],
                        bestFit: "Creators building premium membership communities."
                    }}
                />
                <ResourceCard 
                    title="Substack" 
                    description="Turn your writing into a subscription newsletter business."
                    link="https://substack.com/"
                    tags={['Newsletter', 'Writing']}
                    icon="✉️"
                    badge="Writers"
                    colorClass="from-orange-500 to-orange-700"
                    details={{
                        requirements: ['Writing ability', 'Audience building'],
                        pros: ['Free to start', 'Keep your subscribers', 'Simple monetization'],
                        cons: ['10% platform fee on paid', 'Crowded space'],
                        tips: ['Consistency is key.', 'Offer value in free tier.'],
                        bestFit: "Writers and thought leaders building a newsletter audience."
                    }}
                />
                <ResourceCard 
                    title="Ko-fi" 
                    description="Accept donations, sell products, and offer memberships. 0% platform fee."
                    link="https://ko-fi.com/"
                    tags={['Tips', 'Shop']}
                    icon="☕"
                    colorClass="from-cyan-400 to-teal-500"
                    details={{
                        requirements: ['Creator account', 'Payment setup'],
                        pros: ['Zero platform fees', 'Multiple income streams', 'Simple setup'],
                        cons: ['Smaller audience', 'Less discovery'],
                        tips: ['Promote your Ko-fi link everywhere.', 'Offer exclusive content.'],
                        bestFit: "Creators wanting a simple, fee-free way to accept support."
                    }}
                />
            </div>

            <SectionHeader id="affiliate" icon="🔗" title="Affiliate & Referral" subtitle="Earn commissions by promoting products." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                <ResourceCard 
                    title="Amazon Associates" 
                    description="The world's largest affiliate program. Promote any product on Amazon."
                    link="https://affiliate-program.amazon.com/"
                    tags={['Affiliate', 'E-commerce']}
                    icon="📦"
                    badge="Huge Catalog"
                    colorClass="from-orange-500 to-orange-700"
                    details={{
                        requirements: ['Website/blog/social presence', 'FTC disclosure'],
                        pros: ['Millions of products', 'Trusted brand', 'Cookie tracking'],
                        cons: ['Low commission rates', '24-hour cookie'],
                        tips: ['Focus on high-ticket items.', 'Create comparison content.'],
                        bestFit: "Bloggers, YouTubers, and content creators reviewing products."
                    }}
                />
                <ResourceCard 
                    title="ShareASale" 
                    description="Access thousands of merchant affiliate programs across all niches."
                    link="https://www.shareasale.com/"
                    tags={['Network', 'Multi-niche']}
                    icon="🤝"
                    colorClass="from-green-600 to-green-800"
                    details={{
                        requirements: ['Website approval', 'Traffic proof'],
                        pros: ['Diverse merchants', 'Higher commissions', 'Reliable payouts'],
                        cons: ['Merchant approval needed', 'Interface dated'],
                        tips: ['Apply to multiple merchants.', 'Track which programs convert best.'],
                        bestFit: "Affiliate marketers seeking variety beyond Amazon."
                    }}
                />
                <ResourceCard 
                    title="Impact" 
                    description="Premium affiliate partnerships with major brands like Shopify, Canva, and more."
                    link="https://impact.com/"
                    tags={['Premium', 'SaaS']}
                    icon="💎"
                    badge="Premium Brands"
                    colorClass="from-purple-600 to-indigo-700"
                    details={{
                        requirements: ['Established audience', 'Quality content'],
                        pros: ['High-value brands', 'Recurring commissions', 'Professional platform'],
                        cons: ['Competitive', 'Approval required'],
                        tips: ['Create tutorials for SaaS products.', 'Focus on recurring commission programs.'],
                        bestFit: "Established creators promoting premium software and services."
                    }}
                />
            </div>

            <SectionHeader id="content" icon="📹" title="Content Monetization" subtitle="Turn your content into revenue streams." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                <ResourceCard 
                    title="YouTube Partner" 
                    description="Monetize videos with ads once you hit 1,000 subscribers and 4,000 watch hours."
                    link="https://www.youtube.com/creators/"
                    tags={['Video', 'Ads']}
                    icon="▶️"
                    badge="Massive Reach"
                    colorClass="from-red-600 to-red-700"
                    details={{
                        requirements: ['1,000 subscribers', '4,000 watch hours', 'Original content'],
                        pros: ['Huge audience', 'Multiple revenue streams', 'Brand deals'],
                        cons: ['High threshold', 'Algorithm dependent'],
                        tips: ['Focus on watch time over views.', 'Create searchable evergreen content.'],
                        bestFit: "Video creators ready to build a long-term content business."
                    }}
                />
                <ResourceCard 
                    title="Substack" 
                    description="Start a paid newsletter. Direct relationship with your audience."
                    link="https://substack.com/"
                    tags={['Newsletter', 'Writing']}
                    icon="✍️"
                    colorClass="from-orange-500 to-orange-600"
                    details={{
                        requirements: ['Writing ability', 'Niche expertise'],
                        pros: ['Own your audience', '10% platform fee', 'Built-in growth tools'],
                        cons: ['Requires consistent publishing', 'Building takes time'],
                        tips: ['Start free, convert to paid.', 'Write about what you uniquely know.'],
                        bestFit: "Writers and experts building direct relationships with readers."
                    }}
                />
                <ResourceCard 
                    title="Medium Partner" 
                    description="Get paid based on member reading time. Great for thought leadership."
                    link="https://medium.com/creators"
                    tags={['Writing', 'Passive']}
                    icon="📝"
                    colorClass="from-slate-700 to-slate-900"
                    details={{
                        requirements: ['100 followers', 'Quality writing'],
                        pros: ['Built-in audience', 'Low barrier', 'SEO benefits'],
                        cons: ['Variable earnings', 'Platform rules'],
                        tips: ['Publish in popular publications.', 'Write about trending professional topics.'],
                        bestFit: "Writers who want to test ideas and build authority."
                    }}
                />
                <ResourceCard 
                    title="Spotify for Podcasters" 
                    description="Distribute and monetize your podcast with ads and subscriptions."
                    link="https://podcasters.spotify.com/"
                    tags={['Podcast', 'Audio']}
                    icon="🎙️"
                    colorClass="from-green-500 to-green-700"
                    details={{
                        requirements: ['Podcast content', 'RSS feed'],
                        pros: ['Free hosting', 'Analytics', 'Monetization options'],
                        cons: ['Audience building takes time', 'Competitive space'],
                        tips: ['Consistency beats perfection.', 'Cross-promote on social media.'],
                        bestFit: "Podcasters ready to monetize through ads and subscriptions."
                    }}
                />
                <ResourceCard 
                    title="Ko-fi" 
                    description="Accept donations and sell products without platform fees on basic tier."
                    link="https://ko-fi.com/"
                    tags={['Tips', 'Shop']}
                    icon="☕"
                    colorClass="from-cyan-500 to-blue-600"
                    details={{
                        requirements: ['Social following', 'Creative work'],
                        pros: ['No fees on donations', 'Shop features', 'Commissions'],
                        cons: ['Smaller audience than alternatives', 'Less discovery'],
                        tips: ['Combine tips with commissions.', 'Offer exclusive content.'],
                        bestFit: "Artists and creators wanting a simple tip jar with shop features."
                    }}
                />
                <ResourceCard 
                    title="Skillshare Teacher" 
                    description="Create classes and earn based on minutes watched. Passive income potential."
                    link="https://www.skillshare.com/teach"
                    tags={['Teaching', 'Video']}
                    icon="🎓"
                    badge="Passive"
                    colorClass="from-teal-500 to-cyan-600"
                    details={{
                        requirements: ['Teaching ability', 'Video production'],
                        pros: ['Passive earnings', 'Built-in audience', 'Referral bonuses'],
                        cons: ['Per-minute pay varies', 'Competitive'],
                        tips: ['Create bite-sized project-based classes.', 'Promote externally for referrals.'],
                        bestFit: "Creative professionals teaching design, writing, or business skills."
                    }}
                />
            </div>

            <SectionHeader id="services" icon="🛠️" title="Service-Based Income" subtitle="Offer your skills as a service." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                <ResourceCard 
                    title="99designs" 
                    description="Compete in design contests or get hired directly for logo and branding work."
                    link="https://99designs.com/"
                    tags={['Design', 'Contests']}
                    icon="🎨"
                    colorClass="from-orange-500 to-red-600"
                    details={{
                        requirements: ['Design portfolio', 'Adobe or Figma skills'],
                        pros: ['Direct client work', 'Contest opportunities', 'Build portfolio'],
                        cons: ['Contest model is speculative', 'Competition'],
                        tips: ['Focus on 1-on-1 projects for guaranteed pay.', 'Specialize in a niche.'],
                        bestFit: "Graphic designers looking to build a client base."
                    }}
                />
                <ResourceCard 
                    title="Contra" 
                    description="Commission-free freelance platform. Keep 100% of what you earn."
                    link="https://contra.com/"
                    tags={['Freelance', 'No Fees']}
                    icon="💫"
                    badge="0% Fees"
                    colorClass="from-purple-500 to-purple-700"
                    details={{
                        requirements: ['Professional profile', 'Portfolio'],
                        pros: ['No platform fees', 'Modern interface', 'Portfolio hosting'],
                        cons: ['Newer platform', 'Building client base'],
                        tips: ['Import your best work.', 'Use the project showcase feature.'],
                        bestFit: "Freelancers tired of high platform fees on other sites."
                    }}
                />
                <ResourceCard 
                    title="PeoplePerHour" 
                    description="Find freelance projects in writing, design, development, and marketing."
                    link="https://www.peopleperhour.com/"
                    tags={['Freelance', 'EU Focus']}
                    icon="👥"
                    colorClass="from-blue-500 to-blue-700"
                    details={{
                        requirements: ['Skills verification', 'Profile setup'],
                        pros: ['Strong in UK/EU markets', 'Fixed-price or hourly', 'Proposal credits'],
                        cons: ['Service fees', 'Competition'],
                        tips: ['Respond quickly to leads.', 'Focus on your specialty.'],
                        bestFit: "Freelancers targeting European clients."
                    }}
                />
            </div>

            <SectionHeader id="licensing" icon="📄" title="Licensing & Royalties" subtitle="Earn passive income from your work." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                <ResourceCard 
                    title="Shutterstock" 
                    description="License your photos, videos, and music to a global audience."
                    link="https://submit.shutterstock.com/"
                    tags={['Stock', 'Passive']}
                    icon="📸"
                    badge="Passive Income"
                    colorClass="from-red-600 to-red-800"
                    details={{
                        requirements: ['High-quality content', 'Model releases'],
                        pros: ['Passive income', 'Global reach', 'Multiple content types'],
                        cons: ['Low per-download earnings', 'Volume required'],
                        tips: ['Upload consistently.', 'Keyword thoroughly for discovery.'],
                        bestFit: "Photographers and videographers with large content libraries."
                    }}
                />
                <ResourceCard 
                    title="Pond5" 
                    description="Sell video footage, music, sound effects, and more with 40-60% royalties."
                    link="https://www.pond5.com/sell-footage"
                    tags={['Video', 'Audio']}
                    icon="🎬"
                    colorClass="from-blue-600 to-indigo-700"
                    details={{
                        requirements: ['Professional quality content', 'Exclusive or non-exclusive'],
                        pros: ['Higher royalties', 'Price your own content', 'Diverse media types'],
                        cons: ['Curated approval', 'Video-focused'],
                        tips: ['Go exclusive for higher rates.', 'Focus on trending topics.'],
                        bestFit: "Videographers and audio producers seeking fair royalty rates."
                    }}
                />
                <ResourceCard 
                    title="Envato Elements" 
                    description="Sell templates, graphics, and themes through the Envato marketplace."
                    link="https://author.envato.com/"
                    tags={['Templates', 'Digital']}
                    icon="📁"
                    colorClass="from-green-600 to-emerald-700"
                    details={{
                        requirements: ['High-quality templates', 'Technical documentation'],
                        pros: ['Large customer base', 'Subscription earnings', 'Established marketplace'],
                        cons: ['Strict review process', 'Competitive'],
                        tips: ['Focus on trending niches.', 'Provide excellent support.'],
                        bestFit: "Developers and designers creating professional templates."
                    }}
                />
                <ResourceCard 
                    title="DistroKid" 
                    description="Distribute your music to Spotify, Apple Music, and all major platforms."
                    link="https://distrokid.com/"
                    tags={['Music', 'Streaming']}
                    icon="🎵"
                    badge="Keep 100%"
                    colorClass="from-cyan-500 to-blue-600"
                    details={{
                        requirements: ['Original music', 'Annual subscription'],
                        pros: ['Keep 100% royalties', 'Fast distribution', 'Unlimited uploads'],
                        cons: ['Annual fee required', 'Marketing is on you'],
                        tips: ['Release consistently.', 'Use pre-save campaigns.'],
                        bestFit: "Independent musicians ready to distribute their own music."
                    }}
                />
            </div>

            <SectionHeader id="community" icon="🌐" title="Community & Engagement" subtitle="Build and monetize your community." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                <ResourceCard 
                    title="Discord" 
                    description="Create a paid community server with exclusive content and access."
                    link="https://discord.com/"
                    tags={['Community', 'Chat']}
                    icon="💬"
                    colorClass="from-indigo-500 to-purple-600"
                    details={{
                        requirements: ['Community to build', 'Patreon or Gumroad for payments'],
                        pros: ['Real-time engagement', 'Strong community bonds', 'Flexible structure'],
                        cons: ['Active moderation needed', 'Separate payment integration'],
                        tips: ['Gate channels with role-based access.', 'Use bots for automation.'],
                        bestFit: "Creators building tight-knit, engaged communities."
                    }}
                />
                <ResourceCard 
                    title="Circle" 
                    description="All-in-one community platform with courses, events, and member management."
                    link="https://circle.so/"
                    tags={['Community', 'Courses']}
                    icon="⭕"
                    badge="All-in-One"
                    colorClass="from-purple-600 to-pink-600"
                    details={{
                        requirements: ['Monthly subscription', 'Content strategy'],
                        pros: ['Professional appearance', 'Built-in courses', 'Spaces organization'],
                        cons: ['Monthly cost', 'Needs content investment'],
                        tips: ['Launch with founding members.', 'Create structured spaces for engagement.'],
                        bestFit: "Educators and coaches building premium learning communities."
                    }}
                />
                <ResourceCard 
                    title="Mighty Networks" 
                    description="Create a branded community with courses, events, and memberships."
                    link="https://www.mightynetworks.com/"
                    tags={['Community', 'App']}
                    icon="🦁"
                    colorClass="from-blue-700 to-blue-900"
                    details={{
                        requirements: ['Subscription plan', 'Content creation'],
                        pros: ['Native mobile app', 'Courses included', 'Engagement features'],
                        cons: ['Higher pricing', 'Platform learning curve'],
                        tips: ['Offer a free tier to grow.', 'Use challenges for engagement.'],
                        bestFit: "Coaches and creators wanting a branded community experience."
                    }}
                />
            </div>
        </div>
    );
};
