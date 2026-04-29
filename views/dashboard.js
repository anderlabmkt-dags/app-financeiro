import {
  getTransactions, addTransaction, deleteTransaction,
  getMonthlyIncome, getMonthlyExpenses, getBalance,
  getWeeklyExpenses, getSettings, updateSettings,
  formatCurrency, formatDate, CATEGORIES, CATEGORY_ICONS
} from '../store.js';
import { openModal, confirmDialog } from '../modal.js';

let chartInstance = null;
let selectedPeriod = new Date().getMonth().toString();
let selectedYear = new Date().getFullYear();

export function renderDashboard() {
  const income = getMonthlyIncome(selectedPeriod, selectedYear);
  const expenses = getMonthlyExpenses(selectedPeriod, selectedYear);
  const balance = getBalance(selectedPeriod, selectedYear);
  const settings = getSettings();
  
  let allTxs = getTransactions();
  if (selectedPeriod !== 'all') {
    allTxs = allTxs.filter(t => {
      const d = new Date(t.date + 'T12:00:00');
      return d.getMonth() === parseInt(selectedPeriod) && d.getFullYear() === selectedYear;
    });
  } else {
    allTxs = allTxs.filter(t => {
      const d = new Date(t.date + 'T12:00:00');
      return d.getFullYear() === selectedYear;
    });
  }
  const txs = allTxs.slice(0, 8);
  
  const isAnnual = selectedPeriod === 'all';
  const limitTarget = isAnnual ? settings.monthlyLimit * 12 : settings.monthlyLimit;
  const limitPercent = Math.min(Math.round((expenses / limitTarget) * 100), 100);
  const remaining = Math.max(limitTarget - expenses, 0);

  const balanceSign = balance >= 0 ? 'text-success' : 'text-error';

  let limitColor = 'var(--color-accent)';
  if (limitPercent > 90) limitColor = 'var(--color-error)';
  else if (limitPercent > 70) limitColor = '#e67e22';

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const monthOptions = monthNames.map((m, i) => `<option value="${i}" ${selectedPeriod === i.toString() ? 'selected' : ''}>${m}</option>`).join('');
  
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1].map(y => `<option value="${y}" ${selectedYear === y ? 'selected' : ''}>${y}</option>`).join('');

  return `
    <header class="flex justify-between items-center flex-wrap gap-md" style="margin-bottom: var(--spacing-lg);">
      <div>
        <h2>Visão Geral</h2>
        <p class="text-muted">Bem-vindo de volta, ${settings.userName}. Acompanhe o resumo das suas finanças.</p>
      </div>
      <div class="flex items-center gap-sm">
        <select id="period-select" class="form-control" style="width: auto; padding: 8px 12px; border-radius: 8px;">
          <option value="all" ${selectedPeriod === 'all' ? 'selected' : ''}>Ano Todo</option>
          ${monthOptions}
        </select>
        <select id="year-select" class="form-control" style="width: auto; padding: 8px 12px; border-radius: 8px;">
          ${yearOptions}
        </select>
        <button class="btn-primary flex items-center gap-sm" id="btn-new-transaction">
          <span class="material-symbols-rounded">add</span>
          Nova Transação
        </button>
      </div>
    </header>

    <section class="stat-grid">
      <div class="card stat-card">
        <span class="text-muted">Saldo do Período</span>
        <div class="stat-value ${balanceSign}">${formatCurrency(balance)}</div>
        <div class="${balanceSign} flex items-center gap-xs" style="font-size: 14px;">
          <span class="material-symbols-rounded" style="font-size: 18px;">${balance >= 0 ? 'trending_up' : 'trending_down'}</span>
          ${balance >= 0 ? 'Positivo no período' : 'Negativo no período'}
        </div>
      </div>
      <div class="card stat-card">
        <span class="text-muted">Receitas do Período</span>
        <div class="stat-value">${formatCurrency(income)}</div>
        <div class="text-success flex items-center gap-xs" style="font-size: 14px;">
          <span class="material-symbols-rounded" style="font-size: 18px;">payments</span>
          ${allTxs.filter(t => t.type === 'income').length} entradas
        </div>
      </div>
      <div class="card stat-card">
        <span class="text-muted">Despesas do Período</span>
        <div class="stat-value text-error">${formatCurrency(expenses)}</div>
        <div class="text-error flex items-center gap-xs" style="font-size: 14px;">
          <span class="material-symbols-rounded" style="font-size: 18px;">arrow_downward</span>
          ${allTxs.filter(t => t.type === 'expense').length} saídas
        </div>
      </div>
    </section>

    <div class="dashboard-grid-2">
      <div class="card">
        <h3 style="margin-bottom: var(--spacing-lg);">Gastos da Semana</h3>
        <div style="height: 300px; width: 100%;">
          <canvas id="weeklyChart"></canvas>
        </div>
      </div>

      <div class="card flex flex-col gap-lg">
        <h3>Limite de Gastos</h3>
        <p class="text-muted">Meta ${isAnnual ? 'anual' : 'mensal'}: ${formatCurrency(limitTarget)}</p>
        <div style="margin-top: auto;">
          <div class="flex justify-between" style="margin-bottom: var(--spacing-sm);">
            <span style="font-weight: 600;">Progresso do Limite</span>
            <span class="text-muted" style="font-weight: 600;">${limitPercent}%</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: ${limitPercent}%; background: ${limitColor};"></div>
          </div>
          <p style="margin-top: var(--spacing-md); font-size: 14px;">
            ${remaining > 0 
              ? `Ainda disponível: <span style="font-weight: 700;">${formatCurrency(remaining)}</span>` 
              : '<span style="font-weight: 700; color: var(--color-error);">Limite atingido!</span>'}
          </p>
          <button class="btn-outline" id="btn-edit-limit" style="margin-top: var(--spacing-md); width: 100%;">
            <span class="material-symbols-rounded">edit</span>
            Alterar Limite
          </button>
        </div>
      </div>
    </div>

    <section class="card">
      <div class="flex justify-between items-center" style="margin-bottom: var(--spacing-lg);">
        <h3>Transações do Período</h3>
        <span class="text-muted" style="font-size: 14px; font-weight: 600;">${allTxs.length} registros</span>
      </div>
      <div class="transactions-list">
        ${txs.length === 0 ? '<p class="text-muted" style="text-align:center; padding: var(--spacing-xl);">Nenhuma transação registrada.</p>' : ''}
        ${txs.map(tx => `
          <div class="transaction-item" data-id="${tx.id}">
            <div class="flex items-center gap-md">
              <div class="tx-icon ${tx.type === 'income' ? 'tx-icon-income' : 'tx-icon-expense'}">
                <span class="material-symbols-rounded">${tx.icon || CATEGORY_ICONS[tx.category] || 'receipt'}</span>
              </div>
              <div>
                <div style="font-weight: 600;">${tx.description}</div>
                <div class="text-muted" style="font-size: 12px;">${tx.category} • ${formatDate(tx.date)}</div>
              </div>
            </div>
            <div class="flex items-center gap-md">
              <div class="${tx.type === 'income' ? 'text-success' : 'text-error'}" style="font-weight: 700; font-family: var(--font-data);">
                ${tx.type === 'income' ? '+' : '-'} ${formatCurrency(tx.amount)}
              </div>
              <button class="btn-icon btn-delete-tx" data-id="${tx.id}" title="Excluir">
                <span class="material-symbols-rounded" style="font-size: 18px;">delete</span>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

export function initDashboard() {
  // Weekly chart
  const ctx = document.getElementById('weeklyChart')?.getContext('2d');
  if (ctx) {
    const weekly = getWeeklyExpenses();
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: weekly.labels,
        datasets: [{
          label: 'Gastos (R$)',
          data: weekly.data,
          backgroundColor: 'rgba(69, 146, 234, 0.6)',
          borderColor: '#4592EA',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: v => 'R$ ' + v },
            grid: { color: 'rgba(0,0,0,0.04)' },
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  // Selectors listeners
  document.getElementById('period-select')?.addEventListener('change', (e) => {
    selectedPeriod = e.target.value;
    window.dispatchEvent(new Event('hashchange'));
  });

  document.getElementById('year-select')?.addEventListener('change', (e) => {
    selectedYear = parseInt(e.target.value);
    window.dispatchEvent(new Event('hashchange'));
  });

  // New transaction modal
  document.getElementById('btn-new-transaction')?.addEventListener('click', () => {
    const today = new Date().toISOString().split('T')[0];
    const categoryOptions = CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');

    openModal('Nova Transação', `
      <form id="form-transaction" class="modal-form">
        <div class="form-group">
          <label>Tipo</label>
          <div class="toggle-group">
            <label class="toggle-option active">
              <input type="radio" name="type" value="expense" checked> Despesa
            </label>
            <label class="toggle-option">
              <input type="radio" name="type" value="income"> Receita
            </label>
          </div>
        </div>
        <div class="form-group">
          <label for="tx-desc">Descrição</label>
          <input type="text" id="tx-desc" name="description" placeholder="Ex: Supermercado, Salário..." required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="tx-amount">Valor (R$)</label>
            <input type="number" id="tx-amount" name="amount" step="0.01" min="0.01" placeholder="0,00" required />
          </div>
          <div class="form-group">
            <label for="tx-date">Data</label>
            <input type="date" id="tx-date" name="date" value="${today}" required />
          </div>
        </div>
        <div class="form-group">
          <label for="tx-category">Categoria</label>
          <select id="tx-category" name="category">${categoryOptions}</select>
        </div>
        <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: var(--spacing-md);">
          <span class="material-symbols-rounded">add</span>
          Adicionar Transação
        </button>
      </form>
    `, (data) => {
      addTransaction({
        description: data.description,
        category: data.category,
        type: data.type,
        amount: parseFloat(data.amount),
        date: data.date,
        icon: CATEGORY_ICONS[data.category] || 'receipt',
      });
      navigate('dashboard');
    });

    // Toggle group
    document.querySelectorAll('.toggle-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.toggle-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
      });
    });
  });

  // Edit limit
  document.getElementById('btn-edit-limit')?.addEventListener('click', () => {
    const settings = getSettings();
    openModal('Alterar Limite Mensal', `
      <form id="form-limit" class="modal-form">
        <div class="form-group">
          <label for="limit-value">Novo Limite (R$)</label>
          <input type="number" id="limit-value" name="monthlyLimit" step="100" min="100" value="${settings.monthlyLimit}" required />
        </div>
        <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: var(--spacing-md);">
          <span class="material-symbols-rounded">save</span>
          Salvar
        </button>
      </form>
    `, (data) => {
      updateSettings({ monthlyLimit: parseFloat(data.monthlyLimit) });
      navigate('dashboard');
    });
  });

  // Delete transaction
  document.querySelectorAll('.btn-delete-tx').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const ok = await confirmDialog('Excluir Transação', 'Tem certeza que deseja excluir esta transação?');
      if (ok) {
        deleteTransaction(id);
        navigate('dashboard');
      }
    });
  });
}

// Navigate is set by main
function navigate(route) {
  window.location.hash = route;
}
