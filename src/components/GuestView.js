import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './GuestView.css';

export default function GuestView() {
    const { pizzaNightId, guestId } = useParams();
    const [pizzaNight, setPizzaNight] = useState(null);
    const [guest, setGuest] = useState(null);
    const [themeData, setThemeData] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get deterministic message for this guest based on theme
    const getMessageForGuest = (messages, guestId) => {
        // Simple hash function to get consistent index
        let hash = 0;
        for (let i = 0; i < guestId.length; i++) {
            hash = ((hash << 5) - hash) + guestId.charCodeAt(i);
            hash = hash & hash; // Convert to 32bit integer
        }
        const index = Math.abs(hash) % messages.length;
        return messages[index];
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch pizza night data with cache busting
                console.log(`🔍 [GuestView] Fetching night ${pizzaNightId}...`);
                const pizzaNightResponse = await fetch(`/api/pizza-nights/${pizzaNightId}?t=${Date.now()}`);
                if (!pizzaNightResponse.ok) throw new Error('Serata pizza non trovata');
                const pizzaNightData = await pizzaNightResponse.json();
                console.log('✅ [GuestView] Data received:', pizzaNightData);


                // Fetch theme data
                const themeResponse = await fetch(`/api/pizza-nights/${pizzaNightId}/theme`);
                if (!themeResponse.ok) throw new Error('Tema non trovato');
                const theme = await themeResponse.json();

                // Find guest
                const guestData = pizzaNightData.guests
                    ? pizzaNightData.guests.find(g => g.id === guestId)
                    : null;

                if (!guestData) throw new Error('Ospite non trovato');

                setPizzaNight(pizzaNightData);
                setGuest(guestData);
                setThemeData(theme);

                // Set deterministic message for this guest
                setMessage(getMessageForGuest(theme.messages, guestId));
                setLoading(false);

            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [pizzaNightId, guestId]);

    // Refresh message (picks a new random one)
    const refreshMessage = () => {
        if (themeData) {
            const randomIndex = Math.floor(Math.random() * themeData.messages.length);
            setMessage(themeData.messages[randomIndex]);
        }
    };

    if (loading) {
        return (
            <div className="guest-view loading">
                <div className="spinner"></div>
                <p>Caricamento...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="guest-view error">
                <h2>⚠️ Errore</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="guest-view" style={{ background: themeData?.config?.gradient }}>
            <div className="christmas-card">
                {pizzaNight.imageUrl ? (
                    <img src={pizzaNight.imageUrl} alt={pizzaNight.name} className="header-image" />
                ) : themeData?.config?.imagePath ? (
                    <img src={themeData.config.imagePath} alt="Theme Header" className="header-image" />
                ) : (
                    <div className="header-emoji">{themeData?.config?.emoji || '🍕'}</div>
                )}

                <div className="card-header">
                    <h1 className="pizza-night-name">{pizzaNight.name}</h1>
                    <div className="date-info">
                        📅 {new Date(pizzaNight.date).toLocaleDateString('it-IT', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>
                </div>

                <div className="guest-welcome">
                    <h2 className="guest-name">Ciao, {guest.name}! 👋</h2>
                </div>

                <div className="decorations">{themeData?.config?.decorations}</div>

                <div className="christmas-message" onClick={refreshMessage} title="Clicca per un nuovo messaggio">
                    <p>{message}</p>
                    <small className="refresh-hint">✨ Clicca per un nuovo messaggio</small>
                </div>

                <div className="signature">
                    Con affetto,<br />
                    <strong>Il Team AntigraviPizza</strong> 🍕❤️
                </div>
            </div>
        </div>
    );
}
