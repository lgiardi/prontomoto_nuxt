import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const supabaseUrl = 'https://xffcrstnyfjthlaurlyx.supabase.co'
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // 1. Recupera tutte le moto usate approvate
    const { data: motoUsate, error: motoError } = await supabase
      .from('moto_usate')
      .select('id, venditore_id, venditore_type')
      .eq('status', 'approved')
    
    if (motoError) {
      return { error: 'Errore recupero moto:', details: motoError }
    }
    
    const motoConcessionari = motoUsate?.filter(m => m.venditore_type === 'concessionario' && m.venditore_id) || []
    const venditoreIds = [...new Set(motoConcessionari.map(m => m.venditore_id))]
    
    // 2. Recupera i concessionari - usa service role per bypassare RLS
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2MDg5OCwiZXhwIjoyMDczNjM2ODk4fQ.Kij1kL_Ja1i0zEAguZ0gooRv-YCic-THL-DDfLVubBY'
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: concessionari, error: concError } = await supabaseService
      .from('concessionari')
      .select('id, citta, provincia, nome')
      .in('id', venditoreIds.length > 0 ? venditoreIds : ['00000000-0000-0000-0000-000000000000'])
    
    return {
      motoUsate: {
        totale: motoUsate?.length || 0,
        daConcessionari: motoConcessionari.length,
        venditoreIds: venditoreIds,
        esempio: motoUsate?.slice(0, 2)
      },
      concessionari: {
        trovati: concessionari?.length || 0,
        error: concError,
        dati: concessionari?.slice(0, 3),
        venditoreIdsCercati: venditoreIds
      },
      mappa: concessionari?.reduce((acc, c) => {
        if (c && c.id && c.citta) acc[String(c.id)] = c.citta
        return acc
      }, {} as Record<string, string>) || {}
    }
  } catch (error: any) {
    return { error: error.message, stack: error.stack }
  }
})

