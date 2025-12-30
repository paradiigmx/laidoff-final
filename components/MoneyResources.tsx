
import React, { useState, useEffect } from 'react';
import { toggleFavorite, isFavorited, saveHubTask, saveHubReminder, getAppSettings, getHubTasks, getHubReminders, deleteHubTask, deleteHubReminder } from '../services/storageService';
import heroImage from '@assets/alexander-grey-8lnbXtxFGZw-unsplash_1766438623293.jpg';

interface ResourceDetails {
    pros: string[];
    cons: string[];
    tips: string[];
    requirements: string[];
    bestFit: string;
}

const ResourceCard = ({ title, description, link, tags, icon, badge, colorClass = "from-blue-500 to-cyan-500", details }: { title: string, description: string, link: string, tags: string[], icon: string, badge?: string, colorClass?: string, details?: ResourceDetails }) => {
    const [isOpen, setIsOpen] = useState(false);
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
        toggleFavorite({
            id: link,
            title,
            link,
            description,
            category: 'money',
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
        <div className="group relative flex flex-col bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-700 shadow-lg hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:border-slate-200 dark:hover:border-slate-600 hover:-translate-y-2 transition-all duration-500 h-full overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${colorClass}`}></div>
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass} opacity-5 dark:opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-15 dark:group-hover:opacity-25 transition-opacity duration-500`}></div>
            
            <div className="p-7 pb-3 flex-1 relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorClass} bg-opacity-10 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 border border-white/50`}>
                        {icon}
                    </div>
                    <div className="flex items-center gap-2">
                        {badge && (
                            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                                badge.includes('High') ? 'bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700' : 
                                badge.includes('Daily') || badge.includes('Fast') ? 'bg-amber-50 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700' :
                                badge.includes('Vetted') || badge.includes('Elite') || badge.includes('Med') ? 'bg-purple-50 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700' :
                                'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                            }`}>
                                {badge}
                            </span>
                        )}
                        <div className="flex gap-1">
                            <button 
                                onClick={handleFavorite}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all z-20 ${
                                    isFav 
                                        ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border-2 border-pink-300 dark:border-pink-700' 
                                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 opacity-40 hover:opacity-60 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-500 hover:border-pink-200 dark:hover:border-pink-800'
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
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 opacity-40 hover:opacity-60 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800'
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
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 opacity-40 hover:opacity-60 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800'
                                }`}
                                title={isInReminders ? 'Remove from reminders' : 'Add to reminders'}
                            >
                                ⏰
                            </button>
                        </div>
                    </div>
                </div>

                <a href={link} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors flex items-center gap-2">
                        {title}
                        <span className="opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 text-brand-500 text-lg font-bold">↗</span>
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-5 font-medium">{description}</p>
                </a>
                
                {details?.bestFit && (
                   <div className="mb-5 p-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-700 dark:to-slate-800 rounded-2xl border border-slate-100 dark:border-slate-600 group-hover:from-brand-50/50 dark:group-hover:from-brand-900/20 group-hover:to-white dark:group-hover:to-slate-800 transition-colors shadow-inner">
                       <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Best Fit</span>
                       <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-relaxed block">{details.bestFit}</span>
                   </div>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1.5 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider rounded-full border-2 border-slate-100 dark:border-slate-600 group-hover:border-brand-200 dark:group-hover:border-brand-700 group-hover:text-brand-700 dark:group-hover:text-brand-300 group-hover:bg-brand-50/50 dark:group-hover:bg-brand-900/30 transition-all shadow-sm">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {details && (
                <div className="border-t-2 border-slate-100 dark:border-slate-700">
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full px-7 py-4 text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gradient-to-r hover:from-brand-50/50 dark:hover:from-brand-900/30 hover:to-transparent transition-all flex items-center justify-between"
                    >
                        <span>{isOpen ? 'Hide Insights' : 'View Details'}</span>
                        <span className={`transform transition-transform duration-300 text-brand-500 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    
                    {isOpen && (
                        <div className="px-6 pb-6 bg-slate-50/50 dark:bg-slate-800/50 animate-in slide-in-from-top-2 fade-in duration-200">
                            <div className="grid grid-cols-1 gap-4 pt-4 text-xs">
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1">📋 Requirements</h4>
                                    <ul className="list-disc ml-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                                        {details.requirements.map((r, i) => <li key={i}>{r}</li>)}
                                    </ul>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-bold text-green-700 dark:text-green-400 mb-1 flex items-center gap-1">👍 Pros</h4>
                                        <ul className="list-disc ml-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                                            {details.pros.map((p, i) => <li key={i}>{p}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-red-700 dark:text-red-400 mb-1 flex items-center gap-1">👎 Cons</h4>
                                        <ul className="list-disc ml-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                                            {details.cons.map((c, i) => <li key={i}>{c}</li>)}
                                        </ul>
                                    </div>
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600 shadow-sm">
                                    <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1">💡 Strategy Tips</h4>
                                    <ul className="list-disc ml-4 space-y-0.5 text-slate-600 dark:text-slate-400 italic">
                                        {details.tips.map((t, i) => <li key={i}>{t}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
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

export const MoneyResources = () => {
    return (
        <div className="pb-24 max-w-6xl mx-auto">
            <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 text-white mb-16 shadow-2xl border border-slate-800">
                <div className="absolute inset-0">
                    <img src={heroImage} alt="" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/50"></div>
                </div>
                <div className="relative z-10 p-10 md:p-16">
                    <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-white/10 text-emerald-300">
                        Cash Flow
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
                        Income <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-white">Generators.</span>
                    </h1>
                    <p className="text-lg text-slate-300 leading-relaxed font-medium max-w-xl">
                        Immediate income platforms and gig economy resources to stabilize your transition.
                    </p>
                </div>
            </div>

            <SectionHeader id="delivery" icon="🚗" title="Logistics & Delivery" subtitle="Use your vehicle for same-day and next-day earnings." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <ResourceCard 
                    title="Veho" 
                    description="Next-day package delivery. Route details and pay provided upfront."
                    link="https://shipveho.com/drive/"
                    tags={['Driving', 'Packages']}
                    icon="📦"
                    badge="High Reliability"
                    colorClass="from-slate-800 to-black"
                    details={{
                        requirements: ['21+ yrs', 'Large Sedan/SUV/Van', 'Background Check'],
                        pros: ['Static routes', 'Daytime hours', 'No shopping'],
                        cons: ['Heavy lifting', 'Warehouse early start'],
                        tips: ['Arrive 15 mins early.', 'Check route map before loading.'],
                        bestFit: "Reliable drivers who prefer packages over people and predictable daytime shifts."
                    }}
                />
                 <ResourceCard 
                    title="Spark Driver" 
                    description="Deliver Walmart orders. High volume and tips in suburban areas."
                    link="https://drive4spark.walmart.com/"
                    tags={['Driving', 'Retail']}
                    icon="⚡"
                    badge="Highest Volume"
                    colorClass="from-blue-500 to-yellow-400"
                    details={{
                        requirements: ['18+ yrs', 'Standard Vehicle', 'Insurance'],
                        pros: ['Frequent incentives', 'Tips available', 'Curbside pickup'],
                        cons: ['Wait times at stores', 'Unpredictable bag count'],
                        tips: ['Focus on weekend mornings.', 'Target stores with low wait times.'],
                        bestFit: "Suburban drivers looking for high-volume grocery and retail delivery opportunities."
                    }}
                />
                <ResourceCard 
                    title="Roadie" 
                    description="UPS-owned crowdsourced delivery service for oversized and 'on the way' items."
                    link="https://www.roadie.com/drivers"
                    tags={['Driving', 'Long-Haul']}
                    icon="🛣️"
                    badge="Flexible Path"
                    colorClass="from-blue-400 to-blue-600"
                    details={{
                        requirements: ['21+ yrs', 'Valid License', 'Reliable Vehicle'],
                        pros: ['Deliver on routes you already travel', 'No vehicle requirements', 'Nationwide'],
                        cons: ['Pay varies by distance', 'Manual loading'],
                        tips: ['Bundle multiple gigs on a single trip.', 'Watch for "oversized" gigs for higher pay.'],
                        bestFit: "Travelers or long-distance commuters looking to offset fuel costs with 'on-the-way' deliveries."
                    }}
                />
            </div>

            <SectionHeader id="labor" icon="🔨" title="On-Demand Shifts" subtitle="Fill short-term gaps with hourly shifts." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ResourceCard 
                    title="Wonolo" 
                    description="Instant access to hourly labor, warehouse, and general merchandise shifts."
                    link="https://www.wonolo.com/"
                    tags={['Labor', 'Hourly']}
                    icon="👷"
                    badge="Daily Pay Opt"
                    colorClass="from-amber-500 to-orange-500"
                    details={{
                        requirements: ['18+ yrs', 'Background check', 'Reliable smartphone'],
                        pros: ['Work today, get paid soon', 'No long-term commitment', 'Diverse industries'],
                        cons: ['Physical work', 'Shift competition'],
                        tips: ['Maintain a 5-star rating for priority access.', 'Enable notifications for new shifts.'],
                        bestFit: "Active, flexible individuals looking for immediate, manual labor or warehouse shifts."
                    }}
                />
                <ResourceCard 
                    title="Instawork" 
                    description="Hospitality, warehouse, and general labor shifts available daily."
                    link="https://www.instawork.com/worker"
                    tags={['Hospitality', 'Labor']}
                    icon="🏢"
                    badge="Fast Onboarding"
                    colorClass="from-blue-600 to-indigo-600"
                    details={{
                        requirements: ['Valid ID', 'Professional Attire for some roles', 'Punctuality'],
                        pros: ['Overtime common', 'Insurance coverage', 'Review-based bonuses'],
                        cons: ['Physical exhaustion', 'Varying work environments'],
                        tips: ['Arrive 20 mins early.', 'Keep your uniform clean and ironed.'],
                        bestFit: "Versatile workers comfortable in hospitality, catering, or commercial environments."
                    }}
                />
                <ResourceCard 
                    title="Bluecrew" 
                    description="W-2 based on-demand staffing. Get benefits while working flexible shifts."
                    link="https://www.bluecrewjobs.com/"
                    tags={['W-2', 'Staffing']}
                    icon="👔"
                    badge="Benefits Inc"
                    colorClass="from-blue-700 to-blue-900"
                    details={{
                        requirements: ['Legal right to work', 'Interview/Screening'],
                        pros: ['Overtime & Workers Comp', 'Health insurance access', 'Stable employment'],
                        cons: ['Traditional hiring process', 'Limited to certain metros'],
                        tips: ['Focus on recurring shifts for stability.', 'Keep your availability up to date.'],
                        bestFit: "Workers seeking the flexibility of gig work with the stability and benefits of a W-2 status."
                    }}
                />
            </div>

            <SectionHeader id="food" icon="🍔" title="Food Delivery" subtitle="Deliver meals and groceries on your schedule." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ResourceCard 
                    title="DoorDash" 
                    description="The largest food delivery platform. High demand in urban and suburban areas."
                    link="https://www.doordash.com/dasher/signup/"
                    tags={['Food', 'Flexible']}
                    icon="🚗"
                    badge="Top Volume"
                    colorClass="from-red-500 to-red-600"
                    details={{
                        requirements: ['18+ yrs', 'Valid license', 'Insurance', 'Background check'],
                        pros: ['Highest order volume', 'Peak pay bonuses', 'Easy to start'],
                        cons: ['Competitive markets', 'Gas costs'],
                        tips: ['Work during lunch and dinner rushes.', 'Accept orders above $6-7 for profitability.'],
                        bestFit: "Drivers looking for consistent high-volume food delivery with flexible scheduling."
                    }}
                />
                <ResourceCard 
                    title="Uber Eats" 
                    description="Deliver food with the Uber app. Combine with rideshare for max earnings."
                    link="https://www.uber.com/us/en/deliver/"
                    tags={['Food', 'Multi-app']}
                    icon="🥡"
                    colorClass="from-green-500 to-emerald-600"
                    details={{
                        requirements: ['18+ yrs', 'Smartphone', 'Valid transportation'],
                        pros: ['Bike/scooter options', 'Instant pay available', 'Global platform'],
                        cons: ['Lower base pay', 'Tip dependent'],
                        tips: ['Stack with UberX for more opportunities.', 'Focus on restaurant-dense areas.'],
                        bestFit: "Flexible workers who want to deliver by car, bike, or scooter."
                    }}
                />
                <ResourceCard 
                    title="Instacart Shopper" 
                    description="Shop and deliver groceries. Higher earnings per order than food delivery."
                    link="https://shoppers.instacart.com/"
                    tags={['Grocery', 'Shopping']}
                    icon="🛒"
                    badge="Higher Tips"
                    colorClass="from-orange-400 to-orange-600"
                    details={{
                        requirements: ['18+ yrs', 'Smartphone', 'Can lift 50+ lbs'],
                        pros: ['Higher per-order earnings', 'Tips on top', 'In-store or full-service'],
                        cons: ['Physical shopping required', 'Customer communication'],
                        tips: ['Learn store layouts for faster shopping.', 'Communicate substitutions proactively.'],
                        bestFit: "Detail-oriented shoppers who enjoy grocery runs and customer interaction."
                    }}
                />
                <ResourceCard 
                    title="Grubhub Driver" 
                    description="Deliver for restaurants with guaranteed minimum earnings in some markets."
                    link="https://driver.grubhub.com/"
                    tags={['Food', 'Guaranteed']}
                    icon="🍕"
                    colorClass="from-orange-500 to-red-500"
                    details={{
                        requirements: ['19+ yrs', 'Valid license', '2+ years driving experience'],
                        pros: ['Contribution guarantee', 'Scheduling blocks', 'Established brand'],
                        cons: ['Market saturation', 'App can be slow'],
                        tips: ['Schedule blocks in advance for priority.', 'Track your hourly rate carefully.'],
                        bestFit: "Experienced drivers who prefer scheduled blocks with guaranteed minimums."
                    }}
                />
            </div>

            <SectionHeader id="rideshare" icon="🚘" title="Rideshare & Transit" subtitle="Drive passengers to earn on your schedule." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ResourceCard 
                    title="Uber Driver" 
                    description="The world's largest rideshare platform. Drive when you want, earn what you need."
                    link="https://www.uber.com/us/en/drive/"
                    tags={['Rideshare', 'Global']}
                    icon="🚙"
                    badge="Most Riders"
                    colorClass="from-slate-800 to-black"
                    details={{
                        requirements: ['21+ yrs', '1+ year driving', '4-door vehicle', 'Background check'],
                        pros: ['Highest rider volume', 'Multiple earning options', 'Quest bonuses'],
                        cons: ['Vehicle wear', 'Inconsistent demand'],
                        tips: ['Position near airports and event venues.', 'Drive during surge pricing windows.'],
                        bestFit: "Drivers with a reliable 4-door vehicle seeking flexible passenger rides."
                    }}
                />
                <ResourceCard 
                    title="Lyft Driver" 
                    description="Friendly rideshare alternative with strong driver community and support."
                    link="https://www.lyft.com/driver"
                    tags={['Rideshare', 'Community']}
                    icon="🚗"
                    colorClass="from-pink-500 to-pink-600"
                    details={{
                        requirements: ['21+ yrs', 'Valid license', 'Qualifying vehicle'],
                        pros: ['Driver-friendly app', 'Weekly bonuses', 'Express Pay'],
                        cons: ['Lower volume in some markets', 'Competitive'],
                        tips: ['Stack with Uber for more rides.', 'Take advantage of streak bonuses.'],
                        bestFit: "Friendly drivers who enjoy the community aspect of ridesharing."
                    }}
                />
                <ResourceCard 
                    title="HopSkipDrive" 
                    description="Transport kids to school and activities. Higher pay, predictable routes."
                    link="https://www.hopskipdrive.com/become-a-caredriver/"
                    tags={['Kids', 'School']}
                    icon="🎒"
                    badge="Premium Pay"
                    colorClass="from-blue-500 to-indigo-600"
                    details={{
                        requirements: ['23+ yrs', '5+ yrs driving', 'Childcare experience', 'Extensive background check'],
                        pros: ['Higher per-ride pay', 'Scheduled rides', 'Meaningful work'],
                        cons: ['Strict requirements', 'Limited markets'],
                        tips: ['Build rapport with families for repeat rides.', 'Maintain a spotless safety record.'],
                        bestFit: "Experienced caregivers or parents who enjoy working with children."
                    }}
                />
            </div>

            <SectionHeader id="freelance" icon="💻" title="Freelance & Remote" subtitle="Use your skills from anywhere." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ResourceCard 
                    title="Upwork" 
                    description="The largest freelance marketplace. Find clients for writing, design, dev, and more."
                    link="https://www.upwork.com/"
                    tags={['Freelance', 'Global']}
                    icon="💼"
                    badge="Top Platform"
                    colorClass="from-green-500 to-green-700"
                    details={{
                        requirements: ['Verified skills', 'Profile completion', 'Portfolio'],
                        pros: ['Huge client base', 'Payment protection', 'Long-term contracts'],
                        cons: ['High competition', 'Service fees'],
                        tips: ['Specialize in a niche.', 'Build a strong portfolio with specific case studies.'],
                        bestFit: "Skilled freelancers in writing, development, design, or marketing."
                    }}
                />
                <ResourceCard 
                    title="Fiverr" 
                    description="Sell packaged services called 'gigs'. Great for creative and technical skills."
                    link="https://www.fiverr.com/"
                    tags={['Gigs', 'Creative']}
                    icon="🎨"
                    colorClass="from-emerald-400 to-green-600"
                    details={{
                        requirements: ['Defined services', 'Competitive pricing'],
                        pros: ['Set your own prices', 'Passive leads', 'Global reach'],
                        cons: ['20% platform fee', 'Price pressure'],
                        tips: ['Create multiple gig variations.', 'Respond to inquiries within hours.'],
                        bestFit: "Creative professionals offering defined, packageable services."
                    }}
                />
                <ResourceCard 
                    title="Toptal" 
                    description="Elite freelance network for top 3% of developers, designers, and finance experts."
                    link="https://www.toptal.com/"
                    tags={['Elite', 'High-Pay']}
                    icon="⭐"
                    badge="Top 3%"
                    colorClass="from-indigo-600 to-purple-700"
                    details={{
                        requirements: ['Expert-level skills', 'Rigorous screening process'],
                        pros: ['Premium rates', 'Quality clients', 'Long engagements'],
                        cons: ['Difficult to join', 'High expectations'],
                        tips: ['Prepare thoroughly for the screening.', 'Showcase enterprise-level work.'],
                        bestFit: "Senior developers, designers, or finance experts seeking premium clients."
                    }}
                />
                <ResourceCard 
                    title="FlexJobs" 
                    description="Curated remote and flexible job listings. No scams, all vetted opportunities."
                    link="https://www.flexjobs.com/"
                    tags={['Remote', 'Vetted']}
                    icon="🏠"
                    colorClass="from-blue-400 to-blue-600"
                    details={{
                        requirements: ['Subscription fee', 'Resume ready'],
                        pros: ['100% vetted jobs', 'Remote focus', 'Quality listings'],
                        cons: ['Paid membership', 'Competitive applications'],
                        tips: ['Use filters to find hidden gems.', 'Set up job alerts.'],
                        bestFit: "Remote workers seeking legitimate, flexible opportunities."
                    }}
                />
                <ResourceCard 
                    title="TaskRabbit" 
                    description="Get paid for local tasks: furniture assembly, moving help, handyman work."
                    link="https://www.taskrabbit.com/become-a-tasker"
                    tags={['Local', 'Handyman']}
                    icon="🔧"
                    badge="Local Gigs"
                    colorClass="from-green-600 to-teal-600"
                    details={{
                        requirements: ['Background check', 'Registration fee', 'Smartphone'],
                        pros: ['Set your own rates', 'Variety of tasks', 'Tips common'],
                        cons: ['Physical work', 'Metro areas only'],
                        tips: ['Specialize in high-demand categories.', 'Maintain 5-star reviews.'],
                        bestFit: "Handy individuals who enjoy variety and setting their own schedule."
                    }}
                />
                <ResourceCard 
                    title="Rev" 
                    description="Transcription, captioning, and translation work. Work from anywhere."
                    link="https://www.rev.com/freelancers"
                    tags={['Transcription', 'Remote']}
                    icon="🎧"
                    colorClass="from-purple-500 to-purple-700"
                    details={{
                        requirements: ['Typing skills', 'Pass skills test', 'Good hearing'],
                        pros: ['Flexible hours', 'Weekly pay', 'No experience needed'],
                        cons: ['Low starting pay', 'Time-intensive'],
                        tips: ['Use foot pedals for efficiency.', 'Specialize in captioning for better rates.'],
                        bestFit: "Detail-oriented typists who can work independently from home."
                    }}
                />
            </div>

            <SectionHeader id="surveys" icon="📋" title="Surveys & Micro-Tasks" subtitle="Small tasks that add up over time." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ResourceCard 
                    title="Prolific" 
                    description="Get paid for academic research studies. Higher pay than typical survey sites."
                    link="https://www.prolific.co/"
                    tags={['Research', 'Studies']}
                    icon="🔬"
                    badge="Best Pay"
                    colorClass="from-purple-600 to-indigo-700"
                    details={{
                        requirements: ['Verified account', 'Consistent responses'],
                        pros: ['$8-12/hour average', 'Interesting studies', 'Quick payout'],
                        cons: ['Limited availability', 'Screening required'],
                        tips: ['Keep the browser tab open for new studies.', 'Complete your profile fully.'],
                        bestFit: "Anyone looking for legitimate survey income with decent hourly rates."
                    }}
                />
                <ResourceCard 
                    title="Amazon Mechanical Turk" 
                    description="Complete micro-tasks (HITs) for small payments that add up."
                    link="https://www.mturk.com/"
                    tags={['Micro-tasks', 'Remote']}
                    icon="⚙️"
                    colorClass="from-orange-500 to-amber-600"
                    details={{
                        requirements: ['Amazon account', 'Approval process'],
                        pros: ['Huge task variety', 'Work anytime', 'Immediate availability'],
                        cons: ['Very low per-task pay', 'Some scam requesters'],
                        tips: ['Use scripts to find good HITs.', 'Build requester reputation.'],
                        bestFit: "Those wanting to fill downtime with small earning opportunities."
                    }}
                />
                <ResourceCard 
                    title="UserTesting" 
                    description="Get paid $10+ to test websites and apps. Share your screen and speak your thoughts."
                    link="https://www.usertesting.com/get-paid-to-test"
                    tags={['Testing', 'Feedback']}
                    icon="🖥️"
                    badge="$10+/Test"
                    colorClass="from-teal-500 to-cyan-600"
                    details={{
                        requirements: ['Microphone', 'Webcam optional', 'Good internet'],
                        pros: ['$10+ per 20-min test', 'Work from home', 'Interesting work'],
                        cons: ['Inconsistent availability', 'Qualification tests'],
                        tips: ['Keep notifications on.', 'Speak clearly and think aloud.'],
                        bestFit: "Tech-savvy individuals who can articulate their user experience clearly."
                    }}
                />
                <ResourceCard 
                    title="Swagbucks" 
                    description="Earn points for surveys, shopping, watching videos, and more. Redeem for gift cards."
                    link="https://www.swagbucks.com/"
                    tags={['Rewards', 'Surveys']}
                    icon="🎁"
                    colorClass="from-blue-500 to-blue-700"
                    details={{
                        requirements: ['Email signup', 'US resident preferred'],
                        pros: ['Multiple earning methods', 'Cashback on shopping', 'Low payout threshold'],
                        cons: ['Time-consuming', 'Points can devalue'],
                        tips: ['Focus on high-value surveys.', 'Use the browser extension for cashback.'],
                        bestFit: "Those who shop online regularly and want to earn while browsing."
                    }}
                />
            </div>

            <SectionHeader id="tutoring" icon="📚" title="Tutoring & Teaching" subtitle="Share your knowledge and get paid." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ResourceCard 
                    title="Wyzant" 
                    description="Tutor students in any subject. Set your own rates and schedule."
                    link="https://www.wyzant.com/tutors/apply"
                    tags={['Tutoring', 'Education']}
                    icon="📖"
                    badge="Top Rates"
                    colorClass="from-orange-500 to-orange-700"
                    details={{
                        requirements: ['Expertise in a subject', 'Background check'],
                        pros: ['Set your own rates', 'Large student base', 'Flexible schedule'],
                        cons: ['Platform takes 25%', 'Building clients takes time'],
                        tips: ['Start competitive, raise rates later.', 'Get reviews quickly.'],
                        bestFit: "Subject matter experts who enjoy teaching one-on-one."
                    }}
                />
                <ResourceCard 
                    title="VIPKid" 
                    description="Teach English to Chinese students online. Work early mornings from home."
                    link="https://www.vipkid.com/"
                    tags={['ESL', 'Teaching']}
                    icon="🌏"
                    colorClass="from-red-500 to-orange-500"
                    details={{
                        requirements: ["Bachelor's degree", 'Teaching experience preferred', 'Native English'],
                        pros: ['$14-22/hour', 'Work from home', 'Curriculum provided'],
                        cons: ['Early morning hours (Beijing time)', 'Contract-based'],
                        tips: ['Decorate your teaching space.', 'Be energetic and engaging.'],
                        bestFit: "Early risers with teaching experience who want flexible online work."
                    }}
                />
                <ResourceCard 
                    title="Outschool" 
                    description="Teach live online classes to kids on any topic you're passionate about."
                    link="https://outschool.com/teach"
                    tags={['Classes', 'Kids']}
                    icon="🎨"
                    colorClass="from-purple-500 to-pink-600"
                    details={{
                        requirements: ['Create your own curriculum', 'Background check', 'Video setup'],
                        pros: ['Creative freedom', 'Set your own prices', 'Repeat students'],
                        cons: ['Marketing your classes', 'Building enrollment'],
                        tips: ['Niche down to unique topics.', 'Create engaging thumbnails.'],
                        bestFit: "Creative teachers who want to design their own courses for kids."
                    }}
                />
            </div>

            <SectionHeader id="selling" icon="🛍️" title="Selling & Reselling" subtitle="Turn items and skills into cash." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ResourceCard 
                    title="Poshmark" 
                    description="Sell clothing and accessories. Strong community and social selling features."
                    link="https://poshmark.com/"
                    tags={['Fashion', 'Reselling']}
                    icon="👗"
                    badge="Social Selling"
                    colorClass="from-pink-500 to-rose-600"
                    details={{
                        requirements: ['Quality photos', 'Fashion items'],
                        pros: ['Large buyer base', 'Pre-paid shipping', 'Social features'],
                        cons: ['20% selling fee', 'Competitive pricing'],
                        tips: ['Share listings daily.', 'Follow and engage with buyers.'],
                        bestFit: "Fashion lovers looking to declutter and make money."
                    }}
                />
                <ResourceCard 
                    title="eBay" 
                    description="The original marketplace. Sell almost anything to a global audience."
                    link="https://www.ebay.com/sl/sell"
                    tags={['Marketplace', 'Auction']}
                    icon="🏷️"
                    colorClass="from-blue-600 to-blue-800"
                    details={{
                        requirements: ['PayPal or bank account', 'Quality listings'],
                        pros: ['Massive reach', 'Auction or fixed price', 'Buyer protection'],
                        cons: ['Fees add up', 'Competitive'],
                        tips: ['Research completed listings for pricing.', 'Offer free shipping when possible.'],
                        bestFit: "Anyone with items to sell, especially collectibles and electronics."
                    }}
                />
                <ResourceCard 
                    title="Facebook Marketplace" 
                    description="Sell locally with no fees. Great for furniture and large items."
                    link="https://www.facebook.com/marketplace/"
                    tags={['Local', 'Free']}
                    icon="📦"
                    colorClass="from-blue-500 to-blue-600"
                    details={{
                        requirements: ['Facebook account', 'Local pickup usually'],
                        pros: ['No fees', 'Large local audience', 'Easy to use'],
                        cons: ['In-person meetings', 'Lowball offers'],
                        tips: ['Meet in public places.', 'Price slightly high for negotiation.'],
                        bestFit: "Those selling large items or wanting to avoid shipping."
                    }}
                />
                <ResourceCard 
                    title="Mercari" 
                    description="Sell anything easily with flat shipping rates. Simple listing process."
                    link="https://www.mercari.com/"
                    tags={['Marketplace', 'Simple']}
                    icon="📱"
                    colorClass="from-red-500 to-red-600"
                    details={{
                        requirements: ['Smartphone', 'Items to sell'],
                        pros: ['Easy to use', 'Pre-paid shipping', 'Wide categories'],
                        cons: ['10% fee', 'Competitive'],
                        tips: ['Take multiple photos.', 'Ship quickly for good ratings.'],
                        bestFit: "Beginners looking for an easy selling experience."
                    }}
                />
                <ResourceCard 
                    title="Depop" 
                    description="Sell vintage and streetwear fashion. Popular with Gen Z buyers."
                    link="https://www.depop.com/"
                    tags={['Vintage', 'Streetwear']}
                    icon="👟"
                    colorClass="from-red-400 to-pink-500"
                    details={{
                        requirements: ['Trendy items', 'Good photography'],
                        pros: ['Young buyer base', 'No listing fees', 'Social features'],
                        cons: ['10% selling fee', 'Niche market'],
                        tips: ['Style your photos creatively.', 'Use trending hashtags.'],
                        bestFit: "Sellers with vintage, thrift, or streetwear items."
                    }}
                />
                <ResourceCard 
                    title="ThredUp" 
                    description="Send in clothes and they handle photos, pricing, and shipping."
                    link="https://www.thredup.com/cleanout"
                    tags={['Consignment', 'Easy']}
                    icon="📦"
                    colorClass="from-teal-500 to-emerald-600"
                    details={{
                        requirements: ['Quality clothing', 'Request a clean-out kit'],
                        pros: ['Zero effort after sending', 'Free kit', 'Large audience'],
                        cons: ['Low payouts', 'Slow process'],
                        tips: ['Send only quality brands.', 'Check their accepted brands list.'],
                        bestFit: "Those with quality clothes who want hands-off selling."
                    }}
                />
            </div>

            <SectionHeader id="pet" icon="🐕" title="Pet Services" subtitle="Earn money caring for furry friends." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ResourceCard 
                    title="Rover" 
                    description="Dog walking, pet sitting, and boarding. Set your own rates and schedule."
                    link="https://www.rover.com/become-a-sitter/"
                    tags={['Pets', 'Flexible']}
                    icon="🐕"
                    badge="Top Platform"
                    colorClass="from-green-500 to-emerald-600"
                    details={{
                        requirements: ['Background check', 'Pet experience', 'Reliable schedule'],
                        pros: ['Set your own rates', 'Repeat clients', 'Tips common'],
                        cons: ['20% platform fee', 'Building reviews takes time'],
                        tips: ['Offer meet-and-greets.', 'Send photo updates to owners.'],
                        bestFit: "Pet lovers who want flexible work caring for animals."
                    }}
                />
                <ResourceCard 
                    title="Wag!" 
                    description="On-demand dog walking. Get paid within 2 days of each walk."
                    link="https://wagwalking.com/dog-walker"
                    tags={['Dog Walking', 'On-Demand']}
                    icon="🦮"
                    colorClass="from-teal-500 to-cyan-600"
                    details={{
                        requirements: ['18+', 'Background check', 'Smartphone'],
                        pros: ['Quick payment', 'Flexible hours', 'No scheduling needed'],
                        cons: ['40% platform fee', 'Competitive for walks'],
                        tips: ['Stay available during peak hours.', 'Build relationships for recurring walks.'],
                        bestFit: "Active individuals who enjoy being outdoors with dogs."
                    }}
                />
                <ResourceCard 
                    title="Care.com" 
                    description="Find pet care, babysitting, senior care, and housekeeping jobs."
                    link="https://www.care.com/enroll-care-provider"
                    tags={['Care', 'Multi-Service']}
                    icon="💝"
                    colorClass="from-pink-500 to-rose-600"
                    details={{
                        requirements: ['Background check', 'References', 'Profile completion'],
                        pros: ['Multiple service types', 'Direct client relationships', 'Set your rates'],
                        cons: ['Premium for messaging', 'Competitive'],
                        tips: ['Complete your profile 100%.', 'Get references from past clients.'],
                        bestFit: "Caregivers offering multiple services in their community."
                    }}
                />
            </div>

            <SectionHeader id="creative" icon="🎨" title="Creative & Media" subtitle="Monetize your creative talents." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ResourceCard 
                    title="Shutterstock Contributor" 
                    description="Sell your photos, videos, and music to a global marketplace."
                    link="https://submit.shutterstock.com/"
                    tags={['Photography', 'Stock']}
                    icon="📸"
                    colorClass="from-red-500 to-red-700"
                    details={{
                        requirements: ['High-quality content', 'Model releases for people'],
                        pros: ['Passive income', 'Global reach', 'Various content types'],
                        cons: ['Low per-download pay', 'High volume needed'],
                        tips: ['Focus on trending topics.', 'Keyword accurately.'],
                        bestFit: "Photographers and videographers with quality content libraries."
                    }}
                />
                <ResourceCard 
                    title="Canva Contributor" 
                    description="Create and sell templates, graphics, and elements on Canva."
                    link="https://www.canva.com/creators/"
                    tags={['Design', 'Templates']}
                    icon="🎨"
                    badge="Growing"
                    colorClass="from-cyan-500 to-blue-600"
                    details={{
                        requirements: ['Design skills', 'Application approval'],
                        pros: ['Growing platform', 'Passive income', 'Huge user base'],
                        cons: ['Competitive', 'Approval required'],
                        tips: ['Create trendy, versatile templates.', 'Focus on business templates.'],
                        bestFit: "Graphic designers who create reusable templates."
                    }}
                />
                <ResourceCard 
                    title="99designs" 
                    description="Compete in design contests or get hired for custom projects."
                    link="https://99designs.com/designers"
                    tags={['Design', 'Contests']}
                    icon="✏️"
                    colorClass="from-orange-500 to-amber-600"
                    details={{
                        requirements: ['Design portfolio', 'Competition mindset'],
                        pros: ['Win big prizes', 'Build portfolio', 'Direct clients'],
                        cons: ['Contest model (not guaranteed pay)', 'Time investment'],
                        tips: ['Focus on your strongest category.', 'Read briefs carefully.'],
                        bestFit: "Designers who thrive in competitive environments."
                    }}
                />
            </div>
        </div>
    );
};
