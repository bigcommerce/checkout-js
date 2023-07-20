import { getOrderFee } from "./orders.mock";
import isOrderFee from "./isOrderFee";
import { Fee } from "@bigcommerce/checkout-sdk";

describe('isOrderFee()', () => {
  describe('when the fee is an order fee', () => {
    it('returns true', () => {
      const orderFee = getOrderFee();

      expect(isOrderFee(orderFee)).toBe(true);
    });
  });

  describe('when the fee is not an order fee', () => {
    it('returns false', () => {
      const nonOrderFee: Fee = {
        id: '0',
        cost: 2.0,
        name: 'some name',
        displayName: 'display name',
        type: 'custom_fee',
        source: 'some source',
      };

      expect(isOrderFee(nonOrderFee)).toBe(false);
    });
  });
});
