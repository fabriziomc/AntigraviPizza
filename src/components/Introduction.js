import { updateUserSettings } from '../modules/database.js';

/**
 * Introduction / Onboarding Component
 * Renders a premium interactive manual for new users
 */

const SLIDES = [
    {
        id: 'welcome',
        title: 'Benvenuto su AntigraviPizza! 🍕',
        description: 'La tua stazione di comando definitiva per la creazione di pizze gourmet. Gestisci ricette, pianifica serate e stupisci i tuoi ospiti.',
        icon: '🚀',
        color: '#f59e0b'
    },
    {
        id: 'recipes',
        title: 'Le Tue Ricette Gourmet 📖',
        description: 'Crea e organizza le tue ricette. Usa gli Archetipi per calcolare automaticamente le dosi perfette in base al peso del panetto o alla dimensione della teglia.',
        icon: '🧪',
        color: '#10b981'
    },
    {
        id: 'planner',
        title: 'Serate Pizza Perfette 🗓️',
        description: 'Pianifica i tuoi eventi, invita gli ospiti e genera la lista della spesa. Il sistema calcola tutto: dagli impasti alle preparazioni necessarie.',
        icon: '📅',
        color: '#3b82f6'
    },
    {
        id: 'guests',
        title: 'Ospiti e Temi 🎨',
        description: 'Condividi un link unico con i tuoi ospiti. Potranno vedere il menu, scegliere i gusti (se lo desiderano) e immergersi nel tema che hai scelto.',
        icon: '✨',
        color: '#8b5cf6'
    },
    {
        id: 'live',
        title: 'Modalità Live ⏱️',
        description: 'Durante la serata, usa la Modalità Live per tenere traccia delle pizze sfornate, gestire i tempi di cottura e ricevere i feedback in tempo reale dagli ospiti.',
        icon: '🔥',
        color: '#ef4444'
    }
];

export async function renderIntroduction() {
    const container = document.body;

    // Remove if already exists
    const existing = document.getElementById('onboardingOverlay');
    if (existing) existing.remove();

    // Create modal element
    const overlay = document.createElement('div');
    overlay.id = 'onboardingOverlay';
    overlay.className = 'onboarding-overlay';

    let currentSlide = 0;

    const updateContent = () => {
        const slide = SLIDES[currentSlide];
        const isLast = currentSlide === SLIDES.length - 1;

        overlay.innerHTML = `
            <div class="onboarding-card">
                <div class="onboarding-progress">
                    ${SLIDES.map((_, i) => `<div class="progress-dot ${i === currentSlide ? 'active' : ''}"></div>`).join('')}
                </div>
                
                <div class="onboarding-icon" style="background: ${slide.color}20; color: ${slide.color}">
                    ${slide.icon}
                </div>
                
                <h2 class="onboarding-title">${slide.title}</h2>
                <p class="onboarding-text">${slide.description}</p>
                
                <div class="onboarding-actions">
                    ${currentSlide > 0 ? `<button class="btn-onboarding secondary" id="prevOnboarding">Indietro</button>` : '<div></div>'}
                    <button class="btn-onboarding primary" id="nextOnboarding">
                        ${isLast ? 'Inizia Ora 🍕' : 'Avanti'}
                    </button>
                </div>
                
                <button class="onboarding-skip" id="skipOnboarding">Salta guida</button>
            </div>
        `;

        // Add Listeners (using overlay.querySelector since it's not in DOM yet or to be safe)
        const nextBtn = overlay.querySelector('#nextOnboarding');
        const prevBtn = overlay.querySelector('#prevOnboarding');
        const skipBtn = overlay.querySelector('#skipOnboarding');

        if (nextBtn) {
            nextBtn.addEventListener('click', async () => {
                if (isLast) {
                    await finishOnboarding();
                } else {
                    currentSlide++;
                    updateContent();
                }
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentSlide--;
                updateContent();
            });
        }

        if (skipBtn) {
            skipBtn.addEventListener('click', finishOnboarding);
        }
    };

    const finishOnboarding = async () => {
        overlay.classList.add('closing');
        try {
            await updateUserSettings({ hasSeenOnboarding: 1 });
            console.log('✅ Onboarding marked as seen');
        } catch (err) {
            console.error('Failed to update onboarding status:', err);
        }

        setTimeout(() => {
            overlay.remove();
        }, 500);
    };

    // Initial render
    updateContent();
    container.appendChild(overlay);
}
