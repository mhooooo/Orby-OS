'use client';

import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/admin/DataTable';
import { MapPin, DollarSign } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  region: string;
  location: string;
  par: number;
  holes: number;
  green_fee: Record<string, unknown>;
  commission_rate?: number | null;
}

const regionLabels: Record<string, string> = {
  bangkok: 'Bangkok',
  phuket: 'Phuket',
  hua_hin: 'Hua Hin',
  chiang_mai: 'Chiang Mai',
  pattaya: 'Pattaya',
};

export default function CourseList({ courses }: { courses: Course[] }) {
  const router = useRouter();

  const columns: Column<Course>[] = [
    {
      key: 'name',
      header: 'Course Name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
            <MapPin size={12} />
            {row.location}
          </p>
        </div>
      ),
    },
    {
      key: 'region',
      header: 'Region',
      sortable: true,
      render: (row) => (
        <span className="px-2.5 py-1 bg-white/5 rounded-full text-xs">
          {regionLabels[row.region] || row.region}
        </span>
      ),
    },
    {
      key: 'holes',
      header: 'Holes',
      sortable: true,
      className: 'text-center',
      render: (row) => <span>{row.holes}</span>,
    },
    {
      key: 'par',
      header: 'Par',
      sortable: true,
      className: 'text-center',
    },
    {
      key: 'green_fee',
      header: 'Green Fee',
      render: (row) => {
        const fee = row.green_fee as Record<string, Record<string, number>>;
        const weekday = fee?.weekday?.guest;
        return weekday ? (
          <span className="flex items-center gap-1 text-green-500">
            <DollarSign size={14} />
            {weekday} USD
          </span>
        ) : '-';
      },
    },
    {
      key: 'commission_rate',
      header: 'Commission',
      render: (row) => row.commission_rate ? `${row.commission_rate}%` : '-',
    },
  ];

  return (
    <DataTable
      data={courses}
      columns={columns}
      searchKeys={['name', 'location', 'region']}
      onRowClick={(course) => router.push(`/admin/courses/${course.id}`)}
      pageSize={15}
      emptyMessage="No courses found"
    />
  );
}
