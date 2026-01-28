import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zhxhnzcalbrdjwbqkwas.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoeGhuemNhbGJyZGp3YnFrd2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NDI0NDgsImV4cCI6MjA4NTExODQ0OH0.JWXt_G5I-njVg6hd0g9dbmWAtYlelBHv-jjmooJmmcY';

export const supabase = createClient(supabaseUrl, supabaseKey);