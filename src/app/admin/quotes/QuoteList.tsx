'use client';

import { DataTable, Column } from '@/components/admin/DataTable';
import { FileText, Calendar } from 'lucide-react';

interface Quote {
  id: string;
  quote_number: string;
  client_id: string | null;
  client?: { company_name: string } | null;
  status: string;
  valid_until: string | null;
  total_net: number;
  total_sell: number;
  margin: number;
  created_at: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/20 text-gray-400',
  sent: 'bg-blue-500/20 text-blue-400',
  accepted: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
  expired: 'bg-yellow-500/20 text-yellow-400',
};

export default function QuoteList({ quotes }: { quotes: Quote[] }) {
  const columns: Column<Quote>[] = [
    {
      key: 'quote_number',
      header: 'Quote #',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg">
            <FileText size={16} className="text-[#FF6B35]" />
          </div>
          <span className="font-mono">{row.quote_number}</span>
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      render: (row) => row.client?.company_name || '-',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[row.status] || statusColors.draft}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'total_sell',
      header: 'Total',
      sortable: true,
      className: 'text-right',
      render: (row) => (
        <span className="text-white font-medium">฿{row.total_sell.toLocaleString()}</span>
      ),
    },
    {
      key: 'margin',
      header: 'Margin',
      sortable: true,
      className: 'text-right',
      render: (row) => {
        const marginPct = row.total_sell > 0 ? ((row.margin / row.total_sell) * 100).toFixed(1) : '0';
        return (
          <span className="text-green-500">
            ฿{row.margin.toLocaleString()} ({marginPct}%)
          </span>
        );
      },
    },
    {
      key: 'valid_until',
      header: 'Valid Until',
      sortable: true,
      render: (row) => row.valid_until ? (
        <span className="flex items-center gap-1 text-gray-400">
          <Calendar size={14} />
          {new Date(row.valid_until).toLocaleDateString()}
        </span>
      ) : '-',
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  return (
    <DataTable
      data={quotes}
      columns={columns}
      searchKeys={['quote_number']}
      pageSize={15}
      emptyMessage="No quotes yet. Create your first quote to get started."
    />
  );
}
