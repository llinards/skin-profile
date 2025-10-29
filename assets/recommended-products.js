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
                this.dispatchEvent(new CustomEvent('carousel-initialized', { bubbles: true }));
                return;
            }

            const responseHTML = await response.text();
            const html = document.createElement('div');
            html.innerHTML = responseHTML;

            const recommendations = html.querySelector('recommended-products');

            if (recommendations?.innerHTML.trim().length > 0) {
                this.innerHTML = recommendations.innerHTML;

                this.dispatchEvent(new CustomEvent('recommendations-found', { bubbles: true }));

                setTimeout(() => {
                    const container = document.getElementById('productRecommendationCarousel');

                    if (container && typeof Carousel !== 'undefined') {
                        const options = {
                            fill: true,
                            infinite: false,
                            plugins: [window.Dots],

                        };

                        // Corrected syntax
                        Carousel(container, options).init();

                        setTimeout(() => {
                            this.dispatchEvent(new CustomEvent('carousel-initialized', { bubbles: true }));
                        }, 200);
                    } else {
                        this.dispatchEvent(new CustomEvent('carousel-initialized', { bubbles: true }));
                    }
                }, 200);
            } else {
                this.dispatchEvent(new CustomEvent('carousel-initialized', { bubbles: true }));
            }

        } catch (error) {
            console.error('Error loading recommendations:', error);
            this.dispatchEvent(new CustomEvent('carousel-initialized', { bubbles: true }));
        }
    }
}

customElements.define("recommended-products", RecommendedProducts)