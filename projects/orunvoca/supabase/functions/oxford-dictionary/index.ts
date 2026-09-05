import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OxfordEntry {
  lexicalEntries: Array<{
    pronunciations?: Array<{
      phoneticNotation?: string;
      phoneticSpelling?: string;
      dialects?: string[];
      audioFile?: string;
    }>;
  }>;
}

interface PronunciationData {
  phoneticSpelling: string;
  audioUrl: string;
  dialect: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { word, accent = 'american' } = await req.json()

    if (!word) {
      throw new Error('Word is required')
    }

    const appId = Deno.env.get('OXFORD_API_ID')
    const appKey = Deno.env.get('OXFORD_API_KEY')

    if (!appId || !appKey) {
      throw new Error('Oxford API credentials not configured')
    }

    console.log(`Fetching Oxford Dictionary data for word: ${word}`)

    // Call Oxford Dictionary API
    const response = await fetch(
      `https://od-api.oxforddictionaries.com/api/v2/entries/en-us/${word.toLowerCase()}`,
      {
        method: 'GET',
        headers: {
          'app_id': appId,
          'app_key': appKey,
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        // Fallback for words not found in Oxford API
        console.log(`Word "${word}" not found in Oxford Dictionary, using fallback`)
        return new Response(
          JSON.stringify({
            phoneticSpelling: `/${word}/`,
            audioUrl: null,
            dialect: accent === 'american' ? 'US' : 'UK'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
      throw new Error(`Oxford API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json() as { results: OxfordEntry[] }
    
    if (!data.results || data.results.length === 0) {
      throw new Error('No results found in Oxford Dictionary')
    }

    // Extract pronunciation data
    let bestPronunciation: PronunciationData | null = null
    
    for (const entry of data.results) {
      for (const lexicalEntry of entry.lexicalEntries) {
        if (lexicalEntry.pronunciations) {
          for (const pronunciation of lexicalEntry.pronunciations) {
            if (pronunciation.phoneticSpelling) {
              const dialect = pronunciation.dialects?.[0] || 'US'
              const isPreferredAccent = (
                (accent === 'american' && (dialect.includes('US') || dialect.includes('American'))) ||
                (accent === 'british' && (dialect.includes('UK') || dialect.includes('British')))
              )
              
              // Prefer the requested accent, but take any pronunciation if none found
              if (isPreferredAccent || !bestPronunciation) {
                bestPronunciation = {
                  phoneticSpelling: pronunciation.phoneticSpelling,
                  audioUrl: pronunciation.audioFile || null,
                  dialect: dialect
                }
                
                if (isPreferredAccent) {
                  break // Found preferred accent, stop looking
                }
              }
            }
          }
        }
      }
    }

    if (!bestPronunciation) {
      // Fallback if no pronunciation found
      bestPronunciation = {
        phoneticSpelling: `/${word}/`,
        audioUrl: null,
        dialect: accent === 'american' ? 'US' : 'UK'
      }
    }

    console.log(`Found pronunciation for "${word}":`, bestPronunciation)

    return new Response(
      JSON.stringify(bestPronunciation),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in oxford-dictionary function:', error)
    
    // word 변수가 정의되어 있는지 확인
    let fallbackWord = 'unknown';
    try {
      const { word: requestWord } = await req.json();
      fallbackWord = requestWord || 'unknown';
    } catch (parseError) {
      console.error('Error parsing request for fallback:', parseError);
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        phoneticSpelling: `/${fallbackWord}/`,
        audioUrl: null,
        dialect: 'US'
      }),
      {
        status: 200, // 에러여도 200으로 반환해서 폴백 데이터 사용
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})