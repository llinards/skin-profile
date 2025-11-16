document.addEventListener('DOMContentLoaded', () => {
  const qty = document.getElementById('quantity');
  const plus = document.getElementById('plus-btn');
  const minus = document.getElementById('minus-btn');
  const err = document.getElementById('quantity-error');
  if (!qty || !plus || !minus || !err) return;

  const max = parseInt(qty.getAttribute('max'), 10) || 1;
  let hideTimer = null;

  const showError = (msg) => {
    clearTimeout(hideTimer);
    err.textContent = msg;
    err.classList.remove('opacity-0');
    err.classList.add('opacity-100');
    hideTimer = setTimeout(() => {
      err.classList.remove('opacity-100');
      err.classList.add('opacity-0');
      // Optional: clear text after fade
      setTimeout(() => { err.textContent = ''; }, 300);
    }, 3000);
  };

  const clearError = () => {
    clearTimeout(hideTimer);
    err.classList.remove('opacity-100');
    err.classList.add('opacity-0');
    err.textContent = '';
  };

  plus.addEventListener('click', () => {
    const val = parseInt(qty.value, 10);
    if (val < max) {
      qty.value = val + 1;
      clearError();
    } else {
      showError('Nav vairāk vienību noliktavā.');
    }
  });

  minus.addEventListener('click', () => {
    const val = parseInt(qty.value, 10);
    if (val > 1) qty.value = val - 1;
    clearError();
  });
});