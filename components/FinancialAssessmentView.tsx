import React, { useState, useEffect } from 'react';
import { FinancialAssessment, AppView, FinancialPlan, FinancialPlanTask, ResourceCategory, TaskPhase, TaskStatus } from '../types';
import { saveFinancialAssessment, updateFinancialAssessment, getFinancialPlanByAssessment, saveFinancialPlan, updateFinancialPlan, getFinancialAssessment } from '../services/storageService';

interface FinancialAssessmentViewProps {
  onNavigate: (view: AppView) => void;
  onSave?: () => void;
}

export const FinancialAssessmentView: React.FC<FinancialAssessmentViewProps> = ({ onNavigate, onSave }) => {
  const [assessmentAnswers, setAssessmentAnswers] = useState({
    employmentStatus: '',
    primaryPressure: [] as string[],
    vehicleAccess: '',
    hasLicense: '',
    canTravel: '',
    skills: [] as string[],
    sellingComfort: '',
    sellableItems: [] as string[],
    hoursPerWeek: '',
    urgency: '',
    educationLevel: '',
    internetAccess: '',
    childcareNeeds: '',
    healthLimitations: '',
    previousExperience: [] as string[]
  });

  const [financialAssessment, setFinancialAssessment] = useState<FinancialAssessment | null>(null);
  const [financialPlan, setFinancialPlan] = useState<FinancialPlan | null>(null);
  const [showFinancialTips, setShowFinancialTips] = useState(false);
  const [showFinancialResources, setShowFinancialResources] = useState(false);
  const [expandedFinancialSection, setExpandedFinancialSection] = useState<string | null>(null);
  const [expandedPlanPhase, setExpandedPlanPhase] = useState<{ [key: string]: boolean }>({ immediate: true, '30d': true, '60d': true });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskNotes, setEditingTaskNotes] = useState<string>('');
  const [editingTaskDueDate, setEditingTaskDueDate] = useState<string>('');
  const [showPhaseSelector, setShowPhaseSelector] = useState<{ resource: any; category: ResourceCategory } | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<TaskPhase>('immediate');

  // Specific resource mappings
  const getSpecificResources = (answers: typeof assessmentAnswers, mobilityScore: string) => {
    const resources: any = {
      assistance: [],
      unemployment: [],
      monetization: [],
      money: []
    };

    // Assistance - specific resources
    if (answers.primaryPressure.includes('Rent / housing')) {
      resources.assistance.push({ title: 'Emergency Rental Assistance', category: 'Housing', link: 'https://www.consumerfinance.gov/renthelp' });
      resources.assistance.push({ title: '211.org', category: 'Housing Support', link: 'https://www.211.org/' });
      resources.assistance.push({ title: 'Benefits.gov', category: 'Government Portal', link: 'https://www.benefits.gov/' });
    }
    if (answers.primaryPressure.includes('Food')) {
      resources.assistance.push({ title: 'SNAP (Food Stamps)', category: 'Food Assistance', link: 'https://www.fns.usda.gov/snap/' });
      resources.assistance.push({ title: 'Feeding America', category: 'Food Bank', link: 'https://www.feedingamerica.org/find-your-local-foodbank' });
    }
    if (answers.primaryPressure.includes('Utilities')) {
      resources.assistance.push({ title: 'LIHEAP Energy Assistance', category: 'Utility Help', link: 'https://www.benefits.gov/benefit/623' });
    }
    if (answers.primaryPressure.includes('Medical')) {
      resources.assistance.push({ title: 'Medicaid & CHIP', category: 'Healthcare', link: 'https://www.medicaid.gov/' });
      resources.assistance.push({ title: 'HealthCare.gov', category: 'Insurance Marketplace', link: 'https://www.healthcare.gov/' });
      resources.assistance.push({ title: 'Free Clinic Finder', category: 'Free Clinics', link: 'https://findahealthcenter.hrsa.gov/' });
    }
    if (answers.internetAccess === 'No' || answers.internetAccess === 'Yes, but limited') {
      resources.assistance.push({ title: 'Lifeline Program', category: 'Internet/Phone', link: 'https://www.lifelinesupport.org/' });
      resources.assistance.push({ title: 'ACP (Affordable Connectivity Program)', category: 'Internet', link: 'https://www.affordableconnectivity.gov/' });
    }

    // Unemployment - specific resources
    if (answers.employmentStatus === 'Recently laid off' || answers.employmentStatus === 'Unemployed (3+ months)') {
      resources.unemployment.push({ title: 'State Unemployment Benefits', category: 'Benefits', link: 'app-unemployment' });
      resources.unemployment.push({ title: 'Resume Builder', category: 'Job Prep', link: 'app-resume' });
      resources.unemployment.push({ title: 'Job Hunter', category: 'Job Search', link: 'app-jobs' });
      resources.unemployment.push({ title: 'Severance Pay Guide', category: 'Severance', link: 'app-unemployment' });
    }

    // Monetization - specific resources based on skills
    if (answers.skills.some(s => s.includes('Creative') || s.includes('Design'))) {
      resources.monetization.push({ title: 'Shutterstock', category: 'Stock Photos', link: 'https://www.shutterstock.com/' });
      resources.monetization.push({ title: '99designs', category: 'Design Work', link: 'https://99designs.com/' });
      resources.monetization.push({ title: 'Canva', category: 'Design Tools', link: 'https://www.canva.com/' });
      resources.monetization.push({ title: 'Etsy', category: 'Creative Sales', link: 'https://www.etsy.com/' });
    }
    if (answers.skills.some(s => s.includes('Writing') || s.includes('Content'))) {
      resources.monetization.push({ title: 'Upwork', category: 'Freelance Writing', link: 'https://www.upwork.com/' });
      resources.monetization.push({ title: 'Fiverr', category: 'Content Services', link: 'https://www.fiverr.com/' });
      resources.monetization.push({ title: 'Medium', category: 'Writing Platform', link: 'https://medium.com/' });
      resources.monetization.push({ title: 'Substack', category: 'Newsletter Platform', link: 'https://substack.com/' });
    }
    if (answers.skills.some(s => s.includes('Tech'))) {
      resources.monetization.push({ title: 'Toptal', category: 'Elite Tech Work', link: 'https://www.toptal.com/' });
      resources.monetization.push({ title: 'GitHub Jobs', category: 'Tech Jobs', link: 'https://jobs.github.com/' });
      resources.monetization.push({ title: 'Contra', category: 'Tech Freelance', link: 'https://contra.com/' });
    }
    if (answers.sellingComfort !== 'No') {
      resources.monetization.push({ title: 'TaskRabbit', category: 'Service Sales', link: 'https://www.taskrabbit.com/' });
      resources.monetization.push({ title: 'Thumbtack', category: 'Local Services', link: 'https://www.thumbtack.com/' });
    }

    // Money/Gigs - specific resources
    if (mobilityScore === 'High' || answers.vehicleAccess === 'Yes, reliable') {
      resources.money.push({ title: 'DoorDash', category: 'Food Delivery', link: 'https://www.doordash.com/' });
      resources.money.push({ title: 'Uber', category: 'Rideshare', link: 'https://www.uber.com/' });
      resources.money.push({ title: 'Instacart', category: 'Grocery Delivery', link: 'https://www.instacart.com/' });
      resources.money.push({ title: 'Lyft', category: 'Rideshare', link: 'https://www.lyft.com/' });
    }
    if (answers.internetAccess === 'Yes, reliable') {
      resources.money.push({ title: 'Remote.co', category: 'Remote Jobs', link: 'https://remote.co/' });
      resources.money.push({ title: 'FlexJobs', category: 'Remote Work', link: 'https://www.flexjobs.com/' });
      resources.money.push({ title: 'Amazon MTurk', category: 'Online Tasks', link: 'https://www.mturk.com/' });
    }
    if (answers.sellableItems.length > 0 && !answers.sellableItems.includes('No')) {
      resources.money.push({ title: 'Facebook Marketplace', category: 'Selling', link: 'https://www.facebook.com/marketplace/' });
      resources.money.push({ title: 'eBay', category: 'Online Selling', link: 'https://www.ebay.com/' });
      resources.money.push({ title: 'Poshmark', category: 'Clothing Sales', link: 'https://poshmark.com/' });
      resources.money.push({ title: 'Mercari', category: 'Selling Platform', link: 'https://www.mercari.com/' });
    }
    if (answers.previousExperience.includes('Food service')) {
      resources.money.push({ title: 'Caviar', category: 'Food Delivery', link: 'https://www.trycaviar.com/' });
      resources.money.push({ title: 'Postmates', category: 'Delivery', link: 'https://postmates.com/' });
    }

    return resources;
  };

  // Load plan when assessment loads
  useEffect(() => {
    if (financialAssessment?.id) {
      const plan = getFinancialPlanByAssessment(financialAssessment.id);
      if (plan) {
        setFinancialPlan(plan);
        // Check if lock expired
        if (plan.lockedUntil && new Date(plan.lockedUntil) < new Date()) {
          updateFinancialPlan(plan.id, { lockedUntil: null });
          setFinancialPlan({ ...plan, lockedUntil: null });
        }
      } else {
        // Initialize plan if it doesn't exist
        const newPlan = saveFinancialPlan({
          assessmentId: financialAssessment.id,
          userId: undefined,
          lockedUntil: null,
          selectedResources: [],
          savedResources: [],
          dismissedResources: []
        });
        setFinancialPlan(newPlan);
      }
    }
  }, [financialAssessment?.id]);

  // Load assessment from sessionStorage if editing
  useEffect(() => {
    const editAssessmentId = sessionStorage.getItem('editAssessmentId');
    if (editAssessmentId && !financialAssessment) {
      const assessment = getFinancialAssessment(editAssessmentId);
      if (assessment) {
        setFinancialAssessment(assessment);
        setAssessmentAnswers(assessment.answers);
      }
      sessionStorage.removeItem('editAssessmentId');
    }
  }, [financialAssessment]);

  // Helper: Generate resource ID
  const getResourceId = (title: string, category: ResourceCategory): string => {
    return `${category}_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  };

  // Helper: Determine suggested phase for resource (used as default)
  const getResourcePhase = (category: ResourceCategory, assessment: FinancialAssessment): TaskPhase => {
    // Assistance resources: immediate if urgent, otherwise 30d
    if (category === 'assistance') {
      if (assessment.stabilityLevel === 'Immediate Action Needed') return 'immediate';
      if (assessment.answers.primaryPressure.includes('Rent / housing') || 
          assessment.answers.primaryPressure.includes('Food') ||
          assessment.answers.primaryPressure.includes('Utilities')) {
        return 'immediate';
      }
      return '30d';
    }
    // Money/Gigs: usually immediate for quick income
    if (category === 'money') {
      return 'immediate';
    }
    // Monetization: depends on income flexibility and urgency
    if (category === 'monetization') {
      if (assessment.stabilityLevel === 'Immediate Action Needed' && assessment.incomeFlexibility === 'High') {
        return '30d'; // Can start quickly
      }
      if (assessment.incomeFlexibility === 'Low') {
        return '60d'; // Needs more time to build
      }
      return '30d';
    }
    // Unemployment: usually 30d for job search activities
    if (category === 'unemployment') {
      return '30d';
    }
    return '30d';
  };

  // Helper: Generate "why" explanation
  const generateWhyExplanation = (resource: any, category: ResourceCategory, assessment: FinancialAssessment): string => {
    const reasons: string[] = [];
    
    if (assessment.stabilityLevel === 'Immediate Action Needed') {
      reasons.push('Your urgent situation requires quick relief');
    }
    if (assessment.incomeFlexibility === 'Low') {
      reasons.push('You need faster, predictable income options');
    }
    if (assessment.mobilityScore === 'High' && category === 'money') {
      reasons.push('Your reliable transportation enables delivery and rideshare work');
    }
    if (assessment.primaryConstraint === 'Time' && category === 'assistance') {
      reasons.push('Low-setup assistance programs fit your time constraints');
    }
    if (category === 'assistance' && assessment.answers.primaryPressure.includes('Rent / housing') && resource.title.includes('Rental')) {
      reasons.push('You identified housing as a primary financial pressure');
    }
    if (category === 'assistance' && assessment.answers.primaryPressure.includes('Food') && resource.title.includes('SNAP')) {
      reasons.push('You identified food as a primary financial pressure');
    }
    
    return reasons.length > 0 ? reasons.join('. ') + '.' : 'This resource matches your assessment profile.';
  };

  // Helper: Get default due days for phase
  const getDefaultDueDays = (phase: TaskPhase): number => {
    if (phase === 'immediate') return 2;
    if (phase === '30d') return 14;
    return 45;
  };

  // Add resource to plan with phase selection
  const handleAddToPlan = (resource: any, category: ResourceCategory) => {
    if (!financialAssessment || !financialPlan) return;
    
    // Show phase selector
    const suggestedPhase = getResourcePhase(category, financialAssessment);
    setSelectedPhase(suggestedPhase);
    setShowPhaseSelector({ resource, category });
  };

  // Confirm adding resource to plan with selected phase
  const handleConfirmAddToPlan = () => {
    if (!showPhaseSelector || !financialAssessment || !financialPlan) return;
    
    const { resource, category } = showPhaseSelector;
    const resourceId = getResourceId(resource.title, category);
    const phase = selectedPhase;
    const why = generateWhyExplanation(resource, category, financialAssessment);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + getDefaultDueDays(phase));
    
    const existingTask = financialPlan.selectedResources.find(t => t.resourceId === resourceId);
    if (existingTask) {
      setShowPhaseSelector(null);
      return; // Already added
    }
    
    const newTask: FinancialPlanTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      resourceId,
      resourceTitle: resource.title,
      resourceCategory: category,
      resourceLink: resource.link,
      status: 'not_started',
      dueBy: dueDate.toISOString().split('T')[0],
      phase,
      order: financialPlan.selectedResources.filter(t => t.phase === phase).length,
      why,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Remove from saved if it was there
    const updatedSaved = financialPlan.savedResources.filter(r => r.resourceId !== resourceId);
    
    const updatedPlan = {
      ...financialPlan,
      selectedResources: [...financialPlan.selectedResources, newTask],
      savedResources: updatedSaved
    };
    
    saveFinancialPlan(updatedPlan);
    setFinancialPlan(updatedPlan);
    setShowPhaseSelector(null);
  };

  // Save resource for later
  const handleSaveForLater = (resource: any, category: ResourceCategory) => {
    if (!financialPlan) return;
    
    const resourceId = getResourceId(resource.title, category);
    const existing = financialPlan.savedResources.find(r => r.resourceId === resourceId);
    if (existing) return;
    
    const updatedPlan = {
      ...financialPlan,
      savedResources: [...financialPlan.savedResources, {
        resourceId,
        resourceTitle: resource.title,
        resourceCategory: category,
        resourceLink: resource.link,
        savedAt: new Date().toISOString()
      }]
    };
    
    saveFinancialPlan(updatedPlan);
    setFinancialPlan(updatedPlan);
  };

  // Dismiss resource
  const handleDismissResource = (resource: any, category: ResourceCategory) => {
    if (!financialPlan) return;
    
    const resourceId = getResourceId(resource.title, category);
    const updatedPlan = {
      ...financialPlan,
      dismissedResources: [...financialPlan.dismissedResources, {
        resourceId,
        dismissedAt: new Date().toISOString()
      }]
    };
    
    saveFinancialPlan(updatedPlan);
    setFinancialPlan(updatedPlan);
  };

  // Check if resource is in plan
  const isResourceInPlan = (resource: any, category: ResourceCategory): boolean => {
    if (!financialPlan) return false;
    const resourceId = getResourceId(resource.title, category);
    return financialPlan.selectedResources.some(t => t.resourceId === resourceId);
  };

  // Check if resource is saved
  const isResourceSaved = (resource: any, category: ResourceCategory): boolean => {
    if (!financialPlan) return false;
    const resourceId = getResourceId(resource.title, category);
    return financialPlan.savedResources.some(r => r.resourceId === resourceId);
  };

  // Check if resource is dismissed
  const isResourceDismissed = (resource: any, category: ResourceCategory): boolean => {
    if (!financialPlan) return false;
    const resourceId = getResourceId(resource.title, category);
    return financialPlan.dismissedResources.some(r => r.resourceId === resourceId);
  };

  // Update task status
  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    if (!financialPlan) return;
    
    const updatedTasks = financialPlan.selectedResources.map(t =>
      t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t
    );
    
    const updatedPlan = { ...financialPlan, selectedResources: updatedTasks };
    saveFinancialPlan(updatedPlan);
    setFinancialPlan(updatedPlan);
  };

  // Remove task
  const handleRemoveTask = (taskId: string) => {
    if (!financialPlan || financialPlan.lockedUntil) return;
    
    const updatedTasks = financialPlan.selectedResources.filter(t => t.id !== taskId);
    const updatedPlan = { ...financialPlan, selectedResources: updatedTasks };
    saveFinancialPlan(updatedPlan);
    setFinancialPlan(updatedPlan);
  };

  // Update task due date
  const handleUpdateTaskDueDate = (taskId: string, dueDate: string) => {
    if (!financialPlan || financialPlan.lockedUntil) return;
    
    const updatedTasks = financialPlan.selectedResources.map(t =>
      t.id === taskId ? { ...t, dueBy: dueDate, updatedAt: new Date().toISOString() } : t
    );
    
    const updatedPlan = { ...financialPlan, selectedResources: updatedTasks };
    saveFinancialPlan(updatedPlan);
    setFinancialPlan(updatedPlan);
  };

  // Update task notes
  const handleUpdateTaskNotes = (taskId: string, notes: string) => {
    if (!financialPlan || financialPlan.lockedUntil) return;
    
    const updatedTasks = financialPlan.selectedResources.map(t =>
      t.id === taskId ? { ...t, notes, updatedAt: new Date().toISOString() } : t
    );
    
    const updatedPlan = { ...financialPlan, selectedResources: updatedTasks };
    saveFinancialPlan(updatedPlan);
    setFinancialPlan(updatedPlan);
  };

  // Reorder task
  const handleReorderTask = (taskId: string, direction: 'up' | 'down') => {
    if (!financialPlan || financialPlan.lockedUntil) return;
    
    const task = financialPlan.selectedResources.find(t => t.id === taskId);
    if (!task) return;
    
    const phaseTasks = financialPlan.selectedResources
      .filter(t => t.phase === task.phase)
      .sort((a, b) => a.order - b.order);
    
    const currentIndex = phaseTasks.findIndex(t => t.id === taskId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= phaseTasks.length) return;
    
    const swappedTask = phaseTasks[newIndex];
    const updatedTasks = financialPlan.selectedResources.map(t => {
      if (t.id === taskId) return { ...t, order: swappedTask.order };
      if (t.id === swappedTask.id) return { ...t, order: task.order };
      return t;
    });
    
    const updatedPlan = { ...financialPlan, selectedResources: updatedTasks };
    saveFinancialPlan(updatedPlan);
    setFinancialPlan(updatedPlan);
  };

  // Lock plan
  const handleLockPlan = () => {
    if (!financialPlan) return;
    
    const lockDate = new Date();
    lockDate.setDate(lockDate.getDate() + 7);
    
    const updatedPlan = { ...financialPlan, lockedUntil: lockDate.toISOString() };
    saveFinancialPlan(updatedPlan);
    setFinancialPlan(updatedPlan);
  };

  // Calculate progress
  const calculateProgress = () => {
    if (!financialPlan || financialPlan.selectedResources.length === 0) {
      return { completed: 0, total: 0, percentage: 0, status: 'At Risk' };
    }
    
    const completed = financialPlan.selectedResources.filter(t => t.status === 'done').length;
    const total = financialPlan.selectedResources.length;
    const percentage = Math.round((completed / total) * 100);
    
    let status = 'At Risk';
    if (percentage >= 71) status = 'Improving';
    else if (percentage >= 26) status = 'Stabilizing';
    
    return { completed, total, percentage, status };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate assessment results
    const mobilityScore = (assessmentAnswers.vehicleAccess === 'Yes, reliable' && assessmentAnswers.hasLicense === 'Yes' && assessmentAnswers.canTravel === 'Yes') ? 'High' :
      (assessmentAnswers.vehicleAccess === 'Yes, but unreliable' || assessmentAnswers.canTravel === 'Limited') ? 'Medium' : 'Low';
    
    const incomeFlexibility = assessmentAnswers.hoursPerWeek === '40+' ? 'High' :
      assessmentAnswers.hoursPerWeek === '20-40' ? 'Medium' : 'Low';
    
    let stabilityLevel: 'Stable' | 'Watch Closely' | 'Immediate Action Needed' = 'Stable';
    if (assessmentAnswers.urgency === 'Critical (<30 days)') stabilityLevel = 'Immediate Action Needed';
    else if (assessmentAnswers.urgency === 'Tight (1–2 months)') stabilityLevel = 'Watch Closely';
    
    let primaryConstraint = 'Time';
    if (assessmentAnswers.vehicleAccess === 'No' || assessmentAnswers.canTravel === 'No') primaryConstraint = 'Transportation';
    else if (assessmentAnswers.hoursPerWeek === '<10') primaryConstraint = 'Time';
    else if (assessmentAnswers.urgency === 'Critical (<30 days)') primaryConstraint = 'Urgency';
    else primaryConstraint = 'Skills';
    
    let insight = '';
    if (primaryConstraint === 'Transportation') {
      insight = "Your biggest limiter right now isn't skill — it's transportation.";
    } else if (primaryConstraint === 'Time') {
      insight = "You have income potential, but time and urgency are working against you.";
    } else if (primaryConstraint === 'Urgency') {
      insight = "Your situation requires immediate action. Focus on fastest income paths first.";
    } else {
      insight = "You have flexibility. Focus on matching your skills to reliable income sources.";
    }
    
    const suggestedResources = getSpecificResources(assessmentAnswers, mobilityScore);
    
    const financialPlan = {
      next7Days: [
        `Apply to ${mobilityScore === 'High' ? '2-3 delivery/gig opportunities' : '3-5 remote or local walkable opportunities'}`,
        `Complete setup for ${assessmentAnswers.sellableItems.length > 0 && assessmentAnswers.sellableItems[0] !== 'No' ? 'selling items' : 'one income path'}`,
        'Review and organize your skills for quick application'
      ],
      next30Days: [
        'Establish at least one consistent income source',
        `Reduce primary financial pressure: ${assessmentAnswers.primaryPressure.join(', ') || 'None specified'}`,
        'Build a routine around your income generation'
      ],
      next60to90Days: [
        'Improve income reliability and consistency',
        'Transition toward better-fit work if applicable',
        'Build multiple income streams if time allows'
      ]
    };
    
    const assessment: FinancialAssessment = {
      id: '',
      stabilityLevel,
      mobilityScore: mobilityScore as 'High' | 'Medium' | 'Low',
      incomeFlexibility: incomeFlexibility as 'High' | 'Medium' | 'Low',
      primaryConstraint,
      insight,
      answers: assessmentAnswers,
      suggestedResources,
      financialPlan,
      createdAt: '',
      updatedAt: ''
    };

    const saved = saveFinancialAssessment(assessment);
    setFinancialAssessment(saved);
    
    // Initialize or load plan
    const existingPlan = getFinancialPlanByAssessment(saved.id);
    if (!existingPlan) {
      const newPlan = saveFinancialPlan({
        assessmentId: saved.id,
        userId: undefined,
        lockedUntil: null,
        selectedResources: [],
        savedResources: [],
        dismissedResources: []
      });
      setFinancialPlan(newPlan);
    } else {
      setFinancialPlan(existingPlan);
      // Check if lock expired
      if (existingPlan.lockedUntil && new Date(existingPlan.lockedUntil) < new Date()) {
        const unlocked = { ...existingPlan, lockedUntil: null };
        updateFinancialPlan(existingPlan.id, { lockedUntil: null });
        setFinancialPlan(unlocked);
      }
    }
    
    if (onSave) onSave();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate(AppView.COACH)}
            className="mb-4 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold flex items-center gap-2"
          >
            ← Back to AI Coach
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-2xl shadow-lg">
              💰
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white">Financial Stability Assessment</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">15 questions • 5 minutes</p>
            </div>
          </div>
        </div>

        {!financialAssessment ? (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md space-y-8">
            {/* Questions - same as before but in separate view */}
            {/* A. Current Financial Status */}
            <div className="space-y-4">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">A. Current Financial Status</h4>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">1. Current employment status:</label>
                <select
                  value={assessmentAnswers.employmentStatus}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, employmentStatus: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Employed">Employed</option>
                  <option value="Recently laid off">Recently laid off</option>
                  <option value="Unemployed (3+ months)">Unemployed (3+ months)</option>
                  <option value="Gig / contract only">Gig / contract only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">2. Primary financial pressures right now: (select all that apply)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Rent / housing', 'Utilities', 'Food', 'Transportation', 'Debt', 'Medical', 'Childcare', 'Insurance'].map(pressure => (
                    <label key={pressure} className="flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-emerald-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={assessmentAnswers.primaryPressure.includes(pressure)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssessmentAnswers({...assessmentAnswers, primaryPressure: [...assessmentAnswers.primaryPressure, pressure]});
                          } else {
                            setAssessmentAnswers({...assessmentAnswers, primaryPressure: assessmentAnswers.primaryPressure.filter(p => p !== pressure)});
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{pressure}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* B. Transportation & Mobility */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">B. Transportation & Mobility</h4>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">3. Do you currently have access to a working vehicle?</label>
                <select
                  value={assessmentAnswers.vehicleAccess}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, vehicleAccess: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Yes, reliable">Yes, reliable</option>
                  <option value="Yes, but unreliable">Yes, but unreliable</option>
                  <option value="No">No</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">4. Do you have a valid driver's license?</label>
                <select
                  value={assessmentAnswers.hasLicense}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, hasLicense: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">5. Are you able to travel locally for work?</label>
                <select
                  value={assessmentAnswers.canTravel}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, canTravel: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="Limited">Limited</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            {/* C. Skills & Income Capacity */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">C. Skills & Income Capacity</h4>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">6. What are you best at? (select up to 3)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Customer service', 'Writing / content', 'Design / creative', 'Tech / troubleshooting', 'Organization / admin', 'Physical labor', 'Sales / persuasion', 'Teaching / explaining'].map(skill => (
                    <label key={skill} className="flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-emerald-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={assessmentAnswers.skills.includes(skill)}
                        onChange={(e) => {
                          if (e.target.checked && assessmentAnswers.skills.length < 3) {
                            setAssessmentAnswers({...assessmentAnswers, skills: [...assessmentAnswers.skills, skill]});
                          } else if (!e.target.checked) {
                            setAssessmentAnswers({...assessmentAnswers, skills: assessmentAnswers.skills.filter(s => s !== skill)});
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">7. Are you comfortable selling things or services?</label>
                <select
                  value={assessmentAnswers.sellingComfort}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, sellingComfort: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Yes, confidently">Yes, confidently</option>
                  <option value="Somewhat">Somewhat</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            {/* D. Assets & Flexibility */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">D. Assets & Flexibility</h4>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">8. Do you have items you could realistically sell?</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {['Electronics', 'Furniture', 'Clothing', 'Creative work', 'No'].map(item => (
                    <label key={item} className="flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-emerald-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={assessmentAnswers.sellableItems.includes(item)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssessmentAnswers({...assessmentAnswers, sellableItems: [...assessmentAnswers.sellableItems, item]});
                          } else {
                            setAssessmentAnswers({...assessmentAnswers, sellableItems: assessmentAnswers.sellableItems.filter(i => i !== item)});
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">9. How many hours per week can you realistically dedicate to income generation?</label>
                <select
                  value={assessmentAnswers.hoursPerWeek}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, hoursPerWeek: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  <option value="">Select...</option>
                  <option value="<10">&lt;10</option>
                  <option value="10–20">10–20</option>
                  <option value="20–40">20–40</option>
                  <option value="40+">40+</option>
                </select>
              </div>
            </div>

            {/* E. Risk & Urgency */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">E. Risk & Urgency</h4>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">10. How urgent is your financial situation?</label>
                <select
                  value={assessmentAnswers.urgency}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, urgency: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Stable (2+ months runway)">Stable (2+ months runway)</option>
                  <option value="Tight (1–2 months)">Tight (1–2 months)</option>
                  <option value="Critical (<30 days)">Critical (&lt;30 days)</option>
                </select>
              </div>
            </div>

            {/* F. Education & Access */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">F. Education & Access</h4>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">11. What is your highest level of education?</label>
                <select
                  value={assessmentAnswers.educationLevel}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, educationLevel: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  <option value="">Select...</option>
                  <option value="High school or less">High school or less</option>
                  <option value="Some college">Some college</option>
                  <option value="Associate's degree">Associate's degree</option>
                  <option value="Bachelor's degree">Bachelor's degree</option>
                  <option value="Master's degree or higher">Master's degree or higher</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">12. Do you have reliable internet access at home?</label>
                <select
                  value={assessmentAnswers.internetAccess}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, internetAccess: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Yes, reliable">Yes, reliable</option>
                  <option value="Yes, but limited">Yes, but limited</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            {/* G. Personal Constraints */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">G. Personal Constraints</h4>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">13. Do you have childcare needs that affect your work availability?</label>
                <select
                  value={assessmentAnswers.childcareNeeds}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, childcareNeeds: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  <option value="">Select...</option>
                  <option value="No childcare needs">No childcare needs</option>
                  <option value="Some childcare needs">Some childcare needs</option>
                  <option value="Significant childcare needs">Significant childcare needs</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">14. Do you have any health or physical limitations that affect work options?</label>
                <select
                  value={assessmentAnswers.healthLimitations}
                  onChange={(e) => setAssessmentAnswers({...assessmentAnswers, healthLimitations: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  <option value="">Select...</option>
                  <option value="No limitations">No limitations</option>
                  <option value="Some limitations">Some limitations</option>
                  <option value="Significant limitations">Significant limitations</option>
                </select>
              </div>
            </div>

            {/* H. Experience & Background */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">H. Experience & Background</h4>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">15. What types of work have you done before? (select all that apply)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Retail / Customer service', 'Office / Administrative', 'Food service', 'Delivery / Driving', 'Construction / Physical', 'Healthcare', 'Education / Teaching', 'Sales', 'Tech / IT', 'Creative / Design', 'Other'].map(exp => (
                    <label key={exp} className="flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-emerald-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={assessmentAnswers.previousExperience.includes(exp)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssessmentAnswers({...assessmentAnswers, previousExperience: [...assessmentAnswers.previousExperience, exp]});
                          } else {
                            setAssessmentAnswers({...assessmentAnswers, previousExperience: assessmentAnswers.previousExperience.filter(e => e !== exp)});
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{exp}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-xl font-black text-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
            >
              Complete Assessment
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4">
              <p className="text-sm font-black text-emerald-900 dark:text-emerald-300">✓ Assessment saved! View it anytime in your Hub.</p>
            </div>

            {/* Stability Snapshot */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Stability Snapshot</h3>
                <button
                  onClick={() => {
                    setFinancialAssessment(null);
                    setAssessmentAnswers({
                      employmentStatus: '',
                      primaryPressure: [],
                      vehicleAccess: '',
                      hasLicense: '',
                      canTravel: '',
                      skills: [],
                      sellingComfort: '',
                      sellableItems: [],
                      hoursPerWeek: '',
                      urgency: '',
                      educationLevel: '',
                      internetAccess: '',
                      childcareNeeds: '',
                      healthLimitations: '',
                      previousExperience: []
                    });
                  }}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Edit Assessment
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className={`p-4 rounded-xl border-2 ${
                  financialAssessment.stabilityLevel === 'Stable' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400' :
                  financialAssessment.stabilityLevel === 'Watch Closely' ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-400' :
                  'bg-red-50 dark:bg-red-900/30 border-red-400'
                }`}>
                  <p className="text-xs font-black text-slate-600 dark:text-slate-400 mb-1">Stability Level</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{financialAssessment.stabilityLevel}</p>
                </div>
                <div className={`p-4 rounded-xl border-2 ${
                  financialAssessment.mobilityScore === 'High' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400' :
                  financialAssessment.mobilityScore === 'Medium' ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-400' :
                  'bg-red-50 dark:bg-red-900/30 border-red-400'
                }`}>
                  <p className="text-xs font-black text-slate-600 dark:text-slate-400 mb-1">Mobility Score</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{financialAssessment.mobilityScore}</p>
                </div>
                <div className={`p-4 rounded-xl border-2 ${
                  financialAssessment.incomeFlexibility === 'High' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400' :
                  financialAssessment.incomeFlexibility === 'Medium' ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-400' :
                  'bg-red-50 dark:bg-red-900/30 border-red-400'
                }`}>
                  <p className="text-xs font-black text-slate-600 dark:text-slate-400 mb-1">Income Flexibility</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{financialAssessment.incomeFlexibility}</p>
                </div>
                <div className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                  <p className="text-xs font-black text-slate-600 dark:text-slate-400 mb-1">Primary Constraint</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{financialAssessment.primaryConstraint}</p>
                </div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border-l-4 border-emerald-500">
                <p className="text-sm font-black text-emerald-900 dark:text-emerald-300 mb-1">Insight:</p>
                <p className="text-sm text-emerald-800 dark:text-emerald-400 italic">{financialAssessment.insight}</p>
              </div>
            </div>

            {/* My Financial Action Plan */}
            {financialPlan && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">My Financial Action Plan</h3>
                    {financialPlan.lockedUntil && new Date(financialPlan.lockedUntil) > new Date() && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">🔒 Locked until {new Date(financialPlan.lockedUntil).toLocaleDateString()}</p>
                    )}
                    {financialPlan.lockedUntil && new Date(financialPlan.lockedUntil) <= new Date() && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">✓ Lock expired. Consider reassessing your situation.</p>
                    )}
                  </div>
                  {!financialPlan.lockedUntil && (
                    <button
                      onClick={handleLockPlan}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      🔒 Lock Plan for 7 Days
                    </button>
                  )}
                </div>

                {/* Progress Bar */}
                {(() => {
                  const progress = calculateProgress();
                  return (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {progress.completed} of {progress.total} tasks completed
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${
                          progress.status === 'Improving' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400' :
                          progress.status === 'Stabilizing' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400' :
                          'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400'
                        }`}>
                          {progress.status}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            progress.status === 'Improving' ? 'bg-emerald-600' :
                            progress.status === 'Stabilizing' ? 'bg-amber-600' :
                            'bg-red-600'
                          }`}
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Plan Tasks by Phase */}
                <div className="space-y-4">
                  {/* Immediate (0-7 days) */}
                  {(() => {
                    const immediateTasks = financialPlan.selectedResources
                      .filter(t => t.phase === 'immediate')
                      .sort((a, b) => a.order - b.order);
                    
                    return immediateTasks.length > 0 && (
                      <div className="border-2 border-emerald-200 dark:border-emerald-700 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedPlanPhase({ ...expandedPlanPhase, immediate: !expandedPlanPhase.immediate })}
                          className="w-full bg-emerald-50 dark:bg-emerald-900/30 p-4 flex items-center justify-between hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                        >
                          <h4 className="text-base font-black text-emerald-900 dark:text-emerald-300">Immediate (0–7 Days)</h4>
                          <span className="text-emerald-600 dark:text-emerald-400">{expandedPlanPhase.immediate ? '▼' : '▶'}</span>
                        </button>
                        {expandedPlanPhase.immediate && (
                          <div className="p-4 bg-white dark:bg-slate-800 space-y-3">
                            {immediateTasks.map((task) => (
                              <div key={task.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                <input
                                  type="checkbox"
                                  checked={task.status === 'done'}
                                  onChange={(e) => handleUpdateTaskStatus(task.id, e.target.checked ? 'done' : 'not_started')}
                                  className="mt-1 rounded"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{task.resourceTitle}</p>
                                    <select
                                      value={task.status}
                                      onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                                      className={`px-2 py-0.5 rounded text-xs font-bold border-0 ${
                                        task.status === 'done' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400' :
                                        task.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400' :
                                        'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                      }`}
                                    >
                                      <option value="not_started">Not Started</option>
                                      <option value="in_progress">In Progress</option>
                                      <option value="done">Done</option>
                                    </select>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 mb-2">
                                    <input
                                      type="date"
                                      value={task.dueBy}
                                      onChange={(e) => handleUpdateTaskDueDate(task.id, e.target.value)}
                                      disabled={!!financialPlan.lockedUntil}
                                      className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                    <button
                                      onClick={() => {
                                        if (editingTaskId === task.id) {
                                          handleUpdateTaskNotes(task.id, editingTaskNotes);
                                          setEditingTaskId(null);
                                        } else {
                                          setEditingTaskId(task.id);
                                          setEditingTaskNotes(task.notes || '');
                                        }
                                      }}
                                      className="text-emerald-600 dark:text-emerald-400 hover:underline"
                                    >
                                      {editingTaskId === task.id ? 'Save Notes' : 'Add Notes'}
                                    </button>
                                    <div className="relative group">
                                      <span className="text-blue-600 dark:text-blue-400 cursor-help">ℹ️ Why?</span>
                                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-lg">
                                        {task.why || 'This resource matches your assessment profile.'}
                                      </div>
                                    </div>
                                  </div>
                                  {editingTaskId === task.id && (
                                    <textarea
                                      value={editingTaskNotes}
                                      onChange={(e) => setEditingTaskNotes(e.target.value)}
                                      placeholder="Add notes..."
                                      className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                                      rows={2}
                                    />
                                  )}
                                  {task.notes && editingTaskId !== task.id && (
                                    <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1">{task.notes}</p>
                                  )}
                                </div>
                                {!financialPlan.lockedUntil && (
                                  <div className="flex flex-col gap-1">
                                    <button
                                      onClick={() => handleReorderTask(task.id, 'up')}
                                      className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
                                    >
                                      ↑
                                    </button>
                                    <button
                                      onClick={() => handleReorderTask(task.id, 'down')}
                                      className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
                                    >
                                      ↓
                                    </button>
                                    <button
                                      onClick={() => handleRemoveTask(task.id)}
                                      className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/60"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* 30-Day Stabilization */}
                  {(() => {
                    const tasks30d = financialPlan.selectedResources
                      .filter(t => t.phase === '30d')
                      .sort((a, b) => a.order - b.order);
                    
                    return tasks30d.length > 0 && (
                      <div className="border-2 border-teal-200 dark:border-teal-700 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedPlanPhase({ ...expandedPlanPhase, '30d': !expandedPlanPhase['30d'] })}
                          className="w-full bg-teal-50 dark:bg-teal-900/30 p-4 flex items-center justify-between hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors"
                        >
                          <h4 className="text-base font-black text-teal-900 dark:text-teal-300">30-Day Stabilization</h4>
                          <span className="text-teal-600 dark:text-teal-400">{expandedPlanPhase['30d'] ? '▼' : '▶'}</span>
                        </button>
                        {expandedPlanPhase['30d'] && (
                          <div className="p-4 bg-white dark:bg-slate-800 space-y-3">
                            {tasks30d.map((task) => (
                              <div key={task.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                <input
                                  type="checkbox"
                                  checked={task.status === 'done'}
                                  onChange={(e) => handleUpdateTaskStatus(task.id, e.target.checked ? 'done' : 'not_started')}
                                  className="mt-1 rounded"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{task.resourceTitle}</p>
                                    <select
                                      value={task.status}
                                      onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                                      className={`px-2 py-0.5 rounded text-xs font-bold border-0 ${
                                        task.status === 'done' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400' :
                                        task.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400' :
                                        'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                      }`}
                                    >
                                      <option value="not_started">Not Started</option>
                                      <option value="in_progress">In Progress</option>
                                      <option value="done">Done</option>
                                    </select>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 mb-2">
                                    <input
                                      type="date"
                                      value={task.dueBy}
                                      onChange={(e) => handleUpdateTaskDueDate(task.id, e.target.value)}
                                      disabled={!!financialPlan.lockedUntil}
                                      className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                    <button
                                      onClick={() => {
                                        if (editingTaskId === task.id) {
                                          handleUpdateTaskNotes(task.id, editingTaskNotes);
                                          setEditingTaskId(null);
                                        } else {
                                          setEditingTaskId(task.id);
                                          setEditingTaskNotes(task.notes || '');
                                        }
                                      }}
                                      className="text-teal-600 dark:text-teal-400 hover:underline"
                                    >
                                      {editingTaskId === task.id ? 'Save Notes' : 'Add Notes'}
                                    </button>
                                    <div className="relative group">
                                      <span className="text-blue-600 dark:text-blue-400 cursor-help">ℹ️ Why?</span>
                                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-lg">
                                        {task.why || 'This resource matches your assessment profile.'}
                                      </div>
                                    </div>
                                  </div>
                                  {editingTaskId === task.id && (
                                    <textarea
                                      value={editingTaskNotes}
                                      onChange={(e) => setEditingTaskNotes(e.target.value)}
                                      placeholder="Add notes..."
                                      className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                                      rows={2}
                                    />
                                  )}
                                  {task.notes && editingTaskId !== task.id && (
                                    <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1">{task.notes}</p>
                                  )}
                                </div>
                                {!financialPlan.lockedUntil && (
                                  <div className="flex flex-col gap-1">
                                    <button
                                      onClick={() => handleReorderTask(task.id, 'up')}
                                      className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
                                    >
                                      ↑
                                    </button>
                                    <button
                                      onClick={() => handleReorderTask(task.id, 'down')}
                                      className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
                                    >
                                      ↓
                                    </button>
                                    <button
                                      onClick={() => handleRemoveTask(task.id)}
                                      className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/60"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* 60-90 Day Growth */}
                  {(() => {
                    const tasks60d = financialPlan.selectedResources
                      .filter(t => t.phase === '60d')
                      .sort((a, b) => a.order - b.order);
                    
                    return tasks60d.length > 0 && (
                      <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedPlanPhase({ ...expandedPlanPhase, '60d': !expandedPlanPhase['60d'] })}
                          className="w-full bg-slate-50 dark:bg-slate-900 p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <h4 className="text-base font-black text-slate-900 dark:text-white">60–90 Day Growth</h4>
                          <span className="text-slate-600 dark:text-slate-400">{expandedPlanPhase['60d'] ? '▼' : '▶'}</span>
                        </button>
                        {expandedPlanPhase['60d'] && (
                          <div className="p-4 bg-white dark:bg-slate-800 space-y-3">
                            {tasks60d.map((task) => (
                              <div key={task.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                <input
                                  type="checkbox"
                                  checked={task.status === 'done'}
                                  onChange={(e) => handleUpdateTaskStatus(task.id, e.target.checked ? 'done' : 'not_started')}
                                  className="mt-1 rounded"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{task.resourceTitle}</p>
                                    <select
                                      value={task.status}
                                      onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                                      className={`px-2 py-0.5 rounded text-xs font-bold border-0 ${
                                        task.status === 'done' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400' :
                                        task.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400' :
                                        'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                      }`}
                                    >
                                      <option value="not_started">Not Started</option>
                                      <option value="in_progress">In Progress</option>
                                      <option value="done">Done</option>
                                    </select>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 mb-2">
                                    <input
                                      type="date"
                                      value={task.dueBy}
                                      onChange={(e) => handleUpdateTaskDueDate(task.id, e.target.value)}
                                      disabled={!!financialPlan.lockedUntil}
                                      className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                    <button
                                      onClick={() => {
                                        if (editingTaskId === task.id) {
                                          handleUpdateTaskNotes(task.id, editingTaskNotes);
                                          setEditingTaskId(null);
                                        } else {
                                          setEditingTaskId(task.id);
                                          setEditingTaskNotes(task.notes || '');
                                        }
                                      }}
                                      className="text-slate-600 dark:text-slate-400 hover:underline"
                                    >
                                      {editingTaskId === task.id ? 'Save Notes' : 'Add Notes'}
                                    </button>
                                    <div className="relative group">
                                      <span className="text-blue-600 dark:text-blue-400 cursor-help">ℹ️ Why?</span>
                                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-lg">
                                        {task.why || 'This resource matches your assessment profile.'}
                                      </div>
                                    </div>
                                  </div>
                                  {editingTaskId === task.id && (
                                    <textarea
                                      value={editingTaskNotes}
                                      onChange={(e) => setEditingTaskNotes(e.target.value)}
                                      placeholder="Add notes..."
                                      className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                                      rows={2}
                                    />
                                  )}
                                  {task.notes && editingTaskId !== task.id && (
                                    <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1">{task.notes}</p>
                                  )}
                                </div>
                                {!financialPlan.lockedUntil && (
                                  <div className="flex flex-col gap-1">
                                    <button
                                      onClick={() => handleReorderTask(task.id, 'up')}
                                      className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
                                    >
                                      ↑
                                    </button>
                                    <button
                                      onClick={() => handleReorderTask(task.id, 'down')}
                                      className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
                                    >
                                      ↓
                                    </button>
                                    <button
                                      onClick={() => handleRemoveTask(task.id)}
                                      className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/60"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {financialPlan.selectedResources.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <p className="mb-2">No tasks in your plan yet.</p>
                      <p className="text-xs">Add resources below to build your action plan.</p>
                    </div>
                  )}
                </div>

                {/* Saved for Later */}
                {financialPlan.savedResources.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="text-base font-black text-slate-900 dark:text-white mb-3">Saved for Later</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {financialPlan.savedResources.map((saved, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white">{saved.resourceTitle}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{saved.resourceCategory}</p>
                          </div>
                          <button
                            onClick={() => {
                              // Show phase selector for saved resource
                              const suggestedPhase = getResourcePhase(saved.resourceCategory as ResourceCategory, financialAssessment);
                              setSelectedPhase(suggestedPhase);
                              setShowPhaseSelector({ 
                                resource: { title: saved.resourceTitle, category: saved.resourceCategory, link: saved.resourceLink },
                                category: saved.resourceCategory as ResourceCategory
                              });
                            }}
                            className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700"
                          >
                            Add to Plan
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Phase Selector Modal */}
            {showPhaseSelector && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPhaseSelector(null)}>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Add to Plan</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{showPhaseSelector.resource.title}</p>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select Phase:</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 cursor-pointer hover:border-emerald-400 transition-colors">
                        <input
                          type="radio"
                          name="phase"
                          value="immediate"
                          checked={selectedPhase === 'immediate'}
                          onChange={() => setSelectedPhase('immediate')}
                          className="rounded"
                        />
                        <div>
                          <p className="text-sm font-black text-emerald-900 dark:text-emerald-300">Immediate (0–7 Days)</p>
                          <p className="text-xs text-emerald-800 dark:text-emerald-400">Quick actions for urgent needs</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20 cursor-pointer hover:border-teal-400 transition-colors">
                        <input
                          type="radio"
                          name="phase"
                          value="30d"
                          checked={selectedPhase === '30d'}
                          onChange={() => setSelectedPhase('30d')}
                          className="rounded"
                        />
                        <div>
                          <p className="text-sm font-black text-teal-900 dark:text-teal-300">30-Day Stabilization</p>
                          <p className="text-xs text-teal-800 dark:text-teal-400">Build consistent income sources</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 cursor-pointer hover:border-slate-400 transition-colors">
                        <input
                          type="radio"
                          name="phase"
                          value="60d"
                          checked={selectedPhase === '60d'}
                          onChange={() => setSelectedPhase('60d')}
                          className="rounded"
                        />
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white">60–90 Day Growth</p>
                          <p className="text-xs text-slate-700 dark:text-slate-300">Long-term income improvement</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowPhaseSelector(null)}
                      className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmAddToPlan}
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors"
                    >
                      Add to Plan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Recommended Resources - All Categories */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Recommended Resources</h3>
              <div className="space-y-6">
                {/* Assistance Resources */}
                {financialAssessment.suggestedResources.assistance.length > 0 && (
                  <div>
                    <h4 className="text-base font-black text-emerald-900 dark:text-emerald-300 mb-3 flex items-center gap-2">
                      <span>💚</span> Assistance Resources
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {financialAssessment.suggestedResources.assistance
                        .filter((resource: any) => !isResourceDismissed(resource, 'assistance'))
                        .map((resource: any, idx: number) => {
                          const inPlan = isResourceInPlan(resource, 'assistance');
                          const saved = isResourceSaved(resource, 'assistance');
                          return (
                            <div key={idx} className={`p-4 rounded-xl border ${
                              inPlan ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400' :
                              saved ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300' :
                              'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700'
                            }`}>
                              <p className="text-sm font-black text-emerald-900 dark:text-emerald-300 mb-1">{resource.title}</p>
                              <p className="text-xs text-emerald-800 dark:text-emerald-400 mb-2">{resource.category}</p>
                              {resource.link.startsWith('http') && (
                                <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline block mb-2">Visit Resource →</a>
                              )}
                              <div className="flex gap-2 mt-3">
                                {inPlan ? (
                                  <span className="px-2 py-1 text-xs bg-emerald-600 text-white rounded font-bold">✓ In Plan</span>
                                ) : saved ? (
                                  <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded font-bold">Saved</span>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleAddToPlan(resource, 'assistance')}
                                      className="flex-1 px-2 py-1 text-xs bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700 transition-colors"
                                    >
                                      Add to Plan
                                    </button>
                                    <button
                                      onClick={() => handleSaveForLater(resource, 'assistance')}
                                      className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => handleDismissResource(resource, 'assistance')}
                                      className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400 rounded font-bold hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
                                    >
                                      ×
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Unemployment Resources */}
                {financialAssessment.suggestedResources.unemployment.length > 0 && (
                  <div>
                    <h4 className="text-base font-black text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                      <span>💼</span> Unemployment Resources
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {financialAssessment.suggestedResources.unemployment
                        .filter((resource: any) => !isResourceDismissed(resource, 'unemployment'))
                        .map((resource: any, idx: number) => {
                          const inPlan = isResourceInPlan(resource, 'unemployment');
                          const saved = isResourceSaved(resource, 'unemployment');
                          return (
                            <div key={idx} className={`p-4 rounded-xl border ${
                              inPlan ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-400' :
                              saved ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300' :
                              'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                            }`}>
                              <p className="text-sm font-black text-blue-900 dark:text-blue-300 mb-1">{resource.title}</p>
                              <p className="text-xs text-blue-800 dark:text-blue-400 mb-2">{resource.category}</p>
                              {resource.link === 'app-unemployment' && (
                                <button onClick={() => onNavigate(AppView.UNEMPLOYMENT)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline block mb-2">Go to Unemployment Resources →</button>
                              )}
                              {resource.link === 'app-resume' && (
                                <button onClick={() => onNavigate(AppView.RESUME)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline block mb-2">Go to Resume Builder →</button>
                              )}
                              {resource.link === 'app-jobs' && (
                                <button onClick={() => onNavigate(AppView.JOBS)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline block mb-2">Go to Job Hunter →</button>
                              )}
                              <div className="flex gap-2 mt-3">
                                {inPlan ? (
                                  <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded font-bold">✓ In Plan</span>
                                ) : saved ? (
                                  <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded font-bold">Saved</span>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleAddToPlan(resource, 'unemployment')}
                                      className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-colors"
                                    >
                                      Add to Plan
                                    </button>
                                    <button
                                      onClick={() => handleSaveForLater(resource, 'unemployment')}
                                      className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => handleDismissResource(resource, 'unemployment')}
                                      className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400 rounded font-bold hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
                                    >
                                      ×
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Monetization Resources */}
                {financialAssessment.suggestedResources.monetization.length > 0 && (
                  <div>
                    <h4 className="text-base font-black text-purple-900 dark:text-purple-300 mb-3 flex items-center gap-2">
                      <span>💎</span> Monetization Resources
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {financialAssessment.suggestedResources.monetization
                        .filter((resource: any) => !isResourceDismissed(resource, 'monetization'))
                        .map((resource: any, idx: number) => {
                          const inPlan = isResourceInPlan(resource, 'monetization');
                          const saved = isResourceSaved(resource, 'monetization');
                          return (
                            <div key={idx} className={`p-4 rounded-xl border ${
                              inPlan ? 'bg-purple-100 dark:bg-purple-900/40 border-purple-400' :
                              saved ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300' :
                              'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700'
                            }`}>
                              <p className="text-sm font-black text-purple-900 dark:text-purple-300 mb-1">{resource.title}</p>
                              <p className="text-xs text-purple-800 dark:text-purple-400 mb-2">{resource.category}</p>
                              {resource.link.startsWith('http') && (
                                <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 dark:text-purple-400 hover:underline block mb-2">Visit Resource →</a>
                              )}
                              {resource.link === 'app-monetization' && (
                                <button onClick={() => onNavigate(AppView.MONETIZATION)} className="text-xs text-purple-600 dark:text-purple-400 hover:underline block mb-2">Go to Monetization →</button>
                              )}
                              <div className="flex gap-2 mt-3">
                                {inPlan ? (
                                  <span className="px-2 py-1 text-xs bg-purple-600 text-white rounded font-bold">✓ In Plan</span>
                                ) : saved ? (
                                  <span className="px-2 py-1 text-xs bg-purple-600 text-white rounded font-bold">Saved</span>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleAddToPlan(resource, 'monetization')}
                                      className="flex-1 px-2 py-1 text-xs bg-purple-600 text-white rounded font-bold hover:bg-purple-700 transition-colors"
                                    >
                                      Add to Plan
                                    </button>
                                    <button
                                      onClick={() => handleSaveForLater(resource, 'monetization')}
                                      className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => handleDismissResource(resource, 'monetization')}
                                      className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400 rounded font-bold hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
                                    >
                                      ×
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Money/Gigs Resources */}
                {financialAssessment.suggestedResources.money.length > 0 && (
                  <div>
                    <h4 className="text-base font-black text-amber-900 dark:text-amber-300 mb-3 flex items-center gap-2">
                      <span>💰</span> Money / Gigs Resources
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {financialAssessment.suggestedResources.money
                        .filter((resource: any) => !isResourceDismissed(resource, 'money'))
                        .map((resource: any, idx: number) => {
                          const inPlan = isResourceInPlan(resource, 'money');
                          const saved = isResourceSaved(resource, 'money');
                          return (
                            <div key={idx} className={`p-4 rounded-xl border ${
                              inPlan ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-400' :
                              saved ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300' :
                              'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'
                            }`}>
                              <p className="text-sm font-black text-amber-900 dark:text-amber-300 mb-1">{resource.title}</p>
                              <p className="text-xs text-amber-800 dark:text-amber-400 mb-2">{resource.category}</p>
                              {resource.link.startsWith('http') && (
                                <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 dark:text-amber-400 hover:underline block mb-2">Visit Resource →</a>
                              )}
                              {resource.link === 'app-money' && (
                                <button onClick={() => onNavigate(AppView.MONEY)} className="text-xs text-amber-600 dark:text-amber-400 hover:underline block mb-2">Go to Money/Gigs →</button>
                              )}
                              {resource.link === 'app-jobs' && (
                                <button onClick={() => onNavigate(AppView.JOBS)} className="text-xs text-amber-600 dark:text-amber-400 hover:underline block mb-2">Go to Job Hunter →</button>
                              )}
                              <div className="flex gap-2 mt-3">
                                {inPlan ? (
                                  <span className="px-2 py-1 text-xs bg-amber-600 text-white rounded font-bold">✓ In Plan</span>
                                ) : saved ? (
                                  <span className="px-2 py-1 text-xs bg-amber-600 text-white rounded font-bold">Saved</span>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleAddToPlan(resource, 'money')}
                                      className="flex-1 px-2 py-1 text-xs bg-amber-600 text-white rounded font-bold hover:bg-amber-700 transition-colors"
                                    >
                                      Add to Plan
                                    </button>
                                    <button
                                      onClick={() => handleSaveForLater(resource, 'money')}
                                      className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => handleDismissResource(resource, 'money')}
                                      className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400 rounded font-bold hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
                                    >
                                      ×
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Plan with Resources Integrated */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Your Financial Plan</h3>
              <div className="space-y-4">
                {/* Next 7 Days */}
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-xl border-l-4 border-emerald-500">
                  <p className="text-base font-black text-emerald-900 dark:text-emerald-300 mb-3">Next 7 Days</p>
                  <ul className="text-sm text-emerald-800 dark:text-emerald-400 space-y-2 ml-4 list-disc">
                    {financialAssessment.financialPlan?.next7Days.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-700">
                    <p className="text-xs font-black text-emerald-900 dark:text-emerald-300 mb-2">Resources to Use:</p>
                    <div className="flex flex-wrap gap-2">
                      {financialAssessment.suggestedResources.money.slice(0, 3).map((resource: any, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 rounded text-xs font-bold">{resource.title}</span>
                      ))}
                      {financialAssessment.suggestedResources.assistance.slice(0, 2).map((resource: any, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 rounded text-xs font-bold">{resource.title}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 30 Days */}
                <div className="bg-teal-50 dark:bg-teal-900/20 p-5 rounded-xl border-l-4 border-teal-500">
                  <p className="text-base font-black text-teal-900 dark:text-teal-300 mb-3">30 Days</p>
                  <ul className="text-sm text-teal-800 dark:text-teal-400 space-y-2 ml-4 list-disc">
                    {financialAssessment.financialPlan?.next30Days.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-teal-200 dark:border-teal-700">
                    <p className="text-xs font-black text-teal-900 dark:text-teal-300 mb-2">Resources to Use:</p>
                    <div className="flex flex-wrap gap-2">
                      {financialAssessment.suggestedResources.monetization.slice(0, 3).map((resource: any, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-400 rounded text-xs font-bold">{resource.title}</span>
                      ))}
                      {financialAssessment.suggestedResources.unemployment.slice(0, 2).map((resource: any, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-400 rounded text-xs font-bold">{resource.title}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 60-90 Days */}
                <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-xl border-l-4 border-slate-400">
                  <p className="text-base font-black text-slate-900 dark:text-white mb-3">60–90 Days</p>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 ml-4 list-disc">
                    {financialAssessment.financialPlan?.next60to90Days.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-700">
                    <p className="text-xs font-black text-slate-900 dark:text-white mb-2">Resources to Use:</p>
                    <div className="flex flex-wrap gap-2">
                      {financialAssessment.suggestedResources.monetization.slice(3).map((resource: any, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300 rounded text-xs font-bold">{resource.title}</span>
                      ))}
                      {financialAssessment.suggestedResources.money.slice(3).map((resource: any, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300 rounded text-xs font-bold">{resource.title}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 rounded-xl text-white mt-4">
                  <p className="text-sm font-black italic">This plan prioritizes stability first. Direction comes next.</p>
                </div>
              </div>
            </div>

            {/* Edit Assessment Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Edit Your Assessment</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Update your answers to recalculate your plan and resources.</p>
              
              {/* Quick Edit - Primary Pressures */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Financial Pressures:</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Rent / housing', 'Utilities', 'Food', 'Transportation', 'Debt', 'Medical', 'Childcare', 'Insurance'].map(pressure => (
                    <label key={pressure} className="flex items-center gap-2 p-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-emerald-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={financialAssessment.answers.primaryPressure.includes(pressure)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...financialAssessment.answers.primaryPressure, pressure]
                            : financialAssessment.answers.primaryPressure.filter(p => p !== pressure);
                          setFinancialAssessment({
                            ...financialAssessment,
                            answers: { ...financialAssessment.answers, primaryPressure: updated }
                          });
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{pressure}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quick Edit - Skills */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Your Skills (up to 3):</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Customer service', 'Writing / content', 'Design / creative', 'Tech / troubleshooting', 'Organization / admin', 'Physical labor', 'Sales / persuasion', 'Teaching / explaining'].map(skill => (
                    <label key={skill} className="flex items-center gap-2 p-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-emerald-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={financialAssessment.answers.skills.includes(skill)}
                        onChange={(e) => {
                          if (e.target.checked && financialAssessment.answers.skills.length < 3) {
                            setFinancialAssessment({
                              ...financialAssessment,
                              answers: { ...financialAssessment.answers, skills: [...financialAssessment.answers.skills, skill] }
                            });
                          } else if (!e.target.checked) {
                            setFinancialAssessment({
                              ...financialAssessment,
                              answers: { ...financialAssessment.answers, skills: financialAssessment.answers.skills.filter(s => s !== skill) }
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  // Recalculate assessment with updated answers
                  const mobilityScore = (financialAssessment.answers.vehicleAccess === 'Yes, reliable' && financialAssessment.answers.hasLicense === 'Yes' && financialAssessment.answers.canTravel === 'Yes') ? 'High' :
                    (financialAssessment.answers.vehicleAccess === 'Yes, but unreliable' || financialAssessment.answers.canTravel === 'Limited') ? 'Medium' : 'Low';
                  
                  const incomeFlexibility = financialAssessment.answers.hoursPerWeek === '40+' ? 'High' :
                    financialAssessment.answers.hoursPerWeek === '20-40' ? 'Medium' : 'Low';
                  
                  let stabilityLevel: 'Stable' | 'Watch Closely' | 'Immediate Action Needed' = 'Stable';
                  if (financialAssessment.answers.urgency === 'Critical (<30 days)') stabilityLevel = 'Immediate Action Needed';
                  else if (financialAssessment.answers.urgency === 'Tight (1–2 months)') stabilityLevel = 'Watch Closely';
                  
                  let primaryConstraint = 'Time';
                  if (financialAssessment.answers.vehicleAccess === 'No' || financialAssessment.answers.canTravel === 'No') primaryConstraint = 'Transportation';
                  else if (financialAssessment.answers.hoursPerWeek === '<10') primaryConstraint = 'Time';
                  else if (financialAssessment.answers.urgency === 'Critical (<30 days)') primaryConstraint = 'Urgency';
                  else primaryConstraint = 'Skills';
                  
                  let insight = '';
                  if (primaryConstraint === 'Transportation') {
                    insight = "Your biggest limiter right now isn't skill — it's transportation.";
                  } else if (primaryConstraint === 'Time') {
                    insight = "You have income potential, but time and urgency are working against you.";
                  } else if (primaryConstraint === 'Urgency') {
                    insight = "Your situation requires immediate action. Focus on fastest income paths first.";
                  } else {
                    insight = "You have flexibility. Focus on matching your skills to reliable income sources.";
                  }
                  
                  const suggestedResources = getSpecificResources(financialAssessment.answers, mobilityScore);
                  
                  const financialPlan = {
                    next7Days: [
                      `Apply to ${mobilityScore === 'High' ? '2-3 delivery/gig opportunities' : '3-5 remote or local walkable opportunities'}`,
                      `Complete setup for ${financialAssessment.answers.sellableItems.length > 0 && financialAssessment.answers.sellableItems[0] !== 'No' ? 'selling items' : 'one income path'}`,
                      'Review and organize your skills for quick application'
                    ],
                    next30Days: [
                      'Establish at least one consistent income source',
                      `Reduce primary financial pressure: ${financialAssessment.answers.primaryPressure.join(', ') || 'None specified'}`,
                      'Build a routine around your income generation'
                    ],
                    next60to90Days: [
                      'Improve income reliability and consistency',
                      'Transition toward better-fit work if applicable',
                      'Build multiple income streams if time allows'
                    ]
                  };
                  
                  const updated: FinancialAssessment = {
                    ...financialAssessment,
                    stabilityLevel,
                    mobilityScore: mobilityScore as 'High' | 'Medium' | 'Low',
                    incomeFlexibility: incomeFlexibility as 'High' | 'Medium' | 'Low',
                    primaryConstraint,
                    insight,
                    suggestedResources,
                    financialPlan
                  };
                  
                  setFinancialAssessment(updated);
                  // Update saved assessment
                  if (financialAssessment.id) {
                    updateFinancialAssessment(financialAssessment.id, updated);
                  }
                }}
                className="w-full py-3 bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-xl font-black hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
              >
                Update Assessment & Recalculate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

