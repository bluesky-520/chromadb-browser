import { NextResponse } from 'next/server'

// Generate static params for dynamic route (required for static export)
export async function generateStaticParams() {
  // Return empty array to indicate this route should be handled at runtime
  return []
}

// IONOS ChromaDB API implementation for deleting a collection
export async function DELETE(request: Request, { params }: { params: { collectionName: string } }) {
  const url = new URL(request.url)
  const connectionString = url.searchParams.get('connectionString')
  const token = url.searchParams.get('token')

  if (!connectionString || !token) {
    return NextResponse.json({ error: 'Missing connection parameters' }, { status: 400 })
  }

  try {
    const collectionName = params.collectionName
    console.log('Delete collection request:', collectionName)

    // Use IONOS API to delete collection
    const response = await fetch(`${connectionString}/collections/${collectionName}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('IONOS API Error:', response.status, errorText)
      
      // Try to parse error response as JSON if it's not empty
      let errorData = null
      try {
        if (errorText.trim()) {
          errorData = JSON.parse(errorText)
        }
      } catch (parseError) {
        // If parsing fails, use the raw text
        console.log('Could not parse error response as JSON, using raw text')
      }
      
      return NextResponse.json(
        { 
          error: `IONOS API Error: ${response.status} - ${errorText}`,
          details: errorData
        },
        { status: response.status }
      )
    }

    // Check if response has content before trying to parse JSON
    const responseText = await response.text()
    let data = null
    
    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText)
        console.log('IONOS Delete Collection Response:', data)
      } catch (parseError) {
        console.log('Response is not valid JSON, treating as successful deletion')
        data = { message: 'Collection deleted successfully' }
      }
    } else {
      console.log('Empty response received, treating as successful deletion')
      data = { message: 'Collection deleted successfully' }
    }

    return NextResponse.json({
      success: true,
      message: 'Collection deleted successfully',
      data: data,
    })
  } catch (error: any) {
    console.error('Error deleting collection from IONOS:', error)
    return NextResponse.json({ error: `Failed to delete collection from IONOS: ${error.message}` }, { status: 500 })
  }
}
