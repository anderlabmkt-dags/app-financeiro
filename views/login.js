import { setAuthenticated, validateCredentials, getCredentials } from '../store.js';

export function renderLogin() {
  return `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; width: 100%;">
      <div class="card" style="width: 100%; max-width: 400px; padding: var(--spacing-2xl);">
        <div style="text-align: center; margin-bottom: var(--spacing-xl);">
          <div class="flex items-center justify-center gap-sm" style="margin-bottom: var(--spacing-md);">
            <span class="material-symbols-rounded" style="font-size: 40px; color: var(--color-primary);">account_balance</span>
            <h1 style="color: var(--color-primary); font-size: 28px;">Finanças<span style="font-weight: 400;">Pro</span></h1>
          </div>
          <p class="text-muted">Faça login para acessar seu painel.</p>
        </div>
        
        <form id="form-login" class="modal-form">
          <div class="form-group">
            <label for="login-user">Usuário / E-mail</label>
            <input type="text" id="login-user" name="username" placeholder="Digite seu usuário" required autofocus />
          </div>
          <div class="form-group" style="margin-bottom: var(--spacing-md);">
            <label for="login-pass">Senha</label>
            <input type="password" id="login-pass" name="password" placeholder="Digite sua senha" required />
          </div>
          
          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 14px;">
            Entrar
            <span class="material-symbols-rounded" style="font-size: 20px;">login</span>
          </button>
        </form>
        <div id="login-error" class="text-error" style="display: none; text-align: center; margin-top: var(--spacing-md); font-size: 14px; font-weight: 600;">
          Usuário ou senha inválidos.
        </div>
        <p class="text-muted" style="text-align: center; margin-top: var(--spacing-lg); font-size: 13px;">
          Dica: O acesso padrão é <strong>${getCredentials().username}</strong> / <strong>${getCredentials().password}</strong>.
        </p>
      </div>
    </div>
  `;
}

export function initLogin() {
  document.getElementById('form-login')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    
    if (validateCredentials(user, pass)) {
      setAuthenticated(true);
      window.location.hash = 'dashboard';
    } else {
      const err = document.getElementById('login-error');
      if(err) err.style.display = 'block';
    }
  });
}
