import { createRootRoute, Outlet } from '@tanstack/react-router'
import { ChakraProvider } from '@chakra-ui/react'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

import { queryClient } from '@/services/queryClient'
import { theme } from '@/services/theme'
import Layout from '@/components/Layout'

const persister = createSyncStoragePersister({
  storage: window.localStorage,
})

export const Route = createRootRoute({
  component: () => {
    return (
      <PersistQueryClientProvider
        persistOptions={{ persister }}
        client={queryClient}
      >
        <ChakraProvider theme={theme}>
          <Layout>
            <Outlet />
          </Layout>
        </ChakraProvider>
      </PersistQueryClientProvider>
    )
  },
})
