import { Link } from '@tanstack/react-router'
import { Link as ChakraLink } from '@chakra-ui/react'

export function ButtonLink({ children }: { children: React.ReactNode }) {
  return (
    <Link to="/">
      <ChakraLink>{children}</ChakraLink>
    </Link>
  )
}
