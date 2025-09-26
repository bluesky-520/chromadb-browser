import { useEffect, useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { IconSearch } from '@tabler/icons-react'
import { Button, Group, Text, Input, Paper } from '@mantine/core'

import { currentPageAtom, queryAtom } from '@/components/RecordPage/atom'

const SearchPanel = () => {
  const [query, setQuery] = useAtom(queryAtom)
  const setCurrentPage = useSetAtom(currentPageAtom)

  const [queryValue, setQueryValue] = useState(query)

  useEffect(() => {
    setQueryValue(query)
  }, [query])

  const queryButtonClicked = () => {
    setQuery(queryValue)
    setCurrentPage(1)
  }

  return (
    <Paper
      shadow="xs"
      p="lg"
      withBorder
      style={{
        backgroundColor: 'var(--mantine-color-dark-6)',
        border: '1px solid var(--mantine-color-dark-4)',
      }}
    >
      <Group gap="sm" align="center">
        <IconSearch size={20} color="var(--mantine-color-dimmed)" />
        <Text size="sm" fw={600} c="white">
          Search & Query
        </Text>
      </Group>

      <Group gap="md" mt="md" align="center">
        <Input
          placeholder="Enter search query..."
          value={queryValue}
          onChange={e => setQueryValue(e.currentTarget.value)}
          style={{ flex: 1 }}
          styles={{
            input: {
              backgroundColor: 'var(--mantine-color-dark-5)',
              border: '1px solid var(--mantine-color-dark-4)',
              color: 'white',
            },
          }}
        />
        <Button variant="filled" color="blue" onClick={queryButtonClicked}>
          Search
        </Button>
      </Group>
    </Paper>
  )
}

export default SearchPanel
