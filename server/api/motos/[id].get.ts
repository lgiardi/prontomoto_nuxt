import { createClient } from '@sanity/client'

const client = createClient({
  projectId: '1i1fbngf',
  dataset: 'production',
  apiVersion: '2025-09-07',
  useCdn: true
})

export default defineEventHandler(async (event: any) => {
  try {
    const motoId = getRouterParam(event, 'id')
    
    if (!motoId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID moto mancante'
      })
    }

    // Query per recuperare una singola moto con tutti i dettagli
    const moto = await client.fetch(`
      *[_type == "moto" && _id == $id][0] {
        _id,
        marca,
        modello,
        allestimento,
        categoria,
        prezzo,
        inizioProduzione,
        fineProduzione,
        garanzia,
        optional,
        lunghezza,
        larghezza,
        altezza,
        altezzaMinimaDaTerra,
        altezzaSellaDaTerraMin,
        altezzaSellaDaTerraMax,
        interasse,
        pesoASecco,
        pesoInOrdineDiMarcia,
        cilindrata,
        tipoMotore,
        tempi,
        cilindri,
        configurazioneCilindri,
        disposizioneCilindri,
        inclinazioneCilindri,
        inclinazioneCilindriAV,
        raffreddamento,
        avviamento,
        alimentazione,
        alesaggio,
        corsa,
        frizione,
        numeroValvole,
        distribuzione,
        potenza,
        coppia,
        rideByWire,
        controlloTrazione,
        mappeMotore,
        emissioni,
        depotenziata,
        tipologiaCambio,
        numeroMarce,
        presenzaRetromarcia,
        consumoMedioVmtc,
        capacitaSerbatoioCarburante,
        capacitaRiservaCarburante,
        trasmissioneFinale,
        telaio,
        sospensioneAnteriore,
        escursioneAnteriore,
        sospensionePosteriore,
        escursionePosteriore,
        tipoFrenoAnteriore,
        misuraFrenoAnteriore,
        tipoFrenoPosteriore,
        misuraFrenoPosteriore,
        abs,
        tipoRuote,
        misuraCerchioAnteriore,
        pneumaticoAnteriore,
        misuraCerchioPosteriore,
        pneumaticoPosteriore,
        batteria,
        capacita,
        autonomiaEDurata,
        batteriaSecondaria,
        "immagineCopertina": immagineCopertina.asset->url,
        "immaginiGallery": immaginiGallery[].asset->url,
        link
      }
    `, { id: motoId })

    if (!moto) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Moto non trovata'
      })
    }

    // Recupera i concessionari che hanno questa moto disponibile
    const concessionari = await client.fetch(`
      *[_type == "concessionario" && references($motoId)] {
        _id,
        nome,
        citta,
        provincia,
        telefono,
        email
      }
    `, { motoId })

    // Aggiungi i concessionari alla moto
    moto.concessionari = concessionari || []
    moto.concessionariCount = concessionari?.length || 0

    console.log(`Moto ${moto.marca} ${moto.modello}: ${moto.concessionariCount} concessionari`)

    return moto

  } catch (error: any) {
    console.error('Errore nel recupero della moto:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Errore interno del server'
    })
  }
})
