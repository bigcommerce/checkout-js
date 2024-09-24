(() => {
    const creditCard = document.createElement('input');
    const date = document.createElement('input');
    const cvv = document.createElement('input');

    creditCard.id = 'ccn';
    creditCard.placeholder = 'Card number';
    date.id = 'exp';
    date.placeholder = 'Expiration (MM/YY)';
    cvv.id = 'cvv';
    cvv.placeholder = 'CVV';

    window.Bolt = () => ({
        create: () => ({
            mount: (selector) =>
                Promise.resolve(
                    document.querySelector(selector).appendChild(creditCard),
                    document.querySelector(selector).appendChild(date),
                    document.querySelector(selector).appendChild(cvv),
                ),
            tokenize: () =>
                Promise.resolve({
                    bin: '411111',
                    expiration: '2029-8',
                    last4: '1111',
                    token: 'token',
                }),
        }),
    });
})();
