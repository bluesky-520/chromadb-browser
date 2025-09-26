/* eslint-disable import/order */
import '@mantine/notifications/styles.css'
import '@mantine/core/styles.css'
import { Notifications } from '@mantine/notifications'
import { MantineProvider, ColorSchemeScript, createTheme } from '@mantine/core'

import ReactQueryProvider from '@/app/ReactQueryProvider'

import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ChromaDB Browser',
}

const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  components: {
    AppShell: {
      defaultProps: {
        style: {
          backgroundColor: 'var(--mantine-color-dark-7)',
        },
      },
    },
  },
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <head suppressHydrationWarning>
        <ColorSchemeScript />
      </head>
      <body>
        <ReactQueryProvider>
          <MantineProvider theme={theme} forceColorScheme="dark">
            <Notifications />
            {children}
          </MantineProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
