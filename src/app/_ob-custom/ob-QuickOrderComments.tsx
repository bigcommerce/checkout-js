import { FieldProps } from 'formik';
import React, {  useCallback, useMemo, useRef, FunctionComponent } from 'react';

import { withCheckout } from '../checkout';
import { TranslatedString } from '../locale';
import {
	Fieldset,
	FormField,
	Label,
	Legend,
	TextInput,
} from '../ui/form';
import DatePicker from './ob-DatePicker';

export interface OrderCommentsProps {
	onDatePicked: () => void;
	hasGiftOption: boolean;
	hasShipByDate: boolean;
	shipByDate: string;
	toggleGiftOption: () => void;
    setShipByDate(value: string): void;
	order?: {};
	isDate: string;
	heading: string;
}

const OrderComments: FunctionComponent<OrderCommentsProps> = ({
	onDatePicked,
	hasGiftOption,
	toggleGiftOption,
	setShipByDate,
	isDate,
	heading
}) => {
	const giftCheckboxRef = useRef<null | HTMLInputElement>(null);
	const orderCommentsRef = useRef<null | HTMLInputElement>(null);

	const GiftOptionComponent = () => (
		<div className='ob-giftOption'>
			<input
				id='gift'
				className='ob-giftOption__checkbox form-checkbox optimizedCheckout-form-checkbox'
				type='checkbox'
				ref={giftCheckboxRef}
				checked={hasGiftOption}
				value={`${hasGiftOption}`}
				onChange={() => toggleGiftOption()}
			/>
			{giftLabel}
		</div>
	);

	const giftLabel = useMemo(
		() => (
			<>
				<label htmlFor='gift' className='form-label optimizedCheckout-form-label'>
					This is a gift
				</label>
				<p className='ob-giftOption__message'>
					(We Offer Complimentary Greeting Cards)
				</p>
			</>
		),
		[]
	);

	const limitComment = useMemo(
		() => <p className='ob-orderComments__message'>(Limit 150 Characters, 3 Lines)</p>,
		[]
	);

	const renderLabel = useCallback(
		name => (
			<Label hidden htmlFor={name}>
				<TranslatedString id='shipping.order_comment_label' />
			</Label>
		),
		[]
	);

	const renderInput = useCallback(
		({ field }: FieldProps) => (
			<TextInput
				{...field}
				autoComplete={'off'}
				maxLength={150}
				placeholder={'Add your message here'}
				ref={orderCommentsRef}
			/>
		),
		[]
	);

	const legend = useMemo(
		() => (
			<Legend>
				<TranslatedString id='shipping.order_comment_label' />
			</Legend>
		),
		[]
	);

	return (
		<>
			<GiftOptionComponent />
			<DatePicker onDatePicked={onDatePicked} setShipByDate={ setShipByDate } isDate={isDate} heading={heading} />
			<Fieldset legend={legend} testId='checkout-shipping-comments'>
				<FormField input={renderInput} label={renderLabel} name='orderComment' />
				{limitComment}
			</Fieldset>
		</>
	);
};

interface WithCheckoutOrderConfirmationProps {
	order?: {};
}

export function mapToOrderComments(context: any): WithCheckoutOrderConfirmationProps | null {
	const {
		checkoutState: {
			data: { getOrder },
		},
	} = context;

	const order = getOrder();

	return {
		order,
	};
}

export default withCheckout(mapToOrderComments)(OrderComments);
