// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://yjjfyjbgfvqcabgdncek.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqamZ5amJnZnZxY2FiZ2RuY2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NDc3ODgsImV4cCI6MjA2MzEyMzc4OH0.-PM0ZFMsekHOPJmcP9K7u_V6FzsyGJT3KlUZkteUqWY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});