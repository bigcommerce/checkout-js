const fs = require('fs');
const ts = require('typescript');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const path = require('path');

async function autoExport({ inputPath, outputPath, memberPattern }) {
    const filePaths = await glob(inputPath);
    const exportDeclarations = await Promise.all(
        filePaths.map(filePath => createExportDeclaration(filePath, outputPath, memberPattern))
    );
    const content = ts.createPrinter()
        .printList(
            ts.ListFormat.MultiLine, 
            exportDeclarations.filter(Boolean), 
            outputPath
        );

    await writeFile(outputPath, content);
}

async function createExportDeclaration(filePath, outputPath, memberPattern) {
    const readFile = promisify(fs.readFile);
    const source = await readFile(filePath, { encoding: 'utf8' });
    const root = ts.createSourceFile(
        path.parse(filePath).name,
        source,
        ts.ScriptTarget.Latest
    );

    const memberNames = root.statements
        .filter(statement =>
            statement.kind === ts.SyntaxKind.ExportDeclaration &&
            statement.exportClause.kind === ts.SyntaxKind.NamedExports
        )
        .flatMap(statement =>
            statement.exportClause.elements.filter(element => element.kind === ts.SyntaxKind.ExportSpecifier)
        )
        .filter(element => element.name.escapedText.match(new RegExp(memberPattern)))
        .map(element => element.name.escapedText);

    if (memberNames.length === 0) {
        return;
    }

    return ts.createExportDeclaration(
        undefined,
        undefined,
        ts.createNamedExports(
            memberNames.map(memberName =>
                ts.createExportSpecifier(
                    undefined,
                    ts.createIdentifier(memberName)
                )
            )),
        createStringLiteral(getImportPath(filePath, outputPath)),
        false
    );
}

function createStringLiteral(value) {
    const stringLiteral = ts.createStringLiteral(value);

    // Newer version of TS allows you to specify the use of single quote directly
    // e.g.: ts.createStringLiteral(value, true)
    stringLiteral.singleQuote = true;

    return stringLiteral;
}

function getImportPath(filePath, outputPath) {
    const fileName = path.parse(filePath).name;
    const outputFolder = path.parse(outputPath).dir;
    const importFolder = path.parse(path.relative(outputFolder, filePath)).dir;

    return fileName === 'index' ?
        importFolder :
        path.join(importFolder, fileName);
}

async function writeFile(outputPath, content) {
    const mkdir = promisify(fs.mkdir);
    const writeFile = promisify(fs.writeFile);

    try {
        await mkdir(path.parse(outputPath).dir, { recursive: true });
    } catch (error) {
        if (error && error.code !== 'EEXIST') {
            throw error;
        }
    }

    await writeFile(outputPath, content, { encoding: 'utf-8' });
}

module.exports = autoExport;
