(function () {
    if (window.__cartAjaxInit) return;
    window.__cartAjaxInit = true;

    function reindexLines() {
        document.querySelectorAll('.cart-line-item').forEach((row, idx) => {
            row.dataset.line = String(idx + 1);
        });
    }

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
        el.classList.remove('opacity-0');
        clearTimeout(el._to);
        el._to = setTimeout(() => {
            el.classList.add('opacity-0');
        }, 3500);
    }

    function setLoading(container, isLoading) {
        const rowOverlay = container.querySelector('[data-row-overlay]');
        if (rowOverlay) {
            if (rowOverlay.classList.contains('hidden')) {
                rowOverlay.classList.toggle('hidden', !isLoading);
            } else {
                rowOverlay.style.display = isLoading ? 'flex' : 'none';
            }
        } else {
            const loader = container.querySelector('[data-loading]');
            if (loader) loader.classList.toggle('hidden', !isLoading);
        }
        container.classList.toggle('opacity-40', isLoading);
        container.classList.toggle('pointer-events-none', isLoading);
    }

    function getMaxQty(container) {
        const raw = Number(container?.dataset?.max);
        if (!Number.isFinite(raw) || raw < 0) return 9999;
        return raw;
    }

    function updateSummary(totalCents) {
        const cfg = window.themeCart || {};
        cfg.currentCartTotalCents = totalCents;
        const threshold = Number(cfg.freeShippingThresholdCents || 0);
        const flat = Number(cfg.flatShippingCents || 0);
        const subtotalEl = document.querySelector('[data-subtotal-amount]');
        const shippingEl = document.querySelector('[data-shipping-amount]');
        const grandEl = document.querySelector('[data-grandtotal-amount]');

        const shippingCents = totalCents >= threshold ? 0 : flat;
        const grandCents = totalCents + shippingCents;

        if (subtotalEl) subtotalEl.textContent = formatMoney(totalCents);
        if (shippingEl) {
            if (shippingCents === 0) {
                shippingEl.textContent = shippingEl.dataset.freeLabel || 'Free';
            } else {
                shippingEl.textContent = formatMoney(shippingCents);
            }
        }
        if (grandEl) grandEl.textContent = formatMoney(grandCents);
    }

    async function changeLineQty(key, line, qty, container) {
        const btns = container.querySelectorAll('.quantity__button');
        btns.forEach(b => b.setAttribute('aria-disabled', 'true'));
        setLoading(container, true);

        try {
            const res = await fetch('/cart/change.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(
                    Number.isFinite(line) && line > 0
                        ? { line, quantity: qty }
                        : { id: key, quantity: qty }
                )
            });
            if (!res.ok) throw new Error('Cart update failed');
            const cart = await res.json();

            let updated = null;
            if (Number.isFinite(line) && line > 0 && Array.isArray(cart.items)) {
                updated = cart.items[line - 1] || null;
            }
            if (!updated && Array.isArray(cart.items)) {
                updated = cart.items.find(i => i && i.key === key) || null;
            }
            const max = getMaxQty(container);

            if (updated) {
                const qtyEl = container.querySelector('[data-qty]');
                const amountEl = container.querySelector('[data-line-price-amount]');
                if (qtyEl) qtyEl.textContent = updated.quantity;
                if (amountEl) amountEl.textContent = formatMoney(
                    (updated.original_line_price != null ? updated.original_line_price : updated.final_line_price)
                );
                setButtonsState(container, updated.quantity, max);

                if (updated.key) container.dataset.key = updated.key;
            } else {
                if (cart.item_count === 0) {
                    container.remove();
                } else {
                    window.location.reload();
                    return;
                }
            }

            updateSummary(cart.original_total_price != null ? cart.original_total_price : cart.total_price);
            document.querySelectorAll('.cart-count').forEach(el => { el.textContent = cart.item_count; });

            if (cart.item_count === 0) {
                showEmptyState();
                document.querySelectorAll('.cart-count').forEach(el => { el.textContent = '0'; });
                return;
            }

            reindexLines();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(container, false);
            btns.forEach(b => b.removeAttribute('aria-disabled'));
        }
    }

    function showEmptyState() {
        const body = document.querySelector('[data-cart-body]');
        const tpl = document.getElementById('empty-cart-template');
        if (body && tpl) {
            body.replaceWith(tpl.content.cloneNode(true));
        } else {
            window.location.reload();
        }
    }

    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.quantity__button');
        if (!btn) return;
        e.preventDefault();

        const container = btn.closest('.cart-line-item');
        if (!container) return;

        const key = container.dataset.key;
        const line = parseInt(container.dataset.line, 10);
        const max = getMaxQty(container);
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

        changeLineQty(key, Number.isFinite(line) ? line : null, qty, container);
    });

    document.addEventListener('click', async function (e) {
        const link = e.target.closest('[data-remove]');
        if (!link) return;
        e.preventDefault();

        const row = link.closest('.cart-line-item');
        if (!row) return;

        const key = row.dataset.key;
        const line = parseInt(row.dataset.line, 10);
        link.setAttribute('aria-disabled', 'true');
        setLoading(row, true);

        try {
            const res = await fetch('/cart/change.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(
                    Number.isFinite(line) && line > 0
                        ? { line, quantity: 0 }
                        : { id: key, quantity: 0 }
                )
            });
            if (!res.ok) throw new Error('Remove failed');

            const cart = await res.json();
            row.remove();

            updateSummary(cart.original_total_price != null ? cart.original_total_price : cart.total_price);
            document.querySelectorAll('.cart-count').forEach(el => { el.textContent = cart.item_count; });

            if (cart.item_count === 0) {
                showEmptyState();
                document.querySelectorAll('.cart-count').forEach(el => { el.textContent = '0'; });
                return;
            }

            reindexLines();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(row, false);
            link.removeAttribute('aria-disabled');
        }
    });

    function initStates() {
        document.querySelectorAll('.cart-line-item').forEach(container => {
            const max = Number(container.dataset.max || '9999');
            const qty = parseInt(container.querySelector('[data-qty]')?.textContent, 10) || 1;
            setButtonsState(container, qty, max);
        });

        reindexLines();

        if (window.themeCart?.initialCartTotalCents != null) {
            updateSummary(window.themeCart.initialCartTotalCents);
        }

        initParcelyCheckoutButton();
    }

    function initParcelyCheckoutButton() {
        const parcelyWidget = document.getElementById('parcelyWidget');

        function getCheckoutButtons() {
            return Array.from(document.querySelectorAll('button[name="checkout"], input[name="checkout"]'));
        }

        function setCheckoutDisabled(disabled) {
            const btns = getCheckoutButtons();
            if (btns.length === 0) return;
            btns.forEach(btn => {
                btn.classList.toggle('disabled', disabled);
                btn.classList.toggle('opacity-50', disabled);

                if (btn instanceof HTMLButtonElement || btn instanceof HTMLInputElement) {
                    btn.disabled = disabled;
                } else {
                    if (disabled) btn.setAttribute('disabled', '');
                    else btn.removeAttribute('disabled');
                }

                if (disabled) {
                    btn.setAttribute('aria-disabled', 'true');
                } else {
                    btn.removeAttribute('aria-disabled');
                }
            });
        }

        function hasAnyParcelyRadioChecked() {
            if (!parcelyWidget) return true;
            return Boolean(parcelyWidget.querySelector('input.parcelyRadio[type="radio"]:checked'));
        }

        function updateCheckoutState() {
            setCheckoutDisabled(!hasAnyParcelyRadioChecked());
        }

        let updateScheduled = false;
        function scheduleUpdate() {
            if (updateScheduled) return;
            updateScheduled = true;

            // Parcely can toggle checked state asynchronously; re-check across ticks.
            queueMicrotask(() => updateCheckoutState());
            requestAnimationFrame(() => {
                updateCheckoutState();
                setTimeout(() => {
                    updateCheckoutState();
                    updateScheduled = false;
                }, 0);
            });
        }

        if (!parcelyWidget) {
            setCheckoutDisabled(false);
            return;
        }

        // Initial state (usually disabled until a selection exists)
        updateCheckoutState();

        // Event delegation so it still works if Parcely replaces DOM nodes.
        document.addEventListener('change', function (e) {
            const t = e.target;
            if (!(t instanceof HTMLElement)) return;
            if (!t.classList.contains('parcelyRadio')) return;
            scheduleUpdate();
        }, true);

        // Some widgets update checked state around click/label interactions.
        document.addEventListener('click', function (e) {
            const t = e.target;
            if (!(t instanceof HTMLElement)) return;
            // If user clicks anywhere inside the widget (labels/spans), re-check.
            if (!parcelyWidget.contains(t)) return;
            scheduleUpdate();
        }, true);

        // Re-check whenever Parcely re-renders its widget.
        const observer = new MutationObserver(() => {
            scheduleUpdate();
        });
        observer.observe(parcelyWidget, { childList: true, subtree: true, attributes: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStates, { once: true });
    } else {
        initStates();
    }
})();