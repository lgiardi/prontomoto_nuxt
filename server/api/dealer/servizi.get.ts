import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2MDg5OCwiZXhwIjoyMDczNjM2ODk4fQ.Kij1kL_Ja1i0zEAguZ0gooRv-YCic-THL-DDfLVubBY'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { userId, limit = 100, offset = 0 } = query
    
    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Non autorizzato - User ID richiesto'
      })
    }

    console.log('🔧 Recupero servizi del concessionario:', userId)

    // Trova il concessionario usando user.id (può essere user_id o id)
    const { data: concessionario, error: dealerError } = await supabase
      .from('concessionari')
      .select('id, user_id')
      .or(`id.eq.${userId},user_id.eq.${userId}`)
      .maybeSingle()

    if (dealerError) {
      console.error('❌ Errore ricerca concessionario:', dealerError)
    }

    // Usa concessionario.id per cercare i servizi (è quello salvato nella foreign key)
    const concessionarioIdToSearch = concessionario?.id || userId

    console.log('📝 Concessionario trovato:', concessionario ? `ID: ${concessionario.id}, user_id: ${concessionario.user_id}` : 'Nessuno')
    console.log('🔍 Cerco servizi con concessionario_id:', concessionarioIdToSearch)

    // Query per i servizi
    const { data: servizi, error } = await supabase
      .from('servizi_concessionari')
      .select(`
        *,
        servizi_catalogo!inner(
          id,
          nome,
          slug,
          categoria,
          descrizione_breve,
          icona
        )
      `)
      .eq('concessionario_id', concessionarioIdToSearch)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('❌ Errore recupero servizi concessionario:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel recupero dei servizi',
        data: error.message
      })
    }

    console.log('✅ Servizi concessionario recuperati:', servizi?.length || 0, 'servizi')

    return {
      success: true,
      data: servizi || []
    }

  } catch (error: any) {
    console.error('❌ Errore API servizi concessionario:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore interno del server',
      data: error.data || error.message
    })
  }
})
