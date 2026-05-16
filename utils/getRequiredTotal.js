const QUANTITY_TOTALS = {
  meio: 50,
  cento: 100,
};

// Transforma o data-quantity do botao na quantidade que precisa ser configurada.
export function getRequiredTotal(quantity) {
  if (QUANTITY_TOTALS[quantity]) {
    return QUANTITY_TOTALS[quantity];
  }

  const parsedQuantity = Number.parseInt(quantity, 10);
  return Number.isNaN(parsedQuantity) ? 0 : parsedQuantity;
}
