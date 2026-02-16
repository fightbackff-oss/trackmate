import { createClient } from '@supabase/supabase-js';

// Credentials provided by the user
const SUPABASE_URL = 'https://erumkwzihodfibguzmsn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_BYyMNQIq2pioFyvXrbgpPA_K_2ymWFk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
