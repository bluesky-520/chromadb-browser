'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { IconPlus, IconFolder, IconDatabase, IconRefresh } from '@tabler/icons-react'
import { modals } from '@mantine/modals'
import { Text, Group, Button, ScrollArea, ActionIcon, Badge, Box, Stack, UnstyledButton, rem } from '@mantine/core'

import { useGetConfig, useGetCollections } from '@/lib/client/query'

import type { AppConfig } from '@/lib/types'

interface SidebarProps {
  currentCollection?: string
}

export default function Sidebar({ currentCollection }: SidebarProps) {
  const router = useRouter()
  const { data: config } = useGetConfig()
  const { data: collections, isLoading, refetch: refetchCollections } = useGetCollections(config)

  // Debug: Log collections data (only in development and when data changes)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 SIDEBAR - Collections data:', { collections, isLoading, currentCollection })
      console.log('🔍 SIDEBAR - Collections type:', typeof collections)
      console.log('🔍 SIDEBAR - Collections length:', collections?.length)
      if (collections && collections.length > 0) {
        console.log('🔍 SIDEBAR - First collection details:', collections[0])
        console.log('🔍 SIDEBAR - All collection counts:', collections.map(c => `${c.name}: ${c.count}`).join(', '))
      }
    }
  }, [collections, isLoading, currentCollection])

  const handleAddCollection = () => {
    modals.openContextModal({
      modalId: 'addCollectionModal',
      modal: 'addCollectionModal',
      size: 'lg',
      title: 'Add New Collection',
      innerProps: {},
    })
  }

  const handleCollectionClick = (collectionId: string) => {
    router.push(`/collections/${collectionId}`)
  }

  const handleRefreshCollections = () => {
    refetchCollections()
  }


  return (
    <Box
      p="md"
      style={{
        height: '100vh',
        backgroundColor: 'var(--mantine-color-dark-8)',
        borderRight: '1px solid var(--mantine-color-dark-4)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >

      {/* Header */}
      <Group mb="lg">
        <IconDatabase size={24} />
        <Text fw={700} size="lg" c="white">
          ChromaDB Browser
        </Text>
      </Group>

      {/* Collections Section */}
      <Box mb="md">
        <Group justify="space-between" mb="sm">
          <Text fw={600} size="sm" c="dimmed">
            Collections
          </Text>
          <Group gap="xs">
            <ActionIcon variant="subtle" size="sm" onClick={handleRefreshCollections} title="Refresh Collections">
              <IconRefresh size={16} />
            </ActionIcon>
            <ActionIcon variant="subtle" size="sm" onClick={handleAddCollection} title="Add Collection">
              <IconPlus size={16} />
            </ActionIcon>
          </Group>
        </Group>

        <ScrollArea style={{ flex: 1 }}>
          <Stack gap="xs">
            {isLoading ? (
              <Text size="sm" c="dimmed">
                Loading collections...
              </Text>
            ) : collections && collections.length > 0 ? (
              collections.map(collection => (
                <CollectionItem
                  key={collection.id}
                  name={collection.name}
                  count={collection.count}
                  isSelected={currentCollection === collection.id}
                  onClick={() => handleCollectionClick(collection.id)}
                />
              ))
            ) : (
              <Text size="sm" c="dimmed">
                No collections found
              </Text>
            )}
          </Stack>
        </ScrollArea>
      </Box>

    </Box>
  )
}

interface CollectionItemProps {
  name: string
  count: number
  isSelected: boolean
  onClick: () => void
}

function CollectionItem({ name, count, isSelected, onClick }: CollectionItemProps) {
  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: rem(8),
        borderRadius: rem(8),
        backgroundColor: isSelected ? 'var(--mantine-color-blue-9)' : 'transparent',
        color: isSelected ? 'white' : 'var(--mantine-color-text)',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-1)'
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = 'transparent'
        }
      }}
    >
      <Group gap="sm">
        <IconFolder size={16} />
        <Text size="sm" fw={isSelected ? 500 : 400} truncate style={{ maxWidth: rem(150) }}>
          {name}
        </Text>
      </Group>
      <Badge size="sm" variant={isSelected ? 'white' : 'filled'} color={isSelected ? 'blue' : 'gray'}>
        {count}
      </Badge>
    </UnstyledButton>
  )
}
