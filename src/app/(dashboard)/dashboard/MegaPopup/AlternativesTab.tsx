'use client';

import { Zap, MapPin, TrendingDown, Award, Home } from 'lucide-react';
import type { ProjectFullV7, ProjectV7 } from '@/modules/inventory/types-v7';
import { useDashboard } from '../page';
import { useMemo } from 'react';
import { GeoCalc } from '@/modules/map-engine/utils/geo-calc';

interface Props {
    property: ProjectFullV7;
}

// Normalize BHK strings: "2 BHK", "2BHK", "2bhk" → "2bhk"
const normalizeBHK = (s: string) =>
    s.toLowerCase().replace(/\s+/g, '').replace(/bhk/g, '') + 'bhk';

const extractConfigs = (configurations?: string[]): string[] => {
    if (!configurations || !Array.isArray(configurations)) return [];
    return configurations
        .flatMap(cfg => (typeof cfg === 'string' ? cfg.split(',').map(c => c.trim()) : []))
        .filter(Boolean)
        .map(normalizeBHK);
};

interface ScoredAlternative extends ProjectV7 {
    distance: number;
    score: number;
    matchReasons: {
        sameZone: boolean;
        sameConfig: boolean;
        lesserPrice: boolean;
        similarPrice: boolean;
        premiumValue: boolean;
        similarBuilder: boolean;
        nearby: boolean;
    };
}

export function AlternativesTab({ property }: Props) {
    const { properties } = useDashboard();
    const currentConfigs = useMemo(() => extractConfigs(property.configurations), [property.configurations]);

    const alternatives = useMemo(() => {
        if (!property || !properties) return [];

        const currentPriceMin = property.pricemin || 0;
        const currentPriceMax = property.pricemax || 0;

        // Calculate scores for all matching alternatives
        const scoredResults: ScoredAlternative[] = properties
            .filter(p => p.id !== property.id)
            .map(p => {
                const distance = GeoCalc.getDistanceKm(
                    property.lat ?? 0,
                    property.lng ?? 0,
                    p.lat ?? 0,
                    p.lng ?? 0
                );

                const altConfigs = extractConfigs(p.configurations);
                const sameConfig = altConfigs.some(ac => currentConfigs.includes(ac));

                const pMin = p.pricemin || 0;
                const pMax = p.pricemax || 0;

                // Match criteria
                const sameZone = p.city_zone === property.city_zone;
                const lesserPrice = pMax < currentPriceMin;
                const similarPrice = pMin <= currentPriceMax * 1.2 && pMax >= currentPriceMin * 0.8;
                const premiumValue = pMin > currentPriceMax && pMin <= currentPriceMax * 1.3;
                const similarBuilder = !!p.developer_buildergrade && p.developer_buildergrade === property.developer_buildergrade;
                const nearby = distance <= 5; // Within 5km

                // **WEIGHTED SCORING FORMULA**
                // Priority: Zone > Config > Price > Distance > Builder
                let score = 0;

                if (sameZone) score += 40;           // Highest priority (same area)
                if (sameConfig) score += 30;         // Second priority (same config)
                if (lesserPrice) score += 25;        // Cheaper = very attractive
                if (similarPrice) score += 15;       // Similar price range
                if (nearby) score += 20;             // Close distance bonus
                if (premiumValue) score += 10;       // Slightly premium (upsell)
                if (similarBuilder) score += 8;      // Similar brand quality

                // Distance penalty (further = lower score)
                if (distance <= 2) score += 15;
                else if (distance <= 5) score += 10;
                else if (distance <= 10) score += 5;
                else score -= 5; // Penalty for > 10km

                // Only return properties with meaningful matches (lowered from 20 to 10 for smaller databases)
                if (score < 10) return null;

                return {
                    ...p,
                    distance,
                    score,
                    matchReasons: {
                        sameZone,
                        sameConfig,
                        lesserPrice,
                        similarPrice,
                        premiumValue,
                        similarBuilder,
                        nearby,
                    },
                };
            })
            .filter((p): p is ScoredAlternative => p !== null);

        // Sort by score (highest first), then by distance (closest first)
        return scoredResults
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return a.distance - b.distance;
            })
            .slice(0, 8); // Top 8 alternatives

    }, [property, properties, currentConfigs]);

    if (alternatives.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 bg-white rounded-xl border border-slate-200 border-dashed">
                <Zap size={32} className="mb-2 opacity-20" />
                <p className="text-sm font-medium">No similar alternatives found</p>
                <p className="text-xs mt-1 opacity-70">
                    Try searching in nearby zones or different configurations
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 border border-blue-800 p-4 rounded-xl flex items-center gap-3 shadow-lg">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                    <Zap size={16} fill="currentColor" strokeWidth={2} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                        🎯 AI-Powered Alternatives
                    </h4>
                    <p className="text-xs text-blue-100 font-medium mt-0.5">
                        {alternatives.length} smart recommendations ranked by zone, price & config match
                    </p>
                </div>
            </div>

            {/* Alternatives Grid */}
            <div className="grid gap-3">
                {alternatives.map((alt, index) => {
                    const { matchReasons } = alt;
                    const isTopPick = index === 0;

                    return (
                        <div
                            key={alt.id}
                            className={`
                                relative bg-white p-4 rounded-xl border shadow-sm 
                                hover:border-blue-400 hover:shadow-md transition-all group
                                ${isTopPick ? 'border-blue-500 border-2 shadow-blue-100' : 'border-slate-200'}
                            `}
                        >
                            {/* Top Pick Badge */}
                            {isTopPick && (
                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    <Award size={10} fill="white" />
                                    TOP PICK
                                </div>
                            )}

                            {/* Property Header */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h5 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-base leading-tight">
                                        {alt.project_name}
                                    </h5>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5 flex-wrap">
                                        {/* Distance Badge */}
                                        <span className="flex items-center gap-1 font-black text-white bg-blue-600 px-2.5 py-0.5 rounded-md shadow-sm">
                                            <MapPin size={10} strokeWidth={3} />
                                            {alt.distance.toFixed(1)} km
                                        </span>

                                        {/* Region */}
                                        <span className="font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded italic">
                                            {alt.region}
                                        </span>

                                        {/* Score Indicator */}
                                        <span className="ml-auto text-[10px] font-bold text-slate-400">
                                            Match: {alt.score}%
                                        </span>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="text-right ml-3">
                                    <div className="text-lg font-black text-slate-900 leading-none whitespace-nowrap">
                                        {alt.pricedisplay}
                                    </div>
                                    <div className="text-[10px] text-slate-400 uppercase font-bold mt-1">
                                        Onwards
                                    </div>
                                </div>
                            </div>

                            {/* Match Reason Chips */}
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {matchReasons.sameZone && (
                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] font-bold shadow-sm">
                                        ✓ SAME ZONE
                                    </span>
                                )}
                                {matchReasons.sameConfig && (
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold shadow-sm">
                                        ✓ SAME CONFIG
                                    </span>
                                )}
                                {matchReasons.lesserPrice && (
                                    <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-[10px] font-bold shadow-sm flex items-center gap-1">
                                        <TrendingDown size={10} strokeWidth={3} />
                                        LOWER PRICE
                                    </span>
                                )}
                                {matchReasons.similarPrice && !matchReasons.lesserPrice && (
                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold shadow-sm">
                                        ~ SIMILAR PRICE
                                    </span>
                                )}
                                {matchReasons.premiumValue && (
                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold shadow-sm">
                                        ⬆ PREMIUM OPTION
                                    </span>
                                )}
                                {matchReasons.nearby && (
                                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-bold shadow-sm flex items-center gap-1">
                                        <Home size={10} strokeWidth={3} />
                                        NEARBY
                                    </span>
                                )}
                                {matchReasons.similarBuilder && (
                                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px] font-bold shadow-sm">
                                        ⭐ SIMILAR BRAND
                                    </span>
                                )}
                            </div>

                            {/* Configurations */}
                            <div className="mt-3 pt-3 border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
                                {alt.configurations.slice(0, 5).map((cfg, idx) => (
                                    <span
                                        key={idx}
                                        className={`
                                            px-2 py-0.5 text-[10px] font-black rounded border uppercase tracking-tighter whitespace-nowrap
                                            ${extractConfigs([cfg]).some(c => currentConfigs.includes(c))
                                                ? 'bg-blue-100 text-blue-700 border-blue-300'
                                                : 'bg-slate-50 text-slate-400 border-slate-200'
                                            }
                                        `}
                                    >
                                        {cfg}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Tip */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
                <span className="font-bold text-slate-700">💡 Sales Tip:</span> Properties are ranked by{' '}
                <span className="font-bold">zone proximity</span>, matching <span className="font-bold">configuration</span>,
                and <span className="font-bold">competitive pricing</span> to maximize conversion.
            </div>
        </div>
    );
}
