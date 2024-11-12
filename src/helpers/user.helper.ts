import { computed, ref } from 'vue'
import User from '@/entities/trellis/User'
import { PermissionMap, TrellisPermission } from '@/static/permissions.base'
import UserService from '@/services/user'
import PermissionService from '@/services/permission'

const user = ref<User>(null)
const userPermissions = ref<PermissionMap>({})
const loading = ref(false)

export async function loadUser () {
  loading.value = true
  try {
    user.value = await UserService.loadCurrentUser()
    if (user.value) {
      userPermissions.value = await PermissionService.fetchUserPermissions(user.value)
    }
  } finally {
    loading.value = false
  }
}

loadUser()

export function userHasPermission (permission: TrellisPermission) {
  return computed(() => {
    if (!user.value || Object.keys(userPermissions.value).length === 0) {
      return false
    }
    return userPermissions.value[permission]
  })
}
