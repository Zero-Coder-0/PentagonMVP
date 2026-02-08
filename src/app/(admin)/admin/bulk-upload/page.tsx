'use client';

import React, { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface UploadResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<UploadResult | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.endsWith('.csv')) {
      alert('❌ Please upload a CSV file (.csv)');
      return;
    }

    setFile(uploadedFile);
    setResults(null);
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      if (row[headers[0]]) { // Has data in first column
        rows.push(row);
      }
    }

    return rows;
  };

  const processFile = async () => {
    if (!file) return;

    setProcessing(true);
    const errors: Array<{ row: number; error: string }> = [];
    
    try {
      const text = await file.text();
      const jsonData = parseCSV(text);

      console.log('Parsed data:', jsonData);

      if (jsonData.length === 0) {
        throw new Error('No data found in file');
      }

      // Process each row - ONLY USE GUARANTEED COLUMNS
      const insertResults = await Promise.allSettled(
        jsonData.map(async (row: any, index: number) => {
          try {
            // MINIMAL SCHEMA - Only fields that definitely exist
            const projectData: any = {
              name: row['Project Name'] || row['name'],
              developer: row['Developer'] || row['developer'],
              status: row['Status'] || 'Under Construction',
              zone: row['Zone'] || 'North',
              lat: parseFloat(row['Latitude'] || '12.9716'),
              lng: parseFloat(row['Longitude'] || '77.5946')
            };

            // Add optional fields ONLY if they exist in your schema
            if (row['RERA ID']) projectData.rera_id = row['RERA ID'];
            if (row['Region']) projectData.region = row['Region'];
            if (row['Address']) projectData.address_line = row['Address'];
            if (row['Price Display']) projectData.price_display = row['Price Display'];
            if (row['Total Units']) projectData.total_units = parseInt(row['Total Units']);
            if (row['Land Area']) projectData.total_land_area = row['Land Area'];
            if (row['Property Type']) projectData.property_type = row['Property Type'];

            // Validate required fields
            if (!projectData.name || !projectData.developer) {
              throw new Error('Missing required: Project Name and Developer');
            }

            // Insert to projects table
            const { data, error } = await supabase
              .from('projects')
              .insert(projectData)
              .select()
              .single();

            if (error) throw error;

            return { 
              success: true, 
              project: projectData.name,
              id: data.id 
            };
          } catch (err: any) {
            errors.push({ 
              row: index + 2,
              error: err.message 
            });
            throw err;
          }
        })
      );

      const successful = insertResults.filter(r => r.status === 'fulfilled').length;
      const failed = insertResults.filter(r => r.status === 'rejected').length;

      setResults({ 
        total: jsonData.length, 
        successful, 
        failed,
        errors 
      });

      if (successful > 0) {
        alert(
          `✅ UPLOAD COMPLETE!\n\n` +
          `Total: ${jsonData.length}\n` +
          `✅ Success: ${successful}\n` +
          `❌ Failed: ${failed}`
        );
      }
    } catch (err: any) {
      alert('❌ Error: ' + err.message);
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const downloadTemplate = () => {
    // MINIMAL CSV - Only guaranteed columns
    const headers = [
      'Project Name',
      'Developer',
      'Status',
      'Zone',
      'Region',
      'Address',
      'Latitude',
      'Longitude',
      'Price Display',
      'Total Units',
      'Land Area',
      'Property Type',
      'RERA ID'
    ];

    const sampleData = [
      [
        'Prestige Lakeside Habitat',
        'Prestige Group',
        'Under Construction',
        'North',
        'Whitefield',
        'Varthur Main Road, Whitefield',
        '12.9716',
        '77.5946',
        '₹1.2 Cr onwards',
        '500',
        '25 Acres',
        'Apartments',
        'PRM/KA/RERA/1251/308'
      ],
      [
        'Brigade Eldorado',
        'Brigade Group',
        'Ready',
        'East',
        'Bagalur',
        'Bagalur Main Road',
        '13.0827',
        '77.6350',
        '₹85 Lakhs onwards',
        '850',
        '35 Acres',
        'Apartments',
        'PRM/KA/RERA/1251/309'
      ]
    ];

    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bulk-upload-template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Bulk Upload Properties</h1>
        <p className="text-lg text-slate-600">Upload multiple properties using CSV</p>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="text-4xl">📤</div>
          <div className="flex-1">
            <h3 className="font-bold text-green-900 text-lg mb-2">Simple CSV Upload (100% Free)</h3>
            <ul className="text-sm text-green-800 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="flex-shrink-0" />
                <span>No payment needed - uses your existing Supabase free tier</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="flex-shrink-0" />
                <span>Upload CSV files (open in Excel or Google Sheets)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="flex-shrink-0" />
                <span>Only uses columns that exist in your current schema</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="flex-shrink-0" />
                <span>Works with anon key (no service key needed)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Download Template */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="text-blue-600" size={28} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">Download CSV Template</h3>
              <p className="text-sm text-slate-600">
                Simple template matching your current schema
              </p>
            </div>
          </div>
          <button
            onClick={downloadTemplate}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
          >
            <Download size={20} />
            Download CSV
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-12 text-center mb-8 hover:border-blue-400 hover:bg-blue-50/30 transition">
        <input
          type="file"
          id="file-upload"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="text-blue-600" size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {file ? `📄 ${file.name}` : 'Choose CSV file'}
          </h3>
          <p className="text-slate-600 mb-4">CSV only • Max 50 rows recommended</p>
          <div className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
            Browse Files
          </div>
        </label>
      </div>

      {/* Process Button */}
      {file && (
        <div className="text-center mb-8">
          <button
            onClick={processFile}
            disabled={processing}
            className={`px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg ${
              processing
                ? 'bg-slate-400 text-white cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {processing ? '⏳ Processing...' : '✅ Upload'}
          </button>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-xl mb-6">📊 Upload Results</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-6 text-center border-2 border-blue-200">
              <p className="text-4xl font-bold text-blue-600 mb-2">{results.total}</p>
              <p className="text-sm text-blue-800 font-medium">Total Rows</p>
            </div>
            <div className="bg-green-50 rounded-xl p-6 text-center border-2 border-green-200">
              <p className="text-4xl font-bold text-green-600 mb-2">{results.successful}</p>
              <p className="text-sm text-green-800 font-medium">Successful</p>
            </div>
            <div className="bg-red-50 rounded-xl p-6 text-center border-2 border-red-200">
              <p className="text-4xl font-bold text-red-600 mb-2">{results.failed}</p>
              <p className="text-sm text-red-800 font-medium">Failed</p>
            </div>
          </div>

          {/* Error Details */}
          {results.errors.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                <AlertCircle size={20} />
                Error Details ({results.errors.length} failures)
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {results.errors.map((err, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 text-sm">
                    <p className="font-semibold text-red-800">Row {err.row}:</p>
                    <p className="text-red-600">{err.error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mt-8">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="font-bold text-blue-900 mb-2">How to Use (100% Free)</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Download the CSV template above</li>
              <li>Open it in Excel or Google Sheets</li>
              <li>Fill in your property data</li>
              <li>Save as CSV</li>
              <li>Upload here</li>
              <li>All processing happens in your browser using your free Supabase anon key</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
