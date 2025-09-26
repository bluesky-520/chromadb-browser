'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IconFileText } from '@tabler/icons-react'
import { Container, Paper, Text, Title, Center, Box } from '@mantine/core'

import { useGetCollections, useGetConfig } from '@/lib/client/query'

export default function CollectionsPage() {
  const router = useRouter()
  const { data: config } = useGetConfig()
  const { data: collections, isError, error } = useGetCollections(config)

  if (isError) {
    return (
      <Container ta={'center'}>
        <Paper withBorder ta={'center'} shadow="md" p={30} radius="md" mt="xl">
          <Title order={2}>Connection Error</Title>
          <Text>{error.message}</Text>
          <Text>Please check your IONOS ChromaDB connection at https://inference.de-txl.ionos.com</Text>
        </Paper>
      </Container>
    )
  }

  if (collections != null && collections.length === 0) {
    return (
      <Container ta={'center'}>
        <Paper withBorder ta={'center'} shadow="md" p={30} radius="md" mt="xl">
          <Text>No collections found.</Text>
          <Text>Make sure your ChromaDB instance is running and contains data.</Text>
        </Paper>
      </Container>
    )
  }

  // Show empty state when collections exist but none is selected
  return (
    <Box
      style={{
        backgroundColor: 'var(--mantine-color-dark-7)',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        shadow="md"
        p={40}
        radius="md"
        style={{
          backgroundColor: 'var(--mantine-color-dark-6)',
          border: '1px solid var(--mantine-color-dark-4)',
          textAlign: 'center',
          maxWidth: 400,
        }}
      >
        <Box mb="lg">
          <IconFileText size={64} color="var(--mantine-color-dimmed)" />
        </Box>
        <Title order={3} mb="sm" c="white">
          Select a Collection
        </Title>
        <Text size="sm" c="dimmed">
          Choose a collection from the sidebar to browse its documents.
        </Text>
      </Paper>
    </Box>
  )
}
