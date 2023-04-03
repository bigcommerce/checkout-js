(() => {
    const data = {
        cardData: {
            binCategory: 'CONSUMER',
            cardCategory: 'foo',
            cardSubType: 'CREDIT',
            ccBin: '411111',
            ccType: 'VISA',
            exp: '12/2023',
            isRegulatedCard: 'Y',
            issuingCountry: 'us',
            last4Digits: '1111',
        },
        statusCode: '1',
        transactionFraudInfo: {
            fraudSessionId: 'qwerty123',
        },
    };

    window.bluesnap = {
        hostedPaymentFieldsCreate: (options) => {
            [
                document.querySelector('[data-bluesnap="ccn"]'),
                document.querySelector('[data-bluesnap="exp"]'),
                document.querySelector('[data-bluesnap="cvv"]'),
            ].forEach((container) => {
                const input = document.createElement('input');

                input.addEventListener('input', () => {
                    options.onFieldEventHandler.onValid(container.dataset.bluesnap);
                });

                container.appendChild(input);
            });

            options.onFieldEventHandler.setupComplete();
        },
        hostedPaymentFieldsSubmitData: (callback) => callback(data),
    };
})();
