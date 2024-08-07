import { theme as chakraTheme, extendTheme } from '@chakra-ui/react'

const { Button } = chakraTheme.components

export const theme = extendTheme({
  components: {
    Button,
  }
})
