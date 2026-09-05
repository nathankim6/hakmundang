
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control, pragma, expires, x-custom-timestamp',
}

// Helper function to extract number from item_id for sorting
const extractNumber = (itemId: string): number => {
  if (!itemId) return 0;
  
  // Extract the numeric part at the end of the item_id
  // Examples: "고1 2024년 3월 모의고사 18번" -> 18
  //          "고1 2024년 3월 모의고사 43-45번" -> 43
  const match = itemId.match(/(\d+)(?:-\d+)?(?:번|호|문항|지문)/);
  return match ? parseInt(match[1], 10) : 0;
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request data
    const body = await req.json();
    const query = body.query || '';
    const item_id = body.item_id || '';
    
    console.log(`Search request received with query: "${query}", item_id: "${item_id}"`);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseApiKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseApiKey);
    
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    
    // Start building query
    let queryBuilder = supabase
      .from('passages')
      .select('*');
    
    // Apply search filters
    if (query && query.trim() !== '') {
      queryBuilder = queryBuilder.or(
        `content.ilike.${query}%,` +       // Starts with query
        `content.ilike.% ${query}%,` +     // Has query after a space
        `translation.ilike.%${query}%`     // Contains query in translation
      );
    }
    
    if (item_id && item_id.trim() !== '') {
      // Use %...% pattern for partial match anywhere in item_id
      queryBuilder = queryBuilder.ilike('item_id', `%${item_id}%`);
    }
    
    // Add order by recent first
    queryBuilder = queryBuilder.order('created_at', { ascending: false });
    
    // Execute the query
    const { data: passages, error } = await queryBuilder;
    
    if (error) {
      console.error('Error executing query:', error);
      throw error;
    }
    
    // If searching by item_id, sort results by the numeric part of item_id
    let sortedPassages = passages || [];
    if (item_id && item_id.trim() !== '' && sortedPassages.length > 0) {
      sortedPassages.sort((a, b) => {
        const numA = extractNumber(a.item_id || '');
        const numB = extractNumber(b.item_id || '');
        return numA - numB;  // Ascending order by number
      });
    }
    
    console.log(`Found ${sortedPassages?.length || 0} matching passages`);
    
    return new Response(
      JSON.stringify(sortedPassages || []),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error('Error searching passages:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'An unknown error occurred'
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
});
