import {
    CheckoutService,
    Extension,
    ExtensionCommandType,
    ExtensionRegion,
} from '@bigcommerce/checkout-sdk';

export class ExtensionService {
    private _handlerRemovers: { [extensionId: string]: Array<() => void> } = {};

    constructor(
        private _checkoutService: CheckoutService,
        private _setIsShowLoadingIndicator: (show: boolean) => void,
    ) {}

    async loadExtensions(): Promise<void> {
        await this._checkoutService.loadExtensions();
    }

    async renderExtension(container: string, region: ExtensionRegion): Promise<void> {
        const extension = this._getExtensionByRegion(region);

        if (!extension) {
            return;
        }

        await this._checkoutService.renderExtension(container, region);

        if (!this._handlerRemovers[extension.id]) {
            this._handlerRemovers[extension.id] = [];
        }

        this._handlerRemovers[extension.id].push(
            this._checkoutService.handleExtensionCommand(
                extension.id,
                ExtensionCommandType.ReloadCheckout,
                () => {
                    void this._checkoutService.loadCheckout(
                        this._checkoutService.getState().data.getCheckout()?.id,
                    );
                },
            ),
        );

        this._handlerRemovers[extension.id].push(
            this._checkoutService.handleExtensionCommand(
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

        this._handlerRemovers[extension.id].push(
            this._checkoutService.handleExtensionCommand(
                extension.id,
                ExtensionCommandType.ShowLoadingIndicator,
                (data) => {
                    if (data.type === ExtensionCommandType.ShowLoadingIndicator) {
                        const { show } = data.payload;

                        this._setIsShowLoadingIndicator(show);
                    }
                },
            ),
        );
    }

    removeListeners(region: ExtensionRegion): void {
        const extension = this._getExtensionByRegion(region);

        if (!extension) {
            return;
        }

        const removers = this._handlerRemovers[extension.id];

        if (!removers) {
            return;
        }

        for (const remover of removers) {
            remover();
        }

        delete this._handlerRemovers[extension.id];
    }

    isRegionInUse(region: ExtensionRegion): boolean {
        const extension = this._getExtensionByRegion(region);

        return Boolean(extension);
    }

    private _getExtensionByRegion(region: ExtensionRegion): Extension | undefined {
        const extensions = this._checkoutService.getState().data.getExtensions();

        return extensions?.find((e) => e.region === region);
    }
}
