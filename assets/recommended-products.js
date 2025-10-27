class RecommendedProducts extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.loadRecommendations()
    }

    async loadRecommendations() {
        try {
            const url = `${this.dataset.url}&product_id=${this.dataset.productId}&section_id=${this.dataset.sectionId}`;

            const response = await fetch(url);

            if (!response.ok) {
                console.error('Failed to fetch recommendations:', response.status);
                this.dispatchEvent(new CustomEvent('recommendations-loaded'));
                return;
            }

            const responseHTML = await response.text();
            const html = document.createElement('div');
            html.innerHTML = responseHTML;

            const recommendations = html.querySelector('recommended-products');

            if (recommendations?.innerHTML.trim().length > 0) {
                this.innerHTML = recommendations.innerHTML;

                // Initialize carousel after content is loaded
                setTimeout(() => {
                    const carouselElement = document.getElementById('productRecommendationCarousel');
                    if (carouselElement && typeof Carousel !== 'undefined') {
                        Carousel(carouselElement, {
                            fill: true,
                            infinite: false,
                            plugins: [window.Dots],
                        }).init();
                    }
                }, 100); // Small delay to ensure DOM is ready
            }

            // Dispatch event to hide loading spinner
            this.dispatchEvent(new CustomEvent('recommendations-loaded'));

        } catch (error) {
            console.error('Error loading recommendations:', error);
            this.dispatchEvent(new CustomEvent('recommendations-loaded'));
        }
    }
}

customElements.define("recommended-products", RecommendedProducts)