import fs from 'fs';
// eslint-disable-next-line import/no-extraneous-dependencies
import glob from 'glob';
import path from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import ts from 'typescript';
import { promisify } from 'util';

export interface AutoExportOptions {
    inputPath: string;
    ignorePackages?: string[];
    outputPath: string;
    memberPattern: string;
    tsConfigPath: string;
    useLazyLoading?: boolean;
    createComponentRegistry?: boolean;
}

export default async function autoExport({
    inputPath,
    ignorePackages,
    outputPath,
    memberPattern,
    tsConfigPath,
    useLazyLoading = false,
    createComponentRegistry = false,
}: AutoExportOptions): Promise<string> {
    let filePaths = await promisify(glob)(inputPath);

    if (ignorePackages) {
        filePaths = filePaths.filter((filePath) => {
            const packageName = filePath.split('/')[1];

            return !ignorePackages.includes(packageName);
        });
    }

    let componentRegistry = '';

    if (createComponentRegistry) {
        componentRegistry = await createComponentRegistryExport(
            filePaths,
            tsConfigPath,
            memberPattern,
        );
    }

    if (useLazyLoading) {
        const lazyExports = await createLazyLoadingExports(filePaths, tsConfigPath, memberPattern);

        // Append component registry to lazy loading exports if requested
        if (createComponentRegistry) {
            return `${lazyExports}\n\n${componentRegistry}`;
        }

        return lazyExports;
    }

    const exportDeclarations = await Promise.all(
        filePaths.map((filePath) => createExportDeclaration(filePath, tsConfigPath, memberPattern)),
    );

    const exports = ts
        .createPrinter()
        .printList(
            ts.ListFormat.MultiLine,
            ts.factory.createNodeArray(exportDeclarations.filter(exists)),
            ts.createSourceFile(outputPath, '', ts.ScriptTarget.ESNext),
        );

    // Append component registry to exports if requested
    if (createComponentRegistry) {
        return `${exports}\n\n${componentRegistry}`;
    }

    return exports;
}

async function createExportDeclaration(
    filePath: string,
    tsConfigPath: string,
    memberPattern: string,
): Promise<ts.ExportDeclaration | undefined> {
    const root = await getSource(filePath);

    const memberNames = root.statements
        .filter(ts.isExportDeclaration)
        .flatMap((statement) => {
            if (
                !statement.exportClause ||
                !ts.isNamedExports(statement.exportClause) ||
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                !statement.exportClause.elements
            ) {
                return [];
            }

            return statement.exportClause.elements.filter(ts.isExportSpecifier);
        })

        .map((element) =>
            'escapedText' in element.name
                ? element.name.escapedText.toString()
                : JSON.stringify(element.name),
        )
        .filter((memberName: string) => new RegExp(memberPattern).exec(memberName));

    if (memberNames.length === 0) {
        return;
    }

    return ts.factory.createExportDeclaration(
        undefined,
        false,
        ts.factory.createNamedExports(
            memberNames.map((memberName) =>
                ts.factory.createExportSpecifier(
                    false,
                    undefined,
                    ts.factory.createIdentifier(memberName),
                ),
            ),
        ),
        ts.factory.createStringLiteral(getImportPath(filePath, tsConfigPath), true),
    );
}

async function getSource(filePath: string): Promise<ts.SourceFile> {
    const readFile = promisify(fs.readFile);
    const source = await readFile(filePath, { encoding: 'utf8' });

    return ts.createSourceFile(path.parse(filePath).name, source, ts.ScriptTarget.Latest);
}

function getImportPath(packagePath: string, tsConfigPath: string): string {
    const tsConfig = ts.readConfigFile(tsConfigPath, ts.sys.readFile);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    for (const [packageName, paths] of Object.entries(tsConfig.config?.compilerOptions.paths)) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        if ((paths as string[]).includes(packagePath)) {
            return packageName;
        }
    }

    throw new Error('Unable to resolve to a valid package.');
}

function exists<TValue>(value?: TValue): value is NonNullable<TValue> {
    return value !== null && value !== undefined;
}

async function createLazyLoadingExports(
    filePaths: string[],
    tsConfigPath: string,
    memberPattern: string,
): Promise<string> {
    const memberMappings: Array<{ memberName: string; importPath: string }> = [];

    for (const filePath of filePaths) {
        const root = await getSource(filePath);
        const memberNames = root.statements
            .filter(ts.isExportDeclaration)
            .flatMap((statement) => {
                if (
                    !statement.exportClause ||
                    !ts.isNamedExports(statement.exportClause) ||
                    !statement.exportClause.elements
                ) {
                    return [];
                }

                return statement.exportClause.elements.filter(ts.isExportSpecifier);
            })
            .map((element) =>
                'escapedText' in element.name
                    ? element.name.escapedText.toString()
                    : JSON.stringify(element.name),
            )
            .filter((memberName: string) => new RegExp(memberPattern).exec(memberName));

        if (memberNames.length > 0) {
            const importPath = getImportPath(filePath, tsConfigPath);

            memberNames.forEach((memberName) => {
                memberMappings.push({ memberName, importPath });
            });
        }
    }

    return generateLazyLoadingCode(memberMappings);
}

function generateLazyLoadingCode(
    memberMappings: Array<{ memberName: string; importPath: string }>,
): string {
    const importStatements = memberMappings
        .map(
            ({ memberName, importPath }) =>
                `const ${memberName} = lazy(() => import(/* webpackChunkName: "${toKebabCase(memberName)}" */'${importPath}').then(module => ({ default: module.${memberName} })));`,
        )
        .join('\n');

    const exportStatements = memberMappings.map(({ memberName }) => `  ${memberName},`).join('\n');

    return `import { lazy } from 'react';

${importStatements}

export {
${exportStatements}
};`;
}

function toKebabCase(str: string): string {
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}

async function createComponentRegistryExport(
    filePaths: string[],
    _tsConfigPath: string,
    memberPattern: string,
): Promise<string> {
    const componentRegistry: Record<string, unknown[]> = {};

    // Get all the packages that have index files
    const packageDirs = filePaths.map((filePath) => {
        const pathParts = filePath.split('/');
        const packageIndex = pathParts.findIndex((part) => part === 'packages');

        return pathParts.slice(0, packageIndex + 2).join('/');
    });

    // Scan all TypeScript/TSX files in each package directory for toResolvableComponent calls
    const uniquePackageDirs = [...new Set(packageDirs)];

    await Promise.all(
        uniquePackageDirs.map(async (packageDir) => {
            const packageFiles = await promisify(glob)(`${packageDir}/src/**/*.{ts,tsx}`);

            await Promise.all(
                packageFiles.map(async (filePath) => {
                    const root = await getSource(filePath);

                    // Find toResolvableComponent call expressions in the file
                    const toResolvableComponentCalls = findToResolvableComponentCalls(root);

                    for (const call of toResolvableComponentCalls) {
                        const { componentName, resolveIds } = call;

                        // Only include components that match the member pattern
                        if (componentName && new RegExp(memberPattern).test(componentName)) {
                            componentRegistry[componentName] = resolveIds;
                        }
                    }
                }),
            );
        }),
    );

    return generateComponentRegistryTypeScript(componentRegistry);
}

function findToResolvableComponentCalls(
    sourceFile: ts.SourceFile,
): Array<{ componentName: string; resolveIds: unknown[] }> {
    const results: Array<{ componentName: string; resolveIds: unknown[] }> = [];

    function visit(node: ts.Node) {
        // Look for export default toResolvableComponent calls
        if (
            ts.isExportAssignment(node) &&
            ts.isCallExpression(node.expression) &&
            ts.isIdentifier(node.expression.expression) &&
            node.expression.expression.text === 'toResolvableComponent'
        ) {
            const callExpression = node.expression;

            if (callExpression.arguments.length >= 2) {
                // First argument should be the component identifier
                const componentArg = callExpression.arguments[0];
                let componentName = '';

                if (ts.isIdentifier(componentArg)) {
                    componentName = componentArg.text;
                }

                // Second argument should be the resolve IDs array
                const resolveIdsArg = callExpression.arguments[1];
                let resolveIds: unknown[] = [];

                if (ts.isArrayLiteralExpression(resolveIdsArg)) {
                    resolveIds = parseResolveIdsArray(resolveIdsArg);
                }

                if (componentName) {
                    results.push({ componentName, resolveIds });
                }
            }
        }

        ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    return results;
}

function parseResolveIdsArray(arrayLiteral: ts.ArrayLiteralExpression): unknown[] {
    return arrayLiteral.elements.map((element) => {
        if (ts.isObjectLiteralExpression(element)) {
            const obj: Record<string, unknown> = {};

            element.properties.forEach((prop) => {
                if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                    let value: unknown;

                    if (ts.isStringLiteral(prop.initializer)) {
                        value = prop.initializer.text;
                    } else if (ts.isNumericLiteral(prop.initializer)) {
                        value = Number(prop.initializer.text);
                    } else if (prop.initializer.kind === ts.SyntaxKind.TrueKeyword) {
                        value = true;
                    } else if (prop.initializer.kind === ts.SyntaxKind.FalseKeyword) {
                        value = false;
                    } else if (ts.isPropertyAccessExpression(prop.initializer)) {
                        // Handle cases like PaymentMethodId.AdyenV2GooglePay
                        const objectName = ts.isIdentifier(prop.initializer.expression)
                            ? prop.initializer.expression.text
                            : '';
                        const propertyName = prop.initializer.name.text;

                        // If it's a PaymentMethodId enum access, preserve it as a string reference
                        if (objectName === 'PaymentMethodId') {
                            value = `PaymentMethodId.${propertyName}`;
                        } else {
                            // For other property access expressions, we'll preserve the original structure
                            // This handles cases where other enums might be used
                            value = `${objectName}.${propertyName}`;
                        }
                    }

                    if (value !== undefined) {
                        obj[prop.name.text] = value;
                    }
                }
            });

            return obj;
        }

        return {};
    });
}

function generateComponentRegistryTypeScript(componentRegistry: Record<string, unknown[]>): string {
    const entries = Object.entries(componentRegistry)
        .map(([componentName, resolveIds]) => {
            const resolveIdsStr = generateResolveIdsString(resolveIds);

            return `  '${componentName}': ${resolveIdsStr}`;
        })
        .join(',\n');

    // Check if any enum references are used to determine if we need imports
    const enumReferences = new Set<string>();
    
    Object.values(componentRegistry)
        .flat()
        .forEach((resolveId) => {
            if (typeof resolveId === 'object' && resolveId !== null) {
                Object.values(resolveId).forEach((value) => {
                    if (typeof value === 'string' && value.includes('.')) {
                        const [enumName] = value.split('.');

                        enumReferences.add(enumName);
                    }
                });
            }
        });

    // Generate import statements for any enums that are referenced
    const importStatements = Array.from(enumReferences)
        .map((enumName) => {
            if (enumName === 'PaymentMethodId') {
                return `import { ${enumName} } from '@bigcommerce/checkout/payment-integration-api';`;
            }
            // Add other enum imports here as needed

            return `// TODO: Add import for ${enumName}`;
        })
        .join('\n');

    const importSection = importStatements ? `${importStatements}\n\n` : '';

    return `${importSection}export const ComponentRegistry = {
${entries}
} as const;
`;
}

function generateResolveIdsString(resolveIds: unknown[]): string {
    const formattedResolveIds = resolveIds.map((resolveId) => {
        if (typeof resolveId === 'object' && resolveId !== null) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const obj = resolveId as Record<string, unknown>;
            const properties = Object.entries(obj).map(([key, value]) => {
                if (typeof value === 'string' && value.includes('.')) {
                    // Keep enum reference as-is instead of converting to string
                    return `"${key}": ${value}`;
                }

                return `"${key}": ${JSON.stringify(value)}`;
            });

            return `    { ${properties.join(', ')} }`;
        }

        return `    ${JSON.stringify(resolveId)}`;
    });

    return `[\n${formattedResolveIds.join(',\n')}\n  ]`;
}
