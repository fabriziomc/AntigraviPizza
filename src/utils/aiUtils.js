/**
 * AI Utilities for AntigraviPizza
 * Handles communication with Gemini API for text generation
 */

/**
 * Generate gourmet pizza recipes using Google Gemini API
 * @param {string} apiKey - Gemini API Key
 * @param {number} count - Number of recipes to generate (1-20)
 * @returns {Promise<string>} Generated recipes in importable text format
 */
export async function generateRecipesWithAI(apiKey, count = 1) {
    if (!apiKey) {
        throw new Error('API Key Gemini mancante nelle impostazioni.');
    }

    // Using Gemini 1.5 Flash - fast and reliable for text generation
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `Sei un esperto pizzaiolo gourmet italiano. 
Genera esattamente ${count} ricette di pizza gourmet originale, creativa e deliziosa.
Ogni ricetta DEVE seguire RIGOROSAMENTE questo formato testuale (senza markdown extra, solo testo pulito):

[Numero]. [Nome Pizza]
In cottura: [lista ingredienti separati da virgola]
Post cottura: [lista ingredienti separati da virgola]
Perché funziona: [una breve frase che spiega l'equilibrio dei sapori]

Esempio:
1. Sottobosco Incantato
In cottura: fior di latte, funghi porcini freschi, timo selvatico
Post cottura: carpaccio di tartufo nero, nocciole del Piemonte tostate, fili di peperoncino
Perché funziona: L'intensità terrosa del tartufo e dei porcini è bilanciata dalla croccantezza delle nocciole e dalla freschezza del timo.

Genera ora ${count} ricette diverse nel formato sopra indicato.`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        { text: prompt }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.8,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 2048,
            }
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || 'Errore sconosciuto nelle API Gemini';
        throw new Error(`Errore Gemini API: ${errorMessage}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text;
    }

    throw new Error('La risposta dell\'AI non contiene testo generato.');
}
