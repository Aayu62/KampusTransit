import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yoftyrwgcnnumqrecyge.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvZnR5cndnY25udW1xcmVjeWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1OTUwNDYsImV4cCI6MjA4OTE3MTA0Nn0.p_R0R4bdNoyYYerHPhKVBJxLyds7YFdzfMBlYNasP0M";

export const supabase = createClient(supabaseUrl, supabaseKey);