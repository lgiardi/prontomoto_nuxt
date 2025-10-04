export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useSupabaseClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return navigateTo('/auth/login')
    }
  } catch (error) {
    return navigateTo('/auth/login')
  }
})



