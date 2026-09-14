'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ProfileData, ProjectItem } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface PortfolioSectionProps {
  profile: ProfileData;
  onSelectProject?: (project: ProjectItem) => void;
  theme?: ThemeConfig;
}

export function PortfolioSection({ 
  profile, 
  onSelectProject, 
  theme = getThemeConfig(profile.theme || 'elegant') 
}: PortfolioSectionProps) {
  if (!profile.projects || profile.projects.length === 0) {
    return null;
  }

  return (
    <section className={`px-6 sm:px-8 py-5 space-y-4 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors`}>
      <div className="flex items-center justify-between">
        <h2 className={`text-sm font-bold tracking-tight ${theme.textPrimary}`}>
          Projects
        </h2>
        <span className={`text-xs ${theme.accentText} font-medium flex items-center gap-1 hover:underline cursor-pointer`}>
          View All <ArrowRight className="w-3 h-3" />
        </span>
      </div>

      {/* Visual Project Cards */}
      <div className="space-y-4">
        {profile.projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelectProject && onSelectProject(project)}
            className={`group cursor-pointer rounded-2xl overflow-hidden ${theme.cardBg} border ${theme.cardBorder} ${theme.hoverBorder} transition-all shadow-2xs hover:shadow-md`}
          >
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
