'use client';

import { useState } from 'react';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Plus, Edit2, Mail, Phone, Building2, X } from 'lucide-react';

interface Client {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  country: string;
  client_type: string;
  markup_percentage: number;
  notes: string | null;
}

const clientTypeColors: Record<string, string> = {
  B2B: 'bg-blue-500/20 text-blue-400',
  Agent: 'bg-purple-500/20 text-purple-400',
  Corporate: 'bg-green-500/20 text-green-400',
  Direct: 'bg-gray-500/20 text-gray-400',
};

interface ClientListProps {
  initialClients: Client[];
}

export default function ClientList({ initialClients }: ClientListProps) {
  const [clients, setClients] = useState(initialClients);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    country: 'Vietnam',
    client_type: 'B2B',
    markup_percentage: '15',
    notes: '',
  });

  const columns: Column<Client>[] = [
    {
      key: 'company_name',
      header: 'Company',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35]/20 to-[#FF6B35]/5 flex items-center justify-center">
            <Building2 size={18} className="text-[#FF6B35]" />
          </div>
          <div>
            <p className="font-medium">{row.company_name}</p>
            {row.contact_name && (
              <p className="text-gray-500 text-xs">{row.contact_name}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Contact',
      render: (row) => (
        <div className="space-y-1">
          {row.email && (
            <p className="flex items-center gap-1 text-sm">
              <Mail size={12} className="text-gray-500" />
              {row.email}
            </p>
          )}
          {row.phone && (
            <p className="flex items-center gap-1 text-sm text-gray-400">
              <Phone size={12} className="text-gray-500" />
              {row.phone}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'country',
      header: 'Country',
      sortable: true,
    },
    {
      key: 'client_type',
      header: 'Type',
      sortable: true,
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${clientTypeColors[row.client_type] || clientTypeColors.Direct}`}>
          {row.client_type}
        </span>
      ),
    },
    {
      key: 'markup_percentage',
      header: 'Markup',
      sortable: true,
      className: 'text-right',
      render: (row) => <span className="text-green-500">{row.markup_percentage}%</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); openEditModal(row); }}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <Edit2 size={16} />
        </button>
      ),
    },
  ];

  const openAddModal = () => {
    setEditingClient(null);
    setFormData({
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      country: 'Vietnam',
      client_type: 'B2B',
      markup_percentage: '15',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      company_name: client.company_name,
      contact_name: client.contact_name || '',
      email: client.email || '',
      phone: client.phone || '',
      country: client.country,
      client_type: client.client_type,
      markup_percentage: String(client.markup_percentage),
      notes: client.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editingClient ? 'PATCH' : 'POST';
      const url = editingClient
        ? `/api/admin/clients/${editingClient.id}`
        : '/api/admin/clients';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          markup_percentage: parseFloat(formData.markup_percentage),
        }),
      });

      if (res.ok) {
        const { data } = await res.json();
        if (editingClient) {
          setClients(clients.map(c => c.id === data.id ? data : c));
        } else {
          setClients([...clients, data]);
        }
        setIsModalOpen(false);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Add Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B35] rounded-xl text-white hover:bg-[#FF6B35]/90 transition-colors"
        >
          <Plus size={18} />
          Add Client
        </button>
      </div>

      {/* Table */}
      <DataTable
        data={clients}
        columns={columns}
        searchKeys={['company_name', 'contact_name', 'email', 'country']}
        pageSize={15}
        emptyMessage="No clients yet. Add your first client to get started."
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[#1E1F20] rounded-2xl border border-white/10 w-full max-w-lg mx-4 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Company Name *</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF6B35]/50"
                  placeholder="ABC Travel Company"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Contact Name</label>
                  <input
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF6B35]/50"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Country</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF6B35]/50"
                  >
                    <option value="Vietnam">Vietnam</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="China">China</option>
                    <option value="Korea">Korea</option>
                    <option value="Japan">Japan</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF6B35]/50"
                    placeholder="contact@company.com"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF6B35]/50"
                    placeholder="+84 XXX XXX XXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Client Type</label>
                  <select
                    value={formData.client_type}
                    onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF6B35]/50"
                  >
                    <option value="B2B">B2B</option>
                    <option value="Agent">Agent</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Direct">Direct</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Markup %</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.markup_percentage}
                    onChange={(e) => setFormData({ ...formData, markup_percentage: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF6B35]/50"
                    placeholder="15"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF6B35]/50 resize-none"
                  placeholder="Internal notes about this client..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 bg-white/5 rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.company_name}
                className="px-6 py-2.5 bg-[#FF6B35] rounded-xl text-white hover:bg-[#FF6B35]/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingClient ? 'Save Changes' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
