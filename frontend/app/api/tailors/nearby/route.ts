import { NextResponse } from 'next/server'

function calculateDistanceInMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Number((R * c).toFixed(2))
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') || '')
  const lng = parseFloat(searchParams.get('lng') || '')
  const radiusMiles = parseFloat(searchParams.get('radiusMiles') || '8.0') || 8.0

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'Valid lat and lng query parameters are required' }, { status: 400 })
  }

  const results: any[] = []

  // Fetch partner studios and filter strictly by latitude and longitude distance (8 miles)
  try {
    const res = await fetch(`${BACKEND_URL}/stores?lat=${lat}&lng=${lng}&radiusMiles=${radiusMiles}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (res.ok) {
      const data = await res.json()
      const allStores = Array.isArray(data.stores) ? data.stores : []

      allStores.forEach((store: any) => {
        const storeLat = store.coords?.lat ?? store.lat
        const storeLng = store.coords?.lng ?? store.lng

        if (typeof storeLat === 'number' && typeof storeLng === 'number') {
          const dist = calculateDistanceInMiles(lat, lng, storeLat, storeLng)

          // Only include studios that strictly fall inside the 8 miles radius
          if (dist <= radiusMiles) {
            results.push({
              ...store,
              coords: { lat: storeLat, lng: storeLng },
              distanceMiles: dist,
              distance: `${dist} mi away`,
            })
          }
        }
      })
    }
  } catch (err) {
    console.warn('Backend store fetch error in nearby route:', err)
  }

  // Sort strictly by closest distance to user
  results.sort((a, b) => a.distanceMiles - b.distanceMiles)

  return NextResponse.json({
    success: true,
    tailors: results,
    count: results.length,
    radiusMiles,
    center: { lat, lng },
  })
}

