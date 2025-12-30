
import React, { useRef } from 'react';
import { StructuredResume } from '../types';
import { 
  FitSettings, 
  DEFAULT_FIT_SETTINGS, 
  getDisplaySkills, 
  trimToWordLimit,
  getBulletsPerRole,
  SPACING_TOKENS,
} from '../services/fitEngine';

export interface TemplateSettings {
  margin: 'compact' | 'standard' | 'spacious';
  fontSize: 'small' | 'medium' | 'large';
  accentColor: string;
  showPageNumbers: boolean;
  fontFamily: string;
}

interface TemplateProps {
  data: StructuredResume;
  settings: TemplateSettings;
  onUpdate?: (newData: StructuredResume) => void;
  fitSettings?: FitSettings;
  pageCount?: number;
  onGenerateBullet?: (role: string, company: string, existingBullets: string[]) => Promise<string>;
}

const getClasses = (settings: TemplateSettings, fitSettings?: FitSettings) => {
  const fs = fitSettings || DEFAULT_FIT_SETTINGS;
  const basePx = fs.baseFontSize;
  const baseSize = basePx <= 11 ? 'text-[10px]' : basePx <= 11.5 ? 'text-[11px]' : 'text-xs';
  const padding = 'p-[0.5in]';
  return { baseSize, padding, lineHeight: fs.lineHeight };
};

const Editable: React.FC<{
    text: string;
    onBlur: (newText: string) => void;
    className?: string;
    style?: React.CSSProperties;
    multiline?: boolean;
    tag?: keyof React.JSX.IntrinsicElements;
}> = ({ text, onBlur, className = "", style, multiline = false, tag: Tag = "span" }) => {
    const ref = useRef<HTMLSpanElement>(null);

    const handleBlur = () => {
        const newText = ref.current?.innerText || "";
        if (newText !== text) {
            onBlur(newText);
        }
    };

    return (
        <Tag
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleBlur}
            title="Click to edit"
            className={`hover:bg-brand-50/50 dark:hover:bg-brand-900/20 outline-none transition-colors border-b border-transparent hover:border-brand-200 cursor-text ${className}`}
            style={{ ...style, whiteSpace: multiline ? 'pre-wrap' : 'normal', display: Tag === 'span' ? 'inline-block' : 'block' }}
        >
            {text}
        </Tag>
    );
};

const Container = ({ children, settings, className = "", style = {}, fitSettings, pageCount = 1 }: { 
    children?: React.ReactNode, 
    settings: TemplateSettings, 
    className?: string, 
    style?: React.CSSProperties,
    fitSettings?: FitSettings,
    pageCount?: number
}) => {
    const fs = fitSettings || DEFAULT_FIT_SETTINGS;
    return (
        <div 
            className={`resume-template-content ${className}`}
            style={{ 
                fontFamily: settings.fontFamily, 
                lineHeight: fs.lineHeight,
                ...style 
            }}
        >
            {children}
            {settings.showPageNumbers && Array.from({ length: pageCount }).map((_, i) => (
                <div key={i} className="absolute right-8 text-[10px] text-slate-400 no-print" style={{ top: `${(i + 1) * 11 - 0.5}in` }}>
                    Page {i + 1}
                </div>
            ))}
        </div>
    );
};

export const TemplateModern: React.FC<TemplateProps> = ({ data, settings, onUpdate, fitSettings, pageCount = 1, onGenerateBullet }) => {
    if (!data) return null;
    const fs = fitSettings || DEFAULT_FIT_SETTINGS;
    const c = getClasses(settings, fs);
    const contact = data.contact || { email: '', phone: '', location: '', linkedin: '' };
    const handleUpdate = (field: keyof StructuredResume, value: any) => onUpdate?.({ ...data, [field]: value });
    const handleContactUpdate = (field: keyof StructuredResume['contact'], value: string) => onUpdate?.({ ...data, contact: { ...contact, [field]: value } });
    const handleExpUpdate = (idx: number, field: string, value: any) => {
        const newExp = [...data.experience];
        newExp[idx] = { ...newExp[idx], [field]: value };
        onUpdate?.({ ...data, experience: newExp });
    };

    const roleCount = data.experience?.length || 0;
    const maxBullets = Math.min(fs.maxBulletsPerRole, getBulletsPerRole(roleCount));
    // Show up to 15 skills only
    const visibleSkills = (data.skills || []).slice(0, 15);
    const displaySummary = data.summary ? trimToWordLimit(data.summary, fs.summaryMaxWords) : '';

    return (
        <Container settings={settings} className={`flex ${c.baseSize} text-slate-900`} fitSettings={fs} pageCount={pageCount}>
             <div className="bg-slate-50 border-r border-slate-200 p-6 flex flex-col" style={{ width: SPACING_TOKENS.sidebarWidth, gap: SPACING_TOKENS.sectionPaddingBottom }}>
                <div style={{ marginBottom: SPACING_TOKENS.sectionTitleMarginBottom }}>
                    <Editable tag="h1" text={data.fullName} onBlur={(v) => handleUpdate('fullName', v)} className="text-xl font-bold leading-tight mb-1 text-slate-900" />
                    <Editable tag="p" text={data.title} onBlur={(v) => handleUpdate('title', v)} className="text-[0.85em] font-medium text-slate-500" />
                </div>
                <div className="space-y-1 text-slate-600 text-[0.85em] flex flex-col">
                    <Editable text={contact.email} onBlur={(v) => handleContactUpdate('email', v)} />
                    <Editable text={contact.phone} onBlur={(v) => handleContactUpdate('phone', v)} />
                    <Editable text={contact.location} onBlur={(v) => handleContactUpdate('location', v)} />
                </div>
                {visibleSkills.length > 0 && (
                    <div>
                        <h3 className="font-bold uppercase tracking-wider text-[0.8em]" style={{color: settings.accentColor, marginBottom: SPACING_TOKENS.sectionTitleMarginBottom}}>Skills</h3>
                        <div className="flex flex-wrap gap-1">
                            {visibleSkills.map((s, i) => (
                                <Editable key={i} text={s} onBlur={(v) => {
                                    const newSkills = [...data.skills];
                                    newSkills[i] = v;
                                    handleUpdate('skills', newSkills);
                                }} className="text-[0.8em]" />
                            ))}
                        </div>
                    </div>
                )}
                {data.certifications && data.certifications.length > 0 && (
                    <div>
                        <h3 className="font-bold uppercase tracking-wider text-[0.8em]" style={{color: settings.accentColor, marginBottom: SPACING_TOKENS.sectionTitleMarginBottom}}>Certifications</h3>
                        <div className="flex flex-col gap-1">
                            {data.certifications.slice(0, roleCount >= 5 ? 1 : data.certifications.length).map((cert, i) => (
                                <Editable key={i} text={cert} onBlur={(v) => {
                                    const newCerts = [...(data.certifications || [])];
                                    newCerts[i] = v;
                                    handleUpdate('certifications', newCerts);
                                }} className="text-[0.8em] text-slate-600 border-l-2 pl-2 border-slate-200" />
                            ))}
                        </div>
                    </div>
                )}
                {data.education && data.education.length > 0 && (
                    <div>
                        <h3 className="font-bold uppercase tracking-wider text-[0.8em]" style={{color: settings.accentColor, marginBottom: SPACING_TOKENS.sectionTitleMarginBottom}}>Education</h3>
                        {data.education.map((edu, i) => (
                            <div key={i} className="mb-1">
                                <div className="text-[0.85em] font-medium text-slate-900">{edu.school}</div>
                                <div className="text-[0.8em] text-slate-500">{edu.degree}</div>
                                {roleCount < 5 && edu.dates && <div className="text-[0.75em] text-slate-400">{edu.dates}</div>}
                            </div>
                        ))}
                    </div>
                )}
             </div>
             <div className="flex-1 p-6 flex flex-col" style={{ gap: SPACING_TOKENS.sectionPaddingBottom }}>
                {displaySummary && (
                    <div>
                        <h3 className="font-bold uppercase tracking-wider border-b border-slate-200 pb-1 text-[0.85em]" style={{color: settings.accentColor, marginBottom: SPACING_TOKENS.sectionTitleMarginBottom}}>Profile</h3>
                        <Editable tag="p" text={displaySummary} multiline onBlur={(v) => handleUpdate('summary', v)} className="text-slate-700" style={{ lineHeight: fs.lineHeight }} />
                    </div>
                )}
                <div>
                    <h3 className="font-bold uppercase tracking-wider border-b border-slate-200 pb-1 text-[0.85em]" style={{color: settings.accentColor, marginBottom: SPACING_TOKENS.sectionTitleMarginBottom}}>Experience</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING_TOKENS.roleBlockMarginBottom }}>
                        {data.experience.map((exp, i) => {
                            // Show ALL bullets, not limited by maxBullets
                            const allBullets = exp.description || [];
                            return (
                                <div key={i}>
                                    <div className="flex justify-between items-baseline">
                                        <Editable tag="h4" text={exp.role} onBlur={(v) => handleExpUpdate(i, 'role', v)} className="font-bold text-[1.05em]" />
                                        <Editable tag="span" text={exp.dates} onBlur={(v) => handleExpUpdate(i, 'dates', v)} className="text-slate-500 font-medium text-[0.85em]" />
                                    </div>
                                    <Editable tag="div" text={exp.company} onBlur={(v) => handleExpUpdate(i, 'company', v)} className="text-slate-600 font-medium mb-1" />
                                    <ul className="list-disc text-slate-700" style={{ marginLeft: SPACING_TOKENS.bulletPaddingLeft, marginTop: SPACING_TOKENS.bulletListMarginTop, listStylePosition: 'outside' }}>
                                        {allBullets.map((desc, j) => (
                                            <li key={j} style={{ margin: SPACING_TOKENS.bulletItemMargin }}>
                                                <Editable text={desc} onBlur={(v) => {
                                                    const newDescs = [...(exp.description || [])];
                                                    newDescs[j] = v;
                                                    handleExpUpdate(i, 'description', newDescs);
                                                }} />
                                            </li>
                                        ))}
                                        <li key="add-bullet" style={{ margin: SPACING_TOKENS.bulletItemMargin, listStyle: 'none' }}>
                                            <button
                                                onClick={() => {
                                                    const newDescs = [...(exp.description || []), ''];
                                                    handleExpUpdate(i, 'description', newDescs);
                                                }}
                                                className="text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-2 py-1 rounded transition-colors font-medium"
                                                title="Add bullet point"
                                            >
                                                + Add Bullet
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {data.awards && data.awards.length > 0 && (
                    <div>
                        <h3 className="font-bold uppercase tracking-wider border-b border-slate-200 pb-1 text-[0.85em]" style={{color: settings.accentColor, marginBottom: SPACING_TOKENS.sectionTitleMarginBottom}}>Awards</h3>
                        <div className="grid grid-cols-1 gap-1">
                            {data.awards.map((award, i) => (
                                <div key={i} className="flex gap-2">
                                    <span className="text-brand-500">★</span>
                                    <Editable text={award} onBlur={(v) => {
                                        const newAwards = [...(data.awards || [])];
                                        newAwards[i] = v;
                                        handleUpdate('awards', newAwards);
                                    }} className="text-slate-700" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
             </div>
        </Container>
    );
};

export const TemplateExecutive: React.FC<TemplateProps> = ({ data, settings, onUpdate, fitSettings, pageCount = 1, onGenerateBullet }) => {
    if (!data) return null;
    const fs = fitSettings || DEFAULT_FIT_SETTINGS;
    const c = getClasses(settings, fs);
    const contact = data.contact || { email: '', phone: '', location: '', linkedin: '' };
    const handleUpdate = (field: keyof StructuredResume, value: any) => onUpdate?.({ ...data, [field]: value });
    const handleContactUpdate = (field: keyof StructuredResume['contact'], value: string) => onUpdate?.({ ...data, contact: { ...contact, [field]: value } });
    const handleExpUpdate = (idx: number, field: string, value: any) => {
        const newExp = [...data.experience];
        newExp[idx] = { ...newExp[idx], [field]: value };
        onUpdate?.({ ...data, experience: newExp });
    };

    const roleCount = data.experience?.length || 0;
    const maxBullets = Math.min(fs.maxBulletsPerRole, getBulletsPerRole(roleCount));
    // Show up to 15 skills only
    const visibleSkills = (data.skills || []).slice(0, 15);
    const displaySummary = data.summary ? trimToWordLimit(data.summary, fs.summaryMaxWords) : '';

    return (
        <Container settings={settings} className={`flex flex-col ${c.padding} ${c.baseSize} text-slate-900`} fitSettings={fs} pageCount={pageCount}>
            <div className="text-center mb-6">
                <Editable tag="h1" text={data.fullName} onBlur={(v) => handleUpdate('fullName', v)} className="text-2xl font-bold uppercase tracking-widest mb-1" style={{ color: settings.accentColor }} />
                <Editable tag="p" text={data.title} onBlur={(v) => handleUpdate('title', v)} className="text-[0.9em] font-medium tracking-wide border-t border-b border-slate-200 py-1 mb-1" />
                <div className="text-[0.75em] text-slate-500 flex justify-center gap-4 uppercase font-bold">
                    <Editable text={contact.location} onBlur={(v) => handleContactUpdate('location', v)} />
                    <span>•</span>
                    <Editable text={contact.phone} onBlur={(v) => handleContactUpdate('phone', v)} />
                    <span>•</span>
                    <Editable text={contact.email} onBlur={(v) => handleContactUpdate('email', v)} />
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING_TOKENS.sectionPaddingBottom }}>
                <section>
                    <h3 className="font-black uppercase tracking-widest text-[0.75em] border-b-2 border-slate-100 pb-1" style={{ color: settings.accentColor, marginBottom: SPACING_TOKENS.sectionTitleMarginBottom }}>Executive Summary</h3>
                    <Editable tag="p" text={displaySummary} multiline onBlur={(v) => handleUpdate('summary', v)} className="text-slate-700 italic" style={{ lineHeight: fs.lineHeight }} />
                </section>
                <section>
                    <h3 className="font-black uppercase tracking-widest text-[0.75em] border-b-2 border-slate-100 pb-1" style={{ color: settings.accentColor, marginBottom: SPACING_TOKENS.sectionTitleMarginBottom }}>Experience</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING_TOKENS.roleBlockMarginBottom }}>
                        {data.experience.map((exp, i) => {
                            // Show ALL bullets, not limited by maxBullets
                            const allBullets = exp.description || [];
                            return (
                                <div key={i}>
                                    <div className="flex justify-between items-center font-bold text-[0.95em]">
                                        <Editable text={exp.company} onBlur={(v) => handleExpUpdate(i, 'company', v)} />
                                        <Editable tag="span" text={exp.dates} onBlur={(v) => handleExpUpdate(i, 'dates', v)} className="text-[0.75em] text-slate-400 uppercase" />
                                    </div>
                                    <Editable tag="div" text={exp.role} onBlur={(v) => handleExpUpdate(i, 'role', v)} className="text-[0.85em] font-semibold text-slate-600 mb-1" />
                                    <ul className="list-disc text-slate-700" style={{ marginLeft: SPACING_TOKENS.bulletPaddingLeft, marginTop: SPACING_TOKENS.bulletListMarginTop, listStylePosition: 'outside' }}>
                                        {allBullets.map((desc, j) => (
                                            <li key={j} style={{ margin: SPACING_TOKENS.bulletItemMargin }}>
                                                <Editable text={desc} onBlur={(v) => {
                                                    const newDescs = [...(exp.description || [])];
                                                    newDescs[j] = v;
                                                    handleExpUpdate(i, 'description', newDescs);
                                                }} />
                                            </li>
                                        ))}
                                        <li key="add-bullet" style={{ margin: SPACING_TOKENS.bulletItemMargin, listStyle: 'none' }}>
                                            <button
                                                onClick={() => {
                                                    const newDescs = [...(exp.description || []), ''];
                                                    handleExpUpdate(i, 'description', newDescs);
                                                }}
                                                className="text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-2 py-1 rounded transition-colors font-medium"
                                                title="Add bullet point"
                                            >
                                                + Add Bullet
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </section>
                {(data.certifications || data.awards) && (
                    <div className="grid grid-cols-2 gap-6">
                        {data.certifications && data.certifications.length > 0 && (
                            <section>
                                <h3 className="font-black uppercase tracking-widest text-[0.75em] border-b-2 border-slate-100 pb-1" style={{ color: settings.accentColor, marginBottom: SPACING_TOKENS.sectionTitleMarginBottom }}>Certifications</h3>
                                <ul className="space-y-0.5">
                                    {data.certifications.slice(0, roleCount >= 5 ? 1 : data.certifications.length).map((cert, i) => (
                                        <li key={i}><Editable text={cert} onBlur={(v) => {
                                            const newCerts = [...(data.certifications || [])];
                                            newCerts[i] = v;
                                            handleUpdate('certifications', newCerts);
                                        }} className="text-[0.85em] text-slate-700" /></li>
                                    ))}
                                </ul>
                            </section>
                        )}
                        {data.awards && data.awards.length > 0 && (
                            <section>
                                <h3 className="font-black uppercase tracking-widest text-[0.75em] border-b-2 border-slate-100 pb-1" style={{ color: settings.accentColor, marginBottom: SPACING_TOKENS.sectionTitleMarginBottom }}>Awards</h3>
                                <ul className="space-y-0.5">
                                    {data.awards.map((a, i) => (
                                        <li key={i}><Editable text={a} onBlur={(v) => {
                                            const newAwards = [...(data.awards || [])];
                                            newAwards[i] = v;
                                            handleUpdate('awards', newAwards);
                                        }} className="text-[0.85em] text-slate-700" /></li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>
                )}
                {data.education && data.education.length > 0 && (
                    <section>
                        <h3 className="font-black uppercase tracking-widest text-[0.75em] border-b-2 border-slate-100 pb-1" style={{ color: settings.accentColor, marginBottom: SPACING_TOKENS.sectionTitleMarginBottom }}>Education</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {data.education.map((edu, i) => (
                                <div key={i}>
                                    <div className="text-[0.9em] font-medium text-slate-900">{edu.school}</div>
                                    <div className="text-[0.8em] text-slate-500">{edu.degree}</div>
                                    {roleCount < 5 && edu.dates && <div className="text-[0.7em] text-slate-400">{edu.dates}</div>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </Container>
    );
};

export const TemplateMinimal: React.FC<TemplateProps> = ({ data, settings, onUpdate, fitSettings, pageCount = 1, onGenerateBullet }) => {
    if (!data) return null;
    const fs = fitSettings || DEFAULT_FIT_SETTINGS;
    const c = getClasses(settings, fs);
    const contact = data.contact || { email: '', phone: '', location: '', linkedin: '' };
    const handleUpdate = (field: keyof StructuredResume, value: any) => onUpdate?.({ ...data, [field]: value });
    const handleContactUpdate = (field: keyof StructuredResume['contact'], value: string) => onUpdate?.({ ...data, contact: { ...contact, [field]: value } });
    const handleExpUpdate = (idx: number, field: string, value: any) => {
        const newExp = [...data.experience];
        newExp[idx] = { ...newExp[idx], [field]: value };
        onUpdate?.({ ...data, experience: newExp });
    };

    const roleCount = data.experience?.length || 0;
    const maxBullets = Math.min(fs.maxBulletsPerRole, getBulletsPerRole(roleCount));
    // Show up to 15 skills only
    const visibleSkills = (data.skills || []).slice(0, 15);
    const displaySummary = data.summary ? trimToWordLimit(data.summary, fs.summaryMaxWords) : '';

    return (
        <Container settings={settings} className={`flex flex-col ${c.padding} ${c.baseSize} text-slate-800`} fitSettings={fs} pageCount={pageCount}>
            <header className="mb-6 border-b border-slate-200 pb-4">
                <Editable tag="h1" text={data.fullName} onBlur={(v) => handleUpdate('fullName', v)} className="text-2xl font-bold tracking-tight mb-1" style={{ color: settings.accentColor }} />
                <Editable tag="p" text={data.title} onBlur={(v) => handleUpdate('title', v)} className="text-[0.9em] font-medium text-slate-500 mb-2" />
                <div className="flex flex-wrap gap-4 text-[0.75em] font-medium text-slate-500">
                    {contact.email && <Editable text={contact.email} onBlur={(v) => handleContactUpdate('email', v)} />}
                    {contact.phone && <Editable text={contact.phone} onBlur={(v) => handleContactUpdate('phone', v)} />}
                    {contact.location && <Editable text={contact.location} onBlur={(v) => handleContactUpdate('location', v)} />}
                </div>
            </header>

            {displaySummary && (
                <section style={{ marginBottom: SPACING_TOKENS.sectionPaddingBottom }}>
                    <h3 className="text-[0.8em] font-bold uppercase tracking-widest" style={{ color: settings.accentColor, marginBottom: SPACING_TOKENS.sectionTitleMarginBottom }}>Summary</h3>
                    <Editable tag="p" text={displaySummary} multiline onBlur={(v) => handleUpdate('summary', v)} className="text-slate-600" style={{ lineHeight: fs.lineHeight }} />
                </section>
            )}

            <section style={{ marginBottom: SPACING_TOKENS.sectionPaddingBottom }}>
                <h3 className="text-[0.8em] font-bold uppercase tracking-widest" style={{ color: settings.accentColor, marginBottom: SPACING_TOKENS.sectionTitleMarginBottom }}>Experience</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING_TOKENS.roleBlockMarginBottom }}>
                    {data.experience.map((exp, i) => {
                        // Show ALL bullets, not limited by maxBullets
                        const allBullets = exp.description || [];
                        return (
                            <div key={i}>
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <Editable tag="h4" text={exp.role} onBlur={(v) => handleExpUpdate(i, 'role', v)} className="font-semibold text-slate-900" />
                                    <Editable tag="span" text={exp.dates} onBlur={(v) => handleExpUpdate(i, 'dates', v)} className="text-[0.75em] text-slate-400" />
                                </div>
                                <Editable tag="div" text={exp.company} onBlur={(v) => handleExpUpdate(i, 'company', v)} className="text-[0.85em] text-slate-500 mb-1" />
                                <ul className="list-disc" style={{ marginLeft: SPACING_TOKENS.bulletPaddingLeft, marginTop: SPACING_TOKENS.bulletListMarginTop, listStylePosition: 'outside' }}>
                                    {allBullets.map((d, j) => (
                                        <li key={j} className="text-[0.9em] text-slate-600" style={{ margin: SPACING_TOKENS.bulletItemMargin }}>
                                            <Editable text={d} onBlur={(v) => {
                                                const newDescs = [...(exp.description || [])];
                                                newDescs[j] = v;
                                                handleExpUpdate(i, 'description', newDescs);
                                            }} />
                                        </li>
                                    ))}
                                    <li key="add-bullet" className="text-[0.9em] text-slate-600" style={{ margin: SPACING_TOKENS.bulletItemMargin, listStyle: 'none' }}>
                                        <button
                                            onClick={() => {
                                                const newDescs = [...(exp.description || []), ''];
                                                handleExpUpdate(i, 'description', newDescs);
                                            }}
                                            className="text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-2 py-1 rounded transition-colors font-medium"
                                            title="Add bullet point"
                                        >
                                            + Add Bullet
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </section>

            <div className="grid grid-cols-2 gap-6">
                {visibleSkills.length > 0 && (
                    <section>
                        <h3 className="text-[0.8em] font-bold uppercase tracking-widest" style={{ color: settings.accentColor, marginBottom: SPACING_TOKENS.sectionTitleMarginBottom }}>Skills</h3>
                        <div className="flex flex-wrap gap-1">
                            {visibleSkills.map((s, i) => (
                                <Editable key={i} text={s} onBlur={(v) => {
                                    const newSkills = [...data.skills];
                                    newSkills[i] = v;
                                    handleUpdate('skills', newSkills);
                                }} className="text-[0.8em]" />
                            ))}
                        </div>
                    </section>
                )}

                {data.education && data.education.length > 0 && (
                    <section>
                        <h3 className="text-[0.8em] font-bold uppercase tracking-widest" style={{ color: settings.accentColor, marginBottom: SPACING_TOKENS.sectionTitleMarginBottom }}>Education</h3>
                        {data.education.map((edu, i) => (
                            <div key={i} className="mb-1">
                                <div className="text-[0.9em] font-medium text-slate-900">{edu.school}</div>
                                <div className="text-[0.8em] text-slate-500">{edu.degree}</div>
                                {roleCount < 5 && edu.dates && <div className="text-[0.7em] text-slate-400">{edu.dates}</div>}
                            </div>
                        ))}
                    </section>
                )}
            </div>
        </Container>
    );
};

export const TemplateTimeline = TemplateMinimal;
