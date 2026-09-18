'use client';

import React from 'react';
import { ArrowRight, Pencil } from 'lucide-react';
import { ProfileData, ProjectItem } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface PortfolioSectionProps {
  profile: ProfileData;
  onSelectProject?: (project: ProjectItem) => void;
  theme?: ThemeConfig;
  canEdit?: boolean;
  onSelectSection?: (sectionKey: string, fieldKey?: string) => void;
}

export function PortfolioSection({ 
  profile, 
  onSelectProject, 
  theme = getThemeConfig(profile.theme || 'elegant'),
  canEdit = false,
  onSelectSection
}: PortfolioSectionProps) {
  if (!profile.projects || profile.projects.length === 0) {
    return null;
  }

  return (
    <section className={`relative group/port px-6 sm:px-8 py-5 space-y-4 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors ${
      canEdit && onSelectSection ? 'hover:bg-accent/5 transition-all' : ''
    }`}>
      {/* Interactive section edit badge */}
      {canEdit && onSelectSection && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectSection('projects');
          }}
          className="absolute top-4 right-6 opacity-0 group-hover/port:opacity-100 transition-opacity bg-primary text-primary-foreground text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 hover:scale-105 z-10 cursor-pointer"
          title="Edit Projects in Sliding Editor"
        >
          <Pencil className="w-3 h-3" />
          <span>Edit Projects</span>
        </button>
      )}

      <div className="flex items-center justify-between">
        <div 
          className={`flex items-center gap-2 ${canEdit && onSelectSection ? 'cursor-pointer' : ''}`}
          onClick={() => canEdit && onSelectSection?.('projects')}
        >
          <h2 className={`text-sm font-bold tracking-tight ${theme.textPrimary}`}>
            Projects
          </h2>
          {canEdit && onSelectSection && (
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
              Click to edit
            </span>
          )}
        </div>
        <span 
          onClick={(e) => {
            if (canEdit && onSelectSection) {
              e.stopPropagation();
              onSelectSection('projects');
            }
          }}
          className={`text-xs ${theme.accentText} font-medium flex items-center gap-1 hover:underline cursor-pointer`}
        >
          {canEdit ? 'Manage' : 'View All'} <ArrowRight className="w-3 h-3" />
        </span>
      </div>

      {/* Visual Project Cards */}
      <div className="space-y-4">
        {profile.projects.map((project) => (
          <div
            key={project.id}
            onClick={() => {
              if (canEdit && onSelectSection) {
                onSelectSection('projects', project.id);
              } else if (onSelectProject) {
                onSelectProject(project);
              }
            }}
            className={`group/card relative cursor-pointer rounded-2xl overflow-hidden ${theme.cardBg} border ${theme.cardBorder} ${
              canEdit && onSelectSection ? 'hover:border-primary/60 hover:ring-2 hover:ring-primary/20' : theme.hoverBorder
            } transition-all shadow-2xs hover:shadow-md`}
          >
            {canEdit && onSelectSection && (
              <div className="absolute top-3 right-3 z-10 opacity-0 group-hover/card:opacity-100 transition-opacity">
                <span className="bg-primary/95 backdrop-blur-xs text-primary-foreground text-[10px] font-semibold px-2 py-1 rounded-full shadow flex items-center gap-1">
                  <Pencil className="w-2.5 h-2.5" />
                  Edit Project
                </span>
              </div>
            )}
            {/* Visual Project Image - Clean, no dark washes */}
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

            {/* Project Content */}
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

              {/* Tags */}
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

              {/* View Project Action */}
              <div className={`pt-2 border-t ${theme.divider} flex items-center justify-between text-xs font-bold ${theme.textPrimary}`}>
                <span>View Project</span>
                <ArrowRight className={`w-3.5 h-3.5 group-hover:translate-x-1 transition-transform ${theme.accentText}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
