import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://imfcfqvobqpttymiesdf.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZGxidG1jaGVnd3hqemxjcmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNzQzODksImV4cCI6MjA5Njk1MDM4OX0.W4ZLUCDfXnhXOtm5XlzKREU0bcWsAkb0qi3QsbM8P9k'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)