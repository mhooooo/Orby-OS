'use client';

import { DataTable, Column } from '@/components/admin/DataTable';
import { Users } from 'lucide-react';

interface TransportRate {
  id: string;
  vehicle_type: string;
  route_type: string;
  origin_area: string;
  destination_area: string;
  net_rate: number;
  rack_rate: number | null;
  max_passengers: number;
}

const vehicleIcons: Record<string, string> = {
  sedan: '🚗',
  suv: '🚙',
  van: '🚐',
  minibus: '🚌',
  coach: '🚎',
};

const vehicleLabels: Record<string, string> = {
  sedan: 'Sedan',
  suv: 'SUV',
  van: 'Van (9-12 pax)',
  minibus: 'Minibus (15-20 pax)',
  coach: 'Coach (40+ pax)',
};

const routeLabels: Record<string, string> = {
  airport_transfer: 'Airport Transfer',
  golf_transfer: 'Golf Transfer',
  day_trip: 'Day Trip',
  hourly: 'Hourly Rental',
};

export default function TransportList({ rates }: { rates: TransportRate[] }) {
  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'vehicle_type',
      header: 'Vehicle',
      sortable: true,
      render: (row) => {
        const r = row as unknown as TransportRate;
        return (
          <div className="flex items-center gap-2">
            <span className="text-xl">{vehicleIcons[r.vehicle_type] || '🚗'}</span>
            <span>{vehicleLabels[r.vehicle_type] || r.vehicle_type}</span>
          </div>
        );
      },
    },
    {
      key: 'route_type',
      header: 'Route Type',
      sortable: true,
      render: (row) => {
        const r = row as unknown as TransportRate;
        return (
          <span className="px-2.5 py-1 bg-white/5 rounded-full text-xs">
            {routeLabels[r.route_type] || r.route_type}
          </span>
        );
      },
    },
    {
      key: 'origin_area',
      header: 'Route',
      render: (row) => {
        const r = row as unknown as TransportRate;
        return (
          <span>
            {r.origin_area} → {r.destination_area}
          </span>
        );
      },
    },
    {
      key: 'max_passengers',
      header: 'Capacity',
      sortable: true,
      render: (row) => {
        const r = row as unknown as TransportRate;
        return (
          <span className="flex items-center gap-1">
            <Users size={14} className="text-gray-400" />
            {r.max_passengers}
          </span>
        );
      },
    },
    {
      key: 'net_rate',
      header: 'Net Rate',
      sortable: true,
      className: 'text-right',
      render: (row) => {
        const r = row as unknown as TransportRate;
        return (
          <span className="text-green-500">฿{r.net_rate.toLocaleString()}</span>
        );
      },
    },
    {
      key: 'rack_rate',
      header: 'Rack Rate',
      className: 'text-right',
      render: (row) => {
        const r = row as unknown as TransportRate;
        return (
          <span className="text-gray-400">
            {r.rack_rate ? `฿${r.rack_rate.toLocaleString()}` : '-'}
          </span>
        );
      },
    },
  ];

  return (
    <DataTable
      data={rates as unknown as Record<string, unknown>[]}
      columns={columns}
      searchKeys={['origin_area', 'destination_area', 'vehicle_type']}
      pageSize={15}
      emptyMessage="No transport rates configured"
    />
  );
}
