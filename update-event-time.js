// Script temporaneo per aggiornare l'orario dell'evento "Natale con i tuoi!" alle 13:00
import fetch from 'node-fetch';

async function updateEventTime() {
    try {
        // 1. Get all pizza nights
        const response = await fetch('http://localhost:3000/api/pizza-nights');
        const nights = await response.json();

        // 2. Find "Natale con i tuoi!"
        const nataleConiTuoi = nights.find(n => n.name && n.name.toLowerCase().includes('natale'));

        if (!nataleConiTuoi) {
            console.log('❌ Evento "Natale con i tuoi!" non trovato');
            console.log('Eventi disponibili:', nights.map(n => n.name));
            return;
        }

        console.log('✅ Evento trovato:', nataleConiTuoi.name);
        console.log('   ID:', nataleConiTuoi.id);
        console.log('   Data attuale:', new Date(nataleConiTuoi.date));

        // 3. Create new date with same day but time at 13:00
        const currentDate = new Date(nataleConiTuoi.date);
        const newDate = new Date(currentDate);
        newDate.setHours(13, 0, 0, 0); // Set to 13:00:00.000

        console.log('   Nuova data:', newDate);
        console.log('   Nuovo timestamp:', newDate.getTime());

        // 4. Update the event
        const updatedNight = {
            ...nataleConiTuoi,
            date: newDate.getTime()
        };

        const updateResponse = await fetch(`http://localhost:3000/api/pizza-nights/${nataleConiTuoi.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedNight)
        });

        if (updateResponse.ok) {
            console.log('✅ Evento aggiornato con successo!');
            console.log('   Orario impostato alle 13:00');
        } else {
            console.log('❌ Errore nell\'aggiornamento:', await updateResponse.text());
        }

    } catch (error) {
        console.error('❌ Errore:', error.message);
    }
}

updateEventTime();
