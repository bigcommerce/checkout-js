(() => {
    const Mollie = () => {
        return {
            createComponent() {
                return {
                    mount: (selector) => {
                        const inputContainer = document.querySelector(selector);

                        if (!inputContainer) {
                            console.error(`Container selector "${selector}" not found`);

                            return;
                        }

                        const input = document.createElement('input');

                        inputContainer.appendChild(input);
                    },
                };
            },
            createToken() {
                return Promise.resolve({ token: 'Hello there', error: null });
            },
        };
    };

    window.Mollie = Mollie;
})();
