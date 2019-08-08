import { shallow } from 'enzyme';
import React from 'react';

import Alert, { AlertType } from './Alert';
import FlashAlert from './FlashAlert';

describe('FlashAlert', () => {
    it('displays error flash message', () => {
        const message = {
            type: 0,
            message: 'Error message',
        };

        const component = shallow(<FlashAlert message={ message } />);

        expect(component.find(Alert).prop('type'))
            .toEqual(AlertType.Error);

        expect(component.find(Alert).prop('children'))
            .toEqual(message.message);
    });

    it('displays success flash message', () => {
        const message = {
            type: 1,
            message: 'Success message',
        };

        const component = shallow(<FlashAlert message={ message } />);

        expect(component.find(Alert).prop('type'))
            .toEqual(AlertType.Success);

        expect(component.find(Alert).prop('children'))
            .toEqual(message.message);
    });

    it('displays info flash message', () => {
        const message = {
            type: 2,
            message: 'Info message',
        };

        const component = shallow(<FlashAlert message={ message } />);

        expect(component.find(Alert).prop('type'))
            .toEqual(AlertType.Info);

        expect(component.find(Alert).prop('children'))
            .toEqual(message.message);
    });

    it('displays warning flash message', () => {
        const message = {
            type: 3,
            message: 'Warning message',
        };

        const component = shallow(<FlashAlert message={ message } />);

        expect(component.find(Alert).prop('type'))
            .toEqual(AlertType.Warning);

        expect(component.find(Alert).prop('children'))
            .toEqual(message.message);
    });
});
