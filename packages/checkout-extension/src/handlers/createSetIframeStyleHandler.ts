import { ExtensionCommandType } from '@bigcommerce/checkout-sdk';

import { CommandHandler, HandlerProps } from './CommandHandler';

export function createSetIframeStyleHandler({
    extension,
}: HandlerProps): CommandHandler<ExtensionCommandType.SetIframeStyle> {
    return {
        commandType: ExtensionCommandType.SetIframeStyle,
        handler: (data) => {
            const { style } = data.payload;
            const extensionContainer = document.querySelector(
                `div[data-extension-id="${extension.id}"]`,
            );
            const iframe = extensionContainer?.querySelector('iframe');

            if (iframe) {
                Object.assign(iframe.style, style);
            }
        },
    };
}
