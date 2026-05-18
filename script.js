import { renderOrderModal } from "./components/renderOrderModal.js";
import { showSuccessMessage } from "./components/showSuccessMessage.js";
import { loadOrder, removeOrder, saveOrder } from "./storage/orderStorage.js";
import { createOrderMessage } from "./utils/createOrderMessage.js";
import { formatMoney } from "./utils/formatMoney.js";
import { getProductPrice } from "./utils/getProductPrice.js";
import { getRequiredTotal } from "./utils/getRequiredTotal.js";

const BUSINESS_WHATSAPP = "5513996816089";
const AUTOPLAY_DELAY = 4000;

const modal = document.getElementById("modal-order");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnContinue = document.getElementById("btn-continue-shopping");
const modalForm = document.getElementById("modal-form");

const configModal = document.getElementById("modal-config");
const btnCloseConfig = document.getElementById("btn-close-config");
const btnCancelConfig = document.getElementById("btn-cancel-config");
const configForm = document.getElementById("config-form");
const configTotal = document.getElementById("config-total");
const configRequired = document.getElementById("config-required");
const configTitle = configModal?.querySelector(".modal-header h2");
const configInfo = configModal?.querySelector(".modal-body > p");
const configSubmit = configForm?.querySelector('button[type="submit"]');

let orderItems = loadOrder();
let configRequiredTotal = 100;
let configPrice = 75;
let configItemName = "Pedido Personalizado";

function openModal() {
  modal.style.display = "flex";
}

function closeModal() {
  modal.style.display = "none";
}

function openConfigModal(requiredTotal, price, itemName) {
  configRequiredTotal = requiredTotal;
  configPrice = price;
  configItemName = itemName;

  configForm.querySelectorAll(".qty-input").forEach((input) => {
    input.value = 0;
    input.max = String(configRequiredTotal);
  });

  configRequired.textContent = String(configRequiredTotal);
  configTotal.textContent = "0";
  configTitle.textContent = `Personalizar ${configItemName}`;
  configInfo.innerHTML = `Escolha exatamente <strong>${configRequiredTotal}</strong> unidades.`;
  configSubmit.textContent = `Adicionar (${formatMoney(configPrice)})`;

  updateConfigTotal();
  configModal.style.display = "flex";
}

function closeConfigModal() {
  configModal.style.display = "none";
}

function updateConfigTotal() {
  const inputs = Array.from(configForm.querySelectorAll(".qty-input"));
  const total = inputs.reduce((sum, input) => sum + Number(input.value || 0), 0);

  configTotal.textContent = String(total);

  // Bloqueia apenas os botoes de soma quando a quantidade exigida ja foi atingida.
  inputs.forEach((input) => {
    const increaseButton = input.closest(".qty-control").querySelector(".qty-increase");
    increaseButton.disabled = total >= configRequiredTotal;
    increaseButton.style.opacity = total >= configRequiredTotal ? "0.5" : "1";
  });

  return total;
}

function renderOrder() {
  renderOrderModal({
    items: orderItems,
    onRemoveItem: (index) => {
      orderItems.splice(index, 1);
      saveOrder(orderItems);

      if (orderItems.length === 0) {
        closeModal();
        return;
      }

      renderOrder();
    },
  });
}

function addItemToOrder(item) {
  orderItems.push(item);
  saveOrder(orderItems);
  renderOrder();
  openModal();
  showSuccessMessage("Item adicionado ao pedido");
}

function updatePricesAndDescriptions() {
  document.querySelectorAll(".btn-add-salgado").forEach((button) => {
    const card = button.closest(".salgado-card");
    const price = getProductPrice(button.dataset);
    const requiredTotal = getRequiredTotal(button.dataset.quantity);

    button.dataset.price = String(price);
    card.querySelector(".card-price").textContent = formatMoney(price);

    if (requiredTotal > 0) {
      card.querySelector(".card-desc").textContent =
        `Caixa com ${requiredTotal} salgados, informe os sabores e a quantidade desejada`;
    }
  });
}

function createConfiguredItem() {
  const selections = Array.from(configForm.querySelectorAll(".qty-input"))
    .map((input) => ({
      name: input.name,
      quantity: Number(input.value || 0),
    }))
    .filter((item) => item.quantity > 0);

  const details = selections.map((item) => `${item.quantity} ${item.name}`).join("; ");

  return {
    name: `${configItemName}: ${details}`,
    price: configPrice,
  };
}

function handleProductClick(button) {
  const requiredTotal = getRequiredTotal(button.dataset.quantity);
  const price = getProductPrice(button.dataset);
  const name = button.dataset.name || "Pedido Personalizado";

  if (requiredTotal > 0) {
    openConfigModal(requiredTotal, price, name);
    return;
  }

  addItemToOrder({ name, price });
}

function setupConfigForm() {
  configForm.addEventListener("click", (event) => {
    const button = event.target;
    const isQuantityButton =
      button.classList.contains("qty-increase") || button.classList.contains("qty-decrease");

    if (!isQuantityButton) return;

    const input = button.closest(".qty-control").querySelector(".qty-input");
    const currentTotal = updateConfigTotal();
    let value = Number(input.value || 0);

    if (button.classList.contains("qty-increase") && currentTotal < configRequiredTotal) {
      value += 1;
    }

    if (button.classList.contains("qty-decrease")) {
      value = Math.max(0, value - 1);
    }

    input.value = Math.min(value, configRequiredTotal);
    updateConfigTotal();
  });

  configForm.querySelectorAll(".qty-input").forEach((input) => {
    input.addEventListener("input", () => {
      const value = Number(input.value || 0);
      const safeValue = Number.isNaN(value) ? 0 : value;
      input.value = Math.min(Math.max(0, safeValue), configRequiredTotal);
      updateConfigTotal();
    });
  });

  configForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const total = updateConfigTotal();

    if (total === 0) {
      alert("Selecione pelo menos 1 item.");
      return;
    }

    if (total < configRequiredTotal) {
      alert(`Selecione exatamente ${configRequiredTotal} salgados para prosseguir.`);
      return;
    }

    addItemToOrder(createConfiguredItem());
    closeConfigModal();
  });
}

function setupOrderForm() {
  modalForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const customer = {
      name: modalForm.querySelector('input[name="name"]').value,
      address: modalForm.querySelector('input[name="address"]').value,
      complement: modalForm.querySelector('input[name="complement"]').value,
      obs: modalForm.querySelector('textarea[name="obs"]').value,
    };

    const message = createOrderMessage(orderItems, customer);
    const url = `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
    showSuccessMessage("Pedido enviado! Aguarde o contato.");

    setTimeout(() => {
      modalForm.reset();
      orderItems = [];
      removeOrder();
      closeModal();
    }, 500);
  });
}

function setupCarousel() {
  const carousel = document.querySelector(".carousel");
  const carouselPrev = document.getElementById("carousel-prev");
  const carouselNext = document.getElementById("carousel-next");

  if (!carousel) return;

  const scrollStep = carousel.offsetWidth * 0.9;
  let autoplayInterval = null;

  function scrollNext() {
    const isAtEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 5;
    carousel.scrollLeft = isAtEnd ? 0 : carousel.scrollLeft + scrollStep;
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
    autoplayInterval = null;
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(scrollNext, AUTOPLAY_DELAY);
  }

  carouselPrev?.addEventListener("click", () => {
    carousel.scrollLeft -= scrollStep;
    startAutoplay();
  });

  carouselNext?.addEventListener("click", () => {
    carousel.scrollLeft += scrollStep;
    startAutoplay();
  });

  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);
  carousel.addEventListener("touchstart", stopAutoplay, { passive: true });
  carousel.addEventListener("touchend", () => setTimeout(startAutoplay, 1500));

  startAutoplay();
}

function setupModalEvents() {
  btnCloseModal.addEventListener("click", closeModal);
  btnContinue?.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  btnCloseConfig.addEventListener("click", closeConfigModal);
  btnCancelConfig.addEventListener("click", closeConfigModal);
  configModal.addEventListener("click", (event) => {
    if (event.target === configModal) closeConfigModal();
  });
}

function setupScrollAnimations() {
  const animatedElements = document.querySelectorAll(".salgado-card, section h2");

  if (!("IntersectionObserver" in window)) {
    animatedElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.16,
    }
  );

  animatedElements.forEach((element) => observer.observe(element));
}

function init() {
  updatePricesAndDescriptions();
  setupModalEvents();
  setupConfigForm();
  setupOrderForm();
  setupCarousel();
  setupScrollAnimations();

  document.querySelectorAll(".btn-add-salgado").forEach((button) => {
    button.addEventListener("click", () => handleProductClick(button));
  });

  if (orderItems.length > 0) {
    renderOrder();
  }
}

document.addEventListener("DOMContentLoaded", init);
