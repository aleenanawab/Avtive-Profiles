'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ProfileData, ProjectItem } from '../types/profile';

interface PortfolioSectionProps {
  profile: ProfileData;
  onSelectProject?: (project: ProjectItem) => void;
}

export function PortfolioSection({ profile, onSelectProject }: PortfolioSectionProps) {
  if (!profile.projects || profile.projects.length === 0) {
    return null;
  }

  return (
    <section className="px-6 sm:px-8 py-5 space-y-4 text-left bg-white dark:bg-[#0A1128] border-b border-[#E2E8F0] dark:border-white/10 transition-colors">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A1128] dark:text-white/80 font-mono">
          Selected Work
        </h2>
        <span className="text-[11px] text-[#94A3B8] font-semibold">
          {profile.projects.length} {profile.projects.length === 1 ? 'Project' : 'Projects'}
        </span>
      </div>

      {/* Visual Project Cards */}
      <div className="space-y-4">
        {profile.projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelectProject && onSelectProject(project)}
            className="group cursor-pointer rounded-2xl overflow-hidden bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-white/10 hover:border-[#1E3A8A] dark:hover:border-white/20 transition-all shadow-2xs hover:shadow-md"
          >
            {/* Visual Project Image */}
            {project.coverImage && (
              <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-[#0A1128]">
                <img
                  src={project.coverImage}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0A1128] text-white border border-white/20 shadow-xs">
                    {project.category}
                  </span>
                </div>
              </div>
            )}

            {/* Project Content */}
            <div className="p-4 sm:p-5 space-y-2.5">
              <div>
                {!project.coverImage && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0A1128]/10 dark:bg-white/10 text-[#0A1128] dark:text-white mb-2 font-mono">
                    {project.category}
                  </span>
                )}
                <h3 className="text-base font-bold text-[#0A1128] dark:text-white group-hover:text-[#1E3A8A] dark:group-hover:text-[#7EC384] transition-colors">
                  {project.title}
                </h3>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed mt-1">
                  {project.description}
                </p>
              </div>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {project.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white dark:bg-[#152238] text-[#475569] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* View Project Action */}
              <div className="pt-2 border-t border-[#E2E8F0] dark:border-white/10 flex items-center justify-between text-xs font-bold text-[#0A1128] dark:text-white">
                <span>View Project</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
