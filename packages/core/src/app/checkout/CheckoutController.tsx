import {
	EmbeddedCheckoutMessenger,
	EmbeddedCheckoutMessengerOptions
} from '@bigcommerce/checkout-sdk';
import React, { useEffect, useState } from 'react';

import { useExtensions } from '@bigcommerce/checkout/checkout-extension';
import { ErrorLogger } from '@bigcommerce/checkout/error-handling-utils';
import {useCheckout, useStyleContext} from '@bigcommerce/checkout/payment-integration-api';
import { CheckoutPageSkeleton } from '@bigcommerce/checkout/ui';

import { EmbeddedCheckoutStylesheet } from '../embeddedCheckout';

import { CheckoutPage } from './Checkout';
import CheckoutSupport from './CheckoutSupport';

interface CheckoutDataProps {
	checkoutId: string;
	containerId: string;
	embeddedStylesheet: EmbeddedCheckoutStylesheet;
	embeddedSupport: CheckoutSupport;
	errorLogger: ErrorLogger;
	createEmbeddedMessenger(options: EmbeddedCheckoutMessengerOptions): EmbeddedCheckoutMessenger;
}

const CheckoutController:React.FC<CheckoutDataProps>= (props) => {
	const [ isLoading, setIsLoading ] = useState(true);
	const { checkoutService } = useCheckout();
	const { extensionService } = useExtensions();
	const { ui2026 } = useStyleContext();

	useEffect(() => {
		const { loadCheckout } = checkoutService;
		const { checkoutId } = props;

		const fetchData = async () => {
			await Promise.all([loadCheckout(checkoutId, {
				params: {
					include: [
						'cart.lineItems.physicalItems.categoryNames',
						'cart.lineItems.digitalItems.categoryNames',
					] as any, // FIXME: Currently the enum is not exported so it can't be used here.
				},
			}), extensionService.loadExtensions()]);
		};

		fetchData().then(() => setIsLoading(false));
	}, []);

	if(isLoading) {
		return <CheckoutPageSkeleton />;
	}

	return <CheckoutPage
			{...props}
			createEmbeddedMessenger={props.createEmbeddedMessenger}
			embeddedStylesheet={props.embeddedStylesheet}
			embeddedSupport={props.embeddedSupport}
			errorLogger={props.errorLogger}
			ui2026={ui2026}
		/>;
};

export default CheckoutController;
