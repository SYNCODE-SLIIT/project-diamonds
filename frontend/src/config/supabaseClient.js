import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vjdtynqvlswpxwjpqylw.supabase.co'; // Your Supabase project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqZHR5bnF2bHN3cHh3anBxeWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyOTMzOTAsImV4cCI6MjA2MTg2OTM5MH0.6nW7ENJUHSzM7lF_A0MIvFt5xKmAMxXnquEAuIj5IB8'; // Your Supabase anon/public key

export const supabase = createClient(supabaseUrl, supabaseKey); 