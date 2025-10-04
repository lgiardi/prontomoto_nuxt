export default defineEventHandler(async (event) => {
  try {
    const supabase = useSupabaseClient()
    
    // Controlla tutti i concessionari
    const { data: concessionari, error: concessionariError } = await supabase
      .from('concessionari')
      .select('id, nome')
      .limit(5)

    if (concessionariError) {
      return { error: 'Errore nel caricamento concessionari', details: concessionariError }
    }

    // Controlla gli slot per ogni concessionario
    const results = []
    for (const concessionario of concessionari || []) {
      const { data: slot, error: slotError } = await supabase
        .from('slot_disponibili')
        .select('*')
        .eq('concessionario_id', concessionario.id)

      results.push({
        concessionario: concessionario.nome,
        id: concessionario.id,
        slot: slot || [],
        slotError: slotError?.message
      })
    }

    return {
      success: true,
      data: results
    }

  } catch (error) {
    return { error: 'Errore generale', details: error.message }
  }
})
