import { ChromaClient, DefaultEmbeddingFunction } from 'chromadb'

enum IncludeEnum {
  Documents = 'documents',
  Embeddings = 'embeddings',
  Metadatas = 'metadatas',
  Distances = 'distances',
}

type Auth = {
  authType: string
  token: string
  username: string
  password: string
}

function formatAuth(auth: Auth) {
  if (auth.authType === 'token') {
    return {
      provider: 'token',
      credentials: auth.token,
    }
  } else if (auth.authType === 'basic') {
    return {
      provider: 'basic',
      credentials: {
        username: auth.username,
        password: auth.password,
      },
    }
  } else {
    // Return undefined for no auth when authType is not specified or invalid
    return undefined
  }
}

export async function fetchCollections(connectionString: string, auth: Auth, tenant: string, database: string) {
  try {
    console.log('Attempting to connect to ChromaDB:', {
      connectionString,
      auth: formatAuth(auth),
      database,
      tenant,
    })

    const client = new ChromaClient({
      path: connectionString,
      auth: formatAuth(auth),
      database: database,
      tenant: tenant,
    })

    const collections = await client.listCollections()
    console.log('Successfully fetched collections:', collections)
    return collections
  } catch (error: any) {
    console.error('Error in fetchCollections:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      status: error.status,
      statusText: error.statusText,
    })

    // Handle specific ChromaDB connection errors
    if (error.message?.includes('fetch')) {
      throw new Error(
        `Connection failed to ${connectionString}. Please check your connection string and network connectivity.`
      )
    } else if (error.message?.includes('JSON')) {
      throw new Error(
        `Invalid response from server at ${connectionString}. The server may not be a valid ChromaDB instance.`
      )
    } else if (error.message?.includes('401') || error.message?.includes('403')) {
      throw new Error('Authentication failed. Please check your credentials.')
    } else {
      throw new Error(`Failed to connect to ChromaDB: ${error.message}`)
    }
  }
}

const PAGE_SIZE = 20

export async function fetchRecords(
  connectionString: string,
  auth: Auth,
  collectionName: string,
  page: number,
  tenant: string,
  database: string
) {
  try {
    const client = new ChromaClient({
      path: connectionString,
      auth: formatAuth(auth),
      database: database,
      tenant: tenant,
    })

    const embeddingFunction = new DefaultEmbeddingFunction()
    const collection = await client.getCollection({ name: collectionName, embeddingFunction: embeddingFunction })

    const response = await collection.get({
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      include: [IncludeEnum.Documents, IncludeEnum.Embeddings, IncludeEnum.Metadatas],
    })

    return response.ids.map((id, index) => ({
      id,
      document: response.documents[index],
      metadata: response.metadatas[index],
      embedding: response.embeddings?.[index],
    }))
  } catch (error: any) {
    console.error('Error in fetchRecords:', error)
    throw new Error(`Failed to fetch records from collection '${collectionName}': ${error.message}`)
  }
}

const QUERY_K = 10

type queryErrorResponse = {
  error: string
}

export async function queryRecords(
  connectionString: string,
  auth: Auth,
  collectionName: string,
  queryEmbeddings: number[],
  tenant: string,
  database: string
) {
  const client = new ChromaClient({
    path: connectionString,
    auth: formatAuth(auth),
    database: database,
    tenant: tenant,
  })

  const embeddingFunction = new DefaultEmbeddingFunction()
  const collection = await client.getCollection({ name: collectionName, embeddingFunction: embeddingFunction })

  const response = await collection.query({
    queryEmbeddings: queryEmbeddings,
    nResults: QUERY_K,
    include: [IncludeEnum.Documents, IncludeEnum.Embeddings, IncludeEnum.Metadatas, IncludeEnum.Distances],
  })

  if ((response as unknown as queryErrorResponse)['error'] != null) {
    throw new Error((response as unknown as queryErrorResponse)['error'])
  }

  return response.ids[0].map((id, index) => ({
    id,
    document: response.documents[0][index],
    metadata: response.metadatas[0][index],
    embedding: response.embeddings?.[0][index],
    distance: response.distances?.[0][index],
  }))
}

// src/lib/server/db.ts

export async function queryRecordsText(
  connectionString: string,
  auth: Auth,
  collectionName: string,
  queryTexts: string,
  tenant: string,
  database: string
) {
  const client = new ChromaClient({
    path: connectionString,
    auth: formatAuth(auth),
    database: database,
    tenant: tenant,
  })

  const embeddingFunction = new DefaultEmbeddingFunction()
  const collection = await client.getCollection({ name: collectionName, embeddingFunction: embeddingFunction })

  const response = await collection.get({
    ids: [queryTexts],
    include: [IncludeEnum.Documents, IncludeEnum.Embeddings, IncludeEnum.Metadatas],
  })

  if ((response as unknown as queryErrorResponse)['error'] != null) {
    throw new Error((response as unknown as queryErrorResponse)['error'])
  }

  console.log(response)

  // Check if the response is empty
  if (response.ids.length === 0) {
    throw new Error('RecordNotFound')
  }

  return [
    {
      id: response.ids[0],
      document: response.documents[0],
      metadata: response.metadatas[0],
      embedding: response.embeddings?.[0],
      distance: 0,
    },
  ]
}

export async function countRecord(
  connectionString: string,
  auth: Auth,
  collectionName: string,
  tenant: string,
  database: string
) {
  const client = new ChromaClient({
    path: connectionString,
    auth: formatAuth(auth),
    database: database,
    tenant: tenant,
  })

  const embeddingFunction = new DefaultEmbeddingFunction()
  const collection = await client.getCollection({ name: collectionName, embeddingFunction: embeddingFunction })

  return await collection.count()
}
