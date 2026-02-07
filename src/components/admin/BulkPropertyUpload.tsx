// src/components/admin/BulkPropertyUpload.tsx
'use client';

import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';

interface UploadResult {
  total: number;
  success: number;
  failed: number;
  errors: Array<{ row: number; errors: string[] }>;
  projectIds: string[];
}

export default function BulkPropertyUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (uploadedFile: File) => {
    // Validate file type
    if (!uploadedFile.name.endsWith('.xlsx') && !uploadedFile.name.endsWith('.xls')) {
      alert('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    // Validate file size (max 10MB)
    if (uploadedFile.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setFile(uploadedFile);
    setResult(null); // Clear previous results
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/properties/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResult(data);

      // Clear file if all succeeded
      if (data.failed === 0) {
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error: any) {
      alert(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    // This should point to your hosted template or trigger a download
    window.open('/GeoEstate_Property_Master_Template.xlsx', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Bulk Property Upload</h3>
          <p className="text-sm text-slate-500 mt-1">
            Upload Excel file with property data (max 100 properties)
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
        >
          <Download size={16} />
          Download Template
        </button>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 bg-slate-50 hover:border-slate-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <FileSpreadsheet className="w-8 h-8 text-blue-600" />
          </div>

          {file ? (
            <div className="text-center">
              <p className="font-semibold text-slate-900">{file.name}</p>
              <p className="text-sm text-slate-500 mt-1">
                {(file.size / 1024).toFixed(2)} KB
              </p>
              <button
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-sm text-red-600 hover:text-red-700 mt-2"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-slate-700 font-medium">
                Drag and drop your Excel file here
              </p>
              <p className="text-sm text-slate-500 mt-1">or</p>
              <label
                htmlFor="file-upload"
                className="inline-block mt-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Browse Files
              </label>
            </div>
          )}

          <p className="text-xs text-slate-400">
            Supports .xlsx and .xls files (max 10MB)
          </p>
        </div>
      </div>

      {/* Upload Button */}
      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={20} />
              Upload & Import Properties
            </>
          )}
        </button>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Total Processed</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">{result.total}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Success</p>
              <p className="text-3xl font-bold text-green-700 mt-1">{result.success}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600 font-medium">Failed</p>
              <p className="text-3xl font-bold text-red-700 mt-1">{result.failed}</p>
            </div>
          </div>

          {/* Success Message */}
          {result.success > 0 && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">
                  {result.success} propert{result.success === 1 ? 'y' : 'ies'} imported successfully!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Properties are now live in the inventory.
                </p>
              </div>
            </div>
          )}

          {/* Errors */}
          {result.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">
                    {result.errors.length} row{result.errors.length === 1 ? '' : 's'} failed
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Fix the errors below and re-upload
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                {result.errors.map((error, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-red-200 rounded p-3 text-sm"
                  >
                    <p className="font-semibold text-red-900">
                      Row {error.row}:
                    </p>
                    <ul className="mt-1 space-y-1 text-red-700">
                      {error.errors.map((msg, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-red-500">•</span>
                          {msg}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-2">Quick Guide:</p>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Download the Excel template using the button above</li>
              <li>Fill property details starting from Row 4 (Row 3 is example)</li>
              <li>Required fields (yellow) must be filled</li>
              <li>Upload file (max 100 properties per upload)</li>
              <li>Review results and fix any errors if needed</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
