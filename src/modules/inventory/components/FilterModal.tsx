import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { FilterCriteriaV7 as FilterCriteria } from '../types-v7';
import {
  PROJECT_STATUSES,
  CITY_ZONES,
  BHK_CONFIGS,
  PROPERTY_TYPES,
  BUILDER_GRADES,
  UNIT_FACINGS,
  UNIT_VARIANTS,
  BATHROOM_COUNTS,
  BALCONY_COUNTS,
  POSSESSION_MONTHS,
  POSSESSION_YEARS,
} from '@/lib/project-constants';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  criteria: FilterCriteria;
  onUpdate: (c: FilterCriteria) => void;
  onReset: () => void;
}

export default function FilterModal({ isOpen, onClose, criteria, onUpdate, onReset }: FilterModalProps) {
  if (!isOpen) return null;

  const safeCriteria: FilterCriteria = criteria || {
    status: [],
    city_zones: [],
    configurations: [],
    facing: [],
    minPrice: 0,
    maxPrice: 0,
    sqFtMin: 0,
    sqFtMax: 0,
    possessionYear: '',
    builderGrades: [],
    amenities: [],
    balconyCount: [],
    bathroomCount: [],
    unitVariant: [],
  };

  function toggleArray(field: keyof FilterCriteria, value: string) {
    const current = (safeCriteria[field] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((i) => i !== value)
      : [...current, value];
    onUpdate({ ...safeCriteria, [field]: updated });
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-lg">Refine Search</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-7 flex-1">

          {/* Property Status — PROJECT_STATUSES constant */}
          <Section title="Property Status">
            {Object.values(PROJECT_STATUSES).map((s) => (
              <Chip
                key={s.value}
                label={s.label}
                active={safeCriteria.status?.includes(s.value) ?? false}
                onClick={() => toggleArray('status', s.value)}
              />
            ))}
          </Section>

          {/* BHK / Config — BHK_CONFIGS constant */}
          <Section title="BHK Configuration">
            {BHK_CONFIGS.map((conf) => (
              <Chip
                key={conf}
                label={conf}
                active={safeCriteria.configurations?.includes(conf) ?? false}
                onClick={() => toggleArray('configurations', conf)}
              />
            ))}
          </Section>

          {/* Property Type — PROPERTY_TYPES constant */}
          <Section title="Property Type">
            {PROPERTY_TYPES.map((type) => (
              <Chip
                key={type}
                label={type}
                active={safeCriteria.configurations?.includes(type) ?? false}
                onClick={() => toggleArray('configurations', type)}
              />
            ))}
          </Section>

          {/* City Zones — CITY_ZONES constant */}
          <Section title="City Zones (Bangalore)">
            {CITY_ZONES.map((zone) => (
              <Chip
                key={zone}
                label={zone}
                active={safeCriteria.city_zones?.includes(zone) ?? false}
                onClick={() => toggleArray('city_zones', zone)}
              />
            ))}
          </Section>

          {/* Builder Grade — BUILDER_GRADES constant */}
          <Section title="Builder Grade">
            {BUILDER_GRADES.map((grade) => (
              <Chip
                key={grade}
                label={`Grade ${grade}`}
                active={safeCriteria.builderGrades?.includes(grade) ?? false}
                onClick={() => toggleArray('builderGrades', grade)}
              />
            ))}
          </Section>

          {/* Unit Variant */}
          <Section title="Unit Variant / Class">
            {UNIT_VARIANTS.map((v) => (
              <Chip
                key={v}
                label={v}
                active={safeCriteria.unitVariant?.includes(v as any) ?? false}
                onClick={() => toggleArray('unitVariant', v)}
              />
            ))}
          </Section>

          {/* Bathrooms */}
          <Section title="Bathrooms">
            {BATHROOM_COUNTS.map((c) => (
              <Chip
                key={c}
                label={c}
                active={safeCriteria.bathroomCount?.includes(c as any) ?? false}
                onClick={() => toggleArray('bathroomCount', c)}
              />
            ))}
          </Section>

          {/* Balconies */}
          <Section title="Balconies">
            {BALCONY_COUNTS.map((c) => (
              <Chip
                key={c}
                label={c}
                active={safeCriteria.balconyCount?.includes(c as any) ?? false}
                onClick={() => toggleArray('balconyCount', c)}
              />
            ))}
          </Section>

          {/* Facing — UNIT_FACINGS constant */}
          <Section title="Facing">
            <div className="grid grid-cols-2 gap-2 w-full">
              {UNIT_FACINGS.map((face) => (
                <label
                  key={face}
                  className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition"
                >
                  <input
                    type="checkbox"
                    checked={safeCriteria.facing?.includes(face as any) ?? false}
                    onChange={() => toggleArray('facing', face)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{face}</span>
                </label>
              ))}
            </div>
          </Section>

          {/* Possession Date — POSSESSION_YEARS & POSSESSION_MONTHS constant */}
          <Section title="Possession By">
            <div className="flex gap-3 items-center w-full">
              <select
                value={(safeCriteria.possessionYear || '').split('-')[1] || (safeCriteria.possessionYear && !safeCriteria.possessionYear.includes('-') && isNaN(Number(safeCriteria.possessionYear)) ? safeCriteria.possessionYear : '') || ''}
                onChange={(e) => {
                  const y = (safeCriteria.possessionYear || '').split('-')[0] || (safeCriteria.possessionYear && !isNaN(Number(safeCriteria.possessionYear.split('-')[0])) ? safeCriteria.possessionYear.split('-')[0] : '');
                  const m = e.target.value;
                  onUpdate({ ...safeCriteria, possessionYear: (y && m) ? `${y}-${m}` : (y || m || '') });
                }}
                className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm bg-white cursor-pointer"
              >
                <option value="">Any Month</option>
                {POSSESSION_MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                value={(safeCriteria.possessionYear || '').split('-')[0] || (safeCriteria.possessionYear && !isNaN(Number(safeCriteria.possessionYear.split('-')[0])) ? safeCriteria.possessionYear.split('-')[0] : '') || ''}
                onChange={(e) => {
                  const m = (safeCriteria.possessionYear || '').split('-')[1] || (safeCriteria.possessionYear && !safeCriteria.possessionYear.includes('-') && isNaN(Number(safeCriteria.possessionYear)) ? safeCriteria.possessionYear : '');
                  const y = e.target.value;
                  onUpdate({ ...safeCriteria, possessionYear: (y && m) ? `${y}-${m}` : (y || m || '') });
                }}
                className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm bg-white cursor-pointer"
              >
                <option value="">Any Year</option>
                {POSSESSION_YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </Section>

          {/* Budget Range */}
          <Section title="Budget Range (₹)">
            <div className="flex gap-3 items-center w-full">
              <input
                type="number"
                className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm"
                placeholder="Min (e.g. 5000000)"
                value={safeCriteria.minPrice || ''}
                onChange={(e) => onUpdate({ ...safeCriteria, minPrice: Number(e.target.value) })}
              />
              <span className="text-slate-300">–</span>
              <input
                type="number"
                className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm"
                placeholder="Max (e.g. 15000000)"
                value={safeCriteria.maxPrice || ''}
                onChange={(e) => onUpdate({ ...safeCriteria, maxPrice: Number(e.target.value) })}
              />
            </div>
          </Section>

          {/* Area Range */}
          <Section title="Area (Sq. Ft)">
            <div className="flex gap-3 items-center w-full">
              <input
                type="number"
                className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm"
                placeholder="Min sqft"
                value={safeCriteria.sqFtMin || ''}
                onChange={(e) => onUpdate({ ...safeCriteria, sqFtMin: Number(e.target.value) })}
              />
              <span className="text-slate-300">–</span>
              <input
                type="number"
                className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm"
                placeholder="Max sqft"
                value={safeCriteria.sqFtMax || ''}
                onChange={(e) => onUpdate({ ...safeCriteria, sqFtMax: Number(e.target.value) })}
              />
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            onClick={onReset}
            className="px-4 py-3 rounded-xl border border-slate-300 text-slate-600 font-bold flex items-center gap-2 hover:bg-white transition"
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition"
          >
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Local sub-components ─────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{title}</h4>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 active:scale-95 ${active
        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30'
        }`}
    >
      {label}
    </button>
  );
}
