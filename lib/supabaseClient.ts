import { createClient } from '@supabase/supabase-js';

// Hardcoded as per requirements in prompt (1.2)
// In production, these should be env variables.
const SUPABASE_URL = 'https://stockwise.art/api'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsYWt3YnhrZnRva2ZkeXFkcm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTAzNDAsImV4cCI6MjA4MTQ3OTg0MH0.2Stwx6UV3Tv9ZpQdoc2_FEqyyLO8e2YDBmzIcNiIEfk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);