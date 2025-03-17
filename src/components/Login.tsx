import GithubIcon from '@/icons/GithubIcon'
import GoogleIcon from '@/icons/GoogleIcon'
import PassKeyIcon from '@/icons/PassKeyIcon'
import { authenticateWithPasskey } from '@/services/authn'
import { pb } from '@/services/pb'
import { Collections, UsersResponse } from '@/services/pocketbase-types'
import { Button, Flex, Input, Text, useToast } from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { ClientResponseError } from 'pocketbase'
import { usePostHog } from 'posthog-js/react'
import { FormEventHandler, useMemo } from 'react'

export function Login() {
  const toast = useToast()
  const isPassKeyAvailable = useMemo(() => {
    return (
      typeof window !== 'undefined' &&
      window.PublicKeyCredential !== undefined &&
      typeof window.PublicKeyCredential
        .isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    )
  }, [])
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
  const onLogin = (provider: 'google' | 'github') => async () => {
    let res = null
    try {
      res = await pb
        .collection(Collections.Users)
        .authWithOAuth2<UsersResponse>({ provider })
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
        border="1px solid black"
        shadow="md"
        py={10}
        px={20}
        borderColor="gray.200"
        flexDir="column"
        rounded="md"
        gap={4}
      >
        <h1>
          <Text letterSpacing="5px" fontSize="xxx-large">
            Agile App
          </Text>
        </h1>
        <Button
          leftIcon={<GoogleIcon />}
          _hover={{ bg: 'blue.500' }}
          _active={{ bg: 'blue.600' }}
          bg="blue.400"
          color="white"
          onClick={onLogin('google')}
        >
          Login with Google
        </Button>
        <Flex alignItems="center" gap="2">
          <hr style={{ flex: 1 }} />
          or
          <hr style={{ flex: 1 }} />
        </Flex>
        <Button
          leftIcon={<GithubIcon />}
          _hover={{ bg: 'gray.600' }}
          _active={{ bg: 'gray.500' }}
          bg="black"
          color="white"
          onClick={onLogin('github')}
        >
          Login with Github
        </Button>
        {isPassKeyAvailable && (
          <>
            <Flex alignItems="center" gap="2">
              <hr style={{ flex: 1 }} />
              or
              <hr style={{ flex: 1 }} />
            </Flex>
            <form onSubmit={onAuthPasskey}>
              <Flex>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Email"
                  autoComplete="username webauthn"
                  borderRightRadius="none"
                />
                <Button
                  borderLeftRadius="none"
                  bg="purple.600"
                  color="white"
                  leftIcon={<PassKeyIcon />}
                  name="login"
                  px="10"
                  type="submit"
                >
                  Login PassKey
                </Button>
              </Flex>
            </form>
          </>
        )}
      </Flex>
    </Flex>
  )
}
