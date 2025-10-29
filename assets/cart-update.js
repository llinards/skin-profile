(function () {
    if (window.__cartAjaxInit) return; // prevent double init
    window.__cartAjaxInit = true;

    function formatMoney(cents) {
        try {
            if (window.Shopify && Shopify.formatMoney && window.themeCart?.moneyFormat) {
                return Shopify.formatMoney(cents, window.themeCart.moneyFormat);
            }
        } catch (_) { }
        try {
            const locale = window.themeCart?.locale || 'en';
            const currency = window.themeCart?.currency || 'EUR';
            return new Intl.NumberFormat(locale, { style: 'currency', currency }).format((cents || 0) / 100);
        } catch (_) {
            return '€' + ((cents || 0) / 100).toFixed(2);
        }
    }

    function setButtonsState(container, qty, max) {
        const minus = container.querySelector('.quantity-minus');
        const plus = container.querySelector('.quantity-plus');
        if (minus) minus.setAttribute('aria-disabled', qty <= 1 ? 'true' : 'false');
        if (plus) plus.setAttribute('aria-disabled', qty >= max ? 'true' : 'false');
    }

    function showError(container, msg) {
        const el = container.querySelector('[data-error]');
        if (!el) return;
        el.textContent = msg;
        el.classList.remove('opacity-0'); // fade in
        clearTimeout(el._to);
        el._to = setTimeout(() => {
            el.classList.add('opacity-0');  // fade out
        }, 3500);
    }

    function setLoading(container, isLoading) {
        const rowOverlay = container.querySelector('[data-row-overlay]');
        if (rowOverlay) {
            rowOverlay.classList.toggle('hidden', !isLoading);
        } else {
            const loader = container.querySelector('[data-loading]');
            if (loader) loader.classList.toggle('hidden', !isLoading);
        }
        // Dim and block interactions on the row while loading
        container.classList.toggle('opacity-40', isLoading);
        container.classList.toggle('pointer-events-none', isLoading);
    }

    async function changeLineQty(key, qty, container) {
        const btns = container.querySelectorAll('.quantity__button');
        btns.forEach(b => b.setAttribute('aria-disabled', 'true'));
        setLoading(container, true);

        try {
            const res = await fetch('/cart/change.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ id: key, quantity: qty })
            });
            if (!res.ok) throw new Error('Cart update failed');
            const cart = await res.json();

            const updated = cart.items.find(i => i.key === key);
            const max = Number(container.dataset.max || '9999');

            if (updated) {
                const qtyEl = container.querySelector('[data-qty]');
                const amountEl = container.querySelector('[data-line-price-amount]'); // changed
                if (qtyEl) qtyEl.textContent = updated.quantity;
                if (amountEl) amountEl.textContent = formatMoney(updated.final_line_price); // changed
                setButtonsState(container, updated.quantity, max);
            } else {
                container.remove();
            }

            const totalEl = document.querySelector('[data-cart-total]');
            if (totalEl) totalEl.textContent = formatMoney(cart.total_price);
            document.querySelectorAll('.cart-count').forEach(el => { el.textContent = cart.item_count; });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(container, false);
            btns.forEach(b => b.removeAttribute('aria-disabled'));
        }
    }

    // Quantity +/- (block exceeding stock)
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.quantity__button');
        if (!btn) return;

        e.preventDefault();

        const container = btn.closest('.cart-line-item');
        if (!container) return;

        const key = container.dataset.key;
        const max = Number(container.dataset.max || '9999');
        const qtyEl = container.querySelector('[data-qty]');
        let qty = parseInt(qtyEl?.textContent, 10) || 1;

        const isPlus = btn.classList.contains('quantity-plus');
        if (isPlus) {
            if (qty >= max) {
                setButtonsState(container, qty, max);
                showError(container, `Nav iespējams pievienot vairāk. Pieejamas tikai ${max} vienības.`);
                return;
            }
            qty += 1;
        } else {
            qty = Math.max(1, qty - 1);
        }

        changeLineQty(key, qty, container);
    });

    // Remove item (no refresh)
    document.addEventListener('click', async function (e) {
        const link = e.target.closest('[data-remove]');
        if (!link) return;

        e.preventDefault();

        const row = link.closest('.cart-line-item');
        if (!row) return;

        const key = row.dataset.key;
        link.setAttribute('aria-disabled', 'true');
        setLoading(row, true); // show spinner

        try {
            const res = await fetch('/cart/change.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ id: key, quantity: 0 })
            });
            if (!res.ok) throw new Error('Remove failed');

            const cart = await res.json();

            row.remove();

            const totalEl = document.querySelector('[data-cart-total]');
            if (totalEl) totalEl.textContent = formatMoney(cart.total_price);
            document.querySelectorAll('.cart-count').forEach(el => { el.textContent = cart.item_count; });
        } catch (err) {
            console.error(err);
        } finally {
            // row may be removed; safe to try hide
            setLoading(row, false);
            link.removeAttribute('aria-disabled');
        }
    });

    // Initialize disabled state on load
    function initStates() {
        document.querySelectorAll('.cart-line-item').forEach(container => {
            const max = Number(container.dataset.max || '9999');
            const qty = parseInt(container.querySelector('[data-qty]')?.textContent, 10) || 1;
            setButtonsState(container, qty, max);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStates, { once: true });
    } else {
        initStates();
    }
})();