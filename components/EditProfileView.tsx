import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { getUserProfile, saveUserProfile } from '../services/storageService';

const US_STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
    'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
    'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
    'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

interface EditProfileViewProps {
    onBack: () => void;
}

export const EditProfileView: React.FC<EditProfileViewProps> = ({ onBack }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
    const [saved, setSaved] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const saved = getUserProfile();
        setProfile(saved);
        if (saved) {
            setEditForm(saved);
        } else {
            setEditForm({ jobStatus: 'seeking' });
        }
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Image must be less than 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditForm({ ...editForm, imageUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setEditForm({ ...editForm, imageUrl: undefined });
    };

    const handleSave = () => {
        const now = new Date().toISOString();
        const newProfile: UserProfile = {
            id: profile?.id || Math.random().toString(36).substr(2, 9),
            name: editForm.name || 'Guest',
            email: editForm.email,
            phone: editForm.phone,
            location: editForm.location,
            state: editForm.state,
            city: editForm.city,
            zipCode: editForm.zipCode,
            imageUrl: editForm.imageUrl,
            dateOfBirth: editForm.dateOfBirth,
            gender: editForm.gender,
            ethnicity: editForm.ethnicity,
            veteranStatus: editForm.veteranStatus,
            disabilityStatus: editForm.disabilityStatus,
            jobStatus: editForm.jobStatus || 'seeking',
            currentJobTitle: editForm.currentJobTitle,
            currentCompany: editForm.currentCompany,
            desiredJobTitle: editForm.desiredJobTitle,
            desiredSalary: editForm.desiredSalary,
            incomeGoal: editForm.incomeGoal,
            filingStatus: editForm.filingStatus,
            createdAt: profile?.createdAt || now,
            updatedAt: now
        };
        saveUserProfile(newProfile);
        setProfile(newProfile);
        setSaved(true);
        window.dispatchEvent(new CustomEvent('profileUpdated'));
        setTimeout(() => setSaved(false), 2000);
    };

    const initials = editForm.name ? editForm.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

    return (
        <div className="max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">
            <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 text-white shadow-2xl border border-slate-800 mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-slate-900/80 to-blue-900/60"></div>
                <div className="relative z-10 p-10 md:p-16">
                    <button
                        onClick={onBack}
                        className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <span>←</span>
                        <span>Back to Hub</span>
                    </button>
                    <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-white/10 text-purple-300">
                        Profile Settings
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tight">
                        Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-200 to-blue-300" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Profile.</span>
                    </h1>
                    <p className="text-lg text-slate-300 leading-relaxed font-medium max-w-xl">
                        Personalize your DreamShift experience with your details.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 sticky top-8">
                        <div className="flex flex-col items-center">
                            <div className="relative mb-6">
                                {editForm.imageUrl ? (
                                    <img 
                                        src={editForm.imageUrl} 
                                        alt="Profile" 
                                        className="w-32 h-32 rounded-full object-cover border-4 border-slate-200 dark:border-slate-600 shadow-lg"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                                        {initials}
                                    </div>
                                )}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white text-lg shadow-lg transition-colors"
                                >
                                    📷
                                </button>
                                <input 
                                    ref={fileInputRef} 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageUpload} 
                                    className="hidden" 
                                />
                            </div>
                            {editForm.imageUrl && (
                                <button
                                    onClick={handleRemoveImage}
                                    className="text-sm text-red-500 hover:text-red-600 mb-4"
                                >
                                    Remove Photo
                                </button>
                            )}
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center">
                                {editForm.name || 'Your Name'}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                                {editForm.jobStatus?.replace('-', ' ') || 'Job Status'}
                            </p>
                            {editForm.currentJobTitle && (
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                                    {editForm.currentJobTitle}
                                    {editForm.currentCompany && ` at ${editForm.currentCompany}`}
                                </p>
                            )}
                            {(editForm.city || editForm.state) && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    📍 {editForm.city}{editForm.city && editForm.state && ', '}{editForm.state}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="text-2xl">👤</span> Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    value={editForm.name || ''}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={editForm.email || ''}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    placeholder="john@example.com"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={editForm.phone || ''}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    placeholder="(555) 123-4567"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="text-2xl">📍</span> Location
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">City</label>
                                <input
                                    type="text"
                                    value={editForm.city || ''}
                                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                    placeholder="Los Angeles"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">State *</label>
                                <select
                                    value={editForm.state || ''}
                                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                >
                                    <option value="">Select State</option>
                                    {US_STATES.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ZIP Code</label>
                                <input
                                    type="text"
                                    value={editForm.zipCode || ''}
                                    onChange={(e) => setEditForm({ ...editForm, zipCode: e.target.value })}
                                    placeholder="90210"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="text-2xl">💼</span> Employment
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Job Status *</label>
                                <select
                                    value={editForm.jobStatus || 'seeking'}
                                    onChange={(e) => setEditForm({ ...editForm, jobStatus: e.target.value as any })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                >
                                    <option value="employed">Employed</option>
                                    <option value="unemployed">Unemployed</option>
                                    <option value="self-employed">Self-Employed</option>
                                    <option value="seeking">Seeking Work</option>
                                    <option value="student">Student</option>
                                    <option value="retired">Retired</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current/Last Job Title</label>
                                <input
                                    type="text"
                                    value={editForm.currentJobTitle || ''}
                                    onChange={(e) => setEditForm({ ...editForm, currentJobTitle: e.target.value })}
                                    placeholder="Software Engineer"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Company</label>
                                <input
                                    type="text"
                                    value={editForm.currentCompany || ''}
                                    onChange={(e) => setEditForm({ ...editForm, currentCompany: e.target.value })}
                                    placeholder="Acme Corp"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Desired Job Title</label>
                                <input
                                    type="text"
                                    value={editForm.desiredJobTitle || ''}
                                    onChange={(e) => setEditForm({ ...editForm, desiredJobTitle: e.target.value })}
                                    placeholder="Senior Developer"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Desired Salary</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                    <input
                                        type="number"
                                        value={editForm.desiredSalary || ''}
                                        onChange={(e) => setEditForm({ ...editForm, desiredSalary: Number(e.target.value) || undefined })}
                                        placeholder="100000"
                                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="text-2xl">🧮</span> Tax Information
                            <span className="text-xs text-slate-500 font-normal ml-2">(Used in Pay Calculator)</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Filing Status</label>
                                <select
                                    value={editForm.filingStatus || 'single'}
                                    onChange={(e) => setEditForm({ ...editForm, filingStatus: e.target.value as any })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                >
                                    <option value="single">Single</option>
                                    <option value="married">Married Filing Jointly</option>
                                    <option value="head">Head of Household</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Income Goal</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                    <input
                                        type="number"
                                        value={editForm.incomeGoal || ''}
                                        onChange={(e) => setEditForm({ ...editForm, incomeGoal: Number(e.target.value) || undefined })}
                                        placeholder="Annual goal"
                                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                            <span className="text-2xl">📋</span> Demographics
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Optional information to help personalize recommendations</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Date of Birth</label>
                                <input
                                    type="date"
                                    value={editForm.dateOfBirth || ''}
                                    onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Gender</label>
                                <select
                                    value={editForm.gender || ''}
                                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as any })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                >
                                    <option value="">Prefer not to say</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="non-binary">Non-binary</option>
                                    <option value="prefer-not-to-say">Prefer not to say</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Veteran Status</label>
                                <select
                                    value={editForm.veteranStatus || ''}
                                    onChange={(e) => setEditForm({ ...editForm, veteranStatus: e.target.value as any })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                >
                                    <option value="">Prefer not to say</option>
                                    <option value="veteran">Veteran</option>
                                    <option value="non-veteran">Non-veteran</option>
                                    <option value="prefer-not-to-say">Prefer not to say</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Disability Status</label>
                                <select
                                    value={editForm.disabilityStatus || ''}
                                    onChange={(e) => setEditForm({ ...editForm, disabilityStatus: e.target.value as any })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                >
                                    <option value="">Prefer not to say</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                    <option value="prefer-not-to-say">Prefer not to say</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleSave}
                            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            {saved ? (
                                <>
                                    <span>✓</span>
                                    <span>Saved!</span>
                                </>
                            ) : (
                                <>
                                    <span>💾</span>
                                    <span>Save Profile</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={onBack}
                            className="px-8 py-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
