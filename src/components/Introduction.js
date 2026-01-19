import { updateUserSettings } from '../modules/database.js';

/**
 * Introduction / Onboarding Component
 * Renders a premium interactive manual for new users
 */

const SLIDES = [
    {
        id: 'ingredients',
        title: 'Gestisci il tuo Arsenale Pizzaiolo',
        icon: '🧑‍🍳',
        color: '#f59e0b',
        sections: [
            {
                subtitle: 'Ingredienti',
                points: [
                    'Aggiungi ingredienti base (formaggi, salumi, verdure, spezie)',
                    'Definisci quantità minime e massime per ogni ingrediente',
                    'Organizza per categorie e stagionalità',
                    'Gestisci allergeni e tag (vegano, piccante, premium, ecc.)'
                ]
            },
            {
                subtitle: 'Preparazioni',
                points: [
                    'Crea preparazioni complesse (creme, salse, condimenti speciali)',
                    'Combina più ingredienti in una singola preparazione',
                    'Specifica tempi di preparazione e difficoltà',
                    'Aggiungi link a ricette esterne per riferimento'
                ]
            }
        ],
        tip: '💡 Inizia importando gli ingredienti base dal database predefinito, poi personalizza con i tuoi ingredienti preferiti!'
    },
    {
        id: 'generation',
        title: 'Crea Pizze Straordinarie con l\'AI',
        icon: '🤖',
        color: '#10b981',
        sections: [
            {
                subtitle: 'Archetipi',
                description: 'Gli archetipi sono "stili" di pizza che guidano la generazione:',
                points: [
                    'Classica: Napoletana tradizionale con ingredienti iconici',
                    'Terra e Bosco: Funghi, tartufi e sapori autunnali',
                    'Fresca Estiva: Ingredienti a crudo e leggeri',
                    'Piccante Decisa: Per chi ama il carattere forte',
                    'Mare: Pesce e frutti di mare',
                    'Vegana: 100% vegetale'
                ]
            },
            {
                subtitle: 'Generazione Automatica',
                points: [
                    'Clicca "Genera Pizza" per creare ricette uniche',
                    'L\'AI seleziona ingredienti compatibili e bilanciati',
                    'Ogni pizza è accompagnata da descrizione e immagine',
                    'Personalizza il risultato a tuo piacimento'
                ]
            }
        ],
        tip: '🎨 Genera più pizze e salva le tue preferite per le serate!'
    },
    {
        id: 'planning',
        title: 'Organizza Serate Pizza Indimenticabili',
        icon: '📅',
        color: '#3b82f6',
        sections: [
            {
                subtitle: 'Crea una Serata',
                points: [
                    'Scegli data, ora e numero di ospiti',
                    'Seleziona le pizze dal tuo ricettario',
                    'Definisci l\'impasto e le quantità',
                    'Aggiungi note e temi speciali'
                ]
            },
            {
                subtitle: 'Gestione Ospiti',
                points: [
                    'Crea la tua rubrica ospiti con nome, email e telefono',
                    'Invita gli ospiti tramite email con link personalizzato',
                    'Tieni traccia di allergie e preferenze',
                    'Gli ospiti possono vedere il menu in anteprima'
                ]
            },
            {
                subtitle: 'Lista della Spesa',
                points: [
                    'Genera automaticamente la lista ingredienti',
                    'Esporta su Bring! per la spesa condivisa',
                    'Calcola le quantità in base al numero di ospiti'
                ]
            }
        ],
        tip: '📧 Invia gli inviti con anticipo! Gli ospiti riceveranno un link per vedere il menu e votare le pizze preferite.'
    },
    {
        id: 'live',
        title: 'Gestisci la Serata in Tempo Reale',
        icon: '🔥',
        color: '#ef4444',
        sections: [
            {
                subtitle: 'Modalità Live',
                points: [
                    'Visualizza le pizze in ordine di preparazione',
                    'Segna le pizze come "In preparazione" o "Servita"',
                    'Vedi le istruzioni di cottura per ogni pizza',
                    'Timer e promemoria per la gestione del forno'
                ]
            },
            {
                subtitle: 'Votazioni in Tempo Reale',
                points: [
                    'Gli ospiti votano le pizze dal loro smartphone',
                    'Vedi i voti in diretta sulla dashboard',
                    'Classifica automatica delle pizze più apprezzate',
                    'Statistiche e feedback immediati'
                ]
            },
            {
                subtitle: 'Pagina Ospite',
                description: 'Gli ospiti accedono tramite QR code o link e possono:',
                points: [
                    'Vedere il menu completo con foto',
                    'Votare le pizze (da 1 a 5 stelle)',
                    'Visualizzare ingredienti e allergeni',
                    'Seguire l\'andamento della serata'
                ]
            }
        ],
        tip: '🍕 Proietta la dashboard su uno schermo per coinvolgere tutti gli ospiti!'
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

        // Build sections HTML
        const sectionsHTML = slide.sections.map(section => `
            <div class="onboarding-section">
                <h3 class="section-subtitle">${section.subtitle}</h3>
                ${section.description ? `<p class="section-description">${section.description}</p>` : ''}
                <ul class="section-points">
                    ${section.points.map(point => `<li>${point}</li>`).join('')}
                </ul>
            </div>
        `).join('');

        overlay.innerHTML = `
            <div class="onboarding-card">
                <div class="onboarding-progress">
                    ${SLIDES.map((_, i) => `<div class="progress-dot ${i === currentSlide ? 'active' : ''}"></div>`).join('')}
                </div>
                
                <div class="onboarding-icon" style="background: ${slide.color}20; color: ${slide.color}">
                    ${slide.icon}
                </div>
                
                <h2 class="onboarding-title">${slide.title}</h2>
                
                <div class="onboarding-content">
                    ${sectionsHTML}
                </div>
                
                ${slide.tip ? `<div class="onboarding-tip">${slide.tip}</div>` : ''}
                
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
