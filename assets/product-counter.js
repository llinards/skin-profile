document.addEventListener('DOMContentLoaded', function () {
    const minusBtn = document.getElementById('minus-btn');
    const quantity = document.getElementById('quantity');
    const plusBtn = document.getElementById('plus-btn');
    const maxStock = parseInt(quantity.getAttribute('max'));

    minusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const currentValue = parseInt(quantity.value);
        if (currentValue > 1) {
            quantity.value = currentValue - 1;
        }
    });

    plusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const currentValue = parseInt(quantity.value);
        if (currentValue < maxStock) {
            quantity.value = currentValue + 1;
        }
    });

    // Prevent manual input above stock
    quantity.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (value > maxStock) {
            e.target.value = maxStock;
        }
        if (value < 1) {
            e.target.value = 1;
        }
    });
});