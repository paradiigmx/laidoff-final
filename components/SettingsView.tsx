
import React, { useState, useEffect } from 'react';
import { clearRecentSearches, clearAllSavedJobs, getAppSettings, saveAppSettings, AppSettings } from '../services/storageService';

interface SettingsViewProps {
    darkMode: boolean;
    onToggleDarkMode: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ darkMode, onToggleDarkMode }) => {
    const [activeSection, setActiveSection] = useState<'settings' | 'terms' | 'faq'>('settings');
    const [settings, setSettings] = useState<AppSettings>(getAppSettings());
    
    useEffect(() => {
        setSettings(getAppSettings());
    }, []);

    const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        const updated = saveAppSettings({ [key]: value });
        setSettings(updated);
    };

    const handleClearHistory = () => {
        if (window.confirm("Clear all recent job search history?")) {
            clearRecentSearches();
            alert("History cleared.");
        }
    };

    const handleClearSavedJobs = () => {
        if (window.confirm("Clear all saved jobs?")) {
            clearAllSavedJobs();
            alert("Saved jobs cleared.");
        }
    };

    const handleResetApp = () => {
        if (window.confirm("CRITICAL: This will delete ALL saved resumes, jobs, and projects. This action cannot be undone. Proceed?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const faqs = [
        {
            q: "What is DreamShift?",
            a: "DreamShift is an AI-powered career assistance platform that helps you build resumes, find jobs, manage finances, and navigate career transitions with personalized guidance."
        },
        {
            q: "Is my data stored securely?",
            a: "Your data is stored locally in your browser using localStorage. We do not transmit or store your personal information on external servers. You have full control over your data and can delete it anytime from Settings."
        },
        {
            q: "How does the AI Resume Lab work?",
            a: "Upload your existing resume or start fresh. Our AI analyzes your content and suggests improvements, rewrites sections for clarity, and helps tailor your resume for specific job applications."
        },
        {
            q: "What is the Pay Calculator?",
            a: "The Pay Calculator estimates your take-home pay after federal, state, Social Security, and Medicare taxes. It supports both salary and hourly workers, including overtime calculations."
        },
        {
            q: "How do I save items to my favorites?",
            a: "When browsing resources across Money/Gigs, Monetization, Unemployment, or Assistance pages, click the star icon on any resource card to save it to your favorites for quick access from your Hub."
        },
        {
            q: "Can I use DreamShift offline?",
            a: "Most features require an internet connection for AI-powered analysis. However, your saved data (resumes, tasks, budget items) will persist locally and be accessible when you return online."
        },
        {
            q: "How do I delete my account data?",
            a: "Go to Settings > Data & History > Factory Reset. This will permanently delete all your data including resumes, saved jobs, tasks, and profile information."
        },
        {
            q: "Is DreamShift free to use?",
            a: "DreamShift offers core features for free. Some advanced AI features may require a subscription or API key configuration."
        }
    ];

    return (
        <div className="max-w-4xl mx-auto py-12 animate-in fade-in">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8">Settings & Support</h1>
            
            <div className="flex gap-2 mb-8">
                {[
                    { id: 'settings', label: 'Settings', icon: '⚙️' },
                    { id: 'faq', label: 'FAQs', icon: '❓' },
                    { id: 'terms', label: 'Terms of Service', icon: '📜' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSection(tab.id as any)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                            activeSection === tab.id 
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {activeSection === 'settings' && (
                <div className="space-y-6">
                    <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Appearance</h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-200">Dark Mode</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Toggle between light and dark themes.</p>
                            </div>
                            <button 
                                onClick={onToggleDarkMode}
                                className={`w-14 h-8 rounded-full transition-colors relative ${darkMode ? 'bg-brand-600' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all ${darkMode ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Notifications & Preferences</h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Push Notifications</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive reminders for tasks and deadlines.</p>
                                </div>
                                <button 
                                    onClick={() => updateSetting('notifications', !settings.notifications)}
                                    className={`w-14 h-8 rounded-full transition-colors relative ${settings.notifications ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all ${settings.notifications ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Email Updates</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive weekly career tips and job market insights.</p>
                                </div>
                                <button 
                                    onClick={() => updateSetting('emailUpdates', !settings.emailUpdates)}
                                    className={`w-14 h-8 rounded-full transition-colors relative ${settings.emailUpdates ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all ${settings.emailUpdates ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Auto-Save</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Automatically save your work as you type.</p>
                                </div>
                                <button 
                                    onClick={() => updateSetting('autoSave', !settings.autoSave)}
                                    className={`w-14 h-8 rounded-full transition-colors relative ${settings.autoSave ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all ${settings.autoSave ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Default Reminder Time</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Set default hours until reminder for saved jobs.</p>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            min="1"
                                            max="168"
                                            value={settings.defaultReminderHours}
                                            onChange={(e) => updateSetting('defaultReminderHours', parseInt(e.target.value) || 24)}
                                            className="w-24 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-center"
                                        />
                                        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">hours</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Job Search Settings</h2>
                        <div className="space-y-6 mb-8">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Search Result Persistence</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Search results are automatically saved and restored when switching tabs.</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Data & History</h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Clear Search History</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Delete your recent job search queries and filters.</p>
                                </div>
                                <button 
                                    onClick={handleClearHistory}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Clear
                                </button>
                            </div>
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Clear Saved Jobs</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Remove all jobs you've saved for later.</p>
                                </div>
                                <button 
                                    onClick={handleClearSavedJobs}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Clear
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-red-600">Factory Reset</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Delete all data stored in the application.</p>
                                </div>
                                <button 
                                    onClick={handleResetApp}
                                    className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all border border-red-100 dark:border-red-900/50"
                                >
                                    Reset All
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">System Info</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Version</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">2.0.0</span>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Engine</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">Gemini 2.5</span>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Platform</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">Replit</span>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Last Updated</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">Dec 2025</span>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeSection === 'faq' && (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Frequently Asked Questions</h2>
                        <p className="text-slate-500 dark:text-slate-400">Find answers to common questions about DreamShift.</p>
                    </div>
                    
                    {faqs.map((faq, idx) => (
                        <details key={idx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 group">
                            <summary className="p-6 cursor-pointer font-bold text-slate-900 dark:text-white flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors">
                                <span>{faq.q}</span>
                                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed">
                                {faq.a}
                            </div>
                        </details>
                    ))}

                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-3xl text-white mt-8">
                        <h3 className="font-bold text-xl mb-2">Still have questions?</h3>
                        <p className="text-blue-100 mb-4">We're here to help. Reach out to our support team for personalized assistance.</p>
                        <a href="mailto:support@dreamshift.app" className="inline-block px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors">
                            Contact Support
                        </a>
                    </div>
                </div>
            )}

            {activeSection === 'terms' && (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Terms of Service</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Last updated: December 2025</p>
                    
                    <div className="prose dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300">
                        <section>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">1. Acceptance of Terms</h3>
                            <p className="text-sm leading-relaxed">
                                By accessing or using DreamShift ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">2. Description of Service</h3>
                            <p className="text-sm leading-relaxed">
                                DreamShift is an AI-powered career assistance platform that provides resume building tools, job search assistance, financial calculators, and career guidance resources. The Service is provided "as is" and is intended for informational and educational purposes only.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">3. User Data & Privacy</h3>
                            <p className="text-sm leading-relaxed">
                                Your data is stored locally in your browser using localStorage technology. We do not collect, transmit, or store your personal information on external servers unless explicitly stated. You are responsible for backing up your own data. We are not liable for data loss due to browser clearing, device changes, or technical issues.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">4. AI-Generated Content</h3>
                            <p className="text-sm leading-relaxed">
                                The Service uses artificial intelligence to generate content suggestions, rewrites, and recommendations. AI-generated content should be reviewed and verified by you before use. We do not guarantee the accuracy, completeness, or suitability of AI-generated content for any specific purpose.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">5. Financial Information Disclaimer</h3>
                            <p className="text-sm leading-relaxed">
                                The Pay Calculator and financial tools provide estimates based on publicly available tax information. These calculations are for informational purposes only and should not be considered tax, legal, or financial advice. Consult with qualified professionals for personalized financial guidance.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">6. Intellectual Property</h3>
                            <p className="text-sm leading-relaxed">
                                All content, features, and functionality of the Service are owned by DreamShift and are protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without explicit permission.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">7. Limitation of Liability</h3>
                            <p className="text-sm leading-relaxed">
                                DreamShift shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service. This includes but is not limited to loss of data, loss of income, or career-related decisions made based on the Service's content.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">8. Modifications to Terms</h3>
                            <p className="text-sm leading-relaxed">
                                We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the modified Terms. We encourage you to review these Terms periodically.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">9. Contact Information</h3>
                            <p className="text-sm leading-relaxed">
                                For questions about these Terms of Service, please contact us at support@dreamshift.app.
                            </p>
                        </section>
                    </div>

                    <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                            By using DreamShift, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
