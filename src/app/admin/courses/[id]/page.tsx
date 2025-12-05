import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CourseForm from './CourseForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

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

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !course) {
    notFound();
  }

  // Fetch rates for this course
  const { data: rates } = await supabase
    .from('course_rates')
    .select('*')
    .eq('course_id', id)
    .order('rate_type');

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Courses
      </Link>

      {/* Course Form */}
      <CourseForm course={course} rates={rates || []} />
    </div>
  );
}
