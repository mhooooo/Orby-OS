'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flag,
  Car,
  Trophy,
  Plane,
  Shield,
  Utensils,
  Hotel,
  ArrowUpRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Educational card components
import { FleetCard } from './FleetCard';
import { ClubRentalCard } from '@/components/ClubRentalCard';
import { AirportFastTrackCard } from './AirportFastTrackCard';
import { GolfInsuranceCard } from './GolfInsuranceCard';
import { DiningCard } from './DiningCard';
import { AccommodationCard } from './AccommodationCard';

interface ServiceItem {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  prompt: string;
  size: 'large' | 'medium' | 'small';
  modalContent: {
    headline: string;
    body: string;
    features: string[];
  };
}

const SERVICES: ServiceItem[] = [
  {
    id: 'courses',
    icon: Flag,
    title: '50+ Golf Courses',
    description: 'Championship layouts to hidden gems across 6 regions',
    gradient: 'from-emerald-500/20 to-teal-600/5',
    prompt: 'Show me golf courses in Thailand',
    size: 'large',
    modalContent: {
      headline: 'Thailand\'s Best Golf Courses',
      body: 'From world-famous championship layouts to hidden local gems, we\'ve partnered with 50+ courses across Bangkok, Phuket, Hua Hin, Pattaya, Chiang Mai, and more.',
      features: ['Championship courses', 'Scenic mountain layouts', 'Coastal ocean views', 'Night golf options'],
    },
  },
  {
    id: 'transport',
    icon: Car,
    title: 'Premium Fleet',
    description: 'Luxury transfers with professional drivers',
    gradient: 'from-blue-500/20 to-indigo-600/5',
    prompt: 'Show me your transport options',
    size: 'medium',
    modalContent: {
      headline: 'Private Transfers',
      body: 'Your own vehicle and driver for the entire trip. No shared shuttles, no waiting. From airport to hotel to courses and back.',
      features: ['VIP & VVIP vans', 'English-speaking drivers', 'Door-to-door service', 'Golf bag storage'],
    },
  },
  {
    id: 'clubs',
    icon: Trophy,
    title: 'Club Rentals',
    description: 'Top brand equipment delivered to course',
    gradient: 'from-purple-500/20 to-pink-600/5',
    prompt: 'Tell me about club rentals',
    size: 'small',
    modalContent: {
      headline: 'Premium Club Rentals',
      body: 'Play with top-tier equipment without the travel hassle. Full sets from Titleist, Callaway, and TaylorMade delivered directly to your course.',
      features: ['Full sets available', 'Delivered to course', 'Men\'s & women\'s', 'Left-handed options'],
    },
  },
  {
    id: 'airport',
    icon: Plane,
    title: 'Airport Fast-Track',
    description: 'VIP arrival with priority immigration',
    gradient: 'from-cyan-500/20 to-sky-600/5',
    prompt: 'Tell me about airport fast-track service',
    size: 'small',
    modalContent: {
      headline: 'VIP Airport Service',
      body: 'Skip the queues and start your golf trip relaxed. A personal greeter meets you at the gate and whisks you through immigration in minutes.',
      features: ['Meet at gate', 'Fast-track immigration', 'Luggage assistance', 'VIP lounge access'],
    },
  },
  {
    id: 'insurance',
    icon: Shield,
    title: 'Golf Insurance',
    description: 'Comprehensive coverage including hole-in-one',
    gradient: 'from-rose-500/20 to-red-600/5',
    prompt: 'Tell me about golf insurance',
    size: 'medium',
    modalContent: {
      headline: 'Golf Trip Insurance',
      body: 'Travel insurance designed for golfers. Covers the unique risks of a golf vacation that standard travel insurance misses.',
      features: ['Equipment protection', 'Medical emergencies', 'Trip cancellation', 'Hole-in-one bonus'],
    },
  },
  {
    id: 'dining',
    icon: Utensils,
    title: 'Dining & Nightlife',
    description: 'The best 19th holes and restaurants',
    gradient: 'from-amber-500/20 to-orange-600/5',
    prompt: 'What dining options do you recommend?',
    size: 'small',
    modalContent: {
      headline: 'Dining & Nightlife',
      body: 'We partner with top restaurants near every golf destination. From authentic Thai street food to 5-star fine dining.',
      features: ['Post-golf dinner spots', 'Group reservations', 'Local recommendations', 'Nightlife options'],
    },
  },
  {
    id: 'hotels',
    icon: Hotel,
    title: 'Accommodations',
    description: 'Partner hotels near every course',
    gradient: 'from-violet-500/20 to-purple-600/5',
    prompt: 'Tell me about hotel options',
    size: 'small',
    modalContent: {
      headline: 'Golf Accommodations',
      body: 'Stay at hand-picked hotels near your golf courses. From boutique resorts to 5-star luxury, we match accommodation to your itinerary.',
      features: ['Golf package rates', 'Course proximity', 'Resort & hotels', 'Villa options'],
    },
  },
];

export function ServiceBento() {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const handleServiceClick = (service: ServiceItem) => {
    setSelectedService(service);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-2 sm:p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4 auto-rows-[100px] sm:auto-rows-[120px]"
      >
        {SERVICES.map((service) => {
          const Icon = service.icon;
          const gridClass = service.size === 'large'
            ? 'col-span-2 sm:col-span-4 md:col-span-3 row-span-2'
            : service.size === 'medium'
              ? 'col-span-2 sm:col-span-2 md:col-span-3 row-span-2'
              : 'col-span-1 sm:col-span-2 md:col-span-2 row-span-1';

          return (
            <motion.button
              key={service.id}
              variants={itemVariants}
              onClick={() => handleServiceClick(service)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                gridClass,
                "group relative overflow-hidden rounded-cardSmall sm:rounded-card p-4 sm:p-6 text-left transition-all duration-300",
                "bg-surface-glass backdrop-blur-xl border border-white/10",
                "hover:bg-white/10 hover:border-white/20 hover:shadow-glass"
              )}
            >
              {/* Gradient Background */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                service.gradient
              )} />

              {/* Decorative Glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />

              <div className="relative h-full flex flex-col z-10">
                <div className="flex items-start justify-between mb-auto">
                  <div className={cn(
                    "p-2 sm:p-3 rounded-button sm:rounded-cardSmall bg-surface-glass backdrop-blur-md border border-white/5 group-hover:scale-110 transition-transform duration-300",
                    "group-hover:bg-white/10 group-hover:border-white/20"
                  )}>
                    <Icon size={service.size === 'small' ? 16 : 20} className="text-text-primary sm:w-6 sm:h-6" />
                  </div>
                  <ArrowUpRight
                    size={20}
                    className="text-text-muted group-hover:text-text-primary transition-all transform translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0"
                  />
                </div>

                <div className="mt-auto">
                  <h3 className={cn(
                    "font-bold text-text-primary mb-1 leading-tight",
                    service.size === 'small' ? 'text-xs sm:text-sm' : 'text-base sm:text-xl'
                  )}>
                    {service.title}
                  </h3>
                  {service.size !== 'small' && (
                    <p className="text-xs sm:text-sm text-text-muted line-clamp-2 group-hover:text-text-secondary transition-colors">
                      {service.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Service Info Modal */}
      <AnimatePresence>
        {selectedService && (
          <ServiceInfoModal
            service={selectedService}
            onClose={() => setSelectedService(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Service Info Modal Component - Uses educational cards
function ServiceInfoModal({
  service,
  onClose,
}: {
  service: ServiceItem;
  onClose: () => void;
}) {
  // Map service IDs to their corresponding educational card components
  const renderEducationalCard = () => {
    switch (service.id) {
      case 'transport':
        return <FleetCard />;
      case 'clubs':
        return <ClubRentalCard />;
      case 'airport':
        return <AirportFastTrackCard />;
      case 'insurance':
        return <GolfInsuranceCard />;
      case 'dining':
        return <DiningCard />;
      case 'hotels':
        return <AccommodationCard />;
      default:
        // For services without dedicated cards (courses), show simple info
        return null;
    }
  };

  const educationalCard = renderEducationalCard();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.5, bounce: 0.25 }}
        className="relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - floating above card */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 p-2 rounded-full bg-background-card border border-white/10 text-text-muted hover:text-white hover:bg-white/10 transition-colors shadow-lg"
        >
          <X size={18} />
        </button>

        {/* Render the educational card or fallback */}
        {educationalCard || (
          <div className="w-full max-w-lg bg-surface-glass backdrop-blur-xl border border-white/10 rounded-card p-6">
            <h2 className="text-xl font-bold text-text-primary mb-2">
              {service.modalContent.headline}
            </h2>
            <p className="text-sm text-text-secondary">
              {service.modalContent.body}
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
