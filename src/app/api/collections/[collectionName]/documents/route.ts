import { NextResponse } from 'next/server'

// Generate static params for dynamic route (required for static export)
export async function generateStaticParams() {
  // Return empty array to indicate this route should be handled at runtime
  return []
}

// IONOS ChromaDB API implementation for adding documents
export async function POST(request: Request, { params }: { params: { collectionName: string } }) {
  const url = new URL(request.url)
  const connectionString = url.searchParams.get('connectionString')
  const token = url.searchParams.get('token')

  if (!connectionString || !token) {
    return NextResponse.json({ error: 'Missing connection parameters' }, { status: 400 })
  }

  try {
    const body = await request.json()
    console.log('Add document request body:', body)
    console.log('Collection ID:', params.collectionName)

    if (!body || !body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { error: 'Invalid payload format. Expected { type: "collection", items: [...] }' },
        { status: 400 }
      )
    }

    // Use the original IONOS payload format but ensure it has the required structure
    console.log('Using IONOS payload format:', body)

    // Use IONOS API to add documents to collection
    const collectionId = params.collectionName
    console.log('Adding documents to collection:', collectionId)
    console.log('Using token:', token.substring(0, 20) + '...')
    console.log('Request URL:', `${connectionString}/collections/${collectionId}/documents`)
    console.log('Request headers:', {
      Authorization: `Bearer ${token.substring(0, 20)}...`,
      'Content-Type': 'application/json',
    })

    const response = await fetch(`${connectionString}/collections/${collectionId}/documents`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
    console.log('IONOS Add Document Response:', data)

    return NextResponse.json({
      success: true,
      message: `Successfully added ${body.items.length} document(s)`,
      data: data,
    })
  } catch (error: any) {
    console.error('Error adding documents to IONOS:', error)
    return NextResponse.json({ error: `Failed to add documents to IONOS: ${error.message}` }, { status: 500 })
  }
}
