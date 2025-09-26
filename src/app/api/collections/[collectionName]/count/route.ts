import { NextResponse } from 'next/server'

// Generate static params for dynamic route (required for static export)
export async function generateStaticParams() {
  // Return empty array to indicate this route should be handled at runtime
  return []
}

// IONOS ChromaDB API implementation for collection count
export async function GET(request: Request, { params }: { params: { collectionName: string } }) {
  const url = new URL(request.url)
  const connectionString = url.searchParams.get('connectionString')
  const token = url.searchParams.get('token')

  if (!connectionString || !token) {
    return NextResponse.json({ error: 'Missing connection parameters' }, { status: 400 })
  }

  try {
    // Use IONOS API to get collection count
    const collectionId = params.collectionName
    console.log('Attempting to get count for collection:', collectionId)

    console.log('Count API - Request URL:', `${connectionString}/collections/${collectionId}/documents`)
    console.log('Count API - Request headers:', {
      Authorization: `Bearer ${token.substring(0, 20)}...`,
      'Content-Type': 'application/json',
    })
    
    const response = await fetch(`${connectionString}/collections/${collectionId}/documents`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('IONOS API Error:', response.status, errorText)
      return NextResponse.json(
        { error: `IONOS API Error: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('IONOS Count Response:', data)
    console.log('Count API - Response status:', response.status)
    console.log('Count API - Response headers:', Object.fromEntries(response.headers.entries()))

    // Use the same parsing logic as the records API for consistency
    let count = 0
    if (data && data.items && Array.isArray(data.items)) {
      count = data.items.length
      console.log(`Count API - Using items array length: ${count}`)
    } else if (data && Array.isArray(data)) {
      count = data.length
      console.log(`Count API - Using array length: ${count}`)
    } else if (data && data.documents && Array.isArray(data.documents)) {
      count = data.documents.length
      console.log(`Count API - Using documents array length: ${count}`)
    } else {
      console.warn('Count API - Could not determine count from response structure:', data)
      count = 0
    }
    
    console.log(`Count API - Final count for collection ${collectionId}: ${count}`)

    return NextResponse.json({ count })
  } catch (error: any) {
    console.error('Error getting collection count from IONOS:', error)
    return NextResponse.json({ error: `Failed to get collection count from IONOS: ${error.message}` }, { status: 500 })
  }
}
