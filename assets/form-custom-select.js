document.addEventListener('DOMContentLoaded', () => {
  const enhance = (select) => {
    if (select.multiple || select.size > 1 || select.dataset.enhanced === '1') return;
    select.dataset.enhanced = '1';

    // Create wrapper
    const wrap = document.createElement('div');
    wrap.className = 'sp-select relative';
    wrap.setAttribute('x-data', '{ open: false }');
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);

    // Hide native select visually but keep for submission
    select.style.position = 'absolute';
    select.style.width = '1px';
    select.style.height = '1px';
    select.style.padding = '0';
    select.style.margin = '-1px';
    select.style.overflow = 'hidden';
    select.style.clip = 'rect(0,0,0,0)';
    select.style.border = '0';
    select.setAttribute('tabindex', '-1');

    // Create button (matches filter-dropdown)
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'flex py-2 px-4 items-center uppercase rounded-lg border border-gray-300 w-full justify-between cursor-pointer hover:bg-gray-50 transition-colors';
    btn.setAttribute('@click', 'open = !open');
    
    const label = document.createElement('span');
    label.className = 'tracking-wide text-xs sm:text-sm truncate';
    label.textContent = select.options[select.selectedIndex]?.text || select.options[0]?.text || 'Izvēlēties';
    
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('stroke-width', '1.5');
    icon.setAttribute('stroke', 'currentColor');
    icon.className = 'size-6 bg-gray-300 rounded-full p-1 transition-transform';
    icon.setAttribute(':class', "{ 'rotate-180': open }");
    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />';
    
    btn.append(label, icon);
    wrap.appendChild(btn);

    // Create dropdown panel (matches filter-dropdown)
    const panel = document.createElement('div');
    panel.className = 'w-full absolute z-10 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg';
    panel.setAttribute('x-show', 'open');
    panel.setAttribute('@click.away', 'open = false');
    panel.setAttribute('x-transition', '');
    panel.style.display = 'none';

    const list = document.createElement('div');
    list.className = 'py-2 max-h-80 overflow-y-auto';
    list.setAttribute('@click', 'open = false');

    // Build options
    Array.from(select.options).forEach(opt => {
      const item = document.createElement('a');
      item.href = '#';
      item.className = 'block px-4 py-2 text-sm hover:bg-gray-50';
      item.textContent = opt.text;
      item.dataset.value = opt.value;
      
      if (opt.disabled) {
        item.classList.add('opacity-50', 'pointer-events-none');
      }
      if (opt.selected) {
        item.classList.add('bg-gray-50');
      }
      
      item.addEventListener('click', (e) => {
        e.preventDefault();
        // Update native select
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        // Update label
        label.textContent = opt.text;
        // Update visual selection
        list.querySelectorAll('a').forEach(el => el.classList.remove('bg-gray-50'));
        item.classList.add('bg-gray-50');
      });
      
      list.appendChild(item);
    });

    panel.appendChild(list);
    wrap.appendChild(panel);

    // Keep label synced if app changes value
    select.addEventListener('change', () => {
      const opt = select.options[select.selectedIndex];
      if (opt) {
        label.textContent = opt.text;
        list.querySelectorAll('a').forEach(el => {
          el.classList.toggle('bg-gray-50', el.dataset.value === opt.value);
        });
      }
    });
  };

  // Enhance all selects in Globo form
  const scan = () => document.querySelectorAll('.globo-form select:not([data-enhanced])').forEach(enhance);
  scan();
  
  // Watch for dynamically added selects
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
});