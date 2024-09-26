import { render, screen } from '@testing-library/react';
import React, { useEffect } from 'react';

import AccordionItem from './AccordionItem';

jest.mock('react-transition-group', () => ({
    CSSTransition: ({
        children,
        addEndListener,
    }: {
        children: React.ReactNode;
        addEndListener: (node: Node, done: () => void) => void;
    }) => {
        useEffect(() => {
            const nodeMock = document.createElement('div');

            addEndListener(nodeMock, jest.fn());

            nodeMock.dispatchEvent(new Event('transitionend'));
        });

        return <div data-test="CSSTransition-children">{children}</div>;
    },
}));

describe('AccordionItem', () => {
    it('should renders with header and content', () => {
        render(
            <AccordionItem headerContent={() => 'Foobar'} itemId="foobar">
                Hello world
            </AccordionItem>,
        );

        expect(screen.getByText('Foobar')).toBeInTheDocument();
        expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('overrides default class names', () => {
        render(
            <AccordionItem
                bodyClassName="body"
                className="item"
                classNameSelected="selected"
                headerClassName="header"
                headerClassNameSelected="header-selected"
                headerContent={() => 'Foobar'}
                itemId="foobar"
            >
                Hello world
            </AccordionItem>,
        );

        const headerElement = screen.getByText('Foobar');
        const childrenElement = screen.getByText('Hello world');

        expect(headerElement).toHaveClass('header');
        expect(childrenElement).toHaveClass('body');
    });

    it('should render without children', () => {
        render(<AccordionItem headerContent={() => 'Foobar'} itemId="foobar" />);

        expect(screen.queryByTestId('CSSTransition-children')).not.toBeInTheDocument();
    });
});
