
import { validateTaxesWithAvalara } from './services/LambdaService';

const store_hash='5ytm98vliq'
export const calculateTaxes = async (cart: any, shippingAddress: any, lineItems: any, customerId: any, shippingCost:any) => {
    const date = new Date().toISOString().split('T')[0];
    const allItems = [
        ...lineItems.physicalItems,
        ...lineItems.digitalItems,
        ...lineItems.customItems,
        ...lineItems.giftCertificates,
    ];
    const itemsWithShipping = allItems.map((item: any, index: number) => ({
        number: `${index + 1}`,
        quantity: item.quantity || 1, 
        amount: item.listPrice || item.amount || 0, 
        taxCode: 'P0000000', 
        itemCode: item.sku || item.itemCode || `item-${index + 1}`, 
        description: item.name || 'Product', 
    }));
    if (shippingCost > 0) {
        itemsWithShipping.push({
            number: `${itemsWithShipping.length + 1}`, 
            quantity: 1,
            amount: shippingCost, 
            taxCode: 'FR00000', 
            itemCode: 'shipping', 
            description: 'Shipping Cost', 
        });
    }

    const taxRequest = {
        id: cart.id, 
        code: cart.id, 
        createTransactionModel: {
            lines: itemsWithShipping.map((item: any, index: number) => ({
                number: `${index + 1}`, 
                quantity: item.quantity,
                amount: item.amount, 
                taxCode: item.taxCode, 
                itemCode: item.itemCode, 
                description: item.description, 
            })),
            type: 'SalesInvoice', 
            date: date, 
            customerCode: `${store_hash}_${customerId}`, 
            purchaseOrderNo: `${date}-${cart.id}`, 
            addresses: {
                singleLocation: {
                    line1: shippingAddress.address1, 
                    line2: shippingAddress.address2,
                    city: shippingAddress.city,
                    region: shippingAddress.region, 
                    country: shippingAddress.country,
                    postalCode: shippingAddress.postalCode,
                },
            },
            commit: false,
            currencyCode: 'USD',
            description: 'Order transaction',
        },
    };

    try {
        const response = await validateTaxesWithAvalara(taxRequest);
        const { totalTax, lines } = response;

        const certificateIds = new Set<number>();

        lines.forEach((line: any) => {
            if (line.certificateId) {
                certificateIds.add(line.certificateId);
            }
        });

        const uniqueCertificateIds = Array.from(certificateIds);
        return {
            taxes: [{
                name: 'Tax',
                amount: totalTax,
            }],
            certificateIds: uniqueCertificateIds
        };
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }

};