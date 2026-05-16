// Exibe um aviso temporario para confirmar acoes importantes do pedido.
export function showSuccessMessage(text) {
  const notification = document.createElement("div");
  notification.textContent = text;
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px;
    background: #25D366; color: white;
    padding: 16px 24px; border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-weight: 600; z-index: 2000;
    animation: slideIn 0.3s ease;
    max-width: 300px;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3500);
}
