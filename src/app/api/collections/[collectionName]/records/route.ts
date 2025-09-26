import { NextResponse } from 'next/server'

// IONOS ChromaDB API implementation for records
export async function GET(request: Request, { params }: { params: { collectionName: string } }) {
  const url = new URL(request.url)
  const connectionString = url.searchParams.get('connectionString')
  const token = url.searchParams.get('token')
  const page = parseInt(url.searchParams.get('page') || '1', 10)

  if (!connectionString || !token) {
    return NextResponse.json({ error: 'Missing connection parameters' }, { status: 400 })
  }

  try {
    // Use IONOS API to get records from collection
    // For IONOS, we need to use the collection ID in the URL path
    const collectionId = params.collectionName
    console.log('Attempting to fetch records from collection:', collectionId)
    console.log('Using token:', token.substring(0, 20) + '...')
    console.log('Request URL:', `${connectionString}/collections/${collectionId}/documents`)
    console.log('Request headers:', {
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

    // Process all collections the same way, no demo data
    let records: Array<{
      id: string
      document: string
      metadata: any
      properties?: any
      embedding: number[]
      distance: number
    }> = []

    // Always fetch real data from IONOS API
    const data = await response.json()
    console.log('IONOS Documents Response:', data)

    // Transform IONOS documents response to match expected format
    if (data && data.items && Array.isArray(data.items)) {
      // IONOS specific format: documents are in 'items' array with metadata only
      records = data.items.map((doc: any) => ({
        id: doc.id || `doc-${Math.random()}`,
        document: doc.properties?.content || `Document ID: ${doc.id}`, // Try to get content from properties
        metadata: doc.metadata || {},
        properties: doc.properties || undefined,
        embedding: [], // IONOS doesn't provide embeddings in list view
        distance: 0,
      }))
    } else if (data && Array.isArray(data)) {
      // IONOS documents API returns array of documents directly
      records = data.map((doc: any) => ({
        id: doc.id || doc.documentId || `doc-${Math.random()}`,
        document: doc.properties?.content || doc.content || doc.text || doc.document || `Document ID: ${doc.id}`,
        metadata: doc.metadata || {},
        properties: doc.properties || undefined,
        embedding: doc.embedding || doc.vector || [],
        distance: 0,
      }))
    } else if (data && data.documents && Array.isArray(data.documents)) {
      // Alternative format: documents in a documents property
      records = data.documents.map((doc: any) => ({
        id: doc.id || doc.documentId || `doc-${Math.random()}`,
        document: doc.properties?.content || doc.content || doc.text || doc.document || `Document ID: ${doc.id}`,
        metadata: doc.metadata || {},
        properties: doc.properties || undefined,
        embedding: doc.embedding || doc.vector || [],
        distance: 0,
      }))
    } else {
      console.warn('Invalid IONOS documents response format:', data)
      records = []
    }

    return NextResponse.json({
      total: records.length,
      page: page,
      records: records,
    })
  } catch (error: any) {
    console.error('Error fetching records from IONOS:', error)
    return NextResponse.json({ error: `Failed to fetch records from IONOS: ${error.message}` }, { status: 500 })
  }
}

// IONOS ChromaDB API implementation for queries
export async function POST(request: Request, { params }: { params: { collectionName: string } }) {
  const url = new URL(request.url)
  const connectionString = url.searchParams.get('connectionString')
  const token = url.searchParams.get('token')

  if (!connectionString || !token) {
    return NextResponse.json({ error: 'Missing connection parameters' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const query = body.query

    console.log('Query request body:', body)
    console.log('Extracted query:', query)
    console.log('Collection ID:', params.collectionName)

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    // Use IONOS API to query collection
    const collectionId = params.collectionName
    const queryPayload = {
      query: query,
      n_results: 10,
      include: ['documents', 'metadatas', 'embeddings', 'distances'],
    }

    console.log('IONOS Query payload:', queryPayload)

    const response = await fetch(`${connectionString}/collections/${collectionId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('IONOS Query API Error:', response.status, errorText)
      return NextResponse.json(
        { error: `IONOS Query API Error: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('IONOS Query Response:', data)

    // Transform IONOS response to match expected format
    let records: Array<{
      id: string
      document: string
      metadata: any
      properties?: any
      embedding: number[]
      distance: number
    }> = []

    if (data && data.properties && data.properties.matches && Array.isArray(data.properties.matches)) {
      // IONOS specific format: results are in properties.matches array
      records = data.properties.matches.map((match: any) => ({
        id: match.id || match.documentId || `match-${Math.random()}`,
        document: match.document?.properties?.content || match.content || match.text || `Document ID: ${match.id}`,
        metadata: match.document?.metadata || match.metadata || {},
        properties: match.document?.properties || match.properties || undefined,
        embedding: match.embedding || match.vector || [],
        distance: match.distance || match.score || 0,
      }))
    } else if (data && data.ids && Array.isArray(data.ids) && data.ids[0] && Array.isArray(data.ids[0])) {
      // Standard ChromaDB format
      records = data.ids[0].map((id: string, index: number) => ({
        id,
        document: data.documents?.[0]?.[index] || '',
        metadata: data.metadatas?.[0]?.[index] || {},
        properties: undefined, // Standard ChromaDB doesn't have properties field
        embedding: data.embeddings?.[0]?.[index] || [],
        distance: data.distances?.[0]?.[index] || 0,
      }))
    } else {
      console.warn('Invalid IONOS query response format:', data)
      records = []
    }

    return NextResponse.json({
      total: records.length,
      page: 1,
      records: records,
    })
  } catch (error: any) {
    console.error('Error querying IONOS:', error)
    return NextResponse.json({ error: `Failed to query IONOS: ${error.message}` }, { status: 500 })
  }
}

function extractPage(request: Request) {
  const url = new URL(request.url)
  const searchParams = new URLSearchParams(url.search)
  return parseInt(searchParams.get('page') || '1', 10)
}

async function extractQuery(request: Request): Promise<number[] | string> {
  const res = await request.json()
  const query = res.query

  if (typeof query === 'string') {
    // Check if the string contains commas, indicating it might be a list of floats
    if (query.includes(',')) {
      try {
        return query.split(',').map((item: string) => parseFloat(item))
      } catch (error) {
        // If parsing fails, return the original string
        return query
      }
    } else {
      // If it's a single string without commas, return it as is
      return query
    }
  } else if (Array.isArray(query)) {
    // If it's already an array, assume it's a list of numbers and return it
    return query
  } else {
    // If it's neither a string nor an array, throw an error
    throw new Error('Invalid query format')
  }
}
