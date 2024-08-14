import { Link } from "@tanstack/react-router"
import { Link as ChakraLink } from "@chakra-ui/react"


export function ButtonLink() {
  return (
    <Link to="/">
      <ChakraLink>Agile</ChakraLink>
    </Link>
  )
}
