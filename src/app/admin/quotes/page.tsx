import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import QuoteList from './QuoteList';
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

export default async function QuotesPage() {
  const supabase = await createClient();

  const { data: quotes, error } = await supabase
    .from('quotes')
    .select(`
      *,
      client:clients(company_name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quotes:', error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Quotes</h2>
          <p className="text-gray-400 mt-1">{quotes?.length || 0} quotes total</p>
        </div>
        <Link
          href="/admin/quotes/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B35] rounded-xl text-white hover:bg-[#FF6B35]/90 transition-colors"
        >
          <Plus size={18} />
          New Quote
        </Link>
      </div>

      {/* Quote List */}
      <QuoteList quotes={quotes || []} />
    </div>
  );
}
