import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_CODE = '101100';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, questionId, analysis, analyses, adminCode, workbookId } = await req.json();
    
    // Default workbook_id for backwards compatibility
    const effectiveWorkbookId = workbookId || 'syntax10000';

    switch (action) {
      case 'get': {
        // Get single analysis
        if (questionId) {
          const { data, error } = await supabase
            .from('syntax_analyses')
            .select('question_id, analysis')
            .eq('question_id', questionId)
            .eq('workbook_id', effectiveWorkbookId)
            .single();

          if (error && error.code !== 'PGRST116') throw error;
          
          return new Response(
            JSON.stringify({ analysis: data }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break;
      }

      case 'getAll': {
        // Get all analyses for a specific workbook
        const { data, error } = await supabase
          .from('syntax_analyses')
          .select('question_id, analysis')
          .eq('workbook_id', effectiveWorkbookId)
          .order('question_id', { ascending: true });

        if (error) throw error;
        
        // Convert to Record format
        const analysesMap: Record<number, string> = {};
        const hasAnalysisMap: Record<number, boolean> = {};
        
        data?.forEach(item => {
          analysesMap[item.question_id] = item.analysis;
          hasAnalysisMap[item.question_id] = true;
        });

        return new Response(
          JSON.stringify({ analyses: analysesMap, hasAnalysis: hasAnalysisMap }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'save': {
        // Only admin can save
        if (adminCode !== ADMIN_CODE) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized - Admin only' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!questionId || !analysis) {
          return new Response(
            JSON.stringify({ error: 'questionId and analysis are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Upsert the analysis with workbook_id
        const { error } = await supabase
          .from('syntax_analyses')
          .upsert(
            { question_id: questionId, analysis, workbook_id: effectiveWorkbookId },
            { onConflict: 'question_id,workbook_id' }
          );

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'saveBatch': {
        // Only admin can save
        if (adminCode !== ADMIN_CODE) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized - Admin only' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!analyses || typeof analyses !== 'object') {
          return new Response(
            JSON.stringify({ error: 'analyses object is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Convert to array format for upsert with workbook_id
        const records = Object.entries(analyses).map(([qId, text]) => ({
          question_id: parseInt(qId),
          analysis: text as string,
          workbook_id: effectiveWorkbookId
        }));

        if (records.length > 0) {
          const { error } = await supabase
            .from('syntax_analyses')
            .upsert(records, { onConflict: 'question_id,workbook_id' });

          if (error) throw error;
        }

        return new Response(
          JSON.stringify({ success: true, count: records.length }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
