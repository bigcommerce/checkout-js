import getStoreCreditAmount from './getStoreCreditAmount';
import {
    getGatewayOrderPayment,
    getGiftCertificateOrderPayment,
    getOrder,
    getStoreCreditPayment,
} from './orders.mock';

describe('getStoreCreditAmount()', () => {
    describe('when there are no store credit payments', () => {
        const { payments } = getOrder();

        it('returns zero', () => {
            expect(getStoreCreditAmount(payments)).toBe(0);
        });
    });

    describe('when there are mutliple store credit payments', () => {
        const payments = [
            getStoreCreditPayment(),
            getGiftCertificateOrderPayment(),
            getStoreCreditPayment(),
            getGatewayOrderPayment(),
        ];

        it('returns sum of them', () => {
            expect(getStoreCreditAmount(payments)).toBe(120);
        });
    });
});
