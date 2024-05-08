import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://psdznfkrvkmwdyydrvsy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZHpuZmtydmttd2R5eWRydnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI4MzYzMDQsImV4cCI6MjAyODQxMjMwNH0.S05kMN9rFUJWl5kjPxd7ft0rvegkVkfHOj4Fb7YH-TI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
export { supabase };
