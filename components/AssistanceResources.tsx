
import React, { useState, useEffect } from 'react';
import { toggleFavorite, saveHubTask, saveHubReminder, getAppSettings, getFavorites, getHubTasks, getHubReminders, deleteHubTask, deleteHubReminder, isFavorited } from '../services/storageService';
import heroImage from '@assets/public-bar-088_1766520500816.jpg';

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
    cyan: { gradient: 'from-cyan-500 to-cyan-600' },
    rose: { gradient: 'from-rose-500 to-rose-600' },
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
        toggleFavorite({ title, desc, link, icon, category: 'assistance' });
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

export const AssistanceResources = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-16 pb-24">
            <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 text-white shadow-2xl border border-slate-800">
                <div className="absolute inset-0">
                    <img src={heroImage} alt="" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/50"></div>
                </div>
                <div className="relative z-10 p-10 md:p-16">
                    <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-white/10 text-rose-300">
                        Safety Net
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
                        Essential<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-200 to-white" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Assistance.</span>
                    </h1>
                    <p className="text-lg text-slate-300 leading-relaxed font-medium max-w-xl">
                        Critical support programs for financial aid, healthcare access, and mental wellness.
                    </p>
                </div>
            </div>

            <div className="space-y-24">
                <section>
                    <SectionHeader icon="💸" title="Financial Support" subtitle="Emergency funds, food assistance, and utility aid programs." />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ResourceCard icon="🆘" title="211.org" desc="The '911' for essential community services. Connect with local support for food, housing, and financial assistance." link="https://www.211.org/" color="orange" badge="24/7 Support" />
                        <ResourceCard icon="🍎" title="SNAP (Food Stamps)" desc="The Supplemental Nutrition Assistance Program provides food benefits to low-income families to supplement their grocery budget." link="https://www.fns.usda.gov/snap/" color="emerald" />
                        <ResourceCard icon="📱" title="Lifeline Program" desc="A federal program that lowers the monthly cost of phone or internet service for low-income households." link="https://www.lifelinesupport.org/" color="blue" />
                        <ResourceCard icon="⚡" title="LIHEAP Energy Assistance" desc="Help with heating and cooling costs through the Low Income Home Energy Assistance Program." link="https://www.benefits.gov/benefit/623" color="yellow" />
                        <ResourceCard icon="🏠" title="Emergency Rental Assistance" desc="Find local programs to help with rent and utility bills to prevent eviction during transitions." link="https://www.consumerfinance.gov/renthelp" color="indigo" />
                        <ResourceCard icon="🥫" title="Feeding America" desc="Locate your local food bank from a nationwide network of 200 food banks and 60,000 food pantries." link="https://www.feedingamerica.org/find-your-local-foodbank" color="red" />
                        <ResourceCard icon="🚗" title="Modest Needs" desc="Self-Sufficiency Grants for working people to prevent a temporary financial crisis from becoming chronic poverty." link="https://www.modestneeds.org/" color="teal" />
                        <ResourceCard icon="💳" title="NeedyMeds" desc="Find patient assistance programs, free clinics, and coupons for prescription drugs." link="https://www.needymeds.org/" color="purple" />
                        <ResourceCard icon="🏦" title="Benefits.gov" desc="Find government benefits you may be eligible for - housing, food, healthcare, and more." link="https://www.benefits.gov/" color="slate" badge="Gov Portal" />
                    </div>
                </section>

                <section>
                    <SectionHeader icon="🏥" title="Healthcare Coverage" subtitle="Insurance options, free clinics, and prescription assistance." />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ResourceCard icon="🩺" title="HealthCare.gov" desc="Losing job-based coverage is a 'Qualifying Life Event'. You can enroll in a plan during a Special Enrollment Period." link="https://www.healthcare.gov/" color="blue" badge="Marketplace" />
                        <ResourceCard icon="🛡️" title="COBRA Basics" desc="Keep your employer's health insurance for 18-36 months. High premiums, but immediate continuity." link="https://www.dol.gov/general/topic/health-plans/cobra" color="slate" />
                        <ResourceCard icon="🏥" title="Medicaid & CHIP" desc="Free or low-cost health coverage for some low-income people, families and children, pregnant women, the elderly, and people with disabilities." link="https://www.medicaid.gov/" color="emerald" />
                        <ResourceCard icon="🍼" title="WIC Program" desc="Special Supplemental Nutrition Program for Women, Infants, and Children. Healthcare referrals and nutrition education." link="https://www.fns.usda.gov/wic" color="pink" />
                        <ResourceCard icon="📍" title="Free Clinic Finder" desc="Find a Health Center near you that provides care on a sliding fee scale based on your income." link="https://findahealthcenter.hrsa.gov/" color="teal" />
                        <ResourceCard icon="💊" title="GoodRx" desc="Save significantly on prescription drugs at local pharmacies. Essential when you're between insurance plans." link="https://www.goodrx.com/" color="yellow" />
                        <ResourceCard icon="🦷" title="Dental Lifeline" desc="Free dental care for people who are elderly, disabled, or medically fragile and cannot afford treatment." link="https://www.dentallifeline.org/" color="cyan" />
                        <ResourceCard icon="👁️" title="Vision USA" desc="Free eye exams and glasses for uninsured, low-income workers and their families." link="https://www.aoa.org/visionusa" color="indigo" />
                        <ResourceCard icon="💉" title="Vaccines.gov" desc="Find free or low-cost vaccines near you, including flu shots and COVID-19 boosters." link="https://www.vaccines.gov/" color="emerald" />
                    </div>
                </section>

                <section>
                    <SectionHeader icon="🧠" title="Mental Health" subtitle="Crisis support, counseling, and wellness resources." />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ResourceCard icon="📞" title="988 Lifeline" desc="Free, confidential 24/7 support for people in distress. Call or text 988 anytime for crisis resources." link="https://988lifeline.org/" color="purple" badge="Always Active" />
                        <ResourceCard icon="💬" title="Crisis Text Line" desc="Text HOME to 741741 to connect with a volunteer Crisis Counselor. Free 24/7 support at your fingertips." link="https://www.crisistextline.org/" color="indigo" />
                        <ResourceCard icon="🤝" title="NAMI Support" desc="The National Alliance on Mental Illness offers support groups and education to help individuals affected by mental illness." link="https://www.nami.org/" color="blue" />
                        <ResourceCard icon="🧘" title="BetterHelp Financial Aid" desc="Professional therapy online. They offer significant financial aid for those who are unemployed." link="https://www.betterhelp.com/financial-aid/" color="teal" />
                        <ResourceCard icon="🏢" title="SAMHSA Helpline" desc="Substance Abuse and Mental Health Services Administration. Treatment referral and information service." link="https://www.samhsa.gov/find-help/national-helpline" color="slate" />
                        <ResourceCard icon="📖" title="MHA Resources" desc="Mental Health America provides screenings and tools to manage stress and anxiety during transitions." link="https://mhanational.org/" color="emerald" />
                        <ResourceCard icon="🌿" title="7 Cups" desc="Free, anonymous emotional support through trained listeners and online therapy options." link="https://www.7cups.com/" color="teal" />
                        <ResourceCard icon="😌" title="Headspace for Unemployed" desc="Guided meditation and mindfulness exercises. Free trial to help manage job search stress." link="https://www.headspace.com/" color="orange" />
                        <ResourceCard icon="📝" title="Anxiety & Depression Assoc." desc="Find a therapist directory and resources for managing anxiety and depression during career transitions." link="https://adaa.org/" color="rose" />
                    </div>
                </section>

                <section>
                    <SectionHeader icon="👨‍👩‍👧‍👦" title="Family Support" subtitle="Childcare, food programs, and family assistance." />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ResourceCard icon="👶" title="Childcare Assistance" desc="State-by-state childcare subsidy programs to help working parents afford quality care." link="https://www.childcare.gov/consumer-education/get-help-paying-for-child-care" color="pink" badge="Essential" />
                        <ResourceCard icon="🎒" title="Backpack Buddies" desc="Weekend food programs for children who may not have enough to eat at home." link="https://www.feedingamerica.org/our-work/hunger-relief-programs/backpack-program" color="orange" />
                        <ResourceCard icon="📚" title="Head Start Programs" desc="Free early childhood education for low-income families with children under 5." link="https://www.acf.hhs.gov/ohs" color="blue" />
                        <ResourceCard icon="🏠" title="Family Promise" desc="Emergency shelter and housing for families with children facing homelessness." link="https://familypromise.org/" color="indigo" />
                        <ResourceCard icon="🎄" title="Toys for Tots" desc="Seasonal programs to provide toys for children in need during the holidays." link="https://www.toysfortots.org/" color="red" />
                        <ResourceCard icon="👕" title="Dress for Success" desc="Professional attire and career development for women entering the workforce." link="https://dressforsuccess.org/" color="purple" />
                    </div>
                </section>

                <section>
                    <SectionHeader icon="🎓" title="Education Assistance" subtitle="Financial aid, training programs, and skill building." />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ResourceCard icon="📖" title="FAFSA" desc="Free Application for Federal Student Aid. Essential for grants, loans, and work-study programs." link="https://studentaid.gov/h/apply-for-aid/fafsa" color="blue" badge="Start Here" />
                        <ResourceCard icon="🎓" title="Pell Grants" desc="Federal grants for undergraduate students with financial need. Up to $7,395 for 2023-24." link="https://studentaid.gov/understand-aid/types/grants/pell" color="emerald" />
                        <ResourceCard icon="💼" title="Workforce Innovation" desc="WIOA programs offer job training, education, and employment services for adults and dislocated workers." link="https://www.dol.gov/agencies/eta/wioa" color="indigo" />
                        <ResourceCard icon="🖥️" title="Digital Literacy" desc="Free courses to build computer and digital skills through public libraries and community centers." link="https://www.digitallearn.org/" color="teal" />
                        <ResourceCard icon="📚" title="Public Library Resources" desc="Free access to LinkedIn Learning, language courses, and professional development through your library." link="https://www.publiclibraries.com/" color="purple" />
                        <ResourceCard icon="🔧" title="Trade School Finder" desc="Explore trade and vocational programs for careers in high-demand industries." link="https://www.trade-schools.net/" color="orange" />
                    </div>
                </section>

                <section>
                    <SectionHeader icon="🏡" title="Housing Assistance" subtitle="Rental aid, homeowner support, and shelter resources." />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ResourceCard icon="🏘️" title="HUD Resources" desc="Department of Housing and Urban Development programs for rental assistance and homeowner support." link="https://www.hud.gov/topics/rental_assistance" color="blue" badge="Federal" />
                        <ResourceCard icon="📋" title="Section 8 Housing" desc="Housing Choice Voucher Program helps low-income families afford safe, decent housing." link="https://www.hud.gov/topics/housing_choice_voucher_program_section_8" color="indigo" />
                        <ResourceCard icon="🚫" title="Eviction Prevention" desc="Legal aid and emergency funds to prevent eviction during financial hardship." link="https://www.consumerfinance.gov/renthelp/" color="red" />
                        <ResourceCard icon="🔑" title="Habitat for Humanity" desc="Affordable homeownership opportunities and home repair programs for qualifying families." link="https://www.habitat.org/" color="emerald" />
                        <ResourceCard icon="🛏️" title="Homeless Shelter Finder" desc="Find emergency shelters and transitional housing programs in your area." link="https://www.shelterlist.com/" color="orange" />
                        <ResourceCard icon="⚖️" title="Tenant Rights" desc="Know your rights as a renter. Legal resources for housing disputes and discrimination." link="https://www.nolo.com/legal-encyclopedia/tenant-rights" color="slate" />
                        <ResourceCard icon="🏠" title="Homeowner Assistance Fund" desc="State programs to help homeowners catch up on mortgage payments and avoid foreclosure." link="https://www.consumerfinance.gov/housing/housing-insecurity/help-for-homeowners/homeowner-assistance-fund/" color="teal" />
                        <ResourceCard icon="💡" title="Utility Assistance Programs" desc="Find local programs to help pay water, gas, and electric bills." link="https://www.benefits.gov/categories/Energy%20Assistance" color="yellow" />
                        <ResourceCard icon="📞" title="HUD Counseling" desc="Free housing counseling to help with budgeting, credit, and avoiding foreclosure." link="https://www.hud.gov/findacounselor" color="purple" />
                    </div>
                </section>

                <section>
                    <SectionHeader icon="🎓" title="Student Loan Relief" subtitle="Payment options, forgiveness programs, and debt management." />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ResourceCard icon="📋" title="Federal Student Aid" desc="Official portal to manage federal student loans, apply for IDR plans, and check forgiveness eligibility." link="https://studentaid.gov/" color="blue" badge="Start Here" />
                        <ResourceCard icon="💰" title="Income-Driven Repayment" desc="Reduce monthly payments to 10-20% of discretionary income with IDR plans like SAVE, PAYE, and IBR." link="https://studentaid.gov/manage-loans/repayment/plans/income-driven" color="emerald" />
                        <ResourceCard icon="🏛️" title="Public Service Loan Forgiveness" desc="Forgiveness after 120 qualifying payments while working for government or nonprofits." link="https://studentaid.gov/manage-loans/forgiveness-cancellation/public-service" color="indigo" badge="PSLF" />
                        <ResourceCard icon="⏸️" title="Deferment & Forbearance" desc="Temporarily pause or reduce federal loan payments during unemployment or hardship." link="https://studentaid.gov/manage-loans/lower-payments/get-temporary-relief" color="orange" />
                        <ResourceCard icon="🔄" title="Loan Consolidation" desc="Combine multiple federal loans into one with a single monthly payment and access to more repayment plans." link="https://studentaid.gov/manage-loans/consolidation" color="purple" />
                        <ResourceCard icon="📊" title="Student Loan Simulator" desc="Compare repayment strategies and see how different plans affect your total cost." link="https://studentaid.gov/loan-simulator/" color="teal" />
                        <ResourceCard icon="🎓" title="Teacher Loan Forgiveness" desc="Up to $17,500 forgiveness for teachers at low-income schools after 5 years." link="https://studentaid.gov/manage-loans/forgiveness-cancellation/teacher" color="pink" />
                        <ResourceCard icon="⚖️" title="Borrower Defense" desc="Loan discharge if your school misled you or engaged in misconduct." link="https://studentaid.gov/borrower-defense/" color="red" />
                        <ResourceCard icon="💳" title="Student Loan Hero" desc="Tools and calculators to compare refinancing options and create a payoff strategy." link="https://studentloanhero.com/" color="cyan" />
                        <ResourceCard icon="📞" title="CFPB Student Loan Help" desc="Consumer Financial Protection Bureau resources and complaint filing for student loan issues." link="https://www.consumerfinance.gov/consumer-tools/student-loans/" color="slate" />
                        <ResourceCard icon="🆘" title="Default Resolution" desc="Get out of student loan default through rehabilitation, consolidation, or repayment in full." link="https://studentaid.gov/manage-loans/default/get-out" color="yellow" />
                        <ResourceCard icon="📱" title="Chipper App" desc="AI-powered app to optimize student loan payments and find savings opportunities." link="https://meetchipper.com/" color="emerald" />
                    </div>
                </section>

                <section>
                    <SectionHeader icon="🚗" title="Transportation Assistance" subtitle="Help with vehicle costs and getting around." />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ResourceCard icon="🚌" title="Transit Benefits" desc="Find reduced-fare transit programs for low-income residents in your area." link="https://www.apta.com/advocacy-legislation/public-transit-benefits/" color="blue" />
                        <ResourceCard icon="🚗" title="Working Cars" desc="Nonprofit programs that provide donated vehicles to families in need." link="https://workingcars.org/" color="emerald" />
                        <ResourceCard icon="🔧" title="Vehicle Repair Assistance" desc="Programs that help with car repairs to keep you employed and mobile." link="https://www.needhelppayingbills.com/html/car_repair_assistance.html" color="orange" />
                        <ResourceCard icon="⛽" title="Gas Assistance Programs" desc="Emergency fuel assistance programs from nonprofits and government agencies." link="https://www.needhelppayingbills.com/html/need_help_paying_for_gas.html" color="yellow" />
                        <ResourceCard icon="🚕" title="Rides to Work" desc="Programs providing transportation assistance for job seekers and low-income workers." link="https://www.jobsearchconnection.com/transportation-assistance/" color="purple" />
                        <ResourceCard icon="🚙" title="AAA Financial Aid" desc="AAA Foundation programs for vehicle safety and transportation assistance." link="https://aaafoundation.org/" color="red" />
                    </div>
                </section>

                <section>
                    <SectionHeader icon="📱" title="Technology Access" subtitle="Get connected with affordable internet and devices." />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ResourceCard icon="📶" title="Affordable Connectivity" desc="$30/month discount on internet service for qualifying low-income households." link="https://www.fcc.gov/acp" color="blue" badge="$30/mo Off" />
                        <ResourceCard icon="💻" title="PCs for People" desc="Refurbished computers for qualifying low-income individuals and nonprofits." link="https://www.pcsforpeople.org/" color="emerald" />
                        <ResourceCard icon="📱" title="Free Government Phones" desc="Free smartphones and monthly service through the Lifeline program." link="https://www.freegovernmentcellphones.net/" color="indigo" />
                        <ResourceCard icon="🖥️" title="Human-I-T" desc="Low-cost computers, internet, and digital literacy training for underserved communities." link="https://www.human-i-t.org/" color="teal" />
                        <ResourceCard icon="📚" title="Library Tech Access" desc="Free computer and internet access at your local public library." link="https://www.ala.org/advocacy/access" color="purple" />
                        <ResourceCard icon="🌐" title="EveryoneOn" desc="Find affordable internet and computer offers available in your area." link="https://www.everyoneon.org/" color="orange" />
                    </div>
                </section>
            </div>
        </div>
    );
};
