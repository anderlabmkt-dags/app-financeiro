/**
 * store.js - Gerenciamento de dados centralizado
 * Usa localStorage como fonte primária + sync com Supabase
 */

const STORAGE_KEYS = {
  transactions: 'fp_transactions',
  cards: 'fp_cards',
  debts: 'fp_debts',
  bankAccounts: 'fp_bank_accounts',
  settings: 'fp_settings',
};

// ---------- Undo System ----------
const undoStack = [];
const MAX_UNDO = 30;

function pushToUndoStack() {
  const snapshot = {};
  Object.values(STORAGE_KEYS).forEach(key => {
    snapshot[key] = localStorage.getItem(key);
  });
  undoStack.push(snapshot);
  if (undoStack.length > MAX_UNDO) undoStack.shift();
}

export function undo() {
  if (undoStack.length === 0) return false;
  const snapshot = undoStack.pop();
  Object.entries(snapshot).forEach(([key, value]) => {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  });
  window.dispatchEvent(new CustomEvent('store-updated', { detail: { key: 'all' } }));
  return true;
}


// ---------- Auth ----------
export function isAuthenticated() {
  return localStorage.getItem('fp_auth') === 'true';
}

export function setAuthenticated(value) {
  localStorage.setItem('fp_auth', value ? 'true' : 'false');
}

export function getCredentials() {
  const creds = localStorage.getItem('fp_credentials');
  if (creds) {
    return JSON.parse(creds);
  }
  // Default inicial
  return { username: 'admin', password: '123' };
}

export function updateCredentials(username, password) {
  localStorage.setItem('fp_credentials', JSON.stringify({ username, password }));
}

export function validateCredentials(username, password) {
  const creds = getCredentials();
  return creds.username === username && creds.password === password;
}

// ---------- Dados padrão ----------
function defaultTransactions() {
  const today = new Date();
  const fmt = (d) => d.toISOString().split('T')[0];
  const daysAgo = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d;
  };

  return [
    { id: crypto.randomUUID(), description: 'Supermercado Pão de Açúcar', category: 'Alimentação', type: 'expense', amount: 450, date: fmt(today), icon: 'shopping_cart' },
    { id: crypto.randomUUID(), description: 'Salário Mensal - TechCorp', category: 'Salário', type: 'income', amount: 6500, date: fmt(daysAgo(1)), icon: 'payments' },
    { id: crypto.randomUUID(), description: 'Uber - Corrida', category: 'Transporte', type: 'expense', amount: 32.50, date: fmt(daysAgo(1)), icon: 'directions_car' },
    { id: crypto.randomUUID(), description: 'Freelance Design', category: 'Freela - Design', type: 'income', amount: 1750, date: fmt(daysAgo(2)), icon: 'palette' },
    { id: crypto.randomUUID(), description: 'Netflix', category: 'Entretenimento', type: 'expense', amount: 55.90, date: fmt(daysAgo(3)), icon: 'movie' },
    { id: crypto.randomUUID(), description: 'iFood - Almoço', category: 'Alimentação', type: 'expense', amount: 89, date: fmt(daysAgo(3)), icon: 'restaurant' },
    { id: crypto.randomUUID(), description: 'Farmácia Raia', category: 'Saúde', type: 'expense', amount: 124, date: fmt(daysAgo(4)), icon: 'local_pharmacy' },
    { id: crypto.randomUUID(), description: 'Posto Shell', category: 'Transporte', type: 'expense', amount: 280, date: fmt(daysAgo(5)), icon: 'local_gas_station' },
    { id: crypto.randomUUID(), description: 'Amazon - Livro', category: 'Educação', type: 'expense', amount: 67, date: fmt(daysAgo(6)), icon: 'menu_book' },
    { id: crypto.randomUUID(), description: 'Conta de Luz', category: 'Moradia', type: 'expense', amount: 210, date: fmt(daysAgo(7)), icon: 'bolt' },
  ];
}

function defaultCards() {
  return [
    {
      id: crypto.randomUUID(),
      name: 'Nubank Black',
      holder: 'DIEGO RODRIGUES',
      lastDigits: '8842',
      brand: 'Mastercard',
      expiry: '12/28',
      limit: 20000,
      invoice: 1250,
      dueDate: '2026-05-15',
      color: 'linear-gradient(135deg, #1a1c1e 0%, #2f3033 100%)',
    },
    {
      id: crypto.randomUUID(),
      name: 'Inter Infinity',
      holder: 'DIEGO RODRIGUES',
      lastDigits: '1159',
      brand: 'Visa',
      expiry: '08/26',
      limit: 8000,
      invoice: 840,
      dueDate: '2026-05-10',
      color: 'linear-gradient(135deg, #2e4ed2 0%, #4b69ec 100%)',
    },
  ];
}

function defaultBankAccounts() {
  return [
    {
      id: crypto.randomUUID(),
      bankName: 'Nubank',
      accountType: 'Conta Corrente',
      agency: '0001',
      accountNumber: '123456-7',
      holder: 'DIEGO RODRIGUES',
      balance: 4250.80,
      color: 'linear-gradient(135deg, #7B1FA2 0%, #AB47BC 100%)',
      imageUrl: '',
      icon: 'account_balance',
    },
    {
      id: crypto.randomUUID(),
      bankName: 'Inter',
      accountType: 'Conta Corrente',
      agency: '0001',
      accountNumber: '987654-3',
      holder: 'DIEGO RODRIGUES',
      balance: 12780.50,
      color: 'linear-gradient(135deg, #E65100 0%, #FF8F00 100%)',
      imageUrl: '',
      icon: 'account_balance',
    },
    {
      id: crypto.randomUUID(),
      bankName: 'Bradesco',
      accountType: 'Poupança',
      agency: '3456',
      accountNumber: '654321-0',
      holder: 'DIEGO RODRIGUES',
      balance: 8500.00,
      color: 'linear-gradient(135deg, #C62828 0%, #E53935 100%)',
      imageUrl: '',
      icon: 'savings',
    },
  ];
}

function defaultDebts() {
  return [
    {
      id: crypto.randomUUID(),
      name: 'Empréstimo Carro - Itaú',
      type: 'Financiamento',
      totalAmount: 60000,
      paidInstallments: 24,
      totalInstallments: 48,
      monthlyPayment: 1250,
      interestRate: 1.2,
      status: 'Em dia',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    },
    {
      id: crypto.randomUUID(),
      name: 'Fatura Santander - Parcelamento',
      type: 'Cartão de Crédito',
      totalAmount: 3400,
      paidInstallments: 2,
      totalInstallments: 10,
      monthlyPayment: 340,
      interestRate: 4.5,
      status: 'Em dia',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1).toISOString().split('T')[0],
    },
  ];
}

function defaultSettings() {
  return {
    monthlyLimit: 5000,
    userName: 'Diego',
    walletBalance: 0,
  };
}

// ---------- CRUD helpers ----------
function load(key, defaultFn) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  const data = defaultFn();
  localStorage.setItem(key, JSON.stringify(data));
  return data;
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('store-updated', { detail: { key } }));
}

// ---------- Transactions ----------
export function getTransactions() {
  return load(STORAGE_KEYS.transactions, defaultTransactions);
}

export function addTransaction(tx) {
  pushToUndoStack();
  const txs = getTransactions();
  tx.id = tx.id || crypto.randomUUID();
  txs.unshift(tx);
  save(STORAGE_KEYS.transactions, txs);
  return tx;
}

export function deleteTransaction(id) {
  pushToUndoStack();
  const allTxs = getTransactions();
  const tx = allTxs.find(t => t.id === id);

  // Reverter impacto no cartão ou conta bancária
  if (tx && tx.type === 'expense' && tx.paymentSourceId) {
    if (tx.paymentMethod === 'credit_card') {
      const cards = getCards();
      const card = cards.find(c => c.id === tx.paymentSourceId);
      if (card) {
        let updateData = { invoice: Math.max((card.invoice || 0) - tx.amount, 0) };
        if (tx.date) {
          const [y, mStr] = tx.date.split('-');
          const key = `${y}-${mStr}`;
          if (card.invoices) {
             let newInvoices = { ...card.invoices };
             newInvoices[key] = Math.max((newInvoices[key] || 0) - tx.amount, 0);
             updateData.invoices = newInvoices;
             const currentM = new Date().getMonth();
             const currentY = new Date().getFullYear();
             const currentKey = `${currentY}-${String(currentM + 1).padStart(2, '0')}`;
             if (key === currentKey) {
                updateData.invoice = newInvoices[key];
             }
          }
        }
        updateCard(card.id, updateData);
      }
    } else if (tx.paymentMethod === 'debit') {
      const accounts = getBankAccounts();
      const account = accounts.find(a => a.id === tx.paymentSourceId);
      if (account) {
        updateBankAccount(account.id, { balance: account.balance + tx.amount });
      }
    } else if (tx.paymentMethod === 'cash') {
      const settings = getSettings();
      updateSettings({ walletBalance: (settings.walletBalance || 0) + tx.amount });
    }
  }

  const txs = allTxs.filter(t => t.id !== id);
  save(STORAGE_KEYS.transactions, txs);
}

// ---------- Cards ----------
export function getCards() {
  return load(STORAGE_KEYS.cards, defaultCards);
}

export function addCard(card) {
  pushToUndoStack();
  const cards = getCards();
  card.id = card.id || crypto.randomUUID();
  cards.push(card);
  save(STORAGE_KEYS.cards, cards);
  return card;
}

export function updateCard(id, updates) {
  pushToUndoStack();
  const cards = getCards().map(c => c.id === id ? { ...c, ...updates } : c);
  save(STORAGE_KEYS.cards, cards);
}

export function deleteCard(id) {
  pushToUndoStack();
  const cards = getCards().filter(c => c.id !== id);
  save(STORAGE_KEYS.cards, cards);
}

// ---------- Bank Accounts ----------
export function getBankAccounts() {
  return load(STORAGE_KEYS.bankAccounts, defaultBankAccounts);
}

export function addBankAccount(account) {
  pushToUndoStack();
  const accounts = getBankAccounts();
  account.id = account.id || crypto.randomUUID();
  accounts.push(account);
  save(STORAGE_KEYS.bankAccounts, accounts);
  return account;
}

export function updateBankAccount(id, updates) {
  pushToUndoStack();
  const accounts = getBankAccounts().map(a => a.id === id ? { ...a, ...updates } : a);
  save(STORAGE_KEYS.bankAccounts, accounts);
}

export function deleteBankAccount(id) {
  pushToUndoStack();
  const accounts = getBankAccounts().filter(a => a.id !== id);
  save(STORAGE_KEYS.bankAccounts, accounts);
}

export function getTotalBankBalance() {
  const bankSum = getBankAccounts().reduce((sum, a) => sum + a.balance, 0);
  const walletSum = getSettings().walletBalance || 0;
  return bankSum + walletSum;
}

export function getMonthKey(m, y) {
  return `${y}-${String(m + 1).padStart(2, '0')}`;
}

export function getTotalAccumulatedInvoice(card) {
  let cardTotal = 0;
  if (card.invoices) {
    Object.entries(card.invoices).forEach(([key, val]) => {
      if (val > 0) cardTotal += val;
    });
  } else {
    cardTotal = card.invoice || 0;
  }
  return cardTotal;
}

/**
 * Retorna o valor da fatura para um mês específico, 
 * incluindo valores não pagos de meses anteriores.
 */
export function getCardInvoiceForMonth(card, m, y) {
  const targetKey = getMonthKey(m, y);
  let total = 0;
  
  if (card.invoices) {
    Object.entries(card.invoices).forEach(([key, val]) => {
      if (key <= targetKey && val > 0) {
        total += val;
      }
    });
  } else {
    const currentM = new Date().getMonth();
    const currentY = new Date().getFullYear();
    const currentKey = getMonthKey(currentM, currentY);
    if (targetKey === currentKey) total = card.invoice || 0;
    else if (targetKey > currentKey) total = 0;
    else if (card.invoice > 0) total = card.invoice;
  }
  return total;
}

/**
 * Registra o pagamento de uma fatura, distribuindo o valor
 * começando pelas faturas mais antigas pendentes.
 */
export function payCardInvoice(cardId, amount) {
  const cards = getCards();
  const card = cards.find(c => c.id === cardId);
  if (!card) return;

  let remainingPayment = amount;
  let newInvoices = card.invoices ? { ...card.invoices } : {};
  
  if (!card.invoices) {
    const currentKey = getMonthKey(new Date().getMonth(), new Date().getFullYear());
    newInvoices[currentKey] = card.invoice || 0;
  }

  const keys = Object.keys(newInvoices).sort();

  for (const key of keys) {
    if (remainingPayment <= 0) break;
    const invoiceAmount = newInvoices[key] || 0;
    if (invoiceAmount <= 0) continue;

    const paymentToThisMonth = Math.min(remainingPayment, invoiceAmount);
    newInvoices[key] -= paymentToThisMonth;
    remainingPayment -= paymentToThisMonth;
  }

  const currentKey = getMonthKey(new Date().getMonth(), new Date().getFullYear());
  updateCard(cardId, { 
    invoices: newInvoices,
    invoice: newInvoices[currentKey] || 0
  });
}

/**
 * Calcula quantas parcelas de uma dívida estão "devidas" até um mês alvo,
 * considerando o que já foi pago.
 */
export function getDebtInstallmentsDue(debt, targetM, targetY) {
  if (!debt.startDate || debt.paidInstallments >= debt.totalInstallments) {
    return 0;
  }

  const start = new Date(debt.startDate + 'T12:00:00');
  const target = new Date(targetY, targetM, 1);
  const diffMonths = (target.getFullYear() - start.getFullYear()) * 12 + (target.getMonth() - start.getMonth());
  
  if (diffMonths < 0) return 0;

  const expectedPaidUntilNow = Math.min(diffMonths + 1, debt.totalInstallments);
  const pending = Math.max(0, expectedPaidUntilNow - debt.paidInstallments);
  
  return pending;
}


// ---------- Debts ----------
export function getDebts() {
  return load(STORAGE_KEYS.debts, defaultDebts);
}

export function addDebt(debt) {
  pushToUndoStack();
  const debts = getDebts();
  debt.id = debt.id || crypto.randomUUID();
  debts.push(debt);
  save(STORAGE_KEYS.debts, debts);
  return debt;
}

export function updateDebt(id, updates) {
  pushToUndoStack();
  const debts = getDebts().map(d => d.id === id ? { ...d, ...updates } : d);
  save(STORAGE_KEYS.debts, debts);
}

export function deleteDebt(id) {
  pushToUndoStack();
  const debts = getDebts().filter(d => d.id !== id);
  save(STORAGE_KEYS.debts, debts);
}

// ---------- Settings ----------
export function getSettings() {
  return load(STORAGE_KEYS.settings, defaultSettings);
}

export function updateSettings(updates) {
  pushToUndoStack();
  const settings = { ...getSettings(), ...updates };
  save(STORAGE_KEYS.settings, settings);
  return settings;
}

// ---------- Computed helpers ----------
export function getMonthlyIncome(month = new Date().getMonth(), year = new Date().getFullYear()) {
  return getTransactions()
    .filter(t => {
      const d = new Date(t.date + 'T12:00:00'); // Prevent timezone shift
      if (month === 'all') {
        return t.type === 'income' && !t.ignoreOnDashboard && d.getFullYear() === parseInt(year);
      }
      return t.type === 'income' && !t.ignoreOnDashboard && d.getMonth() === parseInt(month) && d.getFullYear() === parseInt(year);
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getMonthlyExpenses(month = new Date().getMonth(), year = new Date().getFullYear()) {
  return getTransactions()
    .filter(t => {
      const d = new Date(t.date + 'T12:00:00');
      if (month === 'all') {
        return t.type === 'expense' && !t.ignoreOnDashboard && d.getFullYear() === parseInt(year);
      }
      return t.type === 'expense' && !t.ignoreOnDashboard && d.getMonth() === parseInt(month) && d.getFullYear() === parseInt(year);
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getBalance(month = new Date().getMonth(), year = new Date().getFullYear()) {
  return getMonthlyIncome(month, year) - getMonthlyExpenses(month, year);
}

export function getWeeklyExpenses() {
  const today = new Date();
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const txs = getTransactions().filter(t => t.type === 'expense' && !t.ignoreOnDashboard);
  
  const getDayExpenses = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return txs.filter(t => t.date === dateStr).reduce((s, t) => s + t.amount, 0);
  };
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const labels = [];
  const result = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    labels.push(days[d.getDay()]);
    result.push(getDayExpenses(d));
  }
  
  return { labels, data: result };
}

// ---------- Formatters ----------
export function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Hoje';
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

// ---------- Category icons ----------
export const CATEGORY_STRUCTURE = {
  expense: [
    {
      id: 'moradia',
      name: 'Moradia',
      icon: 'home',
      keywords: ['casa', 'apartamento'],
      subcategories: [
        { name: 'Aluguel', keywords: ['aluguel', 'locacao'] },
        { name: 'Financiamento', keywords: ['financiamento', 'parcela casa'] },
        { name: 'Condomínio', keywords: ['condominio', 'sindico'] },
        { name: 'IPTU', keywords: ['iptu', 'imposto'] },
        { name: 'Manutenção da casa', keywords: ['manutencao', 'reparo', 'conserto', 'material de construcao'] }
      ]
    },
    {
      id: 'alimentacao',
      name: 'Alimentação',
      icon: 'restaurant',
      keywords: ['comida', 'alimentacao'],
      subcategories: [
        { name: 'Supermercado', keywords: ['mercado', 'supermercado', 'atacadao', 'carrefour', 'pao de acucar'] },
        { name: 'Feira', keywords: ['feira', 'hortifruti', 'sacolao'] },
        { name: 'Restaurante', keywords: ['restaurante', 'almoco', 'jantar'] },
        { name: 'Delivery', keywords: ['ifood', 'rappi', 'delivery', 'pizza', 'hamburguer'] },
        { name: 'Padaria / Café', keywords: ['padaria', 'cafe', 'pao', 'starbucks'] }
      ]
    },
    {
      id: 'transporte',
      name: 'Transporte',
      icon: 'directions_car',
      keywords: ['transporte', 'carro', 'moto'],
      subcategories: [
        { name: 'Gasolina', keywords: ['posto', 'gasolina', 'combustivel', 'etanol', 'shell', 'ipiranga'] },
        { name: 'Uber / 99', keywords: ['uber', '99', 'cabify', 'taxi'] },
        { name: 'Transporte público', keywords: ['onibus', 'metro', 'cptm', 'trem', 'bilhete unico'] },
        { name: 'Manutenção do veículo', keywords: ['oficina', 'mecanico', 'pneu', 'oleo'] },
        { name: 'Estacionamento', keywords: ['estacionamento', 'zona azul', 'valet'] }
      ]
    },
    {
      id: 'contas',
      name: 'Contas',
      icon: 'receipt_long',
      keywords: ['boleto', 'conta'],
      subcategories: [
        { name: 'Energia', keywords: ['luz', 'energia', 'enel', 'cpfl', 'copel'] },
        { name: 'Água', keywords: ['agua', 'sabesp', 'sanepar', 'copasa'] },
        { name: 'Internet', keywords: ['internet', 'vivo', 'claro', 'tim', 'oi', 'fibra'] },
        { name: 'Celular', keywords: ['celular', 'plano', 'recarga', 'vivo', 'claro', 'tim'] },
        { name: 'Gás', keywords: ['gas', 'comgas', 'botijao'] }
      ]
    },
    {
      id: 'saude',
      name: 'Saúde',
      icon: 'local_pharmacy',
      keywords: ['saude', 'medico', 'hospital'],
      subcategories: [
        { name: 'Farmácia', keywords: ['farmacia', 'remedio', 'droga raia', 'drogasil', 'pague menos'] },
        { name: 'Plano de saúde', keywords: ['plano de saude', 'amil', 'bradesco saude', 'unimed', 'sulamerica'] },
        { name: 'Consultas', keywords: ['consulta', 'dentista', 'psicologo', 'terapia'] },
        { name: 'Exames', keywords: ['exame', 'laboratorio', 'fleury', 'delboni'] }
      ]
    },
    {
      id: 'educacao',
      name: 'Educação',
      icon: 'menu_book',
      keywords: ['estudo', 'escola'],
      subcategories: [
        { name: 'Faculdade', keywords: ['faculdade', 'universidade', 'mensalidade'] },
        { name: 'Cursos', keywords: ['curso', 'alura', 'udemy', 'ingles'] },
        { name: 'Livros', keywords: ['livro', 'amazon', 'livraria'] }
      ]
    },
    {
      id: 'lazer',
      name: 'Lazer',
      icon: 'sports_esports',
      keywords: ['diversao'],
      subcategories: [
        { name: 'Cinema', keywords: ['cinema', 'cinemark', 'ingresso'] },
        { name: 'Bares / Restaurantes', keywords: ['bar', 'boteco', 'chopp', 'cerveja'] },
        { name: 'Viagens', keywords: ['viagem', 'passagem', 'hotel', 'airbnb', 'voo'] },
        { name: 'Eventos', keywords: ['show', 'festa', 'balada', 'teatro', 'sympla'] }
      ]
    },
    {
      id: 'compras',
      name: 'Compras',
      icon: 'shopping_bag',
      keywords: ['compra', 'loja'],
      subcategories: [
        { name: 'Roupas', keywords: ['roupa', 'camisa', 'calca', 'sapato', 'tenis', 'renner', 'zara', 'cea'] },
        { name: 'Eletrônicos', keywords: ['eletronico', 'celular', 'computador', 'kabum', 'pichau'] },
        { name: 'Beleza / cuidados pessoais', keywords: ['beleza', 'cabelo', 'barbearia', 'salao', 'cosmetico', 'perfume'] },
        { name: 'Compras online', keywords: ['mercado livre', 'shopee', 'aliexpress', 'amazon', 'shein'] }
      ]
    },
    {
      id: 'financeiro',
      name: 'Financeiro',
      icon: 'account_balance',
      keywords: ['banco', 'taxa'],
      subcategories: [
        { name: 'Fatura do cartão', keywords: ['fatura', 'cartao de credito', 'nubank', 'inter'] },
        { name: 'Empréstimos', keywords: ['emprestimo', 'parcela'] },
        { name: 'Juros / taxas', keywords: ['juros', 'taxa', 'tarifa', 'iof'] },
        { name: 'Investimentos', keywords: ['investimento', 'tesouro', 'acao', 'fii', 'cdb', 'corretora'] }
      ]
    },
    {
      id: 'assinaturas',
      name: 'Assinaturas',
      icon: 'subscriptions',
      keywords: ['assinatura', 'mensalidade'],
      subcategories: [
        { name: 'Streaming', keywords: ['netflix', 'spotify', 'amazon prime', 'disney', 'max', 'hbo'] },
        { name: 'Apps / softwares', keywords: ['app', 'software', 'adobe', 'microsoft', 'google one', 'icloud'] },
        { name: 'Serviços recorrentes', keywords: ['academia', 'smartfit', 'clube'] }
      ]
    },
    {
      id: 'outros',
      name: 'Outros',
      icon: 'more_horiz',
      keywords: [],
      subcategories: [
        { name: 'Presentes', keywords: ['presente', 'aniversario', 'casamento'] },
        { name: 'Doações', keywords: ['doacao', 'ong', 'caridade'] },
        { name: 'Gastos inesperados', keywords: ['imprevisto', 'multa'] },
        { name: 'Outros', keywords: [] }
      ]
    }
  ],
  income: [
    {
      id: 'renda',
      name: 'Renda',
      icon: 'work',
      keywords: ['recebimento'],
      subcategories: [
        { name: 'Salário', keywords: ['salario', 'pagamento', 'adiantamento'] },
        { name: 'Freela - Site', keywords: ['site'] },
        { name: 'Freela - GMN', keywords: ['gmn'] },
        { name: 'Freelancer - GT', keywords: ['gt'] },
        { name: 'Freela - Design', keywords: ['design'] },
        { name: 'Freela - Social Media', keywords: ['social media'] },
        { name: 'Freela - CRM', keywords: ['crm'] },
        { name: 'Freelancer', keywords: ['freela'] },
        { name: 'Empréstimo', keywords: ['emprestimo'] },
        { name: 'Rendimentos', keywords: ['rendimento', 'dividendo', 'juros'] },
        { name: 'Cashback', keywords: ['cashback', 'meliuz'] },
        { name: 'Outros', keywords: [] }
      ]
    }
  ]
};

export function autoCategorize(description, type = 'expense') {
  const desc = description.toLowerCase();
  const categories = CATEGORY_STRUCTURE[type] || [];
  
  for (const cat of categories) {
    for (const sub of cat.subcategories) {
      if (sub.keywords && sub.keywords.some(kw => desc.includes(kw))) {
        return { category: `${cat.name} > ${sub.name}`, icon: cat.icon };
      }
    }
    if (cat.keywords && cat.keywords.some(kw => desc.includes(kw))) {
      return { category: `${cat.name} > ${cat.subcategories[0].name}`, icon: cat.icon };
    }
  }
  return null;
}

export function getIconForCategory(categoryName) {
  const mainName = categoryName.split(' > ')[0];
  
  for (const type of ['expense', 'income']) {
    const found = CATEGORY_STRUCTURE[type].find(c => c.name === mainName || c.name === categoryName);
    if (found) return found.icon;
    
    for (const cat of CATEGORY_STRUCTURE[type]) {
      if (cat.subcategories.some(s => s.name === categoryName)) {
        return cat.icon;
      }
    }
  }
  
  const legacyIcons = {
    'Entretenimento': 'movie',
    'Salário': 'payments',
    'Freela - Site': 'web',
    'Freela - GMN': 'work_outline',
    'Freelancer - GT': 'work_history',
    'Freela - Design': 'palette',
    'Freela - Social Media': 'thumb_up',
    'Freela - CRM': 'support_agent',
    'Freelancer': 'laptop_mac',
    'Empréstimo': 'account_balance',
    'Rendimentos': 'trending_up',
    'Cashback': 'savings',
    'Outros': 'more_horiz',
  };
  return legacyIcons[categoryName] || 'receipt';
}

export const CATEGORY_ICONS = {};
export const CATEGORIES = [];

CATEGORY_STRUCTURE.expense.concat(CATEGORY_STRUCTURE.income).forEach(cat => {
  CATEGORY_ICONS[cat.name] = cat.icon;
  CATEGORIES.push(cat.name);
  cat.subcategories.forEach(sub => {
    CATEGORY_ICONS[sub.name] = cat.icon;
    CATEGORY_ICONS[`${cat.name} > ${sub.name}`] = cat.icon;
    CATEGORIES.push(`${cat.name} > ${sub.name}`);
  });
});

export const CARD_COLORS = [
  'linear-gradient(135deg, #1a1c1e 0%, #2f3033 100%)',
  'linear-gradient(135deg, #2e4ed2 0%, #4b69ec 100%)',
  'linear-gradient(135deg, #4c7391 0%, #335a77 100%)',
  'linear-gradient(135deg, #6b21a8 0%, #9333ea 100%)',
  'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
  'linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)',
];

export const BANK_COLORS = [
  'linear-gradient(135deg, #7B1FA2 0%, #AB47BC 100%)',
  'linear-gradient(135deg, #E65100 0%, #FF8F00 100%)',
  'linear-gradient(135deg, #C62828 0%, #E53935 100%)',
  'linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)',
  'linear-gradient(135deg, #1a1c1e 0%, #2f3033 100%)',
  'linear-gradient(135deg, #00695C 0%, #26A69A 100%)',
  'linear-gradient(135deg, #F9A825 0%, #FFD54F 100%)',
  'linear-gradient(135deg, #283593 0%, #5C6BC0 100%)',
];
