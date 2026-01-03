// ============================================
// UI UTILITIES
// ============================================

export function openModal(content) {
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalContent = document.getElementById('modalContent');

    if (modalContent && modalBackdrop) {
        modalContent.innerHTML = content;
        modalBackdrop.classList.add('active');
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    } else {
        console.error('Modal elements not found');
    }
}

export function closeModal() {
    const modalBackdrop = document.getElementById('modalBackdrop');
    if (modalBackdrop) {
        modalBackdrop.classList.remove('active');
        // Restore body scroll
        document.body.style.overflow = '';
    }

    // Also close preview modal if open
    const previewModalBackdrop = document.getElementById('previewModalBackdrop');
    if (previewModalBackdrop) {
        previewModalBackdrop.classList.remove('active');
    }
}

/**
 * Mobile sidebar toggle logic
 */
export function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
    }
}

/**
 * Setup global UI listeners for mobile
 */
export function setupSidebarListeners() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('mobileMenuToggle');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSidebar();
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('mobile-open')) {
            if (!sidebar.contains(e.target) && e.target !== toggleBtn) {
                sidebar.classList.remove('mobile-open');
            }
        }
    });

    // Close sidebar when clicking a nav link on mobile
    const navMenu = document.getElementById('navMenu');
    if (navMenu) {
        navMenu.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && (e.target.closest('.nav-link') || e.target.closest('.nav-item'))) {
                sidebar.classList.remove('mobile-open');
            }
        });
    }
}

// Global window assignments for simple onclick handlers
window.closeModal = closeModal;
window.toggleSidebar = toggleSidebar;
