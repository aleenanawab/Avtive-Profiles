'use client';

import React from 'react';
import { ArrowRight, Pencil, Plus, X, FolderGit2, ExternalLink } from 'lucide-react';
import { ProfileData, ProjectItem } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface PortfolioSectionProps {
  profile: ProfileData;
  onSelectProject?: (project: ProjectItem) => void;
  theme?: ThemeConfig;
  canEdit?: boolean;
  isEditing?: boolean;
  onUpdateField?: (field: keyof ProfileData, value: any) => void;
  onSelectSection?: (sectionKey: string, fieldKey?: string) => void;
}

export function PortfolioSection({ 
  profile, 
  onSelectProject, 
  theme = getThemeConfig(profile.theme || 'elegant'),
  canEdit = false,
  isEditing = false,
  onUpdateField,
  onSelectSection
}: PortfolioSectionProps) {
  const projects = profile.projects || [];
  const hasProjects = projects.length > 0;

  if (!hasProjects && !canEdit && !isEditing) {
    return null;
  }

  const handleAddProject = () => {
    const newProject: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: 'New Project',
      category: 'Web App',
      description: 'Project overview, technology used, and results achieved.',
      tags: ['React', 'TypeScript'],
      link: ''
    };
    const updated = [newProject, ...projects];
    onUpdateField?.('projects', updated);
  };

  const handleUpdateProject = (id: string, updates: Partial<ProjectItem>) => {
    const updated = projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
    onUpdateField?.('projects', updated);
  };

  const handleRemoveProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    onUpdateField?.('projects', updated);
  };

  return (
    <section className={`relative group/port px-4 sm:px-6 md:px-8 py-5 space-y-3.5 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors ${
      canEdit && !isEditing && onSelectSection ? 'hover:bg-accent/5 transition-all' : ''
    }`}>
      <div className="flex items-center justify-between">
        <div 
          className={`flex items-center gap-2 ${canEdit && !isEditing && onSelectSection ? 'cursor-pointer' : ''}`}
          onClick={() => canEdit && !isEditing && onSelectSection?.('projects')}
        >
          <h2 className={`text-sm font-bold tracking-tight ${theme.textPrimary}`}>
            Projects
          </h2>
          {canEdit && !isEditing && onSelectSection && (
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
              Click to edit
            </span>
          )}
        </div>

        {isEditing ? (
          <button
            type="button"
            onClick={handleAddProject}
            className={`flex items-center gap-1 text-[11px] font-bold ${theme.accentText} hover:underline cursor-pointer`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </button>
        ) : hasProjects ? (
          <span 
            onClick={(e) => {
              if (canEdit && onSelectSection) {
                e.stopPropagation();
                onSelectSection('projects');
              }
            }}
            className={`text-xs ${theme.accentText} font-medium flex items-center gap-1 hover:underline cursor-pointer`}
          >
            {canEdit ? 'Manage' : 'View All'} <ArrowRight className="w-3.5 h-3.5" />
          </span>
        ) : null}
      </div>

      {/* Visual Project Cards */}
      {hasProjects ? (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => {
                if (!isEditing && onSelectProject) {
                  onSelectProject(project);
                }
              }}
              className={`group/card relative rounded-2xl overflow-hidden ${theme.cardBg} border ${theme.cardBorder} ${
                isEditing ? '' : 'cursor-pointer ' + theme.hoverBorder
              } transition-all shadow-2xs hover:shadow-md`}
            >
              {isEditing ? (
                /* Editable Project Item */
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                          Project Title
                        </label>
                        <input
                          type="text"
                          value={project.title || ''}
                          onChange={(e) => handleUpdateProject(project.id, { title: e.target.value })}
                          placeholder="e.g. AI Workflow Platform"
                          className={`w-full text-sm font-bold p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textPrimary}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                          Category / Tag
                        </label>
                        <input
                          type="text"
                          value={project.category || ''}
                          onChange={(e) => handleUpdateProject(project.id, { category: e.target.value })}
                          placeholder="e.g. Full Stack · Open Source"
                          className={`w-full text-xs font-semibold p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary}`}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(project.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
                      title="Remove project"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                      Project Description
                    </label>
                    <textarea
                      rows={2}
                      value={project.description || ''}
                      onChange={(e) => handleUpdateProject(project.id, { description: e.target.value })}
                      placeholder="Brief description of project features and outcome..."
                      className={`w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                        Live URL / Repository
                      </label>
                      <input
                        type="url"
                        value={project.link || ''}
                        onChange={(e) => handleUpdateProject(project.id, { link: e.target.value })}
                        placeholder="https://github.com/... or https://..."
                        className={`w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                        Tech Stack Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={Array.isArray(project.tags) ? project.tags.join(', ') : ''}
                        onChange={(e) => {
                          const tagList = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                          handleUpdateProject(project.id, { tags: tagList });
                        }}
                        placeholder="React, Next.js, Node.js, Tailwind"
                        className={`w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary}`}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* View Project Item */
                <>
                  {(project.image || project.coverImage) && (
                    <div className={`relative h-52 sm:h-60 w-full overflow-hidden ${theme.coverFallback}`}>
                      <img
                        src={project.image || project.coverImage}
                        alt={project.title}
                        className={`w-full h-full object-cover ${project.imagePosition || 'object-center'} group-hover:scale-[1.02] transition-transform duration-300`}
                      />
                      
                      {project.category && (
                        <div className="absolute top-3 left-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${theme.btnPrimary} backdrop-blur-md shadow-xs`}>
                            {project.category}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-4 sm:p-5 space-y-2.5">
                    <div>
                      {!project.image && !project.coverImage && project.category && (
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold ${theme.badgeBg} ${theme.badgeText} mb-2 font-mono`}>
                          {project.category}
                        </span>
                      )}
                      <h3 className={`text-base font-bold ${theme.textPrimary} group-hover:${theme.accentText} transition-colors`}>
                        {project.title}
                      </h3>
                      <p className={`text-xs ${theme.textSecondary} leading-relaxed mt-1`}>
                        {project.description}
                      </p>
                    </div>

                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {project.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${theme.badgeBg} ${theme.badgeText} border ${theme.subCardBorder}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className={`pt-2 border-t ${theme.divider} flex items-center justify-between text-xs font-bold ${theme.textPrimary}`}>
                      <span>View Project</span>
                      <ArrowRight className={`w-3.5 h-3.5 group-hover:translate-x-1 transition-transform ${theme.accentText}`} />
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} text-center space-y-2`}>
          <p className={`text-xs ${theme.textMuted}`}>
            No projects added yet.
          </p>
          {isEditing && (
            <button
              type="button"
              onClick={handleAddProject}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed ${theme.cardBorder} text-xs font-bold ${theme.accentText} hover:opacity-80 cursor-pointer`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add your first project</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
