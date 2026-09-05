import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_CODE = '101100';

// All available workbook IDs for admin
const ALL_WORKBOOK_IDS = [
  'syntax10000-vol1',
  'syntax10000-vol2',
  'syntax10000-vol3',
  'syntax2320'
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, code, adminCode, allowedWorkbooks } = await req.json();

    // Validate admin code for all management operations
    if (action !== 'list' && action !== 'validate' && adminCode !== ADMIN_CODE) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid admin code' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    switch (action) {
      case 'list': {
        const { data, error } = await supabase
          .from('access_codes')
          .select('code, created_at, last_used_at, use_count, allowed_workbooks')
          .order('created_at', { ascending: true });

        if (error) throw error;
        return new Response(
          JSON.stringify({ codes: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'add': {
        if (!code || code.length < 4) {
          return new Response(
            JSON.stringify({ error: 'Code must be at least 4 characters' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const workbooks = Array.isArray(allowedWorkbooks) ? allowedWorkbooks : [];

        const { error } = await supabase
          .from('access_codes')
          .insert({ code, allowed_workbooks: workbooks });

        if (error) {
          if (error.code === '23505') { // unique violation
            return new Response(
              JSON.stringify({ error: 'Code already exists' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          throw error;
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'updateWorkbooks': {
        if (!code) {
          return new Response(
            JSON.stringify({ error: 'Code is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const workbooks = Array.isArray(allowedWorkbooks) ? allowedWorkbooks : [];

        const { error } = await supabase
          .from('access_codes')
          .update({ allowed_workbooks: workbooks })
          .eq('code', code);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'remove': {
        if (!code) {
          return new Response(
            JSON.stringify({ error: 'Code is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase
          .from('access_codes')
          .delete()
          .eq('code', code);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'validate': {
        // Check if code is admin code
        if (code === ADMIN_CODE) {
          return new Response(
            JSON.stringify({ valid: true, isAdmin: true, allowedWorkbooks: ALL_WORKBOOK_IDS }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if code exists in database
        const { data, error } = await supabase
          .from('access_codes')
          .select('code, allowed_workbooks')
          .eq('code', code)
          .maybeSingle();

        if (error || !data) {
          return new Response(
            JSON.stringify({ valid: false }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update last_used_at and use_count
        await supabase
          .from('access_codes')
          .update({ 
            last_used_at: new Date().toISOString(),
            use_count: supabase.rpc('increment_use_count', { code_value: code })
          })
          .eq('code', code);

        return new Response(
          JSON.stringify({ 
            valid: true, 
            isAdmin: false,
            allowedWorkbooks: data.allowed_workbooks || []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
