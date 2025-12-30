
import React, { useState, useEffect } from 'react';
import { SavedResume, SavedFounderProject, FavoriteResource } from '../types';
import * as storage from '../services/storageService';

interface ProfileViewProps {
    onLoadResume: (resume: SavedResume) => void;
    onLoadProject: (project: SavedFounderProject) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onLoadResume, onLoadProject }) => {
    const [resumes, setResumes] = useState<SavedResume[]>([]);
    const [projects, setProjects] = useState<SavedFounderProject[]>([]);
    const [favorites, setFavorites] = useState<FavoriteResource[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'resumes' | 'projects' | 'favorites'>('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setResumes(storage.getSavedResumes());
        setProjects(storage.getSavedProjects());
        setFavorites(storage.getFavorites());
    };

    const handleDeleteResume = (id: string) => {
        if (window.confirm("Are you sure you want to delete this resume?")) {
            storage.deleteResume(id);
            loadData();
        }
    };

    const handleDeleteProject = (id: string) => {
        if (window.confirm("Delete this business project?")) {
            storage.deleteProject(id);
            loadData();
        }
    };

    const handleRemoveFavorite = (resource: FavoriteResource) => {
        storage.toggleFavorite(resource);
        loadData();
    };

    return (
        <div className="max-w-5xl mx-auto pb-12 animate-in fade-in">
            {/* Header */}
            <div className="flex items-center gap-6 mb-8 border-b border-slate-200 pb-8">
                <div className="w-20 h-20 bg-slate-900 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">
                    👤
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800">My Profile</h1>
                    <p className="text-slate-500">Manage your saved career assets and ideas.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                    <span className="text-4xl font-black text-brand-600 mb-1">{resumes.length}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resumes</span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                    <span className="text-4xl font-black text-purple-600 mb-1">{projects.length}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Business Ideas</span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                    <span className="text-4xl font-black text-pink-500 mb-1">{favorites.length}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Favorites</span>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-200">
                {['all', 'resumes', 'projects', 'favorites'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`pb-3 px-4 text-sm font-bold uppercase tracking-wide transition-colors ${
                            activeTab === tab 
                            ? 'text-slate-900 border-b-2 border-slate-900' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="space-y-12">
                {/* Resumes Section */}
                {(activeTab === 'all' || activeTab === 'resumes') && resumes.length > 0 && (
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span>📄</span> Saved Resumes
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {resumes.map(resume => (
                                <div key={resume.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center group">
                                    <div>
                                        <h4 className="font-bold text-slate-800">{resume.name}</h4>
                                        <p className="text-xs text-slate-500">{new Date(resume.date).toLocaleDateString()} • {resume.data.structuredResume.title}</p>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => onLoadResume(resume)}
                                            className="px-3 py-1.5 bg-brand-50 text-brand-700 text-xs font-bold rounded hover:bg-brand-100 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteResume(resume.id)}
                                            className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded hover:bg-red-100 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects Section */}
                {(activeTab === 'all' || activeTab === 'projects') && projects.length > 0 && (
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span>🚀</span> Founder Projects
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projects.map(project => (
                                <div key={project.id} className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-50 text-4xl">
                                        🚀
                                    </div>
                                    <div className="relative z-10">
                                        {project.logoUrl && <img src={project.logoUrl} className="w-12 h-12 rounded-lg object-contain bg-white mb-4" alt="logo" />}
                                        <h4 className="text-xl font-bold mb-1">{project.name}</h4>
                                        <p className="text-xs text-slate-400 mb-4">{project.idea.domain}</p>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => onLoadProject(project)}
                                                className="flex-1 py-2 bg-white text-slate-900 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
                                            >
                                                Open Plan
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteProject(project.id)}
                                                className="px-3 py-2 bg-slate-800 text-slate-400 text-xs font-bold rounded-lg hover:bg-red-900 hover:text-red-200 transition-colors"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Favorites Section */}
                {(activeTab === 'all' || activeTab === 'favorites') && favorites.length > 0 && (
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span>⭐</span> Favorite Resources
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {favorites.map(fav => (
                                <div key={fav.link} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-brand-300 transition-colors relative group">
                                    <button 
                                        onClick={() => handleRemoveFavorite(fav)}
                                        className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1.5 rounded-full"
                                        title="Remove Favorite"
                                    >
                                        ❤️
                                    </button>
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${
                                        fav.category === 'money' ? 'bg-green-50 text-green-700' :
                                        fav.category === 'monetization' ? 'bg-purple-50 text-purple-700' :
                                        'bg-blue-50 text-blue-700'
                                    }`}>
                                        {fav.category}
                                    </span>
                                    <h4 className="font-bold text-slate-800 mb-1 pr-6">{fav.title}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{fav.description}</p>
                                    <a 
                                        href={fav.link} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
                                    >
                                        Visit Link ↗
                                    </a>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {resumes.length === 0 && projects.length === 0 && favorites.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <div className="text-4xl mb-4 opacity-50">📭</div>
                        <h3 className="text-lg font-bold text-slate-700">Nothing saved yet</h3>
                        <p className="text-slate-500 text-sm">Save resumes, business plans, or resources to see them here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
