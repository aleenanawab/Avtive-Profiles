'use client';

import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { ProjectItem } from '../types/profile';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectItem | null;
}

export function ProjectDetailModal({ isOpen, onClose, project }: ProjectDetailModalProps) {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 text-left">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[32px] bg-white dark:bg-[#0A1128] border border-[#E2E8F0] dark:border-white/10 shadow-2xl p-6 space-y-5 transition-colors">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0A1128]/10 dark:bg-white/10 text-[#0A1128] dark:text-white border border-[#E2E8F0] dark:border-white/15 font-mono">
            {project.category}
          </span>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#94A3B8] hover:text-[#0A1128] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#152238] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Cover Image */}
        {project.coverImage && (
          <div className="relative h-56 w-full rounded-2xl overflow-hidden shadow-md bg-[#0A1128]">
            <img
              src={project.coverImage}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Project Content */}
        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-extrabold text-[#0A1128] dark:text-white">
              {project.title}
            </h2>
            {project.tagline && (
              <p className="text-xs text-[#1E3A8A] dark:text-[#7EC384] font-semibold mt-0.5">
                {project.tagline}
              </p>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">
            {project.description}
          </p>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-white/10 text-xs">
            {project.client && (
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#94A3B8] font-mono">CLIENT</span>
                <p className="font-bold text-[#0A1128] dark:text-white">{project.client}</p>
              </div>
            )}
            {project.year && (
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#94A3B8] font-mono">TIMELINE</span>
                <p className="font-bold text-[#0A1128] dark:text-white">{project.year}</p>
              </div>
            )}
            {project.technology && (
              <div className="col-span-2 space-y-0.5 border-t border-[#E2E8F0] dark:border-white/10 pt-2 mt-1">
                <span className="text-[10px] text-[#94A3B8] font-mono">CORE STACK</span>
                <p className="font-bold text-[#0A1128] dark:text-white">{project.technology}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {project.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F8FAFC] dark:bg-[#152238] text-[#0A1128] dark:text-white border border-[#E2E8F0] dark:border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {project.liveUrl && (
            <div className="pt-3">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0A1128] hover:bg-[#152238] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#0A1128] font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                <span>Visit Live Platform</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
