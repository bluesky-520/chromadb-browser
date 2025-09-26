import React from 'react'
import { Icon123, IconBlockquote, IconBraces, IconSettings } from '@tabler/icons-react'
import { Text, List, Container, Tabs, rem, ScrollArea, Stack, Title, Divider } from '@mantine/core'

import type { ContextModalProps } from '@mantine/modals'
import type { Record } from '@/lib/types'

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

const RecordDetailModal = ({ context, id, innerProps }: ContextModalProps<{ record: Record }>) => {
  const iconStyle = { width: rem(14), height: rem(14) }

  const record = innerProps.record
  const decodedContent = record.properties?.content 
    ? decodeBase64Content(record.properties.content, record.properties.contentType)
    : record.document

  return (
    <Tabs defaultValue="Document">
      <Tabs.List grow>
        <Tabs.Tab value="Document" leftSection={<IconBlockquote style={iconStyle} />}>
          Document
        </Tabs.Tab>
        <Tabs.Tab value="Properties" leftSection={<IconSettings style={iconStyle} />}>
          Properties
        </Tabs.Tab>
        <Tabs.Tab value="Embedding" leftSection={<Icon123 style={iconStyle} />}>
          Embedding
        </Tabs.Tab>
        <Tabs.Tab value="Metadata" leftSection={<IconBraces style={iconStyle} />}>
          Metadata
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="Document">
        <Container p={'md'}>
          <ScrollArea h={250}>
            <Text size={'sm'} style={{ whiteSpace: 'pre-wrap' }}>{decodedContent}</Text>
          </ScrollArea>
        </Container>
      </Tabs.Panel>

      <Tabs.Panel value="Properties">
        <Container p={'md'}>
          <ScrollArea h={250}>
            <Stack gap="md">
              {record.properties?.name && (
                <div>
                  <Title order={6} c="dimmed">Name</Title>
                  <Text size="sm">{record.properties.name}</Text>
                </div>
              )}
              {record.properties?.description && (
                <div>
                  <Title order={6} c="dimmed">Description</Title>
                  <Text size="sm">{record.properties.description}</Text>
                </div>
              )}
              {record.properties?.contentType && (
                <div>
                  <Title order={6} c="dimmed">Content Type</Title>
                  <Text size="sm">{record.properties.contentType}</Text>
                </div>
              )}
              {record.properties?.labels && Object.keys(record.properties.labels).length > 0 && (
                <div>
                  <Title order={6} c="dimmed">Labels</Title>
                  <Stack gap="xs">
                    {Object.entries(record.properties.labels).map(([key, value]) => (
                      <Text key={key} size="sm">
                        <strong>{key}:</strong> {String(value)}
                      </Text>
                    ))}
                  </Stack>
                </div>
              )}
            </Stack>
          </ScrollArea>
        </Container>
      </Tabs.Panel>

      <Tabs.Panel value="Embedding">
        <Container p={'md'}>
          <ScrollArea h={250}>
            <EmbeddingList embedding={record.embedding} />
          </ScrollArea>
        </Container>
      </Tabs.Panel>

      <Tabs.Panel value="Metadata">
        <Container p={'md'}>
          <ScrollArea h={250}>
            <Text size={'sm'} style={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(record.metadata, null, 2)}
            </Text>
          </ScrollArea>
        </Container>
      </Tabs.Panel>
    </Tabs>
  )
}

// Memoized component to prevent re-render issues
const EmbeddingList = React.memo(({ embedding }: { embedding: any }) => {
  if (!embedding || !Array.isArray(embedding)) {
    return (
      <Text size={'sm'} c="dimmed">
        No embedding data available
      </Text>
    )
  }

  return (
    <List>
      {embedding.map((item, index) => (
        <List.Item key={index}>
          <Text size={'sm'}>{item}</Text>
        </List.Item>
      ))}
    </List>
  )
})

EmbeddingList.displayName = 'EmbeddingList'

export default RecordDetailModal
