import { FieldProps } from 'formik';
import React, { useState, useEffect, useCallback, useMemo, useRef, FunctionComponent } from 'react';

import ReactDatePicker from 'react-datepicker';
import { TranslatedString } from '../locale';
import {
	Fieldset,
	FormField,
	// FormFieldError,
	Label,
	Legend,
	TextInput,
} from '../ui/form';

export interface OrderCommentsProps {
	onDatePicked: () => void;
}

const OrderComments: FunctionComponent<OrderCommentsProps> = ({ onDatePicked }) => {
	const giftCheckboxRef = useRef<null | HTMLInputElement>(null);
	const orderCommentsRef = useRef<null | HTMLInputElement>(null);

	const [dateRegex] = useState(
		/\[([0]?[1-9]|[1][0-2])[.\/-]([0]?[1-9]|[1|2][0-9]|[3][0|1])[.\/-]([0-9]{4}|[0-9]{2})\]/gm
	);
	const [giftRegex] = useState(/\[This is a Gift\]/gm);
	const [orderDate, setOrderDate] = useState('');
	const [giftChecked, setGiftChecked] = useState(false);

	useEffect(() => {
		updateOrderComment(orderDate);
	}, [orderDate]);

	useEffect(() => {
		if (orderCommentsRef.current) {
			const original = orderCommentsRef.current.value;

			if (giftChecked) {
				orderCommentsRef.current.value = `[This is a Gift]${original}`;
			} else {
				orderCommentsRef.current.value = original.replace(giftRegex, '');
			}
		}
	}, [giftChecked]);

	const updateOrderComment = (update: string) => {
		if (orderCommentsRef.current) {
			const original = orderCommentsRef.current.value;
			const dateMatchResults = original.match(dateRegex);
			let updatedMessage = '';

			if (dateMatchResults) {
				updatedMessage = original.replace(dateRegex, `[${update}]`);
			} else {
				updatedMessage = `[${update}]${original}`;
			}

			orderCommentsRef.current.value = updatedMessage;
		}
	};

	const DatePickerComponent = () => {
		const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

		useEffect(() => {
			if (selectedDate instanceof Date) {
				setOrderDate(
					selectedDate.toLocaleDateString('en-US', {
						month: '2-digit',
						day: '2-digit',
						year: 'numeric',
					})
				);

				onDatePicked();
			}
		}, [selectedDate]);

		const isWeekday = (date: Date) => {
			const newDate = new Date(date);
			const day = newDate.getDay();
			// window.__DISABLED_DAYS_OF_WEEK__ = [0, 6];

			return !window.__DISABLED_DAYS_OF_WEEK__.includes(day);
		};

		// window.__DISABLED_SPECIFIC_DAYS__ = ['11-30-2021', '12-6-2021', '12-7-2021'];

		return (
			<>
				<legend className='form-legend optimizedCheckout-headingSecondary'>
					Select Your Delivery Date <span>(Required)</span>
				</legend>
				<ReactDatePicker
					className='ob-datepicker form-input optimizedCheckout-form-input'
					placeholderText='mm/dd/yyyy'
					selected={selectedDate}
					onChange={(date: Date) => setSelectedDate(date)}
					minDate={new Date()}
					excludeDates={window.__DISABLED_SPECIFIC_DAYS__.map(d => new Date(d))}
					filterDate={isWeekday}
				/>
				{/* <FormFieldError
					name='datepicker'
					testId='datepicker-field-error-message'
				/> */}
			</>
		);
	};

	const GiftOptionComponent = () => (
		<div className='ob-giftOption'>
			<input
				id='gift'
				className='ob-giftCheckbox'
				// className='ob-giftCheckbox form-checkbox optimizedCheckout-form-checkbox'
				type='checkbox'
				ref={giftCheckboxRef}
				checked={giftChecked}
				value={`${giftChecked}`}
				onChange={() => setGiftChecked(!giftChecked)}
			/>
			<label htmlFor='gift' className='form-label optimizedCheckout-form-label'>
				This is a gift
			</label>

			<p className='ob-giftOption__message'>(We Offer Complimentary Greeting Cards)</p>
		</div>
	);

	const limitComment = useMemo(
		() => (
			<div className='ob-orderComments__message'>
				<p>(Limit 150 Characters, 3 Lines)</p>
			</div>
		),
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
				// onClick={e => checkForOrderDate(e)}
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

	// const checkForOrderDate = (e: React.MouseEvent<HTMLInputElement>) => {
	// 	const comment = e.currentTarget.value;

	// 	if (!new RegExp(orderDate).test(comment)) {
	// 		console.log('Order Date Not Found');

	// 		if (orderCommentInput) {
	// 			orderCommentInput.value = orderDate + orderCommentInput.value;
	// 		}
	// 	}
	// };

	return (
		<>
			<GiftOptionComponent />
			<DatePickerComponent />
			<Fieldset legend={legend} testId='checkout-shipping-comments'>
				<FormField input={renderInput} label={renderLabel} name='orderComment' />
				{limitComment}
			</Fieldset>
		</>
	);
};

export default OrderComments;
