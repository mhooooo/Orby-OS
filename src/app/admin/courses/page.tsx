import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Plus, Upload } from 'lucide-react';
import CourseList from './CourseList';

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
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
          } catch {}
        },
      },
    }
  );
}

export default async function CoursesPage() {
  const supabase = await createClient();

  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching courses:', error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Courses</h2>
          <p className="text-gray-400 mt-1">{courses?.length || 0} courses in database</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/courses/import"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
          >
            <Upload size={18} />
            Import Rates
          </Link>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B35] rounded-xl text-white hover:bg-[#FF6B35]/90 transition-colors">
            <Plus size={18} />
            Add Course
          </button>
        </div>
      </div>

      {/* Course List */}
      <CourseList courses={courses || []} />
    </div>
  );
}
