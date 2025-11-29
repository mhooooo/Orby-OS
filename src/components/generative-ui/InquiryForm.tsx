'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, Loader2, Send, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';
import { cn } from '@/lib/utils';

interface InquiryFormProps {
  itinerarySnapshot?: Record<string, unknown>;
  itineraryDraftId?: string;
  onSuccess?: () => void;
  onClose?: () => void;
  demoMode?: boolean;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function InquiryForm({
  itinerarySnapshot,
  itineraryDraftId,
  onSuccess,
  onClose,
  demoMode = false,
}: InquiryFormProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<FormStatus>('idle');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  // Pre-fill from authenticated user
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    if (demoMode) {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus('success');
      onSuccess?.();
      return;
    }

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          message: message || null,
          itinerary_draft_id: itineraryDraftId || null,
          itinerary_snapshot: itinerarySnapshot || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      setStatus('success');
      onSuccess?.();
    } catch (error) {
      console.error('Inquiry submission error:', error);
      setStatus('error');
    }
  };

  // Success state
  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
        className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 text-center shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', duration: 0.6, bounce: 0.4 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]"
        >
          <CheckCircle size={40} className="text-emerald-400" />
        </motion.div>

        <h3 className="text-white text-3xl font-bold mb-3 tracking-tight">Inquiry Sent!</h3>
        <p className="text-gray-400 mb-8 text-lg font-light">
          We&apos;ll be in touch within 24 hours to help plan your perfect golf trip.
        </p>

        {onClose && (
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all border border-white/10 hover:border-white/20"
          >
            Back to browsing
          </button>
        )}
      </motion.div>
    );
  }

  // Form state
  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit}
      className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl"
    >
      <div className="mb-8">
        <h3 className="text-white text-2xl font-bold mb-2">Send Inquiry</h3>
        <p className="text-gray-400 text-sm">Fill out the form below and our team will get back to you shortly.</p>
      </div>

      <div className="space-y-5">
        {/* Name Field */}
        <div className="group">
          <label htmlFor="name" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
            Name *
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors">
              <User size={18} />
            </div>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={status === 'loading'}
              className="w-full bg-black/20 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-gray-600 border border-white/5 focus:border-emerald-500/50 focus:bg-black/40 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Your full name"
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="group">
          <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
            Email *
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors">
              <Mail size={18} />
            </div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === 'loading'}
              className="w-full bg-black/20 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-gray-600 border border-white/5 focus:border-emerald-500/50 focus:bg-black/40 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="you@example.com"
            />
          </div>
        </div>

        {/* Phone Field */}
        <div className="group">
          <label htmlFor="phone" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
            Phone <span className="text-gray-600 font-normal lowercase">(optional)</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors">
              <Phone size={18} />
            </div>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={status === 'loading'}
              className="w-full bg-black/20 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-gray-600 border border-white/5 focus:border-emerald-500/50 focus:bg-black/40 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="+66 or your country code"
            />
          </div>
        </div>

        {/* Message Field */}
        <div className="group">
          <label htmlFor="message" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
            Message <span className="text-gray-600 font-normal lowercase">(optional)</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-6 text-gray-500 group-focus-within:text-emerald-400 transition-colors">
              <MessageSquare size={18} />
            </div>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={status === 'loading'}
              rows={4}
              className="w-full bg-black/20 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-gray-600 border border-white/5 focus:border-emerald-500/50 focus:bg-black/40 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              placeholder="Any special requests or dietary requirements?"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-center"
        >
          Failed to submit inquiry. Please try again.
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={status === 'loading'}
            className="flex-1 px-6 py-4 rounded-xl bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/5 hover:border-white/10"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex-[2] px-6 py-4 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          {status === 'loading' ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span>Submit Inquiry</span>
              <Send size={18} />
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}
