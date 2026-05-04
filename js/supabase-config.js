// Configuração do Supabase usada pelo painel admin e pela página pública de laudos.
// Estas credenciais são públicas (anon key) — o acesso é controlado pelas
// Row Level Security policies definidas no banco.
window.AGUAJATO_SUPABASE = {
  url: 'https://qxbxlhatrcxrqcrqdekp.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4YnhsaGF0cmN4cnFjcnFkZWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcwMzA4MjEsImV4cCI6MjA0MjYwNjgyMX0.mfjC3CT4HV8szQt7Yjod0NQVsYD1S9SQbPrZ2R73Vyc',
  table: 'aguajato_laudos',
  bucket: 'aguajato-laudos-pdfs'
};
