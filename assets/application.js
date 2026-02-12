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
                window.spScrollToIdWithOffset(id, { behavior: 'smooth' });
            }, 300); // match your x-transition: duration (300ms)
        }
    };
}

// Scroll helper: accounts for sticky header + layout shifts from IO-revealed sections
(function () {
    if (typeof window === 'undefined') return;
    if (window.spScrollToIdWithOffset) return;

    function getHeaderOffset() {
        const header = document.querySelector('header');
        const headerHeight = header ? header.getBoundingClientRect().height : 0;
        // Extra breathing room so the section title isn't glued to the header
        return Math.round(headerHeight + 12);
    }

    function scrollToElWithOffset(el, { behavior = 'auto' } = {}) {
        if (!el) return false;
        const offset = getHeaderOffset();
        const y = window.scrollY + el.getBoundingClientRect().top - offset;
        window.scrollTo({ top: Math.max(0, Math.round(y)), behavior });
        return true;
    }

    window.spScrollToIdWithOffset = function (id, { behavior = 'auto', retries = 8 } = {}) {
        const el = document.getElementById(id);
        if (!el) return false;

        // Initial scroll
        scrollToElWithOffset(el, { behavior });

        // Retry a few times to counter layout shifts as IO reveals content/images load
        let attempts = 0;
        const tick = () => {
            attempts += 1;
            if (attempts > retries) return;
            scrollToElWithOffset(el, { behavior: 'auto' });
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);

        return true;
    };

    function handleHashScroll() {
        const raw = window.location.hash;
        if (!raw || raw.length < 2) return;
        const id = decodeURIComponent(raw.slice(1));

        // Let the browser finish default hash jump, then correct it
        setTimeout(() => {
            window.spScrollToIdWithOffset(id, { behavior: 'auto' });
        }, 0);
    }

    // Initial page load with a hash
    document.addEventListener('DOMContentLoaded', handleHashScroll);
    // Clicking anchor links (hash changes)
    window.addEventListener('hashchange', handleHashScroll);
})();

const observer = new IntersectionObserver((entries, options) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show')
        }
    });
}, { threshold: 0.2 })

const hiddenElements = document.querySelectorAll('.transition-hide')
hiddenElements.forEach((el) => observer.observe(el));