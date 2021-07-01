import getDefaultTranslations from './getDefaultTranslations';

describe('getDefaultTranslations', () => {
    it('returns French translations when fr locale is specified', async () => {
        expect(await getDefaultTranslations('fr'))
            // eslint-disable-next-line import/no-internal-modules
            .toEqual(require('./translations/fr.json'));
    });

    it('returns French translations when fr-CA locale is specified', async () => {
        expect(await getDefaultTranslations('fr-CA'))
            // eslint-disable-next-line import/no-internal-modules
            .toEqual(require('./translations/fr.json'));
    });

    it('returns Portuguese translations when pt locale is specified', async () => {
        expect(await getDefaultTranslations('pt'))
            // eslint-disable-next-line import/no-internal-modules
            .toEqual(require('./translations/pt.json'));
    });

    it('returns Brazilian Portuguese translations when pt-BR locale is specified', async () => {
        expect(await getDefaultTranslations('pt-BR'))
            // eslint-disable-next-line import/no-internal-modules
            .toEqual(require('./translations/pt-BR.json'));
    });
});
