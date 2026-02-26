// src/components/admin/BulkUploadMapper.tsx
import React, { useState, useEffect } from 'react';

interface BulkUploadMapperProps {
    /** List of column headers extracted from the uploaded Excel sheet */
    columns: string[];
    /** List of available fields from the Prisma model (or a flattened list for the sheet) */
    fields: string[];
    /** Callback when the user updates the mapping. The map is column -> field (or empty string if ignored) */
    onMappingChange: (mapping: Record<string, string>) => void;
}

/**
 * A simple, premium‑looking UI that lets the user map each Excel column to a
 * field in the database. Unmapped columns are ignored during import.
 *
 * The component renders a table where each row is a column header with a dropdown
 * of possible fields. The dropdown is styled with Tailwind utilities to match the
 * rest of the admin UI.
 */
export const BulkUploadMapper: React.FC<BulkUploadMapperProps> = ({
    columns,
    fields,
    onMappingChange,
}) => {
    const [mapping, setMapping] = useState<Record<string, string>>({});

    // Initialise mapping with empty values for each column
    useEffect(() => {
        const initial: Record<string, string> = {};
        columns.forEach(col => {
            initial[col] = '';
        });
        setMapping(initial);
    }, [columns]);

    // Propagate changes upward whenever mapping updates
    useEffect(() => {
        onMappingChange(mapping);
    }, [mapping, onMappingChange]);

    const handleSelect = (col: string, field: string) => {
        setMapping(prev => ({ ...prev, [col]: field }));
    };

    return (
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
            <table className="w-full text-sm text-left bg-white">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-4 py-2 font-medium text-slate-700">Excel Column</th>
                        <th className="px-4 py-2 font-medium text-slate-700">Map to Field</th>
                    </tr>
                </thead>
                <tbody>
                    {columns.map(col => (
                        <tr key={col} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2 text-slate-800">{col}</td>
                            <td className="px-4 py-2">
                                <select
                                    value={mapping[col] ?? ''}
                                    onChange={e => handleSelect(col, e.target.value)}
                                    className="w-full rounded border border-slate-300 bg-slate-50 py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- ignore --</option>
                                    {fields.map(f => (
                                        <option key={f} value={f}>
                                            {f}
                                        </option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
