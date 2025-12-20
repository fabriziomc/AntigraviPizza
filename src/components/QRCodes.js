// QRCodes.js - Vanilla JS module for displaying QR codes
import QRCode from 'qrcode';

export async function renderQRCodes(state) {
    const container = document.getElementById('qrcodes-view');

    // Get pizzaNightId from state or URL hash
    const hash = window.location.hash;
    const match = hash.match(/#qrcodes\/([^\/]+)/);
    const pizzaNightId = match ? match[1] : null;

    if (!pizzaNightId) {
        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">QR Codes Ospiti</h1>
            </div>
            <div class="empty-state">
                <div class="empty-icon">🎫</div>
                <h3 class="empty-title">Seleziona una Serata Pizza</h3>
                <p class="empty-description">Vai alla sezione "Pianifica" e clicca su una serata per generare i QR codes</p>
            </div>
        `;
        return;
    }

    try {
        // Fetch pizza night data
        const response = await fetch(`/api/pizza-nights/${pizzaNightId}`);
        if (!response.ok) {
            throw new Error('Serata pizza non trovata');
        }

        const pizzaNight = await response.json();

        if (!pizzaNight.guests || pizzaNight.guests.length === 0) {
            container.innerHTML = `
                <div class="page-header">
                    <h1 class="page-title">QR Codes - ${pizzaNight.name}</h1>
                </div>
                <div class="empty-state">
                    <div class="empty-icon">👥</div>
                    <h3 class="empty-title">Nessun Ospite</h3>
                    <p class="empty-description">Aggiungi ospiti a questa serata per generare i QR codes</p>
                </div>
            `;
            return;
        }

        // Render header
        const date = new Date(pizzaNight.date).toLocaleDateString('it-IT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">QR Codes - ${pizzaNight.name}</h1>
                <p class="page-description">${date}</p>
            </div>
            
            <div class="actions-bar mb-6 no-print">
                <button id="printQRCodesBtn" class="btn btn-primary">
                    <span>🖨️</span>
                    Stampa QR Codes
                </button>
            </div>
            
            <div class="grid grid-3" id="qrCodesGrid">
                <!-- QR codes will be generated here -->
            </div>
            
            <div class="card no-print" style="margin-top: 2rem;">
                <p><strong>Istruzioni:</strong> Ogni ospite può scannerizzare il proprio QR code per accedere a una pagina personalizzata con gli auguri di Natale!</p>
            </div>
        `;

        // Generate QR codes
        const grid = document.getElementById('qrCodesGrid');
        const baseUrl = window.location.origin;

        for (const guest of pizzaNight.guests) {
            const guestUrl = `${baseUrl}/guest.html#guest/${pizzaNightId}/${guest.id}`;

            // Create card
            const card = document.createElement('div');
            card.className = 'card';
            card.style.cssText = 'text-align: center; page-break-inside: avoid;';
            card.innerHTML = `
                <div id="qr-${guest.id}" style="display: flex; justify-content: center; padding: 1rem; background: #f9f9f9; border-radius: 8px; margin-bottom: 1rem;"></div>
                <h3 style="color: var(--color-primary); margin: 0 0 0.5rem 0;">${guest.name}</h3>
                <p style="font-size: 0.75rem; color: var(--color-gray-400); word-break: break-all; margin: 0;">${guestUrl}</p>
            `;
            grid.appendChild(card);

            // Generate QR code
            const qrWrapper = document.getElementById(`qr-${guest.id}`);
            const canvas = document.createElement('canvas');
            qrWrapper.appendChild(canvas);

            await QRCode.toCanvas(canvas, guestUrl, {
                width: 200,
                margin: 2,
                errorCorrectionLevel: 'H'
            });
        }

        // Setup print listener
        document.getElementById('printQRCodesBtn').addEventListener('click', () => {
            window.print();
        });

    } catch (error) {
        console.error('Error loading QR codes:', error);
        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Errore</h1>
            </div>
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <h3 class="empty-title">Errore di Caricamento</h3>
                <p class="empty-description">${error.message}</p>
            </div>
        `;
    }
}
