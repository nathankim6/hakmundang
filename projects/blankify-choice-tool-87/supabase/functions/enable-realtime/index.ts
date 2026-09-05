
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

interface EnableRealtimeRequest {
  tableName: string;
  action?: 'delete' | 'deleteAll'; 
  id?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control, pragma, expires, x-custom-timestamp',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, DELETE',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase environment variables" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const customHeaders = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'x-custom-timestamp': `${timestamp}`
    };

    // Get request data
    const body: EnableRealtimeRequest = await req.json()
    console.log('Request body:', JSON.stringify(body))

    // Init Supabase client with service role key for admin capabilities
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: customHeaders
      }
    })

    // Handle different actions
    if (body.action === 'delete' && body.id) {
      console.log(`Deleting passage with ID: ${body.id}`)
      
      // First, make sure the record exists
      const { data: checkData, error: checkError } = await supabase
        .from(body.tableName)
        .select('id')
        .eq('id', body.id)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking passage existence:', checkError);
        throw checkError;
      }
      
      if (!checkData) {
        console.error('Passage not found:', body.id);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Passage with id ${body.id} not found`,
            timestamp: timestamp
          }),
          { status: 404, headers: { ...corsHeaders, ...customHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Now perform the deletion without select()
      const { error } = await supabase
        .from(body.tableName)
        .delete()
        .eq('id', body.id);
      
      if (error) {
        console.error('Error deleting passage:', error);
        throw error;
      }
      
      console.log('Delete successful for ID:', body.id);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully deleted ${body.tableName} with id ${body.id}`,
          timestamp: timestamp
        }),
        { headers: { ...corsHeaders, ...customHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (body.action === 'deleteAll') {
      console.log(`Deleting all records from ${body.tableName}`);
      
      // Perform deletion without select()
      const { error } = await supabase
        .from(body.tableName)
        .delete()
        .not('id', 'is', null);
      
      if (error) {
        console.error('Error deleting all passages:', error);
        throw error;
      }
      
      console.log('Deletion of all records successful');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully deleted all rows in ${body.tableName}`,
          timestamp: timestamp
        }),
        { headers: { ...corsHeaders, ...customHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enable realtime for the table
    try {
      const { data, error } = await supabase.rpc('supabase_functions.enable_replication', { 
        relation: `public.${body.tableName}`, 
        source_system: 'postgres',
        publications: 'supabase_realtime' 
      });

      if (error) {
        console.error('Error enabling replication:', error);
        // Don't throw here, just log the error and continue
        // Many Supabase instances don't have this function available
      } else {
        console.log('Enabled realtime for:', body.tableName);
      }
    } catch (err) {
      console.error('Failed to enable replication:', err);
      // Continue execution, don't fail the whole request
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed request for ${body.tableName}`,
        timestamp: timestamp 
      }),
      { headers: { ...corsHeaders, ...customHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
