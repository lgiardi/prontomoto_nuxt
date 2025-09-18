// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  pages: true,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    public: {
      // Supabase (per il composable)
      supabaseUrl: 'https://xffcrstnyfjthlaurlyx.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE',
      
      // Sanity
      sanityProjectId: '1i1fbngf',
      sanityDataset: 'production'
    },
    // Server-side only (SMTP)
    smtpHost: 'authsmtp.securemail.pro',
    smtpPort: '465',
    smtpUser: 'info@prontomoto.it',
    smtpPass: 'Judin6lt',
    smtpAdminEmail: 'info@prontomoto.it',
    smtpSenderName: 'ProntoMoto'
  }
})


