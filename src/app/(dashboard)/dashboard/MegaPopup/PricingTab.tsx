'use client';

import { DollarSign } from 'lucide-react';
import type { ProjectFullV7, ProjectV7 } from '@/modules/inventory/types-v7';

const getPricingData = (property: ProjectFullV7) => {
  const commercials = property.commercials || [];
  return {
    costExtras: commercials.map(c => ({
      name: c.name,
      type: c.cost_type,
      amount: c.amount
    })),
    maintenance: commercials.find(c => c.name?.toLowerCase().includes('maintenance'))?.amount?.toString(),
    clubhouse: commercials.find(c => c.name?.toLowerCase().includes('clubhouse'))?.amount?.toString()
  };
};

interface Props {
  property: ProjectFullV7;
}

export function PricingTab({ property }: Props) {
  const { costExtras, maintenance, clubhouse } = getPricingData(property);

  return (
    <div className="space-y-4">
      {costExtras.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <DollarSign size={14} /> Additional Costs
          </h4>
          <div className="space-y-2">
            {costExtras.map((extra, i) => (
              <div key={i} className="flex justify-between items-center p-2 bg-amber-50 rounded border border-amber-100">
                <div>
                  <div className="text-sm font-semibold text-amber-900">{extra.name}</div>
                  {extra.type && <div className="text-[10px] text-amber-600">{extra.type}</div>}
                </div>
                <span className="font-mono font-bold text-amber-700 text-sm">
                  {extra.amount ? `₹${(extra.amount / 100000).toFixed(2)}L` : 'TBD'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <h4 className="text-sm font-bold text-slate-700 mb-3">Payment Details</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm py-1.5 border-b border-dashed">
            <span className="text-slate-500">Maintenance Charges</span>
            <span className="font-bold text-slate-800">{maintenance || '-'}</span>
          </div>
          <div className="flex justify-between text-sm py-1.5">
            <span className="text-slate-500">Clubhouse Charges</span>
            <span className="font-bold text-slate-800">{clubhouse || '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
