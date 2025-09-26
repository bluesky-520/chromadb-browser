import { NextResponse } from 'next/server'

// Generate static params for dynamic route (required for static export)
export async function generateStaticParams() {
  // Return empty array to indicate this route should be handled at runtime
  return []
}

// IONOS ChromaDB API implementation for deleting a specific document
export async function DELETE(request: Request, { params }: { params: { collectionName: string; documentId: string } }) {
  const url = new URL(request.url)
  const connectionString = url.searchParams.get('connectionString')
  const token = url.searchParams.get('token')

  if (!connectionString || !token) {
    return NextResponse.json({ error: 'Missing connection parameters' }, { status: 400 })
  }

  try {
    const documentId = params.documentId
    console.log('Delete document request:', documentId)
    console.log('Collection ID:', params.collectionName)

    // Use IONOS API to delete document from collection
    const collectionId = params.collectionName
    console.log('Deleting document from collection:', collectionId)
    console.log('Using token:', token.substring(0, 20) + '...')
    console.log('Request URL:', `${connectionString}/collections/${collectionId}/documents/${documentId}`)
    console.log('Request headers:', {
      Authorization: `Bearer ${token.substring(0, 20)}...`,
      'Content-Type': 'application/json',
    })

    const response = await fetch(`${connectionString}/collections/${collectionId}/documents/${documentId}`, {
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
        console.log('IONOS Delete Document Response:', data)
      } catch (parseError) {
        console.log('Response is not valid JSON, treating as successful deletion')
        data = { message: 'Document deleted successfully' }
      }
    } else {
      console.log('Empty response received, treating as successful deletion')
      data = { message: 'Document deleted successfully' }
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
      data: data,
    })
  } catch (error: any) {
    console.error('Error deleting document from IONOS:', error)
    return NextResponse.json({ error: `Failed to delete document from IONOS: ${error.message}` }, { status: 500 })
  }
}
