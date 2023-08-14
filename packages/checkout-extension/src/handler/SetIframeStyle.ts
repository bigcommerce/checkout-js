import { ExtensionCommandType } from '@bigcommerce/checkout-sdk';

import { CommandHandler } from './CommandHandler';

export const SetIframeStyle: CommandHandler = ({ checkoutService, extension }) => {
    return checkoutService.handleExtensionCommand(
        extension.id,
        ExtensionCommandType.SetIframeStyle,
        (data) => {
            const { style } = data.payload;
            const extensionContainer = document.querySelector(
                `div[data-extension-id="${extension.id}"]`,
            );
            const iframe = extensionContainer?.querySelector('iframe');

            if (iframe) {
                Object.assign(iframe.style, style);
            }
        },
    );
};
