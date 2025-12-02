import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Plus, Upload } from 'lucide-react';
import TransportList from './TransportList';
import type { Database } from '@/types/database';

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
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
            // Ignored - called from Server Component
          }
        },
      },
    }
  );
}

export default async function TransportPage() {
  const supabase = await createClient();

  const { data: rates, error } = await supabase
    .from('transport_rates')
    .select('*')
    .order('vehicle_type, origin_area');

  if (error) {
    console.error('Error fetching transport rates:', error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Transport Rates</h2>
          <p className="text-gray-400 mt-1">{rates?.length || 0} rates configured</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/transport/import"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
          >
            <Upload size={18} />
            Import CSV
          </Link>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B35] rounded-xl text-white hover:bg-[#FF6B35]/90 transition-colors">
            <Plus size={18} />
            Add Rate
          </button>
        </div>
      </div>

      {/* Transport List */}
      <TransportList rates={rates || []} />
    </div>
  );
}
