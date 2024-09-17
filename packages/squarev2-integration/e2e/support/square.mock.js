(() => {
    const creditCard = document.createElement('input');

    creditCard.id = 'squarev2_fake_input';

    const noop = () => Promise.resolve();
    const attach = (selector) =>
        Promise.resolve(document.querySelector(selector).appendChild(creditCard));
    const getListener = (callback) => (event) => {
        ['cardNumber', 'expirationDate', 'cvv', 'postalCode'].forEach((field) =>
            callback({
                detail: {
                    field,
                    currentState: { isCompletelyValid: !!event.target.value },
                },
            }),
        );
    };
    const addEventListener = (type, callback) => {
        if (type === 'errorClassRemoved') {
            creditCard.addEventListener('input', getListener(callback));
        }
    };
    const removeEventListener = (type, callback) => {
        if (type === 'errorClassRemoved') {
            creditCard.addEventListener('input', getListener(callback));
        }
    };
    const tokenize = () =>
        Promise.resolve({
            status: 'OK',
            token: 'cnon:xxx',
        });
    const verifyBuyer = () =>
        Promise.resolve({
            token: 'verf:yyy',
        });

    window.Square = {
        payments: () => ({
            card: () =>
                Promise.resolve({
                    configure: noop,
                    destroy: noop,
                    attach,
                    addEventListener,
                    removeEventListener,
                    tokenize,
                }),
            verifyBuyer,
        }),
    };
})();
