'use client';

import React, { useRef, useState } from 'react';
import { ArrowRight, FolderGit2, Plus, Trash2, ExternalLink, Image as ImageIcon, Loader2 } from 'lucide-react';
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
  const projects: ProjectItem[] = profile.projects || [];
  const hasProjects = projects.length > 0;
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: 'New Project',
      description: 'Brief overview of what you engineered, built, or delivered.',
      link: 'https://github.com',
      tags: ['TypeScript', 'React'],
      image: ''
    };
    const updated = [newProj, ...projects];
    onUpdateField?.('projects', updated);
  };

  const handleUpdateProject = (id: string, field: keyof ProjectItem, value: any) => {
    const updated = projects.map((p) => 
      p.id === id ? { ...p, [field]: value } : p
    );
    onUpdateField?.('projects', updated);
  };

  const handleRemoveProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    onUpdateField?.('projects', updated);
  };

  const handleImageUpload = async (id: string, file: File) => {
    setUploadingId(id);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'project');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        handleUpdateProject(id, 'image', data.url);
      }
    } catch (err) {
      console.error('Project image upload failed:', err);
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <section className={`px-6 sm:px-8 py-5 space-y-4 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderGit2 className={`w-4 h-4 ${theme.accentText}`} />
          <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} font-mono`}>
            Projects & Portfolio
          </h2>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={handleAddProject}
            className={`flex items-center gap-1 text-xs font-bold ${theme.accentText} hover:opacity-80 transition-opacity cursor-pointer`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4 pt-1">
          {projects.length === 0 ? (
            <div className={`p-5 rounded-2xl border border-dashed ${theme.cardBorder} text-center space-y-2`}>
              <p className={`text-xs ${theme.textMuted}`}>No projects or case studies added yet.</p>
              <button
                type="button"
                onClick={handleAddProject}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${theme.btnPrimary} cursor-pointer`}
              >
                + Add First Project
              </button>
            </div>
          ) : (
            projects.map((proj, idx) => (
              <div
                key={proj.id || idx}
                className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-3 relative group/item shadow-2xs`}
              >
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                  <span className={`text-[10px] font-mono font-bold uppercase ${theme.textMuted}`}>
                    Project #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(proj.id)}
                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove this project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      Project Title
                    </label>
                    <input
                      type="text"
                      value={proj.title || ''}
                      onChange={(e) => handleUpdateProject(proj.id, 'title', e.target.value)}
                      placeholder="e.g. Next-Gen Commerce Engine"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      Project Link / URL
                    </label>
                    <input
                      type="url"
                      value={proj.link || (proj as any).url || ''}
                      onChange={(e) => {
                        handleUpdateProject(proj.id, 'link', e.target.value);
                        handleUpdateProject(proj.id, 'url' as any, e.target.value);
                      }}
                      placeholder="https://example.com"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      Tags / Tech Stack (comma separated)
                    </label>
                    <input
                      type="text"
                      value={Array.isArray(proj.tags) ? proj.tags.join(', ') : (proj.tags || '')}
                      onChange={(e) => {
                        const tagsArr = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                        handleUpdateProject(proj.id, 'tags', tagsArr);
                      }}
                      placeholder="e.g. React, Next.js, Node.js"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      Image URL or Upload
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={proj.image || (proj as any).coverImage || ''}
                        onChange={(e) => handleUpdateProject(proj.id, 'image', e.target.value)}
                        placeholder="https://... or upload"
                        className={`flex-1 p-2 rounded-xl text-xs ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                      />
                      <label className={`p-2 rounded-xl ${theme.badgeBg} ${theme.accentText} border ${theme.cardBorder} cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 text-[11px] font-bold`}>
                        {uploadingId === proj.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(proj.id, file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={proj.description || ''}
                    onChange={(e) => handleUpdateProject(proj.id, 'description', e.target.value)}
                    placeholder="Key impact, architecture, and features delivered..."
                    className={`w-full p-2 rounded-xl text-xs ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      ) : hasProjects ? (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject && onSelectProject(project)}
              className={`group/card relative rounded-2xl overflow-hidden ${theme.cardBg} border ${theme.cardBorder} ${theme.hoverBorder} transition-all shadow-2xs hover:shadow-md cursor-pointer`}
            >
              {(project.image || (project as any).coverImage) && (
                <div className="w-full h-40 sm:h-48 overflow-hidden bg-slate-900/10">
                  <img
                    src={project.image || (project as any).coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-4 sm:p-5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-sm font-bold ${theme.textPrimary} group-hover/card:${theme.accentText} transition-colors`}>
                    {project.title}
                  </h3>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={`p-1 text-slate-400 hover:${theme.accentText} transition-colors`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {project.description && (
                  <p className={`text-xs ${theme.textSecondary} leading-relaxed`}>
                    {project.description}
                  </p>
                )}

                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${theme.badgeBg} ${theme.badgeText} border ${theme.cardBorder}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} text-center`}>
          <p className={`text-xs ${theme.textMuted}`}>
            No projects added yet.
          </p>
        </div>
      )}
    </section>
  );
}
