const STORAGE_KEY = "lsp_salgados_pedido";

function normalizeOrderItem(item) {
  if (typeof item !== "string") {
    return item;
  }

  const [name, priceText = "R$ 0"] = item.split(" - ");
  const price = Number(priceText.replace("R$", "").replace(",", ".").trim()) || 0;

  return { name, price };
}

// Recupera o pedido salvo e tambem aceita pedidos antigos salvos como texto.
export function loadOrder() {
  try {
    const savedOrder = localStorage.getItem(STORAGE_KEY);
    return savedOrder ? JSON.parse(savedOrder).map(normalizeOrderItem) : [];
  } catch (error) {
    console.error("Erro ao acessar localStorage:", error);
    return [];
  }
}

// Mantem o pedido atual salvo para o usuario nao perder os itens ao recarregar.
export function saveOrder(orderItems) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orderItems));
  } catch (error) {
    console.error("Erro ao salvar no localStorage:", error);
  }
}

export function removeOrder() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Erro ao limpar localStorage:", error);
  }
}
