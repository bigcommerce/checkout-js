(() => {
    const noop = () => Promise.resolve();
    const stripeEventCallback = (event, callback) => {
        let payload;

        switch (event) {
            case 'change':
                payload = {
                    values: {
                        value: {
                            type: 'card',
                        },
                    },
                };
                break;

            case 'ready':
            default:
                break;
        }

        return callback(payload);
    };
    const paymentIntent = {
        id: 'TEST-ID',
        status: 'succeeded',
    }
    const stripeElement = () => ({
        mount: (id) => {
            const element = document.createElement('div');
            element.setAttribute('id', id);

            return noop();
        },
        unmount: noop,
        update: noop,
        destroy: noop,
        on: stripeEventCallback,
    });

    window.Stripe = () => ({
        elements: () => ({
            create: stripeElement,
            getElement: stripeElement,
            update: stripeElement,
            fetchUpdates: stripeElement,
        }),
        confirmAlipayPayment: () => Promise.resolve({
            paymentIntent,
        }),
        confirmCardPayment: () => Promise.resolve({
            paymentIntent,
        }),
        createPaymentMethod: () => Promise.resolve({
            paymentMethod: {
                id: 'TEST-ID',
                type: 'method-type',
            }
        }),
    })
})()
