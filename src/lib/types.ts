export type AppConfig = {
  connectionString: string
  currentCollection: string
  authType: string
  token: string
  username: string
  password: string
  tenant: string
  database: string
}

export type Collection = string

export type Record = {
  id: string
  document: string
  metadata: any
  properties?: {
    content: string
    contentType: string
    description: string
    labels: { [key: string]: string }
    name: string
  }
  embedding: number[]
  distance: number
}

export type RecordsPage = {
  total: number
  page: number
  records: Record[]
}

export type ErrorResponse = {
  error: string
}

export type QueryResult = RecordsPage | ErrorResponse
