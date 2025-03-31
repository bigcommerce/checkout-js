import React from 'react';

import { render } from '@bigcommerce/checkout/test-utils';

import { IconError, IconInfo, IconSuccess, IconTag } from '../icon';

import Alert, { AlertType } from './Alert';

describe('Alert', () => {
    it('sets class name based on alert type', () => {
        const { container: infoContainer } = render(<Alert type={AlertType.Info} />);
        const { container: infoIcon } = render(<IconInfo />);

        expect(infoContainer.firstChild).toHaveClass('alertBox--info');
        expect(infoContainer.innerHTML).toContain(infoIcon.innerHTML);

        const { container: successContainer } = render(<Alert type={AlertType.Success} />);
        const { container: successIcon } = render(<IconSuccess />);

        expect(successContainer.firstChild).toHaveClass('alertBox--success');
        expect(successContainer.innerHTML).toContain(successIcon.innerHTML);

        const { container: errorContainer } = render(<Alert type={AlertType.Error} />);
        const { container: errorIcon } = render(<IconError />);

        expect(errorContainer.firstChild).toHaveClass('alertBox--error');
        expect(errorContainer.innerHTML).toContain(errorIcon.innerHTML);

        const { container: warningContainer } = render(<Alert type={AlertType.Warning} />);

        expect(warningContainer.firstChild).toHaveClass('alertBox--warning');
        expect(warningContainer.innerHTML).toContain(errorIcon.innerHTML);
    });

    it('overrides default icon if custom icon is provided', () => {
        const { container } = render(<Alert icon={<IconTag />} type={AlertType.Info} />);
        const { container: tagIcon } = render(<IconTag />);

        expect(container.innerHTML).toContain(tagIcon.innerHTML);
    });
});
