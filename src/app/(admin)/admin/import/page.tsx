'use client'

import { useState } from 'react';
import { uploadBulkProjects } from '@/modules/admin/actions-bulk';

export default function BulkImportPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [log, setLog] = useState<string>('');

  const handleUpload = async () => {
    try {
      setStatus('uploading');
      const data = JSON.parse(jsonInput);
      
      // Ensure it's an array
      const projects = Array.isArray(data) ? data : [data];
      
      const result = await uploadBulkProjects(projects);
      
      if (result.failed === 0) {
        setStatus('success');
        setLog(`Successfully imported ${result.success} projects!`);
      } else {
        setStatus('error');
        setLog(`Imported: ${result.success}, Failed: ${result.failed}. Errors: ${result.errors.join(', ')}`);
      }
    } catch (e: any) {
      setStatus('error');
      setLog('Invalid JSON Format: ' + e.message);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Bulk Project Import (V7)</h1>
      <p className="text-gray-600 mb-4">Paste your V7 JSON array here. This handles Projects, Units, Amenities, and Analysis in one go.</p>
      
      <textarea
        className="w-full h-96 p-4 border rounded font-mono text-sm bg-slate-50"
        placeholder='[ { "name": "Rainbow Mayfair", ... } ]'
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
      />
      
      <div className="mt-4 flex gap-4 items-center">
        <button
          onClick={handleUpload}
          disabled={status === 'uploading'}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {status === 'uploading' ? 'Importing...' : 'Start Import'}
        </button>
        
        {status === 'success' && <span className="text-green-600 font-bold">{log}</span>}
        {status === 'error' && <span className="text-red-600">{log}</span>}
      </div>
    </div>
  );
}
