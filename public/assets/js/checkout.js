/**
 * Checkout interaction for the public portfolio demo.
 * No payment or personal data is transmitted.
 */

document.addEventListener('DOMContentLoaded', () => {
  const planName = localStorage.getItem('lp_selected_plan_name') || 'Profissional';
  const planPrice = localStorage.getItem('lp_selected_plan_price') || '99,90';
  const nameLabel = document.getElementById('res-plan-name');
  const priceLabel = document.getElementById('res-plan-price');
  const totalLabel = document.getElementById('res-plan-total');

  if (nameLabel && priceLabel && totalLabel) {
    nameLabel.textContent = `Plano ${planName}`;
    priceLabel.textContent = `R$ ${planPrice}`;
    totalLabel.textContent = `R$ ${planPrice}`;
  }

  const savedUser = localStorage.getItem('lp_user');
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      const emailInput = document.getElementById('cx-email');
      if (emailInput && user.email) emailInput.value = user.email;
    } catch {
      localStorage.removeItem('lp_user');
    }
  }

  const statusMessage = document.getElementById('status-message');
  const showStatus = (message, type) => {
    if (!statusMessage) return;
    statusMessage.className = type;
    statusMessage.textContent = message;
  };

  const paymentMethods = document.querySelectorAll('.payment-method');
  paymentMethods.forEach((method) => {
    method.addEventListener('click', () => {
      paymentMethods.forEach((candidate) => candidate.classList.remove('active'));
      const option = method.querySelector('input[type="radio"]');
      if (option) option.checked = true;
      method.classList.add('active');

      if (option?.value === 'credit_card') {
        showStatus('Cartão exibido apenas como demonstração local.', 'success');
      }
    });
  });

  const copyButton = document.getElementById('btn-copy-pix');
  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      const copyText = document.getElementById('pix-copy-paste');
      if (!copyText) return;
      await navigator.clipboard.writeText(copyText.value);
      copyButton.textContent = 'Copiado!';
      setTimeout(() => {
        copyButton.textContent = 'Copiar';
      }, 2000);
    });
  }

  const finishButton = document.getElementById('btn-finish-checkout');
  if (finishButton) {
    finishButton.addEventListener('click', () => {
      const email = document.getElementById('cx-email')?.value.trim();
      if (!email) {
        showStatus('Informe um e-mail fictício para testar a interface.', 'error');
        return;
      }

      finishButton.disabled = true;
      finishButton.textContent = 'Simulando...';
      showStatus(
        'Simulação concluída localmente. Nenhum dado foi enviado e nenhuma transação foi realizada.',
        'success',
      );

      setTimeout(() => {
        finishButton.disabled = false;
        finishButton.textContent = 'Simular compra';
      }, 1200);
    });
  }
});
