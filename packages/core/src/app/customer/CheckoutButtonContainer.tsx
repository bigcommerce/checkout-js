import React, { FunctionComponent } from 'react';

import { CheckoutContextProps, withCheckout } from '../checkout';
import { TranslatedString } from '../locale';

import CheckoutButtonListV1 from './CheckoutButtonList';

interface CheckoutButtonsListOnTopProps {
  checkEmbeddedSupport(methodIds: string[]): void;
  onUnhandledError(error: Error): void;
}

const CheckoutButtonContainer: FunctionComponent<CheckoutButtonsListOnTopProps & CheckoutContextProps> = (
  {
    checkEmbeddedSupport,
    checkoutState,
    checkoutService,
    onUnhandledError,
}) => {
  const {
    data: {
      getConfig,
    },
    statuses: {
      isInitializingCustomer,
    },
  } = checkoutState;
  const config = getConfig();

  if (!config) {
    return null;
  }

  return (
    <div className='wallet-buttons-container'>
      <CheckoutButtonListV1
        checkEmbeddedSupport={checkEmbeddedSupport}
        copywritingStringId='remote.start_with_text'
        deinitialize={checkoutService.deinitializeCustomer}
        initialize={checkoutService.initializeCustomer}
        isInitializing={isInitializingCustomer()}
        methodIds={config.checkoutSettings.remoteCheckoutProviders}
        onError={onUnhandledError}
      />
      <div className='checkout-separator'><span><TranslatedString id='remote.or_text' /></span></div>
    </div>
  )
}

export default withCheckout((props) => props)(CheckoutButtonContainer);
