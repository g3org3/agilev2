import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  Container,
  Flex,
  Button,
  Spacer,
  CircularProgress,
  useColorModeValue,
} from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'

import { pb } from '@/services/pb'
import { Login } from '@/components/Login'
import { Logout } from './Logout'
import { useIsFetching } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Collections, UpdatesResponse } from '@/services/pocketbase-types'
import { queryClient } from '@/services/queryClient'

export default function Layout({ children }: { children: React.ReactNode }) {
  const bg = useColorModeValue('whitesmoke', 'gray.800')
  useEffect(() => {
    pb.collection(Collections.Updates).subscribe<UpdatesResponse>('*', (e) => {
      queryClient.invalidateQueries({ queryKey: [e.record.sprint] })
      queryClient.invalidateQueries({ queryKey: ['index'] })
    })
    return () => {
      pb.collection(Collections.Updates).unsubscribe('*')
    }
  }, [])

  if (!pb.authStore.isValid) {
    return <Login />
  }

  return (
    <Flex flexDir="column" h="100dvh" background={bg} overflowY="auto">
      <Navbar />
      <Container
        gap="3"
        display="flex"
        maxW="container.2xl"
        flexDir="column"
        flex="1"
        overflowY="auto"
        p="3"
      >
        {children}
      </Container>
      {pb.authStore.model?.isAdmin && (
        <ReactQueryDevtools
          buttonPosition="bottom-left"
          initialIsOpen={false}
        />
      )}
    </Flex>
  )
}

function Navbar() {
  const bg = useColorModeValue('white', 'gray.700')
  const isFetching = useIsFetching()

  return (
    <Flex background={bg} boxShadow="md" p="2" zIndex="1">
      <Container maxW="container.2xl">
        <Flex>
          <Link to="/">
            <Button
              size="sm"
              variant="ghost"
              fontWeight="bold"
              letterSpacing="2px"
              fontSize="lg"
            >
              Agile <small>(0.1)</small>
            </Button>
          </Link>
          {pb.authStore.model?.isAdmin && (
            <Link to="/investigations">
              <Button
                size="sm"
                variant="ghost"
                fontWeight="bold"
                letterSpacing="2px"
                fontSize="lg"
              >
                inv
              </Button>
            </Link>
          )}
          <Spacer />
          {isFetching ? (
            <Flex alignItems="center" px="30px">
              <CircularProgress size="30px" isIndeterminate color="black" />
            </Flex>
          ) : null}
          <Logout />
        </Flex>
      </Container>
    </Flex>
  )
}
