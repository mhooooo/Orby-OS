import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import ClientList from './ClientList';
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

export default async function ClientsPage() {
  const supabase = await createClient();

  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('company_name');

  if (error) {
    console.error('Error fetching clients:', error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Clients</h2>
          <p className="text-gray-400 mt-1">{clients?.length || 0} clients registered</p>
        </div>
      </div>

      {/* Client List */}
      <ClientList initialClients={clients || []} />
    </div>
  );
}
