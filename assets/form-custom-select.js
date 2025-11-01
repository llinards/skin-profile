document.addEventListener('DOMContentLoaded', () => {
  const enhance = (select) => {
    if (!select || select.multiple || select.size > 1 || select.dataset.enhanced === '1') return;
    select.dataset.enhanced = '1';

    // Wrap and hide native select (kept for submit/validation)
    const wrap = document.createElement('div');
    wrap.className = 'sp-select relative w-full';
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);
    select.classList.add('sp-sr-only');

    // Trigger
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sp-select__btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');

    const label = document.createElement('span');
    label.className = 'sp-select__label';
    label.textContent = select.options[select.selectedIndex]?.text || select.options[0]?.text || 'Izvēlēties';

    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor');
    icon.setAttribute('stroke-width', '1.5');
    icon.classList.add('sp-select__chev');
    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />';
    btn.append(label, icon);
    wrap.appendChild(btn);

    // Panel
    const panel = document.createElement('div');
    panel.className = 'sp-select__panel hidden';
    panel.setAttribute('role', 'listbox');
    panel.setAttribute('tabindex', '-1');

    const list = document.createElement('div');
    list.className = 'sp-select__list';
    panel.appendChild(list);
    wrap.appendChild(panel);

    // Items
    Array.from(select.options).forEach(opt => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'sp-select__item';
      item.setAttribute('role', 'option');
      item.dataset.value = opt.value;
      item.textContent = opt.text;

      if (opt.disabled) {
        item.disabled = true;
        item.classList.add('is-disabled');
      }
      if (opt.selected) {
        item.classList.add('is-selected');
        item.setAttribute('aria-selected', 'true');
      }

      item.addEventListener('click', (e) => {
        e.preventDefault();
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        label.textContent = opt.text;
        list.querySelectorAll('.sp-select__item').forEach(el => {
          el.classList.remove('is-selected');
          el.removeAttribute('aria-selected');
        });
        item.classList.add('is-selected');
        item.setAttribute('aria-selected', 'true');
        close();
      });

      list.appendChild(item);
    });

    const isOpen = () => !panel.classList.contains('hidden');

    const open = () => {
      if (isOpen()) return;
      panel.classList.remove('hidden');
      btn.setAttribute('aria-expanded', 'true');
      wrap.classList.add('is-open');
      const sel = list.querySelector('.is-selected') || list.querySelector('.sp-select__item:not(.is-disabled)');
      sel?.focus({ preventScroll: true });
    };

    const close = (returnFocus = true) => {
      if (!isOpen()) return;
      panel.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
      wrap.classList.remove('is-open');
      if (returnFocus) btn.focus({ preventScroll: true });
    };

    // Toggle
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      isOpen() ? close(true) : open();
    });

    // Close on click outside without stealing focus
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target) && isOpen()) close(false);
    });

    // Keyboard
    btn.addEventListener('keydown', (e) => {
      if (['Enter', ' ', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        if (!isOpen()) open();
      }
    });
    panel.addEventListener('keydown', (e) => {
      const items = Array.from(list.querySelectorAll('.sp-select__item:not(.is-disabled)'));
      let i = items.indexOf(document.activeElement);
      if (e.key === 'Escape') { e.preventDefault(); close(true); }
      if (e.key === 'ArrowDown') { e.preventDefault(); items[Math.min(i + 1, items.length - 1)]?.focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); items[Math.max(i - 1, 0)]?.focus(); }
      if (e.key === 'Home') { e.preventDefault(); items[0]?.focus(); }
      if (e.key === 'End') { e.preventDefault(); items[items.length - 1]?.focus(); }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.activeElement?.click(); }
    });

    // Sync external changes
    select.addEventListener('change', () => {
      const opt = select.options[select.selectedIndex];
      if (!opt) return;
      label.textContent = opt.text;
      list.querySelectorAll('.sp-select__item').forEach(el => {
        const sel = el.dataset.value === opt.value;
        el.classList.toggle('is-selected', sel);
        if (sel) el.setAttribute('aria-selected', 'true'); else el.removeAttribute('aria-selected');
      });
    });
  };

  const scan = () => document.querySelectorAll('.globo-form select:not([data-enhanced])').forEach(enhance);
  scan();
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
});