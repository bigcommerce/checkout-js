import {
  type CheckoutSelectors,
  type ShippingInitializeOptions,
  type ShippingRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { type FC, useEffect } from 'react';

export interface StripeupeShippingAddressProps {
  methodId?: string;
  deinitialize(options?: ShippingRequestOptions): Promise<CheckoutSelectors>;
  initialize(options?: ShippingInitializeOptions): Promise<CheckoutSelectors>;
  onUnhandledError?(error: Error): void;
}

const StripeShippingAddressDisplay: FC<StripeupeShippingAddressProps> = ({
   methodId,
   initialize,
   deinitialize,
   onUnhandledError = noop,
 }) => {

  useEffect(() => {
    const runInitialize = async () => {
      try {
        await initialize({ methodId });
      } catch (error) {
        onUnhandledError(error as Error);
      }
    };

    void runInitialize();

    return () => {
      const runDeinitialize = async () => {
        try {
          await deinitialize({ methodId });
        } catch (error) {
          onUnhandledError(error as Error);
        }
      };

      void runDeinitialize();
    };
  }, []);

  return (
    <>
      <div className="stepHeader" style={{ padding: 0 }}>
        <div id="StripeUpeShipping" style={{ width: '100%' }} />
      </div>
      <br />
    </>
  );
};

export default StripeShippingAddressDisplay;
