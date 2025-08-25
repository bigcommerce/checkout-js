import {
    type CheckoutService,
    type Extension,
    type ExtensionCommandMap,
    type ExtensionQueryMap,
    type ExtensionRegion,
} from '@bigcommerce/checkout-sdk';
import type React from 'react';

import { ErrorLevelType, type ErrorLogger } from '@bigcommerce/checkout/error-handling-utils';

import { type ExtensionAction } from './ExtensionProvider';
import { type CommandHandler, type QueryHandler } from './handler';
import * as commandHandlerFactories from './handler/commandHandlers';
import * as queryHandlerFactories from './handler/queryHandlers';

export class ExtensionService {
    private handlers: { [extensionId: string]: Array<() => void> } = {};

    constructor(
        private checkoutService: CheckoutService,
        private dispatch: React.Dispatch<ExtensionAction>,
        private errorLogger: ErrorLogger,
    ) {}

    async loadExtensions(): Promise<void> {
        await this.checkoutService.loadExtensions();
    }

    preloadExtensions(): void {
        const state = this.checkoutService.getState();
        const extensions = state.data.getExtensions();
        const cartId = state.data.getCart()?.id;
        const parentOrigin = state.data.getConfig()?.links.siteLink;

        if (!cartId || !parentOrigin) {
            return;
        }

        extensions?.forEach((extension) => {
            const url = new URL(extension.url);

            url.searchParams.set('extensionId', extension.id);
            url.searchParams.set('cartId', cartId);
            url.searchParams.set('parentOrigin', parentOrigin);

            const link = document.createElement('link');

            link.rel = 'preload';
            link.as = 'document';
            link.href = url.toString();

            const head = document.head;

            head.appendChild(link);
        });
    }

    async renderExtension(container: string, region: ExtensionRegion): Promise<void> {
        const extension = this.checkoutService.getState().data.getExtensionByRegion(region);

        if (!extension) {
            return;
        }

        try {
            await this.checkoutService.renderExtension(container, region);

            this.registerHandlers(extension);
        } catch (error: unknown) {
            if (error instanceof Error) {
                this.errorLogger.log(
                    error,
                    { errorCode: 'checkoutExtension' },
                    ErrorLevelType.Error,
                    { extensionId: extension.id, region },
                );
            }
        }
    }

    removeListeners(region: ExtensionRegion): void {
        this.checkoutService.clearExtensionCache(region);

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

        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
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

        Object.values(commandHandlerFactories).forEach((createCommandHandlerFactory) => {
            const handlerFactory = createCommandHandlerFactory(handlerProps);

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

        Object.values(queryHandlerFactories).forEach((createQueryHandlerFactory) => {
            const handlerFactory = createQueryHandlerFactory(handlerProps);

            if (this.isQueryHandler(handlerFactory.queryType, handlerFactory)) {
                this.handlers[extension.id].push(
                    this.checkoutService.handleExtensionQuery(
                        extension.id,
                        handlerFactory.queryType,
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

    private isQueryHandler<T extends keyof ExtensionQueryMap>(
        type: T,
        handler: QueryHandler<any>,
    ): handler is QueryHandler<T> {
        return handler.queryType === type;
    }
}
