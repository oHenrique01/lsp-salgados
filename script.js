document.addEventListener('DOMContentLoaded', () => {
    const BUSINESS_WHATSAPP = '5513996816089';
    const STORAGE_KEY = 'lsp_salgados_pedido';
    let orderItems = [];
    const modal = document.getElementById('modal-order');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const modalForm = document.getElementById('modal-form');

    function loadOrderFromStorage() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                orderItems = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Erro ao acessar localStorage:', e);
            orderItems = [];
        }
    }

    function saveOrderToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(orderItems));
        } catch (e) {
            console.error('Erro ao salvar no localStorage:', e);
        }
    }

    loadOrderFromStorage();

    function openModal() {
        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    btnCloseModal.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    const btnContinue = document.getElementById('btn-continue-shopping');
    if (btnContinue) {
        btnContinue.addEventListener('click', closeModal);
    }

    function updatePricesAndDescriptions() {
        document.querySelectorAll('.btn-add-salgado').forEach(btn => {
            const card = btn.closest('.salgado-card');
            const priceElem = card ? card.querySelector('.card-price') : null;
            const descElem = card ? card.querySelector('.card-desc') : null;
            const type = btn.dataset.type || '';
            const qty = btn.dataset.quantity || '';
            let price = btn.dataset.price || '';

            if (qty === 'cento') {
                price = (type === 'congelado') ? '60' : '75';
                btn.dataset.price = price;
                if (priceElem) priceElem.textContent = `R$ ${price},00`;
                if (descElem) descElem.textContent = 'Caixa com 100 salgados, informe os sabores e a quantidade desejada';
            } else if (qty === 'meio') {
                price = (type === 'congelado') ? '35' : '50';
                btn.dataset.price = price;
                if (priceElem) priceElem.textContent = `R$ ${price},00`;
                if (descElem) descElem.textContent = 'Caixa com 50 salgados, informe os sabores e a quantidade desejada';
            }
        });
    }

    updatePricesAndDescriptions();

    const configModal = document.getElementById('modal-config');
    const btnCloseConfig = document.getElementById('btn-close-config');
    const btnCancelConfig = document.getElementById('btn-cancel-config');
    const configForm = document.getElementById('config-form');
    const configTotalElem = document.getElementById('config-total');
    const configRequiredElem = document.getElementById('config-required');
    let configRequiredTotal = 100;

    let configPrice = 75;

    function openConfigModal(requiredTotal = 100, price = 75) {
        if (!configModal) return;
        configRequiredTotal = requiredTotal || 100;
        configPrice = price || 75;
        configForm.querySelectorAll('.qty-input').forEach(i => i.value = 0);
        if (configRequiredElem) configRequiredElem.textContent = String(configRequiredTotal);
        if (configTotalElem) configTotalElem.textContent = '0';
        const infoP = configModal.querySelector('.modal-body > p');
        if (infoP) infoP.innerHTML = `Distribua exatamente <strong>${configRequiredTotal}</strong> salgados entre os tipos desejados. Use os controles para ajustar as quantidades.`;
        if (configForm) {
            const submitBtn = configForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = `Adicionar (${configRequiredTotal} - R$ ${String(configPrice)},00)`;
        }
        updateConfigTotal();
        configModal.style.display = 'flex';
    }

    function closeConfigModal() {
        if (!configModal) return;
        configModal.style.display = 'none';
    }

    if (configForm) {
        configForm.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('qty-increase') || target.classList.contains('qty-decrease')) {
                const container = target.closest('.qty-control');
                const input = container.querySelector('.qty-input');
                let val = parseInt(input.value || '0', 10);
                const currentTotal = updateConfigTotal();
                
                if (target.classList.contains('qty-increase')) {
                    if (currentTotal < configRequiredTotal) val++;
                } else {
                    val = Math.max(0, val - 1);
                }
                
                if (val > configRequiredTotal) val = configRequiredTotal;
                input.value = val;
                updateConfigTotal();
            }
        });

        configForm.querySelectorAll('.qty-input').forEach(input => {
            input.addEventListener('input', () => {
                let v = parseInt(input.value || '0', 10);
                if (isNaN(v) || v < 0) v = 0;
                if (v > configRequiredTotal) v = configRequiredTotal;
                input.value = v;
                updateConfigTotal();
            });
        });
    }

    function updateConfigTotal() {
        const total = Array.from(configForm.querySelectorAll('.qty-input'))
            .reduce((sum, inp) => sum + (parseInt(inp.value || '0', 10) || 0), 0);
        configTotalElem.textContent = total;
        configForm.querySelectorAll('.qty-input').forEach(inp => {
            const incBtn = inp.closest('.qty-control').querySelector('.qty-increase');
            if (incBtn) {
                if (total >= configRequiredTotal) {
                    incBtn.disabled = true;
                    incBtn.style.opacity = '0.5';
                } else {
                    incBtn.disabled = false;
                    incBtn.style.opacity = '1';
                }
            }
        });
        return total;
    }

    if (configForm) {
        configForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const total = updateConfigTotal();
            if (total === 0) {
                alert('Selecione pelo menos 1 item.');
                return;
            }
            if (total > configRequiredTotal) {
                alert(`O total não pode exceder ${configRequiredTotal} salgados.`);
                return;
            }
            if (total < configRequiredTotal) {
                alert(`Você deve selecionar exatamente ${configRequiredTotal} salgados para prosseguir.`);
                return;
            }

            const selections = [];
            configForm.querySelectorAll('.qty-input').forEach(inp => {
                const qty = parseInt(inp.value || '0', 10) || 0;
                if (qty > 0) selections.push(`${qty} ${inp.name}`);
            });

            const itemName = `Cento Personalizado: ${selections.join('; ')}`;
            const priceValue = Number(configPrice);
            const priceText = priceValue.toFixed(2).replace('.', ',');
            const item = `${itemName} - R$ ${priceText}`;
            orderItems.push(item);
            saveOrderToStorage();
            renderModal();
            closeConfigModal();
            openModal();
            showSuccessMessage('✓ Item adicionado ao pedido');
        });
    }

    if (btnCloseConfig) btnCloseConfig.addEventListener('click', closeConfigModal);
    if (btnCancelConfig) btnCancelConfig.addEventListener('click', closeConfigModal);
    if (configModal) {
        configModal.addEventListener('click', (e) => {
            if (e.target === configModal) closeConfigModal();
        });
    }

    document.querySelectorAll('.btn-add-salgado').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name || '';
            const qty = btn.dataset.quantity || '';
            const type = btn.dataset.type || '';
            if (qty === 'meio') {
                let price = 50;
                if (type === 'congelado') price = 35;
                openConfigModal(50, price);
                return;
            }
            if (qty === 'cento') {
                let price = 75;
                if (type === 'congelado') price = 60;
                openConfigModal(100, price);
                return;
            }
            let price = btn.dataset.price || '0';
            const item = `${name} - R$ ${price},00`;
            orderItems.push(item);
            saveOrderToStorage();
            renderModal();
            openModal();
            showSuccessMessage('✓ Item adicionado ao pedido');
        });
    });

    function showSuccessMessage(text) {
        const notification = document.createElement('div');
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
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3500);
    }

    function renderModal() {
        const container = document.getElementById('modal-items');
        const totalElem = document.getElementById('modal-total');
        if (!container) return;

        container.innerHTML = '';
        let total = 0;

        orderItems.forEach((item, idx) => {
            const li = document.createElement('li');
            li.className = 'modal-item';
            li.innerHTML = `
                <span>${item}</span>
                <button type="button" class="btn-remove-item" data-index="${idx}">×</button>
            `;
            container.appendChild(li);

            const match = item.match(/R\$ ([\d,]+)/);
            if (match) {
                const value = parseFloat(match[1].replace(',', '.'));
                total += value;
            }
        });

        if (totalElem) {
            const totalFormatted = total.toFixed(2).replace('.', ',');
            totalElem.innerHTML = `<strong>Total: R$ ${totalFormatted}</strong>`;
        }

        document.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const idx = parseInt(btn.dataset.index);
                orderItems.splice(idx, 1);
                saveOrderToStorage();
                if (orderItems.length === 0) {
                    closeModal();
                } else {
                    renderModal();
                }
            });
        });
    }

    modalForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = modalForm.querySelector('input[name="name"]').value;
        const address = modalForm.querySelector('input[name="address"]').value;
        const complement = modalForm.querySelector('input[name="complement"]').value;
        const obs = modalForm.querySelector('textarea[name="obs"]').value;

        let msgParts = ['Olá! Gostaria de fazer o seguinte pedido:'];
        let total = 0;
        
        orderItems.forEach(item => {
            msgParts.push(`• ${item}`);
            const match = item.match(/R\$ ([\d,]+)/);
            if (match) {
                const value = parseFloat(match[1].replace(',', '.'));
                total += value;
            }
        });

        const totalFormatted = total.toFixed(2).replace('.', ',');
        msgParts.push('', `Total: R$ ${totalFormatted}`, '', 'Dados da Entrega:');
        
        if (name) msgParts.push(`Nome: ${name}`);
        if (address) msgParts.push(`Endereço: ${address}`);
        if (complement) msgParts.push(`Complemento: ${complement}`);
        if (obs) msgParts.push(`Observações: ${obs}`);

        const msg = encodeURIComponent(msgParts.join('\n'));
        const url = `https://wa.me/${BUSINESS_WHATSAPP}?text=${msg}`;
        
        window.open(url, '_blank');

        showSuccessMessage('✓ Pedido enviado! Aguarde o contato.');
        
        setTimeout(() => {
            modalForm.reset();
            orderItems = [];
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (e) {
                console.error('Erro ao limpar localStorage:', e);
            }
            closeModal();
        }, 500);
    });

    if (orderItems.length > 0) {
        renderModal();
    }

    const carouselPrev = document.getElementById('carousel-prev');
    const carouselNext = document.getElementById('carousel-next');
    const carousel = document.querySelector('.carousel');

    if (carousel) {
        const scrollStep = 320;

        if (carouselPrev) {
            carouselPrev.addEventListener('click', () => {
                carousel.scrollLeft -= scrollStep;
            });
        }

        if (carouselNext) {
            carouselNext.addEventListener('click', () => {
                carousel.scrollLeft += scrollStep;
            });
        }
    }
});