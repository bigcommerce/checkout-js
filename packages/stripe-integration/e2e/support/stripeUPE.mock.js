(() => {
    const noop = () => Promise.resolve();
    const stripeElement = () => ({
        mount: (id) => {
            const element = document.createElement('div');
            element.setAttribute('id', id);

            return noop();
        },
        unmount: noop,
        update: noop,
        destroy: noop,
        on: (_, callback) => {callback()},
    });

    window.Stripe = () => ({
        elements: () => ({
            create: stripeElement,
            getElement: stripeElement,
            update: stripeElement,
            fetchUpdates: stripeElement,
        }),
    })
})()
