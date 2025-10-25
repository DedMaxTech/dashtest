// composables/useAuth.ts
export const useAuth = () => {
  const API_SELF = 'https://gateway-codemetrics.saas.sferaplatform.ru/app/sourcecode/api/api/v2/users/self'

  const token = useCookie<string | null>('auth_basic', {
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  })

  const user = useState<any | null>('auth_user', () => null)
  const loading = useState<boolean>('auth_loading', () => false)
  const error = useState<string | null>('auth_error', () => null)

  const fetchSelf = async () => {
    if (!token.value) {
      user.value = null
      return null
    }
    try {
      const me = await $fetch(API_SELF, {
        headers: { authorization: `Basic ${token.value}` },
        credentials: 'omit'
      })
      console.log(me)
      user.value = me.data
      return me
    } catch (e) {
      // токен невалиден — очищаем
      user.value = null
      throw e
    }
  }

  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      const basic = btoa(`${email}:${password}`)
      token.value = basic
      await fetchSelf()
      return user.value
    } catch (e) {
      token.value = null
      error.value = 'Неверный email или пароль'
      throw e
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    token.value = null
    user.value = null
    error.value = null
    await navigateTo('/login')
  }

  return { token, user, loading, error, fetchSelf, login, logout }
}
