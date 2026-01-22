'use client'
import { useState } from 'react'
import MegaPopup from './MegaPopup'  // For consistency

export default function DetailContainer({ selectedProp, properties }: any) {
  const [showBooking, setShowBooking] = useState(false)

  if (!selectedProp) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
        <div>👈 Click property for full details</div>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, height: '100vh', overflowY: 'auto' }}>
      {/* FULL DETAILS - Your existing beautiful UI */}
      {/* WhatsApp button, Booking button, Key specs, Contact card, Similar properties */}
      
      {/* Booking modal stays the same */}
    </div>
  )
}
