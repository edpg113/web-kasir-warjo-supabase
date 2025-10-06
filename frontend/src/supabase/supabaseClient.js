import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bjppwzsmtyaazpmgwdcl.supabase.co";
const anonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcHB3enNtdHlhYXpwbWd3ZGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTYyNzUsImV4cCI6MjA3Mzc3MjI3NX0.m8mWEU9U86KVvsquafvxmFGEFIAo_OR3wkIUH-81_B0";

export const supabase = createClient(supabaseUrl, anonKey);
