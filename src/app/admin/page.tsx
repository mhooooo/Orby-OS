import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { FileText, DollarSign, Users, TrendingUp } from 'lucide-react';
import type { Database } from '@/types/database';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
}

function MetricCard({ title, value, subtitle, icon, trend }: MetricCardProps) {
  return (
    <div className="bg-[#1E1F20] rounded-2xl p-6 border border-white/5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {subtitle && (
            <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${
              trend.isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              <TrendingUp size={14} className={!trend.isPositive ? 'rotate-180' : ''} />
              {trend.value}% vs last month
            </p>
          )}
        </div>
        <div className="p-3 bg-white/5 rounded-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

async function createClient() {
  const cookieStore = await cookies();

  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  return client;
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch metrics - these tables may not exist yet, so we handle errors gracefully
  let pendingQuotes = 0;
  let totalClients = 0;
  let pendingInquiries = 0;

  try {
    const quotesResult = await supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('status', 'draft');
    pendingQuotes = quotesResult.count || 0;
  } catch {
    // Table doesn't exist yet
  }

  try {
    const clientsResult = await supabase.from('clients').select('*', { count: 'exact', head: true });
    totalClients = clientsResult.count || 0;
  } catch {
    // Table doesn't exist yet
  }

  try {
    const inquiriesResult = await supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    pendingInquiries = inquiriesResult.count || 0;
  } catch {
    // Table doesn't exist yet
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#FF6B35]/20 to-[#FF6B35]/5 rounded-2xl p-6 border border-[#FF6B35]/20">
        <h2 className="text-2xl font-bold text-white">Welcome to Admin Portal</h2>
        <p className="text-gray-400 mt-1">Manage courses, rates, clients, and quotes for Golf Okay.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Pending Quotes"
          value={pendingQuotes}
          subtitle="Awaiting response"
          icon={<FileText className="text-[#FF6B35]" size={24} />}
        />
        <MetricCard
          title="This Month Revenue"
          value="฿0"
          subtitle="From confirmed quotes"
          icon={<DollarSign className="text-green-500" size={24} />}
          trend={{ value: 0, isPositive: true }}
        />
        <MetricCard
          title="Active Clients"
          value={totalClients}
          subtitle="B2B partners"
          icon={<Users className="text-[#00D4FF]" size={24} />}
        />
        <MetricCard
          title="Pending Inquiries"
          value={pendingInquiries}
          subtitle="From website"
          icon={<FileText className="text-[#A855F7]" size={24} />}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1E1F20] rounded-2xl p-6 border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/admin/quotes/new"
              className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="p-2 bg-[#FF6B35]/20 rounded-lg">
                <FileText className="text-[#FF6B35]" size={20} />
              </div>
              <div>
                <p className="text-white font-medium">Create New Quote</p>
                <p className="text-gray-500 text-sm">Build a quote for a client</p>
              </div>
            </Link>
            <Link
              href="/admin/courses/import"
              className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="p-2 bg-[#00D4FF]/20 rounded-lg">
                <TrendingUp className="text-[#00D4FF]" size={20} />
              </div>
              <div>
                <p className="text-white font-medium">Import Course Rates</p>
                <p className="text-gray-500 text-sm">Upload CSV with pricing</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-[#1E1F20] rounded-2xl p-6 border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
            <p className="text-sm mt-1">Activity will appear here as you use the system</p>
          </div>
        </div>
      </div>
    </div>
  );
}
