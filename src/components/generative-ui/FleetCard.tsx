'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Briefcase, Check, Car, ChevronRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Vehicle {
  id: string;
  type: string;
  model: string;
  capacity: number;
  luggage: number;
  amenities: string[];
  pricePerDay: number;
  image: string;
}

interface FleetData {
  vehicles: Vehicle[];
  notes: string;
}

interface FleetCardProps {
  data: FleetData;
  className?: string;
}

export function FleetCard({ data, className }: FleetCardProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  return (
    <motion.div
      className={cn(
        'relative w-full rounded-[2.5rem] overflow-hidden',
        'bg-white/5 backdrop-blur-2xl border border-white/10',
        'shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="relative p-4 sm:p-6 lg:p-8 border-b border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
            <Car size={20} className="sm:w-6 sm:h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Premium Transport
          </h2>
        </div>
        <p className="text-gray-400 text-xs sm:text-sm pl-11 sm:pl-12">
          Select your preferred vehicle for the duration of your trip.
        </p>
      </div>

      {/* Vehicle Grid */}
      <div className="p-4 sm:p-6 lg:p-8 grid gap-4 sm:gap-6 md:grid-cols-2">
        {data.vehicles.map((vehicle, index) => (
          <motion.div
            key={vehicle.id}
            className={cn(
              "group relative rounded-3xl overflow-hidden border transition-all duration-300",
              selectedVehicle === vehicle.id
                ? "bg-white/10 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedVehicle(vehicle.id)}
          >
            {/* Selection Indicator */}
            <div className={cn(
              "absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors z-10",
              selectedVehicle === vehicle.id
                ? "bg-blue-500 border-blue-500"
                : "border-white/30 bg-black/20 backdrop-blur-md"
            )}>
              {selectedVehicle === vehicle.id && <Check size={14} className="text-white" />}
            </div>

            {/* Image Area */}
            <div className="relative h-40 sm:h-48 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${vehicle.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />

              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-white/20 backdrop-blur-md text-white border border-white/10 mb-2 inline-block">
                  {vehicle.type}
                </span>
                <h3 className="text-xl font-bold text-white leading-none">
                  {vehicle.model}
                </h3>
              </div>
            </div>

            {/* Details */}
            <div className="p-4 sm:p-5">
              <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div className="flex items-center gap-2 text-gray-400 text-xs font-medium bg-white/5 px-3 py-1.5 rounded-lg">
                  <Users size={14} className="text-blue-400" />
                  <span>{vehicle.capacity} Pax</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-xs font-medium bg-white/5 px-3 py-1.5 rounded-lg">
                  <Briefcase size={14} className="text-purple-400" />
                  <span>{vehicle.luggage} Bags</span>
                </div>
              </div>

              <div className="space-y-2 mb-5">
                {vehicle.amenities.slice(0, 3).map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-xs text-gray-300">
                    <div className="w-1 h-1 rounded-full bg-blue-500" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-end justify-between pt-4 border-t border-white/5">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Daily Rate</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-white">฿{vehicle.pricePerDay.toLocaleString()}</span>
                  </div>
                </div>
                <button className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                  selectedVehicle === vehicle.id
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                    : "bg-white/10 text-white hover:bg-white/20"
                )}>
                  {selectedVehicle === vehicle.id ? 'Selected' : 'Select'}
                  {selectedVehicle !== vehicle.id && <ChevronRight size={14} />}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
          <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-200/80 leading-relaxed">
            {data.notes}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
