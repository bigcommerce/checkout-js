import {
    type CheckoutService,
    type Extension,
    type ExtensionCommandMap,
    type ExtensionQueryMap,
    type ExtensionRegion,
} from '@bigcommerce/checkout-sdk';
import type React from 'react';

import {
    type ExtensionAction,
    type ExtensionServiceInterface,
} from '@bigcommerce/checkout/contexts';
import { ErrorLevelType, type ErrorLogger } from '@bigcommerce/checkout/error-handling-utils';

import { type CommandHandler, type QueryHandler } from './handler';
import * as commandHandlerFactories from './handler/commandHandlers';
import * as queryHandlerFactories from './handler/queryHandlers';

export class ExtensionService implements ExtensionServiceInterface {
    private handlers: { [extensionId: string]: Array<() => void> } = {};
    private dispatch: React.Dispatch<ExtensionAction> | undefined;

    constructor(
        private checkoutService: CheckoutService,
        private errorLogger: ErrorLogger,
    ) {}

    setDispatch(dispatch: React.Dispatch<ExtensionAction>): void {
        this.dispatch = dispatch;
    }

    async loadExtensions(): Promise<void> {
        await this.checkoutService.loadExtensions();
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
        if (!this.dispatch) {
            throw new Error('ExtensionService dispatch is not set');
        }

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
