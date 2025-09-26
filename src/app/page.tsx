'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

import { useGetConfig } from '@/lib/client/query'
import { updateConfig } from '@/lib/client/localstorage'

export default function Home() {
  const router = useRouter()
  const { data: appConfig } = useGetConfig()
  const queryClient = useQueryClient()

  useEffect(() => {
    // Auto-configure connection to IONOS ChromaDB instance
    if (!appConfig?.connectionString) {
      const defaultConfig = {
        connectionString: 'https://inference.de-txl.ionos.com',
        currentCollection: '',
        authType: 'token',
        token:
          'eyJ0eXAiOiJKV1QiLCJraWQiOiI3ZDRlYmMzNi1lMzZhLTQzYTAtYTlmZS1iOTZkMWYzYTRkOWEiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJpb25vc2Nsb3VkIiwiaWF0IjoxNzU2NzE3MDE5LCJjbGllbnQiOiJVU0VSIiwiaWRlbnRpdHkiOnsicHJpdmlsZWdlcyI6WyJEQVRBX0NFTlRFUl9DUkVBVEUiLCJTTkFQU0hPVF9DUkVBVEUiLCJJUF9CTE9DS19SRVNFUlZFIiwiTUFOQUdFX0RBVEFQTEFURk9STSIsIkFDQ0VTU19BQ1RJVklUWV9MT0ciLCJQQ0NfQ1JFQVRFIiwiQUNDRVNTX1MzX09CSkVDVF9TVE9SQUdFIiwiQkFDS1VQX1VOSVRfQ1JFQVRFIiwiQ1JFQVRFX0lOVEVSTkVUX0FDQ0VTUyIsIks4U19DTFVTVEVSX0NSRUFURSIsIkZMT1dfTE9HX0NSRUFURSIsIkFDQ0VTU19BTkRfTUFOQUdFX01PTklUT1JJTkciLCJBQ0NFU1NfQU5EX01BTkFHRV9DRVJUSUZJQ0FURVMiLCJBQ0NFU1NfQU5EX01BTkFHRV9MT0dHSU5HIiwiTUFOQUdFX0RCQUFTIiwiQUNDRVNTX0FORF9NQU5BR0VfRE5TIiwiTUFOQUdFX1JFR0lTVFJZIiwiQUNDRVNTX0FORF9NQU5BR0VfQ0ROIiwiQUNDRVNTX0FORF9NQU5BR0VfVlBOIiwiQUNDRVNTX0FORF9NQU5BR0VfQVBJX0dBVEVXQVkiLCJBQ0NFU1NfQU5EX01BTkFHRV9OR1MiLCJBQ0NFU1NfQU5EX01BTkFHRV9LQUFTIiwiQUNDRVNTX0FORF9NQU5BR0VfTkVUV09SS19GSUxFX1NUT1JBR0UiLCJBQ0NFU1NfQU5EX01BTkFHRV9BSV9NT0RFTF9IVUIiLCJDUkVBVEVfTkVUV09SS19TRUNVUklUWV9HUk9VUFMiLCJBQ0NFU1NfQU5EX01BTkFHRV9JQU1fUkVTT1VSQ0VTIl0sInV1aWQiOiJiY2FlZDllOC1jNzMzLTQ4OTItODg2NS0zZjZjODkwZTU1NTkiLCJyZXNlbGxlcklkIjoxLCJyZWdEb21haW4iOiJpb25vcy5kZSIsInJvbGUiOiJvd25lciIsImNvbnRyYWN0TnVtYmVyIjozNjA4MDI3MSwiaXNQYXJlbnQiOmZhbHNlfSwiZXhwIjoxNzg4MjUzMDE5fQ.noq_DbN738OtIJqt1AZAE_gDsfE1RxVO9JNl_3HSmezRbHq-NRl-y_gy0kLkN9mSmE22TdTzYdzODVKmis-w46h-xvWx9teggIsD_Jx-akNn3NPU6JGPtWajm8W67bLhIFfqDvDIsweNcXwW94TbRdRPrM5lmuCqOVFmZeThpHR-aWTr96EytPk4V-j84BsK4U7By5VfRnwyV-MkgVrZkwJoEsYdi0gZzYu-u5xLWM3NpEDvDmQ3gp2WesqLAVOE4SnkZmeZLm11PrduFVBzLcwR363mLx1qVG_iTk1XZVSQg2Wzoa7f9Ro0JPKiogc_X7i-eN2xxt_BpRaZIsnyNQ',
        username: '',
        password: '',
        tenant: 'default_tenant',
        database: 'default_database',
      }

      updateConfig(defaultConfig)
      queryClient.setQueryData(['config'], defaultConfig)
    }

    // Always redirect to collections
    router.push('/collections')
  }, [appConfig, router, queryClient])

  return null
}
