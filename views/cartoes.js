export function renderCartoes() {
  return `
    <header class="flex justify-between items-center">
      <div>
        <h2>Meus Cartões</h2>
        <p class="text-muted">Gerencie seus limites, faturas e configurações de cartões.</p>
      </div>
      <button class="btn-primary flex items-center gap-sm">
        <span class="material-symbols-rounded">add</span>
        Novo Cartão
      </button>
    </header>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: var(--spacing-lg);">
      <!-- Mastercard -->
      <div class="card" style="background: linear-gradient(135deg, #1a1c1e 0%, #2f3033 100%); color: white; position: relative; overflow: hidden; height: 220px; display: flex; flex-direction: column; justify-content: space-between;">
        <div class="flex justify-between items-start">
          <div>
            <p style="font-size: 12px; opacity: 0.7; text-transform: uppercase; letter-spacing: 1px;">Saldo Disponível</p>
            <h3 style="color: white; font-size: 24px;">R$ 15.750,00</h3>
          </div>
          <span class="material-symbols-rounded" style="font-size: 40px; opacity: 0.8;">contactless</span>
        </div>
        
        <div class="flex justify-between items-end">
          <div>
            <p style="font-family: var(--font-data); font-size: 18px; letter-spacing: 2px; margin-bottom: 8px;">**** **** **** 8842</p>
            <p style="font-size: 14px; opacity: 0.8;">DIEGO RODRIGUES</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 10px; opacity: 0.6;">VALIDADE</p>
            <p style="font-weight: 600;">12/28</p>
          </div>
        </div>
        <!-- Decorative circles -->
        <div style="position: absolute; right: -20px; top: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.03); border-radius: 50%;"></div>
      </div>

      <!-- Visa -->
      <div class="card" style="background: linear-gradient(135deg, #2e4ed2 0%, #4b69ec 100%); color: white; position: relative; overflow: hidden; height: 220px; display: flex; flex-direction: column; justify-content: space-between;">
        <div class="flex justify-between items-start">
          <div>
            <p style="font-size: 12px; opacity: 0.7; text-transform: uppercase; letter-spacing: 1px;">Saldo Disponível</p>
            <h3 style="color: white; font-size: 24px;">R$ 4.200,00</h3>
          </div>
          <span class="material-symbols-rounded" style="font-size: 40px; opacity: 0.8;">contactless</span>
        </div>
        
        <div class="flex justify-between items-end">
          <div>
            <p style="font-family: var(--font-data); font-size: 18px; letter-spacing: 2px; margin-bottom: 8px;">**** **** **** 1159</p>
            <p style="font-size: 14px; opacity: 0.8;">DIEGO RODRIGUES</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 10px; opacity: 0.6;">VALIDADE</p>
            <p style="font-weight: 600;">08/26</p>
          </div>
        </div>
        <div style="position: absolute; right: -20px; top: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
      </div>
    </div>

    <!-- Bill Details -->
    <section class="stat-grid" style="margin-top: var(--spacing-lg);">
      <div class="card">
        <h3 style="margin-bottom: var(--spacing-md);">Fatura Atual (Black)</h3>
        <div class="stat-value text-error">R$ 1.250,00</div>
        <p class="text-muted" style="margin-top: 8px;">Vence em 15 de Maio</p>
        <button class="btn-primary" style="margin-top: var(--spacing-lg); width: 100%; justify-content: center;">Pagar Fatura</button>
      </div>
      <div class="card">
        <h3 style="margin-bottom: var(--spacing-md);">Fatura Atual (Infinity)</h3>
        <div class="stat-value text-error">R$ 840,00</div>
        <p class="text-muted" style="margin-top: 8px;">Vence em 10 de Maio</p>
        <button class="btn-primary" style="margin-top: var(--spacing-lg); width: 100%; justify-content: center; background: var(--color-primary);">Pagar Fatura</button>
      </div>
    </section>
  `;
}

export function initCartoes() {
  console.log('Cartões view initialized');
}
