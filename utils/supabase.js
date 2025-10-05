import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js'

console.log('Creating Supabase client with URL:', SUPABASE_URL)
console.log('Creating Supabase client with Key:', SUPABASE_ANON_KEY ? 'Present' : 'Missing')

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
