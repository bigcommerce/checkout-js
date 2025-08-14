import autoExport from './auto-export';

describe('autoExport()', () => {
    it('export matching members from files to another file', async () => {
        const options = {
            inputPath:
                'packages/workspace-tools/src/generators/auto-export/__fixtures__/**/index.ts',
            outputPath: 'packages/workspace-tools/src/generators/auto-export/__temp__/output.ts',
            memberPattern: '^Strategy',
            tsConfigPath:
                'packages/workspace-tools/src/generators/auto-export/__fixtures__/tsconfig.json',
            useLazyLoading: false,
        };

        expect(await autoExport(options)).toMatchSnapshot();
    });

    it('handles scenario where no matching member is found', async () => {
        const options = {
            inputPath:
                'packages/workspace-tools/src/generators/auto-export/__fixtures__/**/index.ts',
            outputPath: 'packages/workspace-tools/src/generators/auto-export/__temp__/output.ts',
            memberPattern: '^Test',
            tsConfigPath:
                'packages/workspace-tools/src/generators/auto-export/__fixtures__/tsconfig.json',
            useLazyLoading: false,
        };

        expect(await autoExport(options)).toMatchSnapshot();
    });

    it('export matching members from files to another file as lazy components', async () => {
        const options = {
            inputPath:
                'packages/workspace-tools/src/generators/auto-export/__fixtures__/**/index.ts',
            outputPath: 'packages/workspace-tools/src/generators/auto-export/__temp__/output.ts',
            memberPattern: '^Strategy',
            tsConfigPath:
                'packages/workspace-tools/src/generators/auto-export/__fixtures__/tsconfig.json',
            useLazyLoading: true,
        };

        expect(await autoExport(options)).toMatchSnapshot();
    });

    it('handles scenario where no matching member can be found and lazy loaded', async () => {
        const options = {
            inputPath:
                'packages/workspace-tools/src/generators/auto-export/__fixtures__/**/index.ts',
            outputPath: 'packages/workspace-tools/src/generators/auto-export/__temp__/output.ts',
            memberPattern: '^Test',
            tsConfigPath:
                'packages/workspace-tools/src/generators/auto-export/__fixtures__/tsconfig.json',
            useLazyLoading: true,
        };

        expect(await autoExport(options)).toMatchSnapshot();
    });
});
