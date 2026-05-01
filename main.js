import './style.css'
import { renderDashboard, initDashboard } from './views/dashboard.js'
import { renderCartoes, initCartoes } from './views/cartoes.js'
import { renderContas, initContas } from './views/contas.js'
import { renderDividas, initDividas } from './views/dividas.js'
import { renderLogin, initLogin } from './views/login.js'
import { isAuthenticated, setAuthenticated, getCredentials, updateCredentials, undo } from './store.js'
import { openModal } from './modal.js'

const mainContent = document.getElementById('main-content');
const navLinks = document.querySelectorAll('.nav-link');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const toastContainer = document.getElementById('toast-container');

// ---------- Toast System ----------
export function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type} flex items-center gap-sm`;
  
  const icons = {
    info: 'info',
    success: 'check_circle',
    error: 'error',
    undo: 'undo'
  };

  toast.innerHTML = `
    <span class="material-symbols-rounded" style="font-size: 20px;">${icons[type] || 'info'}</span>
    <span>${message}</span>
  `;
  
  toastContainer?.appendChild(toast);
  
  // Fade in
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Remove after 3s
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ---------- Keyboard Shortcuts (Undo) ----------
document.addEventListener('keydown', (e) => {
  // Ctrl+Z or Cmd+Z
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    const success = undo();
    if (success) {
      showToast('Ação desfeita com sucesso!', 'undo');
    } else {
      showToast('Nada para desfazer', 'info');
    }
  }
});

const routes = {
  dashboard: { render: renderDashboard, init: initDashboard },
  cartoes: { render: renderCartoes, init: initCartoes },
  contas: { render: renderContas, init: initContas },
  dividas: { render: renderDividas, init: initDividas },
  login: { render: renderLogin, init: initLogin },
  default: { 
    render: (title) => `<h2>${title}</h2><p class="text-muted">Em breve...</p>`, 
    init: () => {} 
  }
};

function navigate(routeId) {
  if (!isAuthenticated() && routeId !== 'login') {
    window.location.hash = 'login';
    return;
  }

  if (isAuthenticated() && routeId === 'login') {
    window.location.hash = 'dashboard';
    return;
  }

  // Handle layout for login screen
  if (routeId === 'login') {
    sidebar.style.display = 'none';
    sidebarToggle.style.display = 'none';
    document.getElementById('app').style.gridTemplateColumns = '1fr';
  } else {
    sidebar.style.display = 'flex';
    sidebarToggle.style.display = 'flex';
    document.getElementById('app').style.gridTemplateColumns = '';
  }

  // Update sidebar active state
  navLinks.forEach(link => {
    if (link.dataset.view === routeId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Render content
  const route = routes[routeId] || routes.default;
  mainContent.innerHTML = typeof route.render === 'function' ? route.render() : route.render(routeId);
  
  // Initialize view logic (charts, events, etc.)
  if (route.init) route.init();

  // Close mobile sidebar
  sidebar?.classList.remove('open');

  // Scroll to top
  mainContent.scrollTo({ top: 0, behavior: 'smooth' });

  // Update URL hash without triggering hashchange
  if (window.location.hash !== '#' + routeId) {
    history.replaceState(null, '', '#' + routeId);
  }
}

// Navigation click handlers
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const routeId = link.dataset.view;
    navigate(routeId);
  });
});

// Mobile sidebar toggle
sidebarToggle?.addEventListener('click', () => {
  sidebar?.classList.toggle('open');
});

// Logout handler
document.getElementById('btn-logout')?.addEventListener('click', () => {
  setAuthenticated(false);
  window.location.hash = 'login';
});

// Change Access handler
document.getElementById('btn-change-access')?.addEventListener('click', () => {
  const creds = getCredentials();
  
  openModal('Configurações de Acesso', `
    <form id="form-change-access" class="modal-form">
      <div class="form-group">
        <label for="new-username">Novo Usuário / E-mail</label>
        <input type="text" id="new-username" name="username" value="${creds.username}" required />
      </div>
      <div class="form-group">
        <label for="new-password">Nova Senha</label>
        <input type="password" id="new-password" name="password" value="${creds.password}" required />
      </div>
      <p class="text-muted" style="font-size: 12px; margin-top: var(--spacing-sm);">
        Atenção: Ao salvar, você precisará usar estas novas credenciais no próximo login.
      </p>
      <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: var(--spacing-md);">
        <span class="material-symbols-rounded">save</span>
        Salvar Novas Credenciais
      </button>
    </form>
  `, (data) => {
    updateCredentials(data.username, data.password);
    alert('Credenciais atualizadas com sucesso!');
  });
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 900 && sidebar?.classList.contains('open')) {
    if (!sidebar.contains(e.target) && e.target !== sidebarToggle && !sidebarToggle?.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  }
});

// Initial load
window.addEventListener('load', () => {
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  navigate(hash);
});

// Hash change (browser back/forward)
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  navigate(hash);
});

// Auto-refresh on data change
window.addEventListener('store-updated', () => {
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  navigate(hash);
});

console.log('🚀 FinançasPro inicializado!');
