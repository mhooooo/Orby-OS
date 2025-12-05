'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Save, Calculator, Calendar, Flag, Truck } from 'lucide-react';

interface Client {
  id: string;
  company_name: string;
  markup_percentage: number;
}

interface Course {
  id: string;
  name: string;
  region: string;
}

interface TransportRate {
  id: string;
  vehicle_type: string;
  origin_area: string;
  destination_area: string;
  net_rate: number;
}

interface QuoteItem {
  id: string;
  type: 'course' | 'transport' | 'other';
  description: string;
  date?: string;
  quantity: number;
  net_rate: number;
  sell_rate: number;
}

export default function NewQuotePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [transportRates, setTransportRates] = useState<TransportRate[]>([]);
  const [saving, setSaving] = useState(false);

  const [selectedClient, setSelectedClient] = useState<string>('');
  const [validUntil, setValidUntil] = useState<string>('');
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [notes, setNotes] = useState('');

  // Fetch data
  useEffect(() => {
    Promise.all([
      fetch('/api/admin/clients').then(r => r.json()),
      fetch('/api/admin/courses').then(r => r.json()),
      fetch('/api/admin/transport').then(r => r.json()),
    ]).then(([clientsData, coursesData, transportData]) => {
      setClients(clientsData.data || []);
      setCourses(coursesData.data || []);
      setTransportRates(transportData.data || []);
    });
  }, []);

  const clientMarkup = clients.find(c => c.id === selectedClient)?.markup_percentage || 15;

  const addCourseItem = (course: Course) => {
    const netRate = 3000; // Default, should come from course_rates
    setItems([...items, {
      id: crypto.randomUUID(),
      type: 'course',
      description: `Golf at ${course.name}`,
      quantity: 1,
      net_rate: netRate,
      sell_rate: netRate * (1 + clientMarkup / 100),
    }]);
  };

  const addTransportItem = (rate: TransportRate) => {
    setItems([...items, {
      id: crypto.randomUUID(),
      type: 'transport',
      description: `${rate.vehicle_type} - ${rate.origin_area} to ${rate.destination_area}`,
      quantity: 1,
      net_rate: rate.net_rate,
      sell_rate: rate.net_rate * (1 + clientMarkup / 100),
    }]);
  };

  const addCustomItem = () => {
    setItems([...items, {
      id: crypto.randomUUID(),
      type: 'other',
      description: '',
      quantity: 1,
      net_rate: 0,
      sell_rate: 0,
    }]);
  };

  const updateItem = (id: string, updates: Partial<QuoteItem>) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, ...updates };
      // Auto-calculate sell_rate if net_rate changed
      if (updates.net_rate !== undefined) {
        updated.sell_rate = updates.net_rate * (1 + clientMarkup / 100);
      }
      return updated;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const totals = items.reduce((acc, item) => ({
    net: acc.net + (item.net_rate * item.quantity),
    sell: acc.sell + (item.sell_rate * item.quantity),
  }), { net: 0, sell: 0 });

  const handleSave = async (status: 'draft' | 'sent') => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: selectedClient || null,
          status,
          valid_until: validUntil || null,
          total_net: totals.net,
          total_sell: totals.sell,
          margin: totals.sell - totals.net,
          items,
          notes,
        }),
      });

      if (res.ok) {
        router.push('/admin/quotes');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/admin/quotes"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Quotes
      </Link>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">New Quote</h2>
        <p className="text-gray-400 mt-1">Build a quote for a client</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Selection */}
          <div className="bg-[#1E1F20] rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Client Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Client</label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF6B35]/50"
                >
                  <option value="">Select a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.company_name} ({client.markup_percentage}% markup)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Valid Until</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF6B35]/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-[#1E1F20] rounded-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Line Items</h3>
              <div className="flex gap-2">
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-sm text-gray-300 hover:bg-white/10">
                    <Flag size={14} />
                    Add Course
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[#282A2C] rounded-xl border border-white/10 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <div className="p-2 max-h-64 overflow-y-auto">
                      {courses.map(course => (
                        <button
                          key={course.id}
                          onClick={() => addCourseItem(course)}
                          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 rounded-lg"
                        >
                          {course.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-sm text-gray-300 hover:bg-white/10">
                    <Truck size={14} />
                    Add Transport
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-80 bg-[#282A2C] rounded-xl border border-white/10 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <div className="p-2 max-h-64 overflow-y-auto">
                      {transportRates.map(rate => (
                        <button
                          key={rate.id}
                          onClick={() => addTransportItem(rate)}
                          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 rounded-lg"
                        >
                          {rate.vehicle_type}: {rate.origin_area} → {rate.destination_area}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={addCustomItem}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-sm text-gray-300 hover:bg-white/10"
                >
                  <Plus size={14} />
                  Custom
                </button>
              </div>
            </div>

            {/* Items Table */}
            {items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No items yet. Add courses, transport, or custom items.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-4 py-3 text-left text-sm text-gray-400">Description</th>
                    <th className="px-4 py-3 text-center text-sm text-gray-400 w-20">Qty</th>
                    <th className="px-4 py-3 text-right text-sm text-gray-400 w-28">Net</th>
                    <th className="px-4 py-3 text-right text-sm text-gray-400 w-28">Sell</th>
                    <th className="px-4 py-3 text-center text-sm text-gray-400 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-white/5">
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, { description: e.target.value })}
                          className="w-full bg-transparent text-white focus:outline-none"
                          placeholder="Description..."
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center text-white focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.net_rate}
                          onChange={(e) => updateItem(item.id, { net_rate: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-right text-white focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.sell_rate}
                          onChange={(e) => updateItem(item.id, { sell_rate: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-right text-green-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Notes */}
          <div className="bg-[#1E1F20] rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF6B35]/50 resize-none"
              placeholder="Add notes for this quote..."
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Totals */}
          <div className="bg-[#1E1F20] rounded-2xl border border-white/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator size={20} className="text-[#FF6B35]" />
              <h3 className="text-lg font-semibold text-white">Summary</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Net Total</span>
                <span className="text-white">฿{totals.net.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sell Total</span>
                <span className="text-white font-semibold">฿{totals.sell.toLocaleString()}</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between">
                <span className="text-gray-400">Margin</span>
                <span className="text-green-500 font-semibold">
                  ฿{(totals.sell - totals.net).toLocaleString()}
                  {totals.sell > 0 && (
                    <span className="text-xs ml-1">
                      ({((totals.sell - totals.net) / totals.sell * 100).toFixed(1)}%)
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-[#1E1F20] rounded-2xl border border-white/5 p-6 space-y-3">
            <button
              onClick={() => handleSave('draft')}
              disabled={saving || items.length === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/5 rounded-xl text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              Save as Draft
            </button>
            <button
              onClick={() => handleSave('sent')}
              disabled={saving || items.length === 0 || !selectedClient}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#FF6B35] rounded-xl text-white hover:bg-[#FF6B35]/90 transition-colors disabled:opacity-50"
            >
              Save & Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
