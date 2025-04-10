import { createRootRoute, Outlet } from '@tanstack/react-router'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
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
        persistOptions={{ persister, buster: Date.now().toString() }}
        client={queryClient}
      >
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Layout>
            <Outlet />
          </Layout>
        </ChakraProvider>
      </PersistQueryClientProvider>
    )
  },
})
