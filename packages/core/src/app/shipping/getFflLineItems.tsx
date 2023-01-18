// @ts-nocheck
import { Cart, LineItem } from '@bigcommerce/checkout-sdk';

interface StoreProduct {
  node: {
    customFields: {
      edges: CustomField[]
    },
    entityId: number
  }
}

interface CustomField {
  node: {
    name: string,
    value: string
  }
}

export default async function getFflLineItems(token: string, cart: Cart): Promise<LineItem[]> {
  const { data } = await loadProductsWithCustomFields(token, cart)

  const fflProducts = data.site.products.edges.filter((product: StoreProduct) =>
    product.node.customFields.edges.some((edge: any) => {
      return edge.node.name.toLowerCase() == 'ffl'
          && edge.node.value.toLowerCase() == 'yes';
    })
  )

  const fflProductIds = fflProducts.map((product: StoreProduct) => product.node.entityId)

  return cart.lineItems.physicalItems.filter((item) => fflProductIds.includes(item.productId))
}

function loadProductsWithCustomFields(token: string, cart: Cart): Promise<any> {

  const ids = cart.lineItems.physicalItems.map((x) => x.productId)

  const graphqlBody: (any) = {
    query: `query Products {
        site {
          products (first: ${ids.length}, entityIds: [${ids}]) {
            edges {
              node {
                entityId
                customFields {
                  edges {
                    node {
                      name
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }`,
  };

  return fetch("/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(graphqlBody),
  }).then((res) => {
    return res.json();
  });
}
