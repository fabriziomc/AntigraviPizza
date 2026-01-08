import Bring from 'bring-shopping';

/**
 * Login to Bring! and retrieve lists
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Array>} List of shopping lists
 */
export async function getBringLists(email, password) {
    console.log(`🛒 [Bring Service] Logging in for user: ${email}`);
    try {
        const bring = new Bring({ mail: email, password: password });
        await bring.login();
        console.log(`✅ [Bring Service] Login successful. UUID: ${bring.userUuid}`);

        const response = await bring.loadLists();
        console.log(`📋 [Bring Service] Loaded ${response.lists.length} lists`);

        return response.lists.map(list => ({
            uuid: list.listUuid,
            name: list.name,
            theme: list.theme
        }));
    } catch (error) {
        console.error('❌ [Bring Service] Login/Load error:', error.message);
        throw new Error('Failed to connect to Bring!: ' + error.message);
    }
}

/**
 * Add items to a specific Bring! list
 * @param {string} email 
 * @param {string} password 
 * @param {string} listUuid 
 * @param {Array<{name: string, specification: string}>} items 
 */
export async function addToBringList(email, password, listUuid, items) {
    console.log(`🛒 [Bring Service] Adding ${items.length} items to list ${listUuid}`);
    const bring = new Bring({ mail: email, password: password });

    try {
        await bring.login();

        // Process items in sequence to avoid rate limits or race conditions
        let successCount = 0;
        let failCount = 0;

        for (const item of items) {
            try {
                // saveItem(listUuid, itemName, specification)
                await bring.saveItem(listUuid, item.name, item.specification || '');
                successCount++;
            } catch (err) {
                console.error(`❌ [Bring Service] Failed to add item ${item.name}:`, err.message);
                failCount++;
            }
        }

        console.log(`✅ [Bring Service] Finished. Success: ${successCount}, Failed: ${failCount}`);
        return { success: successCount, failed: failCount };
    } catch (error) {
        throw new Error('Failed to add items to Bring!: ' + error.message);
    }
}
