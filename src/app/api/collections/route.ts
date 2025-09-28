import { NextResponse } from 'next/server'

// Force runtime execution for dynamic server usage
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// IONOS ChromaDB API implementation
export async function GET(request: Request) {
  const url = new URL(request.url)
  const connectionString = url.searchParams.get('connectionString')
  const token = url.searchParams.get('token')

  if (!connectionString || !token) {
    return NextResponse.json({ error: 'Missing connection parameters' }, { 
      status: 400,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }

  try {
    // Use IONOS API directly with Bearer token authentication
    const cacheBuster = Date.now()
    const response = await fetch(`${connectionString}/collections?limit=100&offset=0&_t=${cacheBuster}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `IONOS API Error: ${response.status} - ${errorText}` },
        { 
          status: response.status,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      )
    }

    const data = await response.json()
    console.log("route.ts", data);
    let collections: Array<{ id: string; name: string; count: number }> = []

    // Handle different response formats from IONOS
    if (Array.isArray(data)) {
      // If response is already an array
      collections = data.map((collection: any) => ({
        id: collection.id || collection.name,
        name: collection.properties?.name || collection.metadata?.name || collection.name || collection.id,
        count: 0, // Use 0 instead of potentially incorrect metadata count
      }))
      console.log("route-collection", collections);
    } else if (data && typeof data === 'object') {
      if (data.items && Array.isArray(data.items)) {
        console.log("route-collection-items", collections);
        // IONOS specific format: collections are in 'items' array
        // For each collection, use the properties.name if available, else fallback as described
        const collectionPromises = data.items.map(async (collection: any) => {
          console.log("hhhhhh", collection)
          const collectionId = collection.id
          const collectionName =
            collection.properties?.name ||
            collection.metadata?.name ||
            collection.name ||
            collectionId
          
          // Use the documentsCount from properties if available, otherwise try to fetch
          let count = collection.properties?.documentsCount || 0
          
          // Only fetch document count if not available in properties
          if (count === 0 || count === undefined) {
            try {
              const docCacheBuster = Date.now()
              const documentsUrl = `${connectionString}/collections/${collectionId}/documents?limit=1000&offset=0&_t=${docCacheBuster}`
              const countResponse = await fetch(documentsUrl, {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-cache, no-store, must-revalidate',
                  'Pragma': 'no-cache',
                  'Expires': '0'
                },
                cache: 'no-store'
              })
              if (countResponse.ok) {
                const countData = await countResponse.json()
                if (countData && countData.items && Array.isArray(countData.items)) {
                  count = countData.items.length
                } else if (countData && Array.isArray(countData)) {
                  count = countData.length
                } else if (countData && countData.documents && Array.isArray(countData.documents)) {
                  count = countData.documents.length
                }
              }
            } catch (error) {
              console.log(`Failed to fetch count for collection ${collectionName}:`, error)
              // Keep the count from properties or 0
            }
          }
          
          return {
            id: collectionId,
            name: collectionName,
            count: count,
          }
        })
        
        const results = await Promise.allSettled(collectionPromises)
        collections = results
          .filter((result): result is PromiseFulfilledResult<{ id: string; name: string; count: number }> => 
            result.status === 'fulfilled'
          )
          .map(result => result.value)
        console.log("route-collection-7", collections);
      } else if (data.collections && Array.isArray(data.collections)) {
        collections = data.collections.map((collection: any) => ({
          id: collection.id || collection.name,
          name: collection.properties?.name || collection.metadata?.name || collection.name || collection.id,
          count: 0, // Use 0 instead of potentially incorrect metadata count
        }))
        console.log("route-collection-collections", collections);

      } else if (data.data && Array.isArray(data.data)) {
        collections = data.data.map((collection: any) => ({
          id: collection.id || collection.name,
          name: collection.properties?.name || collection.metadata?.name || collection.name || collection.id,
          count: 0, // Use 0 instead of potentially incorrect metadata count
        }))
        console.log("route-collection-5", collections);

      } else if (data.names && Array.isArray(data.names)) {
        collections = data.names.map((name: string) => ({
          id: name,
          name: name,
          count: 0,
        }))
        console.log("route-collection-6", collections);

      } else {
        collections = []
      }
    } else {
      collections = []
    }

    return NextResponse.json(collections, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to connect to IONOS ChromaDB: ${error.message}` }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}
