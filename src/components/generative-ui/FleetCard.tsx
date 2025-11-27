'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, Check } from 'lucide-react';
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
  return (
    <motion.div
      className={cn(
        'w-full rounded-3xl overflow-hidden bg-[#1E1F20] border border-gray-800',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white mb-1">
          Transport Options
        </h2>
        <p className="text-sm text-gray-400">
          Choose the perfect ride for your golf trip
        </p>
      </div>

      {/* Vehicle Cards */}
      <div className="p-6 grid gap-4 md:grid-cols-2">
        {data.vehicles.map((vehicle, index) => (
          <motion.div
            key={vehicle.id}
            className="rounded-2xl bg-[#131314] overflow-hidden border border-gray-800 hover:border-[#A4E600]/30 transition-colors"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            {/* Vehicle Image */}
            <div className="relative h-40">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${vehicle.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131314] to-transparent" />

              {/* Type badge */}
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#A4E600] text-black">
                  {vehicle.type}
                </span>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-1">
                {vehicle.model}
              </h3>

              {/* Capacity Stats */}
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <Users size={14} />
                  <span>{vehicle.capacity} passengers</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <Briefcase size={14} />
                  <span>{vehicle.luggage} bags</span>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-2 mb-4">
                {vehicle.amenities.slice(0, 4).map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check size={14} className="text-[#A4E600]" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <div>
                  <span className="text-xs text-gray-500">From</span>
                  <p className="text-xl font-bold text-[#A4E600]">
                    ฿{vehicle.pricePerDay.toLocaleString()}
                  </p>
                  <span className="text-xs text-gray-500">per day</span>
                </div>
                <button className="px-4 py-2 rounded-full bg-[#282A2C] text-white text-sm font-medium hover:bg-[#A4E600] hover:text-black transition-colors">
                  Select
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Notes */}
      <div className="px-6 pb-6">
        <div className="p-4 bg-[#131314] rounded-xl">
          <p className="text-sm text-gray-400">
            {data.notes}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
