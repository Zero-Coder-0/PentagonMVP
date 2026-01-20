'use client'

import React, { useState } from 'react'

interface LocationSearchProps {
  onLocationSelect: (location: { lat: number; lng: number; displayName: string }) => void;
}

export default function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      // Use OpenStreetMap Nominatim API (Free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Bangalore')}`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const result = data[0]
        onLocationSelect({
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          displayName: result.display_name.split(',')[0] // Keep name short
        })
      } else {
        alert('Location not found in Bangalore!')
      }
    } catch (error) {
      console.error('Search failed:', error)
      alert('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSearch} className="p-4 border-b bg-white shadow-sm">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search location (e.g. Whitefield)..."
          className="flex-1 p-2 border rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded font-medium text-sm hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>
    </form>
  )
}
