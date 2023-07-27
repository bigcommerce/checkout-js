import {
    CheckoutService,
    Extension,
    ExtensionCommandType,
    ExtensionRegion,
} from '@bigcommerce/checkout-sdk';
import React from 'react';

import { ExtensionAction, ExtensionActionType } from './ExtensionProvider';

export class ExtensionService {
    private handlers: { [extensionId: string]: Array<() => void> } = {};

    constructor(
        private checkoutService: CheckoutService,
        private dispatch: React.Dispatch<ExtensionAction>,
    ) {}

    createAction(action: ExtensionAction): void {
        this.dispatch(action);
    }

    async loadExtensions(): Promise<void> {
        await this.checkoutService.loadExtensions();
    }

    async renderExtension(container: string, region: ExtensionRegion): Promise<void> {
        const extension = this.getExtensionByRegion(region);

        if (!extension) {
            return;
        }

        await this.checkoutService.renderExtension(container, region);

        if (!this.handlers[extension.id]) {
            this.handlers[extension.id] = [];
        }

        this.handlers[extension.id].push(
            this.checkoutService.handleExtensionCommand(
                extension.id,
                ExtensionCommandType.ReloadCheckout,
                () => {
                    void this.checkoutService.loadCheckout(
                        this.checkoutService.getState().data.getCheckout()?.id,
                    );
                },
            ),
        );

        this.handlers[extension.id].push(
            this.checkoutService.handleExtensionCommand(
                extension.id,
                ExtensionCommandType.SetIframeStyle,
                (data) => {
                    if (data.type === ExtensionCommandType.SetIframeStyle) {
                        const { style } = data.payload;
                        const extensionContainer = document.querySelector(
                            `div[data-extension-id="${extension.id}"]`,
                        );
                        const iframe = extensionContainer?.querySelector('iframe');

                        if (iframe) {
                            Object.assign(iframe.style, style);
                        }
                    }
                },
            ),
        );

        this.handlers[extension.id].push(
            this.checkoutService.handleExtensionCommand(
                extension.id,
                ExtensionCommandType.ShowLoadingIndicator,
                (data) => {
                    if (data.type === ExtensionCommandType.ShowLoadingIndicator) {
                        const { show } = data.payload;

                        this.createAction({
                            type: ExtensionActionType.SET_IS_LOADING_INDICATOR,
                            payload: show,
                        });
                    }
                },
            ),
        );
    }

    removeListeners(region: ExtensionRegion): void {
        const extension = this.getExtensionByRegion(region);

        if (!extension) {
            return;
        }

        const removers = this.handlers[extension.id];

        if (!removers) {
            return;
        }

        for (const remover of removers) {
            remover();
        }

        delete this.handlers[extension.id];
    }

    isRegionInUse(region: ExtensionRegion): boolean {
        const extension = this.getExtensionByRegion(region);

        return Boolean(extension);
    }

    private getExtensionByRegion(region: ExtensionRegion): Extension | undefined {
        const extensions = this.checkoutService.getState().data.getExtensions();

        return extensions?.find((e) => e.region === region);
    }
}
