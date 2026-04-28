/**
 * modal.js - Sistema de modal reutilizável
 */

let activeModal = null;

export function openModal(title, contentHTML, onSubmit = null) {
  closeModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-container">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close" aria-label="Fechar">
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>
      <div class="modal-body">
        ${contentHTML}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  activeModal = overlay;

  // Animate in
  requestAnimationFrame(() => overlay.classList.add('active'));

  // Close on X
  overlay.querySelector('.modal-close').addEventListener('click', closeModal);

  // Close on backdrop
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Close on Escape
  const escHandler = (e) => {
    if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escHandler); }
  };
  document.addEventListener('keydown', escHandler);

  // Form submit
  if (onSubmit) {
    const form = overlay.querySelector('form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        onSubmit(data);
        closeModal();
      });
    }
  }

  return overlay;
}

export function closeModal() {
  if (activeModal) {
    activeModal.classList.remove('active');
    setTimeout(() => {
      activeModal?.remove();
      activeModal = null;
    }, 250);
  }
}

export function confirmDialog(title, message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-container" style="max-width: 420px;">
        <div class="modal-header">
          <h3>${title}</h3>
        </div>
        <div class="modal-body">
          <p style="margin-bottom: var(--spacing-lg); color: var(--color-on-surface-variant);">${message}</p>
          <div class="flex gap-md" style="justify-content: flex-end;">
            <button class="btn-secondary" id="confirm-cancel">Cancelar</button>
            <button class="btn-danger" id="confirm-ok">Confirmar</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('active'));

    overlay.querySelector('#confirm-cancel').addEventListener('click', () => {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 250);
      resolve(false);
    });

    overlay.querySelector('#confirm-ok').addEventListener('click', () => {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 250);
      resolve(true);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 250);
        resolve(false);
      }
    });
  });
}
