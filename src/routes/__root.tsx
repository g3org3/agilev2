import { QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ChakraProvider } from '@chakra-ui/react'

import { queryClient } from '@/services/queryClient'
import { theme } from '@/services/theme'

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <Outlet />
      </ChakraProvider>
      <TanStackRouterDevtools />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  ),
})

