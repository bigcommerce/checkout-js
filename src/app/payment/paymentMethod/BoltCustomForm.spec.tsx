import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';

import BoltCustomForm, { BoltCustomFormProps } from './BoltCustomForm';

describe('BoltCustomForm', () => {
    let defaultProps: BoltCustomFormProps;
    let BoltCustomFormTest: FunctionComponent<BoltCustomFormProps>;

    beforeEach(() => {
        defaultProps = {
            containerId: 'boltEmbeddedOneClick',
        };

        BoltCustomFormTest = props => (
            <BoltCustomForm { ...props } />
        );
    });

    it('renders bolt embedded field', () => {
        const container = mount(<BoltCustomFormTest { ...defaultProps }  />);

        expect(container.find('[id="boltEmbeddedOneClick"]')).toHaveLength(1);
    });
});
