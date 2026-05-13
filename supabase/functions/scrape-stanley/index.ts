// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sku } = await req.json()
    
    if (!sku) {
      throw new Error('SKU is required')
    }

    // Example URL for Stanley BR (adjust according to real search behavior)
    // We fetch the HTML of the search page
    const searchUrl = `https://www.stanley1913.com.br/busca?q=${sku}`
    const response = await fetch(searchUrl)
    const html = await response.text()

    // 1. We extract the first product image URL from the HTML
    // This is a naive regex approach. For robust scraping, Deno DOM can be used.
    // Let's assume Stanley uses a CDN for images like 'https://stanley1913.vtexassets.com/arquivos/ids/...'
    const imageRegex = /https:\/\/[\w.-]+\.vtexassets\.com\/arquivos\/ids\/\d+-[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\.jpg/
    const match = html.match(imageRegex)
    
    let imageUrl = null
    if (match && match[0]) {
      imageUrl = match[0]
    }

    // If we didn't find the specific VTEX pattern, we could look for meta tags:
    // <meta property="og:image" content="..." />
    if (!imageUrl) {
      const ogImageRegex = /<meta property="og:image" content="([^"]+)"/
      const ogMatch = html.match(ogImageRegex)
      if (ogMatch && ogMatch[1]) {
        imageUrl = ogMatch[1]
      }
    }

    // Example mock return if not found
    if (!imageUrl) {
      imageUrl = 'https://via.placeholder.com/600x600?text=Sem+Imagem'
    }

    return new Response(
      JSON.stringify({ 
        sku, 
        imageUrl,
        source: searchUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )
  }
})
