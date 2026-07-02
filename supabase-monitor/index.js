// URL e Chave configuradas diretamente para facilitar
const SUPABASE_URL = "https://bgsnwexcoykjtiutobvb.supabase.co";

// Chave pública (anon public) do Supabase
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnc253ZXhjb3lranRpdXRvYnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MTA3NDYsImV4cCI6MjA5Mjk4Njc0Nn0.UWFFvN9-k-5jR9Yfo7wffgG4Rg-4y6rYzeCfyfL36C0";



async function checkSupabaseHealth() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Iniciando verificação de saúde do projeto Supabase...`);

  try {
    // Fazemos um ping em uma tabela fictícia para forçar o banco (PostgREST) a responder.
    // Isso garante que o banco de dados não entre em inatividade.
    const response = await fetch(`${SUPABASE_URL}/rest/v1/_ping_supabase_db?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    // Se retornar 200, 404 (tabela não encontrada) ou mesmo 401/403 (falta de permissão na tabela),
    // significa que a requisição bateu com sucesso no servidor do banco e o manteve acordado!
    if (response.status === 200 || response.status === 404 || response.status === 403 || response.status === 401) {
      console.log(`[${timestamp}] SUCESSO: Supabase está online e banco de dados foi acionado (Status: ${response.status}).`);
    } else {
      console.error(`[${timestamp}] FALHA: Supabase respondeu com erro inesperado (Status: ${response.status}).`);
      const errorText = await response.text();
      console.error(`Detalhes do erro: ${errorText}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`[${timestamp}] ERRO CRÍTICO: Não foi possível conectar ao Supabase.`);
    console.error(error.message);
    process.exit(1);
  }
}

checkSupabaseHealth();
