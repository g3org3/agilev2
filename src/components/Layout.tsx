import { Container, Flex, Link as ChakraLink } from "@chakra-ui/react";
import { Link } from '@tanstack/react-router'


export default function Layout({ children }: { children: React.ReactNode }) {

  return (
    <Flex flexDir="column" h="100dvh" background="whitesmoke" overflowY="auto">
      <Navbar />
      <Container gap="3" display="flex" maxW="container.2xl" flexDir="column" flex="1" overflowY="auto" p="3">
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
            <ChakraLink fontWeight="bold" letterSpacing="2px" fontSize="lg">Agile</ChakraLink>
          </Link>
        </Flex>
      </Container>
    </Flex>
  )
}
