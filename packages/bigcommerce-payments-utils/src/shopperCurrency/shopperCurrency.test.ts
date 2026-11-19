import { convertAmount, formatRate, getCountryName } from './shopperCurrency';

describe('shopperCurrency', () => {
    it('rounds the converted amount half up to the minor unit', () => {
        expect(convertAmount(10.01, '1.5', 'EUR')).toBe(15.02);
        expect(convertAmount(100, '3.59', 'PLN')).toBe(359);
    });

    it('rounds to whole units for currencies without decimals', () => {
        expect(convertAmount(100, '152.345', 'JPY')).toBe(15235);
    });

    it('shows the rate with up to 4 decimals', () => {
        expect(formatRate('5.481535347546276')).toBe('5.4815');
    });

    it('names the country', () => {
        expect(getCountryName('PL')).toBe('Poland');
    });
});
