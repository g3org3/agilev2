import { QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ChakraProvider } from '@chakra-ui/react'

import { queryClient } from '@/services/queryClient'
import { theme } from '@/services/theme'
import Layout from '@/components/Layout'

const isDev = import.meta.env.DEV

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <Layout>
          <Outlet />
        </Layout>
      </ChakraProvider>
      {isDev && <TanStackRouterDevtools />}
      {isDev && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  ),
})
