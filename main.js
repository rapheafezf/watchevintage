// Watch & Vintage Redesign - Interactions & Navigation
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Drawer Toggle
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const siteNav = document.querySelector('.site-nav');
  if (toggleBtn && siteNav) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      siteNav.classList.toggle('is-open');
    });

    document.addEventListener('click', (e) => {
      if (!siteNav.contains(e.target) && !toggleBtn.contains(e.target)) {
        siteNav.classList.remove('is-open');
      }
    });
  }

  // Header Scroll Elevation
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
      } else {
        header.style.boxShadow = 'none';
      }
    });
  }
});
