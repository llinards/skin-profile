function collectionFilters() {
    return {
        loading: false,

        updateSortByLabel() {
            // Use translated labels from Liquid if available, fallback to Latvian
            const sortLabels = window.sortLabelsTranslated || {
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

                // sync checkboxes with same name/value
                document.querySelectorAll(`.filter-checkbox[name="${name}"][value="${value}"]`)
                    .forEach((box) => (box !== event.target ? (box.checked = checked) : null));
            }

            setTimeout(() => {
                const params = new URLSearchParams(window.location.search);
                const newParams = new URLSearchParams();

                // keep non-filter params but remove "page"
                for (const [key, value] of params.entries()) {
                    if (!key.startsWith('filter.') && key !== 'page') {
                        newParams.append(key, value);
                    }
                }

                // append active filters
                document.querySelectorAll('.filter-checkbox:checked').forEach((box) => {
                    newParams.append(box.name, box.value);
                });

                const qs = newParams.toString();
                const newUrl = qs ? `${location.pathname}?${qs}` : location.pathname;

                this.loadPage(newUrl);
            });
        },

        clearFilterGroup(paramName) {
            document.querySelectorAll(`.filter-checkbox[data-param="${paramName}"]`)
                .forEach((box) => (box.checked = false));
            this.handleFilterChange(null);
        },

        init() {
            this.updateSortByLabel();

            window.clearFilterGroup = this.clearFilterGroup.bind(this);

            this.$el.addEventListener('click', (e) => {
                const link = e.target.closest('a.pagination-link, a.filter-link, a.category-card');
                if (!link) return;

                e.preventDefault();
                this.loadPage(link.href);

                setTimeout(() => {
                    document.getElementById('products')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                    });
                }, 100);
            });

            this.$el.addEventListener('change', (e) => {
                if (e.target.classList.contains('filter-checkbox')) {
                    this.handleFilterChange(e);
                }
            });
        },

        async loadPage(url) {
            if (this.loading) return;
            this.loading = true;

            try {
                history.pushState({}, '', url);
                const html = await (await fetch(url)).text();
                const doc = new DOMParser().parseFromString(html, 'text/html');

                const replaceEl = (ref) => {
                    const newContent = doc.querySelector(`[x-ref="${ref}"]`);
                    if (newContent && this.$refs[ref]) {
                        this.$refs[ref].innerHTML = newContent.innerHTML;
                        if (window.Alpine) window.Alpine.initTree(this.$refs[ref]);
                    }
                };

                replaceEl('productGrid');
                replaceEl('pagination');
                replaceEl('filtersDesktop');
                replaceEl('mobileFilterWrapper');

                this.updateSortByLabel();
            } catch (err) {
                console.error('Failed to load page:', err);
                location.href = url;
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
        if (window.Alpine?.data) {
            window.Alpine.data('collectionFilters', collectionFilters);
        }
        mountCollectionFilters();
    }

    window.Alpine ? register() : document.addEventListener('alpine:init', register, { once: true });

    document.addEventListener('DOMContentLoaded', mountCollectionFilters, { once: true });
    window.addEventListener('popstate', mountCollectionFilters);
})();
