import { CheckoutService, Extension, ExtensionRegion } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { ExtensionAction } from './ExtensionProvider';
import * as commandHandlers from './handler';

export class ExtensionService {
    private handlers: { [extensionId: string]: Array<() => void> } = {};

    constructor(
        private checkoutService: CheckoutService,
        private dispatch: React.Dispatch<ExtensionAction>,
    ) {}

    async loadExtensions(): Promise<void> {
        await this.checkoutService.loadExtensions();
    }

    async renderExtension(container: string, region: ExtensionRegion): Promise<void> {
        const extension = this.checkoutService.getState().data.getExtensionByRegion(region);

        if (!extension) {
            return;
        }

        await this.checkoutService.renderExtension(container, region);

        this.registerHandlers(extension);
    }

    removeListeners(region: ExtensionRegion): void {
        const extension = this.checkoutService.getState().data.getExtensionByRegion(region);

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

    isRegionEnabled(region: ExtensionRegion): boolean {
        const extension = this.checkoutService.getState().data.getExtensionByRegion(region);

        return Boolean(extension);
    }

    private registerHandlers(extension: Extension): void {
        const handlerProps = {
            checkoutService: this.checkoutService,
            dispatch: this.dispatch,
            extension,
        };

        if (!this.handlers[extension.id]) {
            this.handlers[extension.id] = [];
        }

        Object.values(commandHandlers).forEach((handler) => {
            if (typeof handler === 'function') {
                this.handlers[extension.id].push(handler(handlerProps));
            }
        });
    }
}
