import { NextResponse } from 'next/server'

// IONOS ChromaDB API implementation for creating collections
export async function POST(request: Request) {
  const url = new URL(request.url)
  const connectionString = url.searchParams.get('connectionString')
  const token = url.searchParams.get('token')

  if (!connectionString || !token) {
    return NextResponse.json({ error: 'Missing connection parameters' }, { status: 400 })
  }

  try {
    const body = await request.json()
    console.log('Create collection request body:', body)

    // Use IONOS API to create collection
    console.log('Collections API - Request URL:', `${connectionString}/collections`)
    console.log('Collections API - Using token:', token.substring(0, 20) + '...')

    const response = await fetch(`${connectionString}/collections`, {
      method: 'POST',
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
    console.log('IONOS API Response:', data)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error creating collection:', error)
    return NextResponse.json({ error: `Failed to create collection: ${error.message}` }, { status: 500 })
  }
}
