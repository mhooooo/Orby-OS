'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

interface SavedCourse {
  id: string;
  course_id: string;
  created_at: string;
  courses: {
    id: string;
    name: string;
    region: string;
    location: string;
    par: number;
    yardage: number;
    holes: number;
    tags: string[];
    hero_image: string | null;
    description: string | null;
    green_fee: {
      weekday: { guest: number; member: number };
      weekend: { guest: number; member: number };
    };
  };
}

interface UseSavedCoursesReturn {
  savedCourses: SavedCourse[];
  loading: boolean;
  error: string | null;
  saveCourse: (courseId: string) => Promise<boolean>;
  unsaveCourse: (courseId: string) => Promise<boolean>;
  isSaved: (courseId: string) => boolean;
  refetch: () => Promise<void>;
}

export function useSavedCourses(): UseSavedCoursesReturn {
  const { user, loading: authLoading } = useAuth();
  const [savedCourses, setSavedCourses] = useState<SavedCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch saved courses
  const fetchSavedCourses = useCallback(async () => {
    console.log('[useSavedCourses] fetchSavedCourses called, user:', user?.email);
    if (!user) {
      setSavedCourses([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/saved-courses', {
        credentials: 'include',
      });

      console.log('[useSavedCourses] GET response status:', response.status);
      const data = await response.json();
      console.log('[useSavedCourses] GET response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch saved courses');
      }

      setSavedCourses(data.savedCourses || []);
      console.log('[useSavedCourses] savedCourses updated:', data.savedCourses?.length || 0, 'courses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching saved courses:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch on mount and when user changes
  useEffect(() => {
    if (!authLoading) {
      fetchSavedCourses();
    }
  }, [user, authLoading, fetchSavedCourses]);

  // Save a course
  const saveCourse = useCallback(
    async (courseId: string): Promise<boolean> => {
      console.log('[useSavedCourses] saveCourse called, user:', user?.email, 'courseId:', courseId);
      if (!user) {
        console.log('[useSavedCourses] No user in saveCourse, returning false');
        return false;
      }

      // Optimistic update
      const optimisticCourse = {
        id: `temp-${Date.now()}`,
        course_id: courseId,
        created_at: new Date().toISOString(),
        courses: {} as SavedCourse['courses'],
      };
      setSavedCourses((prev) => [optimisticCourse, ...prev]);

      try {
        console.log('[useSavedCourses] Making POST request to /api/saved-courses');
        const response = await fetch('/api/saved-courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ course_id: courseId }),
        });

        console.log('[useSavedCourses] Response status:', response.status);
        const data = await response.json();
        console.log('[useSavedCourses] Response data:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save course');
        }

        // Refetch to get the actual data
        await fetchSavedCourses();
        return true;
      } catch (err) {
        // Rollback optimistic update
        setSavedCourses((prev) => prev.filter((c) => c.id !== optimisticCourse.id));
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error saving course:', err);
        return false;
      }
    },
    [user, fetchSavedCourses]
  );

  // Unsave a course
  const unsaveCourse = useCallback(
    async (courseId: string): Promise<boolean> => {
      if (!user) {
        return false;
      }

      // Optimistic update
      const previousCourses = savedCourses;
      setSavedCourses((prev) => prev.filter((c) => c.course_id !== courseId));

      try {
        const response = await fetch('/api/saved-courses', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ course_id: courseId }),
        });

        if (!response.ok) {
          throw new Error('Failed to unsave course');
        }

        return true;
      } catch (err) {
        // Rollback optimistic update
        setSavedCourses(previousCourses);
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error unsaving course:', err);
        return false;
      }
    },
    [user, savedCourses]
  );

  // Check if a course is saved
  const isSaved = useCallback(
    (courseId: string): boolean => {
      const saved = savedCourses.some((c) => c.course_id === courseId);
      console.log('[useSavedCourses] isSaved check:', courseId, 'result:', saved, 'savedCourses:', savedCourses.map(c => c.course_id));
      return saved;
    },
    [savedCourses]
  );

  return {
    savedCourses,
    loading,
    error,
    saveCourse,
    unsaveCourse,
    isSaved,
    refetch: fetchSavedCourses,
  };
}
