// Mobile nav toggle
function initializeNavToggle() {
    const toggle = document.getElementById('navToggle');
    const header = document.querySelector('.site-header');
    if (!toggle || !header) {
        return;
    }

    toggle.addEventListener('click', function() {
        const isOpen = header.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    header.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', () => {
            header.classList.remove('nav-open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// Footer copyright year
function initializeFooterYear() {
    const yearEl = document.getElementById('footerYear');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeNavToggle();
    initializeFooterYear();
});
