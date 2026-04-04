'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { MapPin, Search, Filter, X, ChevronDown, Calendar, Building2, HardHat } from 'lucide-react';
import { useDashboard } from './page';
import LocationSearch from '@/modules/map-engine/components/LocationSearch';
import {
    PROJECT_STATUSES,
    PROJECT_STATUS_VALUES,
    CITY_ZONES,
    BHK_CONFIGS,
    PROPERTY_TYPES,
    BUILDER_GRADES,
    CONSTRUCTION_TYPES,
    POSSESSION_MONTHS,
    POSSESSION_YEARS,
    UNIT_VARIANTS,
    UNIT_FACINGS,
    BATHROOM_COUNTS,
    BALCONY_COUNTS,
} from '@/lib/project-constants';

const QUICK_LOCATIONS = [
    { name: 'Hebbal', lat: 13.0354, lng: 77.5988 },
    { name: 'Whitefield', lat: 12.9698, lng: 77.7500 },
    { name: 'Yelahanka', lat: 13.1007, lng: 77.5963 },
    { name: 'Sarjapur', lat: 12.9237, lng: 77.6547 },
];

export default function DashboardNavbar() {
    const {
        setUserLocation, setMapBounds, userLocation,
        filters, setFilters, resetFilters,
        filtersOpen, setFiltersOpen,
        filterOptions
    } = useDashboard();

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setFiltersOpen(false);
            }
        }
        if (filtersOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [filtersOpen, setFiltersOpen]);

    const handleLocationUpdate = (lat: number, lng: number, name: string) => {
        setUserLocation({ lat, lng, displayName: name });
        setMapBounds([
            [lat - 0.03, lng - 0.03],
            [lat + 0.03, lng + 0.03]
        ]);
    };

    const handleClearLocation = () => {
        setUserLocation(null);
        setMapBounds(undefined);
    };

    // No need for dynamically generated years, use exact constants
    const possessionYears = POSSESSION_YEARS;

    const currentPossession = useMemo(() => {
        if (!filters.possessionYear) return { month: '', year: '' };
        const [y, m] = filters.possessionYear.split('-');
        return { month: m || '', year: y || '' };
    }, [filters.possessionYear]);

    const activeFilterCount =
        (filters.status?.length || 0) +
        (filters.city_zones?.length || 0) +
        (filters.configurations?.length || 0) +
        (filters.facing?.length || 0) +
        (filters.amenities?.length || 0) +
        (filters.technology?.length || 0) +
        (filters.builderGrades?.length || 0) +
        (filters.minPrice > 0 ? 1 : 0) +
        (filters.maxPrice > 0 ? 1 : 0) +
        (filters.possessionYear ? 1 : 0) +
        (filters.balconyCount?.length || 0) +
        (filters.bathroomCount?.length || 0) +
        (filters.unitVariant?.length || 0);

    const toggleFilter = (
        key: 'status' | 'city_zones' | 'configurations' | 'facing' | 'amenities' | 'technology' | 'builderGrades' | 'balconyCount' | 'bathroomCount' | 'unitVariant',
        value: string
    ) => {
        const current = (filters[key] as string[]) || [];
        const updated = current.includes(value)
            ? current.filter((v: string) => v !== value)
            : [...current, value];
        setFilters({ ...filters, [key]: updated });
    };

    const handlePossessionChange = (month: string, year: string) => {
        if (!month && !year) {
            setFilters({ ...filters, possessionYear: '' });
            return;
        }
        // Store as "YEAR-MONTH" or just "YEAR" if no month picked
        const combined = year && month ? `${year}-${month}` : year || '';
        setFilters({ ...filters, possessionYear: combined });
    };

    return (
        <nav className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200 shadow-sm z-50 relative min-h-[56px] w-full">
            
            {/* 1. Left side - Logo (Pentagon-like) */}
            <div className="flex items-center gap-2 mr-4">
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-200 rotate-3 hover:rotate-0 transition-transform">
                    G
                </div>
                <span className="hidden lg:block text-sm font-black text-slate-900 tracking-tight">GeoEstate</span>
            </div>

            {/* 2. Middle - Search Controls */}
            <div className="flex-1 flex justify-center">
                <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-200 shadow-inner max-w-xl w-full">
                    {/* Quick location pills */}
                    <div className="hidden xl:flex items-center gap-1 pr-2 border-r border-slate-200 mr-2">
                        {QUICK_LOCATIONS.map(loc => (
                            <button
                                key={loc.name}
                                onClick={() => handleLocationUpdate(loc.lat, loc.lng, loc.name)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${userLocation?.displayName === loc.name
                                    ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-100'
                                    : 'text-slate-500 hover:bg-white/50 hover:text-slate-800'
                                    }`}
                            >
                                {loc.name}
                            </button>
                        ))}
                    </div>

                    {/* Location search */}
                    <div className="relative flex-1 min-w-0">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10">
                            <Search size={14} strokeWidth={2.5} />
                        </div>
                        <div className="search-input-wrapper [&_input]:pl-9 [&_input]:h-8 [&_input]:text-xs [&_input]:bg-transparent [&_input]:border-none [&_input]:w-full focus-within:[&_input]:ring-0 transition-all">
                            <LocationSearch
                                onLocationSelect={(lat, lng, label) => handleLocationUpdate(lat, lng, label)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Right side - Filters */}
            <div className="ml-4 flex items-center gap-2">
                <button
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition-all shadow-sm ${filtersOpen ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                    <Filter size={14} />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${filtersOpen ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                <div className="relative">
                    {filtersOpen && (
                            <div className="absolute right-0 top-[calc(100%+12px)] w-[520px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                    <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                                        <Filter size={16} className="text-blue-600" />
                                        Refine Search
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        {activeFilterCount > 0 && (
                                            <button
                                                onClick={resetFilters}
                                                className="text-xs text-slate-400 hover:text-red-500 font-bold transition-colors"
                                            >
                                                Clear All ({activeFilterCount})
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setFiltersOpen(false)}
                                            className="p-1.5 hover:bg-slate-200 rounded-full transition text-slate-400 bg-slate-100"
                                        >
                                            <X size={16} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 space-y-7 max-h-[560px] overflow-y-auto custom-scrollbar">

                                    {/* BHK Configuration — from BHK_CONFIGS constant */}
                                    <FilterSection title="BHK Configuration" icon={<Building2 size={12} />}>
                                        {BHK_CONFIGS.map((bhk) => (
                                            <FilterChip
                                                key={bhk}
                                                label={bhk}
                                                active={filters.configurations?.includes(bhk) || false}
                                                onClick={() => toggleFilter('configurations', bhk)}
                                                variant="premium"
                                            />
                                        ))}
                                    </FilterSection>

                                    {/* Property Type — from PROPERTY_TYPES constant */}
                                    <FilterSection title="Property Type">
                                        {PROPERTY_TYPES.map((type) => (
                                            <FilterChip
                                                key={type}
                                                label={type}
                                                active={filters.configurations?.includes(type) || false}
                                                onClick={() => toggleFilter('configurations', type)}
                                            />
                                        ))}
                                    </FilterSection>

                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Project Status — from PROJECT_STATUSES constant */}
                                        <FilterSection title="Status">
                                            {Object.values(PROJECT_STATUSES).map((s) => (
                                                <FilterChip
                                                    key={s.value}
                                                    label={s.label}
                                                    active={filters.status?.includes(s.value) || false}
                                                    onClick={() => toggleFilter('status', s.value)}
                                                    variant="status"
                                                />
                                            ))}
                                        </FilterSection>

                                        {/* Builder Grade — from BUILDER_GRADES constant */}
                                        <FilterSection title="Builder Grade">
                                            {BUILDER_GRADES.map((grade) => (
                                                <FilterChip
                                                    key={grade}
                                                    label={`Grade ${grade}`}
                                                    active={filters.builderGrades?.includes(grade) || false}
                                                    onClick={() => toggleFilter('builderGrades', grade)}
                                                    variant="grade"
                                                />
                                            ))}
                                        </FilterSection>
                                    </div>

                                    <div className="space-y-7 pb-4">
                                        {/* Unit Variant */}
                                        <FilterSection title="Unit Variant / Class">
                                            {UNIT_VARIANTS.map((v) => (
                                                <FilterChip
                                                    key={v}
                                                    label={v}
                                                    active={filters.unitVariant?.includes(v as any) || false}
                                                    onClick={() => toggleFilter('unitVariant', v)}
                                                />
                                            ))}
                                        </FilterSection>

                                        <div className="grid grid-cols-2 gap-6">
                                            {/* Bathrooms */}
                                            <FilterSection title="Bathrooms">
                                                {BATHROOM_COUNTS.map((c) => (
                                                    <FilterChip
                                                        key={c}
                                                        label={c}
                                                        active={filters.bathroomCount?.includes(c as any) || false}
                                                        onClick={() => toggleFilter('bathroomCount', c)}
                                                    />
                                                ))}
                                            </FilterSection>

                                            {/* Balconies */}
                                            <FilterSection title="Balconies">
                                                {BALCONY_COUNTS.map((c) => (
                                                    <FilterChip
                                                        key={c}
                                                        label={c}
                                                        active={filters.balconyCount?.includes(c as any) || false}
                                                        onClick={() => toggleFilter('balconyCount', c)}
                                                    />
                                                ))}
                                            </FilterSection>
                                        </div>

                                        {/* Facing */}
                                        <FilterSection title="Facing">
                                            {UNIT_FACINGS.map((f) => (
                                                <FilterChip
                                                    key={f}
                                                    label={f}
                                                    active={filters.facing?.includes(f as any) || false}
                                                    onClick={() => toggleFilter('facing', f)}
                                                />
                                            ))}
                                        </FilterSection>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        {/* City Zone — from CITY_ZONES constant */}
                                        <FilterSection title="Zone">
                                            {CITY_ZONES.slice(0, 5).map((zone) => (
                                                <FilterChip
                                                    key={zone}
                                                    label={zone}
                                                    active={filters.city_zones?.includes(zone) || false}
                                                    onClick={() => toggleFilter('city_zones', zone)}
                                                />
                                            ))}
                                        </FilterSection>

                                        {/* Construction Tech — from CONSTRUCTION_TYPES constant */}
                                        <FilterSection title="Construction Tech" icon={<HardHat size={12} />}>
                                            {CONSTRUCTION_TYPES.slice(0, 5).map((tech) => (
                                                <FilterChip
                                                    key={tech}
                                                    label={tech}
                                                    active={filters.technology?.includes(tech) || false}
                                                    onClick={() => toggleFilter('technology', tech)}
                                                />
                                            ))}
                                        </FilterSection>
                                    </div>

                                    {/* Possession Date — POSSESSION_MONTHS constant + dynamic years */}
                                    <FilterSection title="Possession Date" icon={<Calendar size={12} />}>
                                        <div className="flex items-center gap-2 w-full">
                                            <select
                                                value={currentPossession.month}
                                                onChange={(e) => handlePossessionChange(e.target.value, currentPossession.year)}
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="">Any Month</option>
                                                {POSSESSION_MONTHS.map((m) => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={currentPossession.year}
                                                onChange={(e) => handlePossessionChange(currentPossession.month, e.target.value)}
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="">Any Year</option>
                                                {possessionYears.map((y) => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </FilterSection>

                                    {/* Price Range */}
                                    <FilterSection title="Price Range (₹)">
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">MIN</span>
                                                <input
                                                    type="number"
                                                    placeholder="e.g. 5000000"
                                                    value={filters.minPrice || ''}
                                                    onChange={(e) => setFilters({ ...filters, minPrice: parseInt(e.target.value) || 0 })}
                                                    className="w-full pl-10 pr-3 py-2 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="w-4 h-0.5 bg-slate-200" />
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">MAX</span>
                                                <input
                                                    type="number"
                                                    placeholder="e.g. 15000000"
                                                    value={filters.maxPrice || ''}
                                                    onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) || 0 })}
                                                    className="w-full pl-10 pr-3 py-2 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </FilterSection>
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                    <button
                                        onClick={resetFilters}
                                        className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                                    >
                                        Reset All Filters
                                    </button>
                                    <button
                                        onClick={() => setFiltersOpen(false)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-black px-8 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-100 transform active:scale-95"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </nav>
    );
}

function FilterSection({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                {icon && <span className="text-blue-500">{icon}</span>}
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{title}</h4>
            </div>
            <div className="flex flex-wrap gap-2">{children}</div>
        </div>
    );
}

function FilterChip({
    label,
    active,
    onClick,
    variant = 'default'
}: {
    label: string;
    active: boolean;
    onClick: () => void;
    variant?: 'default' | 'premium' | 'grade' | 'status'
}) {
    const variants = {
        default: active
            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100'
            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30',
        premium: active
            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
            : 'bg-white text-indigo-600 border-indigo-100 hover:border-indigo-400 hover:bg-indigo-50/50',
        grade: active
            ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-100'
            : 'bg-white text-amber-600 border-amber-200 hover:border-amber-400 hover:bg-amber-50/50',
        status: active
            ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100'
            : 'bg-white text-emerald-600 border-emerald-100 hover:border-emerald-400 hover:bg-emerald-50/50'
    };

    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border transform active:scale-90 ${variants[variant]}`}
        >
            {label}
        </button>
    );
}
