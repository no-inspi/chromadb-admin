import { useState, useMemo } from 'react'

import { modals } from '@mantine/modals'
import { Table, Text, TextInput, Stack } from '@mantine/core'

import RecordRowActionMenu from './RecordRowActionMenu'

import styles from './index.module.scss'

import type { Record } from '@/lib/types'
import type { RecordsPage } from '@/lib/types'

const RecordTable = ({ withQuery, recordsPage }: { withQuery: boolean; recordsPage: RecordsPage }) => {
  const [searchQuery, setSearchQuery] = useState('')

  const openDetailModal = (record: Record) => {
    modals.openContextModal({
      modalId: 'recordDetailModal',
      modal: 'recordDetailModal',
      size: 'xl',
      title: `ID: ${record.id}`,
      innerProps: { record },
    })
  }

  // Filter records based on search query
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) {
      return recordsPage?.records || []
    }

    const query = searchQuery.toLowerCase()

    return (
      recordsPage?.records.filter(record => {
        // Search in ID
        if (record.id.toLowerCase().includes(query)) return true

        // Search in Document
        if (record.document?.toLowerCase().includes(query)) return true

        // Search in Distance (if available)
        if (withQuery && record.distance?.toString().includes(query)) return true

        // Search in Metadata (convert to string and search)
        if (record.metadata) {
          const metadataString = JSON.stringify(record.metadata).toLowerCase()
          if (metadataString.includes(query)) return true
        }

        // Search in Embedding (convert to string and search)
        const embeddingString = record.embedding.join(', ').toLowerCase()
        if (embeddingString.includes(query)) return true

        return false
      }) || []
    )
  }, [searchQuery, recordsPage?.records, withQuery])

  return (
    <Stack gap="md">
      <TextInput
        placeholder="Search in all columns..."
        value={searchQuery}
        onChange={event => setSearchQuery(event.currentTarget.value)}
        // leftSection={<IconSearch size={16} />}
        size="sm"
        style={{ maxWidth: 400 }}
      />

      <Table highlightOnHover layout={'fixed'}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={'48'}></Table.Th>
            {withQuery && <Table.Th w={'10%'}>Distance</Table.Th>}
            <Table.Th w={'10%'}>ID</Table.Th>
            <Table.Th w={'40%'}>Document</Table.Th>
            <Table.Th w={withQuery ? '20%' : '30%'}>Metadata</Table.Th>
            <Table.Th w={'auto'}>Embedding</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filteredRecords.length === 0 && searchQuery ? (
            <Table.Tr>
              <Table.Td colSpan={withQuery ? 6 : 5} style={{ textAlign: 'center', padding: '2rem' }}>
                <Text c="dimmed">No records found matching "{searchQuery}"</Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            filteredRecords.map(record => (
              <Table.Tr key={record.id} onClick={() => openDetailModal(record)}>
                <Table.Td className={styles.td}>
                  <RecordRowActionMenu embedding={record.embedding.join(', ')} />
                </Table.Td>
                {withQuery && <Table.Td className={styles.td}>{record.distance}</Table.Td>}
                <Table.Td className={styles.td}>
                  <Text span size={'sm'}>
                    {record.id}
                  </Text>
                </Table.Td>
                <Table.Td className={styles.td}>{record.document}</Table.Td>
                <Table.Td className={styles.td}>{record.metadata ? JSON.stringify(record.metadata) : ''}</Table.Td>
                <Table.Td className={styles.td}>{record.embedding.join(', ')}</Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>

      {filteredRecords.length > 0 && (
        <Text size="sm" c="dimmed">
          Showing {filteredRecords.length} of {recordsPage?.records.length || 0} records
        </Text>
      )}
    </Stack>
  )
}

export default RecordTable
