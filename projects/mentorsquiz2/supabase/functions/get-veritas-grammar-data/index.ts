import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Veritas Supabase credentials from secrets
    const VERITAS_SUPABASE_URL = Deno.env.get('VERITAS_SUPABASE_URL')
    const VERITAS_SUPABASE_ANON_KEY = Deno.env.get('VERITAS_SUPABASE_ANON_KEY')

    if (!VERITAS_SUPABASE_URL || !VERITAS_SUPABASE_ANON_KEY) {
      throw new Error('Veritas Supabase credentials not configured')
    }

    // Create client for Veritas database
    const veritasSupabase = createClient(VERITAS_SUPABASE_URL, VERITAS_SUPABASE_ANON_KEY)

    // Fetch New Veritas's Choice incorrect options data
    const { data: incorrectOptions, error } = await veritasSupabase
      .from('incorrect_options')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(1000) // Get up to 1000 records for maximum question generation

    if (error) {
      console.error('Error fetching incorrect options:', error)
      throw new Error('Failed to fetch New Veritas\'s Choice data')
    }

    console.log(`✅ Successfully fetched ${incorrectOptions?.length || 0} incorrect options from Veritas database`)

    return new Response(
      JSON.stringify({ 
        data: incorrectOptions,
        success: true,
        count: incorrectOptions?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in get-veritas-grammar-data function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})