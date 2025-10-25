import type { User, RepositoryListItem, Project, GetUserData } from '~/types/api'
export const useAuth = () => {
  const API_BASE = 'https://gateway-codemetrics.saas.sferaplatform.ru/app/sourcecode/api/api/v2'

  const token = useCookie<string | null>('auth_basic', {
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  })

  const user = useState<User | null>('auth_user', () => null)
  const repos = useState<RepositoryListItem[]>('auth_repos', () => [])
  const loading = useState<boolean>('auth_loading', () => false)
  const error = useState<string | null>('auth_error', () => null)

  const api = async <T = any>(path: string, opts: any = {}) => {
    if (!token.value) throw new Error('No auth token')
    return $fetch<T>(`${API_BASE}${path}`, {
      headers: { authorization: `Basic ${token.value}`, ...(opts.headers || {}) }, ...opts!
    })
  }
  const fetchSelf = async () => {
    if (!token.value) {
      user.value = null
      return null
    }
    try {
      const me = await $fetch<any>(API_BASE+'/users/self', {
        headers: { authorization: `Basic ${token.value}` },
      })
      user.value = me.data || null
      const projects = await $fetch<any>(API_BASE+'/projects', {headers: { authorization: `Basic ${token.value}` }})
      if (projects.data) {
        for (const proj of projects.data as Project[]) {
          const reps = await $fetch<any>(API_BASE+`/projects/${proj.name}/repos`, {headers: { authorization: `Basic ${token.value}` }})
          repos.value.push(...(reps.data as RepositoryListItem[]))
        }
      }
      return me.data.value
    } catch (e) {
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
    repos.value = []
    await navigateTo('/login')
  }

  return { token, user, repos, api, loading, error, fetchSelf, login, logout }
}
