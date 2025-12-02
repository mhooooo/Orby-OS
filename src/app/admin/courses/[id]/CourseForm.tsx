'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2 } from 'lucide-react';

interface CourseRate {
  id: string;
  rate_type: string;
  net_rate: number;
  rack_rate: number | null;
  day_type: string;
  season: string;
}

interface CourseFormProps {
  course: Record<string, unknown>;
  rates: CourseRate[];
}

export default function CourseForm({ course, rates }: CourseFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    contact_email: (course.contact_email as string) || '',
    contact_phone: (course.contact_phone as string) || '',
    booking_email: (course.booking_email as string) || '',
    commission_rate: (course.commission_rate as number) || '',
    internal_notes: (course.internal_notes as string) || '',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Course Details (Read-only) */}
        <div className="bg-[#1E1F20] rounded-2xl border border-white/5 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Course Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Name</label>
              <p className="text-white mt-1">{course.name as string}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Region</label>
              <p className="text-white mt-1 capitalize">{(course.region as string)?.replace('_', ' ')}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Holes</label>
              <p className="text-white mt-1">{course.holes as number}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Par</label>
              <p className="text-white mt-1">{course.par as number}</p>
            </div>
          </div>
        </div>

        {/* B2B Contact Info */}
        <div className="bg-[#1E1F20] rounded-2xl border border-white/5 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">B2B Contact Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Contact Email</label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF6B35]/50"
                placeholder="reservations@course.com"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Contact Phone</label>
              <input
                type="text"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF6B35]/50"
                placeholder="+66 XX XXX XXXX"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Booking Email</label>
              <input
                type="email"
                value={formData.booking_email}
                onChange={(e) => setFormData({ ...formData, booking_email: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF6B35]/50"
                placeholder="booking@course.com"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Commission Rate (%)</label>
              <input
                type="number"
                step="0.5"
                value={formData.commission_rate}
                onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF6B35]/50"
                placeholder="15"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm text-gray-400 block mb-2">Internal Notes</label>
            <textarea
              value={formData.internal_notes}
              onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF6B35]/50 resize-none"
              placeholder="Notes for internal use only..."
            />
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6B35] rounded-xl text-white hover:bg-[#FF6B35]/90 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Rates Table */}
        <div className="bg-[#1E1F20] rounded-2xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Rate Schedule</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-sm text-gray-300 hover:bg-white/10">
              <Plus size={16} />
              Add Rate
            </button>
          </div>
          {rates.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No rates configured. Import or add rates manually.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-4 py-3 text-left text-sm text-gray-400">Type</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-400">Day Type</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-400">Season</th>
                    <th className="px-4 py-3 text-right text-sm text-gray-400">Net Rate</th>
                    <th className="px-4 py-3 text-right text-sm text-gray-400">Rack Rate</th>
                    <th className="px-4 py-3 text-center text-sm text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate) => (
                    <tr key={rate.id} className="border-b border-white/5">
                      <td className="px-4 py-3 text-white capitalize">{rate.rate_type.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-white capitalize">{rate.day_type}</td>
                      <td className="px-4 py-3 text-white capitalize">{rate.season}</td>
                      <td className="px-4 py-3 text-right text-green-500">?{rate.net_rate?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-gray-400">?{rate.rack_rate?.toLocaleString() || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <button className="p-1.5 text-gray-400 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Hero Image Preview */}
        <div className="bg-[#1E1F20] rounded-2xl border border-white/5 overflow-hidden">
          {course.hero_image ? (
            <img
              src={course.hero_image as string}
              alt={course.name as string}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-white/5 flex items-center justify-center text-gray-500">
              No Image
            </div>
          )}
          <div className="p-4">
            <h4 className="font-medium text-white">{course.name as string}</h4>
            <p className="text-sm text-gray-400 mt-1">{course.location as string}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-[#1E1F20] rounded-2xl border border-white/5 p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {((course.tags as string[]) || []).map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-white/5 rounded-full text-xs text-white">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
