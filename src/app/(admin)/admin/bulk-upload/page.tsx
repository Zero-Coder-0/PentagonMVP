'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Loader2,
  TableProperties,
  UserCheck,
  FileText
} from 'lucide-react';
import { uploadFullSchema, type BulkUploadResult } from '@/modules/admin/actions-bulk';
import { parseExcelFile, generateExcelTemplateBlob, type FullSchemaUpload } from '@/modules/admin/utils/excel-parser';

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<FullSchemaUpload | null>(null);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'uploading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleParse = async (fileToParse: File) => {
    setStatus('parsing');
    setResult(null);
    setErrorMsg('');

    try {
      if (!fileToParse.name.endsWith('.xlsx')) {
        throw new Error('Only highly structured .xlsx files are supported. Please download the template.');
      }

      const data = await parseExcelFile(fileToParse);

      const totalRows = (data.projects?.length || 0) + (data.users?.length || 0) + (data.drafts?.length || 0);
      if (totalRows === 0) throw new Error('No valid data found in the file.');

      console.log('Parsed Full Schema Payload:', data);
      setParsedData(data);
      setStatus('idle');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || 'Failed to parse Excel file');
      setParsedData(null);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploaded = acceptedFiles[0];
    if (!uploaded) return;
    setFile(uploaded);
    void handleParse(uploaded);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!parsedData) return;

    setStatus('uploading');
    try {
      const response = await uploadFullSchema(parsedData);
      setResult(response);
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Upload failed unexpectedly.');
    }
  };

  const downloadSmartTemplate = async () => {
    try {
      const blob = await generateExcelTemplateBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Full_Schema_Total_Parity_Template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Template generation failed", err);
      alert("Failed to generate template.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 min-h-screen bg-slate-50">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <TableProperties className="text-blue-600" size={32} /> 100% Schema Bulk Importer
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Upload highly structured multi-tab Excel (.xlsx) files. This version captures 100% of the Prisma schema, including Projects, Users, and Drafts.
        </p>
      </div>

      {/* 1. UPLOAD AREA */}
      <div
        {...getRootProps()}
        className={`border-3 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-slate-400'}`}
      >
        <input {...getInputProps()} />
        <div className="flex justify-center mb-4">
          <div className={`p-4 rounded-full ${isDragActive ? 'bg-blue-100' : 'bg-slate-100'}`}>
            <Upload className={`w-10 h-10 ${isDragActive ? 'text-blue-600' : 'text-slate-400'}`} />
          </div>
        </div>
        <p className="text-lg font-medium text-slate-700">
          {isDragActive ? 'Drop your Excel file here' : 'Drag & drop an .xlsx file here, or click to browse'}
        </p>
        <p className="text-sm text-slate-500 mt-2">Only .xlsx is supported for multi-relation uploads</p>
      </div>

      {/* 2. TEMPLATES */}
      <div className="flex gap-4 mt-6 justify-center">
        <button
          onClick={downloadSmartTemplate}
          className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 font-bold px-6 py-3 rounded-xl border border-blue-200 shadow-sm transition"
        >
          <FileSpreadsheet size={18} /> Download 100% Schema Template
        </button>
      </div>

      {/* 3. PREVIEW & ACTIONS */}
      {parsedData && (
        <div className="mt-10 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <CheckCircle className="text-emerald-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Parsed Successfully</h3>
                <div className="flex gap-4 mt-1">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <TableProperties size={14} /> {parsedData.projects?.length || 0} Projects
                  </span>
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <UserCheck size={14} /> {parsedData.users?.length || 0} Users
                  </span>
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <FileText size={14} /> {parsedData.drafts?.length || 0} Drafts
                  </span>
                </div>
              </div>
            </div>

            {status !== 'success' && (
              <button
                onClick={handleUpload}
                disabled={status === 'uploading'}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'uploading' ? (
                  <><Loader2 className="animate-spin" size={18} /> Syncing to DB...</>
                ) : (
                  <><Upload size={18} /> Run Full Sync</>
                )}
              </button>
            )}
          </div>

          {/* Result Summary */}
          {status === 'success' && result && (
            <div className="p-6 bg-green-50 border-b border-green-100">
              <div className="flex items-start gap-4">
                <CheckCircle className="text-green-600 shrink-0 mt-1" size={24} />
                <div className="flex-1">
                  <h4 className="font-bold text-green-900 text-lg">Transaction Complete!</h4>
                  <div className="flex gap-6 mt-2 text-sm">
                    <span className="text-green-800 font-medium">✅ Upserted: {result.success}</span>
                    <span className="text-red-700 font-medium">❌ Errors: {result.failed}</span>
                  </div>

                  {result.errors.length > 0 && (
                    <div className="mt-4 bg-white p-4 rounded-lg border border-red-200 max-h-60 overflow-y-auto">
                      <p className="font-semibold text-red-800 mb-2">Error Detailed Log:</p>
                      <ul className="space-y-1 text-xs text-red-600 font-mono">
                        {result.errors.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Summary */}
          {status === 'error' && (
            <div className="p-6 bg-red-50 border-b border-red-100 flex items-center gap-3">
              <AlertCircle className="text-red-600" />
              <p className="text-red-800 font-medium">{errorMsg}</p>
            </div>
          )}

          {/* Detailed Preview Table for Projects */}
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3">Property Pipeline</th>
                  <th className="px-6 py-3">Zone Mapping</th>
                  <th className="px-6 py-3 text-center">Relational Tree (Units/Amin)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedData.projects?.slice(0, 30).map((p, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{p.project_name || 'Untitled'}</div>
                      <div className="text-xs text-slate-500">{p.developer?.name || 'No Dev Linked'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{p.city_zone || 'NULL'}</div>
                      <div className="text-xs text-slate-500">{p.region || 'NULL'}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.units?.length ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                          {p.units?.length || 0} U
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.amenities?.length ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-400'}`}>
                          {p.amenities?.length || 0} A
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.visits?.length ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                          {p.visits?.length || 0} V
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
