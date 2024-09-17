import isFastlaneHostWindow from './is-fastlane-window';

describe('isFastlaneHostWindow', () => {
    it('returns false if window doesnt have fastlane properties', () => {
        const windowMock = Object.defineProperty(window, '', {
            value: {
                notFastlane: {},
            },
        });

        expect(isFastlaneHostWindow(windowMock)).toEqual(false);
    });

    it('returns true if window have paypalFastlane property', () => {
        const windowMock = Object.defineProperty(window, 'paypalFastlane', {
            value: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                FastlaneWatermarkComponent: jest.fn(),
            },
        });

        expect(isFastlaneHostWindow(windowMock)).toEqual(true);
    });

    it('returns true if window have braintreeFastlane property', () => {
        const windowMock = Object.defineProperty(window, 'braintreeFastlane', {
            value: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                FastlaneWatermarkComponent: jest.fn(),
            },
        });

        expect(isFastlaneHostWindow(windowMock)).toEqual(true);
    });
});
