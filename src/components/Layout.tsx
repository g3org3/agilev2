import { pb } from '@/services/pb'
import { Container, Flex, Button, Spacer } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'

import { Login } from '@/components/Login'
import { Logout } from './Logout'

export default function Layout({ children }: { children: React.ReactNode }) {
  if (!pb.authStore.isValid) {
    return <Login />
  }

  return (
    <Flex flexDir="column" h="100dvh" background="whitesmoke" overflowY="auto">
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
    </Flex>
  )
}

function Navbar() {
  return (
    <Flex background="white" boxShadow="md" p="2" zIndex="1">
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
              Agile
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
          <Logout />
        </Flex>
      </Container>
    </Flex>
  )
}
