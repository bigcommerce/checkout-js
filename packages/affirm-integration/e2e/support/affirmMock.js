(() => {
    window.affirm.checkout.open = ({ onSuccess }) => {
        setTimeout(() => {
            onSuccess({ successData: 'exampleData' });
        }, 1000);

        return Promise.resolve();
    };

    window.affirm.ui = {
        error: {
            on: () => {
                void Promise.resolve();
            },
        },
    };
})();
