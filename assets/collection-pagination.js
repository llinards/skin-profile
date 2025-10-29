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

            const urlParams = new URLSearchParams(window.location.search);
            const sortKey = urlParams.get('sort_by') || 'manual';

            // FIX: Select ALL elements with the ID, not just the first one.
            const labelElements = document.querySelectorAll('#sort-by-label');

            // Loop through each found element (one for desktop, one for mobile)
            labelElements.forEach((labelElement) => {
                if (labelElement) {
                    // Update the button's text
                    if (sortLabels[sortKey]) {
                        labelElement.innerHTML = sortLabels[sortKey];
                    }

                    // Update the active item styling within its dropdown
                    const dropdownContainer = labelElement.closest('.relative');
                    if (dropdownContainer) {
                        const links = dropdownContainer.querySelectorAll('a.filter-link');
                        const activeLinkUrlPart = `sort_by=${sortKey}`;

                        links.forEach((link) => {
                            link.classList.remove(...activeClasses);
                            if (link.href.includes(activeLinkUrlPart)) {
                                link.classList.add(...activeClasses);
                            }
                        });
                    }
                }
            });
        },

        init() {
            this.updateSortByLabel();

            // Use document instead of this.$el to catch clicks anywhere on the page
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a.pagination-link, a.filter-link, a.category-card');
                if (link) {
                    e.preventDefault();
                    this.loadPage(link.href);

                    // Scroll to products section after triggering the load
                    setTimeout(() => {
                        const productGridElement = document.getElementById('products');
                        if (productGridElement) {
                            productGridElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 100);
                }
            });
        },

        async loadPage(url) {
            if (this.loading) return;
            this.loading = true;

            try {
                // Update URL first so updateSortByLabel reads correct params
                window.history.pushState({}, '', url);

                const response = await fetch(url);
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // Update product grid
                const newGrid = doc.querySelector('[x-ref="productGrid"]');
                if (newGrid) {
                    this.$refs.productGrid.innerHTML = newGrid.innerHTML;
                }

                // Update pagination
                const newPagination = doc.querySelector('[x-ref="pagination"]');
                if (newPagination && this.$refs.pagination) {
                    this.$refs.pagination.innerHTML = newPagination.innerHTML;
                }

                // Update DESKTOP filters
                const newDesktopFilters = doc.querySelector('[x-ref="filtersDesktop"]');
                if (newDesktopFilters && this.$refs.filtersDesktop) {
                    this.$refs.filtersDesktop.innerHTML = newDesktopFilters.innerHTML;
                    if (window.Alpine) {
                        window.Alpine.initTree(this.$refs.filtersDesktop);
                    }
                }

                // Update MOBILE filters - now update the entire wrapper
                const newMobileWrapper = doc.querySelector('[x-ref="mobileFilterWrapper"]');
                if (newMobileWrapper && this.$refs.mobileFilterWrapper) {
                    this.$refs.mobileFilterWrapper.innerHTML = newMobileWrapper.innerHTML;
                    if (window.Alpine) {
                        window.Alpine.initTree(this.$refs.mobileFilterWrapper);
                    }
                }

                // Then update the sort label for both views
                this.updateSortByLabel();
            } catch (error) {
                console.error('Failed to load page:', error);
                window.location.href = url;
            } finally {
                this.loading = false;
            }
        },
    };
}

if (typeof window !== 'undefined') {
    window.collectionFilters = collectionFilters;
}