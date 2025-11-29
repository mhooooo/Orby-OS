'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Car, Plane, Wallet, Check } from 'lucide-react';
import { useItinerary } from '@/context/ItineraryContext';
import { cn } from '@/lib/utils';

export function LogisticsStep() {
  const { state, dispatch, toggleTransfers, toggleCaddieTips } = useItinerary();
  const { transfers, includeCaddieTips } = state.draft;

  const handleVehicleChange = (type: 'sedan' | 'vip-van') => {
    dispatch({ type: 'SET_TRANSFERS', payload: { vehicleType: type } });
  };

  const handleAirportToggle = () => {
    dispatch({
      type: 'SET_TRANSFERS',
      payload: { includesAirportPickup: !transfers.includesAirportPickup },
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">Logistics & Extras</h3>
        <p className="text-gray-400">
          Customize your transport and service options
        </p>
      </div>

      {/* Transfers Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 p-8 shadow-lg"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center shadow-lg shadow-orange-500/10">
              <Car size={24} className="text-orange-400" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Course Transfers</h4>
              <p className="text-sm text-gray-400">Daily transport to/from courses</p>
            </div>
          </div>
          <ToggleSwitch
            enabled={transfers.enabled}
            onChange={() => toggleTransfers(!transfers.enabled)}
          />
        </div>

        <motion.div
          initial={false}
          animate={{
            height: transfers.enabled ? 'auto' : 0,
            opacity: transfers.enabled ? 1 : 0
          }}
          className="overflow-hidden"
        >
          <div className="space-y-4 pt-2">
            {/* Vehicle Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleVehicleChange('sedan')}
                className={cn(
                  'relative p-4 rounded-2xl border text-left transition-all duration-300 group',
                  transfers.vehicleType === 'sedan'
                    ? 'bg-orange-500/10 border-orange-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-white">Sedan</div>
                  {transfers.vehicleType === 'sedan' && (
                    <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                      <Check size={12} className="text-black" />
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400 mb-2">Up to 3 golfers</div>
                <div className="text-sm font-bold text-orange-400">฿2,500/day</div>
              </button>

              <button
                onClick={() => handleVehicleChange('vip-van')}
                className={cn(
                  'relative p-4 rounded-2xl border text-left transition-all duration-300 group',
                  transfers.vehicleType === 'vip-van'
                    ? 'bg-orange-500/10 border-orange-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-white">VIP Van</div>
                  {transfers.vehicleType === 'vip-van' && (
                    <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                      <Check size={12} className="text-black" />
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400 mb-2">Up to 8 golfers</div>
                <div className="text-sm font-bold text-orange-400">฿4,500/day</div>
              </button>
            </div>

            {/* Airport Pickup */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Plane size={16} className="text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-200">Include airport pickup</span>
              </div>
              <ToggleSwitch
                enabled={transfers.includesAirportPickup}
                onChange={handleAirportToggle}
                small
              />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Caddie Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[2rem] bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 p-8 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Wallet size={24} className="text-emerald-400" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Pre-paid Caddie Tips</h4>
              <p className="text-sm text-gray-400">
                ฿400/round included in estimate
              </p>
            </div>
          </div>
          <ToggleSwitch
            enabled={includeCaddieTips}
            onChange={() => toggleCaddieTips(!includeCaddieTips)}
          />
        </div>
      </motion.div>
    </div>
  );
}

// Toggle Switch Component
function ToggleSwitch({
  enabled,
  onChange,
  small = false,
}: {
  enabled: boolean;
  onChange: () => void;
  small?: boolean;
}) {
  return (
    <button
      onClick={onChange}
      className={cn(
        'relative rounded-full transition-all duration-300',
        small ? 'w-10 h-6' : 'w-14 h-8',
        enabled ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-white/10 hover:bg-white/20'
      )}
    >
      <motion.div
        className={cn(
          'absolute top-1 rounded-full bg-white shadow-sm',
          small ? 'w-4 h-4' : 'w-6 h-6'
        )}
        animate={{
          left: enabled ? (small ? '20px' : '28px') : '4px',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
