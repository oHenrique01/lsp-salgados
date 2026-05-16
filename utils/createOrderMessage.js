import { calculateOrderTotal } from "./calculateOrderTotal.js";
import { formatMoney } from "./formatMoney.js";

// Monta a mensagem final no formato que sera enviado para o WhatsApp.
export function createOrderMessage(orderItems, customer) {
  const message = ["Ola! Gostaria de fazer o seguinte pedido:"];

  orderItems.forEach((item) => {
    message.push(`- ${item.name} - ${formatMoney(item.price)}`);
  });

  message.push("", `Total: ${formatMoney(calculateOrderTotal(orderItems))}`, "", "Dados da Entrega:");

  if (customer.name) message.push(`Nome: ${customer.name}`);
  if (customer.address) message.push(`Endereco: ${customer.address}`);
  if (customer.complement) message.push(`Complemento: ${customer.complement}`);
  if (customer.obs) message.push(`Observacoes: ${customer.obs}`);

  return message.join("\n");
}
