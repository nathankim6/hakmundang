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

    const { action, questions } = await req.json();

    if (action === 'upsert' && Array.isArray(questions)) {
      // Upsert questions in batches
      const batchSize = 20;
      let inserted = 0;

      for (let i = 0; i < questions.length; i += batchSize) {
        const batch = questions.slice(i, i + batchSize);
        const { error } = await supabase
          .from('exam_questions')
          .upsert(batch, { onConflict: 'workbook_id,question_id' });

        if (error) {
          console.error('Upsert error:', error);
          throw error;
        }
        inserted += batch.length;
      }

      return new Response(JSON.stringify({ success: true, inserted }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'list') {
      const workbookId = questions?.workbook_id || 'weekly-g10';
      const { data, error } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('workbook_id', workbookId)
        .order('question_id', { ascending: true });

      if (error) throw error;

      return new Response(JSON.stringify({ questions: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'assign-weeks') {
      // Assign week numbers and positions to questions
      const { workbook_id, assignments } = questions;
      // assignments: [{ question_id, week_number, position_in_week }]
      for (const a of assignments) {
        const { error } = await supabase
          .from('exam_questions')
          .update({ week_number: a.week_number, position_in_week: a.position_in_week })
          .eq('workbook_id', workbook_id)
          .eq('question_id', a.question_id);
        if (error) throw error;
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("manage-exam-questions error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
