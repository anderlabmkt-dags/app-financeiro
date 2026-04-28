export function renderDashboard() {
  return `
    <header class="flex justify-between items-center">
      <div>
        <h2>Visão Geral</h2>
        <p class="text-muted">Bem-vindo de volta, Diego. Acompanhe o resumo das suas finanças.</p>
      </div>
      <div class="flex items-center gap-md">
        <button class="btn-primary flex items-center gap-sm">
          <span class="material-symbols-rounded">add</span>
          Nova Transação
        </button>
        <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--color-surface-container-highest); display: flex; align-items: center; justify-content: center;">
          <span class="material-symbols-rounded">person</span>
        </div>
      </div>
    </header>

    <section class="stat-grid">
      <div class="card stat-card">
        <span class="text-muted">Saldo Total</span>
        <div class="stat-value">R$ 24.500,00</div>
        <div class="text-success flex items-center gap-xs" style="font-size: 14px;">
          <span class="material-symbols-rounded" style="font-size: 18px;">arrow_upward</span>
          +12% este mês
        </div>
      </div>
      <div class="card stat-card">
        <span class="text-muted">Receitas Mensais</span>
        <div class="stat-value">R$ 8.250,00</div>
        <div class="text-success flex items-center gap-xs" style="font-size: 14px;">
          <span class="material-symbols-rounded" style="font-size: 18px;">payments</span>
          4 depósitos novos
        </div>
      </div>
      <div class="card stat-card">
        <span class="text-muted">Despesas Mensais</span>
        <div class="stat-value text-error">R$ 3.840,00</div>
        <div class="text-error flex items-center gap-xs" style="font-size: 14px;">
          <span class="material-symbols-rounded" style="font-size: 18px;">arrow_downward</span>
          -5% vs mês passado
        </div>
      </div>
    </section>

    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--spacing-lg);">
      <div class="card">
        <h3 style="margin-bottom: var(--spacing-lg);">Gastos por Semana</h3>
        <div style="height: 300px; width: 100%;">
          <canvas id="weeklyChart"></canvas>
        </div>
      </div>

      <div class="card flex flex-col gap-lg">
        <h3>Limite de Gastos</h3>
        <p class="text-muted">Mantenha-se dentro do limite para atingir suas metas financeiras.</p>
        <div style="margin-top: auto;">
          <div class="flex justify-between" style="margin-bottom: var(--spacing-sm);">
            <span style="font-weight: 600;">Progresso do Limite</span>
            <span class="text-muted">75%</span>
          </div>
          <div style="height: 12px; background: var(--color-surface-container); border-radius: var(--radius-full); overflow: hidden;">
            <div style="width: 75%; height: 100%; background: var(--color-accent); border-radius: var(--radius-full);"></div>
          </div>
          <p style="margin-top: var(--spacing-md); font-size: 14px;">
            Faltam <span style="font-weight: 700;">R$ 1.250</span> para atingir o limite.
          </p>
        </div>
      </div>
    </div>

    <section class="card">
      <div class="flex justify-between items-center" style="margin-bottom: var(--spacing-lg);">
        <h3>Transações Recentes</h3>
        <a href="#" class="text-muted" style="text-decoration: none; font-weight: 600; font-size: 14px;">Ver todas</a>
      </div>
      <div class="transactions-list">
        <div class="transaction-item">
          <div class="flex items-center gap-md">
            <div style="width: 40px; height: 40px; background: #ffebee; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: #d32f2f;">
              <span class="material-symbols-rounded">shopping_cart</span>
            </div>
            <div>
              <div style="font-weight: 600;">Supermercado Pão de Açúcar</div>
              <div class="text-muted" style="font-size: 12px;">Alimentação • Hoje, 14:30</div>
            </div>
          </div>
          <div class="text-error" style="font-weight: 700;">- R$ 450,00</div>
        </div>
        
        <div class="transaction-item">
          <div class="flex items-center gap-md">
            <div style="width: 40px; height: 40px; background: #e8f5e9; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: #2e7d32;">
              <span class="material-symbols-rounded">work</span>
            </div>
            <div>
              <div style="font-weight: 600;">Salário Mensal - TechCorp</div>
              <div class="text-muted" style="font-size: 12px;">Renda • Ontem, 09:00</div>
            </div>
          </div>
          <div class="text-success" style="font-weight: 700;">+ R$ 6.500,00</div>
        </div>
      </div>
    </section>
  `;
}

export function initDashboard() {
  const ctx = document.getElementById('weeklyChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      datasets: [{
        label: 'Gastos (R$)',
        data: [150, 450, 200, 600, 350, 800, 400],
        borderColor: '#4592EA',
        backgroundColor: 'rgba(69, 146, 234, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#4592EA'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true, ticks: { callback: v => 'R$ ' + v } }
      }
    }
  });
}
