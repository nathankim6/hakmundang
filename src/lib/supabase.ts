import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jpanpwbdlhsxnyaldddm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwYW5wd2JkbGhzeG55YWxkZGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4MDI2MzgsImV4cCI6MjA1MDM3ODYzOH0.lyofnzjEvGs0ZeAHmAK6mz_1ysNYryr70-eYbSpjEXc";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);