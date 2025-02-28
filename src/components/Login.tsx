import { pb } from '@/services/pb'
import { Collections } from '@/services/pocketbase-types'
import { Button, Flex, Text } from '@chakra-ui/react'
import { ClientResponseError } from 'pocketbase'

export function Login() {
  const onLogin = async () => {
    let res = null
    try {
      res = await pb
        .collection(Collections.Users)
        .authWithOAuth2({ provider: 'google' })
    } catch (e) {
      const err = e as ClientResponseError
      alert(err.message)
    }
    if (res?.meta?.avatarUrl) {
      const { avatarUrl } = res.meta
      await pb
        .collection(Collections.Users)
        .update(res.record.id, { avatarUrl })
    }
    document.location = '/'
  }

  return (
    <Flex alignItems="center" flexDirection="column" paddingTop="7%" gap={3}>
      <Flex
        border="2px dotted black"
        py={10}
        px={20}
        borderColor="gray.200"
        flexDir="column"
        gap={4}
      >
        <h1>
          <Text fontSize="xx-large">Agile App</Text>
        </h1>
        <Button onClick={onLogin}>Login with Google</Button>
      </Flex>
    </Flex>
  )
}
