import { useEffect, useState } from 'react';

import { useExtensions } from '@bigcommerce/checkout/checkout-extension';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

export const useLoadCheckout = (checkoutId: string): {isLoadingCheckout: boolean} => {
	const [ isLoadingCheckout, setIsLoadingCheckout ] = useState(true);
	const { checkoutService } = useCheckout();
	const { extensionService } = useExtensions();

	const fetchData = async () => {
		await Promise.all([
			checkoutService.loadCheckout(checkoutId, {
				params: {
					include: [
						'cart.lineItems.physicalItems.categoryNames',
						'cart.lineItems.digitalItems.categoryNames',
					] as any, // FIXME: Currently the enum is not exported so it can't be used here.
				},
			}),
			extensionService.loadExtensions(),
		]);
	};

	useEffect(() => {
		fetchData()
			.then(() => setIsLoadingCheckout(false))
			.catch(() => {
				throw new Error('Failed to load checkout, please try again.');
		});
	}, []);

	return  { isLoadingCheckout };
};
