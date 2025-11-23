function collectionFilters() {
    return {
        loading: false,

        updateSortByLabel() {
            const sortLabels = {
                manual: 'Kārtot pēc',
                'best-selling': 'Populārākie',
                'title-ascending': 'Nosaukums: A-Z',
                'title-descending': 'Nosaukums: Z-A',
                'price-ascending': 'Cena: Augošā',
                'price-descending': 'Cena: Dilstošā',
                'created-ascending': 'Vecākais',
                'created-descending': 'Jaunākais',
            };
            const activeClasses = ['bg-gray-50', 'font-semibold'];
            const sortKey = new URLSearchParams(window.location.search).get('sort_by') || 'manual';
            document.querySelectorAll('#sort-by-label').forEach((labelEl) => {
                labelEl.innerHTML = sortLabels[sortKey] ?? labelEl.innerHTML;
                const dropdown = labelEl.closest('.relative');
                if (!dropdown) return;
                dropdown.querySelectorAll('a.filter-link').forEach((a) => {
                    const isActive = a.href.includes(`sort_by=${sortKey}`);
                    a.classList.toggle(activeClasses[0], isActive);
                    a.classList.toggle(activeClasses[1], isActive);
                });
            });
        },

        handleFilterChange(event) {
            if (event?.target) {
                const { name, value, checked } = event.target;
                document.querySelectorAll(`.filter-checkbox[name="${name}"][value="${value}"]`)
                    .forEach((box) => (box !== event.target ? (box.checked = checked) : null));
            }
            const params = new URLSearchParams(window.location.search);
            const next = new URLSearchParams();
            for (const [key, value] of params.entries()) {
                if (!key.startsWith('filter.') && key !== 'page') next.append(key, value);
            }
            document.querySelectorAll('.filter-checkbox:checked').forEach((box) => {
                next.append(box.name, box.value);
            });
            const qs = next.toString();
            const url = qs ? `${location.pathname}?${qs}` : location.pathname;
            this.navigate(url, true);
        },

        clearFilterGroup(paramName) {
            document.querySelectorAll(`.filter-checkbox[data-param="${paramName}"]`)
                .forEach((box) => (box.checked = false));
            this.handleFilterChange(null);
        },

        async navigate(url, scroll = false) {
            if (!url) return;
            this.loading = true; // triggers x-show overlay
            await new Promise(r => requestAnimationFrame(r));
            await new Promise(r => requestAnimationFrame(r)); // ensure paint
            await this.loadPage(url);
            if (scroll) {
                (this.$refs.productGrid || document.getElementById('products'))?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        },

        init() {
            this.updateSortByLabel();
            window.clearFilterGroup = this.clearFilterGroup.bind(this);
            window.__collectionFiltersInstance = this; // expose for global handler

            // Only pagination & sort links inside root
            this.$el.addEventListener('click', (e) => {
                const link = e.target.closest('a.pagination-link, a.filter-link');
                if (!link) return;
                e.preventDefault();
                this.navigate(link.href, true);
            });

            this.$el.addEventListener('change', (e) => {
                if (e.target.classList.contains('filter-checkbox')) {
                    this.handleFilterChange(e);
                }
            });
        },

        async loadPage(url) {
            try {
                history.pushState({}, '', url);
                const html = await (await fetch(url)).text();
                const doc = new DOMParser().parseFromString(html, 'text/html');

                const swap = (ref) => {
                    const fresh = doc.querySelector(`[x-ref="${ref}"]`);
                    if (fresh && this.$refs[ref]) {
                        this.$refs[ref].innerHTML = fresh.innerHTML;
                        if (window.Alpine) window.Alpine.initTree(this.$refs[ref]);
                    }
                };
                swap('productGrid');
                swap('pagination');
                swap('filtersDesktop');
                swap('mobileFilterWrapper');
                this.updateSortByLabel();
            } catch (err) {
                console.error('AJAX load failed, falling back:', err);
                window.location.href = url;
            } finally {
                this.loading = false;
            }
        },
    };
}

(function () {
    if (typeof window === 'undefined') return;
    window.collectionFilters = collectionFilters;

    function mountCollectionFilters() {
        document.querySelectorAll('[data-collection-root]').forEach((el) => {
            if (el.__collectionMounted) return;
            el.setAttribute('x-data', 'collectionFilters');
            el.setAttribute('x-init', 'init()');
            window.Alpine?.initTree(el);
            el.__collectionMounted = true;
        });
    }

    function register() {
        if (window.Alpine?.data) window.Alpine.data('collectionFilters', collectionFilters);
        mountCollectionFilters();
    }

    window.Alpine ? register() : document.addEventListener('alpine:init', register, { once: true });
    document.addEventListener('DOMContentLoaded', mountCollectionFilters, { once: true });
    window.addEventListener('popstate', mountCollectionFilters);

    // Global handler for category cards outside collection root
    if (!document.body.dataset.globalCategoryCards) {
        document.body.dataset.globalCategoryCards = 'true';
        document.addEventListener('click', (e) => {
            const card = e.target.closest('a.category-card');
            if (!card) return;
            const component = window.__collectionFiltersInstance;
            if (!component) return; // allow normal navigation if not mounted
            e.preventDefault();
            // Reset existing filters when switching category
            document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = false);
            component.navigate(card.href, true);
        });
    }
})();
