import { CheckoutSelectors, PaymentInitializeOptions, PaymentMethod, PaymentRequestOptions } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { Component, ReactNode } from 'react';

import navigateToOrderConfirmation from '../../checkout/navigateToOrderConfirmation';
import { Modal } from '../../ui/modal';
import withPayment, { WithPaymentProps } from '../withPayment';

export interface ModalPaymentMethodProps {
    method: PaymentMethod;
    shouldShowCloseButton?: boolean;
    isSubmittingOrder: boolean;
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;
    initializePayment(options: PaymentInitializeOptions): Promise<CheckoutSelectors>;
    onUnhandledError?(error: Error): void;
}

class ModalPaymentMethod extends Component<
  ModalPaymentMethodProps & WithPaymentProps
> {

  constructor(props: any) {
    super(props);
    this.receiveMessage = this.receiveMessage.bind(this);
    // this.closePaymentModal = this.closePaymentModal.bind(this);
  }

  receiveMessage(event: MessageEvent) {
    // if (event.origin !== "https://example.com") {
    //   return;
    // }

    if (event.data.action === 'navigateToOrderConfirmation') {
      navigateToOrderConfirmation();
    }
  }

  async componentDidMount(): Promise<void> {
    const { onUnhandledError = noop } = this.props;

    window.addEventListener('message', this.receiveMessage, false);

    try {
      await this.initializeMethod();
    } catch (error) {
      onUnhandledError(error);
    }
  }

  async componentWillUnmount(): Promise<void> {
    const { deinitializePayment, method, onUnhandledError = noop } = this.props;

    window.removeEventListener('message', this.receiveMessage, false);

    try {
      await deinitializePayment({
        gatewayId: method.gateway,
        methodId: method.id,
      });
    } catch (error) {
      onUnhandledError(error);
    }
  }

  render(): ReactNode {
    const { shouldShowCloseButton = true, isSubmittingOrder } = this.props;

    const frameStyle = {
      width: '100%',
      height: '60vh',
    };

    return (
      <Modal
          isOpen={ isSubmittingOrder }
          onRequestClose={ noop }
          shouldShowCloseButton={ shouldShowCloseButton }
      >
        <iframe name="hosted_payment_page" style={ frameStyle } />
      </Modal>
    );
  }

  // private closePaymentModal(): void {
  //   this.setState({
  //     modalOpen: false,
  //   });
  // }

  private async initializeMethod(): Promise<CheckoutSelectors | void> {
    const { method, initializePayment = noop } = this.props;

    return initializePayment({
      gatewayId: method.gateway,
      methodId: method.id,
    });
  }
}

export default withPayment(ModalPaymentMethod);
