class CollectionFilters extends HTMLElement {
    constructor() {
        super();
    }

    get sectionId() {
        return this.dataset.sectionId
    }

    connectedCallback() {
        this.filterInputs = this.querySelectorAll('input')
        this.handleClick = this.handleClick.bind(this)

        this.filterInputs.forEach((input) => {
            input.addEventListener('change', this.handleClick)
            console.log('hello')
        })
    }

    handleClick(event) {
        const input = event.currentTarget;
        const url = new URL(input.checked ? input.dataset.addUrl : input.dataset.removeUrl, window.location.origin)

        url.searchParams.set('section_id', this.sectionId)

        fetch(url.toString())
            .then((response) => {
                return response.text();
            })
            .then((html) => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                document.querySelector('.collection-inner').innerHTML = tempDiv.querySelector('.collection-inner').innerHTML;

                url.searchParams.delete('section_id');
                window.history.pushState({}, '', url.toString())
            })
    }
}
customElements.define('collection-filters', CollectionFilters)