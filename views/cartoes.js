import {
  getCards, addCard, updateCard, deleteCard,
  addTransaction, formatCurrency, CARD_COLORS
} from '../store.js';
import { openModal, confirmDialog } from '../modal.js';

let selectedMonth = new Date().getMonth();
let selectedYear = new Date().getFullYear();

const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function getMonthKey(m, y) {
  return `${y}-${String(m + 1).padStart(2, '0')}`;
}

function getInvoice(card) {
  const key = getMonthKey(selectedMonth, selectedYear);
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

export function renderCartoes() {
  const cards = getCards();

  const options = [];
  const today = new Date();
  for (let i = -6; i <= 18; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const isSelected = m === selectedMonth && y === selectedYear;
    options.push(`<option value="${m}-${y}" ${isSelected ? 'selected' : ''}>${months[m]} ${y}</option>`);
  }

  return `
    <header class="flex justify-between items-center" style="margin-bottom: var(--spacing-lg);">
      <div>
        <h2>Meus Cartões</h2>
        <p class="text-muted">Gerencie seus limites, faturas e projeções.</p>
      </div>
      <div class="flex items-center gap-sm">
        <select id="cartoes-month-selector" class="form-control" style="width: auto; font-weight: bold; padding: 8px 12px; border-radius: var(--radius-md); background: var(--color-surface); cursor: pointer;">
          ${options.join('')}
        </select>
        <button class="btn-primary flex items-center gap-sm" id="btn-new-card">
          <span class="material-symbols-rounded">add</span>
          Novo Cartão
        </button>
      </div>
    </header>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--spacing-lg); margin-bottom: var(--spacing-lg);">
      <!-- Total Faturas -->
      <div class="bank-total-banner" style="background: linear-gradient(135deg, #e53935 0%, #c62828 40%, #b71c1c 100%);">
        <div class="bank-total-inner" style="background: linear-gradient(135deg, rgba(229, 57, 53, 0.95) 0%, rgba(198, 40, 40, 0.95) 40%, rgba(183, 28, 28, 0.95) 100%); padding: var(--spacing-lg) var(--spacing-xl);">
          <div class="bank-total-icon">
            <span class="material-symbols-rounded">receipt_long</span>
          </div>
          <div class="bank-total-info">
            <p class="bank-total-label">Total em Faturas (${months[selectedMonth]}/${selectedYear})</p>
            <p class="bank-total-value">${formatCurrency(cards.reduce((acc, c) => acc + getInvoice(c), 0))}</p>
          </div>
        </div>
      </div>

      <!-- Limite Geral -->
      <div class="bank-total-banner" style="background: linear-gradient(135deg, #43a047 0%, #2e7d32 40%, #1b5e20 100%);">
        <div class="bank-total-inner" style="background: linear-gradient(135deg, rgba(67, 160, 71, 0.95) 0%, rgba(46, 125, 50, 0.95) 40%, rgba(27, 94, 32, 0.95) 100%); padding: var(--spacing-lg) var(--spacing-xl);">
          <div class="bank-total-icon">
            <span class="material-symbols-rounded">credit_score</span>
          </div>
          <div class="bank-total-info">
            <p class="bank-total-label">Limite Geral dos Cartões</p>
            <p class="bank-total-value">${formatCurrency(cards.reduce((acc, c) => acc + c.limit, 0))}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="cards-grid">
      ${cards.map(card => renderCardItem(card)).join('')}
      ${cards.length === 0 ? `
        <div class="card flex flex-col items-center gap-lg" style="justify-content: center; padding: var(--spacing-2xl); grid-column: 1 / -1;">
          <span class="material-symbols-rounded" style="font-size: 64px; color: var(--color-on-surface-variant); opacity: 0.3;">credit_card_off</span>
          <p class="text-muted" style="font-size: 16px;">Nenhum cartão cadastrado.</p>
          <button class="btn-primary" id="btn-new-card-empty">
            <span class="material-symbols-rounded">add</span>
            Adicionar Cartão
          </button>
        </div>
      ` : ''}
    </div>

    ${cards.length > 0 ? `
    <h3 style="margin-top: var(--spacing-lg);">Resumo das Faturas (${months[selectedMonth]}/${selectedYear})</h3>
    <section class="stat-grid" style="margin-top: var(--spacing-md);">
      ${cards.map(card => `
        <div class="card">
          <div class="flex justify-between items-start" style="margin-bottom: var(--spacing-md);">
            <h4 style="font-size: 16px;">Fatura - ${card.name}</h4>
            <span class="badge ${getInvoice(card) > card.limit * 0.8 ? 'badge-danger' : 'badge-info'}">
              ${getInvoice(card) > card.limit * 0.8 ? 'Atenção' : 'OK'}
            </span>
          </div>
          <div class="stat-value text-error" style="font-size: 1.5rem;">${formatCurrency(getInvoice(card))}</div>
          <p class="text-muted" style="margin-top: 8px; font-size: 14px;">
            Vence em ${new Date(card.dueDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
          </p>
          <div class="progress-bar-track" style="margin-top: var(--spacing-md);">
            <div class="progress-bar-fill" style="width: ${Math.round((getInvoice(card) / card.limit) * 100)}%; background: ${getInvoice(card) > card.limit * 0.8 ? 'var(--color-error)' : 'var(--color-accent)'};">
            </div>
          </div>
          <p class="text-muted" style="margin-top: var(--spacing-sm); font-size: 12px;">
            ${formatCurrency(getInvoice(card))} de ${formatCurrency(card.limit)} usados
          </p>
          <div class="flex gap-sm" style="margin-top: var(--spacing-lg);">
            <button class="btn-primary btn-sm btn-pay-invoice" data-id="${card.id}" style="flex: 1; justify-content: center;">
              Pagar Fatura
            </button>
            <button class="btn-outline btn-sm btn-add-expense" data-id="${card.id}" style="flex: 1; justify-content: center;">
              + Gasto
            </button>
          </div>
        </div>
      `).join('')}
    </section>
    ` : ''}
  `;
}

function renderCardItem(card) {
  const backgroundStyle = card.imageUrl 
    ? `background: url('${card.imageUrl}') center/cover no-repeat;` 
    : `background: ${card.color};`;

  return `
    <div class="credit-card-visual" style="${backgroundStyle}" data-id="${card.id}">
      ${card.imageUrl ? '<div class="cc-overlay"></div>' : ''}
      <div class="cc-content-wrapper">
        <div class="cc-centered-data">
          <p class="cc-label" style="opacity: 0.8; margin-bottom: -5px;">Fatura (${months[selectedMonth]}/${selectedYear})</p>
          <div class="cc-invoice-large">${formatCurrency(getInvoice(card))}</div>
          <div class="cc-limit-small">Limite Disponível: ${formatCurrency(card.limit - getInvoice(card))}</div>
        </div>
        
        <div class="cc-actions">
          <button class="btn-icon-light btn-edit-card" data-id="${card.id}" title="Editar">
            <span class="material-symbols-rounded">edit</span>
          </button>
          <button class="btn-icon-light btn-delete-card" data-id="${card.id}" title="Excluir">
            <span class="material-symbols-rounded">delete</span>
          </button>
        </div>
      </div>
      <div class="cc-circle-1"></div>
      <div class="cc-circle-2"></div>
    </div>
  `;
}

function openCardModal(existingCard = null) {
  const isEdit = !!existingCard;
  const card = existingCard || {};
  const colorOptions = CARD_COLORS.map((c, i) =>
    `<label class="color-swatch ${card.color === c ? 'active' : ''}" style="background: ${c};">
      <input type="radio" name="color" value="${c}" ${(card.color === c || (!isEdit && !card.color && i === 0)) ? 'checked' : ''} />
    </label>`
  ).join('');

  openModal(isEdit ? 'Editar Cartão' : 'Novo Cartão', `
    <form id="form-card" class="modal-form">
      <div class="form-row">
        <div class="form-group">
          <label for="card-name">Nome do Cartão</label>
          <input type="text" id="card-name" name="name" value="${card.name || ''}" placeholder="Ex: Nubank Gold" required />
        </div>
        <div class="form-group">
          <label for="card-brand">Bandeira</label>
          <select id="card-brand" name="brand">
            <option value="Mastercard" ${card.brand === 'Mastercard' ? 'selected' : ''}>Mastercard</option>
            <option value="Visa" ${card.brand === 'Visa' ? 'selected' : ''}>Visa</option>
            <option value="Elo" ${card.brand === 'Elo' ? 'selected' : ''}>Elo</option>
            <option value="Amex" ${card.brand === 'Amex' ? 'selected' : ''}>American Express</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="card-holder">Titular</label>
          <input type="text" id="card-holder" name="holder" value="${card.holder || ''}" placeholder="NOME COMPLETO" required style="text-transform: uppercase;" />
        </div>
        <div class="form-group">
          <label for="card-digits">Últimos 4 Dígitos</label>
          <input type="text" id="card-digits" name="lastDigits" value="${card.lastDigits || ''}" maxlength="4" pattern="[0-9]{4}" placeholder="1234" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="card-expiry">Validade (MM/AA)</label>
          <input type="text" id="card-expiry" name="expiry" value="${card.expiry || ''}" placeholder="12/28" maxlength="5" required />
        </div>
        <div class="form-group">
          <label for="card-limit">Limite (R$)</label>
          <input type="number" id="card-limit" name="limit" value="${card.limit || ''}" step="100" min="100" placeholder="10000" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="card-invoice">Fatura (${months[selectedMonth]}/${selectedYear})</label>
          <input type="number" id="card-invoice" name="invoice" value="${getInvoice(card)}" step="0.01" min="0" required />
        </div>
        <div class="form-group">
          <label for="card-due">Vencimento</label>
          <input type="date" id="card-due" name="dueDate" value="${card.dueDate || ''}" required />
        </div>
      </div>
      <div class="form-group">
        <label for="card-image-url">URL da Imagem de Fundo (Opcional)</label>
        <input type="url" id="card-image-url" name="imageUrl" value="${card.imageUrl || ''}" placeholder="https://exemplo.com/imagem.png" />
      </div>
      <div class="form-group">
        <label>Cor do Cartão (Usada se não houver imagem)</label>
        <div class="color-swatches">${colorOptions}</div>
      </div>
      <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: var(--spacing-md);">
        <span class="material-symbols-rounded">${isEdit ? 'save' : 'add'}</span>
        ${isEdit ? 'Salvar Alterações' : 'Adicionar Cartão'}
      </button>
    </form>
  `, (data) => {
    const cardData = {
      name: data.name,
      holder: data.holder.toUpperCase(),
      lastDigits: data.lastDigits,
      brand: data.brand,
      expiry: data.expiry,
      limit: parseFloat(data.limit),
      dueDate: data.dueDate,
      color: data.color,
      imageUrl: data.imageUrl,
    };

    let newInvoices = card.invoices ? { ...card.invoices } : {};
    const currentM = new Date().getMonth();
    const currentY = new Date().getFullYear();
    const currentKey = getMonthKey(currentM, currentY);
    
    if (!card.invoices && card.invoice !== undefined) {
      newInvoices[currentKey] = card.invoice;
    }
    
    const key = getMonthKey(selectedMonth, selectedYear);
    newInvoices[key] = parseFloat(data.invoice) || 0;
    
    cardData.invoices = newInvoices;
    if (key === currentKey) {
      cardData.invoice = newInvoices[key];
    }

    if (isEdit) {
      updateCard(existingCard.id, cardData);
    } else {
      addCard(cardData);
    }
    window.location.hash = 'cartoes';
  });

  // Color swatch selection
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
    });
  });
}

export function initCartoes() {
  // Month selector
  document.getElementById('cartoes-month-selector')?.addEventListener('change', (e) => {
    const [m, y] = e.target.value.split('-');
    selectedMonth = parseInt(m, 10);
    selectedYear = parseInt(y, 10);
    window.dispatchEvent(new CustomEvent('store-updated'));
  });

  // New card
  document.getElementById('btn-new-card')?.addEventListener('click', () => openCardModal());
  document.getElementById('btn-new-card-empty')?.addEventListener('click', () => openCardModal());

  // Edit card
  document.querySelectorAll('.btn-edit-card').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = getCards().find(c => c.id === btn.dataset.id);
      if (card) openCardModal(card);
    });
  });

  // Delete card
  document.querySelectorAll('.btn-delete-card').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const ok = await confirmDialog('Excluir Cartão', 'Tem certeza que deseja excluir este cartão? Esta ação não pode ser desfeita.');
      if (ok) {
        deleteCard(btn.dataset.id);
        window.location.hash = 'cartoes';
      }
    });
  });

  // Pay invoice
  document.querySelectorAll('.btn-pay-invoice').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = getCards().find(c => c.id === btn.dataset.id);
      if (!card) return;
      const currentInv = getInvoice(card);

      openModal('Pagar Fatura', `
        <form id="form-pay" class="modal-form">
          <p style="margin-bottom: var(--spacing-lg);">Fatura atual do <strong>${card.name}</strong> (${months[selectedMonth]}/${selectedYear}): <strong class="text-error">${formatCurrency(currentInv)}</strong></p>
          <div class="form-group">
            <label for="pay-amount">Valor do Pagamento (R$)</label>
            <input type="number" id="pay-amount" name="amount" step="0.01" min="0.01" max="${currentInv}" value="${currentInv}" required />
          </div>
          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: var(--spacing-md);">
            <span class="material-symbols-rounded">payments</span>
            Confirmar Pagamento
          </button>
        </form>
      `, (data) => {
        const amount = parseFloat(data.amount);

        let newInvoices = card.invoices ? { ...card.invoices } : {};
        const currentM = new Date().getMonth();
        const currentY = new Date().getFullYear();
        const currentKey = getMonthKey(currentM, currentY);
        
        if (!card.invoices && card.invoice !== undefined) {
          newInvoices[currentKey] = card.invoice;
        }

        const key = getMonthKey(selectedMonth, selectedYear);
        newInvoices[key] = Math.max((newInvoices[key] || 0) - amount, 0);

        let updateData = { invoices: newInvoices };
        if (key === currentKey) {
          updateData.invoice = newInvoices[key];
        }

        updateCard(card.id, updateData);

        addTransaction({
          description: `Pagamento fatura - ${card.name} (${months[selectedMonth]}/${selectedYear})`,
          category: 'Financeiro > Fatura do cartão',
          type: 'expense',
          amount: amount,
          date: new Date(selectedYear, selectedMonth, new Date().getDate()).toISOString().split('T')[0],
          icon: 'credit_card',
          paymentMethod: 'debit',
          paymentSourceId: null
        });
        window.location.hash = 'cartoes';
      });
    });
  });

  // Add expense to card
  document.querySelectorAll('.btn-add-expense').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = getCards().find(c => c.id === btn.dataset.id);
      if (!card) return;

      openModal('Registrar Gasto no Cartão', `
        <form id="form-card-expense" class="modal-form">
          <p style="margin-bottom: var(--spacing-lg);">Cartão: <strong>${card.name}</strong> — Limite disponível: <strong>${formatCurrency(card.limit - getInvoice(card))}</strong></p>
          <div class="form-group">
            <label for="exp-desc">Descrição</label>
            <input type="text" id="exp-desc" name="description" placeholder="Ex: Restaurante, Compras..." required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="exp-amount">Valor Total (R$)</label>
              <input type="number" id="exp-amount" name="amount" step="0.01" min="0.01" placeholder="0,00" required />
            </div>
            <div class="form-group">
              <label for="exp-installments">Parcelas</label>
              <input type="number" id="exp-installments" name="installments" min="1" max="72" value="1" required />
            </div>
          </div>
          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: var(--spacing-md);">
            <span class="material-symbols-rounded">add_shopping_cart</span>
            Registrar Gasto
          </button>
        </form>
      `, (data) => {
        const totalAmount = parseFloat(data.amount);
        const installments = parseInt(data.installments, 10) || 1;
        const amountPerInst = totalAmount / installments;
        
        let newInvoices = card.invoices ? { ...card.invoices } : {};
        
        const currentM = new Date().getMonth();
        const currentY = new Date().getFullYear();
        const currentKey = getMonthKey(currentM, currentY);
        if (!card.invoices && card.invoice !== undefined) {
           newInvoices[currentKey] = card.invoice;
        }

        let startM = selectedMonth;
        let startY = selectedYear;
        
        for (let i = 0; i < installments; i++) {
          let m = startM + i;
          let y = startY + Math.floor(m / 12);
          m = m % 12;
          
          let key = getMonthKey(m, y);
          newInvoices[key] = (newInvoices[key] || 0) + amountPerInst;
          
          // Add transaction record
          let d = new Date(y, m, new Date().getDate());
          addTransaction({
            description: installments > 1 ? `${data.description} (${i+1}/${installments})` : data.description,
            category: 'Outros',
            type: 'expense',
            amount: amountPerInst,
            date: d.toISOString().split('T')[0],
            icon: 'credit_card',
            paymentMethod: 'credit_card',
            paymentSourceId: card.id
          });
        }
        
        let updateData = { invoices: newInvoices };
        if (newInvoices[currentKey] !== undefined) {
          updateData.invoice = newInvoices[currentKey];
        }
        
        updateCard(card.id, updateData);
        window.location.hash = 'cartoes';
      });
    });
  });
}
