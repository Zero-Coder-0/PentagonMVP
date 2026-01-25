'use client'

import React, { useState } from 'react'
import { X, Calendar, User, Phone, Clock, CheckCircle } from 'lucide-react'
import { createClient } from '@/core/db/client'
import { Property } from '@/modules/inventory/types'

interface BookingFormProps {
  property: Property
  isOpen: boolean
  onClose: () => void
}

export default function BookingForm({ property, isOpen, onClose }: BookingFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    visit_time: '',
    notes: ''
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const supabase = createClient()
    
    // Insert into site_visits
    const { error } = await supabase.from('site_visits').insert({
      property_id: property.id,
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      visit_time: new Date(formData.visit_time).toISOString(),
      notes: formData.notes,
      status: 'Scheduled'
    })

    if (error) {
      alert('Error booking visit: ' + error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setFormData({ customer_name: '', customer_phone: '', visit_time: '', notes: '' })
      }, 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold">Schedule Site Visit</h3>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
              <BuildingIcon className="w-3 h-3" /> {property.name}
            </p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-800">Visit Confirmed!</h4>
            <p className="text-slate-500 mt-2">The sales team has been notified.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Customer Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  required
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.customer_name}
                  onChange={e => setFormData({...formData, customer_name: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  required
                  type="tel"
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="+91 98765 43210"
                  value={formData.customer_phone}
                  onChange={e => setFormData({...formData, customer_phone: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Visit Time</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  required
                  type="datetime-local"
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={formData.visit_time}
                  onChange={e => setFormData({...formData, visit_time: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Internal Notes</label>
              <textarea 
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm h-24 resize-none"
                placeholder="Customer preferences, budget constraints..."
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-200 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? 'Scheduling...' : 'Confirm Booking'}
              {!loading && <Clock className="w-4 h-4" />}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>
  )
}
