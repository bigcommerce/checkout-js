import fs from 'fs';
import glob from 'glob';
import path from 'path';
import ts from 'typescript';
import { promisify } from 'util';

export interface AutoExportOptions {
    inputPath: string;
    outputPath: string;
    memberPattern: string;
    tsConfigPath: string;
}

export default async function autoExport({
    inputPath,
    outputPath,
    memberPattern,
    tsConfigPath
}: AutoExportOptions): Promise<string> {
    const filePaths = await promisify(glob)(inputPath);
    const exportDeclarations = await Promise.all(
        filePaths.map(filePath => createExportDeclaration(filePath, tsConfigPath, memberPattern))
    );

    return ts.createPrinter()
        .printList(
            ts.ListFormat.MultiLine,
            ts.createNodeArray(exportDeclarations.filter(exists)),
            ts.createSourceFile(outputPath, '', ts.ScriptTarget.ESNext)
        );
}

async function createExportDeclaration(
    filePath: string,
    tsConfigPath: string,
    memberPattern: string
): Promise<ts.ExportDeclaration | undefined> {
    const root = await getSource(filePath);

    const memberNames = root.statements
        .filter(ts.isExportDeclaration)
        .flatMap(statement => {
            if (!statement.exportClause ||
                !ts.isNamedExports(statement.exportClause) ||
                !statement.exportClause.elements) {
                return [];
            }

            return statement.exportClause.elements.filter(ts.isExportSpecifier);
        })
        .map(element => element.name.escapedText.toString())
        .filter(memberName => memberName?.match(new RegExp(memberPattern)));

    if (memberNames.length === 0) {
        return;
    }

    return ts.factory.createExportDeclaration(
        undefined,
        undefined,
        false,
        ts.factory.createNamedExports(
            memberNames.map(memberName =>
                ts.factory.createExportSpecifier(
                    undefined,
                    ts.factory.createIdentifier(memberName)
                )
            )),
        ts.factory.createStringLiteral(getImportPath(filePath, tsConfigPath), true)
    );
}

async function getSource(filePath: string): Promise<ts.SourceFile> {
    const readFile = promisify(fs.readFile);
    const source = await readFile(filePath, { encoding: 'utf8' });

    return ts.createSourceFile(
        path.parse(filePath).name,
        source,
        ts.ScriptTarget.Latest
    );
}

function getImportPath(packagePath: string, tsConfigPath: string): string {
    const tsConfig = ts.readConfigFile(tsConfigPath, ts.sys.readFile);

    for (const [packageName, paths] of Object.entries(tsConfig.config?.compilerOptions.paths)) {
        if ((paths as string[]).includes(packagePath)) {
            return packageName;
        }
    }

    throw new Error('Unable to resolve to a valid package.');
}

function exists<TValue>(value?: TValue): value is NonNullable<TValue> {
    return value !== null && value !== undefined;
}
