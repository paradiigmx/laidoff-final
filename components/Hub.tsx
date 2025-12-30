
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, HubTask, HubReminder, BudgetItem, FavoriteResource, AppView, FinancialAssessment, DreamShiftAssessment } from '../types';
import { 
    getUserProfile, saveUserProfile, 
    getHubTasks, saveHubTask, updateHubTask, deleteHubTask,
    getHubReminders, saveHubReminder, updateHubReminder, deleteHubReminder,
    getBudgetItems, saveBudgetItem, deleteBudgetItem, clearBudgetItems,
    getFavorites, getAppSettings, saveAppSettings,
    getFinancialAssessments, deleteFinancialAssessment,
    getLatestDreamShiftAssessment
} from '../services/storageService';
import hubHeroImage from '@assets/Screenshot_2025-12-21_at_9.35.43_PM_1766535040952.png';
import resumeHeroImage from '@assets/pexels-olly-3760072_1766520094521.jpg';
import jobHeroImage from '@assets/microsoft-365-TLiWhlDEJwA-unsplash_1766438656269.jpg';
import coachHeroImage from '@assets/public-bar-063_1766520405673.jpg';
import founderHeroImage from '@assets/public-bar-058_1766520289277.jpg';
import moneyHeroImage from '@assets/alexander-grey-8lnbXtxFGZw-unsplash_1766438623293.jpg';
import monetizationHeroImage from '@assets/kit-formerly-convertkit--CbLJAUI_js-unsplash_1766438656267.jpg';
import unemploymentHeroImage from '@assets/public-bar-141_1766521510905.jpg';
import assistanceHeroImage from '@assets/public-bar-088_1766520500816.jpg';

interface HubProps {
    onNavigate: (view: AppView) => void;
}

const US_STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
    'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
    'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
    'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const STATE_TAX_RATES: Record<string, { rate: number; name: string; hasNoIncomeTax?: boolean }> = {
    'Alabama': { rate: 0.05, name: 'AL' },
    'Alaska': { rate: 0, name: 'AK', hasNoIncomeTax: true },
    'Arizona': { rate: 0.025, name: 'AZ' },
    'Arkansas': { rate: 0.047, name: 'AR' },
    'California': { rate: 0.0725, name: 'CA' },
    'Colorado': { rate: 0.044, name: 'CO' },
    'Connecticut': { rate: 0.0499, name: 'CT' },
    'Delaware': { rate: 0.066, name: 'DE' },
    'Florida': { rate: 0, name: 'FL', hasNoIncomeTax: true },
    'Georgia': { rate: 0.0549, name: 'GA' },
    'Hawaii': { rate: 0.0825, name: 'HI' },
    'Idaho': { rate: 0.058, name: 'ID' },
    'Illinois': { rate: 0.0495, name: 'IL' },
    'Indiana': { rate: 0.0315, name: 'IN' },
    'Iowa': { rate: 0.06, name: 'IA' },
    'Kansas': { rate: 0.057, name: 'KS' },
    'Kentucky': { rate: 0.045, name: 'KY' },
    'Louisiana': { rate: 0.0425, name: 'LA' },
    'Maine': { rate: 0.0715, name: 'ME' },
    'Maryland': { rate: 0.0575, name: 'MD' },
    'Massachusetts': { rate: 0.05, name: 'MA' },
    'Michigan': { rate: 0.0425, name: 'MI' },
    'Minnesota': { rate: 0.0785, name: 'MN' },
    'Mississippi': { rate: 0.05, name: 'MS' },
    'Missouri': { rate: 0.0495, name: 'MO' },
    'Montana': { rate: 0.059, name: 'MT' },
    'Nebraska': { rate: 0.0584, name: 'NE' },
    'Nevada': { rate: 0, name: 'NV', hasNoIncomeTax: true },
    'New Hampshire': { rate: 0, name: 'NH', hasNoIncomeTax: true },
    'New Jersey': { rate: 0.0637, name: 'NJ' },
    'New Mexico': { rate: 0.049, name: 'NM' },
    'New York': { rate: 0.0685, name: 'NY' },
    'North Carolina': { rate: 0.0475, name: 'NC' },
    'North Dakota': { rate: 0.0195, name: 'ND' },
    'Ohio': { rate: 0.04, name: 'OH' },
    'Oklahoma': { rate: 0.0475, name: 'OK' },
    'Oregon': { rate: 0.099, name: 'OR' },
    'Pennsylvania': { rate: 0.0307, name: 'PA' },
    'Rhode Island': { rate: 0.0599, name: 'RI' },
    'South Carolina': { rate: 0.064, name: 'SC' },
    'South Dakota': { rate: 0, name: 'SD', hasNoIncomeTax: true },
    'Tennessee': { rate: 0, name: 'TN', hasNoIncomeTax: true },
    'Texas': { rate: 0, name: 'TX', hasNoIncomeTax: true },
    'Utah': { rate: 0.0465, name: 'UT' },
    'Vermont': { rate: 0.066, name: 'VT' },
    'Virginia': { rate: 0.0575, name: 'VA' },
    'Washington': { rate: 0, name: 'WA', hasNoIncomeTax: true },
    'West Virginia': { rate: 0.0512, name: 'WV' },
    'Wisconsin': { rate: 0.0765, name: 'WI' },
    'Wyoming': { rate: 0, name: 'WY', hasNoIncomeTax: true }
};

const FEDERAL_TAX_BRACKETS_2024 = {
    single: [
        { min: 0, max: 11600, rate: 0.10 },
        { min: 11600, max: 47150, rate: 0.12 },
        { min: 47150, max: 100525, rate: 0.22 },
        { min: 100525, max: 191950, rate: 0.24 },
        { min: 191950, max: 243725, rate: 0.32 },
        { min: 243725, max: 609350, rate: 0.35 },
        { min: 609350, max: Infinity, rate: 0.37 }
    ],
    married: [
        { min: 0, max: 23200, rate: 0.10 },
        { min: 23200, max: 94300, rate: 0.12 },
        { min: 94300, max: 201050, rate: 0.22 },
        { min: 201050, max: 383900, rate: 0.24 },
        { min: 383900, max: 487450, rate: 0.32 },
        { min: 487450, max: 731200, rate: 0.35 },
        { min: 731200, max: Infinity, rate: 0.37 }
    ],
    head: [
        { min: 0, max: 16550, rate: 0.10 },
        { min: 16550, max: 63100, rate: 0.12 },
        { min: 63100, max: 100500, rate: 0.22 },
        { min: 100500, max: 191950, rate: 0.24 },
        { min: 191950, max: 243700, rate: 0.32 },
        { min: 243700, max: 609350, rate: 0.35 },
        { min: 609350, max: Infinity, rate: 0.37 }
    ]
};

const PAY_FREQUENCIES = [
    { value: 'weekly', label: 'Per Week', multiplier: 52 },
    { value: 'biweekly', label: 'Per 2 Weeks', multiplier: 26 },
    { value: 'semimonthly', label: 'Per Semi-Month', multiplier: 24 },
    { value: 'monthly', label: 'Per Month', multiplier: 12 },
    { value: 'annual', label: 'Per Year', multiplier: 1 }
];

const PAY_TYPES = [
    { value: 'salary', label: 'Salary' },
    { value: 'hourly', label: 'Hourly' }
];

const FILING_STATUSES = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married Filing Jointly' },
    { value: 'head', label: 'Head of Household' }
];

const EXPENSE_CATEGORIES = [
    'Housing', 'Utilities', 'Transportation', 'Food', 'Insurance', 'Healthcare', 
    'Debt Payments', 'Entertainment', 'Subscriptions', 'Savings', 'Other'
];

const INCOME_CATEGORIES = [
    'Salary', 'Side Gig', 'Freelance', 'Investments', 'Benefits', 'Other'
];

const SUGGESTED_RESOURCES = [
    { title: 'Update Your Resume', desc: 'Keep your resume fresh with AI assistance', icon: '📄', view: AppView.RESUME, condition: 'seeking' },
    { title: 'Find Remote Jobs', desc: 'Discover flexible work opportunities', icon: '🏠', view: AppView.JOBS, condition: 'seeking' },
    { title: 'Start a Side Hustle', desc: 'Earn extra income with your skills', icon: '💡', view: AppView.MONEY, condition: 'unemployed' },
    { title: 'Apply for Assistance', desc: 'Get help with bills and healthcare', icon: '🤝', view: AppView.ASSISTANCE, condition: 'unemployed' },
    { title: 'File for Unemployment', desc: 'Learn about your benefits', icon: '🏛️', view: AppView.UNEMPLOYMENT, condition: 'unemployed' },
    { title: 'Monetize Your Skills', desc: 'Turn expertise into income', icon: '📈', view: AppView.MONETIZATION, condition: 'self-employed' },
    { title: 'Launch a Business', desc: 'Build something of your own', icon: '🚀', view: AppView.FOUNDER, condition: 'self-employed' },
    { title: 'Career Coaching', desc: 'Get AI guidance on next steps', icon: '🧠', view: AppView.COACH, condition: 'all' }
];

export const Hub: React.FC<HubProps> = ({ onNavigate }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [tasks, setTasks] = useState<HubTask[]>([]);
    const [reminders, setReminders] = useState<HubReminder[]>([]);
    const [favorites, setFavorites] = useState<FavoriteResource[]>([]);
    const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
    const [assessments, setAssessments] = useState<FinancialAssessment[]>([]);
    const [selectedAssessment, setSelectedAssessment] = useState<FinancialAssessment | null>(null);
    const [dreamShiftAssessment, setDreamShiftAssessment] = useState<DreamShiftAssessment | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'budget' | 'calculator' | 'financial'>('overview');
    
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [newReminderTitle, setNewReminderTitle] = useState('');
    const [newReminderDate, setNewReminderDate] = useState('');
    
    const [newBudgetName, setNewBudgetName] = useState('');
    const [newBudgetAmount, setNewBudgetAmount] = useState('');
    const [newBudgetType, setNewBudgetType] = useState<'income' | 'expense'>('expense');
    const [newBudgetCategory, setNewBudgetCategory] = useState('');
    
    const [payType, setPayType] = useState('salary');
    const [grossPay, setGrossPay] = useState('');
    const [payFrequency, setPayFrequency] = useState('annual');
    const [hourlyRate, setHourlyRate] = useState('');
    const [regularHours, setRegularHours] = useState('40');
    const [overtimeHours, setOvertimeHours] = useState('');
    const [overtimeRate, setOvertimeRate] = useState('');
    const [filingStatus, setFilingStatus] = useState('single');
    const [calcState, setCalcState] = useState('California');
    const [federalAllowances, setFederalAllowances] = useState('0');
    const [preTax401k, setPreTax401k] = useState('');
    const [healthInsurance, setHealthInsurance] = useState('');
    const [otherDeductions, setOtherDeductions] = useState('');
    const [calculatedNet, setCalculatedNet] = useState<number | null>(null);
    const [taxBreakdown, setTaxBreakdown] = useState<any>(null);

    useEffect(() => {
        const savedProfile = getUserProfile();
        setProfile(savedProfile);
        setTasks(getHubTasks());
        setReminders(getHubReminders());
        setFavorites(getFavorites());
        setBudgetItems(getBudgetItems());
        setAssessments(getFinancialAssessments());
        setDreamShiftAssessment(getLatestDreamShiftAssessment());
        
        if (savedProfile) {
            if (savedProfile.state) setCalcState(savedProfile.state);
            if (savedProfile.filingStatus) setFilingStatus(savedProfile.filingStatus);
        }
    }, []);

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;
        const task = saveHubTask({
            title: newTaskTitle,
            completed: false,
            priority: newTaskPriority,
            category: 'other'
        });
        setTasks([...tasks, task]);
        setNewTaskTitle('');
    };

    const handleToggleTask = (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            updateHubTask(id, { completed: !task.completed });
            setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
        }
    };

    const handleDeleteTask = (id: string) => {
        deleteHubTask(id);
        setTasks(tasks.filter(t => t.id !== id));
    };

    const handleAddReminder = () => {
        if (!newReminderTitle.trim() || !newReminderDate) return;
        const reminder = saveHubReminder({
            title: newReminderTitle,
            datetime: newReminderDate,
            completed: false
        });
        setReminders([...reminders, reminder]);
        setNewReminderTitle('');
        setNewReminderDate('');
    };

    const handleDeleteReminder = (id: string) => {
        deleteHubReminder(id);
        setReminders(reminders.filter(r => r.id !== id));
    };

    const handleAddBudgetItem = () => {
        if (!newBudgetName.trim() || !newBudgetAmount) return;
        const item = saveBudgetItem({
            name: newBudgetName,
            amount: parseFloat(newBudgetAmount),
            type: newBudgetType,
            category: newBudgetCategory || (newBudgetType === 'income' ? 'Salary' : 'Other'),
            recurring: true
        });
        setBudgetItems([...budgetItems, item]);
        setNewBudgetName('');
        setNewBudgetAmount('');
        setNewBudgetCategory('');
    };

    const handleDeleteBudgetItem = (id: string) => {
        deleteBudgetItem(id);
        setBudgetItems(budgetItems.filter(i => i.id !== id));
    };

    const calculateFederalTax = (taxableIncome: number, status: string) => {
        const brackets = FEDERAL_TAX_BRACKETS_2024[status as keyof typeof FEDERAL_TAX_BRACKETS_2024] || FEDERAL_TAX_BRACKETS_2024.single;
        let tax = 0;
        let remaining = taxableIncome;
        
        for (const bracket of brackets) {
            if (remaining <= 0) break;
            const taxableInBracket = Math.min(remaining, bracket.max - bracket.min);
            tax += taxableInBracket * bracket.rate;
            remaining -= taxableInBracket;
        }
        
        return tax;
    };

    const calculateGrossPay = () => {
        let annualGross = 0;
        let periodGross = 0;
        let regularPay = 0;
        let overtimePay = 0;
        
        const freq = PAY_FREQUENCIES.find(f => f.value === payFrequency);
        const multiplier = freq?.multiplier || 1;
        
        if (payType === 'salary') {
            const gross = parseFloat(grossPay) || 0;
            annualGross = gross * multiplier;
            periodGross = gross;
        } else {
            const rate = parseFloat(hourlyRate) || 0;
            const hours = parseFloat(regularHours) || 40;
            const otHours = parseFloat(overtimeHours) || 0;
            const otRate = parseFloat(overtimeRate) || (rate * 1.5);
            
            const weeklyRegular = rate * hours;
            const weeklyOvertime = otRate * otHours;
            const weeklyGross = weeklyRegular + weeklyOvertime;
            annualGross = weeklyGross * 52;
            
            regularPay = (weeklyRegular * 52) / multiplier;
            overtimePay = (weeklyOvertime * 52) / multiplier;
            periodGross = annualGross / multiplier;
        }
        
        const annual401k = (parseFloat(preTax401k) || 0) * multiplier;
        const annualHealth = (parseFloat(healthInsurance) || 0) * multiplier;
        const annualOther = (parseFloat(otherDeductions) || 0) * multiplier;
        const totalPreTaxDeductions = annual401k + annualHealth + annualOther;
        
        const taxableIncome = Math.max(0, annualGross - totalPreTaxDeductions);
        
        const federalTax = calculateFederalTax(taxableIncome, filingStatus);
        
        const ssWageBase = 168600;
        const socialSecurity = Math.min(annualGross, ssWageBase) * 0.062;
        
        const medicare = annualGross * 0.0145;
        const additionalMedicare = annualGross > 200000 ? (annualGross - 200000) * 0.009 : 0;
        const totalMedicare = medicare + additionalMedicare;
        
        const stateInfo = STATE_TAX_RATES[calcState] || { rate: 0.05, name: 'Unknown' };
        const stateTax = taxableIncome * stateInfo.rate;
        
        const totalTaxes = federalTax + socialSecurity + totalMedicare + stateTax;
        const annualNet = annualGross - totalTaxes - totalPreTaxDeductions;
        const periodNet = annualNet / multiplier;
        
        const effectiveFederalRate = annualGross > 0 ? (federalTax / annualGross) * 100 : 0;
        const effectiveTotalRate = annualGross > 0 ? ((totalTaxes + totalPreTaxDeductions) / annualGross) * 100 : 0;
        
        setCalculatedNet(periodNet);
        setTaxBreakdown({
            payType,
            gross: periodGross,
            annualGross: annualGross,
            regularPay,
            overtimePay,
            federal: federalTax / multiplier,
            annualFederal: federalTax,
            socialSecurity: socialSecurity / multiplier,
            annualSS: socialSecurity,
            medicare: totalMedicare / multiplier,
            annualMedicare: totalMedicare,
            state: stateTax / multiplier,
            annualState: stateTax,
            stateInfo: stateInfo,
            preTax401k: parseFloat(preTax401k) || 0,
            healthIns: parseFloat(healthInsurance) || 0,
            otherDed: parseFloat(otherDeductions) || 0,
            totalDeductions: totalPreTaxDeductions / multiplier,
            net: periodNet,
            annualNet: annualNet,
            effectiveFederalRate: effectiveFederalRate,
            effectiveTotalRate: effectiveTotalRate,
            multiplier
        });
    };
    
    const handleSaveToBudget = (type: 'gross' | 'net') => {
        if (!taxBreakdown) return;
        const amount = type === 'gross' ? taxBreakdown.annualGross / 12 : taxBreakdown.annualNet / 12;
        const name = type === 'gross' ? 'Monthly Gross Income' : 'Monthly Net Income';
        const item = saveBudgetItem({
            name,
            amount: Math.round(amount * 100) / 100,
            type: 'income',
            category: 'Salary',
            recurring: true
        });
        setBudgetItems([...budgetItems, item]);
    };

    const totalIncome = budgetItems.filter(i => i.type === 'income').reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = budgetItems.filter(i => i.type === 'expense').reduce((sum, i) => sum + i.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    const getSuggestedResources = () => {
        const status = profile?.jobStatus || 'seeking';
        return SUGGESTED_RESOURCES.filter(r => r.condition === status || r.condition === 'all');
    };

    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = tasks.filter(t => !t.completed).length;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-24 animate-in fade-in duration-500">
            <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 text-white shadow-2xl border border-slate-800">
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${hubHeroImage})`, opacity: 0.4 }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-slate-900/70 to-teal-900/80"></div>
                <div className="relative z-10 p-10 md:p-16">
                    <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-white/10 text-blue-300">
                        Command Center
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tight">
                        Welcome{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-200 to-teal-300" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Hub.</span>
                    </h1>
                    <p className="text-lg text-slate-300 leading-relaxed font-medium max-w-xl">
                        Your personalized dashboard for tracking goals, managing finances, and discovering opportunities.
                    </p>
                    {profile?.state && (
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm text-slate-300">
                            <span>📍</span>
                            <span>{profile.city ? `${profile.city}, ` : ''}{profile.state}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-2 flex-wrap">
                {['overview', 'tasks', 'budget', 'calculator', 'financial'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                            activeTab === tab 
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' 
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                    >
                        {tab === 'overview' && '🏠 Overview'}
                        {tab === 'tasks' && '✅ Tasks & Reminders'}
                        {tab === 'budget' && '💰 Budget'}
                        {tab === 'calculator' && '🧮 Pay Calculator'}
                        {tab === 'financial' && '💚 Financial Assessment'}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-12">
                    {/* DreamShift Card */}
                    {dreamShiftAssessment && (
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-8 border border-purple-400 shadow-xl text-white">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-3xl font-black mb-2">✨ Your DreamShift Card</h2>
                                    <p className="text-purple-100 text-sm">Share your career identity and direction</p>
                                </div>
                                <button
                                    onClick={() => {
                                        const cardText = `✨ My DreamShift Card\n\n${dreamShiftAssessment.card.primaryArchetype} (with ${dreamShiftAssessment.card.secondaryArchetype} traits)\n\n${dreamShiftAssessment.card.plainEnglishSummary || ''}\n\nFulfillment Drivers:\n${dreamShiftAssessment.card.fulfillmentDrivers.map(d => `• ${d}`).join('\n')}\n\nTraits:\n${dreamShiftAssessment.card.traits?.map(t => `• ${t}`).join('\n') || ''}\n\nAvoids:\n${dreamShiftAssessment.card.avoids?.map(a => `• ${a}`).join('\n') || ''}\n\nThrives In:\n${dreamShiftAssessment.card.thrivesIn?.map(t => `• ${t}`).join('\n') || ''}\n\nGrowth Direction: ${dreamShiftAssessment.card.growthDirection.join(', ')}\n\nTransition Style: ${dreamShiftAssessment.card.transitionStyle}`;
                                        navigator.clipboard.writeText(cardText);
                                        alert('DreamShift Card copied to clipboard!');
                                    }}
                                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-black transition-colors border border-white/30"
                                >
                                    📋 Share Card
                                </button>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4">
                                <div className="text-center mb-4">
                                    <h3 className="text-2xl font-black mb-1">{dreamShiftAssessment.card.primaryArchetype}</h3>
                                    <p className="text-purple-200">with {dreamShiftAssessment.card.secondaryArchetype} traits</p>
                                </div>
                                
                                {/* Plain English Summary */}
                                {dreamShiftAssessment.card.plainEnglishSummary && (
                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mb-4 text-center">
                                        <p className="text-sm font-bold">{dreamShiftAssessment.card.plainEnglishSummary}</p>
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <h4 className="font-black text-sm mb-2">Fulfillment Drivers</h4>
                                        <ul className="space-y-1 text-sm">
                                            {dreamShiftAssessment.card.fulfillmentDrivers.map((driver, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span>•</span>
                                                    <span>{driver}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-black text-sm mb-2">Growth Direction</h4>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {dreamShiftAssessment.card.growthDirection.map((direction, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-white/20 rounded-full text-xs">
                                                    {direction}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-sm">
                                            <strong>Transition Style:</strong> {dreamShiftAssessment.card.transitionStyle}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Traits, Avoids, Thrives In */}
                                {(dreamShiftAssessment.card.traits?.length || dreamShiftAssessment.card.avoids?.length || dreamShiftAssessment.card.thrivesIn?.length) && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                        {dreamShiftAssessment.card.traits?.length > 0 && (
                                            <div>
                                                <h4 className="font-black text-xs mb-1">Traits</h4>
                                                <ul className="space-y-0.5">
                                                    {dreamShiftAssessment.card.traits.map((trait, idx) => (
                                                        <li key={idx}>• {trait}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {dreamShiftAssessment.card.avoids?.length > 0 && (
                                            <div>
                                                <h4 className="font-black text-xs mb-1">Avoids</h4>
                                                <ul className="space-y-0.5">
                                                    {dreamShiftAssessment.card.avoids.map((avoid, idx) => (
                                                        <li key={idx}>• {avoid}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {dreamShiftAssessment.card.thrivesIn?.length > 0 && (
                                            <div>
                                                <h4 className="font-black text-xs mb-1">Thrives In</h4>
                                                <ul className="space-y-0.5">
                                                    {dreamShiftAssessment.card.thrivesIn.map((thrive, idx) => (
                                                        <li key={idx}>• {thrive}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <button
                                onClick={() => onNavigate(AppView.DREAMSHIFT_ASSESSMENT)}
                                className="w-full px-6 py-3 bg-white text-purple-600 rounded-xl font-black hover:bg-purple-50 transition-colors"
                            >
                                View Full Assessment →
                            </button>
                        </div>
                    )}

                    {/* Quick Actions - Moved to Top */}
                    <section>
                        <div className="mb-8 flex items-center gap-5">
                            <div className="w-14 h-14 rounded-[1.5rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-3xl shadow-xl">🚀</div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Quick Actions</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Jump to common workflows</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Build Resume', icon: '📄', view: AppView.RESUME },
                                { label: 'Find Jobs', icon: '🔍', view: AppView.JOBS },
                                { label: 'Coaching', icon: '🧠', view: AppView.COACH },
                                { label: 'Start Business', icon: '🚀', view: AppView.FOUNDER }
                            ].map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onNavigate(action.view)}
                                    className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-700 dark:to-slate-800 text-white rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all"
                                >
                                    <div className="text-3xl mb-2">{action.icon}</div>
                                    <div className="font-bold text-sm">{action.label}</div>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* All Navigation Items with Hero Images */}
                    <section>
                        <div className="mb-8 flex items-center gap-5">
                            <div className="w-14 h-14 rounded-[1.5rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-3xl shadow-xl">🧭</div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">All Tools</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Access all features from the Hub</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Resume Lab', icon: '✨', view: AppView.RESUME, image: resumeHeroImage, gradient: 'from-rose-300 via-pink-200 to-white' },
                                { label: 'Job Hunter', icon: '🔍', view: AppView.JOBS, image: jobHeroImage, gradient: 'from-blue-300 via-cyan-200 to-white' },
                                { label: 'Gigs', icon: '💸', view: AppView.MONEY, image: moneyHeroImage, gradient: 'from-emerald-300 via-teal-200 to-white' },
                                { label: 'Monetization', icon: '📈', view: AppView.MONETIZATION, image: monetizationHeroImage, gradient: 'from-blue-300 via-indigo-200 to-white' },
                                { label: 'Unemployment', icon: '🏛️', view: AppView.UNEMPLOYMENT, image: unemploymentHeroImage, gradient: 'from-slate-300 via-gray-200 to-white' },
                                { label: 'Assistance', icon: '🤝', view: AppView.ASSISTANCE, image: assistanceHeroImage, gradient: 'from-cyan-300 via-blue-200 to-white' },
                                { label: 'Coaching', icon: '🧠', view: AppView.COACH, image: coachHeroImage, gradient: 'from-purple-300 via-indigo-200 to-white' },
                                { label: 'Founder', icon: '🚀', view: AppView.FOUNDER, image: founderHeroImage, gradient: 'from-amber-300 via-orange-200 to-white', useGradientText: true }
                            ].map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onNavigate(item.view)}
                                    className="group relative rounded-2xl overflow-hidden bg-slate-900 text-white shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-48"
                                >
                                    <div className="absolute inset-0">
                                        <img 
                                            src={item.image} 
                                            alt={item.label}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity"
                                        />
                                        <div className={`absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/50`}></div>
                                    </div>
                                    <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                                        {!item.useGradientText && <div className="text-3xl mb-2">{item.icon}</div>}
                                        <div>
                                            {item.useGradientText ? (
                                                <h3 className="font-black text-lg mb-1">
                                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                                                        🚀 Founder
                                                    </span>
                                                </h3>
                                            ) : (
                                                <h3 className="font-black text-lg mb-1">{item.label}</h3>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="text-3xl font-black text-blue-600">{pendingTasks}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Pending Tasks</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="text-3xl font-black text-green-600">{completedTasks}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Completed</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="text-3xl font-black text-purple-600">{favorites.length}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Favorites</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className={`text-3xl font-black ${netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                ${Math.abs(netBalance).toLocaleString()}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                {netBalance >= 0 ? 'Monthly Surplus' : 'Monthly Deficit'}
                            </div>
                        </div>
                    </div>

                    {favorites.length > 0 && (
                        <section>
                            <div className="mb-8 flex items-center gap-5">
                                <div className="w-14 h-14 rounded-[1.5rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-3xl shadow-xl">⭐</div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Your Favorites</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Quick access to saved resources</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {favorites.slice(0, 6).map((fav, idx) => (
                                    <a 
                                        key={idx} 
                                        href={fav.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{fav.title}</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{fav.description}</p>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 capitalize">{fav.category}</span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </section>
                    )}

                    <section>
                        <div className="mb-8 flex items-center gap-5">
                            <div className="w-14 h-14 rounded-[1.5rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-3xl shadow-xl">💡</div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Suggested For You</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Personalized recommendations based on your situation</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {getSuggestedResources().map((resource, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onNavigate(resource.view)}
                                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all text-left group"
                                >
                                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{resource.icon}</div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">{resource.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{resource.desc}</p>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'tasks' && (
                <div className="space-y-12">
                    <section>
                        <div className="mb-8 flex items-center gap-5">
                            <div className="w-14 h-14 rounded-[1.5rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-3xl shadow-xl">✅</div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Task List</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Keep track of your career goals</p>
                            </div>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 mb-6">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="Add a new task..."
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                />
                                <select
                                    value={newTaskPriority}
                                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                                <button
                                    onClick={handleAddTask}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {tasks.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <div className="text-5xl mb-4">📋</div>
                                    <p>No tasks yet. Add one above to get started!</p>
                                </div>
                            ) : (
                                tasks.map(task => (
                                    <div
                                        key={task.id}
                                        className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 flex items-center gap-4 transition-all ${task.completed ? 'opacity-60' : ''}`}
                                    >
                                        <button
                                            onClick={() => handleToggleTask(task.id)}
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                                task.completed 
                                                    ? 'bg-green-500 border-green-500 text-white' 
                                                    : 'border-slate-300 dark:border-slate-600 hover:border-green-500'
                                            }`}
                                        >
                                            {task.completed && '✓'}
                                        </button>
                                        <div className="flex-1">
                                            <span className={`font-medium text-slate-900 dark:text-white ${task.completed ? 'line-through' : ''}`}>
                                                {task.title}
                                            </span>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-lg font-bold uppercase ${
                                            task.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                        }`}>
                                            {task.priority}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <section>
                        <div className="mb-8 flex items-center justify-between gap-5">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-[1.5rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-3xl shadow-xl">⏰</div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Reminders</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Never miss important deadlines</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Default:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="168"
                                    value={getAppSettings().defaultReminderHours}
                                    onChange={(e) => {
                                        const hours = parseInt(e.target.value) || 24;
                                        saveAppSettings({ defaultReminderHours: hours });
                                    }}
                                    className="w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm text-center"
                                />
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">hours</span>
                            </div>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 mb-6">
                            <div className="flex gap-3 flex-wrap">
                                <input
                                    type="text"
                                    value={newReminderTitle}
                                    onChange={(e) => setNewReminderTitle(e.target.value)}
                                    placeholder="Reminder title..."
                                    className="flex-1 min-w-[200px] px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="datetime-local"
                                    value={newReminderDate}
                                    onChange={(e) => setNewReminderDate(e.target.value)}
                                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                                <button
                                    onClick={handleAddReminder}
                                    className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                                >
                                    Set Reminder
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {reminders.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <div className="text-5xl mb-4">⏰</div>
                                    <p>No reminders set. Add one above!</p>
                                </div>
                            ) : (
                                reminders.map(reminder => (
                                    <div
                                        key={reminder.id}
                                        className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 flex items-center gap-4"
                                    >
                                        <div className="text-2xl">🔔</div>
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-900 dark:text-white">{reminder.title}</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                                {new Date(reminder.datetime).toLocaleString()}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteReminder(reminder.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'budget' && (
                <div className="space-y-12">
                    <section>
                        <div className="mb-8 flex items-center gap-5">
                            <div className="w-14 h-14 rounded-[1.5rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-3xl shadow-xl">💰</div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Monthly Budget</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Track your income and expenses</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-3xl p-6 border border-green-200 dark:border-green-800">
                                <div className="text-sm text-green-600 dark:text-green-400 font-bold uppercase mb-1">Total Income</div>
                                <div className="text-3xl font-black text-green-700 dark:text-green-300">${totalIncome.toLocaleString()}</div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-3xl p-6 border border-red-200 dark:border-red-800">
                                <div className="text-sm text-red-600 dark:text-red-400 font-bold uppercase mb-1">Total Expenses</div>
                                <div className="text-3xl font-black text-red-700 dark:text-red-300">${totalExpenses.toLocaleString()}</div>
                            </div>
                            <div className={`rounded-3xl p-6 border ${netBalance >= 0 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'}`}>
                                <div className={`text-sm font-bold uppercase mb-1 ${netBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>Net Balance</div>
                                <div className={`text-3xl font-black ${netBalance >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'}`}>
                                    {netBalance >= 0 ? '+' : '-'}${Math.abs(netBalance).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 mb-6">
                            <div className="flex gap-3 flex-wrap">
                                <select
                                    value={newBudgetType}
                                    onChange={(e) => setNewBudgetType(e.target.value as any)}
                                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                >
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                                <input
                                    type="text"
                                    value={newBudgetName}
                                    onChange={(e) => setNewBudgetName(e.target.value)}
                                    placeholder="Name (e.g., Rent, Salary)..."
                                    className="flex-1 min-w-[150px] px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="number"
                                    value={newBudgetAmount}
                                    onChange={(e) => setNewBudgetAmount(e.target.value)}
                                    placeholder="Amount"
                                    className="w-32 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                                <select
                                    value={newBudgetCategory}
                                    onChange={(e) => setNewBudgetCategory(e.target.value)}
                                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                >
                                    <option value="">Category</option>
                                    {(newBudgetType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleAddBudgetItem}
                                    className={`px-6 py-3 text-white rounded-xl font-bold transition-colors ${newBudgetType === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">💵 Income</h3>
                                <div className="space-y-2">
                                    {budgetItems.filter(i => i.type === 'income').map(item => (
                                        <div key={item.id} className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 flex items-center justify-between border border-green-200 dark:border-green-800">
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-white">{item.name}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{item.category}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-green-600 dark:text-green-400">+${item.amount.toLocaleString()}</span>
                                                <button onClick={() => handleDeleteBudgetItem(item.id)} className="text-slate-400 hover:text-red-500">✕</button>
                                            </div>
                                        </div>
                                    ))}
                                    {budgetItems.filter(i => i.type === 'income').length === 0 && (
                                        <div className="text-center py-6 text-slate-400 text-sm">No income added yet</div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">💸 Expenses</h3>
                                <div className="space-y-2">
                                    {budgetItems.filter(i => i.type === 'expense').map(item => (
                                        <div key={item.id} className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 flex items-center justify-between border border-red-200 dark:border-red-800">
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-white">{item.name}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{item.category}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-red-600 dark:text-red-400">-${item.amount.toLocaleString()}</span>
                                                <button onClick={() => handleDeleteBudgetItem(item.id)} className="text-slate-400 hover:text-red-500">✕</button>
                                            </div>
                                        </div>
                                    ))}
                                    {budgetItems.filter(i => i.type === 'expense').length === 0 && (
                                        <div className="text-center py-6 text-slate-400 text-sm">No expenses added yet</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'calculator' && (
                <div className="space-y-12">
                    <section>
                        <div className="mb-8 flex items-center gap-5">
                            <div className="w-14 h-14 rounded-[1.5rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-3xl shadow-xl">🧮</div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Gross Pay Calculator</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Estimate your take-home pay after taxes</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700">
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Pay Frequency</label>
                                    <select
                                        value={payFrequency}
                                        onChange={(e) => setPayFrequency(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                                    >
                                        {PAY_FREQUENCIES.map(freq => (
                                            <option key={freq.value} value={freq.value}>{freq.label}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">How are you paid?</h3>
                                
                                <div className="space-y-5">
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Type</label>
                                            <select
                                                value={payType}
                                                onChange={(e) => setPayType(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                                            >
                                                {PAY_TYPES.map(type => (
                                                    <option key={type.value} value={type.value}>{type.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        {payType === 'salary' ? (
                                            <>
                                                <div className="col-span-2">
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Amount ({PAY_FREQUENCIES.find(f => f.value === payFrequency)?.label || 'Per Period'})</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                                        <input
                                                            type="number"
                                                            value={grossPay}
                                                            onChange={(e) => setGrossPay(e.target.value)}
                                                            placeholder="0.00"
                                                            className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Hours/Week</label>
                                                    <input
                                                        type="number"
                                                        value={regularHours}
                                                        onChange={(e) => setRegularHours(e.target.value)}
                                                        placeholder="40"
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Hourly Rate</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                                        <input
                                                            type="number"
                                                            value={hourlyRate}
                                                            onChange={(e) => setHourlyRate(e.target.value)}
                                                            placeholder="0.00"
                                                            className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    
                                    {payType === 'hourly' && (
                                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Any overtime?</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">OT Hours/Week</label>
                                                    <input
                                                        type="number"
                                                        value={overtimeHours}
                                                        onChange={(e) => setOvertimeHours(e.target.value)}
                                                        placeholder="0"
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">OT Rate (default 1.5x)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                                        <input
                                                            type="number"
                                                            value={overtimeRate}
                                                            onChange={(e) => setOvertimeRate(e.target.value)}
                                                            placeholder={(parseFloat(hourlyRate) * 1.5 || 0).toFixed(2)}
                                                            className="w-full pl-7 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2">Overtime rate defaults to 1.5x your hourly rate if not specified</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Filing Status</label>
                                        <select
                                            value={filingStatus}
                                            onChange={(e) => setFilingStatus(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                        >
                                            {FILING_STATUSES.map(status => (
                                                <option key={status.value} value={status.value}>{status.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">State {profile?.state && calcState === profile.state && <span className="text-xs text-blue-500">(from profile)</span>}</label>
                                        <select
                                            value={calcState}
                                            onChange={(e) => setCalcState(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                        >
                                            {US_STATES.map(s => (
                                                <option key={s} value={s}>{s}{STATE_TAX_RATES[s]?.hasNoIncomeTax ? ' (No Income Tax)' : ''}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Pre-Tax Deductions (Optional)</h4>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">401(k)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        value={preTax401k}
                                                        onChange={(e) => setPreTax401k(e.target.value)}
                                                        placeholder="0"
                                                        className="w-full pl-7 pr-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Health Ins.</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        value={healthInsurance}
                                                        onChange={(e) => setHealthInsurance(e.target.value)}
                                                        placeholder="0"
                                                        className="w-full pl-7 pr-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Other</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        value={otherDeductions}
                                                        onChange={(e) => setOtherDeductions(e.target.value)}
                                                        placeholder="0"
                                                        className="w-full pl-7 pr-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={calculateGrossPay}
                                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all"
                                    >
                                        Calculate Take-Home Pay
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white">
                                <h3 className="font-bold text-lg mb-6">Your Take-Home Pay</h3>
                                
                                {calculatedNet !== null && taxBreakdown ? (
                                    <div className="space-y-6">
                                        <div className="text-center py-8 border-b border-slate-700">
                                            <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Estimated Net Pay</div>
                                            <div className="text-5xl font-black text-green-400">
                                                ${calculatedNet.toFixed(2)}
                                            </div>
                                            <div className="text-sm text-slate-400 mt-2">
                                                {PAY_FREQUENCIES.find(f => f.value === payFrequency)?.label || 'per period'}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-slate-400">Gross Pay</span>
                                                <span className="font-bold">${taxBreakdown.gross.toFixed(2)}</span>
                                            </div>
                                            {taxBreakdown.payType === 'hourly' && taxBreakdown.regularPay > 0 && (
                                                <div className="flex justify-between items-center py-1 text-sm text-slate-500 pl-4">
                                                    <span>Regular ({regularHours}h x ${hourlyRate})</span>
                                                    <span>${taxBreakdown.regularPay.toFixed(2)}</span>
                                                </div>
                                            )}
                                            {taxBreakdown.payType === 'hourly' && taxBreakdown.overtimePay > 0 && (
                                                <div className="flex justify-between items-center py-1 text-sm text-orange-400 pl-4">
                                                    <span>Overtime ({overtimeHours}h x ${overtimeRate || (parseFloat(hourlyRate) * 1.5).toFixed(2)})</span>
                                                    <span>${taxBreakdown.overtimePay.toFixed(2)}</span>
                                                </div>
                                            )}
                                            {taxBreakdown.totalDeductions > 0 && (
                                                <div className="flex justify-between items-center py-2 text-blue-400">
                                                    <span>Pre-Tax Deductions</span>
                                                    <span>-${taxBreakdown.totalDeductions.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center py-2 text-red-400">
                                                <span>Federal Tax <span className="text-xs text-slate-500">({taxBreakdown.effectiveFederalRate?.toFixed(1)}%)</span></span>
                                                <span>-${taxBreakdown.federal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 text-red-400">
                                                <span>Social Security <span className="text-xs text-slate-500">(6.2%)</span></span>
                                                <span>-${taxBreakdown.socialSecurity.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 text-red-400">
                                                <span>Medicare <span className="text-xs text-slate-500">(1.45%)</span></span>
                                                <span>-${taxBreakdown.medicare.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 text-red-400">
                                                <span>State Tax ({calcState}) <span className="text-xs text-slate-500">({(STATE_TAX_RATES[calcState]?.rate * 100 || 0).toFixed(1)}%)</span>{taxBreakdown.stateInfo?.hasNoIncomeTax && <span className="ml-1 text-xs text-green-400">(No State Tax!)</span>}</span>
                                                <span>-${taxBreakdown.state.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-3 border-t border-slate-700 mt-4">
                                                <span className="font-bold text-lg">Net Pay</span>
                                                <span className="font-black text-xl text-green-400">${taxBreakdown.net.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="mt-6 p-4 bg-slate-800 rounded-xl">
                                            <div className="text-xs text-slate-400 mb-2">Annual Estimates</div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <div className="text-slate-500">Gross</div>
                                                    <div className="font-bold">${Math.round(taxBreakdown.annualGross).toLocaleString()}</div>
                                                </div>
                                                <div>
                                                    <div className="text-slate-500">Net</div>
                                                    <div className="font-bold text-green-400">${Math.round(taxBreakdown.annualNet).toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <div className="mt-3 text-xs text-slate-500">
                                                Effective Total Tax Rate: <span className="text-white font-bold">{taxBreakdown.effectiveTotalRate?.toFixed(1)}%</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => handleSaveToBudget('gross')}
                                                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors"
                                            >
                                                Save Gross to Budget
                                            </button>
                                            <button
                                                onClick={() => handleSaveToBudget('net')}
                                                className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-sm transition-colors"
                                            >
                                                Save Net to Budget
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-500 text-center">Saves monthly amount to your budget</p>

                                        <p className="text-xs text-slate-500 mt-4">
                                            * This is an estimate using 2024 federal tax brackets. Actual taxes may vary based on deductions, credits, state-specific rules, and current tax rates.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center py-16 text-slate-400">
                                        <div className="text-6xl mb-4">💵</div>
                                        <p>Enter your gross pay details to see your estimated take-home pay</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'financial' && (
                <div className="space-y-12">
                    <section>
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-[1.5rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-3xl shadow-xl">💚</div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Financial Assessments</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">View your saved assessments and financial plans</p>
                                </div>
                            </div>
                            <button
                                onClick={() => onNavigate(AppView.FINANCIAL_ASSESSMENT)}
                                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                            >
                                + New Assessment
                            </button>
                        </div>

                        {assessments.length === 0 ? (
                            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
                                <div className="text-5xl mb-4">📊</div>
                                <p className="text-slate-400 mb-4">No assessments yet</p>
                                <button
                                    onClick={() => onNavigate(AppView.FINANCIAL_ASSESSMENT)}
                                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                                >
                                    Take Your First Assessment
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {assessments.map(assessment => (
                                    <div key={assessment.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                                    Assessment from {new Date(assessment.createdAt).toLocaleDateString()}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {assessment.stabilityLevel} • {assessment.mobilityScore} Mobility • {assessment.incomeFlexibility} Flexibility
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        if (selectedAssessment?.id === assessment.id) {
                                                            setSelectedAssessment(null);
                                                        } else {
                                                            setSelectedAssessment(assessment);
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                >
                                                    {selectedAssessment?.id === assessment.id ? 'Hide Details' : 'View Details'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        // Navigate to assessment view with this assessment loaded
                                                        onNavigate(AppView.FINANCIAL_ASSESSMENT);
                                                        // Store assessment ID in sessionStorage to load it
                                                        sessionStorage.setItem('editAssessmentId', assessment.id);
                                                    }}
                                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors"
                                                >
                                                    Edit Assessment
                                                </button>
                                            </div>
                                        </div>

                                        {selectedAssessment?.id === assessment.id && (
                                            <div className="space-y-6 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                                {/* Stability Snapshot */}
                                                <div>
                                                    <h4 className="text-lg font-black text-slate-900 dark:text-white mb-4">Stability Snapshot</h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                        <div className={`p-4 rounded-xl border-2 ${
                                                            assessment.stabilityLevel === 'Stable' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400' :
                                                            assessment.stabilityLevel === 'Watch Closely' ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-400' :
                                                            'bg-red-50 dark:bg-red-900/30 border-red-400'
                                                        }`}>
                                                            <p className="text-xs font-black text-slate-600 dark:text-slate-400 mb-1">Stability Level</p>
                                                            <p className="text-lg font-black text-slate-900 dark:text-white">{assessment.stabilityLevel}</p>
                                                        </div>
                                                        <div className={`p-4 rounded-xl border-2 ${
                                                            assessment.mobilityScore === 'High' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400' :
                                                            assessment.mobilityScore === 'Medium' ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-400' :
                                                            'bg-red-50 dark:bg-red-900/30 border-red-400'
                                                        }`}>
                                                            <p className="text-xs font-black text-slate-600 dark:text-slate-400 mb-1">Mobility Score</p>
                                                            <p className="text-lg font-black text-slate-900 dark:text-white">{assessment.mobilityScore}</p>
                                                        </div>
                                                        <div className={`p-4 rounded-xl border-2 ${
                                                            assessment.incomeFlexibility === 'High' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400' :
                                                            assessment.incomeFlexibility === 'Medium' ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-400' :
                                                            'bg-red-50 dark:bg-red-900/30 border-red-400'
                                                        }`}>
                                                            <p className="text-xs font-black text-slate-600 dark:text-slate-400 mb-1">Income Flexibility</p>
                                                            <p className="text-lg font-black text-slate-900 dark:text-white">{assessment.incomeFlexibility}</p>
                                                        </div>
                                                        <div className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                                            <p className="text-xs font-black text-slate-600 dark:text-slate-400 mb-1">Primary Constraint</p>
                                                            <p className="text-lg font-black text-slate-900 dark:text-white">{assessment.primaryConstraint}</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border-l-4 border-emerald-500">
                                                        <p className="text-sm font-black text-emerald-900 dark:text-emerald-300 mb-1">Insight:</p>
                                                        <p className="text-sm text-emerald-800 dark:text-emerald-400 italic">{assessment.insight}</p>
                                                    </div>
                                                </div>

                                                {/* Financial Plan */}
                                                {assessment.financialPlan && (
                                                    <div>
                                                        <h4 className="text-lg font-black text-slate-900 dark:text-white mb-4">Financial Plan</h4>
                                                        <div className="space-y-4">
                                                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border-l-4 border-emerald-500">
                                                                <p className="text-sm font-black text-emerald-900 dark:text-emerald-300 mb-2">Next 7 Days</p>
                                                                <ul className="text-xs text-emerald-800 dark:text-emerald-400 space-y-1 ml-4 list-disc">
                                                                    {assessment.financialPlan.next7Days.map((item, idx) => (
                                                                        <li key={idx}>{item}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl border-l-4 border-teal-500">
                                                                <p className="text-sm font-black text-teal-900 dark:text-teal-300 mb-2">30 Days</p>
                                                                <ul className="text-xs text-teal-800 dark:text-teal-400 space-y-1 ml-4 list-disc">
                                                                    {assessment.financialPlan.next30Days.map((item, idx) => (
                                                                        <li key={idx}>{item}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border-l-4 border-slate-400">
                                                                <p className="text-sm font-black text-slate-900 dark:text-white mb-2">60–90 Days</p>
                                                                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 ml-4 list-disc">
                                                                    {assessment.financialPlan.next60to90Days.map((item, idx) => (
                                                                        <li key={idx}>{item}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Recommended Resources */}
                                                <div>
                                                    <h4 className="text-lg font-black text-slate-900 dark:text-white mb-4">Recommended Resources</h4>
                                                    <div className="space-y-4">
                                                        {assessment.suggestedResources.assistance.length > 0 && (
                                                            <div>
                                                                <h5 className="text-base font-black text-emerald-900 dark:text-emerald-300 mb-2">💚 Assistance Resources</h5>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                    {assessment.suggestedResources.assistance.map((resource, idx) => (
                                                                        <div key={idx} className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                                                                            <p className="text-sm font-black text-emerald-900 dark:text-emerald-300">{resource.title}</p>
                                                                            <p className="text-xs text-emerald-800 dark:text-emerald-400">{resource.category}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {assessment.suggestedResources.money.length > 0 && (
                                                            <div>
                                                                <h5 className="text-base font-black text-amber-900 dark:text-amber-300 mb-2">💰 Money / Gigs Resources</h5>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                    {assessment.suggestedResources.money.map((resource, idx) => (
                                                                        <div key={idx} className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                                                                            <p className="text-sm font-black text-amber-900 dark:text-amber-300">{resource.title}</p>
                                                                            <p className="text-xs text-amber-800 dark:text-amber-400">{resource.category}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};
