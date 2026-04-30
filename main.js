import './style.css'
import { renderDashboard, initDashboard } from './views/dashboard.js'
import { renderCartoes, initCartoes } from './views/cartoes.js'
import { renderContas, initContas } from './views/contas.js'
import { renderDividas, initDividas } from './views/dividas.js'
import { renderLogin, initLogin } from './views/login.js'
import { isAuthenticated, setAuthenticated } from './store.js'

const mainContent = document.getElementById('main-content');
const navLinks = document.querySelectorAll('.nav-link');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');

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
