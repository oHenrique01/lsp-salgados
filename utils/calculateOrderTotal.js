export function calculateOrderTotal(orderItems) {
  return orderItems.reduce((total, item) => total + Number(item.price || 0), 0);
}
