import { isLanguageWindow } from "@bigcommerce/checkout/locale";

export default class ExtensionWebWorker {
    constructor(url: string) {

        if (!window.Worker) {
            console.log('Main: Your browser doesn\'t support Web Workers.');
            return;
        }

        const blob = URL.createObjectURL(
            new Blob(
                [
                    `importScripts=((i)=>(...a)=>i(...a.map((u)=>''+new URL(u,"${url}"))))(importScripts);importScripts("${url}")`,
                ],
                { type: "text/javascript" }
            )
        );

        console.log("Main: Web Workers supported.", blob);
        // --- Create the Worker ---
        const translateWorker = new Worker(blob);

        console.log("Main Dynamic Script: DOM loaded.");

        let currentTranslateId = 0; // Counter for unique IDs
        const elementsPendingTranslation = new Map(); // To map IDs back to elements

        try {
            // ** Use correct path & type **
            // const workerUrl = '/content/worker-module.js'; // Your worker path
            // translateWorker = new Worker(workerUrl, { type: 'module' });
            // const workerUrl = '/content/translate-worker.js'; // Classic worker path example


            console.log("Main Script: Worker instantiated from", url);

            // --- Handle messages back from the worker ---
            translateWorker.onmessage = function (event) {
                console.log("Main Script: Message received from worker:", event.data);
                const workerResponse = event.data;

                if (workerResponse && Array.isArray(workerResponse.results)) {
                    workerResponse.results.forEach((result: any) => {
                        // **Use the ID to find the element**
                        // const elementToUpdate = document.querySelector(`[data-translate-id="${result.id}"]`);
                        // OR use the Map we stored the reference in:
                        const elementToUpdate = elementsPendingTranslation.get(result.id);


                        if (elementToUpdate) {
                            if (result.status === 'ok') {
                                elementToUpdate.textContent = result.translatedText;
                                // Optional: remove the temporary ID attribute once translated
                                elementToUpdate.removeAttribute('data-translate-id');
                                elementToUpdate.style.outline = ''; // Clear error style
                                console.log(`Main Script: Updated dynamic element ID ${result.id}`);
                            } else {
                                console.error(`Main Script: Worker error for dynamic element ID ${result.id}: ${result.error}`);
                                elementToUpdate.style.outline = '1px solid orange'; // Indicate error
                                // Maybe remove attribute even on error? Depends on desired behavior.
                                elementToUpdate.removeAttribute('data-translate-id');
                            }
                            // Remove from pending map once processed
                            elementsPendingTranslation.delete(result.id);
                        } else {
                            console.warn(`Main Script: Received result for unknown/removed dynamic element ID ${result.id}`);
                        }
                    });
                }
                // ... (handle general errors / unexpected format) ...
            };

            // --- Handle worker errors ---
            translateWorker.onerror = function (error) {
                console.error("Main Script: Worker error:", error.message);
            };


            // --- Setup MutationObserver ---
            const observerCallback = function (mutationsList: any) {
                console.log("MutationObserver: Detected DOM changes.", mutationsList);
                let dynamicItemsToTranslate: any = [];

                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach((node: any) => {
                            // We only care about element nodes (not text nodes directly)
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                // Find elements within the added node (or the node itself)
                                // that need translation (e.g., have a specific class)
                                const translatableElements = node.matches('.translatable-dynamic')
                                    ? [node] // The added node itself needs translation
                                    : node.querySelectorAll('.translatable-dynamic'); // Find descendants

                                translatableElements.forEach((el: any) => {
                                    // Avoid translating elements already processed or pending
                                    if (!el.hasAttribute('data-translate-id')) {
                                        const text = el.textContent.trim();
                                        if (text) {
                                            const uniqueId = `dyn-translate-${currentTranslateId++}`;
                                            el.setAttribute('data-translate-id', uniqueId); // Mark element
                                            elementsPendingTranslation.set(uniqueId, el); // Store reference
                                            dynamicItemsToTranslate.push({ id: uniqueId, text: text });
                                        }
                                    }
                                });
                            }
                        });
                    }
                    // Add checks for mutation.type === 'characterData' if needed,
                    // but be careful as this can fire very often. Target specific text nodes.
                }

                console.log("MutationObserver: dynamicItemsToTranslate", dynamicItemsToTranslate);

                // If new items were found, send them to the worker (batching)
                if (dynamicItemsToTranslate.length > 0 && translateWorker) {
                    console.log(`MutationObserver: Sending ${dynamicItemsToTranslate.length} dynamic items to worker.`);
                    // ** Need selected language **
                    const selectedLanguage = isLanguageWindow(window) ? window.language?.locale : 'es'; // Get current language
                    translateWorker.postMessage({ items: dynamicItemsToTranslate, lang: selectedLanguage });
                }
            };

            // Create an observer instance linked to the callback
            const observer = new MutationObserver(observerCallback);

            // Start observing the target node for configured mutations
            // Target a specific container if possible, otherwise body.
            const targetNode = document.getElementById('checkout-shipping-options') || document.body; // Example target
            const config = {
                childList: true,  // Observe direct children being added or removed
                subtree: true     // Observe all descendants too
                // characterData: true // Add if you need to observe direct text changes (use carefully)
            };
            observer.observe(targetNode, config);
            console.log("MutationObserver: Observing target node for changes.", targetNode);

            // Optional: Disconnect observer later if needed
            // observer.disconnect();

        } catch (e: any) {
            console.error("Main Script: Failed during worker/observer setup.", e);
        }
    }
}