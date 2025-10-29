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
            const params = new URLSearchParams(window.location.search);
            const sortKey = params.get('sort_by') || 'manual';
            document.querySelectorAll('#sort-by-label').forEach((el) => {
                if (sortLabels[sortKey]) el.innerHTML = sortLabels[sortKey];
                const dropdown = el.closest('.relative');
                if (!dropdown) return;
                dropdown.querySelectorAll('a.filter-link').forEach((a) => {
                    a.classList.remove(...activeClasses);
                    if (a.href.includes(`sort_by=${sortKey}`)) a.classList.add(...activeClasses);
                });
            });
        },
        init() {
            this.updateSortByLabel();
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a.pagination-link, a.filter-link, a.category-card');
                if (!link) return;
                e.preventDefault();
                this.loadPage(link.href);
                setTimeout(() => {
                    const el = document.getElementById('products');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            });
        },
        async loadPage(url) {
            if (this.loading) return;
            this.loading = true;
            try {
                window.history.pushState({}, '', url);
                const html = await (await fetch(url)).text();
                const doc = new DOMParser().parseFromString(html, 'text/html');

                const newGrid = doc.querySelector('[x-ref="productGrid"]');
                if (newGrid) this.$refs.productGrid.innerHTML = newGrid.innerHTML;

                const newPagination = doc.querySelector('[x-ref="pagination"]');
                if (newPagination && this.$refs.pagination) {
                    this.$refs.pagination.innerHTML = newPagination.innerHTML;
                }

                const newDesktopFilters = doc.querySelector('[x-ref="filtersDesktop"]');
                if (newDesktopFilters && this.$refs.filtersDesktop) {
                    this.$refs.filtersDesktop.innerHTML = newDesktopFilters.innerHTML;
                    if (window.Alpine) window.Alpine.initTree(this.$refs.filtersDesktop);
                }

                const newMobileWrapper = doc.querySelector('[x-ref="mobileFilterWrapper"]');
                if (newMobileWrapper && this.$refs.mobileFilterWrapper) {
                    this.$refs.mobileFilterWrapper.innerHTML = newMobileWrapper.innerHTML;
                    if (window.Alpine) window.Alpine.initTree(this.$refs.mobileFilterWrapper);
                }

                this.updateSortByLabel();
            } catch (err) {
                console.error('Failed to load page:', err);
                window.location.href = url;
            } finally {
                this.loading = false;
            }
        },
    };
}

// Mount after Alpine is ready, even if Alpine already started
(function () {
    if (typeof window === 'undefined') return;

    window.collectionFilters = collectionFilters;

    function mountCollectionFilters() {
        document.querySelectorAll('[data-collection-root]').forEach((el) => {
            if (el.__collectionMounted) return;
            el.setAttribute('x-data', 'collectionFilters');
            el.setAttribute('x-init', 'init()');
            if (window.Alpine) window.Alpine.initTree(el);
            el.__collectionMounted = true;
        });
    }

    function register() {
        if (window.Alpine && window.Alpine.data) {
            window.Alpine.data('collectionFilters', collectionFilters);
        }
        mountCollectionFilters();
    }

    if (window.Alpine) {
        // Alpine already on page
        register();
    } else {
        document.addEventListener('alpine:init', register, { once: true });
    }

    // In case DOM finishes later (or on back/forward)
    document.addEventListener('DOMContentLoaded', mountCollectionFilters, { once: true });
    window.addEventListener('popstate', mountCollectionFilters);
})();