'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';

interface ParsedRow {
  vehicle_type: string;
  route_type: string;
  origin_area: string;
  destination_area: string;
  net_rate: string;
  rack_rate?: string;
  max_passengers: string;
  [key: string]: string | undefined;
}

interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
}

export default function ImportTransportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) return;

      const headerLine = lines[0];
      const cols = headerLine.split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
      setHeaders(cols);

      const rows: ParsedRow[] = [];
      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
        const row: ParsedRow = { vehicle_type: '', route_type: '', origin_area: '', destination_area: '', net_rate: '', max_passengers: '' };
        cols.forEach((col, idx) => {
          row[col] = values[idx] || '';
        });
        rows.push(row);
      }
      setPreview(rows);
    };
    reader.readAsText(f, 'UTF-8');
  }, []);

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/transport/import', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        setTimeout(() => router.push('/admin/transport'), 2000);
      }
    } catch {
      setResult({ success: false, imported: 0, errors: ['Import failed. Please try again.'] });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/admin/transport"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Transport
      </Link>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Import Transport Rates</h2>
        <p className="text-gray-400 mt-1">Upload a CSV file with transport rate data</p>
      </div>

      {/* Upload Area */}
      <div className="bg-[#1E1F20] rounded-2xl border border-white/5 p-6">
        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white/5 rounded-full">
                <FileSpreadsheet className="text-[#FF6B35]" size={32} />
              </div>
              <div>
                <p className="text-white font-medium">
                  {file ? file.name : 'Click to upload CSV file'}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Supports UTF-8 encoding for Thai characters
                </p>
              </div>
            </div>
          </label>
        </div>

        {/* Expected Format */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Expected CSV Format</h4>
          <div className="bg-white/5 rounded-xl p-4 overflow-x-auto">
            <code className="text-xs text-gray-300">
              vehicle_type,route_type,origin_area,destination_area,net_rate,rack_rate,max_passengers<br/>
              sedan,airport_transfer,BKK Airport,Bangkok City,1200,1800,3<br/>
              van,golf_transfer,Bangkok,Thai Country Club,1800,2500,9
            </code>
          </div>
        </div>
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="bg-[#1E1F20] rounded-2xl border border-white/5 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Preview (First 5 rows)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {headers.map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx} className="border-b border-white/5">
                    {headers.map((h) => (
                      <td key={h} className="px-4 py-2 text-white">{row[h] || '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`rounded-2xl p-6 ${result.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <Check className="text-green-500" size={24} />
            ) : (
              <AlertCircle className="text-red-500" size={24} />
            )}
            <div>
              <p className={`font-medium ${result.success ? 'text-green-500' : 'text-red-500'}`}>
                {result.success ? `Successfully imported ${result.imported} rates` : 'Import failed'}
              </p>
              {result.errors.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {result.errors.map((err, idx) => (
                    <li key={idx} className="text-sm text-gray-400">• {err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {file && !result?.success && (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => { setFile(null); setPreview([]); setHeaders([]); }}
            className="px-6 py-2.5 bg-white/5 rounded-xl text-white hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={importing}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6B35] rounded-xl text-white hover:bg-[#FF6B35]/90 transition-colors disabled:opacity-50"
          >
            <Upload size={18} />
            {importing ? 'Importing...' : 'Import Rates'}
          </button>
        </div>
      )}
    </div>
  );
}
