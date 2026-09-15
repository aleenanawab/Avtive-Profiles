'use client';

import React, { useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Globe, 
  ExternalLink, 
  ArrowUp, 
  ArrowDown, 
  Sparkles,
  ShoppingBag,
  FileText,
  Code2,
  Calendar,
  Briefcase
} from 'lucide-react';
import { ProfileLink } from '@/types/profile';
import { 
  LinkedInIcon, 
  GithubIcon, 
  InstagramIcon, 
  TwitterIcon, 
  YoutubeIcon 
} from '@/components/BrandIcons';

interface LinkManagerProps {
  links: ProfileLink[];
  onChange: (updatedLinks: ProfileLink[]) => void;
}

const ICON_OPTIONS = [
  { id: 'website', label: 'Website', icon: Globe },
  { id: 'github', label: 'GitHub', icon: GithubIcon },
  { id: 'linkedin', label: 'LinkedIn', icon: LinkedInIcon },
  { id: 'twitter', label: 'Twitter / X', icon: TwitterIcon },
  { id: 'instagram', label: 'Instagram', icon: InstagramIcon },
  { id: 'youtube', label: 'YouTube', icon: YoutubeIcon },
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
  { id: 'store', label: 'Store', icon: ShoppingBag },
  { id: 'document', label: 'Resume / Doc', icon: FileText },
  { id: 'code', label: 'Code', icon: Code2 }
];

function LinkItemCard({
  link,
  index,
  total,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}: {
  link: ProfileLink;
  index: number;
  total: number;
  onUpdate: (updated: Partial<ProfileLink>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const dragControls = useDragControls();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <Reorder.Item
      value={link}
      id={link.id}
      dragListener={false}
      dragControls={dragControls}
      className={`group relative rounded-2xl border transition-all duration-200 p-4 sm:p-5 shadow-xs bg-white dark:bg-[#18181B] ${
        link.visible !== false 
          ? 'border-slate-200 dark:border-zinc-800' 
          : 'border-slate-200/60 dark:border-zinc-800/60 opacity-60 bg-slate-50/50 dark:bg-zinc-900/40'
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Drag Handle & Reorder buttons */}
        <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
          <button
            type="button"
            onPointerDown={(e) => dragControls.start(e)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-grab active:cursor-grabbing transition-colors"
            title="Drag to reorder"
            aria-label="Drag handle"
          >
            <GripVertical className="w-5 h-5" />
          </button>

          {/* Accessible Move Up / Move Down */}
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={index === 0}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 disabled:opacity-20 disabled:hover:bg-transparent transition-opacity"
              title="Move link up"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={index === total - 1}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 disabled:opacity-20 disabled:hover:bg-transparent transition-opacity"
              title="Move link down"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Link Fields Form */}
        <div className="flex-1 min-w-0 space-y-3">
          
          {/* Title & Visibility Row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={link.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Link Title (e.g. My GitHub Repositories)"
                className="w-full text-sm font-semibold text-slate-900 dark:text-white bg-transparent border-0 border-b border-transparent hover:border-slate-300 dark:hover:border-zinc-700 focus:border-slate-900 dark:focus:border-white focus:outline-hidden py-1 px-0 transition-colors"
              />
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onUpdate({ visible: link.visible === false })}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  link.visible !== false
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                }`}
                title={link.visible !== false ? 'Link visible on public profile' : 'Link hidden from public profile'}
              >
                {link.visible !== false ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visible</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hidden</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* URL Input */}
          <div className="relative">
            <input
              type="url"
              value={link.url}
              onChange={(e) => onUpdate({ url: e.target.value })}
              placeholder="https://example.com"
              className="w-full text-xs sm:text-sm text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 pr-8 focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all"
            />
            {link.url && (
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                title="Test URL"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Icon Selector & Actions */}
          <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none max-w-full">
              <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 mr-1 shrink-0">
                Icon:
              </span>
              {ICON_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = (link.icon || 'website').toLowerCase() === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onUpdate({ icon: opt.id })}
                    className={`p-1.5 rounded-lg text-xs transition-all shrink-0 ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs scale-105'
                        : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                    title={opt.label}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>

            {/* Delete button */}
            <div className="shrink-0 ml-auto">
              {showDeleteConfirm ? (
                <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                  <span className="text-xs text-rose-600 font-medium">Delete?</span>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Delete link"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </Reorder.Item>
  );
}

export function LinkManager({ links, onChange }: LinkManagerProps) {
  const handleReorder = (newOrder: ProfileLink[]) => {
    const updated = newOrder.map((l, idx) => ({ ...l, order: idx + 1 }));
    onChange(updated);
  };

  const handleAddLink = () => {
    const newLink: ProfileLink = {
      id: `link-${Date.now()}`,
      title: 'New Link',
      url: 'https://',
      icon: 'website',
      visible: true,
      order: links.length + 1
    };
    onChange([...links, newLink]);
  };

  const handleUpdateLink = (id: string, patch: Partial<ProfileLink>) => {
    const updated = links.map((l) => (l.id === id ? { ...l, ...patch } : l));
    onChange(updated);
  };

  const handleDeleteLink = (id: string) => {
    const filtered = links.filter((l) => l.id !== id);
    const reordered = filtered.map((l, idx) => ({ ...l, order: idx + 1 }));
    onChange(reordered);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const copy = [...links];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    handleReorder(copy);
  };

  return (
    <div className="w-full space-y-5">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Links & Content
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Add, edit, reorder, or toggle visibility for links on your profile.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddLink}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black text-xs sm:text-sm font-semibold shadow-sm transition-all duration-150 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Link</span>
        </button>
      </div>

      {/* Reorderable List */}
      {links.length > 0 ? (
        <Reorder.Group
          axis="y"
          values={links}
          onReorder={handleReorder}
          className="space-y-3"
        >
          {links.map((link, index) => (
            <LinkItemCard
              key={link.id}
              link={link}
              index={index}
              total={links.length}
              onUpdate={(patch) => handleUpdateLink(link.id, patch)}
              onDelete={() => handleDeleteLink(link.id)}
              onMoveUp={() => handleMove(index, 'up')}
              onMoveDown={() => handleMove(index, 'down')}
            />
          ))}
        </Reorder.Group>
      ) : (
        <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30">
          <Globe className="w-8 h-8 mx-auto text-slate-400 dark:text-zinc-600 mb-2" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
            No links added yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto mt-1 mb-4">
            Add links to your portfolio, projects, store, or social profiles.
          </p>
          <button
            type="button"
            onClick={handleAddLink}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Link
          </button>
        </div>
      )}

      {/* Helpful Hint */}
      {links.length > 1 && (
        <p className="text-[11px] text-slate-400 dark:text-zinc-500 text-center flex items-center justify-center gap-1 pt-2">
          <GripVertical className="w-3.5 h-3.5" />
          Drag the handle or use arrows to rearrange links. Changes appear live on the right.
        </p>
      )}
    </div>
  );
}
