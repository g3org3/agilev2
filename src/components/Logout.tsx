import { pb } from '@/services/pb'
import { queryClient } from '@/services/queryClient'
import { Avatar, Button, Flex } from '@chakra-ui/react'

export function Logout() {
  const onLogout = () => {
    queryClient.clear()
    localStorage.clear()
    pb.authStore.clear()
    document.location.href = '/'
  }

  if (!pb.authStore.isValid) {
    return null
  }

  const url = pb.authStore.model?.avatarUrl || pb.authStore.model?.email

  return (
    <Button
      onClick={onLogout}
      size="sm"
      leftIcon={<Avatar name={pb.authStore.model?.name} src={url} size="xs" />}
    >
      <Flex>Logout</Flex>
    </Button>
  )
}
