import ejs from 'ejs';

export class ServerSideRender {
    /**
     * @internal
     */
    async renderFile(filePath: string, data?: {}): Promise<string> {
        return await ejs.renderFile(filePath, data);
    }
}
