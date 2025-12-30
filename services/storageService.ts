
import { SavedResume, SavedFounderProject, FavoriteResource, SavedJob, JobListing, JobStatus, RecentSearch, CareerProfile, JobAlert, UserProfile, HubTask, HubReminder, BudgetItem, FinancialAssessment, FinancialPlan, FinancialPlanTask, DreamShiftAssessment, BusinessProfile } from '../types';

const STORAGE_KEYS = {
    RESUMES: 'cl_resumes',
    FOUNDER: 'cl_founder_projects',
    FAVORITES: 'cl_favorites',
    SAVED_JOBS: 'cl_saved_jobs',
    RECENT_SEARCHES: 'cl_recent_searches',
    CAREER_PROFILE: 'cl_career_profile',
    JOB_ALERTS: 'cl_job_alerts',
    USER_PROFILE: 'ds_user_profile',
    HUB_TASKS: 'ds_hub_tasks',
    HUB_REMINDERS: 'ds_hub_reminders',
    BUDGET_ITEMS: 'ds_budget_items',
    APP_SETTINGS: 'ds_app_settings',
    FINANCIAL_ASSESSMENTS: 'ds_financial_assessments',
    FINANCIAL_PLANS: 'ds_financial_plans',
    DREAMSHIFT_ASSESSMENTS: 'ds_dreamshift_assessments',
    BUSINESS_PROFILES: 'ds_business_profiles'
};

// --- App Settings ---
export interface AppSettings {
    defaultReminderHours: number;
    autoSave: boolean;
    notifications: boolean;
    emailUpdates: boolean;
    theme: 'light' | 'dark' | 'auto';
}

export const getAppSettings = (): AppSettings => {
    const stored = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    if (stored) {
        return JSON.parse(stored);
    }
    return {
        defaultReminderHours: 24,
        autoSave: true,
        notifications: true,
        emailUpdates: false,
        theme: 'auto'
    };
};

export const saveAppSettings = (settings: Partial<AppSettings>) => {
    const current = getAppSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(updated));
    return updated;
};

// --- Job Alerts ---
export const getJobAlerts = (): JobAlert[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.JOB_ALERTS);
    return stored ? JSON.parse(stored) : [];
};

export const saveJobAlert = (alert: Omit<JobAlert, 'id' | 'createdAt'>) => {
    const alerts = getJobAlerts();
    const newAlert: JobAlert = {
        ...alert,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
    };
    alerts.push(newAlert);
    localStorage.setItem(STORAGE_KEYS.JOB_ALERTS, JSON.stringify(alerts));
};

export const deleteJobAlert = (id: string) => {
    const alerts = getJobAlerts().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.JOB_ALERTS, JSON.stringify(alerts));
};

// --- Resumes ---
export const getSavedResumes = (): SavedResume[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.RESUMES);
    return stored ? JSON.parse(stored) : [];
};

export const saveResume = (resume: SavedResume) => {
    const resumes = getSavedResumes();
    const index = resumes.findIndex(r => r.id === resume.id);
    if (index >= 0) {
        resumes[index] = resume;
    } else {
        resumes.push(resume);
    }
    localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(resumes));
};

export const deleteResume = (id: string) => {
    const resumes = getSavedResumes().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(resumes));
};

// --- Founder Projects ---
export const getSavedProjects = (): SavedFounderProject[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.FOUNDER);
    return stored ? JSON.parse(stored) : [];
};

export const saveProject = (project: SavedFounderProject) => {
    const projects = getSavedProjects();
    const index = projects.findIndex(p => p.id === project.id);
    if (index >= 0) {
        projects[index] = project;
    } else {
        projects.push(project);
    }
    localStorage.setItem(STORAGE_KEYS.FOUNDER, JSON.stringify(projects));
};

export const deleteProject = (id: string) => {
    const projects = getSavedProjects().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.FOUNDER, JSON.stringify(projects));
};

// --- Favorites ---
export const getFavorites = (): FavoriteResource[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return stored ? JSON.parse(stored) : [];
};

export const toggleFavorite = (resource: FavoriteResource) => {
    const favorites = getFavorites();
    const index = favorites.findIndex(f => f.link === resource.link);
    if (index >= 0) {
        favorites.splice(index, 1);
    } else {
        favorites.push(resource);
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return index < 0;
};

export const isFavorited = (link: string): boolean => {
    const favorites = getFavorites();
    return favorites.some(f => f.link === link);
};

// --- Saved Jobs ---
export const getSavedJobs = (): SavedJob[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.SAVED_JOBS);
    return stored ? JSON.parse(stored) : [];
};

export const saveJob = (job: JobListing, reminderHours: number = 24) => {
    const jobs = getSavedJobs();
    const exists = jobs.some(j => j.applyUrl === job.applyUrl);
    if (!exists) {
        const reminderAt = new Date();
        reminderAt.setHours(reminderAt.getHours() + reminderHours);
        jobs.push({ 
            ...job, 
            savedAt: new Date().toISOString(), 
            status: 'Interested',
            reminderAt: reminderAt.toISOString(),
            reminderEnabled: true
        });
        localStorage.setItem(STORAGE_KEYS.SAVED_JOBS, JSON.stringify(jobs));
    }
};

export const saveJobWithReminder = (job: JobListing, reminderHours: number, reminderEnabled: boolean = true) => {
    const jobs = getSavedJobs();
    const existingIndex = jobs.findIndex(j => j.applyUrl === job.applyUrl);
    const reminderAt = reminderEnabled ? (() => {
        const date = new Date();
        date.setHours(date.getHours() + reminderHours);
        return date.toISOString();
    })() : undefined;
    
    if (existingIndex >= 0) {
        jobs[existingIndex] = {
            ...jobs[existingIndex],
            reminderAt,
            reminderEnabled
        };
    } else {
        jobs.push({ 
            ...job, 
            savedAt: new Date().toISOString(), 
            status: 'Interested',
            reminderAt,
            reminderEnabled
        });
    }
    localStorage.setItem(STORAGE_KEYS.SAVED_JOBS, JSON.stringify(jobs));
};

export const updateJobStatus = (applyUrl: string, status: JobStatus) => {
    const jobs = getSavedJobs();
    const index = jobs.findIndex(j => j.applyUrl === applyUrl);
    if (index >= 0) {
        jobs[index].status = status;
        localStorage.setItem(STORAGE_KEYS.SAVED_JOBS, JSON.stringify(jobs));
    }
};

export const deleteSavedJob = (applyUrl: string) => {
    const jobs = getSavedJobs().filter(j => j.applyUrl !== applyUrl);
    localStorage.setItem(STORAGE_KEYS.SAVED_JOBS, JSON.stringify(jobs));
};

export const clearAllSavedJobs = () => {
    localStorage.setItem(STORAGE_KEYS.SAVED_JOBS, JSON.stringify([]));
};

export const isJobSaved = (applyUrl: string): boolean => {
    return getSavedJobs().some(j => j.applyUrl === applyUrl);
};

// --- Recent Searches ---
export const getRecentSearches = (): RecentSearch[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    return stored ? JSON.parse(stored) : [];
};

export const saveRecentSearch = (search: Omit<RecentSearch, 'id' | 'timestamp'>) => {
    const searches = getRecentSearches();
    const newSearch: RecentSearch = {
        ...search,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString()
    };
    // Avoid duplicate keywords in recent history
    const filtered = searches.filter(s => s.keywords !== search.keywords || s.location !== search.location);
    const updated = [newSearch, ...filtered].slice(0, 10); // Keep last 10
    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
};

export const clearRecentSearches = () => {
    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify([]));
};

// --- Career Profile ---
export const getCareerProfile = (): CareerProfile | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.CAREER_PROFILE);
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch (e) {
        return null;
    }
};

export const saveCareerProfile = (profile: CareerProfile) => {
    localStorage.setItem(STORAGE_KEYS.CAREER_PROFILE, JSON.stringify(profile));
};

export const deleteCareerProfile = () => {
    localStorage.removeItem(STORAGE_KEYS.CAREER_PROFILE);
};

// --- User Profile ---
export const getUserProfile = (): UserProfile | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch (e) {
        return null;
    }
};

export const saveUserProfile = (profile: UserProfile) => {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
};

export const deleteUserProfile = () => {
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
};

// --- Hub Tasks ---
export const getHubTasks = (): HubTask[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.HUB_TASKS);
    return stored ? JSON.parse(stored) : [];
};

export const saveHubTask = (task: Omit<HubTask, 'id' | 'createdAt'>) => {
    const tasks = getHubTasks();
    const newTask: HubTask = {
        ...task,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    localStorage.setItem(STORAGE_KEYS.HUB_TASKS, JSON.stringify(tasks));
    return newTask;
};

export const updateHubTask = (id: string, updates: Partial<HubTask>) => {
    const tasks = getHubTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index >= 0) {
        tasks[index] = { ...tasks[index], ...updates };
        localStorage.setItem(STORAGE_KEYS.HUB_TASKS, JSON.stringify(tasks));
    }
};

export const deleteHubTask = (id: string) => {
    const tasks = getHubTasks().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.HUB_TASKS, JSON.stringify(tasks));
};

// --- Hub Reminders ---
export const getHubReminders = (): HubReminder[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.HUB_REMINDERS);
    return stored ? JSON.parse(stored) : [];
};

export const saveHubReminder = (reminder: Omit<HubReminder, 'id' | 'createdAt'>) => {
    const reminders = getHubReminders();
    const newReminder: HubReminder = {
        ...reminder,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
    };
    reminders.push(newReminder);
    localStorage.setItem(STORAGE_KEYS.HUB_REMINDERS, JSON.stringify(reminders));
    return newReminder;
};

export const updateHubReminder = (id: string, updates: Partial<HubReminder>) => {
    const reminders = getHubReminders();
    const index = reminders.findIndex(r => r.id === id);
    if (index >= 0) {
        reminders[index] = { ...reminders[index], ...updates };
        localStorage.setItem(STORAGE_KEYS.HUB_REMINDERS, JSON.stringify(reminders));
    }
};

export const deleteHubReminder = (id: string) => {
    const reminders = getHubReminders().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.HUB_REMINDERS, JSON.stringify(reminders));
};

// --- Budget Items ---
export const getBudgetItems = (): BudgetItem[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.BUDGET_ITEMS);
    return stored ? JSON.parse(stored) : [];
};

export const saveBudgetItem = (item: Omit<BudgetItem, 'id'>) => {
    const items = getBudgetItems();
    const newItem: BudgetItem = {
        ...item,
        id: Math.random().toString(36).substr(2, 9)
    };
    items.push(newItem);
    localStorage.setItem(STORAGE_KEYS.BUDGET_ITEMS, JSON.stringify(items));
    return newItem;
};

export const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    const items = getBudgetItems();
    const index = items.findIndex(i => i.id === id);
    if (index >= 0) {
        items[index] = { ...items[index], ...updates };
        localStorage.setItem(STORAGE_KEYS.BUDGET_ITEMS, JSON.stringify(items));
    }
};

export const deleteBudgetItem = (id: string) => {
    const items = getBudgetItems().filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.BUDGET_ITEMS, JSON.stringify(items));
};

export const clearBudgetItems = () => {
    localStorage.setItem(STORAGE_KEYS.BUDGET_ITEMS, JSON.stringify([]));
};

// --- Financial Assessments ---
export const getFinancialAssessments = (): FinancialAssessment[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.FINANCIAL_ASSESSMENTS);
    if (stored) {
        return JSON.parse(stored);
    }
    return [];
};

export const saveFinancialAssessment = (assessment: Omit<FinancialAssessment, 'id' | 'createdAt' | 'updatedAt'>): FinancialAssessment => {
    const assessments = getFinancialAssessments();
    const newAssessment: FinancialAssessment = {
        ...assessment,
        id: `fa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    assessments.push(newAssessment);
    localStorage.setItem(STORAGE_KEYS.FINANCIAL_ASSESSMENTS, JSON.stringify(assessments));
    return newAssessment;
};

export const updateFinancialAssessment = (id: string, updates: Partial<FinancialAssessment>) => {
    const assessments = getFinancialAssessments();
    const index = assessments.findIndex(a => a.id === id);
    if (index >= 0) {
        assessments[index] = { ...assessments[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.FINANCIAL_ASSESSMENTS, JSON.stringify(assessments));
    }
};

export const deleteFinancialAssessment = (id: string) => {
    const assessments = getFinancialAssessments().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.FINANCIAL_ASSESSMENTS, JSON.stringify(assessments));
};

export const getFinancialAssessment = (id: string): FinancialAssessment | null => {
    const assessments = getFinancialAssessments();
    return assessments.find(a => a.id === id) || null;
};

// --- Financial Plans ---
export const getFinancialPlans = (): FinancialPlan[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.FINANCIAL_PLANS);
    if (stored) {
        return JSON.parse(stored);
    }
    return [];
};

export const getFinancialPlanByAssessment = (assessmentId: string): FinancialPlan | null => {
    const plans = getFinancialPlans();
    return plans.find(p => p.assessmentId === assessmentId) || null;
};

export const saveFinancialPlan = (plan: Omit<FinancialPlan, 'id' | 'createdAt' | 'updatedAt'>): FinancialPlan => {
    const plans = getFinancialPlans();
    const existingIndex = plans.findIndex(p => p.assessmentId === plan.assessmentId);
    
    const newPlan: FinancialPlan = {
        ...plan,
        id: existingIndex >= 0 ? plans[existingIndex].id : `fp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: existingIndex >= 0 ? plans[existingIndex].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
        plans[existingIndex] = newPlan;
    } else {
        plans.push(newPlan);
    }
    
    localStorage.setItem(STORAGE_KEYS.FINANCIAL_PLANS, JSON.stringify(plans));
    return newPlan;
};

export const updateFinancialPlan = (id: string, updates: Partial<FinancialPlan>) => {
    const plans = getFinancialPlans();
    const index = plans.findIndex(p => p.id === id);
    if (index >= 0) {
        plans[index] = { ...plans[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.FINANCIAL_PLANS, JSON.stringify(plans));
    }
};

export const deleteFinancialPlan = (id: string) => {
    const plans = getFinancialPlans().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.FINANCIAL_PLANS, JSON.stringify(plans));
};

// --- DreamShift Assessments ---
export const getDreamShiftAssessments = (): DreamShiftAssessment[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.DREAMSHIFT_ASSESSMENTS);
    if (stored) {
        return JSON.parse(stored);
    }
    return [];
};

export const getDreamShiftAssessment = (id: string): DreamShiftAssessment | null => {
    const assessments = getDreamShiftAssessments();
    return assessments.find(a => a.id === id) || null;
};

export const getLatestDreamShiftAssessment = (): DreamShiftAssessment | null => {
    const assessments = getDreamShiftAssessments();
    if (assessments.length === 0) return null;
    return assessments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
};

export const saveDreamShiftAssessment = (assessment: Omit<DreamShiftAssessment, 'id' | 'createdAt' | 'updatedAt'>): DreamShiftAssessment => {
    const assessments = getDreamShiftAssessments();
    const newAssessment: DreamShiftAssessment = {
        ...assessment,
        id: `ds_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    assessments.push(newAssessment);
    localStorage.setItem(STORAGE_KEYS.DREAMSHIFT_ASSESSMENTS, JSON.stringify(assessments));
    return newAssessment;
};

export const updateDreamShiftAssessment = (id: string, updates: Partial<DreamShiftAssessment>) => {
    const assessments = getDreamShiftAssessments();
    const index = assessments.findIndex(a => a.id === id);
    if (index >= 0) {
        assessments[index] = { ...assessments[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.DREAMSHIFT_ASSESSMENTS, JSON.stringify(assessments));
    }
};

export const deleteDreamShiftAssessment = (id: string) => {
    const assessments = getDreamShiftAssessments().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.DREAMSHIFT_ASSESSMENTS, JSON.stringify(assessments));
};

// --- Business Profiles ---
export const getBusinessProfiles = (): BusinessProfile[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.BUSINESS_PROFILES);
    if (stored) {
        return JSON.parse(stored);
    }
    return [];
};

export const getBusinessProfile = (id: string): BusinessProfile | null => {
    const profiles = getBusinessProfiles();
    return profiles.find(p => p.id === id) || null;
};

export const saveBusinessProfile = (profile: Omit<BusinessProfile, 'id' | 'createdAt' | 'updatedAt'>): BusinessProfile => {
    const profiles = getBusinessProfiles();
    const newProfile: BusinessProfile = {
        ...profile,
        id: `bp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    profiles.push(newProfile);
    localStorage.setItem(STORAGE_KEYS.BUSINESS_PROFILES, JSON.stringify(profiles));
    return newProfile;
};

export const updateBusinessProfile = (id: string, updates: Partial<BusinessProfile>) => {
    const profiles = getBusinessProfiles();
    const index = profiles.findIndex(p => p.id === id);
    if (index >= 0) {
        profiles[index] = { ...profiles[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.BUSINESS_PROFILES, JSON.stringify(profiles));
    }
};

export const deleteBusinessProfile = (id: string) => {
    const profiles = getBusinessProfiles().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.BUSINESS_PROFILES, JSON.stringify(profiles));
};
