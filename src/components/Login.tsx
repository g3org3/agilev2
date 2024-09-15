import { pb } from '@/services/pb'
import { Collections } from '@/services/pocketbase-types'
import { Button, Flex } from '@chakra-ui/react'
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
    <Flex alignItems="center" justifyContent="center" paddingTop="7%">
      <Button onClick={onLogin}>Login with Google</Button>
    </Flex>
  )
}
