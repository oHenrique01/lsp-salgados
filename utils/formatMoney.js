// Centraliza a formatacao para todos os precos exibidos na tela e no WhatsApp.
export function formatMoney(value) {
  return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
}
