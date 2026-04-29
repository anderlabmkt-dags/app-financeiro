import {
  getCards, addCard, updateCard, deleteCard,
  addTransaction, formatCurrency, CARD_COLORS
} from '../store.js';
import { openModal, confirmDialog } from '../modal.js';

export function renderCartoes() {
  const cards = getCards();

  return `
    <header class="flex justify-between items-center">
      <div>
        <h2>Meus Cartões</h2>
        <p class="text-muted">Gerencie seus limites, faturas e configurações de cartões.</p>
      </div>
      <button class="btn-primary flex items-center gap-sm" id="btn-new-card">
        <span class="material-symbols-rounded">add</span>
        Novo Cartão
      </button>
    </header>

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
    <h3 style="margin-top: var(--spacing-lg);">Resumo das Faturas</h3>
    <section class="stat-grid" style="margin-top: var(--spacing-md);">
      ${cards.map(card => `
        <div class="card">
          <div class="flex justify-between items-start" style="margin-bottom: var(--spacing-md);">
            <h4 style="font-size: 16px;">Fatura - ${card.name}</h4>
            <span class="badge ${card.invoice > card.limit * 0.8 ? 'badge-danger' : 'badge-info'}">
              ${card.invoice > card.limit * 0.8 ? 'Atenção' : 'OK'}
            </span>
          </div>
          <div class="stat-value text-error" style="font-size: 1.5rem;">${formatCurrency(card.invoice)}</div>
          <p class="text-muted" style="margin-top: 8px; font-size: 14px;">
            Vence em ${new Date(card.dueDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
          </p>
          <div class="progress-bar-track" style="margin-top: var(--spacing-md);">
            <div class="progress-bar-fill" style="width: ${Math.round((card.invoice / card.limit) * 100)}%; background: ${card.invoice > card.limit * 0.8 ? 'var(--color-error)' : 'var(--color-accent)'};">
            </div>
          </div>
          <p class="text-muted" style="margin-top: var(--spacing-sm); font-size: 12px;">
            ${formatCurrency(card.invoice)} de ${formatCurrency(card.limit)} usados
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
  const usedPercent = Math.round((card.invoice / card.limit) * 100);
  const backgroundStyle = card.imageUrl 
    ? `background: url('${card.imageUrl}') center/cover no-repeat;` 
    : `background: ${card.color};`;

  return `
    <div class="credit-card-visual" style="${backgroundStyle}" data-id="${card.id}">
      ${card.imageUrl ? '<div class="cc-overlay"></div>' : ''}
      <div class="cc-content-wrapper">
        <div class="cc-top">
          <div class="cc-brand">${card.brand}</div>
          <div style="text-align: right;">
            <p class="cc-label">Saldo Disponível</p>
            <h3 class="cc-balance">${formatCurrency(card.limit - card.invoice)}</h3>
          </div>
        </div>
        <div class="cc-middle">
          <span class="material-symbols-rounded" style="font-size: 32px; opacity: 0.8;">contactless</span>
        </div>
        <div class="cc-bottom">
          <div>
            <p class="cc-number">**** **** **** ${card.lastDigits}</p>
            <p class="cc-holder">${card.holder}</p>
          </div>
          <div class="cc-expiry">
            <p class="cc-label">VALIDADE</p>
            <p style="font-weight: 600;">${card.expiry}</p>
          </div>
        </div>
        <div class="cc-invoice-overlay">
          <span>Fatura: ${formatCurrency(card.invoice)}</span>
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
          <label for="card-invoice">Fatura Atual (R$)</label>
          <input type="number" id="card-invoice" name="invoice" value="${card.invoice || 0}" step="0.01" min="0" required />
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
      invoice: parseFloat(data.invoice),
      dueDate: data.dueDate,
      color: data.color,
      imageUrl: data.imageUrl,
    };

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

      openModal('Pagar Fatura', `
        <form id="form-pay" class="modal-form">
          <p style="margin-bottom: var(--spacing-lg);">Fatura atual do <strong>${card.name}</strong>: <strong class="text-error">${formatCurrency(card.invoice)}</strong></p>
          <div class="form-group">
            <label for="pay-amount">Valor do Pagamento (R$)</label>
            <input type="number" id="pay-amount" name="amount" step="0.01" min="0.01" max="${card.invoice}" value="${card.invoice}" required />
          </div>
          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: var(--spacing-md);">
            <span class="material-symbols-rounded">payments</span>
            Confirmar Pagamento
          </button>
        </form>
      `, (data) => {
        const amount = parseFloat(data.amount);
        updateCard(card.id, { invoice: Math.max(card.invoice - amount, 0) });
        addTransaction({
          description: `Pagamento fatura - ${card.name}`,
          category: 'Outros',
          type: 'expense',
          amount: amount,
          date: new Date().toISOString().split('T')[0],
          icon: 'credit_card',
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
          <p style="margin-bottom: var(--spacing-lg);">Cartão: <strong>${card.name}</strong> — Limite disponível: <strong>${formatCurrency(card.limit - card.invoice)}</strong></p>
          <div class="form-group">
            <label for="exp-desc">Descrição</label>
            <input type="text" id="exp-desc" name="description" placeholder="Ex: Restaurante, Compras..." required />
          </div>
          <div class="form-group">
            <label for="exp-amount">Valor (R$)</label>
            <input type="number" id="exp-amount" name="amount" step="0.01" min="0.01" placeholder="0,00" required />
          </div>
          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: var(--spacing-md);">
            <span class="material-symbols-rounded">add_shopping_cart</span>
            Registrar Gasto
          </button>
        </form>
      `, (data) => {
        const amount = parseFloat(data.amount);
        updateCard(card.id, { invoice: card.invoice + amount });
        addTransaction({
          description: data.description,
          category: 'Outros',
          type: 'expense',
          amount: amount,
          date: new Date().toISOString().split('T')[0],
          icon: 'credit_card',
        });
        window.location.hash = 'cartoes';
      });
    });
  });
}
