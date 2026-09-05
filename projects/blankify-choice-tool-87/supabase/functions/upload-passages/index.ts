
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control, pragma, expires, x-custom-timestamp',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if this is an Excel file upload or direct passage creation
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Original Excel file upload functionality
      const formData = await req.formData();
      const excelFile = formData.get('file');

      if (!excelFile || !(excelFile instanceof File)) {
        throw new Error('Excel file is required');
      }

      // Use xlsx package to parse Excel data
      const { read, utils } = await import('https://esm.sh/xlsx@0.18.5');
      
      // Read Excel file
      const buffer = await excelFile.arrayBuffer();
      const workbook = read(buffer);
      
      // Expect the first sheet to contain passages
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      const rawData = utils.sheet_to_json(worksheet);
      
      if (!rawData || rawData.length === 0) {
        throw new Error('No data found in Excel file');
      }
      
      console.log(`Found ${rawData.length} rows in Excel file`);
      
      // Process each row - now with 3 columns for item_id, content, translation
      const insertResults = [];
      const processedPassages = [];
      
      for (const row of rawData) {
        // Try to handle Excel data based on column names or positions
        if (row['지문고유번호'] !== undefined || row['내용'] !== undefined || row['해석'] !== undefined) {
          // Case 1: Data has Korean column names
          processedPassages.push({
            item_id: row['지문고유번호'] ? String(row['지문고유번호']) : null,
            content: row['내용'] ? String(row['내용']) : '',
            translation: row['해석'] ? String(row['해석']) : null,
          });
        } else if (row.item_id !== undefined || row.content !== undefined || row.translation !== undefined) {
          // Case 2: Data has named English columns
          processedPassages.push({
            item_id: row.item_id ? String(row.item_id) : null,
            content: row.content ? String(row.content) : '',
            translation: row.translation ? String(row.translation) : null,
          });
        } else if (Array.isArray(Object.values(row)) && Object.values(row).length >= 2) {
          // Case 3: Data is positional (no column names)
          const values = Object.values(row);
          processedPassages.push({
            item_id: values[0] ? String(values[0]) : null,
            content: values[1] ? String(values[1]) : '',
            translation: values[2] ? String(values[2]) : null,
          });
        } else {
          // Case 4: Fallback - look for any text fields
          for (const [key, value] of Object.entries(row)) {
            if (typeof value === 'string' && value.trim().length > 0) {
              // Use the first non-empty string as the passage content
              processedPassages.push({
                item_id: null,
                content: String(value).trim(),
                translation: null,
              });
              break; // Only use the first field with content
            }
          }
        }
      }
      
      // Skip if no passages were identified
      if (processedPassages.length === 0) {
        throw new Error('No valid passage content found in Excel file');
      }
      
      console.log(`Identified ${processedPassages.length} passages to insert`);
      
      // Insert passages in batches to improve performance
      const BATCH_SIZE = 20;
      for (let i = 0; i < processedPassages.length; i += BATCH_SIZE) {
        const batch = processedPassages.slice(i, i + BATCH_SIZE);
        
        const { data, error } = await supabase
          .from('passages')
          .insert(batch);
          
        if (error) {
          console.error('Error inserting batch of passages:', error);
          
          // Try inserting one by one if batch insert fails
          for (const passage of batch) {
            const { data: singleData, error: singleError } = await supabase
              .from('passages')
              .insert(passage);
              
            if (singleError) {
              insertResults.push({ 
                success: false, 
                error: singleError.message,
                content: passage.content.substring(0, 50) + '...' 
              });
            } else {
              insertResults.push({ 
                success: true, 
                id: passage.item_id,
                content: passage.content.substring(0, 50) + '...'
              });
            }
          }
        } else {
          // Add successful batch results
          batch.forEach((item) => {
            insertResults.push({ 
              success: true, 
              id: item.item_id,
              content: item.content.substring(0, 50) + '...'
            });
          });
        }
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully processed ${insertResults.filter(r => r.success).length} out of ${processedPassages.length} passages`,
          results: insertResults
        }),
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
    } else {
      // Handle direct JSON passage creation
      const body = await req.json();
      const passages = body.passages || [];
      
      if (!passages.length) {
        throw new Error('No passages provided');
      }
      
      console.log(`Received ${passages.length} passages to insert via direct API call`);
      
      // Insert passages using service role key (bypassing RLS)
      const { data, error } = await supabase
        .from('passages')
        .insert(passages);
        
      if (error) {
        throw error;
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully inserted ${passages.length} passages`,
          data
        }),
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
    }
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
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
