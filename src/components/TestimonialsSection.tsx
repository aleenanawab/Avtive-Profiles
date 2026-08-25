'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { ProfileData } from '../types/profile';

interface TestimonialsSectionProps {
  profile: ProfileData;
}

export function TestimonialsSection({ profile }: TestimonialsSectionProps) {
  if (!profile.testimonials || profile.testimonials.length === 0) {
    return null;
  }

  return (
    <section className="px-6 sm:px-8 py-5 space-y-3.5 text-left bg-white dark:bg-[#0A1128] border-b border-[#E2E8F0] dark:border-white/10 transition-colors">
      <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A1128] dark:text-white/80 font-mono">
        Testimonials
      </h2>

      <div className="space-y-3">
        {profile.testimonials.map((item) => (
          <div
            key={item.id}
            className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-white/10 space-y-3 shadow-2xs"
          >
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed italic font-normal">
              “{item.quote}”
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] dark:border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt={item.author}
                  className="w-9 h-9 rounded-full object-cover border border-[#E2E8F0] dark:border-white/10"
                />
                <div>
                  <h4 className="text-xs font-bold text-[#0A1128] dark:text-white">
                    {item.author}
                  </h4>
                  <p className="text-[10px] text-[#475569] dark:text-[#94A3B8] font-medium">
                    {item.designation} • {item.company}
                  </p>
                </div>
              </div>

              {item.rating && (
                <div className="flex items-center gap-0.5 text-[#7EC384]">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
