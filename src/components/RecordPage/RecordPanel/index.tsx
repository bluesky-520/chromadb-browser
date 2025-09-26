import React from 'react'
import { useAtomValue } from 'jotai'
import { Paper, Text, Box } from '@mantine/core'

import { useGetCollectionRecords, useGetConfig } from '@/lib/client/query'
import { currentPageAtom, queryAtom } from '@/components/RecordPage/atom'
import RecordTable from './RecordTable'
import LoadingRecordTable from './LoadingRecordTable'

const RecordPanel = ({ collectionName }: { collectionName: string }) => {
  const query = useAtomValue(queryAtom)
  const currentPage = useAtomValue(currentPageAtom)

  const { data: config } = useGetConfig()
  const { data: queryResult, isLoading } = useGetCollectionRecords(config, collectionName, currentPage, query)

  // Debug logging (only in development and when data changes)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('RecordPanel Debug:', {
        collectionName,
        queryResult,
        isLoading,
        queryResultType: typeof queryResult,
        queryResultKeys: queryResult ? Object.keys(queryResult) : null,
        queryResultRecords:
          queryResult && 'records' in queryResult ? Array.isArray(queryResult.records) : 'no records property',
      })
    }
  }, [collectionName, queryResult, isLoading])

  // Safety check to prevent rendering objects directly - moved after all hooks
  const hasInvalidStructure = queryResult && typeof queryResult === 'object' && !Array.isArray(queryResult) && !('records' in queryResult)

  if (hasInvalidStructure) {
    console.error('Invalid queryResult structure:', queryResult)
    return (
      <Paper shadow="xs" px="lg" py="xs" mb="md" withBorder>
        <Text c={'red'}>Invalid data structure received: {JSON.stringify(queryResult)}</Text>
      </Paper>
    )
  }

  if (isLoading) {
    return (
      <Paper shadow="xs" p="lg" h={'50vh'} withBorder pos="relative">
        <LoadingRecordTable />
      </Paper>
    )
  }

  if (queryResult) {
    if ('error' in queryResult) {
      return (
        <Paper shadow="xs" px="lg" py="xs" mb="md" withBorder>
          <Text c={'red'}>{queryResult.error}</Text>
        </Paper>
      )
    } else if (queryResult && 'records' in queryResult && Array.isArray(queryResult.records)) {
      return (
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box style={{ flex: 1 }}>
            <RecordTable withQuery={!!query} recordsPage={queryResult} collectionName={collectionName}></RecordTable>
          </Box>
        </Box>
      )
    } else {
      return (
        <Paper shadow="xs" px="lg" py="xs" mb="md" withBorder>
          <Text c={'red'}>Invalid response format: {JSON.stringify(queryResult)}</Text>
        </Paper>
      )
    }
  }

  // Default fallback
  return (
    <Paper shadow="xs" px="lg" py="xs" mb="md" withBorder>
      <Text c={'dimmed'}>No data available</Text>
    </Paper>
  )
}

export default RecordPanel
