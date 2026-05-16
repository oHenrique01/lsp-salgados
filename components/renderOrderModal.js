import { calculateOrderTotal } from "../utils/calculateOrderTotal.js";
import { formatMoney } from "../utils/formatMoney.js";

const modalItems = document.getElementById("modal-items");
const modalTotal = document.getElementById("modal-total");

function createOrderItem(item, index, onRemoveItem) {
  const listItem = document.createElement("li");
  listItem.className = "modal-item";

  const itemText = document.createElement("span");
  itemText.textContent = `${item.name} - ${formatMoney(item.price)}`;

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "btn-remove-item";
  removeButton.textContent = "x";
  removeButton.addEventListener("click", () => onRemoveItem(index));

  listItem.append(itemText, removeButton);

  return listItem;
}

// Atualiza a lista visual do pedido e conecta os botoes de remover.
export function renderOrderModal({ items, onRemoveItem }) {
  modalItems.innerHTML = "";

  items.forEach((item, index) => {
    modalItems.appendChild(createOrderItem(item, index, onRemoveItem));
  });

  modalTotal.innerHTML = `<strong>Total: ${formatMoney(calculateOrderTotal(items))}</strong>`;
}
