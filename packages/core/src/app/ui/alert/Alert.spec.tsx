import { shallow } from 'enzyme';
import React from 'react';

import { IconError, IconInfo, IconSuccess, IconTag } from '../icon';

import Alert, { AlertType } from './Alert';

describe('Alert', () => {
    it('matches snapshot', () => {
        expect(shallow(<Alert>Hello world</Alert>)).toMatchSnapshot();
    });

    it('renders alert with text', () => {
        expect(shallow(<Alert>Hello world</Alert>).text()).toContain('Hello world');
    });

    it('sets class name based on alert type', () => {
        expect(shallow(<Alert type={AlertType.Info} />).hasClass('alertBox--info')).toBe(true);

        expect(shallow(<Alert type={AlertType.Error} />).hasClass('alertBox--error')).toBe(true);

        expect(shallow(<Alert type={AlertType.Success} />).hasClass('alertBox--success')).toBe(
            true,
        );

        expect(shallow(<Alert type={AlertType.Warning} />).hasClass('alertBox--warning')).toBe(
            true,
        );
    });

    it('sets default class name if alert type is not provided', () => {
        expect(shallow(<Alert type={AlertType.Info} />).hasClass('alertBox--info')).toBe(true);
    });

    it('displays icon based on alert type', () => {
        expect(shallow(<Alert type={AlertType.Error} />).contains(<IconError />)).toBe(true);

        expect(shallow(<Alert type={AlertType.Warning} />).contains(<IconError />)).toBe(true);

        expect(shallow(<Alert type={AlertType.Success} />).contains(<IconSuccess />)).toBe(true);

        expect(shallow(<Alert type={AlertType.Info} />).contains(<IconInfo />)).toBe(true);
    });

    it('displays default icon if alert type is not provided', () => {
        expect(shallow(<Alert type={AlertType.Info} />).contains(<IconInfo />)).toBe(true);
    });

    it('overrides default icon if custom icon is provided', () => {
        const component = shallow(<Alert icon={<IconTag />} type={AlertType.Info} />);

        expect(component.contains(<IconTag />)).toBe(true);
    });
});
