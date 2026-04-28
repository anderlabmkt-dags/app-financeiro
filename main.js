import './style.css'
import { renderDashboard, initDashboard } from './views/dashboard.js'
import { renderCartoes, initCartoes } from './views/cartoes.js'
import { renderDividas, initDividas } from './views/dividas.js'

const mainContent = document.getElementById('main-content');
const navLinks = document.querySelectorAll('.nav-link');

const routes = {
  dashboard: { render: renderDashboard, init: initDashboard },
  cartoes: { render: renderCartoes, init: initCartoes },
  dividas: { render: renderDividas, init: initDividas },
  // Fallback for views not yet implemented
  default: { 
    render: (title) => `<h2>${title}</h2><p class="text-muted">Em breve...</p>`, 
    init: () => {} 
  }
};

function navigate(routeId) {
  // Update UI
  navLinks.forEach(link => {
    if (link.dataset.view === routeId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Render Content
  const route = routes[routeId] || routes.default;
  mainContent.innerHTML = typeof route.render === 'function' ? route.render() : route.render(routeId);
  
  // Initialize Logic (like charts)
  if (route.init) route.init();

  // Update URL Hash
  window.location.hash = routeId;
}

// Handle navigation clicks
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const routeId = link.dataset.view;
    navigate(routeId);
  });
});

// Handle initial load and back/forward
window.addEventListener('load', () => {
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  navigate(hash);
});

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  navigate(hash);
});

console.log('Router FinançasPro inicializado!');
