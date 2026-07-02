# Monitoramento do Supabase 🚀

Este diretório contém um script extremamente leve feito em Node.js puro (sem dependências externas) para realizar uma verificação de saúde diária no seu projeto Supabase. 

Isso é feito acessando a raiz da API REST do seu banco para certificar-se de que ele não entrará em inatividade (pausa automática) e está respondendo adequadamente.

## Como funciona?
O GitHub Actions está configurado no arquivo `.github/workflows/supabase-monitor.yml` para executar este script todos os dias à meia-noite (UTC). O script simplesmente envia uma requisição leve com suas chaves de API e emite logs em caso de falha ou sucesso. 

## Como configurar no seu repositório:

Como as credenciais são sensíveis, você deve salvá-las nos "Secrets" do seu repositório GitHub. Siga este passo a passo:

1. Acesse seu repositório no GitHub.
2. Vá até a aba **Settings** (Configurações).
3. No menu lateral esquerdo, expanda **Secrets and variables** e clique em **Actions**.
4. Clique no botão verde **New repository secret** para cada uma das chaves abaixo:

   - **Nome:** `SUPABASE_URL`
   - **Valor:** (URL do seu projeto, ex: `https://xxxxxx.supabase.co`)
   
   E depois adicione a chave anon:
   
   - **Nome:** `SUPABASE_KEY`
   - **Valor:** (Sua *anon* ou *service_role* key do Supabase)

5. **Pronto!** O GitHub Actions fará o resto de forma automatizada sem depender do seu computador estar ligado.

---
💡 **Dica:** Você pode rodar a ação manualmente a qualquer momento indo na aba **Actions** do seu GitHub, selecionando "Supabase Daily Health Check" na esquerda e clicando em "Run workflow".
