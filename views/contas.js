import {
  getBankAccounts, addBankAccount, updateBankAccount, deleteBankAccount,
  getTotalBankBalance, addTransaction, formatCurrency, BANK_COLORS
} from '../store.js';
import { openModal, confirmDialog } from '../modal.js';

export function renderContas() {
  const accounts = getBankAccounts();
  const totalBalance = getTotalBankBalance();

  return `
    <header class="flex justify-between items-center">
      <div>
        <h2>Contas Bancárias</h2>
        <p class="text-muted">Gerencie suas contas, saldos e movimentações.</p>
      </div>
      <button class="btn-primary flex items-center gap-sm" id="btn-new-account">
        <span class="material-symbols-rounded">add</span>
        Nova Conta
      </button>
    </header>

    <!-- Total Balance Banner -->
    <div class="bank-total-banner">
      <div class="bank-total-inner">
        <div class="bank-total-icon">
          <span class="material-symbols-rounded">account_balance</span>
        </div>
        <div class="bank-total-info">
          <p class="bank-total-label">Saldo Total em Contas</p>
          <p class="bank-total-value">${formatCurrency(totalBalance)}</p>
        </div>
        <div class="bank-total-count">
          <span class="bank-total-count-number">${accounts.length}</span>
          <span class="bank-total-count-label">${accounts.length === 1 ? 'conta' : 'contas'}</span>
        </div>
      </div>
    </div>

    <div class="cards-grid">
      ${accounts.map(account => renderBankAccountItem(account)).join('')}
      ${accounts.length === 0 ? `
        <div class="card flex flex-col items-center gap-lg" style="justify-content: center; padding: var(--spacing-2xl); grid-column: 1 / -1;">
          <span class="material-symbols-rounded" style="font-size: 64px; color: var(--color-on-surface-variant); opacity: 0.3;">account_balance</span>
          <p class="text-muted" style="font-size: 16px;">Nenhuma conta bancária cadastrada.</p>
          <button class="btn-primary" id="btn-new-account-empty">
            <span class="material-symbols-rounded">add</span>
            Adicionar Conta
          </button>
        </div>
      ` : ''}
    </div>

    ${accounts.length > 0 ? `
    <h3 style="margin-top: var(--spacing-lg);">Detalhes das Contas</h3>
    <section class="stat-grid" style="margin-top: var(--spacing-md);">
      ${accounts.map(account => `
        <div class="card">
          <div class="flex justify-between items-start" style="margin-bottom: var(--spacing-md);">
            <h4 style="font-size: 16px;">${account.bankName} - ${account.accountType}</h4>
            <span class="badge ${account.balance >= 0 ? 'badge-success' : 'badge-danger'}">
              ${account.balance >= 0 ? 'Positivo' : 'Negativo'}
            </span>
          </div>
          <div class="stat-value ${account.balance >= 0 ? 'text-success' : 'text-error'}" style="font-size: 1.5rem;">${formatCurrency(account.balance)}</div>
          <p class="text-muted" style="margin-top: 8px; font-size: 14px;">
            Ag: ${account.agency} | CC: ${account.accountNumber}
          </p>
          <div class="flex gap-sm" style="margin-top: var(--spacing-lg);">
            <button class="btn-primary btn-sm btn-deposit" data-id="${account.id}" style="flex: 1; justify-content: center;">
              <span class="material-symbols-rounded" style="font-size: 18px;">arrow_downward</span>
              Depósito
            </button>
            <button class="btn-outline btn-sm btn-withdraw" data-id="${account.id}" style="flex: 1; justify-content: center;">
              <span class="material-symbols-rounded" style="font-size: 18px;">arrow_upward</span>
              Saque
            </button>
          </div>
        </div>
      `).join('')}
    </section>
    ` : ''}
  `;
}

function renderBankAccountItem(account) {
  const backgroundStyle = account.imageUrl
    ? `background: url('${account.imageUrl}') center/cover no-repeat;`
    : `background: ${account.color};`;

  return `
    <div class="credit-card-visual bank-account-visual" style="${backgroundStyle}" data-id="${account.id}">
      ${account.imageUrl ? '<div class="cc-overlay"></div>' : ''}
      <div class="cc-content-wrapper">
        <div class="bank-card-header">
          <div class="bank-card-bank-info">
            <span class="material-symbols-rounded" style="font-size: 28px;">${account.icon || 'account_balance'}</span>
            <div>
              <p class="bank-card-bank-name">${account.bankName}</p>
              <p class="bank-card-account-type">${account.accountType}</p>
            </div>
          </div>
        </div>

        <div class="cc-centered-data">
          <p class="cc-label" style="opacity: 0.8; margin-bottom: -5px;">Saldo Disponível</p>
          <div class="cc-invoice-large">${formatCurrency(account.balance)}</div>
        </div>

        <div class="cc-actions">
          <button class="btn-icon-light btn-edit-account" data-id="${account.id}" title="Editar">
            <span class="material-symbols-rounded">edit</span>
          </button>
          <button class="btn-icon-light btn-delete-account" data-id="${account.id}" title="Excluir">
            <span class="material-symbols-rounded">delete</span>
          </button>
        </div>
      </div>
      <div class="cc-circle-1"></div>
      <div class="cc-circle-2"></div>
    </div>
  `;
}

function openAccountModal(existingAccount = null) {
  const isEdit = !!existingAccount;
  const account = existingAccount || {};
  const colorOptions = BANK_COLORS.map((c, i) =>
    `<label class="color-swatch ${account.color === c ? 'active' : ''}" style="background: ${c};">
      <input type="radio" name="color" value="${c}" ${(account.color === c || (!isEdit && !account.color && i === 0)) ? 'checked' : ''} />
    </label>`
  ).join('');

  openModal(isEdit ? 'Editar Conta' : 'Nova Conta Bancária', `
    <form id="form-account" class="modal-form">
      <div class="form-row">
        <div class="form-group">
          <label for="account-bank">Nome do Banco</label>
          <input type="text" id="account-bank" name="bankName" value="${account.bankName || ''}" placeholder="Ex: Nubank, Itaú..." required />
        </div>
        <div class="form-group">
          <label for="account-type">Tipo de Conta</label>
          <select id="account-type" name="accountType">
            <option value="Conta Corrente" ${account.accountType === 'Conta Corrente' ? 'selected' : ''}>Conta Corrente</option>
            <option value="Poupança" ${account.accountType === 'Poupança' ? 'selected' : ''}>Poupança</option>
            <option value="Conta Salário" ${account.accountType === 'Conta Salário' ? 'selected' : ''}>Conta Salário</option>
            <option value="Conta Digital" ${account.accountType === 'Conta Digital' ? 'selected' : ''}>Conta Digital</option>
            <option value="Conta Investimento" ${account.accountType === 'Conta Investimento' ? 'selected' : ''}>Conta Investimento</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="account-holder">Titular</label>
          <input type="text" id="account-holder" name="holder" value="${account.holder || ''}" placeholder="NOME COMPLETO" required style="text-transform: uppercase;" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="account-agency">Agência</label>
          <input type="text" id="account-agency" name="agency" value="${account.agency || ''}" placeholder="0001" required />
        </div>
        <div class="form-group">
          <label for="account-number">Número da Conta</label>
          <input type="text" id="account-number" name="accountNumber" value="${account.accountNumber || ''}" placeholder="123456-7" required />
        </div>
      </div>
      <div class="form-group">
        <label for="account-balance">Saldo Atual (R$)</label>
        <input type="number" id="account-balance" name="balance" value="${account.balance || 0}" step="0.01" placeholder="0,00" required />
      </div>
      <div class="form-group">
        <label for="account-image-url">URL da Imagem de Fundo (Opcional)</label>
        <input type="url" id="account-image-url" name="imageUrl" value="${account.imageUrl || ''}" placeholder="https://exemplo.com/imagem.png" />
      </div>
      <div class="form-group">
        <label>Cor da Conta (Usada se não houver imagem)</label>
        <div class="color-swatches">${colorOptions}</div>
      </div>
      <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: var(--spacing-md);">
        <span class="material-symbols-rounded">${isEdit ? 'save' : 'add'}</span>
        ${isEdit ? 'Salvar Alterações' : 'Adicionar Conta'}
      </button>
    </form>
  `, (data) => {
    const accountData = {
      bankName: data.bankName,
      accountType: data.accountType,
      holder: data.holder.toUpperCase(),
      agency: data.agency,
      accountNumber: data.accountNumber,
      balance: parseFloat(data.balance),
      color: data.color,
      imageUrl: data.imageUrl,
      icon: data.accountType === 'Poupança' ? 'savings' : 'account_balance',
    };

    if (isEdit) {
      updateBankAccount(existingAccount.id, accountData);
    } else {
      addBankAccount(accountData);
    }
    window.location.hash = 'contas';
  });

  // Color swatch selection
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
    });
  });
}

export function initContas() {
  // New account
  document.getElementById('btn-new-account')?.addEventListener('click', () => openAccountModal());
  document.getElementById('btn-new-account-empty')?.addEventListener('click', () => openAccountModal());

  // Edit account
  document.querySelectorAll('.btn-edit-account').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const account = getBankAccounts().find(a => a.id === btn.dataset.id);
      if (account) openAccountModal(account);
    });
  });

  // Delete account
  document.querySelectorAll('.btn-delete-account').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const ok = await confirmDialog('Excluir Conta', 'Tem certeza que deseja excluir esta conta bancária? Esta ação não pode ser desfeita.');
      if (ok) {
        deleteBankAccount(btn.dataset.id);
        window.location.hash = 'contas';
      }
    });
  });

  // Deposit
  document.querySelectorAll('.btn-deposit').forEach(btn => {
    btn.addEventListener('click', () => {
      const account = getBankAccounts().find(a => a.id === btn.dataset.id);
      if (!account) return;

      openModal('Registrar Depósito', `
        <form id="form-deposit" class="modal-form">
          <p style="margin-bottom: var(--spacing-lg);">Conta: <strong>${account.bankName} - ${account.accountType}</strong><br>Saldo atual: <strong class="text-success">${formatCurrency(account.balance)}</strong></p>
          <div class="form-group">
            <label for="deposit-desc">Descrição</label>
            <input type="text" id="deposit-desc" name="description" placeholder="Ex: Transferência, PIX recebido..." required />
          </div>
          <div class="form-group">
            <label for="deposit-amount">Valor (R$)</label>
            <input type="number" id="deposit-amount" name="amount" step="0.01" min="0.01" placeholder="0,00" required />
          </div>
          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: var(--spacing-md);">
            <span class="material-symbols-rounded">arrow_downward</span>
            Confirmar Depósito
          </button>
        </form>
      `, (data) => {
        const amount = parseFloat(data.amount);
        updateBankAccount(account.id, { balance: account.balance + amount });
        addTransaction({
          description: `${data.description} - ${account.bankName}`,
          category: 'Renda',
          type: 'income',
          amount: amount,
          date: new Date().toISOString().split('T')[0],
          icon: 'account_balance',
        });
        window.location.hash = 'contas';
      });
    });
  });

  // Withdraw
  document.querySelectorAll('.btn-withdraw').forEach(btn => {
    btn.addEventListener('click', () => {
      const account = getBankAccounts().find(a => a.id === btn.dataset.id);
      if (!account) return;

      openModal('Registrar Saque / Saída', `
        <form id="form-withdraw" class="modal-form">
          <p style="margin-bottom: var(--spacing-lg);">Conta: <strong>${account.bankName} - ${account.accountType}</strong><br>Saldo atual: <strong class="text-success">${formatCurrency(account.balance)}</strong></p>
          <div class="form-group">
            <label for="withdraw-desc">Descrição</label>
            <input type="text" id="withdraw-desc" name="description" placeholder="Ex: Pagamento de conta, PIX enviado..." required />
          </div>
          <div class="form-group">
            <label for="withdraw-amount">Valor (R$)</label>
            <input type="number" id="withdraw-amount" name="amount" step="0.01" min="0.01" placeholder="0,00" required />
          </div>
          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: var(--spacing-md);">
            <span class="material-symbols-rounded">arrow_upward</span>
            Confirmar Saque
          </button>
        </form>
      `, (data) => {
        const amount = parseFloat(data.amount);
        updateBankAccount(account.id, { balance: account.balance - amount });
        addTransaction({
          description: `${data.description} - ${account.bankName}`,
          category: 'Outros',
          type: 'expense',
          amount: amount,
          date: new Date().toISOString().split('T')[0],
          icon: 'account_balance',
        });
        window.location.hash = 'contas';
      });
    });
  });
}
