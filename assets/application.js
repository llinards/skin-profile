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