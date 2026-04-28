export function renderDividas() {
  return `
    <header class="flex justify-between items-center">
      <div>
        <h2>Gestão de Dívidas</h2>
        <p class="text-muted">Acompanhe seus empréstimos e parcelamentos pendentes.</p>
      </div>
    </header>

    <section class="stat-grid">
      <div class="card stat-card">
        <span class="text-muted">Total em Dívidas</span>
        <div class="stat-value text-error">R$ 42.150,00</div>
      </div>
      <div class="card stat-card">
        <span class="text-muted">Próximo Vencimento</span>
        <div class="stat-value">15/05</div>
        <p class="text-muted" style="font-size: 14px;">Empréstimo Carro</p>
      </div>
      <div class="card stat-card">
        <span class="text-muted">Juros Estimados (Ano)</span>
        <div class="stat-value">R$ 3.420,00</div>
      </div>
    </section>

    <div style="display: flex; flex-direction: column; gap: var(--spacing-lg); margin-top: var(--spacing-lg);">
      <!-- Car Loan -->
      <div class="card">
        <div class="flex justify-between items-start" style="margin-bottom: var(--spacing-lg);">
          <div>
            <h3>Empréstimo Carro - Itaú</h3>
            <p class="text-muted">Parcela 24 de 48 • R$ 1.250,00/mês</p>
          </div>
          <div class="text-success" style="font-weight: 700;">Em dia</div>
        </div>
        
        <div style="margin-bottom: var(--spacing-lg);">
          <div class="flex justify-between" style="margin-bottom: var(--spacing-sm);">
            <span style="font-weight: 600;">Progresso do Contrato</span>
            <span class="text-muted">50%</span>
          </div>
          <div style="height: 8px; background: var(--color-surface-container); border-radius: var(--radius-full); overflow: hidden;">
            <div style="width: 50%; height: 100%; background: var(--color-success); border-radius: var(--radius-full);"></div>
          </div>
        </div>

        <div style="background: var(--color-surface-container-low); padding: var(--spacing-md); border-radius: var(--radius-lg); display: flex; justify-content: space-between; items-center;">
          <div>
            <p style="font-weight: 600;">Simulação de Antecipação</p>
            <p class="text-muted" style="font-size: 14px;">Simulando antecipação das 5 últimas parcelas.</p>
          </div>
          <div style="text-align: right;">
            <p class="text-success" style="font-weight: 700;">Economia de R$ 850,00</p>
            <button class="text-muted" style="background: none; font-weight: 600; font-size: 14px; text-decoration: underline;">Ver detalhes</button>
          </div>
        </div>
      </div>

      <!-- Credit Card Debt (Santander) -->
      <div class="card">
        <div class="flex justify-between items-start" style="margin-bottom: var(--spacing-lg);">
          <div>
            <h3>Fatura Santander - Parcelamento</h3>
            <p class="text-muted">Parcela 2 de 10 • R$ 340,00/mês</p>
          </div>
          <div class="text-error" style="font-weight: 700;">Juros: 4.5% a.m</div>
        </div>
        
        <div>
          <div class="flex justify-between" style="margin-bottom: var(--spacing-sm);">
            <span style="font-weight: 600;">Progresso</span>
            <span class="text-muted">20%</span>
          </div>
          <div style="height: 8px; background: var(--color-surface-container); border-radius: var(--radius-full); overflow: hidden;">
            <div style="width: 20%; height: 100%; background: var(--color-accent); border-radius: var(--radius-full);"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initDividas() {
  console.log('Dívidas view initialized');
}
