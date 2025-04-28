// translate-worker.js

console.log("Worker: Script loaded.");

const translations = {
    'en' : {
        'Free Shipping': 'Free Shipping',
        'Flat rate': 'Flat rate',
        'Pick up': 'Pick up',
    },
    'de' : {
        'Free Shipping': '[de] Free Shipping',
        'Flat rate': '[de] Flat rate',
        'Pick up': '[de] Pick up',
    },
    'da' : {
        'Free Shipping': '[da] Free Shipping',
        'Flat rate': '[da] Flat rate',
        'Pick up': '[da] Pick up',
    },
    'fr' : {
        'Free Shipping': '[fr] Free Shipping',
        'Flat rate': '[fr] Flat rate',
        'Pick up': '[fr] Pick up',
    }
  };
// --- Translation Function (Placeholder - Replace with Real Logic) ---

self.onmessage = async (event) => {
    console.log("Worker: Received message:", event.data);

    // Expect data like: { items: [ {id: '...', text: '...'}, ... ], lang: '...' }
    const { items, lang } = event.data;

    if (!Array.isArray(items) || !lang) {
        self.postMessage({ error: "Invalid data format received by worker." });
        return;
    }

    const results = [];
    for (const item of items) {
        try {
            let translatedText = `${item.text} (fallback)` ; // Default to original text
            if(translations.hasOwnProperty(lang) && translations[lang].hasOwnProperty(item.text)) {
                console.log(`Worker: Found translation for ${item.text} in ${lang}`);
                translatedText = translations[lang][item.text];
            }
            results.push({ status: 'ok', translatedText: translatedText, id: item.id }); // Include ID in result
        } catch (error) {
            console.error(`Worker: Failed to translate item ID ${item.id}:`, error);
            results.push({ status: 'error', error: error.message || 'Translation failed', id: item.id }); // Include ID in error result
        }
    }

    console.log("Worker: Sending dynamic results back:", results);
    self.postMessage({ results: results }); // Send array of result objects
};
console.log("Worker: Message listener set up.");

// Optional: Catch unhandled errors within the worker
self.onerror = (event) => {
  console.error("Worker: Unhandled error in worker:", event);
};