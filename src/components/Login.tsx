import { authenticateWithPasskey } from '@/services/authn'
import { pb } from '@/services/pb'
import { Collections, UsersResponse } from '@/services/pocketbase-types'
import { Button, Flex, Input, Text, useToast } from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { ClientResponseError } from 'pocketbase'
import { usePostHog } from 'posthog-js/react'
import { FormEventHandler } from 'react'

export function Login() {
  const toast = useToast()
  const { mutate } = useMutation({
    mutationFn(username: string) {
      return authenticateWithPasskey(username.toString())
    },
    async onSuccess({ email }) {
      toast({ status: 'success', title: 'Authenticated' })
      await pb.collection(Collections.Users).authWithPassword(email, email)
      document.location = '/?b=' + Date.now()
    },
    onError() {
      toast({ status: 'error', title: 'Authentication failed' })
    },
  })
  const posthog = usePostHog()
  const onLogin = async () => {
    let res = null
    try {
      res = await pb
        .collection(Collections.Users)
        .authWithOAuth2<UsersResponse>({ provider: 'google' })
    } catch (e) {
      const err = e as ClientResponseError
      alert(err.message)
    }
    if (res)
      posthog?.identify(res.record.email, {
        email: res.record.email,
        name: res.record.name,
      })
    if (res?.meta?.avatarUrl) {
      const { avatarUrl } = res.meta
      await pb
        .collection(Collections.Users)
        .update(res.record.id, { avatarUrl })
    }
    document.location = '/'
  }

  const onAuthPasskey: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    const form = new FormData(e.target as never)
    const username = form.get('username')
    if (!username) {
      alert('please enter a username')
      return
    }
    mutate(username.toString())
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
        <Flex alignItems="center" gap="2">
          <hr style={{ flex: 1 }} />
          or
          <hr style={{ flex: 1 }} />
        </Flex>
        <form onSubmit={onAuthPasskey}>
          <Flex gap="2">
            <Input
              type="text"
              id="username"
              name="username"
              placeholder="Email"
              autoComplete="username webauthn"
            />
            <Button name="login" px="10" type="submit">
              Login PassKey
            </Button>
          </Flex>
        </form>
      </Flex>
    </Flex>
  )
}
