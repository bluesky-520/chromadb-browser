import { useState } from 'react'
import { IconFileText, IconTag, IconUpload } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useForm } from '@mantine/form'
import {
  Text,
  TextInput,
  Textarea,
  Select,
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
  FileInput,
  Switch,
} from '@mantine/core'

import { useAddDocument, useGetConfig } from '@/lib/client/query'

import type { ContextModalProps } from '@mantine/modals'

interface DocumentFormData {
  name: string
  description: string
  contentType: string
  content: string
  labels: Record<string, string>
}

const AddDocumentModal = ({ context, id, innerProps }: ContextModalProps<{ collectionName: string }>) => {
  const [labelPairs, setLabelPairs] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }])
  const [useFileUpload, setUseFileUpload] = useState(false)
  const [fileContent, setFileContent] = useState<string>('')
  const { data: config } = useGetConfig()
  const addDocumentMutation = useAddDocument(config, innerProps.collectionName)

  const form = useForm<DocumentFormData>({
    initialValues: {
      name: '',
      description: '',
      contentType: 'text/plain',
      content: '',
      labels: {},
    },
    validate: {
      name: value => (value.length < 1 ? 'Name is required' : null),
      description: value => (value.length < 1 ? 'Description is required' : null),
      content: value => (value.length < 1 ? 'Content is required' : null),
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

  const handleFileUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = e => {
        const content = e.target?.result as string
        setFileContent(content)
        form.setFieldValue('content', content)

        // Auto-detect content type
        if (file.type) {
          form.setFieldValue('contentType', file.type)
        } else if (file.name.endsWith('.txt')) {
          form.setFieldValue('contentType', 'text/plain')
        } else if (file.name.endsWith('.json')) {
          form.setFieldValue('contentType', 'application/json')
        } else if (file.name.endsWith('.html')) {
          form.setFieldValue('contentType', 'text/html')
        } else if (file.name.endsWith('.md')) {
          form.setFieldValue('contentType', 'text/markdown')
        }
      }
      reader.readAsText(file)
    }
  }

  const handleSubmit = (values: DocumentFormData) => {
    // Convert label pairs to labels object
    const labels: Record<string, string> = {}
    labelPairs.forEach(pair => {
      if (pair.key && pair.value) {
        labels[pair.key] = pair.value
      }
    })

    // Encode content to base64
    const base64Content = btoa(unescape(encodeURIComponent(values.content)))

    const payload = {
      type: 'collection',
      items: [
        {
          type: 'document',
          properties: {
            name: values.name,
            description: values.description,
            contentType: values.contentType,
            content: base64Content,
            labels: labels,
          },
        },
      ],
    }

    console.log('Document payload:', payload)

    addDocumentMutation.mutate(payload, {
      onSuccess: data => {
        notifications.show({
          title: 'Success',
          message: `Document "${values.name}" added successfully!`,
          color: 'green',
        })
        context.closeModal(id)
      },
      onError: (error: Error) => {
        notifications.show({
          title: 'Error',
          message: `Failed to add document: ${error.message}`,
          color: 'red',
        })
      },
    })
  }

  return (
    <Container size="md" p="md" pos="relative">
      <LoadingOverlay visible={addDocumentMutation.isPending} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Basic Information */}
          <Box>
            <Title order={4} mb="sm" c="white">
              Document Information
            </Title>
            <Grid>
              <Grid.Col span={12}>
                <TextInput
                  label="Document Name"
                  placeholder="Enter document name"
                  required
                  {...form.getInputProps('name')}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label="Description"
                  placeholder="Enter document description"
                  required
                  minRows={2}
                  {...form.getInputProps('description')}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Select
                  label="Content Type"
                  placeholder="Select content type"
                  data={[
                    { value: 'text/plain', label: 'Plain Text' },
                    { value: 'text/html', label: 'HTML' },
                    { value: 'text/markdown', label: 'Markdown' },
                    { value: 'application/json', label: 'JSON' },
                    { value: 'text/csv', label: 'CSV' },
                    { value: 'application/xml', label: 'XML' },
                  ]}
                  {...form.getInputProps('contentType')}
                />
              </Grid.Col>
            </Grid>
          </Box>

          <Divider />

          {/* Content Input */}
          <Box>
            <Group justify="space-between" mb="sm">
              <Title order={4} c="white">
                Document Content
              </Title>
              <Switch
                label="Upload File"
                checked={useFileUpload}
                onChange={event => setUseFileUpload(event.currentTarget.checked)}
              />
            </Group>

            {useFileUpload ? (
              <FileInput
                label="Upload File"
                placeholder="Choose a file to upload"
                accept=".txt,.html,.md,.json,.csv,.xml"
                onChange={handleFileUpload}
                leftSection={<IconFileText size={14} />}
              />
            ) : (
              <Textarea
                label="Document Content"
                placeholder="Enter document content here..."
                required
                minRows={8}
                {...form.getInputProps('content')}
              />
            )}
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
                    placeholder="e.g., topic"
                    value={pair.key}
                    onChange={e => updateLabelPair(index, 'key', e.currentTarget.value)}
                    style={{ flex: 1 }}
                  />
                  <TextInput
                    label="Label Value"
                    placeholder="e.g., linux"
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
              disabled={addDocumentMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" color="blue" loading={addDocumentMutation.isPending}>
              Add Document
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  )
}

export default AddDocumentModal