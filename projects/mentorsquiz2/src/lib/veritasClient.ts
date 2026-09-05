import { createClient } from '@supabase/supabase-js';

// Create a separate client for the Veritas database using secrets
const createVeritasClient = () => {
  // These will be replaced with actual values from Supabase Edge Functions
  // when called from the server side, or retrieved from secrets in production
  return createClient(
    "VERITAS_SUPABASE_URL", // This will be replaced with actual URL from secrets
    "VERITAS_SUPABASE_ANON_KEY" // This will be replaced with actual key from secrets
  );
};

export const veritasSupabase = createVeritasClient();