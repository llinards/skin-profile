class RecommendedProducts extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.loadRecommendations()
    }

    async loadRecommendations() {
        const response = await fetch(`${this.dataset.url}&product_id=${this.dataset.productId}&section_id=${this.dataset.sectionId}`);
        const responseHTML = await response.text();
        const html = document.createElement('div');
        html.innerHTML = responseHTML;

        const recommendations = html.querySelector('recommended-products');
        if (recommendations?.innerHTML.trim().length > 0) {
            this.innerHTML = recommendations.innerHTML;
        }
    }
}

customElements.define("recommended-products", RecommendedProducts)