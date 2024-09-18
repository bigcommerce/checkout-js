import getDefaultTranslations from './getDefaultTranslations';

describe('getDefaultTranslations', () => {
    it('returns Danish translations when da locale is specified', async () => {
        expect(await getDefaultTranslations('da')).toEqual(require('./translations/da.json'));
    });

    it('returns French translations when fr locale is specified', async () => {
        expect(await getDefaultTranslations('fr')).toEqual(require('./translations/fr.json'));
    });

    it('returns Polish translations when pl locale is specified', async () => {
        expect(await getDefaultTranslations('pl')).toEqual(require('./translations/pl.json'));
    });

    it('returns Canadian French translations when fr-CA locale is specified', async () => {
        expect(await getDefaultTranslations('fr-CA')).toEqual(require('./translations/fr.json'));
    });

    it('returns Portuguese translations when pt locale is specified', async () => {
        expect(await getDefaultTranslations('pt')).toEqual(require('./translations/pt.json'));
    });

    it('returns Brazilian Portuguese translations when pt-BR locale is specified', async () => {
        expect(await getDefaultTranslations('pt-BR')).toEqual(require('./translations/pt-BR.json'));
    });

    it('returns Spanish translations when es locale is specified', async () => {
        expect(await getDefaultTranslations('es')).toEqual(require('./translations/es.json'));
    });

    it('returns Castilian Spanish translations when es-mx locale is specified', async () => {
        expect(await getDefaultTranslations('es-MX')).toEqual(require('./translations/es-MX.json'));
    });

    it('returns Latin American Spanish translations when es-419 locale is specified', async () => {
        expect(await getDefaultTranslations('es-419')).toEqual(
            require('./translations/es-419.json'),
        );
    });

    it('returns Argentine Spanish translations when es-AR locale is specified', async () => {
        expect(await getDefaultTranslations('es-AR')).toEqual(require('./translations/es-AR.json'));
    });

    it('returns Chilean Spanish translations when es-CL locale is specified', async () => {
        expect(await getDefaultTranslations('es-CL')).toEqual(require('./translations/es-CL.json'));
    });

    it('returns Colombian Spanish translations when es-CO locale is specified', async () => {
        expect(await getDefaultTranslations('es-CO')).toEqual(require('./translations/es-CO.json'));
    });

    it('returns Peruvian Spanish translations when es-PE locale is specified', async () => {
        expect(await getDefaultTranslations('es-PE')).toEqual(require('./translations/es-PE.json'));
    });

    it('returns Norwegian translations when no locale is specified', async () => {
        expect(await getDefaultTranslations('no')).toEqual(require('./translations/no.json'));
    });
});
