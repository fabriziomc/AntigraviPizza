import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './GuestView.css';

const CHRISTMAS_MESSAGES = [
    "🎄 Buon Natale! Che questa serata pizza sia piena di gioia e buon cibo!",
    "🎅 Auguri di Natale! Goditi questa serata speciale con pizza e amici!",
    "⭐ Tanti auguri di Natale! Che ogni fetta porti felicità!",
    "🎁 Buone Feste! Questa pizza è il nostro regalo per te!",
    "❄️ Auguri di Natale! Che la magia del Natale renda questa serata indimenticabile!",
    "🔔 Buon Natale! Mangiamo pizza e festeggiamo insieme!",
    "🌟 Auguri! Che questa serata pizza sia il miglior regalo di Natale!",
    "🎊 Tanti auguri! Pizza, amici e spirito natalizio: la ricetta perfetta!",
    "🎉 Buon Natale! Lasciati conquistare dalla magia della pizza!",
    "🍕 Auguri di Natale! Ogni morso è un piccolo miracolo natalizio!"
];

export default function GuestView() {
    const { pizzaNightId, guestId } = useParams();
    const [data, setData] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get random Christmas message
    const getRandomMessage = () => {
        const randomIndex = Math.floor(Math.random() * CHRISTMAS_MESSAGES.length);
        return CHRISTMAS_MESSAGES[randomIndex];
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/guest/${pizzaNightId}/${guestId}`);
                if (!response.ok) {
                    throw new Error('Dati non trovati');
                }
                const result = await response.json();
                setData(result);
                setMessage(getRandomMessage());
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [pizzaNightId, guestId]);

    // Refresh message on click
    const refreshMessage = () => {
        setMessage(getRandomMessage());
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
        <div className="guest-view">
            <div className="christmas-card">
                <div className="card-header">
                    <h1 className="pizza-night-name">{data.pizzaNight.name}</h1>
                    <div className="date-info">
                        📅 {new Date(data.pizzaNight.date).toLocaleDateString('it-IT', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>
                </div>

                <div className="guest-welcome">
                    <h2 className="guest-name">Benvenuto, {data.guest.name}! 👋</h2>
                </div>

                <div className="christmas-message" onClick={refreshMessage} title="Clicca per un nuovo messaggio">
                    <p>{message}</p>
                    <small className="refresh-hint">✨ Clicca per un nuovo messaggio</small>
                </div>

                <div className="pizza-emoji">
                    🍕
                </div>
            </div>
        </div>
    );
}
