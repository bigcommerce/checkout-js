export interface CarriersApi {
  id: number;
  bigcommerce_id: number;
  deliver_id: number;
  default?: boolean;
  name: string;
  create_at: Date;
}

export default async function getCarriersName(carrierIds?: string[]) {
  try {
    const SELANUSAAPIURL = process.env.SELANUSAAPIURL || '';

    const url =
      carrierIds && carrierIds.length > 0
        ? `${SELANUSAAPIURL}/carriers?ids=${JSON.stringify(
            carrierIds.map((id) => parseInt(id, 10))
          )}`
        : `${SELANUSAAPIURL}/carriers`;

    const data = await fetch(url).then((response) => response.json());

    return data.map((carrier: CarriersApi) => carrier.name);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error fetching carriers:', e);
    return [];
  }
}
