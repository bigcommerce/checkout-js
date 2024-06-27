// @ts-nocheck
export default async function updateOrderStaffNotes(orderId, storeHash, selectedFFL) {
    // FFL-290 sample staff notes to be appended to the order
    // <existing staff notes>|FFL#6-04-013-07-5A-03791|Expiration:10/12/2024
    const months = {
        "A": "01",
        "B": "02",
        "C": "03",
        "D": "04",
        "E": "05",
        "F": "06",
        "G": "07",
        "H": "08",
        "I": "09",
        "J": "10",
        "K": "11",
        "L": "12"    
    }
    const expiryMonth = months[selectedFFL.slice(13,14)];
    const expiryYear = `202${selectedFFL.slice(12,13)}`

    await getOrder(storeHash, orderId).then(order => {
        const message = `${order?.staff_notes}|FFL#${selectedFFL}|Expiration:${expiryMonth}/01/${expiryYear}`
        updateOrder(storeHash, orderId, message)
    })
}

function getOrder(storeHash, orderId): Promise<any> {
    const url = `https://${process.env.HOST}/big_commerce/api/orders/${orderId}`

    return fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "store-hash": storeHash
        }
    })
    .then(res => res.json())
    .then(data => {
        return data;
    }).catch(console.log);
}

function updateOrder(storeHash, orderId, message): Promise<any> {
    const url = `https://${process.env.HOST}/big_commerce/api/orders/${orderId}`

    fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "store-hash": storeHash
        },
        body: JSON.stringify({ staff_notes: message })
    })
    .then(res => res.json())
    .then(data => {
        return data;
    }).catch(console.log);
}
