'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Car, Plane, Check, Users, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogisticsCardProps {
  airportTransfers: boolean;
  vehicleType: 'vip-van' | 'vvip-van';
  onTransfersChange: (enabled: boolean) => void;
  onVehicleChange: (type: 'vip-van' | 'vvip-van') => void;
  className?: string;
}

export function LogisticsCard({
  airportTransfers,
  vehicleType,
  onTransfersChange,
  onVehicleChange,
  className,
}: LogisticsCardProps) {
  const vehicles = [
    {
      id: 'vip-van',
      type: 'VIP Van',
      model: 'Toyota Alphard',
      capacity: 6,
      luggage: 6,
      amenities: ['WiFi & Charging Ports', 'Bottled Water', 'Professional Driver'],
      pricePerDay: 4500,
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop',
    },
    {
      id: 'vvip-van',
      type: 'VVIP Van',
      model: 'Mercedes V-Class',
      capacity: 6,
      luggage: 6,
      amenities: ['Premium Leather Seats', 'WiFi & Entertainment', 'Complimentary Refreshments'],
      pricePerDay: 6500,
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop',
    },
  ];

  return (
    <motion.div
      className={cn(
        'relative w-full rounded-card overflow-hidden',
        'bg-surface-glass backdrop-blur-xl border border-white/10',
        'shadow-glass',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Decorative Elements - z-index below content */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-coralMuted rounded-full blur-[80px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-cyanMuted rounded-full blur-[80px] pointer-events-none z-0" />

      {/* Header */}
      <div className="relative z-10 p-4 sm:p-6 lg:p-8 border-b border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-button bg-accent-coralMuted text-accent-coral">
            <Car size={20} className="sm:w-6 sm:h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
            Transport & Logistics
          </h2>
        </div>
        <p className="text-text-muted text-xs sm:text-sm pl-11 sm:pl-12">
          Choose your vehicle and configure airport transfer options.
        </p>
      </div>

      {/* Vehicle Grid */}
      <div className="relative z-10 p-4 sm:p-6 lg:p-8 grid gap-4 sm:gap-6 md:grid-cols-2">
        {vehicles.map((vehicle, index) => (
          <motion.div
            key={vehicle.id}
            className={cn(
              'group relative rounded-card overflow-hidden border transition-all duration-300 cursor-pointer',
              vehicleType === vehicle.id
                ? 'bg-white/10 border-accent-coral/50 shadow-glow-coral'
                : 'bg-surface-glass border-white/5 hover:bg-white/10 hover:border-white/20'
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onVehicleChange(vehicle.id as 'vip-van' | 'vvip-van')}
          >
            {/* Selection Indicator */}
            <div
              className={cn(
                'absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors z-10',
                vehicleType === vehicle.id
                  ? 'bg-accent-coral border-accent-coral shadow-glow-coral'
                  : 'border-white/30 bg-black/20 backdrop-blur-md'
              )}
            >
              {vehicleType === vehicle.id && (
                <Check size={14} className="text-text-primary" />
              )}
            </div>

            {/* Image Area */}
            <div className="relative h-40 sm:h-48 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${vehicle.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background-base via-transparent to-transparent opacity-80" />

              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-white/20 backdrop-blur-md text-text-primary border border-white/10 mb-2 inline-block">
                  {vehicle.type}
                </span>
                <h3 className="text-xl font-bold text-text-primary leading-none">
                  {vehicle.model}
                </h3>
              </div>
            </div>

            {/* Details */}
            <div className="p-4 sm:p-5">
              <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div className="flex items-center gap-2 text-text-muted text-xs font-medium bg-surface-glass px-3 py-1.5 rounded-lg border border-white/5">
                  <Users size={14} className="text-text-muted" />
                  <span>{vehicle.capacity} Pax</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted text-xs font-medium bg-surface-glass px-3 py-1.5 rounded-lg border border-white/5">
                  <Briefcase size={14} className="text-text-muted" />
                  <span>{vehicle.luggage} Bags</span>
                </div>
              </div>

              <div className="space-y-2 mb-5">
                {vehicle.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 text-xs text-text-secondary"
                  >
                    <div className="w-1 h-1 rounded-full bg-accent-cyan" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-end justify-between pt-4 border-t border-white/5">
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">
                    Daily Rate
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-accent-gold">
                      ฿{vehicle.pricePerDay.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Airport Transfer Toggle */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
        <motion.div
          className="rounded-card bg-surface-glass border border-white/10 p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-cardSmall bg-accent-cyanMuted flex items-center justify-center shadow-lg shadow-accent-cyan/10">
                <Plane size={24} className="text-accent-cyan" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-text-primary">
                  Airport Transfers
                </h4>
                <p className="text-sm text-text-muted">
                  Include pickup and drop-off at the airport
                </p>
              </div>
            </div>
            <ToggleSwitch
              enabled={airportTransfers}
              onChange={() => onTransfersChange(!airportTransfers)}
            />
          </div>

          {/* Airport Transfer Details */}
          <motion.div
            initial={false}
            animate={{
              height: airportTransfers ? 'auto' : 0,
              opacity: airportTransfers ? 1 : 0,
            }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <div className="w-1 h-1 rounded-full bg-accent-cyan" />
                <span>Meet & greet at arrivals with name sign</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <div className="w-1 h-1 rounded-full bg-accent-cyan" />
                <span>Flight tracking for delays</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <div className="w-1 h-1 rounded-full bg-accent-cyan" />
                <span>Assistance with luggage</span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-[10px] text-text-muted uppercase tracking-wider">
                  One-way:
                </span>
                <span className="text-sm font-bold text-accent-gold ml-2">
                  ฿1,800
                </span>
                <span className="text-[10px] text-text-muted ml-4 uppercase tracking-wider">
                  Round-trip:
                </span>
                <span className="text-sm font-bold text-accent-gold ml-2">
                  ฿3,200
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Toggle Switch Component
function ToggleSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={cn(
        'relative w-14 h-8 rounded-full transition-all duration-300',
        enabled ? 'bg-accent-coral shadow-glow-coral' : 'bg-white/10 hover:bg-white/20'
      )}
    >
      <motion.div
        className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm"
        animate={{
          left: enabled ? '28px' : '4px',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
