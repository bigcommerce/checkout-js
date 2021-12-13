import React, { useState, useEffect, FunctionComponent } from 'react';
import ReactDatePicker from 'react-datepicker';

interface DatePickerProps {
    setShipByDate: (date: string) => void;
    onDatePicked: () => void;
}

const DatePicker: FunctionComponent<DatePickerProps> = ({ setShipByDate, onDatePicked}) => {
    window.__DISABLED_SPECIFIC_DAYS__ = [ '12-20-2021', '12-22-2021', '12-23-2021'];
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
                minDate={new Date()}
                excludeDates={window.__DISABLED_SPECIFIC_DAYS__.map(d => new Date(d))}
                filterDate={isWeekday}
            />
        </>
    );
};

const isWeekday = (date: Date) => {
    const newDate = new Date(date);
    const day = newDate.getDay();
    window.__DISABLED_DAYS_OF_WEEK__ = [0, 6];

    return !window.__DISABLED_DAYS_OF_WEEK__.includes(day);
};

export default(DatePicker);