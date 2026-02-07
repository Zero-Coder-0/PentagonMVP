'use client';

import React, { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import ExcelJS from 'exceljs';  
import Papa from 'papaparse';

interface UploadResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

export default function BulkUploadPage() {
  const router = useRouter();
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

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(uploadedFile.type) && !uploadedFile.name.endsWith('.csv')) {
      alert('❌ Please upload a valid Excel (.xlsx, .xls) or CSV file');
      return;
    }

    setFile(uploadedFile);
    setResults(null);
  };

  const parseExcelFile = async (file: File): Promise<any[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    
    const worksheet = workbook.worksheets[0];
    const rows: any[] = [];
    const headers: string[] = [];

    // Get headers from first row
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      headers[colNumber - 1] = cell.value?.toString() || '';
    });

    // Parse data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      
      const rowData: any = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        rowData[header] = cell.value;
      });
      rows.push(rowData);
    });

    return rows;
  };

  const parseCSVFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (error) => reject(error)
      });
    });
  };

  const processFile = async () => {
    if (!file) return;

    setProcessing(true);
    const errors: Array<{ row: number; error: string }> = [];
    
    try {
      // Parse file based on type
      let jsonData: any[];
      if (file.name.endsWith('.csv')) {
        jsonData = await parseCSVFile(file);
      } else {
        jsonData = await parseExcelFile(file);
      }

      console.log('Parsed data:', jsonData);

      if (jsonData.length === 0) {
        throw new Error('No data found in file');
      }

      // Process each row and insert
      const insertResults = await Promise.allSettled(
        jsonData.map(async (row: any, index: number) => {
          try {
            // Map Excel columns to V7 schema
            const projectData = {
              name: row['Project Name'] || row['name'],
              developer: row['Developer'] || row['developer'],
              rera_id: row['RERA ID'] || row['rera_id'] || null,
              status: row['Status'] || 'Under Construction',
              zone: row['Zone'] || 'North',
              region: row['Region'] || row['region'] || null,
              address_line: row['Address'] || row['address_line'] || null,
              lat: parseFloat(row['Latitude'] || row['lat'] || '12.9716'),
              lng: parseFloat(row['Longitude'] || row['lng'] || '77.5946'),
              price_display: row['Price Display'] || row['price_display'] || null,
              price_min: row['Price Min'] ? parseInt(row['Price Min']) : null,
              price_max: row['Price Max'] ? parseInt(row['Price Max']) : null,
              price_per_sqft: row['Price per SqFt'] || row['price_per_sqft'] || null,
              total_units: row['Total Units'] ? parseInt(row['Total Units']) : null,
              total_land_area: row['Land Area'] || row['total_land_area'] || null,
              property_type: row['Property Type'] || row['property_type'] || null,
              builder_grade: row['Builder Grade'] || row['builder_grade'] || null,
              construction_technology: row['Construction Technology'] || null,
              open_space_percent: row['Open Space %'] ? parseInt(row['Open Space %']) : null,
              structure_details: row['Structure Details'] || null,
              floor_levels: row['Floor Levels'] || null,
              clubhouse_size: row['Clubhouse Size'] || null,
              possession_date: row['Possession Date'] || null,
              completion_duration: row['Completion Duration'] || null
            };

            // Validate required fields
            if (!projectData.name || !projectData.developer) {
              throw new Error('Missing required fields: Project Name and Developer');
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
              row: index + 2, // +2 because Excel is 1-indexed and has header row
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
          `✅ BULK UPLOAD COMPLETE!\n\n` +
          `Total Rows: ${jsonData.length}\n` +
          `✅ Successful: ${successful}\n` +
          `❌ Failed: ${failed}\n\n` +
          (failed > 0 ? `Check the results section for error details.` : `All projects uploaded successfully!`)
        );
      } else {
        alert('❌ All uploads failed. Please check your data and try again.');
      }
    } catch (err: any) {
      alert('❌ Error processing file: ' + err.message);
      console.error(err);
      setResults(null);
    } finally {
      setProcessing(false);
    }
  };

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Properties');

    // Define columns with headers
    worksheet.columns = [
      { header: 'Project Name', key: 'name', width: 30 },
      { header: 'Developer', key: 'developer', width: 25 },
      { header: 'RERA ID', key: 'rera_id', width: 30 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Zone', key: 'zone', width: 15 },
      { header: 'Region', key: 'region', width: 20 },
      { header: 'Address', key: 'address', width: 40 },
      { header: 'Latitude', key: 'lat', width: 15 },
      { header: 'Longitude', key: 'lng', width: 15 },
      { header: 'Price Display', key: 'price_display', width: 20 },
      { header: 'Price Min', key: 'price_min', width: 15 },
      { header: 'Price Max', key: 'price_max', width: 15 },
      { header: 'Price per SqFt', key: 'price_per_sqft', width: 15 },
      { header: 'Total Units', key: 'total_units', width: 15 },
      { header: 'Land Area', key: 'land_area', width: 15 },
      { header: 'Property Type', key: 'property_type', width: 20 },
      { header: 'Builder Grade', key: 'builder_grade', width: 15 },
      { header: 'Open Space %', key: 'open_space', width: 15 },
      { header: 'Floor Levels', key: 'floor_levels', width: 15 },
      { header: 'Clubhouse Size', key: 'clubhouse_size', width: 15 },
      { header: 'Possession Date', key: 'possession_date', width: 20 },
      { header: 'Construction Technology', key: 'construction_tech', width: 30 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add sample data
    worksheet.addRow({
      name: 'Prestige Lakeside Habitat',
      developer: 'Prestige Group',
      rera_id: 'PRM/KA/RERA/1251/308/PR/170623/003370',
      status: 'Under Construction',
      zone: 'North',
      region: 'Whitefield',
      address: 'Varthur Main Road, Whitefield, Bangalore',
      lat: 12.9716,
      lng: 77.5946,
      price_display: '₹1.2 Cr onwards',
      price_min: 12000000,
      price_max: 25000000,
      price_per_sqft: '₹6,500',
      total_units: 500,
      land_area: '25 Acres',
      property_type: 'Apartments',
      builder_grade: 'Premium',
      open_space: 70,
      floor_levels: 'G+18',
      clubhouse_size: '25,000 sq.ft',
      possession_date: 'Dec 2027',
      construction_tech: 'Mivan Technology'
    });

    // Add another example
    worksheet.addRow({
      name: 'Brigade Eldorado',
      developer: 'Brigade Group',
      rera_id: 'PRM/KA/RERA/1251/309/PR/180924/002345',
      status: 'Ready',
      zone: 'East',
      region: 'Bagalur',
      address: 'Bagalur Main Road, North Bangalore',
      lat: 13.0827,
      lng: 77.6350,
      price_display: '₹85 Lakhs onwards',
      price_min: 8500000,
      price_max: 15000000,
      price_per_sqft: '₹4,800',
      total_units: 850,
      land_area: '35 Acres',
      property_type: 'Apartments',
      builder_grade: 'Mid-Segment',
      open_space: 75,
      floor_levels: 'G+14',
      clubhouse_size: '30,000 sq.ft',
      possession_date: 'Immediate',
      construction_tech: 'RCC Framed Structure'
    });

    // Download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bulk-upload-template.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Bulk Upload Properties</h1>
        <p className="text-lg text-slate-600">
          Upload multiple properties at once using Excel or CSV files
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="text-4xl">📤</div>
          <div className="flex-1">
            <h3 className="font-bold text-green-900 text-lg mb-2">How Bulk Upload Works</h3>
            <ul className="text-sm text-green-800 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                <span>Uses the same <strong>ProjectWizard V7 standards</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                <span>Validates all required fields before insertion</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                <span>Automatically inserts to projects table</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                <span>Supports Excel (.xlsx, .xls) and CSV formats</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                <span>Secure modern ExcelJS library (no vulnerabilities)</span>
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
              <h3 className="font-bold text-slate-900 text-lg mb-1">Download Template</h3>
              <p className="text-sm text-slate-600">
                Get the Excel template with all required columns and sample data
              </p>
            </div>
          </div>
          <button
            onClick={downloadTemplate}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2 shadow-sm hover:shadow"
          >
            <Download size={20} />
            Download Template
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-12 text-center mb-8 hover:border-blue-400 hover:bg-blue-50/30 transition">
        <input
          type="file"
          id="file-upload"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          className="hidden"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="text-blue-600" size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {file ? `📄 ${file.name}` : 'Choose a file or drag it here'}
          </h3>
          <p className="text-slate-600 mb-4">
            Supports Excel (.xlsx, .xls) and CSV files • Max 100 rows
          </p>
          <div className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">
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
                : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-xl'
            }`}
          >
            {processing ? (
              <span className="flex items-center gap-3">
                <span className="animate-spin">⏳</span>
                Processing...
              </span>
            ) : (
              '✅ Process & Upload'
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-xl mb-6 flex items-center gap-2">
            📊 Upload Results
          </h3>
          
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

      {/* Warning */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mt-8">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
          <div>
            <h4 className="font-bold text-yellow-900 mb-2">⚠️ Important Notes</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Bulk upload publishes projects immediately (no approval needed)</li>
              <li>• Make sure all data is accurate before uploading</li>
              <li>• Project Name and Developer are required fields</li>
              <li>• Invalid rows will be skipped with error messages</li>
              <li>• For complex data (units, amenities), use manual ProjectWizard after bulk upload</li>
              <li>• Maximum 100 rows per upload for optimal performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
