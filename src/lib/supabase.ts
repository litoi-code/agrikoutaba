import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/config/supabase.config";

export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    realtime: {
      reconnectAfterSeconds: 1,
    },
  }
);