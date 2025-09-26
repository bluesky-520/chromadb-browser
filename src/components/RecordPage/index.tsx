import { IconPlus, IconTrash } from '@tabler/icons-react'
import { modals } from '@mantine/modals'
import { Box, Group, Text, Button, Title, Stack } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { notifications } from '@mantine/notifications'

import { useGetConfig, useGetCollectionRecords, useDeleteCollection } from '@/lib/client/query'
import { useAtomValue } from 'jotai'
import { currentPageAtom, queryAtom } from '@/components/RecordPage/atom'
import SearchPanel from './SearchPanel'
import RecordPanel from './RecordPanel'

const RecordPage = ({ collectionName }: { collectionName: string }) => {
  const router = useRouter()
  const { data: config } = useGetConfig()
  const query = useAtomValue(queryAtom)
  const currentPage = useAtomValue(currentPageAtom)
  const { data: queryResult } = useGetCollectionRecords(config, collectionName, currentPage, query)
  const deleteCollectionMutation = useDeleteCollection(config)

  // Use the actual records count from the same data source as the table
  const documentCount = queryResult && 'records' in queryResult && Array.isArray(queryResult.records) 
    ? queryResult.records.length 
    : 0


  const openAddDocumentModal = () => {
    modals.openContextModal({
      modalId: 'addDocumentModal',
      modal: 'addDocumentModal',
      size: 'lg',
      title: 'Add Document',
      innerProps: { collectionName },
    })
  }

  const handleDeleteCollection = () => {
    modals.openConfirmModal({
      title: 'Delete Collection',
      children: (
        <Text size="sm">
          Are you sure you want to delete the collection "{collectionName}"? This action cannot be undone and will permanently remove all documents in this collection.
        </Text>
      ),
      labels: { confirm: 'Delete Collection', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteCollectionMutation.mutate(collectionName, {
          onSuccess: () => {
            notifications.show({
              title: 'Success',
              message: 'Collection deleted successfully',
              color: 'green',
            })
            router.push('/')
          },
          onError: (error: Error) => {
            notifications.show({
              title: 'Error',
              message: error.message,
              color: 'red',
            })
          },
        })
      },
    })
  }

  return (
    <Box
      style={{
        backgroundColor: 'var(--mantine-color-dark-7)',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box p="md" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Collection Header */}
        <Group justify="space-between" align="center" mb="lg">
          <Box>
            <Title order={2} c="white" mb="xs">
              Documents
            </Title>
            <Text size="sm" c="dimmed">
              {documentCount} documents
            </Text>
          </Box>
          <Group gap="sm">
            <Button leftSection={<IconPlus size={16} />} variant="filled" color="violet" onClick={openAddDocumentModal}>
              Add Document
            </Button>
            <Button 
              leftSection={<IconTrash size={16} />} 
              variant="outline" 
              color="red" 
              onClick={handleDeleteCollection}
              loading={deleteCollectionMutation.isPending}
            >
              Delete Collection
            </Button>
          </Group>
        </Group>

        {/* Search & Query Section */}
        <Box mb="lg">
          <SearchPanel />
        </Box>

        {/* Documents Section */}
        <Box style={{ flex: 1, overflow: 'hidden' }}>
          <RecordPanel collectionName={collectionName} />
        </Box>
      </Box>
    </Box>
  )
}

export default RecordPage
