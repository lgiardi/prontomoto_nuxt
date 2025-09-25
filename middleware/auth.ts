export default defineNuxtRouteMiddleware(async (to, from) => {
  const { getUser } = useSupabase()
  const user = await getUser()
  
  if (!user) {
    return navigateTo('/auth/login')
  }
})



