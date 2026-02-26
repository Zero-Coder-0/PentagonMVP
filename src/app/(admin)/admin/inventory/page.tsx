// src/app/(admin)/admin/inventory/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { deleteProject as deleteProjectAction, getInventoryProjects } from '@/modules/admin/actions-bulk';

interface ProjectV7 {
  id: string;
  project_name: string;
  bangalore_zone: string;
  region: string;
  project_status: string;
  price_display: string;
  price_min: number;
  configurations: string[] | null;
  structure_details?: string;
  created_at: string;
  hero_image_url?: string;
  developer?: {
    developer_name: string;
  };
}

export default function InventoryPage() {
  const [projects, setProjects] = useState<ProjectV7[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    zone: '',
    status: '',
    search: ''
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  async function fetchProjects() {
    try {
      setLoading(true);
      setError(null);

      const result = await getInventoryProjects(filter);

      if (!result.success) throw new Error(result.message);

      setProjects(result.data as ProjectV7[] || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProject(id: string, name: string) {
    // Enhanced confirmation dialog (RESTORED FROM ORIGINAL)
    const confirmed = window.confirm(
      `⚠️ PERMANENT DELETE WARNING\n\n` +
      `You are about to permanently delete:\n` +
      `"${name}"\n\n` +
      `This will PERMANENTLY delete:\n` +
      `✓ The project\n` +
      `✓ All units\n` +
      `✓ All amenities\n` +
      `✓ All landmarks\n` +
      `✓ All location data\n` +
      `✓ All competitor data\n` +
      `✓ All cost details\n` +
      `✓ All analysis data\n\n` +
      `⚠️ THIS CANNOT BE UNDONE!\n\n` +
      `Are you absolutely sure?`
    );

    if (!confirmed) return;

    // Double confirmation for safety (FIXED MISLEADING TEXT)
    const doubleConfirm = window.confirm(
      `🚨 FINAL CONFIRMATION\n\n` +
      `Are you absolutely sure you want to delete "${name}" permanently?`
    );

    if (!doubleConfirm) return;

    try {
      setDeleting(id);

      // ✅ FIXED: Use server action instead of direct Supabase
      const result = await deleteProjectAction(id);

      if (!result.success) throw new Error(result.message);

      // Remove from UI
      setProjects(projects.filter(p => p.id !== id));

      // Success notification (RESTORED FROM ORIGINAL)
      alert(`✅ Successfully deleted "${name}" and all related data permanently!`);

      console.log(`[HARD DELETE] Project "${name}" (${id}) permanently deleted from database`);
    } catch (err: any) {
      alert(`❌ Error deleting project: ${err.message}`);
      console.error('Delete error:', err);
    } finally {
      setDeleting(null);
    }
  }

  const parseConfigurations = (configs: string[] | null): string[] => {
    if (!configs) return [];
    if (Array.isArray(configs)) return configs;
    return [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready to Move':
        return 'bg-green-100 text-green-800';
      case 'Under Construction':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pre-Launch':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getZoneEmoji = (zone: string) => {
    switch (zone) {
      case 'North': return '🧭';
      case 'South': return '🌏';
      case 'East': return '🌅';
      case 'West': return '🌇';
      case 'Central': return '🎯';
      default: return '📍';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header (RESTORED ORIGINAL) */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Property Inventory</h1>
              <p className="text-slate-500 mt-1">
                {projects.length} {projects.length === 1 ? 'project' : 'projects'} in database
              </p>
            </div>
            <Link
              href="/admin/inventory/new"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
            >
              <span className="mr-2">+</span>
              Add New Property
            </Link>
          </div>
        </div>

        {/* Filters (RESTORED COMPLETE ORIGINAL VERSION) */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name, developer, or location..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Zone Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Zone
              </label>
              <select
                value={filter.zone}
                onChange={(e) => setFilter({ ...filter, zone: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">All Zones</option>
                <option value="North">🧭 North</option>
                <option value="South">🌏 South</option>
                <option value="East">🌅 East</option>
                <option value="West">🌇 West</option>
                <option value="Central">🎯 Central</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">All Status</option>
                <option value="Pre-Launch">🚀 Pre-Launch</option>
                <option value="Under Construction">🚧 Under Construction</option>
                <option value="Ready to Move">✅ Ready to Move</option>
              </select>
            </div>
          </div>

          {/* Active Filters (RESTORED ORIGINAL) */}
          {(filter.zone || filter.status || filter.search) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filter.search && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Search: "{filter.search}"
                  <button
                    onClick={() => setFilter({ ...filter, search: '' })}
                    className="ml-2 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {filter.zone && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Zone: {filter.zone}
                  <button
                    onClick={() => setFilter({ ...filter, zone: '' })}
                    className="ml-2 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {filter.status && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Status: {filter.status}
                  <button
                    onClick={() => setFilter({ ...filter, status: '' })}
                    className="ml-2 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => setFilter({ zone: '', status: '', search: '' })}
                className="px-3 py-1 text-slate-600 hover:text-slate-900 text-sm font-medium"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Loading State (RESTORED ORIGINAL) */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="text-slate-500 mt-4 font-medium">Loading projects...</p>
          </div>
        )}

        {/* Error State (RESTORED ORIGINAL) */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <span className="text-red-500 text-xl mr-3">⚠️</span>
              <div>
                <h3 className="text-red-800 font-semibold">Error Loading Projects</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <p className="text-red-600 text-sm mt-2">
                  Make sure you've run the V7 schema and the 'projects' table exists.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid (RESTORED ORIGINAL) */}
        {!loading && !error && (
          <>
            {projects.length === 0 ? (
              /* Empty State (RESTORED ORIGINAL) */
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <div className="text-6xl mb-4">🏘️</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No projects found in V7 schema
                </h3>
                <p className="text-slate-500 mb-6">
                  {filter.search || filter.zone || filter.status
                    ? 'Try adjusting your filters or add new projects to the V7 schema'
                    : 'The V7 projects table is empty. Add your first project!'}
                </p>
                <Link
                  href="/admin/inventory/new"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <span className="mr-2">+</span>
                  Add Your First Project
                </Link>
              </div>
            ) : (
              /* Projects Grid (RESTORED ORIGINAL) */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => {
                  const configArray = parseConfigurations(project.configurations);
                  const isDeleting = deleting === project.id;
                  const developerName = project.developer?.developer_name || 'Unknown Developer';

                  return (
                    <div
                      key={project.id}
                      className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-slate-200 ${isDeleting ? 'opacity-50 pointer-events-none' : ''
                        }`}
                    >
                      {/* Header Image (RESTORED ORIGINAL) */}
                      <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                        {project.hero_image_url ? (
                          <img
                            src={project.hero_image_url}
                            alt={project.project_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full" />
                        )}
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.project_status)}`}>
                            {project.project_status}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <span className="px-3 py-1 text-xs font-semibold bg-white/90 text-slate-700 rounded-full">
                            {getZoneEmoji(project.bangalore_zone)} {project.bangalore_zone}
                          </span>
                        </div>
                      </div>

                      {/* Content (RESTORED ORIGINAL) */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">
                          {project.project_name}
                        </h3>
                        <p className="text-sm text-slate-500 mb-2 truncate">
                          by {developerName}
                        </p>
                        <p className="text-sm text-slate-600 mb-3 flex items-center">
                          <span className="mr-1">📍</span>
                          {project.region || 'Location not set'}
                        </p>

                        {/* Configurations (RESTORED ORIGINAL) */}
                        {configArray.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {configArray.map((config, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded font-medium"
                              >
                                {config}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Price (RESTORED ORIGINAL WITH STRUCTURE DETAILS) */}
                        <div className="mb-4">
                          <p className="text-2xl font-bold text-blue-600">
                            {project.price_display || 'Price on Request'}
                          </p>
                          {project.structure_details && (
                            <p className="text-xs text-slate-500 mt-1">
                              {project.structure_details}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons (RESTORED ORIGINAL) */}
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/inventory/${project.id}/edit`}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                          >
                            ✏️ Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => deleteProject(project.id, project.project_name)}
                            disabled={isDeleting}
                            className={`px-4 py-2 rounded-lg transition font-medium text-sm ${isDeleting
                              ? 'bg-slate-400 text-white cursor-not-allowed'
                              : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                            title="Permanently delete project and all related data"
                          >
                            {isDeleting ? '⏳' : '🗑️'}
                          </button>
                        </div>

                        {/* Delete Warning Text (RESTORED ORIGINAL) */}
                        {isDeleting && (
                          <p className="text-xs text-red-600 mt-2 text-center">
                            Deleting permanently...
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
