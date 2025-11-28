'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Check } from 'lucide-react';
import { useState } from 'react';

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerReason?: 'save_course' | 'save_itinerary' | 'book_intent';
}

export default function AuthGateModal({ isOpen, onClose, triggerReason }: AuthGateModalProps) {
  const { signIn, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn();
    } catch (error) {
      console.error('Sign in error:', error);
      setIsSigningIn(false);
    }
  };

  const benefits = [
    'Save favorite courses',
    'Keep itinerary drafts',
    'Get personalized recommendations',
    'Access exclusive deals',
  ];

  // Customize heading based on trigger reason
  const getHeading = () => {
    switch (triggerReason) {
      case 'save_course':
        return 'Save this course?';
      case 'save_itinerary':
        return 'Save your itinerary?';
      case 'book_intent':
        return 'Ready to book?';
      default:
        return 'Save your golf trip?';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            className="w-full max-w-md bg-[#1E1F20]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Heading */}
            <h2 className="text-white text-2xl font-bold mb-6 text-center">
              {getHeading()}
            </h2>

            {/* Benefits List */}
            <div className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 text-gray-300"
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00D4FF]/20 flex items-center justify-center">
                    <Check size={14} className="text-[#00D4FF]" />
                  </div>
                  <span className="text-sm">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* Primary CTA - Continue with Google */}
            <button
              onClick={handleSignIn}
              disabled={isSigningIn || loading}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#0095FF] text-white font-semibold text-sm hover:shadow-lg hover:shadow-[#00D4FF]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-3"
            >
              {isSigningIn ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Ghost button - Maybe later */}
            <button
              onClick={onClose}
              disabled={isSigningIn}
              className="w-full py-3 text-gray-400 text-sm font-medium hover:text-white transition-colors disabled:opacity-50"
            >
              Maybe later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Google Icon SVG
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
        fill="#EA4335"
      />
    </svg>
  );
}
