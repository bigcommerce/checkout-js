(() => {
    const creditCard = document.createElement('div');

    creditCard.id = 'adyen-scheme-component-field';

    const AdyenComponentMounted = {
        state: {
            data: {},
            errors: {},
        },
    };
    const creditCardFields = [
        {
            id: 'encryptedCardNumber',
            placeholder: '1234 5678 9012 3456',
            label: 'Card number',
        },
        {
            id: 'encryptedExpiryMonth',
            label: 'Expiry date',
            placeholder: 'MM/YY',
        },
        {
            id: 'encryptedSecurityCode',
            placeholder: '123',
            label: 'Security code',
        },
    ];
    const ACHfields = [
        {
            id: 'bankAccountNumber',
            label: 'Account number',
        },
        {
            id: 'routingNumber',
            label: 'ABA routing number',
        },
    ];

    function createFields(form, fields) {
        fields.forEach((field) => {
            const inputField = document.createElement('input');

            inputField.setAttribute('id', field.id);

            const label = document.createElement('label');

            label.setAttribute('for', field.id);
            label.textContent = field.label;

            if (field.placeholder) {
                inputField.placeholder = field.placeholder;
            }

            label.style.display = 'block';
            label.style.lineHeight = '1.5';
            label.style.marginBottom = '0.5rem';
            label.style.color = '#666';

            inputField.style.width = '100%';
            inputField.style.padding = '10px';
            inputField.style.marginBottom = '10px';
            form.appendChild(label);
            form.appendChild(inputField);
        });
    }

    function AdyenCheckout() {
        this.create = () => {
            return {
                create(type, options) {
                    return {
                        mount: (selector) => {
                            const container = document.querySelector(selector);

                            if (!container) {
                                console.error(`Container element with ID "${selector}" not found`);

                                return;
                            }

                            const form = document.createElement('form');

                            if (container.id.includes('ach')) {
                                createFields(form, ACHfields);
                            } else {
                                createFields(form, creditCardFields);
                            }

                            container.appendChild(form);
                            form.querySelectorAll('input').forEach((input) => {
                                input.addEventListener('change', (event) => {
                                    AdyenComponentMounted.state.data[event.target.id] =
                                        event.target.value;

                                    if (options.onChange) {
                                        options.onChange(AdyenComponentMounted.state);
                                    }
                                });
                            });
                        },
                        unmount: () => {
                            Promise.resolve();
                        },
                        onChange: options.onChange,
                    };
                },
            };
        };

        return this.create();
    }

    window.AdyenCheckout = AdyenCheckout;
})();
