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
        };

        expect(await autoExport(options)).toMatchSnapshot();
    });
});
