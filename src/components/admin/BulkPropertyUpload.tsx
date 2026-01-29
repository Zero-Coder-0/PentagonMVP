'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { UploadCloud, FileSpreadsheet, Loader2 } from 'lucide-react'
import { createClient } from '@/core/db/client'
import { parsePropertyInput } from '@/modules/inventory/utils/data-parser'

export default function BulkPropertyUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [stats, setStats] = useState({ total: 0, success: 0, errors: 0 })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setStats({ total: 0, success: 0, errors: 0 })

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        await processRows(results.data)
        setIsUploading(false)
      }
    })
  }

  const processRows = async (rows: any[]) => {
    const supabase = createClient()
    let successCount = 0
    let errorCount = 0

    // Process in batches of 10 to be safe
    const BATCH_SIZE = 10;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
       const batch = rows.slice(i, i + BATCH_SIZE);
       
       const promises = batch.map(async (row) => {
          try {
             // 1. Run the Master Parser
             const cleanData = parsePropertyInput(row);
             
             // 2. Insert into Properties (Live)
             const { error } = await supabase.from('properties').insert(cleanData);
             if (error) throw error;
             
             successCount++;
          } catch (err) {
             console.error("Row Failed:", row, err);
             errorCount++;
          }
       });

       await Promise.all(promises);
       setStats({ total: rows.length, success: successCount, errors: errorCount });
    }
    
    if(successCount > 0) alert(`Upload Complete! ${successCount} properties added.`);
  }

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-xl">
      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        <FileSpreadsheet className="text-green-600"/> Bulk Import
      </h3>
      
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition cursor-pointer relative">
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileUpload}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center text-slate-500">
            <Loader2 className="animate-spin w-8 h-8 mb-2 text-blue-600" />
            <p>Processing {stats.total} rows...</p>
            <p className="text-xs">Success: {stats.success} | Fail: {stats.errors}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-slate-500">
            <UploadCloud className="w-10 h-10 mb-2 text-slate-400" />
            <p className="font-medium text-slate-700">Click to Upload CSV</p>
            <p className="text-xs mt-1">Supports auto-mapping & extra columns</p>
          </div>
        )}
      </div>
    </div>
  )
}
