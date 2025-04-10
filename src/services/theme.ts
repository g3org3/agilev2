import {
  theme as chakraTheme,
  extendTheme,
  ThemeConfig,
} from '@chakra-ui/react'

const { Button } = chakraTheme.components

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
}

export const theme = extendTheme({
  config,
  components: {
    Button,
  },
})
