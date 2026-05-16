const DEFAULT_PRICES = {
  frito: {
    meio: 50,
    cento: 75,
  },
  congelado: {
    meio: 35,
    cento: 60,
  },
};

// Busca primeiro o preco informado no HTML; se faltar, usa a tabela padrao.
export function getProductPrice(product) {
  const datasetPrice = Number(product.price || 0);

  if (datasetPrice > 0) {
    return datasetPrice;
  }

  return DEFAULT_PRICES[product.type]?.[product.quantity] || 0;
}
