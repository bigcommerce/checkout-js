import classNames from 'classnames';
import React, { FunctionComponent, useEffect, useState } from 'react';

import { WalletButtonsContainerSkeleton } from '@bigcommerce/checkout/ui';

import { CheckoutContextProps, withCheckout } from '../checkout';
import { TranslatedString } from '../locale';

import CheckoutButtonListV1, { filterUnsupportedMethodIds } from './CheckoutButtonList';

interface CheckoutButtonsListOnTopProps {
    checkEmbeddedSupport(methodIds: string[]): void;
    onUnhandledError(error: Error): void;
}

const sortMethodIds = (methodIds:string[]):string[] => {
    const order = ['braintreevisacheckout','googlepaybraintree','applepay', 'braintreepaypalcredit', 'braintreepaypal'];

    return methodIds.sort((a, b) => order.indexOf(b) - order.indexOf(a));
}

const CheckoutButtonContainer: FunctionComponent<CheckoutButtonsListOnTopProps & CheckoutContextProps> = (
    {
        checkEmbeddedSupport,
        checkoutState,
        checkoutService,
        onUnhandledError,
    }) => {
    const {
        data: {
            getConfig,
        },
        statuses: {
            isInitializingCustomer,
        },
    } = checkoutState;
    const config = getConfig();
    const methodIds = config?.checkoutSettings.remoteCheckoutProviders ?? [];

    // if (!config || methodIds.length === 0) {
    //     return null;
    // }

    const supportedMethodIds = sortMethodIds(filterUnsupportedMethodIds(methodIds));

    // try {
    //     checkEmbeddedSupport(supportedMethodIds);
    // } catch (error) {
    //     return null;
    // }


    // testing tool - START
    const initialButtonIds = supportedMethodIds;
    const [displayTestingToolbox, setDisplayTestingToolbox] = useState(false);
    const [buttonIds, setButtonIds] = useState(initialButtonIds);
    const [buttonNum, setButtonNum] = useState(buttonIds.length);
    const editButtonIds = (n:number):void => {
        console.clear();

        const newLength = buttonNum + n < 0 ? 0 : buttonNum + n;
        const container = document.getElementById("test-wb-container");

        const elements = document.getElementsByClassName('demoClass');

        while(elements.length > 0){
            elements[0].parentNode?.removeChild(elements[0]);
        }

        const child = document.createElement('div');

        child.id = 'applepayCheckoutButton';
        child.className = 'demoClass';
        child.innerHTML = `<button type="button"></button>`;

        if(newLength === 0) {
            setButtonIds([]);

            setTimeout(()=>{
                editButtonIds(1);
                setDisplayTestingToolbox(false);
            },5000)
        } else if (newLength === 4) {
            container?.classList.add('checkout-buttons--4');
            container?.classList.remove('checkout-buttons--5');
            setButtonIds(initialButtonIds.slice(0,newLength));
            setButtonNum(4);
        } else if (newLength === 5) {
            container?.classList.add('checkout-buttons--5');
            container?.classList.add('checkout-buttons--5');
            container?.classList.remove('checkout-buttons--n');
            container?.classList.remove('checkout-buttons--4');
            setButtonNum(5);

            document.getElementsByClassName('checkoutRemote')[0]?.appendChild(child);
        } else if (newLength > 5) {
            container?.classList.add('checkout-buttons--n');
            container?.classList.remove('checkout-buttons--5');
            setButtonNum(newLength);
            document.getElementsByClassName('checkoutRemote')[0]?.appendChild(child);
            document.getElementsByClassName('checkoutRemote')[0]?.appendChild(child);
            document.getElementsByClassName('checkoutRemote')[0]?.appendChild(child);
            document.getElementsByClassName('checkoutRemote')[0]?.appendChild(child);

            let demoButtonNum = 0;

            while(demoButtonNum + buttonIds.length + 1 < newLength){
                document.getElementsByClassName('checkoutRemote')[0]?.appendChild(child.cloneNode(true));
                demoButtonNum ++;
            }
        } else {
            setButtonIds(initialButtonIds.slice(0,newLength));
            setButtonNum(newLength);
        }

    }
    // testing tool - END

    const [isLoading, setIsLoading] = useState(true);
    const buttonsCount = buttonIds.length;

    useEffect(() => {
        const changeState = setTimeout(()=>{
            if(!isInitializingCustomer()) {
                setIsLoading(false);
            }
        },100);

        return () => {
            clearTimeout(changeState);
            setIsLoading(true);
        }
    }, [isInitializingCustomer]);

    if (buttonIds.length < 1) {
        return <></>;
    }

    return (
        <div className='checkout-buttons-container'>
            {/* Testing Tool - START */}
            {displayTestingToolbox &&
                <div className='testingToolbox'>
                    <h2 className="stepHeader-title optimizedCheckout-headingPrimary">Testing Tool{isLoading ? ' (loading...)' : ''}</h2>
                    Method Ids: {buttonIds.toString()}<br />
                    Change Button number: <span onClick={() => editButtonIds(-1)}>🔽🔽🔽️</span> {buttonNum} <span onClick={() => editButtonIds(1)}>🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼</span> - <span onClick={() => editButtonIds(50)}>💣</span><br/>
                </div>
            }
            {/* Testing Tool - END */}
            <p onClick={()=>{setDisplayTestingToolbox(!displayTestingToolbox)}}>
                <TranslatedString id="remote.start_with_text" />
            </p>
            <div
                className={classNames({
                'checkout-buttons--1': buttonsCount === 1,
                'checkout-buttons--2': buttonsCount === 2,
                'checkout-buttons--3': buttonsCount === 3,
                'checkout-buttons--4': buttonsCount === 4,
                'checkout-buttons--5': buttonsCount === 5,
                'checkout-buttons--n': buttonsCount > 5,
            })}
                 id='test-wb-container'>
                <WalletButtonsContainerSkeleton buttonsCount={buttonsCount} isLoading={isLoading}>
                    <CheckoutButtonListV1
                        checkEmbeddedSupport={checkEmbeddedSupport}
                        deinitialize={checkoutService.deinitializeCustomer}
                        hideText={true}
                        initialize={checkoutService.initializeCustomer}
                        isInitializing={isLoading}
                        // methodIds={config.checkoutSettings.remoteCheckoutProviders}
                        methodIds = {buttonIds}
                        onError={onUnhandledError}
                    />
                </WalletButtonsContainerSkeleton>
            </div>
            <div className='checkout-separator'><span><TranslatedString id='remote.or_text' /></span></div>
        </div>
    );
};

export default withCheckout((props) => props)(CheckoutButtonContainer);
