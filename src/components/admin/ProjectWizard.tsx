'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { UserRole } from '@prisma/client';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { getZoneFromCoordinates } from '@/modules/map-engine/utils/geo-zone';
import { WizardFormData, defaultWizardValues, projectWizardSchema } from '@/lib/wizard-schema';
import { upsertDraft, approveDraftToLive, updateLiveProject } from '@/app/actions/wizard-actions';
import {
  PROJECT_STATUSES,
  CITY_ZONES,
  PROPERTY_TYPES,
  BUILDER_GRADES,
  CONSTRUCTION_TYPES,
  POSSESSION_MONTHS,
  POSSESSION_YEARS,
  UNIT_VARIANTS,
  UNIT_FACINGS,
  BATHROOM_COUNTS,
  BALCONY_COUNTS,
  WATER_SOURCES,
  AMENITY_CATEGORIES,
  LANDMARK_CATEGORIES,
  BHK_CONFIGS,
  PAYMENT_MILESTONES,
  COST_TYPES,
  FLOORING_TYPES,
  COUNTERTOP_TYPES,
  POWER_BACKUP_OPTIONS,
  GAS_PIPELINE_OPTIONS,
  UNIT_STATUS_VALUES,
} from '@/lib/project-constants';

const MapPickerWithSearch = dynamic(() => import('@/components/shared/MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center">
      <p className="text-slate-500">Loading map...</p>
    </div>
  ),
});

export interface ProjectWizardProps {
  userRole: UserRole;
  mode: 'create_draft' | 'edit_draft' | 'approve_draft' | 'edit_live' | 'admin_create';
  initialData?: Partial<WizardFormData>;
  draftId?: string;
  projectId?: string;
}

// Dummy media up-loader for Phase 2 - Universal Uploads Pipeline
const processMediaUploads = async (data: WizardFormData) => {
  // In a real implementation: upload files to Supabase, return URLs.
  // For now, this returns the payload with existing string URLs intact.
  return data;
};

export default function ProjectWizardV7({
  userRole,
  mode,
  initialData,
  draftId,
  projectId,
}: ProjectWizardProps) {
  // Helper Component for the Review Tab (Defined inside to ensure scope)
  const ReviewItem = ({ label, value, fullWidth }: { label: string; value: any; fullWidth?: boolean }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
      <div className={`${fullWidth ? 'col-span-full' : ''} border-b border-slate-100 pb-2`}>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-medium text-slate-900">{String(value)}</p>
      </div>
    );
  };

  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors }
  } = useForm<WizardFormData>({
    resolver: zodResolver(projectWizardSchema) as any,
    defaultValues: {
      ...defaultWizardValues,
      project_name: initialData ? initialData.project_name : `Prestige Lakeside Habitat ${Math.floor(Math.random() * 10000)}`,
      slug: initialData ? initialData.slug : `prestige-lakeside-${Math.floor(Math.random() * 10000)}`,
      ...initialData,
    },
  });

  // Dynamic Array Handlers
  const { fields: unitFields, append: appendUnit, remove: removeUnit } = useFieldArray({
    control,
    name: "units",
    keyName: "field_id",
  });

  const { fields: amenityFields, append: appendAmenity, remove: removeAmenity } = useFieldArray({
    control,
    name: "amenities",
    keyName: "field_id",
  });

  const { fields: landmarkFields, append: appendLandmark, remove: removeLandmark } = useFieldArray({
    control,
    name: "landmarks",
    keyName: "field_id",
  });

  const { fields: commercialFields, append: appendCommercial, remove: removeCommercial } = useFieldArray({
    control,
    name: "commercials",
    keyName: "field_id",
  });

  const { fields: competitorFields, append: appendCompetitor, remove: removeCompetitor } = useFieldArray({
    control,
    name: "competitors",
    keyName: "field_id",
  });

  const { fields: proFields, append: appendPro, remove: removePro } = useFieldArray({
    control,
    name: "pros" as never,
    keyName: "field_id",
  });

  const { fields: conFields, append: appendCon, remove: removeCon } = useFieldArray({
    control,
    name: "cons" as never,
    keyName: "field_id",
  });

  const { fields: uspHighlightFields, append: appendUspHighlight, remove: removeUspHighlight } = useFieldArray({
    control,
    name: "usp_highlights" as never,
    keyName: "field_id",
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control,
    name: "images" as never,
    keyName: "field_id",
  });


  const submitButtonConfig: Record<typeof mode, { text: string; color: string }> = {
    create_draft: { text: '📦 Submit for Approval', color: 'bg-amber-600 hover:bg-amber-700' },
    edit_draft: { text: '💾 Update Draft', color: 'bg-blue-600 hover:bg-blue-700' },
    approve_draft: { text: '✅ Approve & Publish Live', color: 'bg-green-600 hover:bg-green-700' },
    edit_live: { text: '💾 Update Live Data', color: 'bg-indigo-600 hover:bg-indigo-700' },
    admin_create: { text: '🚀 Create Live Project', color: 'bg-purple-600 hover:bg-purple-700' },
  };
  const { text: submitButtonText, color: submitButtonColor } = submitButtonConfig[mode] || { text: 'Submit', color: 'bg-blue-600 hover:bg-blue-700' };

  const steps = [
    { num: 1, label: 'Basic Info', icon: '📋' },
    { num: 2, label: 'Location', icon: '📍' },
    { num: 3, label: 'Units', icon: '🏠' },
    { num: 4, label: 'Pricing', icon: '💰' },
    { num: 5, label: 'Amenities', icon: '🎾' },
    { num: 6, label: 'Landmarks', icon: '🗺️' },
    { num: 7, label: 'Technical Specs', icon: '⚙️' },
    { num: 8, label: 'Analysis', icon: '📊' },
    { num: 9, label: 'Review', icon: '👀' }
  ];

  const currentLat = watch('lat');
  const currentLng = watch('lng');

  React.useEffect(() => {
    if (typeof currentLat === 'number' && typeof currentLng === 'number') {
      setValue('city_zone', getZoneFromCoordinates(currentLat, currentLng), { shouldValidate: true });
    }
  }, [currentLat, currentLng, setValue]);

  const handleLocationChange = (lat: number, lng: number, address?: string) => {
    setValue('lat', lat);
    setValue('lng', lng);
    // city_zone is now automatically calculated by the useEffect watcher above
    if (address) setValue('address_line', address);
  };

  const onSubmitForm = async (flatFormData: WizardFormData) => {
    try {
      setSubmitError(null);
      setSubmitting(true);

      // 1. UNIVERSAL FILE UPLOADS
      const payloadWithMediaUrls = await processMediaUploads(flatFormData);

      // 2. CONTEXTUAL ROUTING (The Switchboard)
      if (mode === 'create_draft' || mode === 'edit_draft') {
        await upsertDraft(payloadWithMediaUrls, draftId);
        alert(mode === 'create_draft' ? "Draft submitted successfully!" : "Draft updated successfully!");
        router.push('/vendor');
      }
      else if (mode === 'approve_draft') {
        if (!draftId) throw new Error("Draft ID is missing");
        await approveDraftToLive(draftId, payloadWithMediaUrls);
        alert("Project Approved & Published Live!");
        router.push('/admin/inventory');
      }
      else if (mode === 'edit_live') {
        if (!projectId) throw new Error("Project ID is missing");
        await updateLiveProject(projectId, payloadWithMediaUrls);
        alert("Live Inventory Updated Successfully!");
      }
      else if (mode === 'admin_create') {
        // Admin direct creation flow (calling the bridge action)
        const { createProjectAction } = await import('@/modules/admin/actions-create-project');
        const result = await createProjectAction(payloadWithMediaUrls);
        if (result.success) {
          alert('✅ Project created successfully! ID: ' + result.projectId);
          router.push('/admin/inventory');
        } else {
          throw new Error(result.error || 'Project creation failed');
        }
      }
    } catch (error: any) {
      setSubmitError(error.message || "An error occurred during submission");
    } finally {
      setSubmitting(false);
    }
  };

  const onFormError = (errors: any) => {
    console.error("Form Validation Errors:", errors);
    const firstErrorKey = Object.keys(errors)[0];
    const firstErrorMsg = errors[firstErrorKey]?.message;
    setSubmitError(`Please check all steps. Validation failed on "${firstErrorKey}": ${firstErrorMsg}`);
  };

  const nextStep = async () => {
    // You can optionally add partial validation per step here
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <React.Fragment key={step.num}>
              <button
                type="button"
                onClick={() => setCurrentStep(step.num)}
                className={`flex flex-col items-center ${currentStep >= step.num ? 'opacity-100' : 'opacity-40'}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition ${currentStep >= step.num ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}
                >
                  {step.num}
                </div>
                <p className={`text-xs mt-2 font-medium ${currentStep >= step.num ? 'text-slate-900' : 'text-slate-500'}`}>
                  {step.label}
                </p>
              </button>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 ${currentStep > step.num ? 'bg-blue-600' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <form onSubmit={handleSubmit(onSubmitForm, onFormError)}>

          {/* STEP 1: BASIC INFO */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">📋 Basic Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    {...register("project_name")}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Prestige Lakeside Habitat"
                  />
                  {errors.project_name && <p className="text-red-500 text-xs mt-1">{errors.project_name.message as string}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Developer Name</label>
                  <input {...register("developer_name")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Developer Website</label>
                  <input {...register("developer_website")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="https://" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Developer Logo URL</label>
                  <input {...register("developer_logo_url")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Years In Market</label>
                  <input type="number" {...register("developer_years_in_market", { valueAsNumber: true })} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Builder Grade</label>
                  <select {...register("developer_buildergrade")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Grade</option>
                    {BUILDER_GRADES.map((grade) => (
                      <option key={grade} value={grade}>Grade {grade}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">RERA Registration No</label>
                  <input {...register("rera_registration_no")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Corporate RERA</label>
                  <input {...register("developer_corporate_rera")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Project Theme</label>
                  <input {...register("project_theme")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. Disney Inspired, Eco-Friendly, etc." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Total Land Area</label>
                  <input {...register("total_land_area")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. 10 Acres" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Total Units</label>
                  <input type="number" {...register("total_units", { valueAsNumber: true })} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. 500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Total Phases</label>
                  <input type="number" {...register("total_phases", { valueAsNumber: true })} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current Phase Under Sale</label>
                  <input {...register("current_phase_under_sale")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. Phase 2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">URL Slug</label>
                  <input {...register("slug")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. prestige-lakeside" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Zone <span className="text-[10px] text-blue-600 font-normal ml-2">(Auto-calculated from Map)</span>
                  </label>
                  <select {...register("city_zone")} tabIndex={-1} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed pointer-events-none">
                    <option value="">Select Zone / Map First</option>
                    {CITY_ZONES.map((zone) => (
                      <option key={zone} value={zone}>{zone}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Region/Area</label>
                  <input {...register("region")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Project Status</label>
                  <select {...register("projectstatus")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Status</option>
                    {Object.values(PROJECT_STATUSES).map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Possession Month</label>
                  <select {...register("possession_month")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Month</option>
                    {POSSESSION_MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Possession Year</label>
                  <select {...register("possession_year", { valueAsNumber: true })} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Year</option>
                    {POSSESSION_YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Property Type</label>
                  <select {...register("property_type")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Type</option>
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Developer Description / Bio</label>
                  <textarea {...register("developer_description")} rows={2} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Brief history and overview of the developer..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Developer Reputation</label>
                  <input {...register("developer_reputation")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. Highly Trusted, Premium Luxury" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Past Projects Delivered</label>
                  <input {...register("developer_past_projects")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. 50+ Projects" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Financial Strength</label>
                  <input {...register("developer_financial_strength")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. Debt-free, Publicly Listed, etc." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Construction Type</label>
                  <select {...register("construction_type")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Technology</option>
                    {CONSTRUCTION_TYPES.map((tech) => (
                      <option key={tech} value={tech}>{tech}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">📍 Location Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Address Line</label>
                  <textarea {...register("address_line")} rows={3} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                  <input {...register("city")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">District</label>
                  <input {...register("district")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Pincode</label>
                  <input {...register("pincode")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-3">Set Property Location on Map</label>
                  <MapPickerWithSearch
                    lat={watch('lat') || 12.9716}
                    lng={watch('lng') || 77.5946}
                    onLocationChange={handleLocationChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: UNITS */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-900">🏠 Property Units</h2>
                <button type="button" onClick={() => appendUnit({ config: '2BHK', type: 'Standard', status: 'Available' })} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  + Add Unit
                </button>
              </div>

              {unitFields.map((field, index) => (
                <div key={field.field_id} className="border-2 border-slate-200 rounded-lg p-6 bg-slate-50 relative">
                  <button type="button" onClick={() => removeUnit(index)} className="absolute top-4 right-4 text-red-600 font-medium text-sm">Remove</button>
                  <div className="flex flex-col gap-6">
                    {/* ROW 1: PRIMARY FINANCIAL DATA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Unit Type / Config</label>
                        <select {...register(`units.${index}.config`)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium">
                          <option value="">Select Config</option>
                          {BHK_CONFIGS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Actual SBA (sqft)</label>
                        <input
                          type="number"
                          {...register(`units.${index}.actualsba`, {
                            valueAsNumber: true,
                            onChange: (e) => {
                              const sba = parseFloat(e.target.value);
                              const rate = parseFloat(getValues(`units.${index}.pricepersqft` as any) || 0);
                              if (sba && rate) setValue(`units.${index}.pricetotal` as any, sba * rate);
                            }
                          })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          placeholder="e.g. 1200"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Price/Sqft (₹)</label>
                        <input
                          type="number"
                          {...register(`units.${index}.pricepersqft`, {
                            valueAsNumber: true,
                            onChange: (e) => {
                              const rate = parseFloat(e.target.value);
                              const sba = parseFloat(getValues(`units.${index}.actualsba` as any) || 0);
                              const total = parseFloat(getValues(`units.${index}.pricetotal` as any) || 0);
                              if (rate && sba) setValue(`units.${index}.pricetotal` as any, rate * sba);
                              else if (rate && total) setValue(`units.${index}.actualsba` as any, Math.round(total / rate));
                            }
                          })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          placeholder="e.g. 5500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">UDS (Land Share)</label>
                        <div className="flex gap-0">
                          <input
                            type="number"
                            step="any"
                            placeholder="Value"
                            className="w-full px-2 py-2 border border-slate-300 rounded-l-lg text-sm outline-none"
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              const modeSelect = document.getElementById(`uds-mode-${index}`) as HTMLSelectElement;
                              const mode = modeSelect?.value;
                              const sba = parseFloat(getValues(`units.${index}.actualsba` as any) || 0);
                              if (mode === '%' && sba) {
                                setValue(`units.${index}.udsarea` as any, Math.round((val / 100) * sba));
                              } else {
                                setValue(`units.${index}.udsarea` as any, val);
                              }
                            }}
                          />
                          <select 
                            id={`uds-mode-${index}`}
                            className="px-1 border border-l-0 border-slate-300 rounded-r-lg text-[10px] bg-slate-100 outline-none cursor-pointer"
                            onChange={(e) => {
                              const mode = e.target.value;
                              const input = (e.target.previousElementSibling as HTMLInputElement);
                              const val = parseFloat(input.value);
                              const sba = parseFloat(getValues(`units.${index}.actualsba` as any) || 0);
                              if (mode === '%' && sba && val) {
                                setValue(`units.${index}.udsarea` as any, Math.round((val / 100) * sba));
                              } else if (val) {
                                setValue(`units.${index}.udsarea` as any, val);
                              }
                            }}
                          >
                            <option value="sqft">sqft</option>
                            <option value="%">%</option>
                          </select>
                        </div>
                        <input type="hidden" {...register(`units.${index}.udsarea`, { valueAsNumber: true })} />
                        <div className="text-[10px] text-slate-400 mt-0.5">Final: {watch(`units.${index}.udsarea`) || 0} sqft</div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-orange-700 mb-1 font-bold">Total Price (₹)</label>
                        <input
                          type="number"
                          {...register(`units.${index}.pricetotal`, {
                            valueAsNumber: true,
                            onChange: (e) => {
                              const total = parseFloat(e.target.value);
                              const rate = parseFloat(getValues(`units.${index}.pricepersqft` as any) || 0);
                              const sba = parseFloat(getValues(`units.${index}.actualsba` as any) || 0);
                              if (total && rate) setValue(`units.${index}.actualsba` as any, Math.round(total / rate));
                              else if (total && sba) setValue(`units.${index}.pricepersqft` as any, Math.round(total / sba));
                            }
                          })}
                          className="w-full px-3 py-2 border-2 border-orange-200 bg-orange-50 rounded-lg text-sm font-bold text-orange-900"
                          placeholder="Calculated"
                        />
                      </div>
                    </div>

                    {/* ROW 2: SECONDARY DETAILS */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-4 border-t border-slate-200">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase">Unit No.</label>
                        <input {...register(`units.${index}.unitnumber`)} className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase">Tower</label>
                        <input {...register(`units.${index}.tower`)} className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase">Floor</label>
                        <input type="number" {...register(`units.${index}.floornumber`, { valueAsNumber: true })} className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase">Variant</label>
                        <select {...register(`units.${index}.type`)} className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white">
                          {UNIT_VARIANTS.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase">Facing</label>
                        <select {...register(`units.${index}.facing`)} className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white">
                          <option value="">-</option>
                          {UNIT_FACINGS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase text-center">Bath</label>
                          <select {...register(`units.${index}.wccount`)} className="w-full px-1 py-1.5 border border-slate-300 rounded text-xs bg-white text-center">
                            <option value="">-</option>
                            {BATHROOM_COUNTS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase text-center">Balc</label>
                          <select {...register(`units.${index}.balconycount`)} className="w-full px-1 py-1.5 border border-slate-300 rounded text-xs bg-white text-center">
                            <option value="">-</option>
                            {BALCONY_COUNTS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase">Status</label>
                        <select {...register(`units.${index}.status`)} className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white">
                          {UNIT_STATUS_VALUES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 4: PRICING */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">💰 Pricing & Costs</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Price Display Text</label>
                  <input {...register("pricedisplay")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg" placeholder="e.g. ₹95L - 1.65Cr" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Min Price</label>
                    <input type="number" {...register("pricemin", { valueAsNumber: true })} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Max Price</label>
                    <input type="number" {...register("pricemax", { valueAsNumber: true })} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Payment Plan Type</label>
                  <input {...register("payment_plan_type")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg" placeholder="e.g. 80-20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Floor Rise Charges</label>
                  <input {...register("floor_rise_charges")} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg" placeholder="e.g. ₹50/sqft/floor" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Payment Plan Details</label>
                  <textarea {...register("payment_plan_details")} rows={2} className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg" placeholder="e.g. Pay 20% on booking and 80% on possession" />
                </div>
              </div>

              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Commercials (Mandatory Costs)</h3>
                  <button type="button" onClick={() => appendCommercial({ name: '', cost_type: 'Mandatory' })} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                    + Add Commercial
                  </button>
                </div>
                {commercialFields.map((field, index) => (
                  <div key={field.field_id} className="border border-slate-200 rounded-lg p-4 bg-white mb-2 flex gap-4">
                    <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700">Cost Name</label>
                        <input {...register(`commercials.${index}.name`)} placeholder="e.g. Car Parking" className="w-full px-3 py-2 border rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700">Amount (₹)</label>
                        <input type="number" {...register(`commercials.${index}.amount`, { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700">Type</label>
                        <select {...register(`commercials.${index}.cost_type`)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                          <option value="">Select Type</option>
                          {COST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      {/* <div>
                        <label className="block text-xs font-medium text-slate-700">Payment Milestone</label>
                        <select {...register(`commercials.${index}.payment_milestone`)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                          <option value="">Select Milestone</option>
                          {PAYMENT_MILESTONES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div> */}
                    </div>
                    <button type="button" onClick={() => removeCommercial(index)} className="text-red-500 mt-5">🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: AMENITIES */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-900">🎾 Amenities & Facilities</h2>
                <button type="button" onClick={() => appendAmenity({ category: 'Sports & Fitness', name: '' })} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  + Add Amenity
                </button>
              </div>

              {amenityFields.map((field, index) => (
                <div key={field.field_id} className="border border-slate-200 rounded-lg p-4 bg-white mb-3">
                  <div className="flex gap-4 items-start">
                    <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700">Category</label>
                        <select {...register(`amenities.${index}.category`)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                          <option value="">Select Category</option>
                          {AMENITY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700">Amenity Name *</label>
                        <input {...register(`amenities.${index}.name`)} placeholder="e.g. Olympic Size Pool" className="w-full px-3 py-2 border rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700">Size / Specifications</label>
                        <input {...register(`amenities.${index}.size_specs`)} placeholder="e.g. 50m x 25m" className="w-full px-3 py-2 border rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700">Description</label>
                        <textarea {...register(`amenities.${index}.description`)} rows={1} placeholder="e.g. Temperature controlled" className="w-full px-3 py-2 border rounded-lg text-sm" />
                      </div>
                    </div>
                    <button type="button" onClick={() => removeAmenity(index)} className="text-red-500 mt-6">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 6: LANDMARKS */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">🚕 Key Connectivity (Distances)</h2>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8 pb-8 border-b border-slate-200">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Main Road</label>
                  <input {...register("distancetomainroad")} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. 500m" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Airport</label>
                  <input {...register("airportdistance")} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. 35km" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Railway Station</label>
                  <input {...register("railwaystationdistance")} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. 15km" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Metro Station</label>
                  <input {...register("metrostationdistance")} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. 2km" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Bus Stop</label>
                  <input {...register("busstopdistance")} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. 200m" />
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-900">🗺️ Nearby Landmarks</h2>
                <button type="button" onClick={() => appendLandmark({ category: 'Education', name: '' })} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  + Add Landmark
                </button>
              </div>

              {landmarkFields.map((field, index) => (
                <div key={field.field_id} className="border border-slate-200 rounded-lg p-4 bg-white mb-3">
                  <div className="flex gap-4 items-start">
                    <div className="flex-1 grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700">Category</label>
                        <select {...register(`landmarks.${index}.category`)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                          <option value="">Select Category</option>
                          {LANDMARK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700">Name *</label>
                        <input {...register(`landmarks.${index}.name`)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700">Distance (e.g. "2.5 km")</label>
                        <input {...register(`landmarks.${index}.distance_km`)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700">Travel Time</label>
                        <input {...register(`landmarks.${index}.travel_time`)} placeholder="e.g. 10 mins" className="w-full px-3 py-2 border rounded-lg text-sm" />
                      </div>
                    </div>
                    <button type="button" onClick={() => removeLandmark(index)} className="text-red-500 mt-6">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 7: TECHNICAL SPECS */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">⚙️ Technical Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* General & Vertical */}
                <div><label className="block text-xs font-medium text-slate-700 mb-1">No. of Towers</label><input type="number" {...register("no_of_towers", { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Floors per Tower</label><input type="number" {...register("floors_per_tower", { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Units per Floor</label><input type="number" {...register("units_per_floor", { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Elevators per Tower</label><input type="number" {...register("elevators_per_tower", { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Service Elevators</label><input type="number" {...register("service_elevators_per_tower", { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>

                {/* Structure / Walls */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Construction Type</label>
                  <select {...register("construction_type")} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="">Select Technology</option>
                    {CONSTRUCTION_TYPES.map((tech) => (
                      <option key={tech} value={tech}>{tech}</option>
                    ))}
                  </select>
                </div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Structure Details</label><input {...register("structure_details")} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. RCC Framed" /></div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Interior Walls</label><input {...register("wall_finishing_interior")} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. Emulsion Paint" /></div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Exterior Walls</label><input {...register("wall_finishing_exterior")} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. Weather Coat" /></div>

                {/* Flooring */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Flooring (Living/Dining)</label>
                  <select {...register("flooring_living_dining")} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="">Select</option>
                    {FLOORING_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Flooring (Master Bed)</label>
                  <select {...register("flooring_master_bedroom")} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="">Select</option>
                    {FLOORING_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Flooring (Other Bed)</label>
                  <select {...register("flooring_other_bedrooms")} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="">Select</option>
                    {FLOORING_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Flooring (Balcony/Utility)</label>
                  <select {...register("flooring_balcony_utility")} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="">Select</option>
                    {FLOORING_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                {/* Kitchen & Bath */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Kitchen Countertop</label>
                  <select {...register("kitchen_countertop")} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="">Select</option>
                    {COUNTERTOP_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Kitchen Sink Details</label><input {...register("kitchen_sink_details")} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. Stainless Steel" /></div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Kitchen Dado Tiling</label><input {...register("kitchen_dado_tiling")} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. 2ft Ceramic" /></div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Bathroom Dado Tiling</label><input {...register("bathroom_dado_tiling")} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. 7ft Ceramic" /></div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Sanitary Ware</label><input {...register("bathroom_sanitary_ware")} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. Kohler" /></div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">CP Fittings</label><input {...register("bathroom_cp_fittings")} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. Jaguar" /></div>

                {/* Electrical & Doors */}
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Electrical Switches</label><input {...register("electrical_switches")} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. Anchor Roma" /></div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Main Door</label><input {...register("main_door_specs")} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. Teak Wood Frame" /></div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Internal Doors</label><input {...register("internal_doors_specs")} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. Flush Doors" /></div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Windows Specs</label><input {...register("windows_specs")} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. UPVC Sliding" /></div>

                {/* Site */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Power Backup</label>
                  <select {...register("power_backup")} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="">Select</option>
                    {POWER_BACKUP_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Gas Pipeline</label>
                  <select {...register("gas_pipeline_provision")} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="">Select</option>
                    {GAS_PIPELINE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Open Space %</label><input {...register("open_space_pct")} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. 75%" /></div>
                <div><label className="block text-xs font-medium text-slate-700 mb-1">Road Width</label><input {...register("road_width")} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. 80ft wide" /></div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Water Source</label>
                  <select {...register("water_source")} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="">Select Source</option>
                    {WATER_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: ANALYSIS & STRATEGY */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">📊 Market Analysis & Strategy</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">USP (Unique Selling Proposition)</label>
                  <textarea {...register("usp")} rows={2} className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg" />
                </div>
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-700">🌟 USP Highlights</label>
                    <button type="button" onClick={() => appendUspHighlight("")} className="text-xs bg-blue-100 text-blue-700 px-2 rounded">+ Add</button>
                  </div>
                  {uspHighlightFields.map((field, index) => (
                    <div key={field.field_id} className="flex gap-2 mb-2">
                      <input {...register(`usp_highlights.${index}` as const)} className="w-full px-2 py-1 border rounded" placeholder="e.g. 50,000 sqft Clubhouse" />
                      <button type="button" onClick={() => removeUspHighlight(index)} className="text-red-500">✕</button>
                    </div>
                  ))}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Closing Pitch</label>
                  <textarea {...register("closing_pitch")} rows={2} className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Target Customer Profile</label>
                  <input {...register("target_customer")} className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. IT Professionals, HNIs" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Overall Rating (1-5)</label>
                  <input type="number" step="0.1" min="1" max="5" {...register("overall_rating", { valueAsNumber: true })} className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Timeline / Delivery Risk</label>
                  <input {...register("timeline_risk")} className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. Low, High due to approvals" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Legal & Title Notes</label>
                  <input {...register("legal_notes")} className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. Clear A-Khata, RERA Approved" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Objection Handling</label>
                  <textarea {...register("objection_handling")} rows={2} className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Common customer objections and how to counter them..." />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-green-700">✅ Strengths (Pros)</label>
                    <button type="button" onClick={() => appendPro("")} className="text-xs bg-green-100 text-green-700 px-2 rounded">+ Add</button>
                  </div>
                  {proFields.map((field, index) => (
                    <div key={field.field_id} className="flex gap-2 mb-2">
                      <input {...register(`pros.${index}` as const)} className="w-full px-2 py-1 border rounded" />
                      <button type="button" onClick={() => removePro(index)} className="text-red-500">✕</button>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-red-700">⚠️ Considerations (Cons)</label>
                    <button type="button" onClick={() => appendCon("")} className="text-xs bg-red-100 text-red-700 px-2 rounded">+ Add</button>
                  </div>
                  {conFields.map((field, index) => (
                    <div key={field.field_id} className="flex gap-2 mb-2">
                      <input {...register(`cons.${index}` as const)} className="w-full px-2 py-1 border rounded" />
                      <button type="button" onClick={() => removeCon(index)} className="text-red-500">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t-2 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">👥 Direct Competitors</h3>
                  <button type="button" onClick={() => appendCompetitor({ name: '', price_range: '' })} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                    + Add Competitor
                  </button>
                </div>
                {competitorFields.map((field, index) => (
                  <div key={field.field_id} className="flex gap-4 mb-3 border p-3 rounded-lg bg-slate-50">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-700">Competitor Name</label>
                      <input {...register(`competitors.${index}.name` as const)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. Sobha Dream Acres" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-700">Price Range</label>
                      <input {...register(`competitors.${index}.price_range` as const)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. ₹1.1Cr - 2.2Cr" />
                    </div>
                    <button type="button" onClick={() => removeCompetitor(index)} className="text-red-500 mt-5">🗑️</button>
                  </div>
                ))}
              </div>

              <div className="mt-8 border-t-2 pt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Media URLs</h3>
                  <button type="button" onClick={() => appendImage("")} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                    + Add Gallery Image
                  </button>
                </div>

                <div className="space-y-3 mt-4 mb-6">
                  {imageFields.map((field, index) => (
                    <div key={field.field_id} className="flex gap-2">
                      <input {...register(`images.${index}` as const)} className="w-full px-4 py-2 border-2 rounded-lg text-sm" placeholder="Gallery Image URL https://..." />
                      <button type="button" onClick={() => removeImage(index)} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg">Remove</button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700">Hero Image URL</label>
                    <input {...register("hero_image")} className="w-full px-4 py-2 border-2 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700">Brochure URL</label>
                    <input {...register("brochure_url")} className="w-full px-4 py-2 border-2 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700">Virtual Tour URL</label>
                    <input {...register("virtual_tour_url")} className="w-full px-4 py-2 border-2 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 9: REVIEW */}
          {currentStep === 9 && (
            <div className="space-y-8 pb-8">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-900">👀 Final Review</h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  Step 9 of 9
                </span>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {/* 1. BASIC INFORMATION */}
                <section className="bg-slate-50 rounded-xl p-6 border-2 border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">1</span>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <ReviewItem label="Project Name" value={getValues('project_name')} />
                    <ReviewItem label="Property Type" value={getValues('property_type')} />
                    <ReviewItem label="Status" value={getValues('projectstatus')} />
                    <ReviewItem label="Theme" value={getValues('project_theme')} />
                    <ReviewItem label="Land Area" value={getValues('total_land_area')} />
                    <ReviewItem label="Total Units" value={getValues('total_units')} />
                    <ReviewItem label="Phases" value={getValues('total_phases')} />
                    <ReviewItem label="Current Phase" value={getValues('current_phase_under_sale')} />
                    <ReviewItem label="Region" value={getValues('region')} />
                    <ReviewItem label="Zone" value={getValues('city_zone')} />
                    <ReviewItem label="Possession" value={`${getValues('possession_month') || ''} ${getValues('possession_year') || ''}`} />
                    <ReviewItem label="RERA No" value={getValues('rera_registration_no')} />
                    <ReviewItem label="Slug" value={getValues('slug')} fullWidth />
                  </div>
                </section>

                {/* 1B. DEVELOPER DETAILS */}
                <section className="bg-slate-50 rounded-xl p-6 border-2 border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center text-sm">👤</span>
                    Developer Profile
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ReviewItem label="Developer Name" value={getValues('developer_name')} />
                    <ReviewItem label="Builder Grade" value={getValues('developer_buildergrade')} />
                    <ReviewItem label="Years In Market" value={getValues('developer_years_in_market')} />
                    <ReviewItem label="Website" value={getValues('developer_website')} />
                    <ReviewItem label="Corporate RERA" value={getValues('developer_corporate_rera')} />
                    <ReviewItem label="Logo URL" value={getValues('developer_logo_url')} />
                    <ReviewItem label="Reputation" value={getValues('developer_reputation')} />
                    <ReviewItem label="Past Projects" value={getValues('developer_past_projects')} />
                    <ReviewItem label="Financial Strength" value={getValues('developer_financial_strength')} />
                  </div>
                  <div className="mt-4">
                    <ReviewItem label="Developer Description" value={getValues('developer_description')} fullWidth />
                  </div>
                </section>

                {/* 2. LOCATION & MAP */}
                <section className="bg-slate-50 rounded-xl p-6 border-2 border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">2</span>
                    Location Details
                  </h3>
                  <div className="space-y-4">
                    <ReviewItem label="Full Address" value={getValues('address_line')} fullWidth />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <ReviewItem label="Coordinates" value={`${getValues('lat')}, ${getValues('lng')}`} />
                      <ReviewItem label="District" value={getValues('district')} />
                      <ReviewItem label="City" value={getValues('city')} />
                      <ReviewItem label="Pincode" value={getValues('pincode')} />
                    </div>
                  </div>
                </section>

                {/* 3. UNIT TYPES */}
                <section className="bg-slate-50 rounded-xl p-6 border-2 border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">3</span>
                    Unit Configurations
                  </h3>
                  {unitFields.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full text-left bg-white text-sm">
                        <thead className="bg-slate-100 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-2 font-bold text-slate-700">Unit #</th>
                            <th className="px-4 py-2 font-bold text-slate-700">Location</th>
                            <th className="px-4 py-2 font-bold text-slate-700">Config</th>
                            <th className="px-4 py-2 font-bold text-slate-700">Type</th>
                            <th className="px-4 py-2 font-bold text-slate-700">Stats</th>
                            <th className="px-4 py-2 font-bold text-slate-700">Area (sqft)</th>
                            <th className="px-4 py-2 font-bold text-slate-700 text-right">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {unitFields.map((u: any, i) => (
                            <tr key={u.field_id}>
                              <td className="px-4 py-2 text-slate-600">
                                {u.unitnumber || 'N/A'}<br />
                                <span className="text-xs text-blue-600 font-bold">{u.status}</span>
                              </td>
                              <td className="px-4 py-2 text-slate-600">
                                {u.tower}<br />
                                <span className="text-xs">Floor {u.floornumber}</span>
                              </td>
                              <td className="px-4 py-2 font-medium text-slate-900">{u.config}</td>
                              <td className="px-4 py-2 text-slate-600">{u.type}</td>
                              <td className="px-4 py-2 text-slate-600 text-xs">
                                {u.facing} Facing<br />
                                {u.wccount} Bath | {u.balconycount} Balc
                              </td>
                              <td className="px-4 py-2 text-slate-600 text-xs text-nowrap">
                                <b>{u.actualsba} SBA</b><br />
                                {u.carpetarea} Carpet<br />
                                {u.udsarea} UDS
                              </td>
                              <td className="px-4 py-2 text-right font-bold text-blue-600">
                                {u.pricetotal ? `₹${(u.pricetotal / 100000).toFixed(2)}L` : 'TBD'}
                                <div className="text-xs font-normal text-slate-500">@ ₹{u.pricepersqft}/sqft</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">No units added</p>
                  )}
                </section>

                {/* 4. PRICING & COMMERCIALS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="bg-slate-50 rounded-xl p-6 border-2 border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">4</span>
                      Pricing Details
                    </h3>
                    <div className="space-y-4">
                      <ReviewItem label="Price Range" value={getValues('pricedisplay')} />
                      <div className="grid grid-cols-2 gap-2">
                        <ReviewItem label="Min Price" value={getValues('pricemin') ? `₹${getValues('pricemin')?.toLocaleString()}` : undefined} />
                        <ReviewItem label="Max Price" value={getValues('pricemax') ? `₹${getValues('pricemax')?.toLocaleString()}` : undefined} />
                      </div>
                      <ReviewItem label="Payment Plan" value={getValues('payment_plan_type')} />
                      <ReviewItem label="Plan Details" value={getValues('payment_plan_details')} fullWidth />
                      <ReviewItem label="Floor Rise" value={getValues('floor_rise_charges')} fullWidth />
                    </div>
                  </section>

                  <section className="bg-slate-50 rounded-xl p-6 border-2 border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">$</span>
                      Other Costs
                    </h3>
                    <div className="space-y-2">
                      {commercialFields.map((c: any, i) => (
                        <div key={c.field_id} className="flex flex-col p-2 bg-white rounded border border-slate-200">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-700 font-bold">{c.name}</span>
                            <span className="font-bold text-slate-900">₹{c.amount?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 uppercase mt-1">
                            <span>{c.cost_type}</span>
                            {/* <span>When: {c.payment_milestone}</span> */}
                          </div>
                        </div>
                      ))}
                      {commercialFields.length === 0 && <p className="text-slate-500 italic">No additional costs</p>}
                    </div>
                  </section>
                </div>

                {/* 5. AMENITIES & LANDMARKS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="bg-slate-50 rounded-xl p-6 border-2 border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">5</span>
                      Amenities
                    </h3>
                    <div className="flex flex-col gap-2">
                      {amenityFields.map((a: any) => (
                        <div key={a.field_id} className="p-3 bg-white border border-slate-200 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-800">{a.name}</span>
                            <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] uppercase font-bold">{a.category}</span>
                          </div>
                          <div className="text-xs text-slate-500">{a.description} <br /> <strong className="text-slate-700">{a.size_specs}</strong></div>
                        </div>
                      ))}
                      {amenityFields.length === 0 && <p className="text-slate-500 italic">No amenities added</p>}
                    </div>
                  </section>

                  <section className="bg-slate-50 rounded-xl p-6 border-2 border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">6</span>
                      Nearby Landmarks
                    </h3>
                    <div className="space-y-2">
                      {landmarkFields.map((l: any) => (
                        <div key={l.field_id} className="text-xs p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                          <div>
                            <div className="font-bold text-slate-800">{l.name}</div>
                            <div className="text-[10px] text-slate-500 uppercase mt-0.5">{l.category}</div>
                          </div>
                          <div className="text-right text-slate-600 font-medium">
                            {l.distance_km} <br />
                            <span className="text-slate-400">({l.travel_time})</span>
                          </div>
                        </div>
                      ))}
                      {landmarkFields.length === 0 && <p className="text-slate-500 italic">No landmarks added</p>}
                    </div>
                  </section>
                </div>

                {/* 6. TECHNICAL SPECS */}
                <section className="bg-slate-50 rounded-xl p-6 border-2 border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">7</span>
                    Technical Specifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* General */}
                    <ReviewItem label="Total Towers" value={getValues('no_of_towers')} />
                    <ReviewItem label="Floors/Tower" value={getValues('floors_per_tower')} />
                    <ReviewItem label="Units/Floor" value={getValues('units_per_floor')} />
                    <ReviewItem label="Elevators" value={getValues('elevators_per_tower')} />
                    <ReviewItem label="Service Lifts" value={getValues('service_elevators_per_tower')} />
                    <ReviewItem label="Open Space %" value={getValues('open_space_pct')} />

                    {/* Structure/Walls */}
                    <ReviewItem label="Construction Type" value={getValues('construction_type')} />
                    <ReviewItem label="Structure Details" value={getValues('structure_details')} fullWidth />
                    <ReviewItem label="Interior Walls" value={getValues('wall_finishing_interior')} />
                    <ReviewItem label="Exterior Walls" value={getValues('wall_finishing_exterior')} />

                    {/* Flooring */}
                    <ReviewItem label="Flooring (Living)" value={getValues('flooring_living_dining')} />
                    <ReviewItem label="Flooring (Master)" value={getValues('flooring_master_bedroom')} />
                    <ReviewItem label="Flooring (Other)" value={getValues('flooring_other_bedrooms')} />
                    <ReviewItem label="Flooring (Balcony)" value={getValues('flooring_balcony_utility')} />

                    {/* Kitchen & Bath */}
                    <ReviewItem label="Kitchen Counter" value={getValues('kitchen_countertop')} />
                    <ReviewItem label="Kitchen Sink" value={getValues('kitchen_sink_details')} />
                    <ReviewItem label="Kitchen Dado" value={getValues('kitchen_dado_tiling')} />
                    <ReviewItem label="Sanitary Ware" value={getValues('bathroom_sanitary_ware')} />
                    <ReviewItem label="Bathroom CP" value={getValues('bathroom_cp_fittings')} />
                    <ReviewItem label="Bathroom Dado" value={getValues('bathroom_dado_tiling')} />

                    {/* Doors & Electrical */}
                    <ReviewItem label="Main Door" value={getValues('main_door_specs')} />
                    <ReviewItem label="Internal Doors" value={getValues('internal_doors_specs')} />
                    <ReviewItem label="Windows" value={getValues('windows_specs')} />
                    <ReviewItem label="Electrical" value={getValues('electrical_switches')} />

                    {/* Site Utilities */}
                    <ReviewItem label="Power Backup" value={getValues('power_backup')} />
                    <ReviewItem label="Gas Provision" value={getValues('gas_pipeline_provision')} />
                    <ReviewItem label="Water Source" value={getValues('water_source')} />
                    <ReviewItem label="Road Width" value={getValues('road_width')} />
                  </div>
                </section>

                {/* 7. CONNECTIVITY */}
                <section className="bg-slate-50 rounded-xl p-6 border-2 border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">8</span>
                    Connectivity (Distances)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <ReviewItem label="Main Road" value={getValues('distancetomainroad')} />
                    <ReviewItem label="Airport" value={getValues('airportdistance')} />
                    <ReviewItem label="Railway" value={getValues('railwaystationdistance')} />
                    <ReviewItem label="Metro" value={getValues('metrostationdistance')} />
                    <ReviewItem label="Bus Stop" value={getValues('busstopdistance')} />
                  </div>
                </section>

                {/* 8. ANALYSIS */}
                <section className="bg-slate-50 rounded-xl p-6 border-2 border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">9</span>
                    Market Analysis
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ReviewItem label="Target Customer Profile" value={getValues('target_customer')} />
                      <ReviewItem label="Overall Rating" value={getValues('overall_rating')} />
                      <ReviewItem label="Timeline Risk" value={getValues('timeline_risk')} />
                      <ReviewItem label="Legal & Title Notes" value={getValues('legal_notes')} />
                    </div>
                    <ReviewItem label="Unique Selling Point (USP)" value={getValues('usp')} fullWidth />
                    <ReviewItem label="Closing Pitch" value={getValues('closing_pitch')} fullWidth />
                    <ReviewItem label="Objection Handling" value={getValues('objection_handling')} fullWidth />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                      <div>
                        <h4 className="text-sm font-bold text-green-800 mb-2 underline">Strengths (Pros)</h4>
                        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                          {(getValues('pros') as string[] || []).map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-red-800 mb-2 underline">Considerations (Cons)</h4>
                        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                          {(getValues('cons') as string[] || []).map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                      <div>
                        <h4 className="text-sm font-bold text-blue-800 mb-2 underline">USP Highlights</h4>
                        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                          {(getValues('usp_highlights') as string[] || []).map((h, i) => <li key={i}>{h}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 mb-2 underline">Competitors</h4>
                        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                          {getValues('competitors')?.map((c: any, i) => <li key={i}><strong>{c.name}</strong> - {c.price_range}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 9. MEDIA */}
                <section className="bg-slate-50 rounded-xl p-6 border-2 border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">🔗</span>
                    Media & Links
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <ReviewItem label="Hero Image Profile" value={getValues('hero_image')} />
                      <ReviewItem label="Brochure PDF Link" value={getValues('brochure_url')} />
                      <ReviewItem label="Virtual Tour Link" value={getValues('virtual_tour_url')} />
                    </div>
                    {imageFields.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 mb-2">Gallery Images ({imageFields.length})</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {getValues('images')?.map((img, i) => (
                            <div key={i} className="aspect-video bg-slate-200 rounded-lg overflow-hidden border border-slate-300 relative group">
                              <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition p-2">
                                <span className="text-[10px] text-white text-center break-all">{img}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {submitError && (
                <div className="mt-8 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <h4 className="font-bold text-red-800">Submission Error</h4>
                      <p className="text-red-700 text-sm">{submitError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-8 border-t-2 border-slate-200 mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition ${currentStep === 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-600 text-white hover:bg-slate-700'}`}
            >
              ← Previous
            </button>

            <div className="text-center">
              <p className="text-sm text-slate-500">Step {currentStep} of {steps.length}</p>
            </div>

            {currentStep < steps.length && (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Next →
              </button>
            )}

            {currentStep === steps.length && (
              <button
                type="submit"
                disabled={submitting}
                className={`px-8 py-3 rounded-lg font-medium transition ${submitting ? 'bg-slate-400 text-white cursor-not-allowed' : `${submitButtonColor} text-white`}`}
              >
                {submitting ? '⏳ Submitting...' : submitButtonText}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
