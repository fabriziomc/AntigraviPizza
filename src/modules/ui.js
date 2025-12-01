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
}
