'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';

interface InquiryFormProps {
  itinerarySnapshot?: Record<string, unknown>;
  itineraryDraftId?: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function InquiryForm({
  itinerarySnapshot,
  itineraryDraftId,
  onSuccess,
  onClose,
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
        className="bg-[#1E1F20] rounded-3xl p-8 border border-white/10 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', duration: 0.6, bounce: 0.4 }}
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00D4FF]/20 flex items-center justify-center"
        >
          <CheckCircle size={32} className="text-[#00D4FF]" />
        </motion.div>

        <h3 className="text-white text-2xl font-bold mb-2">Inquiry Submitted!</h3>
        <p className="text-gray-400 mb-6">
          We&apos;ll be in touch within 24 hours to help plan your perfect golf trip.
        </p>

        {onClose && (
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-full bg-[#282A2C] text-white font-medium text-sm hover:bg-[#323437] transition-colors"
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
      className="bg-[#1E1F20] rounded-3xl p-6 border border-white/10"
    >
      <h3 className="text-white text-xl font-bold mb-6">Send Inquiry</h3>

      {/* Name Field */}
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm text-gray-400 mb-1">
          Name *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={status === 'loading'}
          className="w-full bg-[#282A2C] rounded-xl px-4 py-3 text-white placeholder:text-gray-500 border border-transparent focus:border-[#00D4FF]/50 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Your full name"
        />
      </div>

      {/* Email Field */}
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm text-gray-400 mb-1">
          Email *
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === 'loading'}
          className="w-full bg-[#282A2C] rounded-xl px-4 py-3 text-white placeholder:text-gray-500 border border-transparent focus:border-[#00D4FF]/50 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="you@example.com"
        />
      </div>

      {/* Phone Field */}
      <div className="mb-4">
        <label htmlFor="phone" className="block text-sm text-gray-400 mb-1">
          Phone <span className="text-gray-500 text-xs">(optional)</span>
        </label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={status === 'loading'}
          className="w-full bg-[#282A2C] rounded-xl px-4 py-3 text-white placeholder:text-gray-500 border border-transparent focus:border-[#00D4FF]/50 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="+66 or your country code"
        />
      </div>

      {/* Message Field */}
      <div className="mb-6">
        <label htmlFor="message" className="block text-sm text-gray-400 mb-1">
          Message <span className="text-gray-500 text-xs">(optional)</span>
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={status === 'loading'}
          rows={4}
          className="w-full bg-[#282A2C] rounded-xl px-4 py-3 text-white placeholder:text-gray-500 border border-transparent focus:border-[#00D4FF]/50 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          placeholder="Any special requests or dietary requirements?"
        />
      </div>

      {/* Error Message */}
      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-xl bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 text-[#FF3B3B] text-sm"
        >
          Failed to submit inquiry. Please try again.
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={status === 'loading'}
            className="flex-1 px-6 py-3 rounded-full bg-[#282A2C] text-white font-medium text-sm hover:bg-[#323437] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#0095FF] text-white font-semibold text-sm hover:shadow-lg hover:shadow-[#00D4FF]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            'Submit Inquiry'
          )}
        </button>
      </div>
    </motion.form>
  );
}
