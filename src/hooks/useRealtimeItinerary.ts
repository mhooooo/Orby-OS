'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ItineraryDraft {
  id: string;
  session_uuid: string;
  start_date?: string;
  end_date?: string;
  number_of_days?: number;
  group_size?: number;
  group_composition?: string;
  region?: string;
  selected_courses?: Array<{
    course_id?: string;
    course_name: string;
    preferred_date?: string;
    tee_time_preference?: string;
    added_at: string;
  }>;
  budget_tier?: string;
  total_budget?: number;
  per_round_budget?: number;
  transport_config?: {
    need_airport_transfer?: boolean;
    need_daily_transport?: boolean;
    vehicle_preference?: string;
    pickup_location?: string;
  };
  special_requirements?: {
    needs_golf_cart?: boolean;
    dietary_restrictions?: string[];
    mobility_notes?: string;
    other?: string;
  };
  updated_at: string;
}

interface UseRealtimeItineraryProps {
  sessionUuid?: string | null;
}

export function useRealtimeItinerary(props?: UseRealtimeItineraryProps) {
  // Accept sessionUuid as prop for now (future: will use useSession() when SessionContext exists)
  const sessionUuid = props?.sessionUuid;

  const [draft, setDraft] = useState<ItineraryDraft | null>(null);
  const [isLoading, setIsLoading] = useState(!sessionUuid ? false : true);

  useEffect(() => {
    if (!sessionUuid) {
      return;
    }

    // Initial fetch
    const fetchDraft = async () => {
      try {
        const { data } = await supabase
          .from('itinerary_drafts')
          .select('*')
          .eq('session_uuid', sessionUuid)
          .single();

        setDraft(data);
        setIsLoading(false);
      } catch (error) {
        console.error('[useRealtimeItinerary] Initial fetch error:', error);
        setIsLoading(false);
      }
    };

    void fetchDraft();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`draft_${sessionUuid}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'itinerary_drafts',
          filter: `session_uuid=eq.${sessionUuid}`,
        },
        (payload) => {
          console.log('[Realtime] Itinerary updated:', payload);

          if (payload.eventType === 'DELETE') {
            setDraft(null);
          } else {
            setDraft(payload.new as ItineraryDraft);
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionUuid]);

  return { draft, isLoading };
}
