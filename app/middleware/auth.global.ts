export default defineNuxtRouteMiddleware(async (to) => {
  const { token, user, fetchSelf } = useAuth()

  if (token.value && !user.value) {
    try { await fetchSelf() } catch { }
  }
  const isAuthed = !!user.value

  if (!isAuthed && to.path !== '/login') {
    return navigateTo('/login')
  }
  if (isAuthed && to.path === '/login') {
    return navigateTo('/')
  }
})
