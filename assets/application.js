function handleMobileMenu() {
    return {
        open: false,
        init() {
            // Ensure stickiness
            this.$watch('open', (value) => {
                document.body.style.overflow = value ? 'hidden' : 'auto';
            });

            // Ensures menu removal when screen is resized
            window.addEventListener('resize', () => {
                if (window.innerWidth >= 1024) {
                    this.open = false;
                    document.body.style.overflow = 'auto';
                }
            });
        },
        scrollToSection(id) {
            this.open = false; // close menu
            document.body.style.overflow = 'auto'; // reset scroll lock

            // Delay scroll until after the menu transition finishes
            setTimeout(() => {
                document.getElementById(id)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 300); // match your x-transition: duration (300ms)
        }
    };
}

const observer = new IntersectionObserver((entries, options) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show')
        }
    });
}, { threshold: 0.2 })

const hiddenElements = document.querySelectorAll('.transition-hide')
hiddenElements.forEach((el) => observer.observe(el));