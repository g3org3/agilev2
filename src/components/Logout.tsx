import { pb } from '@/services/pb'
import { queryClient } from '@/services/queryClient'
import {
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useToast,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { registerPasskey } from '@/services/authn'
import { useMutation } from '@tanstack/react-query'
import { UsersResponse } from '@/services/pocketbase-types'

export function Logout() {
  const toast = useToast()

  const { mutate } = useMutation({
    mutationFn: (user?: UsersResponse) => registerPasskey(user?.email),
    onSuccess() {
      toast({ status: 'success', title: 'Pass key saved!' })
    },
    onError() {
      toast({ status: 'error', title: 'There has been an error' })
    },
  })

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
    <Menu>
      <MenuButton
        size="sm"
        as={Button}
        variant="ghost"
        leftIcon={
          <Avatar name={pb.authStore.model?.name} src={url} size="xs" />
        }
        rightIcon={<ChevronDownIcon />}
      >
        {pb.authStore.model?.name}
      </MenuButton>
      <MenuList>
        {pb.authStore.model && (
          <MenuItem onClick={() => mutate(pb.authStore.model as UsersResponse)}>
            Setup passkey
          </MenuItem>
        )}
        <MenuItem onClick={onLogout}>Logout</MenuItem>
      </MenuList>
    </Menu>
  )
}
