// URL e Chave configuradas diretamente para facilitar
const SUPABASE_URL = "https://bgsnwexcoykjtiutobvb.supabase.co";

// ATENÇÃO: A chave abaixo que você enviou retornou "Não Autorizado" nos testes.
// Geralmente a chave pública do Supabase começa com "eyJ...".
// Verifique em "Project Settings" > "API" > "anon public"
const SUPABASE_KEY = "sb_publishable_FT6H24KIBBSodRMiVLbHIg_m3eH6jSO";


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
