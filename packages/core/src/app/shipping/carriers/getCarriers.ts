import getCarriersName from "./getCarriersName";

export async function getCarriers(userBcId: number | undefined) {
    const BUNDLEURL = process.env.BUNDLEURL || '';
    const BUNDLEAUTHTOKEN = process.env.BUNDLEAUTHTOKEN || '';

    if (!userBcId) return [];

    try {
        const companiesIds = await fetch(
            `${BUNDLEURL}/v3/io/companies?customerId=${userBcId}`,
            { headers: { 'Content-Type': 'application/json', authToken: BUNDLEAUTHTOKEN } }
        )
            .then((response) => response.json())
            .then((response) => response.data.map((res: any) => res.companyId));

        const allCarrierNames = await Promise.all(
            companiesIds.map(async (companyId: number) => {
                const companyDetails = await fetch(
                    `${BUNDLEURL}/v3/io/companies/${companyId}`,
                    { headers: { 'Content-Type': 'application/json', authToken: BUNDLEAUTHTOKEN } }
                )
                    .then((response) => response.json())
                    .then((response) => response.data);

                const transportField = companyDetails.extraFields?.find(
                    (field: any) => field.fieldName === 'Transporte:'
                );

                if (!transportField?.fieldValue) return [];

                const carrierIds = transportField.fieldValue
                    .split(',')
                    .map((id: string) => id.trim())
                    .filter(Boolean);

                return carrierIds.length ? await getCarriersName(carrierIds) : [];
            })
        );

        // Deduplicate and flatten
        return Array.from(new Set(allCarrierNames.flat()));
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error getting carriers:', e);
        return [];
    }
}

export const getAllCarriers = async () => {
    return getCarriersName();
}