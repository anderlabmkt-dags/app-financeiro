const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERRO: As variáveis de ambiente SUPABASE_URL e SUPABASE_KEY são obrigatórias.');
  process.exit(1);
}

async function checkSupabaseHealth() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Iniciando verificação de saúde do projeto Supabase...`);

  try {
    // Acessar a raiz da API REST do Supabase é uma forma leve de validar se o projeto
    // está online e se a chave da API é válida, sem precisar consultar uma tabela específica.
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (response.ok) {
      console.log(`[${timestamp}] SUCESSO: Supabase está online e respondendo corretamente (Status: ${response.status}).`);
    } else {
      console.error(`[${timestamp}] FALHA: Supabase respondeu com erro (Status: ${response.status}).`);
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
