
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get passage IDs to export
    const { passageIds } = await req.json();
    
    if (!passageIds || !Array.isArray(passageIds) || passageIds.length === 0) {
      throw new Error('No passage IDs provided');
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseApiKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseApiKey);
    
    // Fetch passages
    const { data: passages, error } = await supabase
      .from('passages')
      .select('*')
      .in('id', passageIds);
    
    if (error) {
      throw error;
    }
    
    if (!passages || passages.length === 0) {
      throw new Error('No passages found with the provided IDs');
    }
    
    console.log(`Exporting ${passages.length} passages`);
    
    // Generate Excel file
    const { utils, write } = await import('https://esm.sh/xlsx@0.18.5');
    
    // Prepare data for Excel - only include ID, content, and translation in a 3-column format
    const worksheetData = passages.map(passage => ({
      '지문고유번호': passage.item_id || '',
      '내용': passage.content || '',
      '해석': passage.translation || ''
    }));
    
    // Create worksheet and workbook
    const worksheet = utils.json_to_sheet(worksheetData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Passages');
    
    // Set column widths for better readability
    const colWidths = [
      { wch: 20 }, // 지문고유번호
      { wch: 50 }, // 내용
      { wch: 50 }  // 해석
    ];
    worksheet['!cols'] = colWidths;
    
    // Write to buffer
    const excelBuffer = write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Set filename with current date
    const now = new Date();
    const formattedDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const filename = `passages_${formattedDate}.xlsx`;
    
    return new Response(excelBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
    
  } catch (error) {
    console.error('Error exporting passages:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
