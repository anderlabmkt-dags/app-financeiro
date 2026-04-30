import {
  getDebts, addDebt, updateDebt, deleteDebt,
  getCards, getTotalAccumulatedInvoice, formatCurrency
} from '../store.js';
import { openModal, confirmDialog } from '../modal.js';

let selectedMonth = new Date().getMonth();
let selectedYear = new Date().getFullYear();
const monthsNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function getCardInvoice(card) {
  const key = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  if (card.invoices && card.invoices[key] !== undefined) {
    return card.invoices[key];
  }
  const currentM = new Date().getMonth();
  const currentY = new Date().getFullYear();
  if (selectedMonth === currentM && selectedYear === currentY) {
    return card.invoice || 0;
  }
  return 0;
}

export function renderDividas() {
  const debts = getDebts();
  
  const isGeneral = selectedMonth === 'general';
  const monthTotal = isGeneral 
    ? debts.reduce((sum, d) => sum + (d.totalInstallments * d.monthlyPayment), 0)
    : debts.reduce((sum, d) => {
        const start = d.startDate ? new Date(d.startDate + 'T12:00:00') : null;
        if (!start) return sum + d.monthlyPayment; // Fallback
        
        const target = new Date(selectedYear, selectedMonth, 1);
        const diffMonths = (target.getFullYear() - start.getFullYear()) * 12 + (target.getMonth() - start.getMonth());
        
        if (diffMonths >= 0 && diffMonths < d.totalInstallments) {
          return sum + d.monthlyPayment;
        }
        return sum;
      }, 0);

  const totalInterest = debts.reduce((sum, d) => {
    const remaining = (d.totalInstallments - d.paidInstallments) * d.monthlyPayment;
    return sum + (remaining * d.interestRate / 100 * 12);
  }, 0);

  const cards = getCards();
  const cardsMonthTotal = cards.reduce((sum, c) => sum + getCardInvoice(c), 0);
  const cardsGeneralTotal = cards.reduce((sum, c) => sum + getTotalAccumulatedInvoice(c), 0);
  const cardsTotal = isGeneral ? cardsGeneralTotal : cardsMonthTotal;

  const debtsTotal = debts.reduce((sum, d) => {
    const remaining = (d.totalInstallments - d.paidInstallments) * d.monthlyPayment;
    return sum + remaining;
  }, 0);
  const totalDebt = debtsTotal + cardsTotal;

  const totalInterest = debts.reduce((sum, d) => {
    const remaining = (d.totalInstallments - d.paidInstallments) * d.monthlyPayment;
    return sum + (remaining * d.interestRate / 100 * 12);
  }, 0);

  const nextDue = debts.length > 0 ? debts.reduce((min, d) => {
    return d.paidInstallments < d.totalInstallments ? d : min;
  }, debts[0]) : null;

  return `
    <header class="flex justify-between items-center">
      <div>
        <h2>Gestão de Dívidas</h2>
        <p class="text-muted">Acompanhe seus empréstimos e parcelamentos pendentes.</p>
      </div>
      <div class="flex items-center gap-sm">
<select id="dividas-month-selector" class="form-control" style="width: auto; font-weight: bold; padding: 8px 12px; border-radius: var(--radius-md); background: var(--color-surface); cursor: pointer;">
            <option value="general" ${selectedMonth === 'general' ? 'selected' : ''}>Balanço Geral</option>
            ${(() => {
              const options = [];
              const today = new Date();
              for (let i = -6; i <= 24; i++) {
                const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
                const m = d.getMonth();
                const y = d.getFullYear();
                const isSelected = selectedMonth !== 'general' && m === selectedMonth && y === selectedYear;
                options.push(`<option value="${m}-${y}" ${isSelected ? 'selected' : ''}>${monthsNames[m]} ${y}</option>`);
              }
              return options.join('');
            })()}
          </select>
        <button class="btn-primary flex items-center gap-sm" id="btn-new-debt">
          <span class="material-symbols-rounded">add</span>
          Nova Dívida
        </button>
      </div>
    </header>

    <section class="stat-grid">
      <div class="card stat-card">
        <span class="text-muted">Total em Dívidas (Dívidas + Cartões)</span>
        <div class="stat-value text-error">${formatCurrency(totalDebt)}</div>
        <div class="text-muted flex items-center gap-xs" style="font-size: 14px;">
          <span class="material-symbols-rounded" style="font-size: 18px;">account_balance</span>
          ${debts.length} dívida(s) + ${cards.length} cartão(ões)
        </div>
      </div>
      <div class="card stat-card">
        <span class="text-muted">${isGeneral ? 'Faturas de Todos os Cartões' : 'Faturas dos Cartões'}</span>
        <div class="stat-value">${formatCurrency(isGeneral ? cardsGeneralTotal : cardsMonthTotal)}</div>
        <div class="text-muted flex items-center gap-xs" style="font-size: 14px;">
          <span class="material-symbols-rounded" style="font-size: 18px;">credit_card</span>
          ${isGeneral ? 'Todas as faturas cadastradas' : monthsNames[selectedMonth] + ' de ' + selectedYear}
        </div>
      </div>
      <div class="card stat-card">
        <span class="text-muted">${isGeneral ? 'Total de Todas as Parcelas' : 'Parcelas no Mês Escolhido'}</span>
        <div class="stat-value">${formatCurrency(monthTotal)}</div>
        <div class="text-muted flex items-center gap-xs" style="font-size: 14px;">
          <span class="material-symbols-rounded" style="font-size: 18px;">calendar_month</span>
          ${isGeneral ? 'Soma de todas as dívidas' : monthsNames[selectedMonth] + ' de ' + selectedYear}
        </div>
      </div>
      <div class="card stat-card">
        <span class="text-muted">Juros Estimados (Ano)</span>
        <div class="stat-value">${formatCurrency(totalInterest)}</div>
        <div class="text-error flex items-center gap-xs" style="font-size: 14px;">
          <span class="material-symbols-rounded" style="font-size: 18px;">trending_up</span>
          Custo total estimado
        </div>
      </div>
    </section>

    <div class="debts-list">
      ${debts.length === 0 ? `
        <div class="card flex flex-col items-center gap-lg" style="justify-content: center; padding: var(--spacing-2xl);">
          <span class="material-symbols-rounded" style="font-size: 64px; color: var(--color-on-surface-variant); opacity: 0.3;">sentiment_satisfied</span>
          <p class="text-muted" style="font-size: 16px;">Nenhuma dívida cadastrada. Parabéns!</p>
        </div>
      ` : ''}
      ${debts.map(debt => renderDebtItem(debt)).join('')}
    </div>
  `;
}

function renderDebtItem(debt) {
  const progress = Math.round((debt.paidInstallments / debt.totalInstallments) * 100);
  const remaining = (debt.totalInstallments - debt.paidInstallments) * debt.monthlyPayment;
  const isComplete = debt.paidInstallments >= debt.totalInstallments;

  // Simulation: early payment of remaining installments
  const installmentsLeft = debt.totalInstallments - debt.paidInstallments;
  const earlyPayCount = Math.min(Math.ceil(installmentsLeft * 0.3), installmentsLeft);
  const interestSaved = earlyPayCount * debt.monthlyPayment * (debt.interestRate / 100);

  let progressColor = 'var(--color-accent)';
  if (progress >= 75) progressColor = 'var(--color-success)';
  else if (progress >= 50) progressColor = '#e67e22';

  return `
    <div class="card debt-card" data-id="${debt.id}">
      <div class="flex justify-between items-start" style="margin-bottom: var(--spacing-lg);">
        <div>
          <div class="flex items-center gap-sm">
            <h3>${debt.name}</h3>
            ${isComplete ? '<span class="badge badge-success">Quitado</span>' : ''}
          </div>
          <p class="text-muted">Parcela ${debt.paidInstallments} de ${debt.totalInstallments} • ${formatCurrency(debt.monthlyPayment)}/mês</p>
        </div>
        <div class="flex items-center gap-sm">
          <span class="${debt.interestRate > 3 ? 'badge badge-danger' : 'badge badge-info'}">${debt.interestRate}% a.m</span>
          <button class="btn-icon btn-edit-debt" data-id="${debt.id}" title="Editar">
            <span class="material-symbols-rounded" style="font-size: 18px;">edit</span>
          </button>
          <button class="btn-icon btn-delete-debt" data-id="${debt.id}" title="Excluir">
            <span class="material-symbols-rounded" style="font-size: 18px;">delete</span>
          </button>
        </div>
      </div>
      
      <div style="margin-bottom: var(--spacing-lg);">
        <div class="flex justify-between" style="margin-bottom: var(--spacing-sm);">
          <span style="font-weight: 600;">Progresso do Contrato</span>
          <span class="text-muted" style="font-weight: 600;">${progress}%</span>
        </div>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" style="width: ${progress}%; background: ${progressColor};"></div>
        </div>
        <div class="flex justify-between" style="margin-top: var(--spacing-sm);">
          <span class="text-muted" style="font-size: 13px;">Pago: ${formatCurrency(debt.paidInstallments * debt.monthlyPayment)}</span>
          <span class="text-muted" style="font-size: 13px;">Restante: ${formatCurrency(remaining)}</span>
        </div>
      </div>

      ${!isComplete ? `
      <div class="simulation-box">
        <div class="flex justify-between items-center">
          <div>
            <p style="font-weight: 600;">
              <span class="material-symbols-rounded" style="font-size: 18px; vertical-align: middle;">calculate</span>
              Simulação de Antecipação
            </p>
            <p class="text-muted" style="font-size: 14px;">Antecipando ${earlyPayCount} parcela(s) restante(s).</p>
          </div>
          <div style="text-align: right;">
            <p class="text-success" style="font-weight: 700;">Economia de ${formatCurrency(interestSaved)}</p>
            <button class="btn-link btn-simulate" data-id="${debt.id}">Simular pagamento</button>
          </div>
        </div>
      </div>

      <div class="flex gap-sm" style="margin-top: var(--spacing-lg);">
        <button class="btn-primary btn-sm btn-pay-installment" data-id="${debt.id}" style="flex: 1; justify-content: center;">
          <span class="material-symbols-rounded">payments</span>
          Pagar Parcela
        </button>
      </div>
      ` : ''}
    </div>
  `;
}

export function initDividas() {
  // Month selector
  document.getElementById('dividas-month-selector')?.addEventListener('change', (e) => {
    if (e.target.value === 'general') {
      selectedMonth = 'general';
      selectedYear = null;
    } else {
      const [m, y] = e.target.value.split('-').map(Number);
      selectedMonth = m;
      selectedYear = y;
    }
    window.dispatchEvent(new CustomEvent('store-updated'));
  });

  // New debt
  document.getElementById('btn-new-debt')?.addEventListener('click', () => openDebtModal());

  // Edit debt
  document.querySelectorAll('.btn-edit-debt').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const debt = getDebts().find(d => d.id === btn.dataset.id);
      if (debt) openDebtModal(debt);
    });
  });

  // Delete debt
  document.querySelectorAll('.btn-delete-debt').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const ok = await confirmDialog('Excluir Dívida', 'Tem certeza que deseja excluir esta dívida?');
      if (ok) {
        deleteDebt(btn.dataset.id);
        window.dispatchEvent(new CustomEvent('store-updated'));
      }
    });
  });

  // Pay installment
  document.querySelectorAll('.btn-pay-installment').forEach(btn => {
    btn.addEventListener('click', () => {
      const debt = getDebts().find(d => d.id === btn.dataset.id);
      if (!debt) return;

      openModal('Pagar Parcela', `
        <form id="form-pay-debt" class="modal-form">
          <p style="margin-bottom: var(--spacing-md);"><strong>${debt.name}</strong></p>
          <p style="margin-bottom: var(--spacing-lg);">Parcela ${debt.paidInstallments + 1} de ${debt.totalInstallments}: <strong>${formatCurrency(debt.monthlyPayment)}</strong></p>
          <div class="form-group">
            <label for="pay-qty">Quantidade de Parcelas a Pagar</label>
            <input type="number" id="pay-qty" name="qty" min="1" max="${debt.totalInstallments - debt.paidInstallments}" value="1" required />
          </div>
          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: var(--spacing-md);">
            <span class="material-symbols-rounded">check_circle</span>
            Confirmar Pagamento
          </button>
        </form>
      `, (data) => {
        const qty = parseInt(data.qty);
        const newPaid = Math.min(debt.paidInstallments + qty, debt.totalInstallments);
        updateDebt(debt.id, { paidInstallments: newPaid });

        if (newPaid >= debt.totalInstallments) {
          updateDebt(debt.id, { status: 'Quitado' });
        }

        window.dispatchEvent(new CustomEvent('store-updated'));
      });
    });
  });

  // Simulate early payment
  document.querySelectorAll('.btn-simulate').forEach(btn => {
    btn.addEventListener('click', () => {
      const debt = getDebts().find(d => d.id === btn.dataset.id);
      if (!debt) return;

      const installmentsLeft = debt.totalInstallments - debt.paidInstallments;
      
      openModal('Simulação de Antecipação', `
        <form id="form-simulate" class="modal-form">
          <p style="margin-bottom: var(--spacing-md);"><strong>${debt.name}</strong></p>
          <p class="text-muted" style="margin-bottom: var(--spacing-lg);">Parcelas restantes: ${installmentsLeft} — Taxa: ${debt.interestRate}% a.m</p>
          
          <div class="form-group">
            <label for="sim-qty">Quantidade de Parcelas a Antecipar</label>
            <input type="range" id="sim-qty" name="qty" min="1" max="${installmentsLeft}" value="${Math.ceil(installmentsLeft / 2)}" />
            <div class="flex justify-between text-muted" style="font-size: 12px;">
              <span>1 parcela</span>
              <span id="sim-qty-label">${Math.ceil(installmentsLeft / 2)} parcelas</span>
              <span>${installmentsLeft} parcelas</span>
            </div>
          </div>

          <div class="simulation-results" id="sim-results">
            <div class="sim-row">
              <span>Valor sem desconto</span>
              <span id="sim-total-original" style="font-weight: 700;">-</span>
            </div>
            <div class="sim-row">
              <span>Economia de juros</span>
              <span id="sim-savings" class="text-success" style="font-weight: 700;">-</span>
            </div>
            <div class="sim-row sim-row-highlight">
              <span>Valor com desconto</span>
              <span id="sim-total-discount" style="font-weight: 700; font-size: 1.2rem;">-</span>
            </div>
          </div>

          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: var(--spacing-md);">
            <span class="material-symbols-rounded">rocket_launch</span>
            Aplicar Antecipação
          </button>
        </form>
      `, (data) => {
        const qty = parseInt(data.qty);
        const newPaid = Math.min(debt.paidInstallments + qty, debt.totalInstallments);
        updateDebt(debt.id, { paidInstallments: newPaid });
        if (newPaid >= debt.totalInstallments) {
          updateDebt(debt.id, { status: 'Quitado' });
        }
        window.dispatchEvent(new CustomEvent('store-updated'));
      });

      // Live simulation calculation
      const slider = document.getElementById('sim-qty');
      const updateSim = () => {
        const qty = parseInt(slider.value);
        document.getElementById('sim-qty-label').textContent = qty + ' parcelas';
        const originalTotal = qty * debt.monthlyPayment;
        const savings = qty * debt.monthlyPayment * (debt.interestRate / 100);
        const discounted = originalTotal - savings;

        document.getElementById('sim-total-original').textContent = formatCurrency(originalTotal);
        document.getElementById('sim-savings').textContent = '- ' + formatCurrency(savings);
        document.getElementById('sim-total-discount').textContent = formatCurrency(discounted);
      };

      slider.addEventListener('input', updateSim);
      updateSim();
    });
  });
}

function openDebtModal(existingDebt = null) {
  const isEdit = !!existingDebt;
  const debt = existingDebt || {};

  openModal(isEdit ? 'Editar Dívida' : 'Nova Dívida', `
    <form id="form-debt" class="modal-form">
      <div class="form-group">
        <label for="debt-name">Nome da Dívida</label>
        <input type="text" id="debt-name" name="name" value="${debt.name || ''}" placeholder="Ex: Empréstimo Carro" required />
      </div>
      <div class="form-group">
        <label for="debt-type">Tipo</label>
        <select id="debt-type" name="type">
          <option value="Financiamento" ${debt.type === 'Financiamento' ? 'selected' : ''}>Financiamento</option>
          <option value="Cartão de Crédito" ${debt.type === 'Cartão de Crédito' ? 'selected' : ''}>Cartão de Crédito</option>
          <option value="Empréstimo Pessoal" ${debt.type === 'Empréstimo Pessoal' ? 'selected' : ''}>Empréstimo Pessoal</option>
          <option value="Consórcio" ${debt.type === 'Consórcio' ? 'selected' : ''}>Consórcio</option>
          <option value="Outro" ${debt.type === 'Outro' ? 'selected' : ''}>Outro</option>
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="debt-payment">Parcela Mensal (R$)</label>
          <input type="number" id="debt-payment" name="monthlyPayment" value="${debt.monthlyPayment || ''}" step="0.01" min="1" required />
        </div>
        <div class="form-group">
          <label for="debt-interest">Taxa de Juros (% a.m)</label>
          <input type="number" id="debt-interest" name="interestRate" value="${debt.interestRate || ''}" step="0.01" min="0" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="debt-total-inst">Total de Parcelas</label>
          <input type="number" id="debt-total-inst" name="totalInstallments" value="${debt.totalInstallments || ''}" min="1" required />
        </div>
        <div class="form-group">
          <label for="debt-paid-inst">Parcelas Pagas</label>
          <input type="number" id="debt-paid-inst" name="paidInstallments" value="${debt.paidInstallments || 0}" min="0" required />
        </div>
      </div>
      <div class="form-group">
        <label for="debt-start-date">Início da Dívida (Mês da 1ª Parcela)</label>
        <input type="date" id="debt-start-date" name="startDate" value="${debt.startDate || new Date().toISOString().split('T')[0]}" required />
      </div>
      <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: var(--spacing-md);">
        <span class="material-symbols-rounded">${isEdit ? 'save' : 'add'}</span>
        ${isEdit ? 'Salvar Alterações' : 'Adicionar Dívida'}
      </button>
    </form>
  `, (data) => {
    const debtData = {
      name: data.name,
      type: data.type,
      totalAmount: parseFloat(data.monthlyPayment) * parseInt(data.totalInstallments),
      monthlyPayment: parseFloat(data.monthlyPayment),
      interestRate: parseFloat(data.interestRate),
      totalInstallments: parseInt(data.totalInstallments),
      paidInstallments: parseInt(data.paidInstallments),
      startDate: data.startDate,
      status: parseInt(data.paidInstallments) >= parseInt(data.totalInstallments) ? 'Quitado' : 'Em dia',
    };

    if (isEdit) {
      updateDebt(existingDebt.id, debtData);
    } else {
      addDebt(debtData);
    }
    window.dispatchEvent(new CustomEvent('store-updated'));
  });
}
