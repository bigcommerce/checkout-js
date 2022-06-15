import ejs from 'ejs';

/**
 * @internal
 */
export class ServerSideRender {
    async renderFile(filePath: string, data?: {}): Promise<string> {
        return await ejs.renderFile(filePath, data);
    }
}
