import React from 'react'
import { IconEye, IconTrash } from '@tabler/icons-react'
import { modals } from '@mantine/modals'
import { Table, Text, Box, Paper, ScrollArea, ActionIcon, Tooltip } from '@mantine/core'
import { notifications } from '@mantine/notifications'

import { useGetConfig, useDeleteDocument } from '@/lib/client/query'

import styles from './index.module.scss'

import type { Record } from '@/lib/types'
import type { RecordsPage } from '@/lib/types'

// Utility function to decode base64 content
const decodeBase64Content = (content: string, contentType: string): string => {
  try {
    if (contentType === 'text/plain' || contentType?.startsWith('text/')) {
      return atob(content)
    }
    return content // Return as-is for non-text content
  } catch (error) {
    return content // Return original if decoding fails
  }
}

const RecordTable = ({ withQuery, recordsPage, collectionName }: { withQuery: boolean; recordsPage: RecordsPage; collectionName: string }) => {
  const { data: config } = useGetConfig()
  const deleteDocumentMutation = useDeleteDocument(config, collectionName)

  // Debug logging (only in development and when data changes)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('RecordTable Debug:', {
        recordsPage,
        records: recordsPage?.records,
        recordsLength: recordsPage?.records?.length,
        firstRecord: recordsPage?.records?.[0],
        firstRecordKeys: recordsPage?.records?.[0] ? Object.keys(recordsPage.records[0]) : null,
      })
    }
  }, [recordsPage])

  const openDetailModal = (record: Record) => {
    modals.openContextModal({
      modalId: 'recordDetailModal',
      modal: 'recordDetailModal',
      size: 'xl',
      title: `ID: ${record.id}`,
      innerProps: { record },
    })
  }

  const handleDeleteDocument = async (record: Record) => {
    modals.openConfirmModal({
      title: 'Delete Document',
      children: (
        <Text size="sm">
          Are you sure you want to delete this document? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteDocumentMutation.mutateAsync(record.id)
          notifications.show({
            title: 'Success',
            message: 'Document deleted successfully',
            color: 'green',
          })
        } catch (error: any) {
          notifications.show({
            title: 'Error',
            message: error.message || 'Failed to delete document',
            color: 'red',
          })
        }
      },
    })
  }

  return (
    <Paper
      shadow="xs"
      style={{
        backgroundColor: 'var(--mantine-color-dark-8)',
        border: '1px solid var(--mantine-color-dark-6)',
        borderRadius: '8px',
        overflow: 'hidden',
        height: 'calc(100vh - 250px)', // Fixed height to prevent full screen scroll
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ScrollArea style={{ flex: 1 }} scrollbarSize={8} scrollHideDelay={0}>
        <Table
          highlightOnHover
          layout="fixed"
          withTableBorder={false}
          withColumnBorders={false}
          style={{
            backgroundColor: 'transparent',
          }}
        >
          <Table.Thead>
            <Table.Tr
              style={{
                backgroundColor: 'var(--mantine-color-dark-7)',
                borderBottom: '1px solid var(--mantine-color-dark-6)',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              {withQuery && (
                <Table.Th
                  w={100}
                  style={{
                    padding: '16px 20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--mantine-color-gray-3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    backgroundColor: 'var(--mantine-color-dark-7)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  Distance
                </Table.Th>
              )}
              <Table.Th
                w={200}
                style={{
                  padding: '16px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--mantine-color-gray-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  backgroundColor: 'var(--mantine-color-dark-7)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}
              >
                ID
              </Table.Th>
              <Table.Th
                w={200}
                style={{
                  padding: '16px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--mantine-color-gray-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  backgroundColor: 'var(--mantine-color-dark-7)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}
              >
                Name
              </Table.Th>
              <Table.Th
                w={400}
                style={{
                  padding: '16px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--mantine-color-gray-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  backgroundColor: 'var(--mantine-color-dark-7)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}
              >
                Description
              </Table.Th>
              <Table.Th
                w={120}
                style={{
                  padding: '16px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--mantine-color-gray-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  backgroundColor: 'var(--mantine-color-dark-7)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}
              >
                Created
              </Table.Th>
              <Table.Th
                w={80}
                style={{
                  padding: '16px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--mantine-color-gray-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  backgroundColor: 'var(--mantine-color-dark-7)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}
              >
                Actions
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {recordsPage?.records && recordsPage.records.length > 0 ? (
              recordsPage.records.map((record, index) => {
                // Safety check to prevent rendering raw IONOS objects
                if (!record || typeof record !== 'object' || !record.id) {
                  console.error('Invalid record at index', index, ':', record)
                  return (
                    <Table.Tr key={`error-${index}`}>
                      <Table.Td colSpan={withQuery ? 6 : 5}>
                        <Text c="red" size="sm">
                          Invalid record data
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )
                }

                return (
                  <Table.Tr
                    key={record.id}
                    style={{
                      backgroundColor: 'transparent',
                      borderBottom: '1px solid var(--mantine-color-dark-6)',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = 'var(--mantine-color-dark-7)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    {withQuery && (
                      <Table.Td
                        style={{
                          padding: '16px 20px',
                          borderBottom: '1px solid var(--mantine-color-dark-6)',
                        }}
                      >
                        <Text size="sm" c="dimmed" style={{ fontFamily: 'monospace' }}>
                          {record.distance?.toFixed(4) || '0.0000'}
                        </Text>
                      </Table.Td>
                    )}
                    <Table.Td
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--mantine-color-dark-6)',
                      }}
                    >
                      <Text size="sm" c="white" style={{ fontFamily: 'monospace', fontWeight: 500 }}>
                        {record.id}
                      </Text>
                    </Table.Td>
                    <Table.Td
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--mantine-color-dark-6)',
                      }}
                    >
                      <Text
                        size="sm"
                        c="white"
                        style={{
                          fontWeight: 500,
                          lineHeight: 1.4,
                        }}
                      >
                        {record.properties?.name || record.metadata?.name || record.metadata?.title || 'Untitled'}
                      </Text>
                    </Table.Td>
                    <Table.Td
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--mantine-color-dark-6)',
                      }}
                    >
                      <Text
                        size="sm"
                        c="dimmed"
                        style={{
                          lineHeight: 1.5,
                          maxHeight: '60px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {record.properties?.description || 
                         record.metadata?.description || 
                         record.metadata?.summary || 
                         (record.properties?.content ? decodeBase64Content(record.properties.content, record.properties.contentType) : null) ||
                         record.document || 
                         'No description available'}
                      </Text>
                    </Table.Td>
                    <Table.Td
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--mantine-color-dark-6)',
                      }}
                    >
                      <Text size="sm" c="dimmed">
                        {record.metadata?.createdDate
                          ? new Date(record.metadata.createdDate).toLocaleDateString()
                          : record.metadata?.CREATEDDATE
                            ? new Date(record.metadata.CREATEDDATE).toLocaleDateString()
                            : '9/3/2025'}
                      </Text>
                    </Table.Td>
                    <Table.Td
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--mantine-color-dark-6)',
                      }}
                    >
                      <Box style={{ display: 'flex', gap: '8px' }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <Tooltip label="View Details">
                          <ActionIcon variant="subtle" color="blue" onClick={() => openDetailModal(record)} size="sm">
                            <IconEye size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete Record">
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => handleDeleteDocument(record)}
                            size="sm"
                            loading={deleteDocumentMutation.isPending}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Box>
                    </Table.Td>
                  </Table.Tr>
                )
              })
            ) : (
              <Table.Tr>
                <Table.Td colSpan={withQuery ? 6 : 5} style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <Text size="lg" c="dimmed" style={{ fontWeight: 500 }}>
                      No documents found
                    </Text>
                    <Text size="sm" c="dimmed" style={{ maxWidth: '400px', textAlign: 'center' }}>
                      This collection doesn&apos;t contain any documents yet. Add some documents to get started.
                    </Text>
                  </Box>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  )
}


export default RecordTable
