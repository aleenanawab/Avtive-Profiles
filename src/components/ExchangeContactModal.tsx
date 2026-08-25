'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, User, Mail, Phone, Building2, Send, UserPlus } from 'lucide-react';
import { ProfileData } from '../types/profile';

interface ExchangeContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
  onSuccess: (lead: { name: string; email: string; phone?: string; company?: string; note?: string }) => void;
}

export function ExchangeContactModal({ isOpen, onClose, profile, onSuccess }: ExchangeContactModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    note: ''
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0A1128', '#1E3A8A', '#7EC384']
      });
    } catch (err) {
      console.error(err);
    }

    onSuccess(formData);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', company: '', note: '' });
      onClose();
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 text-left">
      <div className="relative w-full max-w-sm rounded-[32px] bg-white dark:bg-[#0A1128] border border-[#E2E8F0] dark:border-white/10 shadow-2xl p-6 space-y-4 transition-colors">
        {/* Header with Avatar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#E2E8F0] dark:border-white/20 shrink-0">
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#0A1128] dark:text-white">
                Connect with {profile.name}
              </h3>
              <p className="text-[10px] text-[#94A3B8] font-medium">{profile.company || 'Avtive'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#94A3B8] hover:text-[#0A1128] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#152238] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#0A1128]/10 dark:bg-white/10 text-[#0A1128] dark:text-white mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-[#7EC384]" />
            </div>
            <h4 className="text-sm font-bold text-[#0A1128] dark:text-white">
              Details Shared Successfully!
            </h4>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
              {profile.name} has received your contact details.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
              Leave your details to establish a direct connection with {profile.name}.
            </p>

            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="text"
                  required
                  placeholder="Your Full Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#152238] border border-[#E2E8F0] dark:border-white/10 text-xs text-[#0A1128] dark:text-white focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="email"
                  required
                  placeholder="Your Email Address *"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#152238] border border-[#E2E8F0] dark:border-white/10 text-xs text-[#0A1128] dark:text-white focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="tel"
                  placeholder="Phone Number (Optional)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#152238] border border-[#E2E8F0] dark:border-white/10 text-xs text-[#0A1128] dark:text-white focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Company / Organization"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#152238] border border-[#E2E8F0] dark:border-white/10 text-xs text-[#0A1128] dark:text-white focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#0A1128] hover:bg-[#152238] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#0A1128] font-bold text-xs shadow-xs transition-all active:scale-95 mt-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Share Contact Details</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
