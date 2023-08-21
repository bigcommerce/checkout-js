import {
    CheckoutService,
    Extension,
    ExtensionCommandMap,
    ExtensionRegion,
} from '@bigcommerce/checkout-sdk';
import React from 'react';

import { ExtensionAction } from './ExtensionProvider';
import * as handlerFactories from './handlers';
import { CommandHandler } from './handlers/CommandHandler';

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

        Object.values(handlerFactories).forEach((createHandlerFactory) => {
            const handlerFactory = createHandlerFactory(handlerProps);

            if (this.isCommandHandler(handlerFactory.commandType, handlerFactory)) {
                this.handlers[extension.id].push(
                    this.checkoutService.handleExtensionCommand(
                        extension.id,
                        handlerFactory.commandType,
                        handlerFactory.handler,
                    ),
                );
            }
        });
    }

    private isCommandHandler<T extends keyof ExtensionCommandMap>(
        type: T,
        handler: CommandHandler<any>,
    ): handler is CommandHandler<T> {
        return handler.commandType === type;
    }
}
