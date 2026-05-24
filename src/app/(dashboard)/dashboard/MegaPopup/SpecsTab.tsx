'use client';

import { Building2 } from 'lucide-react';
import type { ProjectFullV7, ProjectV7 } from '@/modules/inventory/types-v7';

const getSpecsData = (property: ProjectFullV7) => ({
  constructionType: property.construction_type,
  towers: property.no_of_towers,
  floors: property.floors_per_tower,
  elevators: property.elevators_per_tower,
  landArea: property.total_land_area,
  totalUnits: property.total_units,
  builderGrade: property.developer_buildergrade,
  rera: property.rera_registration_no
});

interface Props {
  property: ProjectFullV7;
}

export function SpecsTab({ property }: Props) {
  const data = getSpecsData(property);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Building2 size={16} /> Technical Specifications
      </h3>
      <div className="space-y-6">
        {/* Master Structure */}
        <section className="bg-slate-50 p-3 rounded border border-slate-200">
          <h4 className="text-sm font-medium text-slate-600 mb-2">Master Structure</h4>
          <div className="grid grid-cols-2 gap-4">
            <SpecItem label="Construction Type" value={property.construction_type} />
            <SpecItem label="Structure Details" value={property.structure_details} />
            <SpecItem label="Towers" value={data.towers} />
            <SpecItem label="Total Floors" value={data.floors} />
            <SpecItem label="Units per Floor" value={property.units_per_floor} />
            <SpecItem label="Elevators" value={data.elevators} />
          </div>
        </section>

        {/* Kitchen & Electrical */}
        <section className="bg-slate-50 p-3 rounded border border-slate-200">
          <h4 className="text-sm font-medium text-slate-600 mb-2">Kitchen & Electrical</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-xs font-bold text-slate-400 uppercase mb-1">🍳 Kitchen</h5>
              <SpecItem label="Countertop" value={property.kitchen_countertop} />
              <SpecItem label="Sink/Fittings" value={property.kitchen_sink_details} />
              <SpecItem label="Gas Pipeline" value={property.gas_pipeline_provision} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-400 uppercase mb-1">🔌 Electrical</h5>
              <SpecItem label="Power Backup" value={property.power_backup} />
              <SpecItem label="Switches" value={property.electrical_switches} />
            </div>
          </div>
        </section>

        {/* Doors */}
        <section className="bg-slate-50 p-3 rounded border border-slate-200">
          <h4 className="text-sm font-medium text-slate-600 mb-2">Doors</h4>
          <SpecItem label="Main Door" value={property.main_door_specs} />
          <SpecItem label="Internal Doors" value={property.internal_doors_specs} />
        </section>

        {/* Flooring & Bathrooms */}
        <section className="bg-slate-50 p-3 rounded border border-slate-200">
          <h4 className="text-sm font-medium text-slate-600 mb-2">Finishes</h4>
          { (property.flooring_living_dining || property.flooring_master_bedroom) && (
            <SpecItem label="Flooring" value={`${property.flooring_living_dining || '-'} (Living/Dining), ${property.flooring_master_bedroom || '-'} (Master)`} />
          ) }
          { property.bathroom_sanitary_ware && (
            <SpecItem label="Bathrooms" value={property.bathroom_sanitary_ware} />
          ) }
        </section>

        {/* Summary */}
        <section className="bg-slate-50 p-3 rounded border border-slate-200">
          <h4 className="text-sm font-medium text-slate-600 mb-2">Project Summary</h4>
          <div className="grid grid-cols-2 gap-4">
            <SpecItem label="Land Area" value={data.landArea ? `${data.landArea} Acres` : '-'} />
            <SpecItem label="Total Units" value={data.totalUnits} />
            <SpecItem label="Builder Grade" value={data.builderGrade} />
            <SpecItem label="RERA No" value={data.rera} />
          </div>
        </section>
      </div>
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex justify-between items-center text-sm py-1.5 border-b border-dashed border-slate-200 last:border-0">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className="font-bold text-slate-800 text-right">{value || '-'}</span>
    </div>
  );
}
