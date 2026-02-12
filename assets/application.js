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

// Return-to-store helper for cart page
(function () {
    'use strict';
    if (typeof window === 'undefined') return;

    const STORAGE_KEY = 'sp:return_to_store_url';
    const pathname = window.location.pathname || '';
    const isCartPage = pathname === '/cart' || pathname.startsWith('/cart/');
    const isCheckout = pathname.startsWith('/checkout');
    const isCollectionPage = pathname.startsWith('/collections/');

    // Store last collection URL (preserves query params like filters/sort)
    try {
        if (!isCartPage && !isCheckout && isCollectionPage) {
            localStorage.setItem(STORAGE_KEY, window.location.href);
        }
    } catch (_) {
        // Ignore storage errors (private mode, disabled storage, etc.)
    }

    function isSafeCollectionUrl(rawUrl) {
        if (!rawUrl) return false;
        let url;
        try {
            url = new URL(rawUrl, window.location.origin);
        } catch (_) {
            return false;
        }
        if (url.origin !== window.location.origin) return false;
        if (!url.pathname.startsWith('/collections/')) return false;
        return true;
    }

    function applyReturnToStoreUrl() {
        if (!isCartPage) return;
        let storedUrl = null;
        try {
            storedUrl = localStorage.getItem(STORAGE_KEY);
        } catch (_) {
            storedUrl = null;
        }
        if (!isSafeCollectionUrl(storedUrl)) return;

        document.querySelectorAll('[data-return-to-store]').forEach((container) => {
            const link = container.querySelector('a[href]');
            if (link) link.href = storedUrl;
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyReturnToStoreUrl);
    } else {
        applyReturnToStoreUrl();
    }
})();