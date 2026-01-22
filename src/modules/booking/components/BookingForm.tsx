'use client'
import { useState } from 'react'
import { BookingFormState } from '../types'

interface BookingFormProps {
  propertyId: string;
  propertyName: string;
  onSubmit: (data: BookingFormState) => void;
}

export function BookingForm({ propertyName, onSubmit }: BookingFormProps) {
  const [form, setForm] = useState<BookingFormState>({
    customerName: '',
    customerPhone: '',
    visitDate: '',
    visitTime: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4">
      <h3 className="font-bold text-gray-800 mb-3">Book Site Visit</h3>
      <div className="text-sm text-gray-500 mb-4">
        Project: <span className="font-medium text-black">{propertyName}</span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700">Customer Name</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
            value={form.customerPhone}
            onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700">Date</label>
            <input
              type="date"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
              value={form.visitDate}
              onChange={(e) => setForm({ ...form, visitDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Time</label>
            <input
              type="time"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
              value={form.visitTime}
              onChange={(e) => setForm({ ...form, visitTime: e.target.value })}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full mt-2 rounded-md bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Confirm Booking
        </button>
      </form>
    </div>
  )
}
