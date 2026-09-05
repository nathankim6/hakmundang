import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { action, grade, weekNumber, vocabulary } = await req.json();

    // Action: getAll - load all vocabulary for a grade
    if (action === 'getAll') {
      const { data, error } = await supabase
        .from('weekly_vocabulary')
        .select('week_number, vocabulary')
        .eq('grade', grade)
        .order('week_number');

      if (error) throw error;

      const vocabMap: Record<number, unknown[]> = {};
      for (const row of data || []) {
        vocabMap[row.week_number] = row.vocabulary;
      }

      return new Response(JSON.stringify({ vocabMap }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Action: save - upsert vocabulary for a specific week
    if (action === 'save') {
      if (!grade || !weekNumber || !vocabulary) {
        return new Response(JSON.stringify({ error: 'grade, weekNumber, vocabulary required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabase
        .from('weekly_vocabulary')
        .upsert(
          { grade, week_number: weekNumber, vocabulary },
          { onConflict: 'grade,week_number' }
        );

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("manage-vocabulary error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
