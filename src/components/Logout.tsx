import { pb } from '@/services/pb'
import { queryClient } from '@/services/queryClient'
import {
  Avatar,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useToast,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { registerPasskey } from '@/services/authn'
import { useMutation } from '@tanstack/react-query'
import { UsersResponse } from '@/services/pocketbase-types'
import PassKeyIcon from '@/icons/PassKeyIcon'
import LogoutIcon from '@/icons/LogoutIcon'

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
          <MenuItem
            icon={<PassKeyIcon />}
            onClick={() => mutate(pb.authStore.model as UsersResponse)}
          >
            <Flex>
              <Text bgGradient="linear(to-l, #7928CA, #FF0080)" bgClip="text">
                Setup Passkey&nbsp;
              </Text>
              <Text position="relative" fontSize="x-small" fontWeight="bold">
                beta
              </Text>
            </Flex>
          </MenuItem>
        )}
        <MenuItem icon={<LogoutIcon />} onClick={onLogout}>
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  )
}
