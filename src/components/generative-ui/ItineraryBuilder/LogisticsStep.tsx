'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Car, Plane, Wallet } from 'lucide-react';
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
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-white">Logistics & Extras</h3>
        <p className="text-sm text-gray-400 mt-1">
          Customize your transport and service options
        </p>
      </div>

      {/* Transfers Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-[#282A2C] p-4 border border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/20 flex items-center justify-center">
              <Car size={20} className="text-[#FF6B35]" />
            </div>
            <div>
              <h4 className="font-medium text-white">Course Transfers</h4>
              <p className="text-xs text-gray-400">Daily transport to/from courses</p>
            </div>
          </div>
          <ToggleSwitch
            enabled={transfers.enabled}
            onChange={() => toggleTransfers(!transfers.enabled)}
          />
        </div>

        {transfers.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-3 border-t border-gray-700"
          >
            {/* Vehicle Type Selection */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleVehicleChange('sedan')}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all',
                  transfers.vehicleType === 'sedan'
                    ? 'border-[#FF6B35] bg-[#FF6B35]/10'
                    : 'border-gray-600 hover:border-gray-500'
                )}
              >
                <div className="font-medium text-white text-sm">Sedan</div>
                <div className="text-xs text-gray-400">Up to 3 golfers</div>
                <div className="text-xs text-[#FF6B35] mt-1">฿2,500/day</div>
              </button>
              <button
                onClick={() => handleVehicleChange('vip-van')}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all',
                  transfers.vehicleType === 'vip-van'
                    ? 'border-[#FF6B35] bg-[#FF6B35]/10'
                    : 'border-gray-600 hover:border-gray-500'
                )}
              >
                <div className="font-medium text-white text-sm">VIP Van</div>
                <div className="text-xs text-gray-400">Up to 8 golfers</div>
                <div className="text-xs text-[#FF6B35] mt-1">฿4,500/day</div>
              </button>
            </div>

            {/* Airport Pickup */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1E1F20]">
              <div className="flex items-center gap-2">
                <Plane size={16} className="text-gray-400" />
                <span className="text-sm text-gray-300">Include airport pickup</span>
              </div>
              <ToggleSwitch
                enabled={transfers.includesAirportPickup}
                onChange={handleAirportToggle}
                small
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Caddie Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-[#282A2C] p-4 border border-gray-700"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/20 flex items-center justify-center">
              <Wallet size={20} className="text-[#FF6B35]" />
            </div>
            <div>
              <h4 className="font-medium text-white">Pre-paid Caddie Tips</h4>
              <p className="text-xs text-gray-400">
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
        'relative rounded-full transition-colors',
        small ? 'w-10 h-5' : 'w-12 h-6',
        enabled ? 'bg-[#FF6B35]' : 'bg-gray-600'
      )}
    >
      <motion.div
        className={cn(
          'absolute top-0.5 rounded-full bg-white shadow-sm',
          small ? 'w-4 h-4' : 'w-5 h-5'
        )}
        animate={{
          left: enabled ? (small ? '22px' : '26px') : '2px',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
