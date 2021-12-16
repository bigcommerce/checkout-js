import React, { useState, useEffect, FunctionComponent } from 'react';
import ReactDatePicker from 'react-datepicker';
import { subDays, addDays } from 'date-fns'

interface DatePickerProps {
    setShipByDate: (date: string) => void;
    onDatePicked: () => void;
}

/**
 * Custom React Date Picker
 * 
 * - Global variables from Script Manager are declared and typed in Checkout.tsx (ex: window.__GLOBAL_VAR__)
 * - shipByDate is located in the Checkout.tsx state and passed via Checkout.tsx child components
 * 
 * @param {Object} state 
 * @returns {Component} React Fragment
 */
const DatePicker: FunctionComponent<DatePickerProps> = ({ setShipByDate, onDatePicked}) => {
    // window.__DISABLED_SPECIFIC_DAYS__ = [ '12-20-2021', '12-22-2021', '12-23-2021']; // TESTING ONLY
    // window.__DAYS_OUT_SHIPPING = 2; // TESTING ONLY
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    useEffect(() => {
        if (selectedDate instanceof Date) {
            setShipByDate(
                selectedDate.toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric',
                })
            );

            onDatePicked();
        }
    }, [selectedDate]);

    return (
        <>
            <legend className='form-legend optimizedCheckout-headingSecondary'>
                Ship-By Date <span>(Required)</span>
            </legend>
            <ReactDatePicker
                className='ob-datepicker form-input optimizedCheckout-form-input'
                placeholderText={selectedDate ? selectedDate.toLocaleDateString('en-US') : 'mm/dd/yyyy'}
                selected={selectedDate}
                onChange={(date: Date) => setSelectedDate(date)}
                minDate={ addDays(new Date(), window.__DAYS_OUT_SHIPPING__) }
                excludeDates={window.__DISABLED_SPECIFIC_DAYS__.map(d => new Date(d))}
                filterDate={isWeekday}
                excludeDateIntervals={[{start: subDays(new Date(), 5), end: addDays(new Date(), 5) }]}
            />
        </>
    );
};

const isWeekday = (date: Date) => {
    const newDate = new Date(date);
    const day = newDate.getDay();
    // window.__DISABLED_DAYS_OF_WEEK__ = [0, 6]; // TESTING ONLY

    return !window.__DISABLED_DAYS_OF_WEEK__.includes(day);
};

export default(DatePicker);