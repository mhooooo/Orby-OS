'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import type { ItineraryDraft } from '@/types/itinerary';

interface ItineraryDraftPreview {
  id: string;
  name: string | null;
  created_at: string;
  updated_at: string;
  preview: {
    region: string | null;
    numberOfDays: number;
    groupSize: number;
    startDate: string | null;
  };
}

interface UseItineraryDraftsReturn {
  drafts: ItineraryDraftPreview[];
  loading: boolean;
  error: string | null;
  saveDraft: (data: ItineraryDraft, name?: string) => Promise<string | null>;
  updateDraft: (id: string, data: ItineraryDraft, name?: string) => Promise<boolean>;
  deleteDraft: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useItineraryDrafts(): UseItineraryDraftsReturn {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<ItineraryDraftPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch drafts
  const fetchDrafts = useCallback(async () => {
    if (!user) {
      setDrafts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/itineraries', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch itineraries');
      }

      const data = await response.json();
      setDrafts(data.drafts || []);
    } catch (err) {
      console.error('Error fetching itinerary drafts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch drafts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch on mount and when auth state changes
  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  // Save new draft
  const saveDraft = useCallback(
    async (data: ItineraryDraft, name?: string): Promise<string | null> => {
      if (!user) {
        setError('User must be authenticated to save drafts');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/itineraries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: name || null,
            draft_json: data,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save itinerary');
        }

        const result = await response.json();

        // Refetch to update list
        await fetchDrafts();

        return result.id;
      } catch (err) {
        console.error('Error saving itinerary draft:', err);
        setError(err instanceof Error ? err.message : 'Failed to save draft');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, fetchDrafts]
  );

  // Update existing draft
  const updateDraft = useCallback(
    async (id: string, data: ItineraryDraft, name?: string): Promise<boolean> => {
      if (!user) {
        setError('User must be authenticated to update drafts');
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/itineraries/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: name !== undefined ? name : undefined,
            draft_json: data,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update itinerary');
        }

        // Refetch to update list
        await fetchDrafts();

        return true;
      } catch (err) {
        console.error('Error updating itinerary draft:', err);
        setError(err instanceof Error ? err.message : 'Failed to update draft');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user, fetchDrafts]
  );

  // Delete draft
  const deleteDraft = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) {
        setError('User must be authenticated to delete drafts');
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/itineraries/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to delete itinerary');
        }

        // Refetch to update list
        await fetchDrafts();

        return true;
      } catch (err) {
        console.error('Error deleting itinerary draft:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete draft');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user, fetchDrafts]
  );

  return {
    drafts,
    loading,
    error,
    saveDraft,
    updateDraft,
    deleteDraft,
    refetch: fetchDrafts,
  };
}
