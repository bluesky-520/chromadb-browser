import { useState } from 'react'
import { IconDatabase, IconSettings, IconTag } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useForm } from '@mantine/form'
import {
  Text,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Switch,
  Button,
  Group,
  Stack,
  Divider,
  Container,
  Grid,
  Box,
  Title,
  ActionIcon,
  Tooltip,
  LoadingOverlay,
} from '@mantine/core'

import { useCreateCollection, useGetConfig } from '@/lib/client/query'

import type { ContextModalProps } from '@mantine/modals'

interface CollectionFormData {
  name: string
  description: string
  chunking: {
    enabled: boolean
    strategy: {
      name: string
      config: {
        chunk_overlap: number
        chunk_size: number
      }
    }
  }
  embedding: {
    model: string
  }
  engine: {
    db_type: string
  }
  labels: Record<string, string>
}

const AddCollectionModal = ({ context, id, innerProps }: ContextModalProps<{}>) => {
  const [labelPairs, setLabelPairs] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }])
  const { data: config } = useGetConfig()
  const createCollectionMutation = useCreateCollection(config)

  const form = useForm<CollectionFormData>({
    initialValues: {
      name: '',
      description: '',
      chunking: {
        enabled: true,
        strategy: {
          name: 'fixed_size',
          config: {
            chunk_overlap: 50,
            chunk_size: 128,
          },
        },
      },
      embedding: {
        model: 'BAAI/bge-large-en-v1.5',
      },
      engine: {
        db_type: 'pgvector',
      },
      labels: {},
    },
    validate: {
      name: value => (value.length < 1 ? 'Name is required' : null),
      description: value => (value.length < 1 ? 'Description is required' : null),
    },
  })

  const addLabelPair = () => {
    setLabelPairs([...labelPairs, { key: '', value: '' }])
  }

  const removeLabelPair = (index: number) => {
    if (labelPairs.length > 1) {
      setLabelPairs(labelPairs.filter((_, i) => i !== index))
    }
  }

  const updateLabelPair = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...labelPairs]
    updated[index] = { ...updated[index], [field]: value }
    setLabelPairs(updated)
  }

  const handleSubmit = (values: CollectionFormData) => {
    // Convert label pairs to labels object
    const labels: Record<string, string> = {}
    labelPairs.forEach(pair => {
      if (pair.key && pair.value) {
        labels[pair.key] = pair.value
      }
    })

    const payload = {
      type: 'collection',
      properties: {
        ...values,
        labels,
      },
    }

    console.log('Collection payload:', payload)

    createCollectionMutation.mutate(payload, {
      onSuccess: data => {
        notifications.show({
          title: 'Success',
          message: `Collection "${values.name}" created successfully!`,
          color: 'green',
        })
        context.closeModal(id)
      },
      onError: (error: Error) => {
        notifications.show({
          title: 'Error',
          message: `Failed to create collection: ${error.message}`,
          color: 'red',
        })
      },
    })
  }

  return (
    <Container size="md" p="md" pos="relative">
      <LoadingOverlay visible={createCollectionMutation.isPending} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Basic Information */}
          <Box>
            <Title order={4} mb="sm" c="white">
              Basic Information
            </Title>
            <Grid>
              <Grid.Col span={12}>
                <TextInput
                  label="Collection Name"
                  placeholder="Enter collection name"
                  required
                  {...form.getInputProps('name')}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label="Description"
                  placeholder="Enter collection description"
                  required
                  minRows={3}
                  {...form.getInputProps('description')}
                />
              </Grid.Col>
            </Grid>
          </Box>

          <Divider />

          {/* Chunking Configuration */}
          <Box>
            <Title order={4} mb="sm" c="white">
              Chunking Configuration
            </Title>
            <Stack gap="md">
              <Switch label="Enable Chunking" {...form.getInputProps('chunking.enabled', { type: 'checkbox' })} />
              {form.values.chunking.enabled && (
                <Grid>
                  <Grid.Col span={6}>
                    <Select
                      label="Strategy"
                      data={[
                        { value: 'fixed_size', label: 'Fixed Size' },
                        { value: 'recursive', label: 'Recursive' },
                        { value: 'semantic', label: 'Semantic' },
                      ]}
                      {...form.getInputProps('chunking.strategy.name')}
                    />
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <NumberInput
                      label="Chunk Size"
                      min={1}
                      {...form.getInputProps('chunking.strategy.config.chunk_size')}
                    />
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <NumberInput
                      label="Chunk Overlap"
                      min={0}
                      {...form.getInputProps('chunking.strategy.config.chunk_overlap')}
                    />
                  </Grid.Col>
                </Grid>
              )}
            </Stack>
          </Box>

          <Divider />

          {/* Embedding Configuration */}
          <Box>
            <Title order={4} mb="sm" c="white">
              Embedding Configuration
            </Title>
            <TextInput
              label="Embedding Model"
              placeholder="BAAI/bge-large-en-v1.5"
              {...form.getInputProps('embedding.model')}
            />
          </Box>

          <Divider />

          {/* Engine Configuration */}
          <Box>
            <Title order={4} mb="sm" c="white">
              Engine Configuration
            </Title>
            <Select
              label="Database Type"
              data={[
                { value: 'pgvector', label: 'PostgreSQL with pgvector' },
                { value: 'chroma', label: 'ChromaDB' },
                { value: 'duckdb', label: 'DuckDB' },
              ]}
              {...form.getInputProps('engine.db_type')}
            />
          </Box>

          <Divider />

          {/* Labels */}
          <Box>
            <Group justify="space-between" mb="sm">
              <Title order={4} c="white">
                Labels
              </Title>
              <Button variant="light" size="xs" leftSection={<IconTag size={14} />} onClick={addLabelPair}>
                Add Label
              </Button>
            </Group>
            <Stack gap="sm">
              {labelPairs.map((pair, index) => (
                <Group key={index} align="flex-end">
                  <TextInput
                    label="Label Key"
                    placeholder="label_1"
                    value={pair.key}
                    onChange={e => updateLabelPair(index, 'key', e.currentTarget.value)}
                    style={{ flex: 1 }}
                  />
                  <TextInput
                    label="Label Value"
                    placeholder="label value"
                    value={pair.value}
                    onChange={e => updateLabelPair(index, 'value', e.currentTarget.value)}
                    style={{ flex: 1 }}
                  />
                  {labelPairs.length > 1 && (
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => removeLabelPair(index)}
                      title="Remove label"
                    >
                      ×
                    </ActionIcon>
                  )}
                </Group>
              ))}
            </Stack>
          </Box>

          {/* Action Buttons */}
          <Group justify="flex-end" mt="lg">
            <Button
              variant="outline"
              onClick={() => context.closeModal(id)}
              disabled={createCollectionMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" color="blue" loading={createCollectionMutation.isPending}>
              Create Collection
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  )
}

export default AddCollectionModal
