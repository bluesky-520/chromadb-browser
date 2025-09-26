'use client'

import { ModalsProvider } from '@mantine/modals'
import { AppShell, AppShellMain, AppShellNavbar } from '@mantine/core'

import Sidebar from '@/components/Sidebar'
import RecordDetailModal from '@/components/RecordPage/RecordDetailModal'
import AddCollectionModal from '@/components/AddCollectionModal'

import type { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ModalsProvider modals={{ addCollectionModal: AddCollectionModal, recordDetailModal: RecordDetailModal }}>
      <AppShell
        navbar={{
          width: 280,
          breakpoint: 'sm',
          collapsed: { mobile: false, desktop: false },
        }}
        padding={0}
        style={{
          display: 'flex',
          height: '100vh',
        }}
      >
        <AppShellNavbar p={0} style={{ position: 'relative', zIndex: 1 }}>
          <Sidebar />
        </AppShellNavbar>
        <AppShellMain p={0} style={{ marginLeft: 0, flex: 1, overflow: 'hidden' }}>
          {children}
        </AppShellMain>
      </AppShell>
    </ModalsProvider>
  )
}
